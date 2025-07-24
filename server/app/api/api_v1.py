from fastapi import APIRouter
from app.domains.auth.routes import router as auth_router
from app.domains.user.routes import router as user_router
from app.domains.call.routes import router as call_router
from app.domains.call.routes_ws import router as ws_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(user_router, prefix="/user", tags=["User"])
router.include_router(call_router, prefix="/call", tags=["Call"])
router.include_router(ws_router, tags=["WS"])
