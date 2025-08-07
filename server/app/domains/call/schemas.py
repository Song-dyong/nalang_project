from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TokenRequest(BaseModel):
    room: str


class CallHistoryCreate(BaseModel):
    user_id: int
    partner_id: int
    room_name: str
    started_at: datetime
    ended_at: datetime
    duration_sec: int
    recording_url: Optional[str] = None
    transcript_url: Optional[str] = None
    summary_text: Optional[str] = None

    model_config = {"from_attributes": True}


class PartnerInfo(BaseModel):
    id: int
    name: str
    profile_image: Optional[str]


class CallHistoryList(BaseModel):
    id: int
    room_name: str
    started_at: datetime
    ended_at: datetime
    duration_sec: int
    partner: PartnerInfo
