# Review of the backend Change Plan (18 Nov 2026)

**Sent as a PDF:** `docs/api/2026-11-24-change-plan-feedback.pdf` (J163, rewritten in J164).

**Reviewed:** `docs/api/2026-11-18-backend-change-plan.pdf`, "Aurelia Backend: Current APIs vs. the Backend API Plan" (16 pages), on 24 Nov 2026, from the engineering lead's point of view. It is read against:
- `docs/api/API-CONTRACT.md`;
- the B2B2C research (`/wiki/b2b2c`);
- the decision approved on 24 Nov 2026 to redesign the creator retreat.

## What the Change Plan is

The Change Plan compares two things:
- **Last year's (2025) backend code.** It was built for an earlier product: campaigns, script versions, user-built agents, a wellness taxonomy and creator payouts, on MongoDB with Google sign-in only.
- **The 2026 API plan.** That is the contract the web and Flutter apps were designed against.

It is an inventory of what in the 2025 code is still useful. It is not a plan for building the 2026 backend.

## Verdict

**Build the 2026 backend new, and use the 2025 code only as a box of parts.** The plan's own numbers show how little of it fits:
- no endpoint matches as specified;
- 18 of 127 consumer endpoints can be ported, and 73 are new;
- about 100 of about 110 admin endpoints are new;
- everything that is ported still changes path, authentication, database and shape.

**The parts worth taking:**
- the generation pipeline;
- the queue;
- the model wrapper with cost tracking;
- the Stripe client.

**Before implementation the work needs two things:** a locked feature list, and a v2 of the plan built around the first paid pilot.

## Features must be locked before the final API is planned

This is the most important point.
- **Every feature that stores or reads data costs four pieces of work:**
  1. an endpoint;
  2. a table;
  3. backend logic and tests;
  4. changes in both apps.
- **The feature list still changes almost weekly.** While it moves, a final API will be out of date before it is built.

The rules we propose:
- **Lock:** a one-page list of what API v1 serves (the Pilot slice plus anything agreed), signed off by the product owner and the business owner, before engineering plans the final API.
- **Backlog:** new ideas after the lock go to the next version, not into v1.
- **Price tag:** a change after the lock first gets an impact note from engineering (endpoints, tables, screens, days added). Then the product owner decides.
- **The prototype may keep moving; the API does not.** The web app runs on sample data, so screens can change daily at almost no cost. That speed does not carry over to the backend.
- **Versions, not edits:** once v1 is live, changes are additive or go into v2.

## How the app, the API and the backend fit together (for readers outside engineering)

| Piece | What it is | Today |
| --- | --- | --- |
| Frontend (the apps) | What people see and tap | Built (web and Flutter), on sample data: nothing is saved for real, nobody can pay |
| API (the contract) | The list of questions the apps may ask the server, and the exact shape of each answer | A written plan; this is what must be locked |
| Backend (the server) | Stores accounts and check-ins, runs the AI, takes payments, keeps data safe | Not built for 2026 |
| Database and services | PostgreSQL, AI models, voice, Stripe | Chosen, not set up |

A feature that looks finished in the prototype is a screen with sample data. For real users it still needs the API, the backend, a table, tests and both apps reconnected.

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

0. Write the one-page locked feature list for API v1, and get it signed off.
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
