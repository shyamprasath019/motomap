# Motomap — Project Intelligence

> India's first interactive motorcycle knowledge and diagnostic platform.
> Community-contributed, expert-reviewed content. AI-powered diagnostics.
> India-first: Hero, Bajaj, TVS, Royal Enfield, KTM.

---

## Architecture at a Glance

```
motomap/
├── motomap-api/          # FastAPI backend (Python)
├── motomap-contributor/  # Next.js contributor + review portal (web)
├── motomap-app/          # React Native rider app (Android-first)
└── .claude/
    ├── agents/           # Subagent definitions (auto-loaded)
    ├── rules/            # Path-scoped coding rules
    └── CLAUDE.md         # This file
```

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | FastAPI + Python 3.11 | Async, Pydantic v2, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 + pgvector | JSONB for flexible part metadata |
| Cache | Redis 7 | Anatomy maps, rate limiting |
| Storage | Cloudflare R2 | Part photos, DIY images |
| Search | PostgreSQL FTS → Typesense | Semantic search via pgvector |
| AI | Claude API (claude-sonnet-4-6) | Vision diagnosis, structured JSON output |
| Auth | Clerk | Social login riders; RBAC contributor tiers |
| Mobile | React Native (Expo) | Android priority |
| Web | Next.js 14 | Contributor portal + review dashboard |
| Infra | Railway (dev) → AWS ECS (prod) | |

## Key Domain Concepts

**Bike** — make, model, year_range, variant. The root entity.

**Part** — belongs to a Bike. Has: function, failure_consequences, risk_level (SAFE/CAUTION/STOP), diy_fixable, quick_fix, cost_range. Connected to other Parts via PartConnection graph edges. NEVER publish a Part with risk_level without Expert Reviewer sign-off.

**DIYGuide** — step-by-step maintenance guide for a specific Bike+Part combo. Has difficulty (BEGINNER/INTERMEDIATE/ADVANCED), ordered GuideSteps with photos.

**Contribution** — community submission. Status: PENDING → IN_REVIEW → APPROVED/REJECTED. Version history is append-only — never delete old data.

**User Roles** — RIDER < VERIFIED_ENTHUSIAST < EXPERT_REVIEWER < BRAND_OFFICIAL < ADMIN. Role gates what a user can approve, not just submit.

## API Conventions

- REST endpoints: plural nouns, snake_case paths → `/api/v1/bikes/{bike_id}/parts`
- All responses: `{ data: ..., meta: { version, timestamp } }`
- Errors: `{ error: { code, message, field? } }` with standard HTTP status
- Auth header: `Authorization: Bearer <jwt>`
- Pagination: `?page=1&per_page=20`, response includes `meta.total`
- Soft deletes only — never hard delete content records

## Coding Standards

- Python: Black formatter, isort, type hints on all functions, docstrings on public methods
- TypeScript: strict mode, no `any`, named exports preferred over default
- Tests: pytest for API, Jest for frontend. Every new route needs a test.
- Migrations: Alembic only — never ALTER TABLE in app code
- Environment: all secrets via `.env` — never hardcode keys
- Commit style: `feat:`, `fix:`, `chore:`, `test:` prefixes

## Build & Run Commands

```bash
# API
cd motomap-api
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Contributor Portal
cd motomap-contributor
npm install
npm run dev

# Mobile App
cd motomap-app
npm install
npx expo start --android

# Docker (full stack)
docker-compose up -d
```

## Safety-Critical Rules

1. NEVER auto-approve risk_level tags — always requires Expert Reviewer
2. Snap & Diagnose: if confidence < 0.6, return low_confidence_warning, NOT safe_to_ride
3. No "stop immediately" classification from AI alone — always surfaces mechanic prompt
4. Contribution diffs are stored permanently — no silent overwrites

## Session Strategy — Token Efficiency

This project uses a **multi-agent, split-session** architecture to preserve context:

- **Orchestrator** (you, in plan mode) — plans, assigns, reviews
- **Backend Agent** — FastAPI + DB work only
- **Frontend Agent** — Next.js + React Native only  
- **AI/Infra Agent** — Claude API integration + deployment only
- **Content Agent** — seed data, migrations, test fixtures only

Use `/compact` when context hits ~70%. Start a new session per agent per major feature.
Import this file at the top of every subagent: `@CLAUDE.md`

## Current Build Phase

Phase 1 — MVP (Weeks 1–12)
Target bikes: Bajaj Pulsar 150, TVS Apache RTR 160 4V, Royal Enfield Classic 350

**Session 1 status**: [x] Schema + FastAPI scaffold — 8 tables, alembic migration, /health
**Session 2 status**: [x] Core API routes + JWT auth — all CRUD routes, RBAC, bcrypt==4.3.0 (passlib dropped)
**Session 3 status**: [x] AI diagnosis service — Claude Sonnet 4.6 vision, pgvector embeddings, R2 storage
**Session 4 status**: [x] Seed data — 84 parts, 101 connections, 3 oil-change guides seeded 2026-05-25
**Session 5 status**: [x] Contributor portal — Next.js 14, 8 routes, Clerk auth, build clean
**Session 6 status**: [ ] Rider app shell (React Native / Expo)

## Known Issues — Fix Before Production

1. **Clerk→backend JWT bridge (SECURITY):** `motomap-contributor` uses Clerk userId as password to mint backend JWTs — this is a dev shortcut, userId is not a secret. Fix in Session 7/8: use `@clerk/backend` + `verifyToken` to verify Clerk session tokens server-side instead of the password bridge. Do NOT ship to prod with current auth flow.
