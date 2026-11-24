# API contract v2: Apps

*API contract v2, the Pilot slice (draft for the feature lock). Three pages: [General](/wiki/api) · [Apps](/wiki/api/apps) · [Admin](/wiki/api/admin). The older full contract: [v1](/wiki/api/v1).*

What the web and Flutter apps call. Conventions (auth, errors, pagination, idempotency) are on [General](/wiki/api).

### 4.1 Accounts and consent (12 endpoints)

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/signup` | Create an account with email and password | `{ email, password, name, birthYear, country, acceptTermsVersion }` → `AuthTokens & { user: Me }` | public | changed in v2 (age gate, country) |
| POST | `/auth/signin` | Sign in | `{ email, password }` → `AuthTokens & { user: Me }` | public | v1 |
| POST | `/auth/oauth/google` | Sign up or in with Google; the code exchange runs on the server | `{ code, redirectUri, birthYear?, country? }` → `AuthTokens & { user: Me, needsAgeGate: boolean }` | public | v1 (Google only in the slice) |
| POST | `/auth/refresh` | Swap the refresh token for a new pair | cookie or `{ refreshToken }` → `AuthTokens` | public | v1 |
| POST | `/auth/signout` | Revoke the refresh token | — → `204` | user | v1 |
| POST | `/auth/password-reset` | Ask for a reset link; never reveals whether the address exists | `{ email }` → `202` | public | v1 |
| GET | `/me` | The signed-in person | → `Me` | user | v1 |
| PATCH | `/me` | Name, locale, time zone, birth year (once) | `Partial<{ name, locale, timeZone, birthYear }>` → `Me` | user | v1 |
| GET | `/me/consents` | Every consent and its state | → `{ data: Consent[] }` | user | changed in v2 (purposes below) |
| PUT | `/me/consents/{purpose}` | Give or withdraw one consent | `{ granted: boolean, textVersion }` → `Consent` | user | changed in v2 |
| POST | `/me/export` | Ask for a copy of all one's data (GDPR access) | — → `202 { requestId, readyBy }` | user | v1 |
| DELETE | `/me` | Delete the account and its data (30-day grace, then gone) | `{ confirm: "DELETE" }` → `202 { deleteAt }` | user | v1 |

```ts
type AuthTokens = { accessToken: string; expiresIn: number; refreshToken?: string } // refreshToken only to mobile
type Me = { id: string; email: string; name: string; locale: string; timeZone: string;
            country: string; ageBand: "16-17" | "18+"; roles: ("user" | "creator")[]; createdAt: string }
type Consent = { purpose: "health_data" | "ai_processing" | "outcome_research" | "marketing_email";
                 granted: boolean; textVersion: string; updatedAt: string }
```

**Age gate.** Sign-up asks for a birth year. Under 16 is refused (`422 age_restricted`); 16 and 17 get the account with marketing off and stricter safety thresholds. Google sign-in without a birth year returns `needsAgeGate: true` and the app asks before anything else.

**Consent.** `health_data` (explicit, GDPR Art. 9) is required before the first check-in or free-text feeling is stored; without it those calls return `422 consent_required`. `outcome_research` lets the person's scores count in internal aggregate outcomes; it is separate and optional. Consent texts are versioned; a new text version re-asks.

### 4.2 Core loop (22 endpoints)

The loop: a check-in score before → a conversation → a build creates a session with chapters → play → a check-in score after → "Change this session" with Lego bites makes a new version → the next chapter, inside a journey from a bad state toward a good one.

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| POST | `/conversations` | Start a thread, optionally from the first sentence | `{ firstMessage?, source }` → `Conversation` | user | v1 |
| GET | `/conversations` | My threads | → `Page<Conversation>` | user | v1 |
| GET | `/conversations/{id}` | One thread with its messages | → `Conversation & { messages: Message[] }` | user | v1 |
| POST | `/conversations/{id}/messages` | Send a message; the reply streams (SSE) | `{ text }` → `text/event-stream`: `message.delta`, `message.completed`, `safety.crisis`, `error` | user | v1, safety now blocking |
| POST | `/builds` | Build a new session or a new version of one | `{ conversationId, sessionId?, baseVersionId?, chapterMinutes: 3 \| 5 \| 10, biteIds?: string[] }` → `202 Build` | user | changed in v2 (bites, chapter length) |
| GET | `/builds/{id}` | Build state | → `Build` | user | v1 |
| GET | `/builds/{id}/events` | Build progress (SSE) | → `build.step`, `build.completed`, `build.failed` | user | v1 |
| GET | `/sessions` | My sessions (created and played) | `?filter=created\|played` → `Page<SessionSummary>` | user | v1 |
| GET | `/sessions/{id}` | One session with its current version | → `Session` | user | v1 |
| GET | `/sessions/{id}/chapters` | The chapters of the current (or a given) version | `?versionId` → `{ data: Chapter[] }` | user | new in v2 |
| GET | `/sessions/{id}/versions` | Every version, newest first | → `{ data: Version[] }` | user | v1 |
| GET | `/sessions/{id}/bites` | "Change this session": the Lego bites on offer for this version, each with a Why | → `{ data: LegoBite[] }` | user | new in v2 (replaces v1 proposals) |
| POST | `/sessions/{id}/versions/{versionId}/rollback` | Make an earlier version current again (no cost) | — → `Session` | user | new in v2 |
| GET | `/chapters/{id}/playback` | Signed, short-lived audio and image URLs | → `Playback` | user | v1 (per chapter now) |
| POST | `/plays` | A play starts | `{ chapterId, versionId }` → `Play` | user | changed in v2 |
| PATCH | `/plays/{id}` | Progress and end of a play | `{ positionSec, completionRatio, ended?: boolean, report?: "adverse" \| "quality" }` → `Play` | user | changed in v2 (completion ratio, report) |
| POST | `/checkins` | A pre- or post-session score | `{ chapterId?, journeyId?, phase: "pre" \| "post", score: 0-100, feeling?: string }` → `CheckIn` | user | changed in v2 (pre and post, 0–100) |
| GET | `/checkins` | My check-ins | `?journeyId` → `Page<CheckIn>` | user | v1 |
| POST | `/journeys` | Start a journey from a bad state toward a good one | `{ domain, fromState, toState, startScore, targetScore? }` → `Journey` | user | changed in v2 |
| GET | `/journeys/current` | The active journey and its next chapter | → `Journey \| null` | user | v1 |
| GET | `/journeys/{id}` | One journey with its scores | → `Journey` | user | changed in v2 |
| PATCH | `/journeys/{id}` | Pause, resume or end | `{ status }` → `Journey` | user | v1 |

```ts
type Conversation = { id; sessionId: string | null; title; source: "home" | "onboarding" | "retreat" | "session" | "new"; lastMessageAt }
type Message = { id; conversationId; role: "user" | "assistant" | "system_event"; text; createdAt;
                 attachment?: { type: "bites"; sessionId } | { type: "build"; buildId; versionId; label };
                 safety?: { crisis: boolean } }
type Build = { id; sessionId; versionId; state: "queued" | "running" | "ready" | "failed";
               steps: { name: "script" | "voice" | "music" | "image" | "mix"; state }[];
               reusedSegments: number;            // "produced once, personalised inserts"
               counted: boolean; createdAt; finishedAt? }
type Session = { id; title; summary; ownerId; retreatId?: string; currentVersionId; versions: number; createdAt }
type Version = { id; sessionId; label: "v1.0"; parentVersionId?: string; biteIds: string[];
                 state: "building" | "ready" | "failed" | "rolled_back"; createdAt }
type Chapter = { id; versionId; index; title; durationSec; minutes: 3 | 5 | 10 }
type LegoBite = { id; title; kind: "voice" | "music" | "pace" | "script" | "image" | "length";
                  what: string; why: string; preselected: boolean }
type Playback = { audioUrl; imageUrl?; expiresAt; durationSec }   // URLs live 15 minutes
type Play = { id; chapterId; versionId; startedAt; positionSec; completionRatio: number; completed: boolean }
type CheckIn = { id; phase: "pre" | "post"; score: number; chapterId?; journeyId?; createdAt }
type Journey = { id; domain: "sleep" | "stress" | "focus" | "mood" | "other"; fromState; toState;
                 startScore; targetScore; latestScore?; chaptersPlayed; status: "active" | "paused" | "flipped" | "ended";
                 nextChapterId?; reminderAt? }
```

**Rules the server owns.**
- A build is refused while another build of the same session runs (`409 build_in_progress`).
- Applying bites always makes a **new version**; the previous one is kept. Closing the sheet without applying costs nothing.
- A play with `completionRatio` below 0.3 never counts as complete.
- An `adverse` report on a play rolls the session back to the previous version and writes a safety event.
- A missing post score stays `null`; the server never fills it in.
- `targetScore` defaults to 75. A journey is **flipped** when a post score reaches the target on two chapters in a row (internal definition, see §4.7).

### 4.3 Safety (2 endpoints, plus a check inside every text endpoint)

Safety is **P1**, inside the core loop.

- **Every user text** (a message, a first sentence, a check-in's `feeling`, a retreat intake) passes a mandatory safety check **before** any generation. There is no endpoint for it; it is part of those calls.
- On a **crisis** signal the server stops generation, does not build, returns the reply as `safety.crisis` (or `422 unsafe_content` on non-streaming calls) with local crisis resources, and writes a `safety_events` row. A creator persona can never override this.
- Every safety event has a named **escalation owner** (open decision, §8) and appears in the admin (§4.8).

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/safety/resources` | Crisis lines for a country | `?country=ID` → `{ data: { name, phone?, url?, hours? }[] }` | public | new in v2 |
| POST | `/safety/reports` | Report a reply or a session as harmful | `{ messageId? , chapterId?, reason, note? }` → `202` | user | new in v2 |

```ts
type CrisisReply = { code: "unsafe_content"; category: "self_harm" | "harm_to_others" | "medical_emergency";
                     message: string; resources: { name; phone?; url? }[] }
```

### 4.4 Creator retreat (17 endpoints)

The approved redesign: a creator sells a retreat (a journey produced once in the creator's voice, with short personal inserts per buyer) to a **cohort**. **Aurelia is the merchant of record**: it sells the ticket, charges VAT, handles refunds and the EU withdrawal right, and pays the creator through Stripe Connect.

**The split** (default, per retreat in `split_rules`): of the ticket's net after VAT and card fees, **70% to the creator, 30% to Aurelia**; plus a **share of year-1 Plus revenue** (proposed 20%) from buyers in the creator's cohorts who subscribe within the attribution window. Ticket price €19.99 or €39.

**Creators see aggregates only.** No names, no scores, no feelings. Cohort numbers are hidden for any group smaller than the minimum group size (proposed 10; below it the response says `suppressed: true`).

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/creators/{handle}` | A creator's public page | → `CreatorPublic` | public | new in v2 |
| GET | `/retreats/{id}` | A retreat's public page and its open cohorts | → `Retreat & { cohorts: Cohort[] }` | public | new in v2 |
| POST | `/checkout/tickets` | Start a ticket purchase (Stripe Checkout) | `{ cohortId, withdrawalConsent: { startNow: true, acknowledged: true, textVersion }? }` → `{ orderId, checkoutUrl }` | user | new in v2 |
| GET | `/orders/{id}` | One order and its state | → `Order` | user | new in v2 |
| GET | `/me/orders` | My orders | → `Page<Order>` | user | new in v2 |
| POST | `/orders/{id}/withdrawal` | Use the 14-day withdrawal right, if it still applies | `{ reason? }` → `Refund` | user | new in v2 |
| GET | `/me/enrolments` | My retreats and where I am in each | → `{ data: Enrolment[] }` | user | new in v2 |
| GET | `/creator/me` | The creator's own profile and payout status | → `Creator` | creator | new in v2 |
| POST | `/creator/connect/onboarding-link` | A Stripe Connect onboarding link | — → `{ url, expiresAt }` | creator | new in v2 |
| GET | `/creator/retreats` | The creator's retreats and cohorts | → `{ data: (Retreat & { cohorts: Cohort[] })[] }` | creator | new in v2 |
| GET | `/creator/cohorts/{id}/metrics` | Aggregate cohort numbers | → `CohortMetrics` | creator | new in v2 |
| GET | `/creator/payouts` | The creator's payout ledger | → `Page<PayoutLine>` | creator | new in v2 |
| GET | `/creator/split-rules` | The terms that apply to each retreat | → `{ data: SplitRule[] }` | creator | new in v2 |
| POST | `/admin/creators` | Onboard a creator (pilot: by hand) | `{ userId, handle, displayName, country }` → `Creator` | staff | new in v2 |
| POST | `/admin/retreats` | Create a retreat with its price and split | `{ creatorId, title, priceAmount, currency, splitRuleId, chapterPlan }` → `Retreat` | staff | new in v2 |
| POST | `/admin/retreats/{id}/cohorts` | Open a cohort | `{ startsAt, capacity, enrolUntil }` → `Cohort` | staff | new in v2 |
| PUT | `/admin/split-rules/{id}` | Set or change a split (new version, never an edit in place) | `{ creatorTicketShare, creatorPlusShare, plusAttributionDays }` → `SplitRule` | staff | new in v2 |

```ts
type Money = { amount: number; currency: "EUR" | "USD" | "IDR" }
type Retreat = { id; creatorId; title; summary; price: Money; weeks: number; chapterCount; status: "draft" | "on_sale" | "closed" }
type Cohort = { id; retreatId; startsAt; enrolUntil; capacity; enrolled: number; status: "open" | "running" | "finished" }
type Order = { id; userId; cohortId; price: Money; vat: Money; fees: Money; net: Money;
               state: "pending" | "paid" | "refunded" | "partially_refunded" | "failed";
               withdrawal: { waived: boolean; consentAt?: string; textVersion?: string };
               receiptUrl?; createdAt }
type Enrolment = { id; cohortId; retreatId; orderId; journeyId; status: "active" | "finished" | "refunded" }
type SplitRule = { id; version: number; creatorTicketShare: 0.7; creatorPlusShare: 0.2; plusAttributionDays: 365; effectiveFrom }
type PayoutLine = { id; creatorId; source: "ticket" | "plus_share" | "refund_reversal"; orderId?; subscriptionId?;
                    gross: Money; creatorAmount: Money; state: "pending" | "available" | "paid" | "reversed";
                    stripeTransferId?; availableAt; paidAt? }
type CohortMetrics = { cohortId; minGroupSize: number; suppressed: boolean; enrolled?: number;
                       activeWeek1?: number; activeWeek4?: number; activeWeek8?: number;
                       chaptersPlayedMedian?: number; plusConversions?: number; refunds?: number;
                       revenue?: Money; creatorEarnings?: Money }   // never per-person data
```

**Withdrawal.** For EU buyers, checkout refuses to start an instantly-delivered retreat without the express consent to start now and the acknowledgement that the right is then lost (`422 withdrawal_consent_required`). Without that consent the buyer keeps the 14-day right and access starts at the cohort start. The confirmation goes out by email (a durable medium).

**Payouts.** A paid order writes a `pending` payout line; it becomes `available` after the refund window, then a scheduled transfer pays it through Stripe Connect. A refund after payout writes a `refund_reversal` line against the creator's next payout.

### 4.5 Plus subscription (6 endpoints)

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/plans` | Plans and prices for the person's country | → `{ data: Plan[] }` | public | v1 |
| POST | `/checkout/subscription` | Start Plus (Stripe Checkout on web; store billing on mobile later) | `{ planId, priceId }` → `{ checkoutUrl }` | user | changed in v2 (cohort attribution) |
| POST | `/me/subscription/portal` | Manage or cancel (Stripe customer portal) | — → `{ url }` | user | new in v2 |
| GET | `/me/entitlements` | What the plan allows and how much is left | → `Entitlements` | user | v1 |
| POST | `/webhooks/stripe` | Payments, subscriptions, refunds and Connect events | Stripe event → `200` | Stripe | changed in v2 (tickets and Connect) |
| GET | `/me/subscription` | The current subscription | → `Subscription \| null` | user | v1 |

```ts
type Plan = { id: "free" | "plus"; prices: { id; interval: "month" | "year"; price: Money }[]; limits: Limits }
type Entitlements = { plan: "free" | "plus"; source: "free" | "subscription" | "retreat";
                      limit: { unit: "build"; perDay: number; used: number; resetAt } ; // unit is an open decision (§8)
                      chapterMinutesAllowed: (3 | 5 | 10)[] }
type Subscription = { id; plan: "plus"; interval; status: "active" | "past_due" | "canceled"; currentPeriodEnd;
                      attributedCohortId?: string }   // drives the creator's Plus share
```

**Free limit.** The server counts; the app only shows `entitlements`. The first build never counts. A retreat ticket grants its own chapters for the cohort's length (`source: "retreat"`).

**Attribution.** A subscription started by someone enrolled in a cohort within `plusAttributionDays` of enrolment records `attributedCohortId`. Each paid invoice then writes a `plus_share` payout line.
