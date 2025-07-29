from fastapi import WebSocket, HTTPException
from jose import jwt, JWTError
from app.core.config import settings
from app.domains.user.models.users import User
from app.db.database import async_session
import uuid
from typing import Dict, TypedDict, List, Set
from app.db.redis import redis_client
import json
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime


class MatchCandidate(TypedDict):
    user_ids: List[int]
    sockets: List[WebSocket]
    accepted: Set[int]


waiting_users: Dict[int, WebSocket] = {}
matching_candidates: Dict[str, MatchCandidate] = {}


async def get_current_user_ws(websocket: WebSocket) -> User:
    token = websocket.query_params.get("token")
    if not token:
        raise HTTPException(status_code=403, detail="Missing Token")

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid Token")

    async with async_session() as session:
        stmt = (
            select(User)
            .options(
                selectinload(User.gender_links),
                selectinload(User.language_links),
            )
            .where(User.id == user_id)
        )
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(status_code=404, detail="User not Found")

        return user


async def handle_connect(websocket: WebSocket, user: User):
    gender_id = user.gender_links[0].gender_id if user.gender_links else None
    language_ids = [link.language_id for link in user.language_links]

    user_data = {
        "id": user.id,
        "gender_id": gender_id,
        "languages": language_ids,
        "birth_date": str(user.birth_date) if user.birth_date else None,
    }

    filters = {
        "gender_id": websocket.query_params.get("filter_gender_id"),
        "language_id": websocket.query_params.get("filter_language_id"),
        "min_age": websocket.query_params.get("filter_min_age"),
        "max_age": websocket.query_params.get("filter_max_age"),
    }

    print("[서버 수신 필터]", filters)

    redis_key = f"call:user:{user.id}"
    await redis_client.set(
        redis_key, json.dumps({"user": user_data, "filters": filters}), ex=600
    )

    matched_user_id = None
    for other_id, other_ws in list(waiting_users.items()):
        if other_id == user.id:
            continue

        other_key = f"call:user:{other_id}"
        other_json = await redis_client.get(other_key)
        if not other_json:
            continue

        parsed = json.loads(other_json)
        other_data = parsed["user"]
        other_filters = parsed["filters"]

        if is_match(other_data, filters) and is_match(user_data, other_filters):
            matched_user_id = other_id
            break

    if matched_user_id:
        ws1, ws2 = websocket, waiting_users.pop(matched_user_id)
        user1_id, user2_id = user.id, matched_user_id

        room_name = f"room_{user1_id}_{user2_id}_{uuid.uuid4().hex[:6]}"

        matching_candidates[room_name] = {
            "user_ids": [user1_id, user2_id],
            "sockets": [ws1, ws2],
            "accepted": set(),
        }

        await ws1.send_json(
            {"event": "match_proposal", "room": room_name, "partner_id": user2_id}
        )
        await ws2.send_json(
            {"event": "match_proposal", "room": room_name, "partner_id": user1_id}
        )

        await redis_client.delete(f"call:user:{user1_id}")
        await redis_client.delete(f"call:user:{user2_id}")

        print(f"[매칭 제안] {user1_id} <-> {user2_id} in {room_name}")

    else:
        waiting_users[user.id] = websocket
        print(f"[대기열 등록] {user.id} - 조건: {filters}")


async def handle_receive_event(user: User, msg: dict):
    event = msg.get("event")
    room = msg.get("room")
    print("서버에서 처리하는 msg dict", msg, event, room)
    if room not in matching_candidates:
        return

    if event == "accept":
        matching_candidates[room]["accepted"].add(user.id)

        if len(matching_candidates[room]["accepted"]) == 2:
            for sock in matching_candidates[room]["sockets"]:
                await sock.send_json({"event": "matched", "room": room})
            del matching_candidates[room]
            print(f"[매칭 성사] {room}")

    elif event == "rejected":
        user_ids = matching_candidates[room]["user_ids"]
        sockets = matching_candidates[room]["sockets"]

        for idx, uid in enumerate(user_ids):
            if uid != user.id:  # 상대방만 메시지 받음
                partner_sock = sockets[idx]
                try:
                    await partner_sock.send_json({"event": "rejected"})
                    print(f"[전송 성공] rejected → user_id={uid}")
                    waiting_users[uid] = partner_sock  # 다시 대기열 등록
                except Exception as e:
                    print(f"[전송 실패] user_id={uid}, error={e}")
        del matching_candidates[room]
        print(f"[매칭 거절] {room}")


async def handle_disconnect(user_id: int):
    # 대기열에 있던 유저 제거
    if user_id in waiting_users:
        del waiting_users[user_id]
        await redis_client.delete(f"call:user:{user_id}")  # ✅ 이거 추가해야 함
        print(f"[대기열에서 제거 + Redis 삭제] user_id={user_id}")

    # 매칭 진행 중이던 유저 처리
    to_remove = []

    for room, data in matching_candidates.items():
        if user_id in data["user_ids"]:
            for sock in data["sockets"]:
                try:
                    await sock.send_json({"event": "disconnected"})
                except Exception as e:
                    print(f"[disconnect 알림 실패] user={user_id}, err={e}")
            await redis_client.delete(
                f"call:user:{user_id}"
            )  # ✅ 혹시 몰라 double check
            to_remove.append(room)

    for r in to_remove:
        del matching_candidates[r]

    print(f"[연결 종료 완료] user_id={user_id}")


def is_match(user_data: dict, filters: dict) -> bool:
    if filters.get("gender_id") and user_data.get("gender_id") != int(
        filters["gender_id"]
    ):
        return False

    if filters.get("language_id"):
        if int(filters["language_id"]) not in user_data.get("languages", []):
            return False

    if user_data.get("birth_date") and (
        filters.get("min_age") or filters.get("max_age")
    ):
        try:
            birth = datetime.strptime(user_data["birth_date"], "%Y-%m-%d")
            today = datetime.today()
            age = (
                today.year
                - birth.year
                - ((today.month, today.day) < (birth.month, birth.day))
            )

            if filters.get("min_age") and age < int(filters["min_age"]):
                return False
            if filters.get("max_age") and age > int(filters["max_age"]):
                return False
        except Exception as e:
            print("birth_date parse error", e)
            return False

    return True
