import asyncio
import mimetypes
import uuid

import boto3
from botocore.config import Config

from app.config import settings

_ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "heic"}


def _make_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _upload_sync(file_bytes: bytes, key: str, content_type: str) -> None:
    _make_s3_client().put_object(
        Bucket=settings.r2_bucket_name,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )


async def upload_part_photo(file_bytes: bytes, original_filename: str) -> str:
    """Upload part photo to R2 and return its public URL."""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    if ext not in _ALLOWED_EXTENSIONS:
        ext = "jpg"

    key = f"parts/{uuid.uuid4()}.{ext}"
    content_type = mimetypes.guess_type(original_filename)[0] or "image/jpeg"

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload_sync, file_bytes, key, content_type)

    return f"{settings.r2_public_url.rstrip('/')}/{key}"


async def upload_guide_photo(file_bytes: bytes, original_filename: str, step_number: int) -> str:
    """Upload a DIY guide step photo to R2 and return its public URL."""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    if ext not in _ALLOWED_EXTENSIONS:
        ext = "jpg"

    key = f"guides/step-{step_number}/{uuid.uuid4()}.{ext}"
    content_type = mimetypes.guess_type(original_filename)[0] or "image/jpeg"

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload_sync, file_bytes, key, content_type)

    return f"{settings.r2_public_url.rstrip('/')}/{key}"
