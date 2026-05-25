import base64
import json
import re
import uuid
from datetime import datetime, timezone

import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.bike import Bike
from app.models.part import Part
from app.schemas.diagnosis import DiagnosedPart, DiagnosisResult

_client: anthropic.AsyncAnthropic | None = None

_SYSTEM_PROMPT = """\
You are an expert motorcycle mechanic specializing in Indian motorcycles \
(Hero, Bajaj, TVS, Royal Enfield, KTM).

Analyze the provided image and diagnose any visible issues with motorcycle parts.

Respond ONLY with valid JSON matching this exact schema:
{
  "overall_confidence": <float 0.0–1.0>,
  "safe_to_ride": <boolean>,
  "raw_analysis": <string — detailed description of what you see>,
  "diagnosed_parts": [
    {
      "part_id": <string UUID matching a known part, or null>,
      "name": <string>,
      "issue": <string — specific problem observed>,
      "severity": <"SAFE" | "CAUTION" | "STOP">,
      "confidence": <float 0.0–1.0>
    }
  ]
}

Severity definitions:
- SAFE: Part looks fine, no action needed
- CAUTION: Minor wear or potential issue, service soon
- STOP: Immediate safety risk — do NOT ride

Rules:
- Only use STOP for clearly visible, dangerous defects
- overall_confidence reflects image clarity and diagnosis certainty
- If image is blurry or part is not visible, set overall_confidence below 0.6\
"""


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


def _parts_context(parts: list[Part]) -> str:
    if not parts:
        return "No parts data available for this bike."
    return "\n".join(
        f"- [{p.id}] {p.name} ({p.category}): {p.function}. Risk: {p.risk_level.value}"
        for p in parts
    )


def _parse_json(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise ValueError(f"Claude returned non-JSON: {raw[:300]}")


async def diagnose(
    bike_id: uuid.UUID,
    image_bytes: bytes,
    db: AsyncSession,
    image_media_type: str = "image/jpeg",
) -> DiagnosisResult:
    """Run AI vision diagnosis on a bike photo and return structured result."""
    bike = (
        await db.execute(select(Bike).where(Bike.id == bike_id, Bike.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if bike is None:
        raise ValueError(f"Bike {bike_id} not found")

    parts = (
        await db.execute(
            select(Part).where(Part.bike_id == bike_id, Part.deleted_at.is_(None))
        )
    ).scalars().all()

    bike_label = f"{bike.make} {bike.model} ({bike.year_start}–{bike.year_end or 'present'})"
    if bike.variant:
        bike_label += f" {bike.variant}"

    image_b64 = base64.standard_b64encode(image_bytes).decode()

    message = await _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": image_media_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            f"Bike: {bike_label}\n\n"
                            f"Known parts for this bike:\n{_parts_context(list(parts))}\n\n"
                            "Diagnose visible issues. Match to known parts by UUID where possible."
                        ),
                    },
                ],
            }
        ],
    )

    parsed = _parse_json(message.content[0].text)

    confidence = float(parsed.get("overall_confidence", 0.0))
    diagnosed = [DiagnosedPart(**p) for p in parsed.get("diagnosed_parts", [])]

    # Safety rule: confidence < 0.6 → safe_to_ride stays null, emit warning
    if confidence >= 0.6:
        safe_to_ride: bool | None = bool(parsed.get("safe_to_ride"))
        low_confidence_warning = None
    else:
        safe_to_ride = None
        low_confidence_warning = (
            "Image quality or angle insufficient for a confident diagnosis. "
            "Consult a mechanic for a proper inspection before riding."
        )

    # SAFETY: any STOP part overrides AI's safe_to_ride=True
    if any(p.severity == "STOP" for p in diagnosed):
        safe_to_ride = False

    # Always emit mechanic_prompt when any STOP part detected (CLAUDE.md safety rule)
    mechanic_prompt = None
    if any(p.severity == "STOP" for p in diagnosed):
        mechanic_prompt = (
            "Critical issue detected. Visit a certified mechanic before riding. "
            "Do NOT ride until the bike has been inspected."
        )

    return DiagnosisResult(
        diagnosis_id=uuid.uuid4(),
        bike_id=bike_id,
        overall_confidence=confidence,
        safe_to_ride=safe_to_ride,
        low_confidence_warning=low_confidence_warning,
        diagnosed_parts=diagnosed,
        mechanic_prompt=mechanic_prompt,
        raw_analysis=parsed.get("raw_analysis", message.content[0].text),
        created_at=datetime.now(timezone.utc),
    )
