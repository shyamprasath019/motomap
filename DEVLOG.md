# Motomap — Development Log

> India's first interactive motorcycle knowledge and AI diagnostic platform.
> Built in a multi-agent, split-session architecture across 7 sessions.

---

## Project Overview

**Goal:** Help Indian riders understand their motorcycles — what each part does, what happens when it fails, whether they can fix it themselves, and what it costs. AI-powered diagnosis from a photo. Community-contributed content, expert-reviewed.

**Target market:** Indian riders (Android-first), Indian SMB mechanics, motorcycle enthusiasts.

**Phase 1 target bikes:** Bajaj Pulsar 150 (2018–2023), TVS Apache RTR 160 4V (2018–2023), Royal Enfield Classic 350 (2021–2023 J-platform).

---

## Architecture

```
motomap/
├── motomap-api/          # FastAPI backend (Python 3.11)
├── motomap-contributor/  # Next.js 14 contributor + review portal
├── motomap-app/          # React Native / Expo rider app (Android-first)
└── .claude/
    ├── agents/           # Specialist agent definitions
    ├── rules/            # Path-scoped coding conventions
    └── hooks/            # Safety check hooks
```

### Stack Decisions

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI + Python 3.11 | Async-native, Pydantic v2 for strict schemas, fast iteration |
| Database | PostgreSQL 15 + pgvector | JSONB for flexible part metadata; pgvector for semantic search |
| Cache | Redis 7 | Anatomy map caching, rate limiting |
| Storage | Cloudflare R2 | S3-compatible, cheap egress for India |
| Embeddings | fastembed (BAAI/bge-small-en-v1.5, 384-dim) | Runs locally, no API cost, thread-pool offloaded |
| AI Diagnosis | Claude claude-sonnet-4-6 (vision) | Best-in-class structured JSON output; confidence gating |
| Auth | Clerk | Social login for riders; RBAC for contributor tiers |
| Mobile | React Native / Expo SDK 54 | Android-first, OTA updates, single codebase |
| Web | Next.js 14 + shadcn/ui | Contributor portal + review dashboard |
| ORM | SQLAlchemy 2.0 (async) | Async engine, type-safe queries |
| Migrations | Alembic | Schema-as-code, no ALTER TABLE in app |
| Infra | Railway (dev) → AWS ECS (prod) | Zero-config dev, scalable prod path |

---

## Session Log

### Session 1 — FastAPI Scaffold
**Agent:** motomap-backend
**Commit:** `6eee5d2`

Built the full `motomap-api/` skeleton:

- **8 tables:** `users`, `bikes`, `parts`, `part_connections`, `diy_guides`, `guide_steps`, `contributions`, `alembic_version`
- **Enums locked:** `UserRole` (RIDER / VERIFIED_ENTHUSIAST / EXPERT_REVIEWER / BRAND_OFFICIAL / ADMIN), `ContributionStatus` (PENDING / IN_REVIEW / APPROVED / REJECTED), `RiskLevel` (SAFE / CAUTION / STOP), `Difficulty` (BEGINNER / INTERMEDIATE / ADVANCED), `PartCategory` (12 categories)
- **Key design choices:**
  - `Part.verified = False` by default — safety gate before publish
  - `Contribution` is append-only — no UPDATE; rejections write new rows with `parent_contribution_id`
  - `deleted_at` soft-delete column on all content models from day 1
  - UUID PKs throughout, `gen_random_uuid()` (PG15 built-in, no extension needed)
  - Async Alembic `env.py` (custom, not default template — avoids `MissingGreenlet` errors)
  - PG native ENUMs with `sa.Enum(..., name="...", create_type=True)` — explicit ordering in migration
- **`GET /health`** returns `{ data: { status, db, redis }, meta: { version, timestamp } }` per API envelope spec
- **Tests:** `test_health.py` — async test DB with transactional rollback fixture, `AsyncClient` via `ASGITransport`

**Infra note:** Postgres mapped to port 5433 — port 5432 already taken on dev machine. Updated `.env`, `alembic.ini`, `docker-compose.yml` accordingly.

---

### Session 2 — Core API Routes + Auth
**Agent:** motomap-backend
**Commit:** `64d1e18f`

All CRUD routes under `/api/v1`:

- `GET/GET {id} /bikes` — make/model filters, pagination
- `GET/GET {id} /bikes/{id}/parts` — category filter
- `GET /parts/{id}/connections` — bidirectional anatomy graph edges with connected part detail
- `POST /contributions`, `GET` expert queue, `POST {id}/approve`, `POST {id}/reject`
- `GET /guides` (filter by bike, published only), `GET {id}` with ordered steps
- `POST /users/register`, `POST /users/login` (JWT), `GET /users/me`

**Auth implementation:**
- JWT via `python-jose`, password hashing via `bcrypt` directly
- `get_current_user` dependency + `require_role(min_role)` factory for RBAC
- Role hierarchy enforced: RIDER < VERIFIED_ENTHUSIAST < EXPERT_REVIEWER < BRAND_OFFICIAL < ADMIN

**Gotcha — bcrypt/passlib incompatibility:**
`passlib 1.7.4` breaks with `bcrypt 5.x` due to a removed internal `detect_wrap_bug` check. Solution: pin `bcrypt==4.3.0` and call bcrypt directly, dropping passlib entirely.

---

### Session 3 — AI Diagnosis Service
**Agent:** motomap-infra
**Commit:** `f1aaa186`

Three new services:

**`app/services/diagnosis.py`**
- Accepts `bike_id` + image bytes
- Fetches bike's part list from DB as context for the prompt
- Calls `claude-sonnet-4-6` with structured JSON output schema
- Parses into `DiagnosisResult` Pydantic schema
- Safety rules (enforced in code, not just prompt):
  - `confidence < 0.6` → `safe_to_ride = None` + `low_confidence_warning` (never returns false safety assurance)
  - Any STOP-severity part → `mechanic_prompt` forced regardless of confidence

**`app/services/embeddings.py`**
- `fastembed` with `BAAI/bge-small-en-v1.5` model (384 dimensions)
- Model lazy-loads (~33 MB) on first call — no startup penalty
- `index_part()`, `index_all_parts()`, `semantic_search()` functions
- Offloaded to thread pool (fastembed is sync) to avoid blocking the async event loop
- **Note:** `index_all_parts(db)` must be called after seeding — parts won't appear in search until indexed

**`app/services/storage.py`**
- Cloudflare R2 via boto3 (S3v4 signature)
- `upload_part_photo()`, `upload_guide_photo()` — sync boto3 wrapped in `run_in_executor`
- Sufficient for low-volume MVP; swap to `aioboto3` if throughput becomes a concern

**New route:** `POST /api/v1/diagnose` — multipart upload, auth required, 10 MB cap, MIME type check
**Updated:** `GET /api/v1/parts/search?q=&bike_id=` — semantic search via pgvector

**Migration:** `CREATE EXTENSION vector` + `embedding vector(384)` column + IVFFlat index on `parts`

**Route ordering note:** `/parts/search` registered before `/{part_id}` — FastAPI resolves literal paths first, so no conflict. Keep this in mind if adding more path-param routes later.

---

### Session 4 — Seed Data (3 Bikes)
**Agent:** motomap-content
**Commit:** `ca557013`

Complete seed data for Phase 1:

| Bike | Parts | Connections |
|---|---|---|
| Bajaj Pulsar 150 (2018–2023) | 25 | 29 |
| TVS Apache RTR 160 4V (2018–2023) | 28 | 34 |
| Royal Enfield Classic 350 (2021–2023) | 31 | 38 |
| **Total** | **84** | **101** |

- 3 engine oil change DIY guides, 10 steps each, bike-specific procedures
- All costs in INR (realistic Chennai/Bangalore range)
- Risk levels conservative: CAUTION over STOP when in doubt
- Every part has ≥1 `PartConnection` — anatomy graph is connected, not isolated nodes
- `seeds/run_seeds.py` — idempotent by default, `--dry-run` flag, `--force` to wipe and re-seed

**Systems covered:**
- Pulsar 150: carburetor/FI, air filter + breather hose, chain + sprocket, front/rear disc brakes, battery + ignition, CDI, exhaust header
- Apache RTR 160 4V: FI throttle body, dual-channel ABS, petal discs, LED lighting harness, clip-on handlebars + cables
- RE Classic 350: J-platform FI, ByBre calipers, Bosch ABS, USB charging port wiring, chrome exhaust heat shield, side stand sensor

**Infra fix in same commit:** Switched `postgres:15` → `pgvector/pgvector:pg15` in `docker-compose.yml`. The stock `postgres:15` image doesn't ship the pgvector binary — `CREATE EXTENSION vector` would fail on every fresh container unless manually apt-installed. The pgvector image has it pre-bundled.

---

### Session 5 — Contributor Portal
**Agent:** motomap-frontend
**Commit:** `86b7167b`

Next.js 14 app (`motomap-contributor/`) — 8 routes, zero TypeScript errors:

| Route | Description |
|---|---|
| `/submit/part` | Bike selector, 12-category dropdown, function/failure text, risk level (SAFE/CAUTION/STOP), DIY toggle, conditional quick-fix textarea, ₹ cost range, drag-drop photo upload (max 5) |
| `/submit/guide` | Bike selector, difficulty/time/tools-required, step builder (add/reorder/delete, each step has photo + instruction + optional warning) |
| `/review/queue` | Expert-only (EXPERT_REVIEWER+); tabbed PENDING/APPROVED/REJECTED, expandable data diff, one-click approve, reject dialog requires note |
| `/profile` | Clerk avatar, backend role badge, achievement badges, contribution stats + history |
| `/sign-in` | Clerk-hosted component |
| `/sign-up` | Clerk-hosted component |

**Auth bridge:** Clerk for UI authentication → deterministic bridge to backend JWT (Clerk `userId` used as password to register/login to backend). Token stored in `localStorage`, auto-synced on Clerk sign-in.

**Known limitation (tracked):** This bridge is a dev shortcut — Clerk `userId` is not a secret. Must be replaced with `@clerk/backend` + `verifyToken` before production. See *Known Issues* section.

**Also fixed:** Added `motomap-contributor/.gitignore` — initial commit accidentally included `.next/` build folder and `node_modules/` (30k+ files). Follow-up commit removed them.

---

### Session 6 — Rider App Shell
**Agent:** motomap-frontend
**Commit:** `11a3ae38`

React Native / Expo SDK 54 (`motomap-app/`) — Android-first:

**3-tab navigator:**

| Tab | Screens |
|---|---|
| **Explore** | Bike selector → Anatomy Map (parts risk-sorted STOP→CAUTION→SAFE) → Part Detail (function, failure consequences, quick fix, ₹ cost, DIY flag, connected parts graph) |
| **Diagnose** | Bike picker pills + auth gate → Camera + gallery buttons → Loading → Diagnosis Result (part name, confidence bar, risk badge, reason, quick fix; `low_confidence_warning` if confidence < 0.6) |
| **Garage** | Bike selector → DIY guide list → Step-by-step guide viewer |

**Offline cache:** React Query + AsyncStorage — anatomy data for selected bike persisted locally.

**Issues fixed during session:**
- `react-native-worklets` missing after SDK 54 downgrade → bundle 500 error. Resolved by removing the dependency.
- `python-multipart` missing from API → FastAPI crash on `POST /diagnose` startup. Added to `requirements.txt`.
- `BASE_URL` was `10.0.2.2` (emulator-only) → changed to `192.168.0.2` (LAN IP for physical device testing). Later replaced with `EXPO_PUBLIC_API_URL` env var (see hotfix below).

**Honest MVP assessment:**
- All 3 core flows work end-to-end with real API data
- Risk badges + confidence bars communicate danger clearly
- ₹ pricing shows correctly for Indian market
- **Gap:** Anatomy map is a risk-sorted list, not a visual tap-on-diagram — riders expect an interactive bike image
- **Gap:** Diagnose requires auth before camera — adds friction for first-time users
- **Gap:** No error retry / empty states — API down shows error with no cached fallback

**Hotfix commit** (`c8d7c6d7`): Replaced hardcoded `192.168.0.2` in `api.ts` with `process.env.EXPO_PUBLIC_API_URL ?? fallback`. Added `.env.example` documenting emulator default (`10.0.2.2`) and LAN IP usage.

---

### Session 7 — Reviewer Fixes
**Agent:** motomap-backend
**Commit:** `be10dccb`

Addressed all findings from `@motomap-reviewer` pass across Sessions 1–6:

**Safety fix (`diagnosis.py`):**
```python
# SAFETY: any STOP part overrides AI's safe_to_ride=True
if any(p.severity == "STOP" for p in diagnosed):
    safe_to_ride = False
```
Before this fix, the API could simultaneously return `safe_to_ride=True` and a STOP-severity part when AI confidence ≥ 0.6. The result screen would show "✓ Safe to ride" + "Critical issue — visit mechanic" at the same time.

**Security fix — JWT startup guard (`config.py`, `main.py`):**
- `jwt_secret` now uses `Field(..., min_length=32)` for schema-level enforcement
- Startup lifespan asserts the secret is not the default dev value — fails fast on misconfigured deploy instead of shipping with a known secret

**Architecture fix — CORS (`main.py`):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # default: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Without this, the contributor Next.js portal (browser) could not call the API at all. Mobile apps are unaffected by CORS but browser clients are fully blocked.

**Performance fix — N+1 query (`parts.py`):**
Replaced a per-connection SELECT loop with a single `IN (...)` batch fetch for all connected parts. For a bike with 30+ connections, the old code issued 30+ sequential queries; the new code issues 1.

**Test coverage added:**
- `tests/test_diagnose.py` — success path (200), unauthenticated (401), invalid image type (422), bike not found (404), confidence < 0.6 response shape (Claude API mocked)
- `tests/test_parts_search.py` — valid query, `q` < 2 chars (422), `bike_id` filter, empty result

---

## Current State

**All 7 sessions complete. Codebase is demo-ready.**

```
git log --oneline
be10dccb fix: reviewer findings — safety, security, CORS, N+1, test coverage
2dd0b048 chore: ignore expogo-screenshots/ + fix .gitignore encoding
c8d7c6d7 fix: use EXPO_PUBLIC_API_URL env var instead of hardcoded LAN IP
11a3ae38 feat: add React Native Expo app with 3-tab UI (Explore/Diagnose/Garage)
5d6f4095 chore: add .gitignore to motomap-contributor, untrack .next + node_modules
86b7167b feat: contributor portal — Next.js 14, 8 routes, Clerk auth (Session 5)
ca557013 feat: seed 3 Phase 1 bikes with anatomy graph + fix pgvector Docker image
f1aaa186 feat: AI diagnosis with Claude API, pgvector embeddings, and R2 storage
64d1e18f feat: add core API routes, JWT auth, and tests (Session 2)
6eee5d2  feat: scaffold motomap-api FastAPI backend
```

---

## Known Issues — Fix Before Production

| Priority | Issue | Location | Fix |
|---|---|---|---|
| BLOCK | Clerk JWT bridge uses `userId` as password — not a secret | `motomap-contributor/` auth | Replace with `@clerk/backend` + `verifyToken` |
| HIGH | Anatomy map is a sorted list, not visual diagram | `motomap-app/` Explore tab | Tap-on-bike-image interaction |
| HIGH | Diagnose auth gate before camera | `motomap-app/` Diagnose tab | Show camera first, gate auth on submit |
| MED | No error/offline fallback states | `motomap-app/` all tabs | Show cached data when API unreachable |
| LOW | Gallery button `disabled` prop not set | `diagnose/index.tsx:239` | Add `disabled` prop alongside opacity styling |
| LOW | `cors_origins` hardcoded to `localhost:3000` | `config.py` | Add prod origins before Railway/ECS deploy |
| LOW | `motomap:motomap` default DB credentials in docker-compose | `docker-compose.yml` | Override in prod `.env` |

---

## Running Locally

```bash
# 1. Start services
cd motomap-api
docker-compose up -d          # PostgreSQL 15 (port 5433) + Redis 7

# 2. Apply schema + seed
alembic upgrade head
python seeds/run_seeds.py     # 84 parts, 101 connections, 3 guides

# 3. Run API
cp .env.example .env          # fill in ANTHROPIC_API_KEY, R2_*, JWT_SECRET
uvicorn app.main:app --reload --port 8000

# 4. Contributor portal
cd ../motomap-contributor
cp .env.local.example .env.local   # fill in Clerk keys from dashboard.clerk.com
npm install && npm run dev         # http://localhost:3000

# 5. Rider app (physical device on same LAN)
cd ../motomap-app
cp .env.example .env               # set EXPO_PUBLIC_API_URL to your machine's LAN IP
npm install
npx expo start --android
```

**Key env vars:**

| Variable | Where | Notes |
|---|---|---|
| `JWT_SECRET` | `motomap-api/.env` | Min 32 chars; startup crashes if default |
| `ANTHROPIC_API_KEY` | `motomap-api/.env` | Required for `/diagnose` |
| `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | `motomap-api/.env` | R2 file uploads |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | `motomap-contributor/.env.local` | Clerk dashboard |
| `EXPO_PUBLIC_API_URL` | `motomap-app/.env` | LAN IP for physical device; `10.0.2.2:8000` for emulator |

---

## Safety-Critical Rules (never bypass)

1. **Never auto-approve `risk_level`** — always requires Expert Reviewer sign-off before `verified=True`
2. **Snap & Diagnose confidence gate** — if `confidence < 0.6`, return `safe_to_ride = None` + `low_confidence_warning`, never a false safe assurance
3. **STOP severity overrides everything** — if any diagnosed part has `severity == "STOP"`, force `safe_to_ride = False` regardless of AI confidence
4. **No "stop immediately" from AI alone** — always surface `mechanic_prompt` alongside any STOP classification
5. **Contribution diffs are permanent** — append-only, no silent overwrites

---

## Next Build Priorities (Session 8+)

1. **Security:** Replace Clerk JWT bridge with `@clerk/backend` `verifyToken` (highest risk item)
2. **UX — Anatomy map:** Visual tap-on-bike-image interaction replacing sorted list
3. **UX — Diagnose flow:** Move auth gate to post-capture, reduce first-time friction
4. **UX — Error states:** Offline fallback showing cached anatomy data
5. **Content:** Add chain cleaning, air filter, battery, brake fluid guides (seeds/guides/)
6. **Infra:** Railway deployment config, environment-specific CORS origins, prod DB credentials
