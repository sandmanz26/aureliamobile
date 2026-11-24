# Review of the backend Change Plan (18 Nov 2026)

**Reviewed:** `docs/api/2026-11-18-backend-change-plan.pdf`, "Aurelia Backend: Current APIs vs. the Backend API Plan" (16 pages), on 24 Nov 2026, from the engineering lead's point of view. It is read against:
- `docs/api/API-CONTRACT.md`;
- the B2B2C research (`/wiki/b2b2c`);
- the decision approved on 24 Nov 2026 to redesign the creator retreat.

## Verdict

**Approve the plan as an inventory. It is not yet an implementation plan.**

The gap analysis is good: it is honest, it goes route by route, it lists the defects it found, and it migrates in safe steps (`/v1` beside the old routes, removed router by router). It is the right base.

It cannot be started as written, for three reasons:
1. It builds the whole product, about 237 endpoints, before the first paid pilot.
2. It retires the payment pieces that the approved creator-retreat model needs.
3. It leaves out infrastructure, estimates, owners and a data-migration plan.

## What is good, keep it

- **Every route has a verdict** (port, piece, new, retire), and it is explicit that "✅ in the plan" means "in the contract", not "built".
- **PostgreSQL over MongoDB.** The coin ledger, build limits and payment webhooks need transactions and unique constraints. Agree.
- **A strangler migration.** `/v1` sits beside the old routes, and each old router goes once its screens move. Agree.
- **"Port does not mean unchanged"** (§6). The eight steps every ported endpoint needs are the right checklist.
- **The defect list** (§7), found by reading the code.
- **Reuse of the generation pipeline** (script, voice, music, image as queued jobs, with cost tracking). It is the most valuable asset.

## Must change before work starts

### 1. Hotfix the live defects now, if the old API is deployed anywhere
§7 lists:
- refund, cancel and card routes with no authentication;
- writes that trust a `user_id` sent by the caller;
- a WebSocket that accepts any user id.

If that API is reachable, anyone can refund payments or write as another user today. These are not porting tasks. **Confirm whether it is deployed.** If it is, take it offline or put auth on those routes this week.

### 2. Cut the build order to the pilot, not the whole product
- Phases P0–P4 build everything in the contract: community, challenges, coins, wallet, invites and all 22 admin modules, about 100 new admin endpoints.
- The business needs less, and sooner. Its next step is a paid pilot with 3–5 creators (`/wiki/b2b2c/plan`), which needs a **minimum backend**:
  - accounts;
  - payments with Aurelia as merchant of record;
  - consented storage of check-ins;
  - the core build-and-play loop;
  - crisis handling;
  - an aggregate creator dashboard.
- **Ask for a "Pilot slice" phase** after Foundation, containing only that. Community, economy (coins, challenges, invites) and most admin modules move after the pilot's results.

### 3. Do not retire what the creator retreat needs
The approved redesign (24 Nov) sells:
- a **one-off ticket** (€19.99 or €39);
- a **70/30 split paid to creators in money**, plus a share of the Plus revenue each cohort drives.

The plan retires the two pieces that would carry it:
- `generate-payment-intent` one-off payments, kept only as a piece for coins;
- **Stripe Connect creator payouts**, because "the plan pays creators in coins".

**Keep both.** Add new entities and endpoints:
- creator, cohort or retreat, enrolment, ticket order;
- payout ledger and split;
- cohort aggregate metrics with minimum group sizes.

Our own `API-CONTRACT.md` does not have these yet either. We update it first (see "Our side" below).

### 4. Safety and crisis handling belong in the core loop, not in P4
- The contract makes the safety layer mandatory on every text a person writes (§8.7: `unsafe_content`, `safety.flagged`).
- In the plan, safety events appear only as a "new" admin monitoring module in P4.
- Users type how they feel into free text, so crisis disclosures are certain. California SB 243 requires a suicide-prevention protocol.
- **Move it into P1:**
  - the safety check;
  - the crisis response and referral;
  - a safety-event log;
  - an escalation owner.

### 5. Add what an implementation plan needs

| Missing | What we need |
| --- | --- |
| Infrastructure | Where FastAPI, Postgres, Redis, the worker and the object store run; staging and production; secrets; backups; region (EU and Indonesia data) |
| Migrations | A tool (for example Alembic), and seed data for the taxonomy |
| Data migration | Which Mongo data is real: users, campaigns, script versions, cost history. During the strangler, which database owns users, and how the two stay consistent |
| Observability | Structured logs, error reporting, traces, and per-build cost and latency from day one (the plan has cost rows only, without latency) |
| Testing and CI | Contract tests against `docs/api/openapi.yaml` and the web app's Zod schemas, plus unit tests on the ledger, limits and webhooks. Today there are none |
| Estimates and owners | Effort per phase, who builds it, and a definition of done per phase |

## Should change

- **Cut vendors.** There are four voice vendors (ElevenLabs, Deepgram, PlayHT, Nari), plus music, image and video. Pick one voice vendor and one fallback, and drop video generation from the MVP. Voice is what decides the unit economics: about $0.10–0.55 a session (`/wiki/b2b2c/economics`).
- **Support "produced once, personalised inserts" builds.** The retreat runs on a journey produced once in the creator's voice, with short personal inserts. The build pipeline should reuse produced segments rather than generate 24 full sessions per buyer.
- **The model policy per route and plan (C2) belongs in Foundation.** It sets cost before any traffic.
- **Outcomes: do not port "mastery".** The 2026 measurement review drops mastery scores. Outcomes come from check-ins and WHO-5.
- **Idempotency is required on payments, builds and webhooks.** ETag / If-Match can wait until there are editable shared documents.
- **The taxonomy as generation input** (chakras, meridians and the rest) is fine as an internal input. It must never surface as a health claim.

## Answers to the plan's own decisions (§8.1)

| Decision | Answer |
| --- | --- |
| Database | **PostgreSQL for `/v1`.** Agree |
| Plan items C1, C3, C4, C5 | Product to decide this week, because they block accounts. C1 (the limit unit) also affects the funnel's usage-cap stage |
| Fate of the old product | **Retire** agents, agent teams and user-to-user chat. **Keep** one-off payments and Stripe Connect payouts for the creator retreat |

## Our side (frontend and product)

1. Add the creator retreat to `API-CONTRACT.md` and `openapi.yaml`: entities, endpoints, the split, payouts and cohort metrics.
2. Mark the Pilot slice in the contract, so the backend can build exactly that.
3. Decide C1, C3, C4 and C5.
4. Name the safety escalation owner.

## Ask the backend team for a v2 of this document with

- the Pilot slice phase;
- the retreat entities, and payments kept;
- safety in P1;
- infrastructure, migrations, data migration and observability;
- estimates and owners;
- confirmation that the live defects are fixed or the old API is offline.
