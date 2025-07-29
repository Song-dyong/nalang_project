from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.domains.user.models.users import User
from app.domains.call.services.ws_service import (
    handle_connect,
    handle_receive_event,
    handle_disconnect,
    get_current_user_ws,
)
from app.db.redis import redis_client

router = APIRouter()


@router.websocket("/ws/waiting")
async def websocket_waiting(
    websocket: WebSocket, current_user: User = Depends(get_current_user_ws)
):
    await websocket.accept()

    try:
        await handle_connect(websocket, current_user)

        async for msg in websocket.iter_json():
            await handle_receive_event(current_user, msg)
    except WebSocketDisconnect:
        print("WebSocketDisconnect 익셉션 발생 !!", current_user)
        await handle_disconnect(current_user.id)
    finally:
        print("Finally에서 레디스 유저 삭제")
        await handle_disconnect(current_user.id)


@router.websocket("/ws/call")
async def call_websocket(
    websocket: WebSocket, current_user: User = Depends(get_current_user_ws)
):
    await websocket.accept()

    redis_key = f"call:waiting:{current_user.id}"
    await redis_client.set(redis_key, "waiting", ex=600)

    try:
        while True:
            data = await websocket.receive_text()
            if data == "cancel":
                await redis_client.delete(redis_key)
                await websocket.send_text("Cancel complete")
            else:
                await websocket.send_text(f"수신:{data}")
    except WebSocketDisconnect:
        await redis_client.delete(redis_key)
        print(f"User {current_user.id} disconnected")
