# Motomap — Session Kickoff Prompts
# Paste the relevant prompt into Claude Code to start each session.
# Always start with the Orchestrator prompt first in a new project.

---

## 🚀 FIRST EVER SESSION — Run this once to bootstrap

```
@motomap-orchestrator

I'm starting the Motomap project. Read CLAUDE.md, understand the full 
architecture, then give me the plan for Session 1: Backend Foundation.

Brief the motomap-backend agent to:
1. Scaffold the FastAPI project structure
2. Create all SQLAlchemy models (Bike, Part, PartConnection, DIYGuide, 
   GuideStep, Contribution, User with role enum)
3. Generate Alembic migrations
4. Set up docker-compose with PostgreSQL 15 + Redis
5. Create basic health check endpoint

When done, flag what the motomap-content agent needs to do next.
```

---

## SESSION 1 — Backend Foundation

```
@motomap-backend

Read CLAUDE.md for full context.

Create the motomap-api project:
1. Scaffold: app/models/, app/routes/, app/services/, app/schemas/, 
   alembic/, tests/
2. Models: Bike, Part, PartConnection, DIYGuide, GuideStep, 
   Contribution (with status enum PENDING/IN_REVIEW/APPROVED/REJECTED), 
   User (with role enum RIDER/VERIFIED_ENTHUSIAST/EXPERT_REVIEWER/BRAND_OFFICIAL/ADMIN)
3. Alembic migration for all models
4. docker-compose.yml with PostgreSQL 15 + Redis 7 + FastAPI
5. requirements.txt with all dependencies
6. GET /health endpoint
7. pytest conftest.py with async test DB fixture

Run alembic upgrade head to verify migration is clean.
Run pytest to verify tests pass.
```

---

## SESSION 2 — Core API Routes

```
@motomap-backend

Read CLAUDE.md. Session 1 is complete (schema + scaffold done).

Build all core API routes:
1. /api/v1/bikes — GET list (filter by make/model), GET {id}
2. /api/v1/bikes/{id}/parts — GET list, GET {part_id}
3. /api/v1/parts/{id}/connections — GET connected parts (anatomy graph)
4. /api/v1/contributions — POST submit, GET list (expert queue), 
   POST {id}/approve, POST {id}/reject
5. /api/v1/guides — GET list by bike, GET {id} with steps
6. /api/v1/users — POST register, POST login (JWT), GET me
7. Auth middleware: JWT validation, role-based route protection

Write tests for every route. Run pytest before marking done.
```

---

## SESSION 3 — AI Diagnosis Service

```
@motomap-infra

Read CLAUDE.md. Backend routes are complete.

Build the AI diagnosis layer:
1. app/services/diagnosis.py — Claude API vision integration
   - Accept bike_id + image bytes
   - Fetch bike's parts list from DB for context
   - Call claude-sonnet-4-6 with structured prompt
   - Parse response into DiagnosisResult schema
   - If confidence < 0.6: safe_to_ride=null + low_confidence_warning
2. app/services/embeddings.py — pgvector semantic search
   - Generate embeddings for part descriptions
   - semantic_search(query, bike_id) → top 5 parts
3. POST /api/v1/diagnose endpoint (image upload)
4. GET /api/v1/parts/search?q=... (semantic search)
5. app/services/storage.py — R2 file upload for part photos

Add ANTHROPIC_API_KEY, R2_* to .env.example
```

---

## SESSION 4 — Seed Data (3 Bikes)

```
@motomap-content

Read CLAUDE.md. Backend + AI services are complete.

Create comprehensive seed data for Phase 1 bikes:
1. seeds/bikes.py — Bajaj Pulsar 150 (2018-2023), 
   TVS Apache RTR 160 4V (2018-2023), 
   Royal Enfield Classic 350 (2021-2023)
2. seeds/parts/pulsar_150.py — minimum 20 parts with full data
3. seeds/parts/apache_rtr.py — minimum 20 parts
4. seeds/parts/re_classic.py — minimum 20 parts
5. Each part needs: PartConnections building the anatomy graph
6. seeds/guides/oil_change.py — DIY oil change for all 3 bikes
7. seeds/run_seeds.py — master runner with --dry-run flag

Every part needs realistic failure_consequences and cost in INR.
Run seeds with --dry-run first to validate, then run live.
Report: how many parts, connections, and guides seeded.
```

---

## SESSION 5 — Contributor Portal

```
@motomap-frontend

Read CLAUDE.md. Backend is fully operational with seed data.
API base URL: http://localhost:8000/api/v1

Build motomap-contributor (Next.js 14):
1. /submit/part — form with: bike selector, part name, category dropdown,
   function textarea, failure_consequences textarea, risk_level select,
   diy_fixable toggle, quick_fix textarea, cost range, photo upload (max 5)
2. /submit/guide — step builder: add/reorder steps, each with photo + instruction
3. /review/queue — expert dashboard: pending contributions, diff view,
   approve button, reject button (requires rejection note)
4. /profile — contributor stats: approved_count, badges, submission history
5. Clerk auth integration

Use shadcn/ui components. Mobile-responsive.
Run npm run build to verify no TypeScript errors.
```

---

## SESSION 6 — Rider App Shell

```
@motomap-frontend

Read CLAUDE.md. Contributor portal is complete.

Build motomap-app (React Native / Expo):
1. Tab navigator: Explore (anatomy), Diagnose (snap), Garage (DIY)
2. Explore tab: bike selector → anatomy map → part detail screen
   Part detail shows: name, function, risk badge (colored), 
   failure_consequences, quick_fix, connected parts list
3. Diagnose tab: camera capture → upload → loading → diagnosis result screen
   Result screen: part name, confidence bar, risk badge, reason, quick_fix
4. Garage tab: bike selector → guide list → step-by-step guide viewer
5. Offline cache: anatomy data for selected bike cached via React Query

Run on Android emulator. Screenshot the 3 main screens.
```

---

## REVIEW — Run after any session

```
@motomap-reviewer

Read CLAUDE.md. [Session N] just completed.

Review all files modified in the last session:
1. Run safety checks on risk_level handling
2. Check for hardcoded secrets
3. Verify test coverage
4. Check architecture consistency with CLAUDE.md

Report with PASS / PASS WITH MINOR ISSUES / BLOCK verdict.
```

---

## COMPACT REMINDER

When context approaches 70%, run:
```
/compact
```
Then start fresh session with the next prompt above.
Each session = one agent = one concern = clean context.
