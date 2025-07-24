from fastapi import WebSocket, Depends, HTTPException
from jose import jwt, JWTError
from app.core.config import settings
from app.domains.user.models.users import User
from app.db.database import async_session
import uuid
from typing import Dict, TypedDict, List, Set


# ✅ 타입 명시용 TypedDict
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
        result = await session.get(User, user_id)
        if result is None:
            raise HTTPException(status_code=404, detail="User not Found")
        return result


async def handle_connect(websocket: WebSocket, user: User):
    waiting_users[user.id] = websocket

    if len(waiting_users) >= 2:
        ids = list(waiting_users.keys())[:2]
        ws1, ws2 = waiting_users.pop(ids[0]), waiting_users.pop(ids[1])
        user1_id, user2_id = ids[0], ids[1]

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
        print(f"[매칭 제안] {user1_id} <-> {user2_id} in {room_name}")


async def handle_receive_event(user: User, msg: dict):
    event = msg.get("event")
    room = msg.get("room")

    if room not in matching_candidates:
        return

    if event == "accept":
        matching_candidates[room]["accepted"].add(user.id)

        if len(matching_candidates[room]["accepted"]) == 2:
            for sock in matching_candidates[room]["sockets"]:
                await sock.send_json({"event": "matched", "room": room})
            del matching_candidates[room]
            print(f"[매칭 성사] {room}")

    elif event == "reject":
        for idx, sock in enumerate(matching_candidates[room]["sockets"]):
            partner_id = matching_candidates[room]["user_ids"][idx]
            await sock.send_json({"event": "rejected"})  # ✅ 오타 수정
            waiting_users[partner_id] = sock

        del matching_candidates[room]
        print(f"[매칭 거절] {room}")


async def handle_disconnect(user_id: int):
    if user_id in waiting_users:
        del waiting_users[user_id]

    to_remove = []

    for room, data in matching_candidates.items():
        if user_id in data["user_ids"]:
            for sock in data["sockets"]:
                await sock.send_json({"event": "disconnected"})
            to_remove.append(room)

    for r in to_remove:
        del matching_candidates[r]

    print(f"[연결 종료] {user_id}")
