import boto3
from botocore.exceptions import NoCredentialsError
from uuid import uuid4
from fastapi import UploadFile
from app.core.config import settings

s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    region_name=settings.AWS_REGION,
)

BUCKET_NAME = settings.AWS_BUCKET_NAME


async def upload_image_to_s3(file: UploadFile, folder: str = "profile_image") -> str:
    filename = f"{folder}/{uuid4()}.{file.filename.split(".")[-1]}"

    s3.upload_fileobj(
        Fileobj=file.file,
        Bucket=BUCKET_NAME,
        Key=filename,
        ExtraArgs={"ContentType": file.content_type},
    )

    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"

