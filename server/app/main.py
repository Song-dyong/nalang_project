from fastapi import FastAPI
from app.api.api_v1 import router

app = FastAPI()

app.include_router(router, prefix="/api/v1")
