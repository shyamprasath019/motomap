#!/usr/bin/env python3
"""
Master seed runner for Motomap database.

Usage:
    python seeds/run_seeds.py --dry-run     Validate data and print counts, no DB writes
    python seeds/run_seeds.py               Seed the database (skips bikes that already exist)
    python seeds/run_seeds.py --force       Delete existing seed data and re-seed

Run from motomap-api/ directory:
    cd motomap-api
    python seeds/run_seeds.py --dry-run
"""

import argparse
import asyncio
import sys
import uuid
from pathlib import Path
from typing import Any

# Ensure app module is importable when running from motomap-api/
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.models import Bike, DIYGuide, GuideStep, Part, PartConnection
from seeds.bikes import BIKES
from seeds.guides.oil_change import GUIDES
from seeds.parts.apache_rtr import PARTS as APACHE_PARTS
from seeds.parts.pulsar_150 import PARTS as PULSAR_PARTS
from seeds.parts.re_classic import PARTS as RE_PARTS
from seeds.seed_types import BikeDef, GuideDef, PartDef

# ── Maps each bike slug to its parts list ───────────────────────────────────
PARTS_BY_SLUG: dict[str, list[PartDef]] = {
    "pulsar_150": PULSAR_PARTS,
    "apache_rtr_160_4v": APACHE_PARTS,
    "re_classic_350": RE_PARTS,
}


# ── Validation ───────────────────────────────────────────────────────────────

def validate_parts(parts: list[PartDef], bike_slug: str) -> list[str]:
    """Return list of validation error messages for a parts list."""
    errors: list[str] = []
    part_names = {p.name for p in parts}
    valid_categories = {"fuel", "air_intake", "cooling", "brakes", "electrical", "drivetrain", "exhaust", "suspension", "bodywork"}
    valid_risk_levels = {"SAFE", "CAUTION", "STOP"}

    for part in parts:
        prefix = f"[{bike_slug}] '{part.name}'"

        if not part.name.strip():
            errors.append(f"{prefix}: empty name")
        if part.category not in valid_categories:
            errors.append(f"{prefix}: invalid category '{part.category}'")
        if part.risk_level not in valid_risk_levels:
            errors.append(f"{prefix}: invalid risk_level '{part.risk_level}'")
        if not part.function.strip():
            errors.append(f"{prefix}: empty function")
        if not part.failure_consequences.strip():
            errors.append(f"{prefix}: empty failure_consequences")
        if part.diy_fixable and not part.quick_fix:
            errors.append(f"{prefix}: diy_fixable=True but quick_fix is None")
        if part.cost_min > part.cost_max:
            errors.append(f"{prefix}: cost_min ({part.cost_min}) > cost_max ({part.cost_max})")
        if part.connections_to:
            for target_name, conn_type in part.connections_to:
                if target_name not in part_names:
                    errors.append(f"{prefix}: connection target '{target_name}' not in {bike_slug} parts list")
                if not conn_type.strip():
                    errors.append(f"{prefix}: empty connection_type for target '{target_name}'")
        else:
            errors.append(f"{prefix}: no connections_to (at least 1 required)")

    return errors


def validate_guides(guides: list[GuideDef], parts_by_slug: dict[str, list[PartDef]]) -> list[str]:
    """Return list of validation error messages for guides."""
    errors: list[str] = []
    bike_slugs = {b.slug for b in BIKES}
    valid_difficulties = {"BEGINNER", "INTERMEDIATE", "ADVANCED"}

    for guide in guides:
        prefix = f"[guide] '{guide.title}'"

        if guide.bike_slug not in bike_slugs:
            errors.append(f"{prefix}: unknown bike_slug '{guide.bike_slug}'")
        if guide.difficulty not in valid_difficulties:
            errors.append(f"{prefix}: invalid difficulty '{guide.difficulty}'")
        if guide.bike_slug in parts_by_slug:
            part_names = {p.name for p in parts_by_slug[guide.bike_slug]}
            if guide.part_name not in part_names:
                errors.append(f"{prefix}: part_name '{guide.part_name}' not found in {guide.bike_slug} parts")
        if not guide.steps:
            errors.append(f"{prefix}: no steps defined")
        step_numbers = [s.step_number for s in guide.steps]
        if step_numbers != list(range(1, len(step_numbers) + 1)):
            errors.append(f"{prefix}: step_numbers are not sequential starting at 1: {step_numbers}")

    return errors


def run_dry_run() -> None:
    """Validate all seed data and print what would be seeded."""
    print("\n" + "=" * 60)
    print("  MOTOMAP SEED DRY RUN")
    print("=" * 60)

    all_errors: list[str] = []

    # Validate bikes
    print(f"\n[BIKES] {len(BIKES)} defined:")
    for bike in BIKES:
        print(f"  [OK] {bike.make} {bike.model} ({bike.year_start}-{bike.year_end})")

    # Validate parts
    print(f"\n[PARTS]")
    total_parts = 0
    total_connections = 0
    for slug, parts in PARTS_BY_SLUG.items():
        errors = validate_parts(parts, slug)
        all_errors.extend(errors)
        conn_count = sum(len(p.connections_to) for p in parts)
        total_parts += len(parts)
        total_connections += conn_count
        status = "[OK]" if not errors else "[ERR]"
        print(f"  {status} {slug}: {len(parts)} parts, {conn_count} connections")
        for e in errors:
            print(f"      ERROR: {e}")

    # Validate guides
    print(f"\n[GUIDES]")
    guide_errors = validate_guides(GUIDES, PARTS_BY_SLUG)
    all_errors.extend(guide_errors)
    total_steps = sum(len(g.steps) for g in GUIDES)
    for guide in GUIDES:
        status = "[OK]" if not guide_errors else "[ERR]"
        print(f"  {status} '{guide.title}': {len(guide.steps)} steps, {guide.estimated_minutes} min [{guide.difficulty}]")
    for e in guide_errors:
        print(f"      ERROR: {e}")

    # Summary
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Bikes:            {len(BIKES)}")
    print(f"  Parts (total):    {total_parts}")
    print(f"  Connections:      {total_connections}")
    print(f"  Guides:           {len(GUIDES)}")
    print(f"  Guide steps:      {total_steps}")

    if all_errors:
        print(f"\n  [ERR] {len(all_errors)} VALIDATION ERROR(S) — fix before seeding live")
        sys.exit(1)
    else:
        print(f"\n  [OK] All validation passed — safe to run without --dry-run")


# ── Database seeding ──────────────────────────────────────────────────────────

async def delete_bike_data(session: "Any", bike_id: uuid.UUID) -> None:
    """Delete all data for a bike in dependency order."""
    # 1. guide steps
    guide_ids_q = await session.execute(select(DIYGuide.id).where(DIYGuide.bike_id == bike_id))
    guide_ids = [row[0] for row in guide_ids_q.all()]
    if guide_ids:
        await session.execute(delete(GuideStep).where(GuideStep.guide_id.in_(guide_ids)))

    # 2. guides
    await session.execute(delete(DIYGuide).where(DIYGuide.bike_id == bike_id))

    # 3. part connections
    part_ids_q = await session.execute(select(Part.id).where(Part.bike_id == bike_id))
    part_ids = [row[0] for row in part_ids_q.all()]
    if part_ids:
        await session.execute(
            delete(PartConnection).where(
                PartConnection.from_part_id.in_(part_ids) | PartConnection.to_part_id.in_(part_ids)
            )
        )

    # 4. parts
    await session.execute(delete(Part).where(Part.bike_id == bike_id))

    # 5. bike
    await session.execute(delete(Bike).where(Bike.id == bike_id))


async def seed_bike(session: "Any", bike_def: BikeDef) -> tuple[uuid.UUID, dict[str, uuid.UUID]]:
    """Insert a bike and return (bike_id, {part_name: part_id})."""
    bike = Bike(
        make=bike_def.make,
        model=bike_def.model,
        year_start=bike_def.year_start,
        year_end=bike_def.year_end,
        variant=bike_def.variant,
        metadata_=bike_def.metadata,
        is_active=True,
    )
    session.add(bike)
    await session.flush()  # get bike.id without committing
    return bike.id, {}


async def seed_parts(
    session: "Any",
    bike_id: uuid.UUID,
    parts: list[PartDef],
) -> dict[str, uuid.UUID]:
    """Insert all parts for a bike. Returns {part_name: part_id} map."""
    name_to_id: dict[str, uuid.UUID] = {}

    for part_def in parts:
        part = Part(
            bike_id=bike_id,
            name=part_def.name,
            category=part_def.category,
            function=part_def.function,
            failure_consequences=part_def.failure_consequences,
            risk_level=part_def.risk_level,
            diy_fixable=part_def.diy_fixable,
            quick_fix=part_def.quick_fix,
            cost_range_min=part_def.cost_min,
            cost_range_max=part_def.cost_max,
            metadata_=part_def.metadata,
            is_risk_approved=False,  # requires Expert Reviewer — never auto-approve
        )
        session.add(part)
        await session.flush()
        name_to_id[part_def.name] = part.id

    return name_to_id


async def seed_connections(
    session: "Any",
    parts: list[PartDef],
    name_to_id: dict[str, uuid.UUID],
) -> int:
    """Insert PartConnections. Returns count inserted."""
    count = 0
    for part_def in parts:
        from_id = name_to_id.get(part_def.name)
        if not from_id:
            continue
        for target_name, conn_type in part_def.connections_to:
            to_id = name_to_id.get(target_name)
            if not to_id:
                print(f"  WARN: connection target '{target_name}' not found — skipping")
                continue
            conn = PartConnection(
                from_part_id=from_id,
                to_part_id=to_id,
                connection_type=conn_type,
            )
            session.add(conn)
            count += 1
    await session.flush()
    return count


async def seed_guide(
    session: "Any",
    guide_def: GuideDef,
    bike_id: uuid.UUID,
    name_to_id: dict[str, uuid.UUID],
) -> None:
    """Insert a DIYGuide and its GuideSteps."""
    part_id = name_to_id.get(guide_def.part_name)
    if not part_id:
        print(f"  WARN: guide part '{guide_def.part_name}' not found for {guide_def.bike_slug} — skipping guide '{guide_def.title}'")
        return

    guide = DIYGuide(
        bike_id=bike_id,
        part_id=part_id,
        title=guide_def.title,
        difficulty=guide_def.difficulty,
        estimated_minutes=guide_def.estimated_minutes,
        tools_required=guide_def.tools_required,
        is_published=False,  # requires review before publishing
        created_by_id=None,
    )
    session.add(guide)
    await session.flush()

    for step_def in guide_def.steps:
        step = GuideStep(
            guide_id=guide.id,
            step_number=step_def.step_number,
            title=step_def.title,
            description=step_def.description,
            photo_url=None,
            warning=step_def.warning,
        )
        session.add(step)

    await session.flush()


async def run_seeds(force: bool = False) -> None:
    """Main async seed function."""
    engine = create_async_engine(settings.database_url, echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    total_parts = 0
    total_connections = 0
    total_guides = 0
    total_steps = 0
    bikes_seeded = 0
    bikes_skipped = 0

    # Build slug -> bike_def for guide lookup
    bike_def_by_slug = {b.slug: b for b in BIKES}
    # Build slug -> guide list
    guides_by_slug: dict[str, list[GuideDef]] = {}
    for g in GUIDES:
        guides_by_slug.setdefault(g.bike_slug, []).append(g)

    async with session_maker() as session:
        async with session.begin():
            for bike_def in BIKES:
                label = f"{bike_def.make} {bike_def.model}"

                # Check if bike already exists
                existing = await session.execute(
                    select(Bike.id).where(
                        Bike.make == bike_def.make,
                        Bike.model == bike_def.model,
                        Bike.year_start == bike_def.year_start,
                        Bike.deleted_at.is_(None),
                    )
                )
                existing_row = existing.first()

                if existing_row and not force:
                    print(f"  SKIP  {label} (already seeded — use --force to re-seed)")
                    bikes_skipped += 1
                    continue

                if existing_row and force:
                    print(f"  DELETE {label} (--force: removing existing data)")
                    await delete_bike_data(session, existing_row[0])

                # Insert bike
                bike_id, _ = await seed_bike(session, bike_def)

                # Insert parts
                parts = PARTS_BY_SLUG.get(bike_def.slug, [])
                name_to_id = await seed_parts(session, bike_id, parts)
                total_parts += len(parts)

                # Insert connections
                conn_count = await seed_connections(session, parts, name_to_id)
                total_connections += conn_count

                # Insert guides for this bike
                for guide_def in guides_by_slug.get(bike_def.slug, []):
                    await seed_guide(session, guide_def, bike_id, name_to_id)
                    total_steps += len(guide_def.steps)
                    total_guides += 1

                bikes_seeded += 1
                print(f"  [OK]  {label}: {len(parts)} parts, {conn_count} connections, {len(guides_by_slug.get(bike_def.slug, []))} guides")

    await engine.dispose()

    print("\n" + "=" * 60)
    print("  SEED COMPLETE")
    print("=" * 60)
    print(f"  Bikes seeded:     {bikes_seeded}")
    print(f"  Bikes skipped:    {bikes_skipped}")
    print(f"  Parts inserted:   {total_parts}")
    print(f"  Connections:      {total_connections}")
    print(f"  Guides inserted:  {total_guides}")
    print(f"  Guide steps:      {total_steps}")
    print()


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Motomap seed runner")
    parser.add_argument("--dry-run", action="store_true", help="Validate data and print counts without writing to DB")
    parser.add_argument("--force", action="store_true", help="Delete and re-seed existing bike data")
    args = parser.parse_args()

    if args.dry_run:
        run_dry_run()
    else:
        print("\nSeeding database...")
        if args.force:
            print("WARNING: --force mode — existing seed data will be deleted\n")
        asyncio.run(run_seeds(force=args.force))


if __name__ == "__main__":
    main()
