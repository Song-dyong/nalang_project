from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_me():
    return {"msg": "User Info Endpoint"}
