# agent/agent.py
import os
import json
import asyncio
from datetime import datetime, timezone

import boto3
import botocore
import requests

from livekit import api
from livekit.agents import JobContext, WorkerOptions
from livekit.agents.cli.cli import run_app

# (선택) .env 자동 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ---------- ENV ----------
S3_BUCKET = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("S3_REGION")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY")

CALL_RECORD_API = os.getenv("CALL_RECORD_API")  # 예: http://localhost:8000/call/record
AUDIO_PREFIX = os.getenv("AUDIO_PREFIX", "recordings/")
TRANSCRIPT_PREFIX = os.getenv("TRANSCRIPT_PREFIX", "transcripts/")
WAIT_FOR_PARTICIPANT = os.getenv("WAIT_FOR_PARTICIPANT", "true").lower() == "true"

# ---------- boto3 ----------
s3 = boto3.client(
    "s3",
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
)

# ---------- Whisper ----------
# 설치: poetry add openai-whisper@20231117 torch
# ffmpeg 필요: ffmpeg -version
import whisper
_WHISPER_MODEL = None
def get_whisper_model():
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        _WHISPER_MODEL = whisper.load_model("base")
    return _WHISPER_MODEL

# ---------- Utils ----------
async def wait_s3_object_exists(bucket: str, key: str, timeout_sec: int = 300) -> bool:
    deadline = datetime.now(tz=timezone.utc).timestamp() + timeout_sec
    while datetime.now(tz=timezone.utc).timestamp() < deadline:
        try:
            s3.head_object(Bucket=bucket, Key=key)
            return True
        except botocore.exceptions.ClientError as e:
            code = e.response.get("ResponseMetadata", {}).get("HTTPStatusCode")
            if code == 404:
                await asyncio.sleep(2)
                continue
            raise
    return False

# ---------- Entrypoint ----------
async def entrypoint(ctx: JobContext):
    # 필수 ENV 확인
    for k, v in {
        "S3_BUCKET_NAME": S3_BUCKET,
        "S3_REGION": S3_REGION,
        "S3_ACCESS_KEY": S3_ACCESS_KEY,
        "S3_SECRET_KEY": S3_SECRET_KEY,
    }.items():
        if not v:
            raise RuntimeError(f"Missing env var: {k}")

    # 방 연결 먼저
    await ctx.connect()
    if WAIT_FOR_PARTICIPANT:
        await ctx.wait_for_participant()

    room_name = ctx.room.name
    start_time = datetime.now(timezone.utc)

    ts = start_time.strftime("%Y%m%d_%H%M%S")
    audio_basename = f"{room_name}_{ts}.ogg"
    audio_s3_key = f"{AUDIO_PREFIX}{audio_basename}"
    transcript_basename = f"transcript_{room_name}_{ts}.json"
    transcript_s3_key = f"{TRANSCRIPT_PREFIX}{transcript_basename}"

    # 오디오만 Egress → S3
    egress_req = api.RoomCompositeEgressRequest(
        room_name=room_name,
        audio_only=True,
        file_outputs=[
            api.EncodedFileOutput(
                file_type=api.EncodedFileType.OGG,
                filepath=audio_s3_key,
                s3=api.S3Upload(
                    bucket=S3_BUCKET,
                    region=S3_REGION,
                    access_key=S3_ACCESS_KEY,
                    secret=S3_SECRET_KEY,
                ),
            )
        ],
    )
    res = await ctx.api.egress.start_room_composite_egress(egress_req)
    egress_id = res.egress_id
    print(f"[Egress] started id={egress_id}, s3://{S3_BUCKET}/{audio_s3_key}")

    async def on_shutdown(reason: str = ""):
        end_time = datetime.now(timezone.utc)
        duration_sec = int((end_time - start_time).total_seconds())
        print(f"[Shutdown] reason='{reason}' room={room_name} duration={duration_sec}s")

        # 업로드 완료 대기
        print("[S3] waiting for audio object to appear...")
        ok = await wait_s3_object_exists(S3_BUCKET, audio_s3_key, timeout_sec=300)
        audio_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{audio_s3_key}"
        if not ok:
            print(f"[S3] timeout waiting for s3://{S3_BUCKET}/{audio_s3_key}")
            if CALL_RECORD_API:
                try:
                    requests.post(
                        CALL_RECORD_API,
                        json={
                            "room_name": room_name,
                            "started_at": start_time.isoformat(),
                            "ended_at": end_time.isoformat(),
                            "duration": duration_sec,
                            "audio_url": audio_url,
                            "transcript_url": None,
                            "note": "egress file not found in time",
                        },
                        timeout=10,
                    )
                except Exception as e:
                    print("[API] call/record failed:", e)
            return

        local_audio = f"/tmp/{audio_basename}"
        local_transcript = f"/tmp/{transcript_basename}"

        # 다운로드
        try:
            s3.download_file(S3_BUCKET, audio_s3_key, local_audio)
            print(f"[S3] downloaded → {local_audio}")
        except Exception as e:
            print("[S3] download failed:", e)
            return

        # Whisper 전사
        try:
            model = get_whisper_model()
            result = model.transcribe(local_audio)
            with open(local_transcript, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"[Whisper] transcript saved → {local_transcript}")
        except Exception as e:
            print("[Whisper] transcription failed:", e)
            if CALL_RECORD_API:
                try:
                    requests.post(
                        CALL_RECORD_API,
                        json={
                            "room_name": room_name,
                            "started_at": start_time.isoformat(),
                            "ended_at": end_time.isoformat(),
                            "duration": duration_sec,
                            "audio_url": audio_url,
                            "transcript_url": None,
                            "note": "transcription failed",
                        },
                        timeout=10,
                    )
                except Exception as e2:
                    print("[API] call/record failed:", e2)
            return

        # transcript 업로드
        transcript_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{transcript_s3_key}"
        try:
            s3.upload_file(local_transcript, S3_BUCKET, transcript_s3_key)
            print(f"[S3] transcript uploaded → s3://{S3_BUCKET}/{transcript_s3_key}")
        except Exception as e:
            print("[S3] upload transcript failed:", e)

        # 기록 API
        if CALL_RECORD_API:
            try:
                resp = requests.post(
                    CALL_RECORD_API,
                    json={
                        "room_name": room_name,
                        "started_at": start_time.isoformat(),
                        "ended_at": end_time.isoformat(),
                        "duration": duration_sec,
                        "audio_url": audio_url,
                        "transcript_url": transcript_url,
                    },
                    timeout=10,
                )
                print("[API] call/record status:", resp.status_code)
            except Exception as e:
                print("[API] call/record failed:", e)

        # 임시파일 정리
        for p in (local_audio, local_transcript):
            try:
                os.remove(p)
            except FileNotFoundError:
                pass

    ctx.add_shutdown_callback(on_shutdown)
    # 이후는 참가자 퇴장 시 shutdown 콜백 실행
    # 별도 while/await 불필요


if __name__ == "__main__":
    # dev:   poetry run python agent.py dev
    # start: poetry run python agent.py start
    asyncio.run(run_app(WorkerOptions(entrypoint_fnc=entrypoint)))
