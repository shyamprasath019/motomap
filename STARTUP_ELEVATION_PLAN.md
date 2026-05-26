# Motomap — Startup Elevation Plan

> India's first interactive motorcycle knowledge and AI diagnostic platform.
> Internal operating plan and external pitch artifact.
> Drafted 2026-05-26. Owner: Shyam (Founder). Status: Confidential — pre-seed.

---

## Table of Contents

1. Executive Summary
2. Strategy
   - 2.1 Product–Market Fit Assessment
   - 2.2 Target User Segment
   - 2.3 Competitive Landscape
   - 2.4 Unique Value Proposition
   - 2.5 Monetisation Model
   - 2.6 Critical Assumptions to Validate Before Scaling
3. Startup Readiness Document
   - 3.1 Refined Product Vision
   - 3.2 Prototype → MVP Gap Analysis
   - 3.3 Prioritised Feature Backlog
   - 3.4 Technical Architecture Recommendations
   - 3.5 Team & Hiring Needs
   - 3.6 Investor-Ready Framing
4. Execution Plan
   - 4.1 Phase 1 — Prototype → MVP
   - 4.2 Phase 2 — MVP → Closed Beta
   - 4.3 Phase 3 — Beta → Public Launch
   - 4.4 Phase 4 — Launch → Scale (Series A Readiness)
   - 4.5 Cross-Phase Risks & Mitigations
5. Appendix — Capital Plan & Operating Cadence

---

## 1. Executive Summary

Motomap is a vertical knowledge and diagnostic platform for the world's largest two-wheeler market. The product combines three differentiated layers — an interactive anatomy map of each bike, AI-powered photo diagnosis with strict safety triage, and a community-contributed DIY library — and ships them to riders who today have no India-specific, model-specific resource for understanding their motorcycle.

The prototype is built. Across seven multi-agent build sessions, the founder has shipped a working FastAPI backend, a Next.js contributor portal, and a React Native Android app with real Claude vision-based diagnosis and three flagship bikes seeded (84 parts, 101 anatomy graph edges, 3 DIY guides). The codebase is demo-ready with a known, tracked gap list.

The next 12 months convert that prototype into a market-ready product targeting **10,000 MAU and ₹2L MRR by end of December 2026**, followed by a Series A readiness target of **100,000 MAU and ₹2.4 Cr ARR by end of 2027**. The plan below covers strategy, gap closure, and a four-phase execution roadmap with measurable milestones.

The single biggest risk is not technology or talent — it is whether Indian riders will pay for software in a market trained on free YouTube content. The plan dedicates Phase 2 to answering this question with real conversion data before any scaling spend.

---

## 2. Strategy

### 2.1 Product–Market Fit Assessment

**Demand signal: strong but unmonetised.** RE Owners Club, KTM India, Apache Owners, r/IndianBikers, and Chennai/Bangalore bike forums collectively have millions of members asking the exact questions Motomap answers — "what is this hose?", "is this safe to ride?", "how do I clean my chain?". The pain is repeatedly observed. What is unproven is whether riders will pay for a structured answer when a free, lower-quality answer exists on YouTube.

**Trust gap: real and addressable.** ~85% of Indian two-wheeler servicing happens at unorganised, unbranded garages where riders are routinely overcharged because they cannot describe what is wrong. Every rider over 25 has a story. This is a monetisable trust gap, not a vanity insight.

**PMF maturity: pre-PMF.** The prototype validates that the product can be *built*. It does not yet validate that riders will *retain* on it (no D7/D30 data), *pay* for it (no paywall live), or *contribute* to it (no community contributions yet). PMF is a Phase 2–3 question, not a Phase 1 claim.

**The honest PMF call:** Motomap has clear *problem–solution fit* and unclear *product–market fit*. The plan does not assume PMF. It is structured to find it.

### 2.2 Target User Segment

Avoid the temptation to position as "200M Indian riders". That is a TAM number, not a wedge. The wedge is narrower:

**Primary wedge — Enthusiast Riders (Year 1):**
- Age 22–35, urban Tier 1 / Tier 2, smartphone-native
- Owns one of: Royal Enfield Classic 350 / Meteor 350, KTM Duke 200/250/390, TVS Apache RTR series, Bajaj Pulsar NS/RS series, Honda CB350
- Engaged in at least one bike community (FB group, Reddit, WhatsApp owners group, YouTube subscriptions)
- Annual income ₹4L+; spends ₹3,000–₹10,000/yr on bike maintenance and accessories
- Already pays for: Strava Premium, Spotify, OTT — has discretionary digital spend
- Pain: wants to understand their bike beyond "take it to service centre"

This segment is high-LTV, vocal, and self-clustered. It is also where the visual anatomy map and community contribution loops will get their first signal.

**Adjacent segments (Year 2+):**
- *Daily commuter riders* (Hero Splendor, Honda Shine) — much larger but lower willingness to pay; reached through mechanic finder and free-tier mode
- *Independent mechanics in unorganised garages* — flip-side B2B opportunity (reverse marketplace: mechanics use Motomap to look up parts for bikes they rarely service)
- *Used-bike buyers* — pre-purchase inspection use case; high intent, low frequency

**Do not target in Year 1:** premium-only brands (Triumph, BMW, Ducati), iOS-first markets, fleet owners.

### 2.3 Competitive Landscape

| Competitor | Type | Strength | Why Motomap wins |
|---|---|---|---|
| **YouTube creators** (Motovlog India, IndianAutosBlog, individual mechanics) | Video content | Free, trusted personalities, model coverage | Searchability, structured safety triage, no scrubbing through 12-min videos for a 30-second answer |
| **Reddit / FB groups** | Community forums | Real answers from real riders | Latency (days to a response) and unstructured. Motomap surfaces answers instantly with safety-graded confidence |
| **MotoDoctor** | AI diagnosis app | First-mover in photo diagnosis | Not India-focused, no anatomy graph, no community layer, no DIY guides |
| **TOPDON / OBD scanners** | Hardware | Deep diagnostic depth | Requires ₹3–10k hardware purchase, premium brands only, not consumer-facing |
| **Motorcycle Manuals (PDF libraries)** | Static content | Comprehensive | Unsearchable, no AI, no community, no India focus |
| **Service centre apps** (TVS Connect, RE app) | Brand-owned | Bundled with bike purchase | Single-brand, transactional (book service), not educational. Opportunity: white-label Motomap content to brands |

**Indirect competitors to respect:**
- *Google + ChatGPT*: a rider can ask GPT "my Pulsar 150 makes a clicking sound at 60kmph, what's wrong?" today. Motomap's defensibility is the *structured, India-specific, model-year-versioned* dataset and the visual anatomy graph — neither of which GPT has at retrieval time.
- *WhatsApp mechanic groups*: many riders have a personal mechanic on speed-dial. Motomap is most valuable when that mechanic is unavailable, expensive, or untrusted.

**Defensibility moat over time:**
1. **Data**: the anatomy graph and approved community contributions are a proprietary content asset. Each bike documented compounds value.
2. **Brand**: "the Motomap of [bike]" trust signal among enthusiasts.
3. **Expert reviewer network**: hard to replicate volunteer + paid expert layer once established.
4. **Fine-tuned diagnosis model**: every diagnosis builds the dataset for a specialist vision model that will out-perform general LLMs at this task by Year 2.

### 2.4 Unique Value Proposition

**One-line UVP:** "Know your bike. Diagnose any problem. Fix what you can. All in your language — built for Indian roads."

**Three-pillar UVP:**

1. **Anatomy you can see** — interactive visual map of *your exact bike, your exact year*, with safety-tiered failure consequences for every component. Nothing else in the Indian market offers this.
2. **A diagnosis you can trust** — snap a photo, get a confidence-scored answer with explicit safety triage. The product is engineered to refuse a definitive answer when it isn't sure, which is the opposite of how Google and YouTube behave.
3. **A community that's reviewed** — community-contributed, but every safety-tagged entry passes through an Expert Reviewer. Wikipedia's reach, iFixit's quality gate, applied to Indian two-wheelers.

### 2.5 Monetisation Model

**Recommendation: Freemium subscription first, marketplace second, B2B third.** This is the order the PRD already proposes; the plan below sharpens the pricing and pacing.

| Stream | Pricing | Phase | Rationale |
|---|---|---|---|
| **Motomap Free** | ₹0 — anatomy map, 5 AI diagnoses/month, 2 DIY guides/bike | Day 1 | Acquisition fuel; vital for content contribution loop |
| **Motomap Pro** | ₹149/month or ₹999/year (early-bird ₹699/year for first 1,000 subscribers) | Phase 1 launch | Unlimited diagnosis (rate-limited 50/mo), full DIY library, offline anatomy maps, push reminders, no ads |
| **Mechanic Marketplace** | ₹500–2,000/mo per featured listing + ₹50/qualified lead | Phase 2 | Verified mechanic directory, paid placement, lead-gen to garages |
| **Parts Affiliate** | ~5–8% commission via Boodmo, Amazon | Phase 2 | Passive revenue; trigger from part-detail pages |
| **Brand Partnerships** | ₹15–30L per brand per year for verified content slot + co-branded campaigns | Phase 3 | TVS, RE, Bajaj, KTM — slot for OEM-verified content + product placements |
| **Insurance Referral** | ₹500–1,500 CPA via Acko, Turtlemint | Phase 3 | Triggered from bike garage entry; high margin, low frequency |

**Why subscription leads:** it is the only stream that compounds independently of network effects. Marketplaces need scale on both sides; brand deals have multi-quarter sales cycles. Subscription is the one number that proves PMF binarily — if 5% of users won't pay, no other monetisation will save it.

**Why ads are excluded:** ads on a safety-critical content platform corrode trust. The platform's core promise is that you're being told the truth about your bike. An ad for "₹99 service deal!" next to a STOP-severity warning destroys that promise. Excluded permanently.

**Pricing logic for ₹149/month:** below the YouTube Premium threshold (₹169), inside the Strava/Notion personal range, comparable to OTT mid-tier (Hotstar Mobile). Anchors as "less than half a tank of petrol per month" in the pitch. ₹999/yr discount drives annual conversion (and cash flow).

### 2.6 Critical Assumptions to Validate Before Scaling

Six assumptions gate the decision to spend on growth. Each has a clear test and an exit criterion.

| # | Assumption | Test | Exit criterion |
|---|---|---|---|
| A1 | Riders will pay ₹149/mo or ₹999/yr for Pro | Run paywall on 500 closed-beta users for 30 days | ≥5% free→paid conversion |
| A2 | AI diagnosis is accurate ≥80% on real-world photos | Benchmark on 200 user-submitted diagnosis photos, expert-labelled | ≥75% top-1 part-name accuracy AND ≥90% correct risk-tier |
| A3 | Expert reviewers will volunteer/work-for-cheap at scale | Recruit 15 reviewers from RE/KTM clubs and YouTube; track review throughput | ≥15 active reviewers, ≥10 reviews/reviewer/month for 8 consecutive weeks |
| A4 | Community will contribute ≥5 quality submissions/week unincentivised | Open contributor portal to closed beta, no monetary incentive | ≥5 approved contributions/week sustained for 6 weeks |
| A5 | Community seeding converts to installs at ≥5% | Track FB/Reddit/forum posts → app installs via tagged links | ≥5% click-to-install conversion across 3 channels |
| A6 | Visual anatomy map drives retention more than a sorted list | A/B test list-vs-visual on closed beta; measure D7 retention | Visual variant ≥1.3x D7 retention of list variant |

Any A1–A4 failing forces a re-pricing, re-scoping, or pivot before Phase 3 spend. The plan explicitly does not commit Phase 3 budget until A1, A2, A3 pass.

---

## 3. Startup Readiness Document

### 3.1 Refined Product Vision

> **Motomap is the source of truth for every motorcycle on Indian roads.**
>
> A rider can look up *any* part of *any* bike sold in India, understand what it does and what happens if it fails, get a trusted AI diagnosis from a photo in seconds, and follow a vernacular DIY guide to fix it themselves — or find a verified mechanic who can. The content is community-built, expert-reviewed, and free for riders to read. The platform monetises through subscription, marketplace, and OEM partnerships.
>
> In five years, when a Hero Splendor owner in Coimbatore hears an unfamiliar sound, the first thing they do is open Motomap — the same reflex that today opens Google.

This vision narrows the prototype's ambition slightly: the product is a *knowledge utility* first, a *marketplace and diagnostic tool* second. Marketplace and AI are how the utility monetises and stays magical, not what the brand stands for.

### 3.2 Prototype → MVP Gap Analysis

The prototype is functional but not market-ready. Gaps are graded against three lenses: *user trust*, *commercial readiness*, *operational readiness*.

**Trust gaps:**
- Anatomy "map" is a risk-sorted list, not a visual diagram. Breaks the core demo and the most differentiated pillar. **BLOCKER.**
- Diagnose flow gates camera behind auth. First-time friction kills conversion from "try the magic" moment. **HIGH.**
- No offline fallback when API is unreachable. App appears broken on patchy networks (most of India). **HIGH.**
- No vernacular UI. Pitch claims Tamil/Hindi 3x addressable user base; product has zero. **MED (post-MVP acceptable).**
- AI diagnosis accuracy unmeasured. Cannot claim accuracy in pitch without benchmark. **HIGH.**

**Commercial gaps:**
- No paywall, no payment integration, no SKU defined in product. **BLOCKER for revenue.**
- No analytics, no funnel tracking. Cannot measure conversion or retention. **BLOCKER.**
- No app store listing, no Play Console account, no signing keys. **BLOCKER for distribution.**
- No privacy policy, no terms of service, no content licence. **BLOCKER for Play Store submission.**
- No referral / sharing mechanism. **MED.**

**Operational gaps:**
- Clerk → backend JWT bridge uses `userId` as password. Security blocker; cannot ship to prod. **BLOCKER.**
- No production deployment. Local Docker only. **BLOCKER.**
- No crash reporting, no error monitoring. **HIGH.**
- No CI/CD; manual deploy only. **MED.**
- No content licence for community submissions (need explicit IP grant on submit). **HIGH (legal).**
- No expert reviewer recruitment pipeline. **HIGH.**
- Default DB credentials in `docker-compose.yml`. **MED (prod override required).**
- CORS hardcoded to `localhost:3000`. **LOW (fix in deploy config).**

**Content gaps:**
- 3 bikes seeded, 3 DIY guides total. PRD vision needs ≥5 bikes and ≥10 guides/bike for MVP credibility. **MED.**
- No visual anatomy assets (SVG hotspot overlays per bike). **HIGH — couples to visual map blocker.**
- No model-year variation handling tested (Pulsar 150 2018 vs 2023 differs). **MED.**

**Net call:** the prototype is ~40% of the way to MVP. The visual anatomy map and the security/payment/deploy plumbing are the long poles. With focused execution, the gap is 8 weeks of one engineer + one designer + one content lead.

### 3.3 Prioritised Feature Backlog

Grouped by phase, prioritised within each phase. Each item has a one-line definition of done.

**P0 — Required for MVP / Phase 1 launch:**

1. *Visual interactive anatomy map* — SVG hotspot overlay on a bike side-profile illustration; tap a region to see the part list for that system. Ship for 1 flagship bike (RE Classic 350) at MVP; expand to all 3 in Phase 2.
2. *Replace Clerk JWT bridge with `@clerk/backend verifyToken`* — server validates Clerk session token; no userId-as-password.
3. *Diagnose: camera-first, auth-on-submit* — show camera and capture immediately; gate auth only when user taps "Diagnose".
4. *Offline / error fallback* — show cached anatomy data with "offline" badge when API unreachable; retry button on errors.
5. *Razorpay subscription integration* — ₹149/mo and ₹999/yr SKUs; webhook → backend subscription status; gated features check subscription.
6. *Onboarding flow* — first-launch: pick your bike → save to garage → tour the anatomy map.
7. *Production deployment on Railway* — managed Postgres + Redis + FastAPI; staging + prod environments; env-specific CORS.
8. *Analytics (PostHog) + crash reporting (Sentry)* — funnel events for install → bike-selected → first-diagnosis → paywall-view → subscribe.
9. *Privacy policy + Terms of Service + Content Licence* — legal review; Play Store compliant.
10. *Play Store listing (closed alpha track)* — signed AAB, store listing assets, content rating, data safety section.
11. *Diagnosis accuracy benchmark* — 50-photo gold-set, expert-labelled; ≥75% top-1 part-name accuracy required to ship.
12. *Rate limiting on `/diagnose`* — 5/day free tier, 50/month Pro tier; enforced server-side.

**P1 — Required for Phase 2 (Closed Beta):**

13. Visual anatomy for all 3 Phase 1 bikes
14. Tamil + Hindi UI strings (top 50 strings + part names for top 20 parts)
15. Mechanic finder (verified directory; 50 mechanics across Chennai + Bangalore + Hyderabad)
16. 10 DIY guides per bike (30 total) — chain cleaning, air filter, brake fluid, battery, coolant, spark plug, throttle cable, clutch cable, suspension preload, headlight bulb
17. Expert reviewer recruitment pipeline + review rubric + reviewer dashboard polish
18. Push notifications (service reminders by mileage/time, new guide for your bike)
19. Referral program (1 month Pro free for inviter and invitee)
20. Community contribution loop in mobile app (currently web-only)
21. In-app feedback widget (NPS + freeform)

**P2 — Required for Phase 3 (Public Launch):**

22. 2 more bikes seeded (Hero Splendor+ and KTM Duke 200) with visual anatomy
23. Spare parts affiliate integration (Boodmo + Amazon)
24. Brand official accounts (verified-badge content from OEMs)
25. iOS app (Expo build, same codebase)
26. App Store Optimisation (Play Store screenshots, video, keyword research)
27. Bike garage history (service log, expense tracker)
28. Public marketing site (Next.js, SEO-optimised, indexed part pages — vast SEO surface)

**P3 — Scale (Phase 4):**

29. Telugu + Marathi + Bengali UI
30. B2B brand integration product (white-label content widget for TVS/RE apps)
31. Fine-tuned vision diagnosis model (on accumulated diagnosis dataset)
32. Insurance referral integration (Acko, Turtlemint)
33. Public API beta (rate-limited, paid tier)
34. OBD hardware partnership (TopScan integration)
35. Community translator tier and incentives

### 3.4 Technical Architecture Recommendations

**Keep the current stack.** FastAPI + Next.js + React Native (Expo) + PostgreSQL/pgvector + Redis + Cloudflare R2 + Claude API is the right stack for this product, this market, and this team size. No re-platform needed. The PRD's choices have aged well in execution.

**Critical near-term changes:**

1. **Auth security (P0):** rip out the Clerk userId-as-password bridge. Replace with `@clerk/backend`'s `verifyToken` on the FastAPI side — mobile app and contributor portal both send the Clerk session JWT in `Authorization: Bearer`; backend verifies signature against Clerk's JWKS, extracts `sub` (Clerk userId), upserts the corresponding backend user. No password ever crosses the wire.

2. **Deployment topology (P0):** Railway for everything up to ~10k MAU. Single-region (Mumbai or Singapore for India latency). Two environments: `staging` (auto-deploy from `main`) and `prod` (manual promote). Managed Postgres + Redis. Cloudflare in front of R2 for CDN. Total infra cost target: ₹15–25k/month at MVP, ₹40–60k/month at 10k MAU.

3. **AWS migration trigger:** do NOT migrate to ECS preemptively. Trigger conditions: (a) Railway monthly cost >₹1.5L, OR (b) >50k MAU sustained for 90 days, OR (c) compliance requirement (e.g., enterprise brand contract requires VPC). Until then, Railway saves 4+ weeks of DevOps work and is operationally adequate.

4. **Claude API cost control (P0):** diagnosis will dominate variable cost. Mitigations:
   - Per-user rate limits (5/mo free, 50/mo Pro) — enforced in middleware, not just frontend
   - Aggressive image downscaling before sending to Claude (target ≤1024px longest edge; ~70% token reduction)
   - Cache identical-image hashes for 24h (low hit rate but free wins)
   - Set monthly Anthropic budget alert at ₹50k; hard cap at ₹1L until paid base supports more
   - Move embeddings entirely to local `fastembed` (already done — keep it)

5. **Analytics architecture (P0):** PostHog self-hosted on Railway OR PostHog Cloud free tier (1M events/mo). Event taxonomy: `bike_selected`, `anatomy_part_viewed`, `diagnosis_started`, `diagnosis_completed`, `paywall_viewed`, `subscription_started`, `dry_guide_step_completed`. Funnel: install → bike_selected → first_diagnosis → paywall_view → subscribe.

6. **Image pipeline (P1):** anatomy diagrams and DIY photos must be served from a CDN with on-the-fly resizing. Cloudflare R2 + Cloudflare Image Transformations is cheapest for India egress. Avoid AWS S3 + CloudFront unless multi-region needed (it isn't, yet).

7. **Versioning the anatomy graph (P1):** when a contribution updates a part, write a new `parts_version` row; do not mutate. Mobile app queries always include `?version=current` and Redis-cache the resolved version per (bike_id, version) pair. This makes the Wikipedia-style edit history performant.

8. **i18n architecture (P1):** use `i18next` for the React Native app and Next.js portal; use a `translations` table in Postgres for content strings (part names, function text, failure consequences) keyed by `(content_id, locale)`. Do NOT translate at request time via LLM — translate once at publish-time, store the result, expert-review the translation. Latency and consistency both matter.

9. **Mobile build & release (P0):** EAS Build for Android AAB; EAS Submit for Play Store. Internal testing track from Phase 1, closed beta from Phase 2, production from Phase 3. OTA updates via EAS Update for non-native JS changes — ship UI fixes daily without store review.

10. **Observability minimum (P0):** Sentry for crashes (mobile + backend), Logtail or Better Stack for structured logs, Railway built-in metrics for infra. Uptime monitoring via UptimeRobot (free) on `/health`.

**Architectural debt to monitor (acceptable for now):**
- sync `boto3` wrapped in executors instead of `aioboto3` — fine until R2 throughput becomes a bottleneck
- FastAPI single-process Railway dyno — fine until ~500 req/min sustained; then scale out
- PostgreSQL single instance — add a read replica only when query latency on `/bikes/{id}/parts` exceeds p95 200ms

**Architectural decisions to defer:**
- Microservices split — no. Stay monolithic until ≥3 engineers full-time.
- Self-hosted Anthropic alternative (open-weights model) — no. Claude vision quality is the moat; cost is controllable.
- GraphQL — no. REST is sufficient and lower complexity.
- Native Android / iOS rewrite — no. RN is fine; the bottleneck is content, not framework.

### 3.5 Team & Hiring Needs

**Current (Pre-MVP, May 2026):** 1 founder (you), Claude Code as the engineering workforce, no other paid headcount. This is correct for the prototype stage and should not change until paid validation arrives.

**Phase 1 hires (MVP build, June–July 2026):**
- *Designer (contract, 4–6 weeks, ₹1.5–2.5L total)* — visual anatomy map UI, app polish, store listing assets. One sprint, scoped output, no ongoing retainer.
- *Content Lead (contract, ₹40–60k/mo, 3-month minimum)* — sources service manuals, deep-seeds RE Classic 350 to flagship quality, drafts 10 DIY guides per bike, recruits first 5 expert reviewers. Likely candidate: a former mechanic, automotive journalist, or motorcycle YouTuber.

**Phase 2 hires (Closed Beta, August–September 2026):**
- *Mobile Engineer (full-time, ₹15–25 LPA equity-heavy)* — React Native specialist; owns mobile app from this point. Frees founder to focus on backend, AI, and GTM.
- *Community / Content Manager (full-time or part-time, ₹6–12 LPA)* — runs expert reviewer program, moderates contributions, seeds in communities. Likely a young enthusiast with social-media skill, not a senior product person.

**Phase 3 hires (Public Launch, October–December 2026):**
- *Business / GTM Co-founder (equity, no salary or token salary)* — BD with mechanics and brands, partnerships, fundraising, ops. Critical hire. Should join before Phase 3 spend, ideally identified in Phase 2.
- *Expert Reviewer Leads (paid retainer, 2 people × ₹10–15k/mo)* — senior mechanics or engineers who anchor the reviewer network and handle escalations. Convert top volunteer reviewers from Phase 2.

**Phase 4 hires (Scale, 2027):**
- 2nd Backend Engineer, 1 Data/ML Engineer (for fine-tuned model), 1 BD/Partnerships hire, 1 Customer Support, Designer FT, Content Lead → FT.

**Total Y1 headcount (Dec 2026):** 4 full-time (founder + GTM co-founder + Mobile Eng + Community Manager) + 2–3 contractors + retainers. Lean, intentional.

**What NOT to hire in Year 1:** CTO (you are it), Head of Marketing (you and GTM co-founder), Data Scientist (the data isn't there yet), Customer Success (the user base isn't there yet), Office Manager / HR (4 people don't need it).

### 3.6 Investor-Ready Framing

**Elevator pitch (30 seconds):**

> Motomap is India's first interactive motorcycle knowledge and AI diagnostic platform — Wikipedia meets iFixit, built for the 200 million two-wheelers on Indian roads. Riders snap a photo of a problem, get a model-specific diagnosis in seconds, and follow trusted DIY guides in their own language. We monetise through a ₹149/month subscription, a verified mechanic marketplace, and OEM brand partnerships — in a market where 85% of servicing happens at unorganised garages and riders have no trusted way to know what's wrong with their bike.

**Traction narrative (90 seconds):**

> We built the full prototype in seven multi-agent build sessions over four weeks — FastAPI backend, Next.js contributor portal, React Native rider app, real Claude vision-based diagnosis, three flagship bikes seeded with 84 parts and 101 anatomy graph edges. All three core flows work end-to-end. The product was built by one founder using Anthropic's agentic development stack — proof of capital efficiency before we've raised a rupee.
>
> Demand evidence: every bike enthusiast community we've spoken to — RE Owners Club, KTM India chapters, r/IndianBikers — has the exact use case we solve, hundreds of times a day, with no structured tool. The community pain is already monetised by mechanics overcharging riders who can't describe what's wrong. We are about to enter closed beta with 500 riders to validate paid conversion and diagnosis accuracy on real photos.

**Growth potential (the market math):**

> India sells 20 million two-wheelers a year and has 200 million on the road. Even 0.1% paid penetration is 200,000 subscribers; at ₹999/year that's ₹20 Cr ARR from subscription alone. Mechanic marketplace TAM is conservatively ₹2,000+ Cr per year. Vernacular language coverage (Tamil, Hindi, Telugu, Marathi) unlocks 3x the addressable base. Long-term, OEM partnerships with TVS, RE, Bajaj, and Hero are an additional ₹50–200 Cr opportunity as the platform becomes the de facto knowledge layer for Indian motorcycling.
>
> Year 1 target: 10,000 MAU, ₹2L MRR, 1 signed brand LOI.
> Year 2 target: 100,000 MAU, ₹2.4 Cr ARR, 2 paid brand contracts — Series A readiness.

**The Ask:**

> Pre-seed of ₹1.5–2 Cr ($180k–240k) for a 12-month runway. Use of funds: 60% engineering and product (mobile engineer, designer contract, infrastructure), 20% content and community (content lead, expert reviewer retainers, seeding), 15% GTM (acquisition test budget, brand partnership pursuit), 5% legal and compliance (privacy, content licensing, Play Store, payment processor onboarding).
>
> Milestones unlocked by this round: MVP shipped on Play Store, 10,000 MAU, ₹2L MRR, 5 bikes covered with visual anatomy and Tamil/Hindi UI, 1 OEM letter of intent. Sufficient to raise a ₹6–10 Cr seed round at a 5x mark-up by Q1 2027.

**Why this team (founder narrative):**

> Solo technical founder with a track record of shipping production product (AR Inventory System v2 — full-stack rewrite for Indian SMB market, monetisation-ready). Built Motomap's full prototype solo in four weeks using Anthropic's agentic stack — demonstrates an unfair build velocity. Father runs a shop; first-hand exposure to the Indian SMB and consumer realities the product serves. Actively recruiting GTM co-founder.

**Risks I am pre-empting in the room:**

> "Will Indians pay for software?" — Phase 2 of the plan exists to answer this with real conversion data before we spend on growth. If they won't, we kill the product before raising bigger.
>
> "Can community moderation scale?" — Expert reviewer program is structured and incentivised; the worst case is we run the review queue in-house at low cost.
>
> "What if Google or an OEM builds this?" — Google won't (no India-specific moat motivation); OEMs build closed, single-brand apps and have never delivered a cross-brand consumer experience. Our defensibility is content depth and community trust, not technology.

---

## 4. Execution Plan

### 4.1 Phase 1 — Prototype → MVP

**Window:** Weeks 1–8 (June–July 2026)
**Goal:** Production-ready MVP shipped to Play Store closed alpha. Diagnosis accuracy benchmarked. Paywall live. Single flagship bike (RE Classic 350) at demo quality.

**Key deliverables:**
- Visual interactive anatomy map for RE Classic 350
- `@clerk/backend verifyToken` auth migration complete
- Diagnose: camera-first UX, offline retry states, error handling
- Razorpay integration: ₹149/mo and ₹999/yr SKUs live
- Onboarding flow + bike garage save
- Production deploy on Railway (staging + prod)
- PostHog analytics + Sentry crash reporting wired end-to-end
- Privacy policy, Terms of Service, content licence published
- Play Store closed alpha listing with assets
- Diagnosis benchmark: 50-photo gold set, ≥75% accuracy verified
- Server-side rate limits on `/diagnose`

**Success metrics:**
- 100% of P0 backlog shipped
- Diagnosis top-1 accuracy ≥75% on 50-photo benchmark; risk-tier accuracy ≥90%
- App cold-start <2.5s on Snapdragon 680
- Crash-free sessions >99% over the last 7 days
- 50 closed-alpha installs from founder's network

**Owners:**
- Founder — engineering, product, ASO, expert reviewer recruitment
- Designer (contract) — anatomy map UI, app polish, store assets
- Content Lead (contract) — RE Classic 350 deep-seeding, 10 DIY guides, reviewer recruitment

**Estimated timeline:** 8 weeks. Slip budget: 2 weeks (allow Phase 1 to extend to 10 weeks before triggering scope cut).

**Phase 1 risks and mitigations:**

| Risk | Probability | Mitigation |
|---|---|---|
| Visual anatomy map UI takes >3 weeks | High | Ship simplest viable: SVG hotspot overlay on a side-profile illustration; defer 3D rendering / pan-zoom polish to Phase 2 |
| Razorpay merchant onboarding takes 3+ weeks | Medium | Start KYC submission Day 1 of Phase 1; parallelise with other work |
| Diagnosis accuracy <75% on real photos | Medium | Tune prompt with bike-context priming; expand seed parts; if still <75%, expand benchmark to 100 photos and triage failure modes; ship with stricter confidence threshold (raise from 0.6 to 0.7) |
| Designer ghosts mid-sprint | Low–Med | Contract with milestone-based payments; have a backup designer in pipeline |
| Play Store rejection (content rating, data safety, privacy) | Medium | Submit listing for review in Week 6, not Week 8, to leave buffer for revisions |

**Phase 1 exit criteria (gate to Phase 2):**
- All P0 deliverables shipped to Play Store closed alpha
- Diagnosis benchmark passed
- Paywall functional end-to-end (test transaction at ₹1 verified)
- 50 closed-alpha users acquired with consent for feedback
- No P0/P1 Sentry crashes in the last 7 days

If any exit criterion is missed, Phase 2 does not start. Extend Phase 1 by up to 2 weeks; if still not met, escalate scope cut decision.

### 4.2 Phase 2 — MVP → Closed Beta

**Window:** Weeks 9–16 (August–September 2026)
**Goal:** 500 active riders. First paid conversion data. Expert reviewer network operational. Two more bikes at parity.

**Key deliverables:**
- Visual anatomy for Pulsar 150 and Apache RTR 160 4V
- Tamil + Hindi UI strings for top 50 strings and top 20 part names per bike
- Mechanic finder MVP: 50 verified mechanics across Chennai + Bangalore + Hyderabad
- 10 DIY guides per bike (30 total)
- Expert reviewer program live: 15 active reviewers, paid retainer for top 2
- Referral program: 1 month free for inviter and invitee
- Push notifications (Expo + FCM): service reminders, new guide alerts
- Community contribution from mobile app (camera + form, syncs to portal)
- In-app feedback widget (NPS + freeform)
- Community seeding: 10 posts/week across RE FB groups, r/IndianBikers, KTM India WhatsApp, Chennai/Bangalore enthusiast forums

**Success metrics:**
- 500 closed-beta installs; 250 weekly active users; 100 D30 retained
- ≥5% free→paid conversion within 14 days (≥25 paid users, ₹3,750+ MRR)
- ≥7,500 MRR if upper-end conversion achieved
- Diagnosis NPS ≥40
- ≥5 expert-approved community contributions per week sustained for ≥6 weeks
- ≥15 active expert reviewers, ≥10 reviews/reviewer/month
- App Play Store rating ≥4.3

**Owners:**
- Founder — product, backend, AI, paid conversion experiments
- Mobile Engineer (full-time hire Week 9) — anatomy expansion, push, offline, polish
- Content Lead (continuing contract) — additional bike seeding, DIY guide expansion
- Community Manager (hire Week 11) — reviewer program, community seeding, support

**Estimated timeline:** 8 weeks. Slip budget: 2 weeks.

**Phase 2 risks and mitigations:**

| Risk | Probability | Mitigation |
|---|---|---|
| Free→paid conversion <3% | High | A/B test paywall placement (post-first-diagnosis vs day-3 vs feature-gated); add 7-day free trial; lower price to ₹99/mo for cohort test |
| Expert reviewers burn out / churn | Medium | Move 2 top reviewers to paid retainer immediately; weekly check-ins; reviewer-only Slack |
| Community contributions <5/week | Medium | Direct outreach to top forum posters with personalised contribution requests; raise the badge incentive prominence; founder seeds first 20 contributions to set quality bar |
| Mobile Engineer ramp slower than 4 weeks | Medium | Onboard with pair-programming first 2 weeks; founder remains on mobile critical-path code through ramp |
| Diagnosis cost spike from increased usage | Medium | Monthly Anthropic budget hard cap at ₹1L; cohort-throttle if exceeded; renegotiate if scaling demonstrably |
| Mechanic finder listings are stale / low-quality | High | Manually vet first 50; require photo of shop + verification call; refresh quarterly |

**Phase 2 exit criteria (gate to Phase 3):**
- ≥5% free→paid conversion achieved (A1 validated)
- Diagnosis accuracy benchmark re-run at 200 photos, ≥75% accuracy maintained (A2 validated)
- ≥15 active expert reviewers sustained for ≥8 weeks (A3 validated)
- ≥5 contributions/week sustained for ≥6 weeks (A4 validated)
- 500 installs achieved with ≥5% community-to-install conversion (A5 validated)
- Visual anatomy A/B test result available (A6)
- ₹3,750+ MRR

If A1 (paid conversion) fails: do not proceed to Phase 3. Re-test pricing and packaging for 30 days. If still failing, fundamental thesis re-examination.
If A2 (diagnosis accuracy) fails: invest 2 weeks in prompt engineering, model selection (test Sonnet vs Opus), and seed expansion before proceeding.
If A3/A4 fail: re-scope to founder-led content for Phase 3; revisit community model.

### 4.3 Phase 3 — Beta → Public Launch

**Window:** Weeks 17–28 (October–December 2026)
**Goal:** 10,000 MAU, ₹2L MRR, 1 signed brand LOI, public Play Store launch.

**Key deliverables:**
- Hero Splendor+ and KTM Duke 200 seeded with visual anatomy
- Spare parts affiliate live (Boodmo primary, Amazon secondary)
- Brand partnership pitch deck + active pursuit of 5 OEMs (TVS, RE, Bajaj, Hero, KTM); target 1 signed LOI
- Public Play Store launch with full ASO (screenshots, video preview, A/B-tested icon and title)
- iOS app via EAS Build (parity with Android, no iOS-exclusive features)
- PR push: pitches to YourStory, Inc42, Moneycontrol Startup, Autocar India, BikeWale
- Influencer seeding: barter and paid relationships with 5 motorcycle YouTubers (target: Motovlog India, IndianAutosBlog, Powerdrift's bike content, regional Tamil + Hindi creators)
- Push notification campaigns: service reminders, new bike additions, new guides
- Public marketing site (Next.js, SEO-optimised) with per-part indexable pages (massive long-tail SEO surface)
- Customer support tooling: in-app Intercom or Chatwoot; published help centre

**Success metrics:**
- 10,000 MAU; 3,000 weekly active; 1,500 D30 retained
- 1,200 paid subscribers; ₹2L MRR (₹24L ARR run-rate)
- ≥1 signed OEM letter of intent
- CAC <₹80 organic, <₹250 paid
- Play Store rating ≥4.4
- App featured on Play Store "New Apps We Love India" or equivalent (stretch)
- Diagnosis accuracy ≥80% on 500-photo benchmark
- 100+ approved community contributions across all bikes

**Owners:**
- Founder — product strategy, brand BD, fundraising prep
- Business / GTM Co-founder (hire by Week 18) — brand deals, mechanic partnerships, ops, fundraising
- Mobile Engineer — iOS parity, performance, ASO experiments
- Community / Content Manager — community growth, reviewer program scale
- BD / Partnerships (hire Week 22) — mechanic acquisition, affiliate management

**Estimated timeline:** 12 weeks. Slip budget: 4 weeks. Public launch can slip to mid-January 2027 without major harm.

**Phase 3 risks and mitigations:**

| Risk | Probability | Mitigation |
|---|---|---|
| Public Play Store launch has low organic velocity | High | Budget ₹3–5L for paid acquisition (Google App Campaigns + Meta) Week 22 onward; influencer barter deals pre-launch; PR-timed launch week |
| Brand deal cycle exceeds Phase 3 window | High | Pursue 5 brands in parallel; LOI (not contract) is the goal; have a verified-account product spec ready so brand integration is days, not months |
| Paid acquisition CAC exceeds ₹400 | Medium | Pull paid spend immediately; double down on community + influencer; revisit creative |
| iOS submission rejected | Medium | Apple review history shows India consumer apps pass cleanly with proper privacy disclosures; budget 2-week buffer; submit Week 22 not Week 28 |
| Support load exceeds team capacity | Medium | Public help centre, in-app FAQ, NPS-triggered survey replacing 1:1 support for low-NPS users; community-driven peer support in app |
| OEM exclusivity demanded as condition of partnership | Medium | Reject exclusivity in Phase 3; keep all 5 conversations alive; only consider exclusivity if value exceeds 12x non-exclusive equivalent |

**Phase 3 exit criteria (gate to Phase 4 / Series A prep):**
- 10,000 MAU achieved and sustained for ≥4 weeks
- ₹2L MRR achieved
- ≥1 OEM LOI signed
- CAC:LTV ratio ≥1:3 (assume LTV from observed retention curves)
- Default-alive runway extended to 18+ months on current burn

### 4.4 Phase 4 — Launch → Scale (Series A Readiness)

**Window:** Q1 2027 onward (12-month horizon)
**Goal:** 100,000 MAU, ₹20L MRR (₹2.4 Cr ARR), 2 paid OEM contracts, fine-tuned diagnosis model live, Series A round closed.

**Key deliverables:**
- 10-bike catalogue at visual anatomy parity (add Honda CB350, Bajaj Pulsar NS200, Yamaha FZ, Hero Xtreme, RE Meteor 350, Apache RTR 200 4V, KTM Duke 390)
- Telugu + Marathi + Bengali UI
- B2B brand integration product (white-label content widget; verified content slot in TVS Connect / RE app)
- Fine-tuned vision diagnosis model (specialist model on 10k+ accumulated diagnoses; replaces or augments Claude for common diagnoses; falls back to Claude for novel cases)
- Insurance referral integration live (Acko + Turtlemint)
- Public API beta (paid tier; rate-limited)
- OBD hardware partnership conversations (TopScan, India OBD vendors)
- Series A pitch: target ₹6–10 Cr at ₹40–60 Cr post-money

**Success metrics:**
- 100,000 MAU; 30,000 weekly active; 15,000 D30 retained
- 8,000 paid subscribers (8% conversion); ₹20L MRR; ₹2.4 Cr ARR run-rate
- 2 paid OEM brand contracts (₹15–30L/year each)
- Diagnosis accuracy ≥85% on 1,000-photo benchmark (specialist model)
- Mechanic marketplace: 1,000 verified listings across top 10 cities, ₹5L/mo marketplace revenue
- Affiliate revenue: ₹3L/mo
- Net dollar retention >95% (subscription churn manageable)

**Owners:**
- Founder + GTM Co-founder + 6–8 person team
- Specialist hires layered in throughout the phase (Backend #2, Data/ML, BD/Partnerships, Customer Support, FT Designer, FT Content Lead)

**Estimated timeline:** 12 months. Series A round target: Q4 2027.

**Phase 4 risks and mitigations:**

| Risk | Probability | Mitigation |
|---|---|---|
| Subscription churn higher than projected (>8%/mo) | Medium | Annual subscription push aggressively (₹999/yr cuts effective churn); engagement features (service reminders, garage log) drive sticky daily use |
| Series A market timing weak (India funding winter) | Medium | Maintain default-alive economics from Phase 3; only raise when terms reflect demonstrated traction; option to extend pre-seed/seed with insider round |
| Fine-tuned model under-performs Claude | Medium | Keep Claude as fallback; specialist model is a cost-reduction play, not a quality-improvement play; abandon if cost benefit <40% |
| OEM contract negotiation drags >9 months | High | Maintain 5 parallel conversations; structure contracts as pilots (₹3–5L for a 3-month trial) to reduce procurement friction |
| Competitor entry (well-funded mobility startup or Google/OEM build) | Medium | Defensibility moat: content depth, community trust, expert network; press the moat hard with content velocity in Phase 4; do not engage in feature war |
| Key-person risk concentrated on founder | High | GTM co-founder hire by Phase 3; document architecture and ops; ensure 2-person knowledge for every critical system by end of Phase 4 |

### 4.5 Cross-Phase Risks & Mitigations

Risks that span phases and require continuous attention:

| Risk | Continuous mitigation |
|---|---|
| **Safety failure (AI diagnosis produces unsafe call)** | Confidence threshold + STOP-severity override (already coded); expert review of any diagnosis flagged ≥3 times by users; published safety policy; insurance/liability review by lawyer before Phase 3 launch; conservative defaults always |
| **Content quality drift (community submissions are wrong/dangerous)** | Mandatory Expert Reviewer sign-off on safety-tagged content; reviewer track record scoring; version history for rollback; founder spot-checks weekly through Phase 2 |
| **Regulatory: data privacy (DPDP Act compliance)** | Privacy policy DPDP-aligned from Phase 1; user data minimisation; explicit consent for diagnosis photos; data deletion endpoint shipped Phase 2; legal review before public launch |
| **Regulatory: payment processor** | Razorpay onboarding Day 1; backup processor (PayU) evaluated before Phase 3 |
| **Operational: founder burnout** | Hard cap on personal hours per week; first hire (Mobile Engineer) is to reduce critical-path concentration, not just to add capacity; vacation taken between phases |
| **Brand: a publicised wrong-diagnosis incident** | Conservative confidence thresholds, mandatory mechanic prompts on STOP cases, explicit "this is not a substitute for a qualified mechanic" disclaimer surfaced in every diagnosis result; pre-drafted comms response plan |
| **Competitive: OEM builds own version** | Cross-brand neutrality is the moat; double down on community-led content velocity; pursue OEM partnerships proactively to make Motomap their platform of choice rather than build-vs-buy candidate |

---

## 5. Appendix — Capital Plan & Operating Cadence

### Capital Plan

**Pre-seed ask: ₹1.5–2 Cr (~$180k–240k) for 12-month runway.**

Allocation:

| Category | % | ₹ (on ₹2 Cr) | Notes |
|---|---|---|---|
| Engineering & Product | 60% | ₹1.2 Cr | Mobile Engineer (₹20L), founder salary (₹15L), designer contract (₹3L), infra (₹6L), tools/SaaS (₹2L), Claude API (₹6L), buffer (₹68L) |
| Content & Community | 20% | ₹40L | Content Lead (₹6L), Community Manager (₹8L), expert reviewer retainers (₹4L), community seeding tools (₹2L), content production (₹4L), buffer (₹16L) |
| GTM | 15% | ₹30L | Paid acquisition test budget (₹15L), influencer barter + paid (₹5L), PR (₹2L), brand partnership pursuit (travel, decks, ₹3L), ASO tooling (₹1L), buffer (₹4L) |
| Legal & Compliance | 5% | ₹10L | DPDP compliance review, content licence, ToS, payment processor onboarding, IP and trademark, incorporation, buffer |

Burn target: ₹15–18L/month at peak Phase 3. Default-alive criterion: 18 months runway before any growth spend acceleration.

**Series A target (Q4 2027): ₹6–10 Cr at ₹40–60 Cr post-money** on demonstrated traction of 100k MAU, ₹2.4 Cr ARR, 2 OEM contracts.

### Operating Cadence

- **Weekly:** founder + each direct report 30-min 1:1; team weekly stand-up (Monday); Friday metrics review (DAU, MRR, key funnel events)
- **Bi-weekly:** investor update email (concise: metrics, wins, asks, lowlights) — even pre-funding, to build the relationship
- **Monthly:** content roadmap review with Content Lead; OKR check-in; cash burn vs plan review
- **Quarterly:** strategy review (PMF signal, phase-gate assessment), advisor meetings, runway re-projection
- **Phase-gate:** at the end of each phase, formal go/no-go decision against documented exit criteria; do not proceed to next phase without explicit gate clearance

### Document Maintenance

This document is a living plan. Update cadence:
- Weekly: progress against current phase deliverables (in DEVLOG)
- Monthly: success metric tracking vs target (in this document, Section 4)
- Phase-end: revise Section 4 forward phases with learnings from completed phase
- Quarterly: revise Section 2 (Strategy) if market conditions change

---

*Motomap · Startup Elevation Plan · v1.0 · 2026-05-26 · Confidential*
