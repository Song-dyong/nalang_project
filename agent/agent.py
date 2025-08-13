# agent/agent.py
import os
import asyncio
from datetime import datetime, timezone
from livekit.api.twirp_client import TwirpError

import boto3
import botocore
import requests

from livekit import api
from livekit.agents import JobContext, WorkerOptions
from livekit.agents.cli.cli import run_app

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

CALL_RECORD_API = os.getenv("CALL_RECORD_API")
AUDIO_PREFIX = os.getenv("AUDIO_PREFIX", "recordings/")
WAIT_FOR_PARTICIPANT = os.getenv("WAIT_FOR_PARTICIPANT", "true").lower() == "true"

# ---------- boto3 ----------
s3 = boto3.client(
    "s3",
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
)


def _now():
    return datetime.now(timezone.utc).isoformat()


# ---------- Retry: start egress ----------
async def start_egress_with_retry(
    ctx: JobContext, req, room_name: str, s3_key: str, retries=3
):
    delay = 1.0
    for i in range(retries):
        try:
            print(
                f"[{_now()}][Egress][try {i+1}/{retries}] start room={room_name} key={s3_key}"
            )
            return await ctx.api.egress.start_room_composite_egress(req)
        except TwirpError as e:
            # 재시도 대상 코드
            retryable = e.code in ("unavailable", "internal", "deadline_exceeded")
            print(
                f"[{_now()}][Egress][error] code={e.code} msg={getattr(e,'message',str(e))} "
                f"retryable={retryable} room={room_name}"
            )
            if retryable and i < retries - 1:
                print(f"[{_now()}][Egress] retrying in {delay:.1f}s ...")
                await asyncio.sleep(delay)
                delay *= 1.5
                continue
            # 마지막 시도 실패 또는 비재시도 코드면 바로 전파
            raise


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

    print(
        f"[{_now()}][Boot] WAIT_FOR_PARTICIPANT={WAIT_FOR_PARTICIPANT} "
        f"S3_BUCKET={S3_BUCKET} S3_REGION={S3_REGION}"
    )

    # 방 연결 먼저
    await ctx.connect()
    if WAIT_FOR_PARTICIPANT:
        print(f"[{_now()}][Room] waiting for participant ...")
        await ctx.wait_for_participant()

    room_name = ctx.room.name
    start_time = datetime.now(timezone.utc)

    ts = start_time.strftime("%Y%m%d_%H%M%S")

    # prefix 슬래시 꼬임 방지
    prefix = (AUDIO_PREFIX or "").strip("/")
    audio_basename = f"{room_name}_{ts}.ogg"
    audio_s3_key = f"{prefix}/{audio_basename}" if prefix else audio_basename

    # 오디오만 Egress → S3 (경량 인코딩 옵션: advanced only)
    egress_req = api.RoomCompositeEgressRequest(
        room_name=room_name,
        audio_only=True,
        advanced=api.EncodingOptions(
            audio_codec=api.AudioCodec.OPUS,
            audio_bitrate=24,
        ),
        file_outputs=[
            api.EncodedFileOutput(
                file_type=api.EncodedFileType.OGG,  # OGG(Opus)
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

    # 사람이 봐도 명확한 요청 로그(advanced만 사용 중임을 표시)
    print(
        f"[{_now()}][EgressReq] room={room_name} audio_only=True "
        f"advanced={{codec:'OPUS', bitrate_kbps:24}} preset=None "
        f"file=s3://{S3_BUCKET}/{audio_s3_key}"
    )

    try:
        res = await start_egress_with_retry(ctx, egress_req, room_name, audio_s3_key)
    except Exception as e:
        print(f"[{_now()}][Egress][fatal] failed to start: {e}")
        return

    egress_id = res.egress_id
    print(f"[{_now()}][Egress] started id={egress_id}, s3://{S3_BUCKET}/{audio_s3_key}")

    async def on_shutdown(reason: str = ""):
        end_time = datetime.now(timezone.utc)
        duration_sec = int((end_time - start_time).total_seconds())
        print(
            f"[{_now()}][Shutdown] reason='{reason}' room={room_name} duration={duration_sec}s"
        )

        # 업로드 완료 대기
        wait_t0 = datetime.now(timezone.utc)
        print(
            f"[{_now()}][S3] waiting for object ... "
            f"s3://{S3_BUCKET}/{audio_s3_key} timeout={300}s"
        )
        ok = await wait_s3_object_exists(S3_BUCKET, audio_s3_key, timeout_sec=300)
        waited = int((datetime.now(timezone.utc) - wait_t0).total_seconds())
        audio_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{audio_s3_key}"
        print(f"[{_now()}][S3] wait_done ok={ok} waited={waited}s url={audio_url}")

        if not ok:
            print(f"[{_now()}][S3] timeout waiting for s3://{S3_BUCKET}/{audio_s3_key}")
            return

        # 기록 API (idempotent PUT)
        if not CALL_RECORD_API:
            print(f"[{_now()}][API] CALL_RECORD_API not set, skipping PUT")
            return

        try:
            payload = {"room_name": room_name, "recording_url": audio_url}
            resp = requests.put(CALL_RECORD_API, json=payload, timeout=10)
            if 200 <= resp.status_code < 300:
                print(f"[{_now()}][API] call/record PUT {resp.status_code}")
            else:
                # 에러 본문까지 출력(422 원인 추적)
                print(
                    f"[{_now()}][API] call/record PUT {resp.status_code} body={resp.text[:500]}"
                )
        except Exception as e:
            print(f"[{_now()}][API] call/record failed: {e}")

    ctx.add_shutdown_callback(on_shutdown)


if __name__ == "__main__":
    # dev:   poetry run python agent.py dev
    # start: poetry run python agent.py start
    asyncio.run(run_app(WorkerOptions(entrypoint_fnc=entrypoint)))
