# API contract v2: Admin

*API contract v2, the Pilot slice (draft for the feature lock). Three pages: [General](/wiki/api) · [Apps](/wiki/api/apps) · [Admin](/wiki/api/admin). The older full contract: [v1](/wiki/api/v1).*

What staff and internal tools call: cost, outcomes and the minimum admin. Every read here is aggregate where it touches people, never one person's feelings.

### 4.6 Compute ledger and cost (5 endpoints)

Every build writes one ledger row **per supplier call**: what was bought, from whom, how much, at what cost, and whether a cached or reused segment made it free. This is how the business sees what a chapter, a session and a journey cost, and how that falls over time.

There is no public write endpoint: the build workers write the ledger. The reads are admin only.

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/compute/ledger` | Raw ledger rows | `?from&to&media&supplier&buildId&cursor` → `Page<ComputeLine>` | staff | new in v2 |
| GET | `/admin/compute/summary` | Cost per chapter, session, journey; by media, supplier, chapter length | `?from&to&groupBy=media\|supplier\|model\|chapterMinutes\|day` → `CostSummary` | staff | new in v2 |
| GET | `/admin/builds/{id}/cost` | One build's cost breakdown | → `{ buildId; total: Money; lines: ComputeLine[] }` | staff | new in v2 |
| GET | `/admin/suppliers` | Suppliers, models and their current unit prices | → `{ data: SupplierEndpoint[] }` | staff | new in v2 |
| PUT | `/admin/suppliers/{id}` | Update a unit price or switch a supplier off (versioned) | `{ unitPrice, active }` → `SupplierEndpoint` | staff | new in v2 |

```ts
type ComputeLine = { id; buildId; chapterId?; versionId; media: "script" | "voice" | "music" | "image" | "video";
                     supplier: string; model: string; unit: "token_in" | "token_out" | "char" | "second" | "image" | "generation";
                     units: number; unitPrice: number; cost: Money; cacheHit: boolean; reused: boolean;
                     latencyMs: number; attempt: number; fallbackFrom?: string; createdAt }
type CostSummary = { from; to; groupBy; rows: { key: string; builds: number; chapters: number; cost: Money;
                     costPerChapter: Money; cacheHitRate: number }[] }
```

Video is in the enum but not generated in the pilot.

### 4.7 Therapeutic outcomes (3 endpoints, internal)

Internal metric names; **never** public or partner copy, which stays wellness. Aggregate only, only from people who gave `outcome_research` consent, and suppressed below the minimum group size.

- **State-flip journey:** a journey from a bad state to a good one (for example bad sleep to good sleep), with a start score, a target, the chapters played and whether it **flipped**.
- **Uplift per chapter:** post score minus pre score on the same chapter.

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/outcomes/journeys` | Flip rate, chapters to flip, cost per flip | `?domain&from&to&retreatId` → `FlipSummary` | staff | new in v2 |
| GET | `/admin/outcomes/uplift` | Average uplift per chapter, by chapter index, length or bite | `?domain&groupBy=chapterIndex\|chapterMinutes\|bite` → `UpliftSummary` | staff | new in v2 |
| GET | `/admin/cohorts/{id}/metrics` | A cohort's aggregates (the creator's view, plus cost) | → `CohortMetrics & { cost: Money; flipRate?: number }` | staff | new in v2 |

```ts
type FlipSummary = { n: number; suppressed: boolean; flipRate?: number; chaptersToFlipMedian?: number;
                     costPerFlip?: Money; startScoreMedian?: number }
type UpliftSummary = { n: number; rows: { key: string; n: number; upliftMean?: number; suppressed: boolean }[] }
```

### 4.8 Minimum admin (9 endpoints)

Staff accounts only, separate token audience, roles `super_admin`, `ops`, `moderator`, `analyst`. **Every mutation writes the audit log.** This closes the admin's missing authentication.

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/users` | Find users | `?q&plan&status&cursor` → `Page<AdminUser>` | staff | v1 |
| GET | `/admin/users/{id}` | One user: account, orders, subscription, safety events (no check-in content) | → `AdminUser & {…}` | staff | v1 |
| PATCH | `/admin/users/{id}` | Suspend or reactivate | `{ status, reason }` → `AdminUser` | staff | v1 |
| GET | `/admin/transactions` | Orders, subscriptions, refunds, payouts | `?type&from&to&cursor` → `Page<Transaction>` | staff | changed in v2 |
| POST | `/admin/orders/{id}/refunds` | Refund all or part of an order | `{ amount?: Money, reason }` → `Refund` | staff | new in v2 |
| GET | `/admin/payouts` | Creator payouts and their state | `?creatorId&state` → `Page<PayoutLine>` | staff | new in v2 |
| GET | `/admin/safety/events` | Safety events, newest first | `?severity&state&cursor` → `Page<SafetyEvent>` | staff | new in v2 (moved up from the last phase) |
| PATCH | `/admin/safety/events/{id}` | Acknowledge, escalate or close | `{ state: "acknowledged" \| "escalated" \| "closed", note }` → `SafetyEvent` | staff | new in v2 |
| GET | `/admin/audit` | The audit log | `?actor&action&from&to` → `Page<AuditEntry>` | staff | v1 |

AI spend lives in §4.6 and cohort metrics in §4.7; both count as admin.

```ts
type SafetyEvent = { id; userId; source: "message" | "checkin" | "intake" | "report" | "play";
                     category; severity: "low" | "high" | "crisis"; action: "blocked" | "resources_shown" | "rolled_back";
                     state: "open" | "acknowledged" | "escalated" | "closed"; ownerId?; createdAt }
type AuditEntry = { id; actorId; action: string; target: string; before?: object; after?: object; at }
```

### 4.9 Healing model: StateFlips, AKPs, chapters, check-ins (12 endpoints, U146)

The shapes the admin already models in `src/admin/data/` (`stateFlips.ts`, `akps.ts`, `stateFlipSleep.ts`, `personaIdentityV4.ts`), as the backend will serve them. A **StateFlip** is a bad → good state in one dimension with milestones X → Y → Z and a measure; an **AKP** is a building block, either a *goal* (what to reach) or a *strategy* (how: script, music, image, video, product), linked to other AKPs and to the StateFlips it serves; a **chapter** is an ordered list of AKPs; a **check-in** scores the measure's markers after each chapter.

**Admin-only** (staff token, `aud=admin`) unless the Auth column says `user`. The apps read a published StateFlip and their own chapters and check-ins; AKP ids, tournament results, cohort outcomes and persona identities never reach an app. Outcome reads are aggregate, consented and suppressed below the minimum group size, as in §4.7.

| Method | Path | Purpose | Request → Response | Auth | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/stateflips` | Published StateFlips, for intake and the journey screen | `?dimension` → `{ data: StateFlipPublic[] }` | user | new in v2 |
| GET | `/stateflips/{id}` | One published StateFlip: bad, good, milestones, the check-in questions | → `StateFlipPublic` | user | new in v2 |
| PUT | `/admin/stateflips/{id}` | Create or update a StateFlip (versioned; `draft` until reviewed) | `StateFlip` → `StateFlip` | staff, admin-only | new in v2 |
| GET | `/admin/akps` | The AKP catalogue | `?family&kind=goal\|strategy&fn&flip&cursor` → `Page<Akp>` | staff, admin-only | new in v2 |
| GET | `/admin/akps/{id}` | One AKP with its links both ways | → `Akp & { linkedFrom: AkpLink[] }` | staff, admin-only | new in v2 |
| PUT | `/admin/akps/{id}` | Create or update an AKP and its links (versioned) | `Akp` → `Akp` | staff, admin-only | new in v2 |
| GET | `/journeys/{id}/chapters` | The person's chapters in order, with the milestone each aims at | → `{ data: ChapterPublic[] }` | user (own journey) | new in v2 |
| GET | `/admin/chapters/{id}` | One chapter with its ordered AKPs | → `Chapter` | staff, admin-only | new in v2 |
| GET | `/journeys/{id}/checkins` | The person's check-ins with each marker's score | → `{ data: Checkin[] }` | user (own journey) | new in v2 |
| GET | `/admin/outcomes/cohorts` | Cohort results per StateFlip: flip rate, milestones reached, chapters, cost per flip | `?flip&retreatId&stage&from&to` → `{ data: CohortOutcome[] }` | staff, admin-only | new in v2 |
| GET | `/admin/tournaments` | AKP tournament results: candidates, the Causal AI judge's scores, the winner | `?flip&media&from&to&cursor` → `Page<TournamentResult>` | staff, admin-only | new in v2 |
| GET | `/admin/personas/{id}/identity` | A synthetic persona's identity (the Grand 12) and mindspace per function | → `PersonaIdentity` | staff, admin-only | new in v2 |

`POST /checkins` (§4.2) is **changed in v2**: it takes the markers of the StateFlip's measure (`measures`) and the server sums them into `score`.

```ts
type Dimension = "mental" | "emotional" | "relational" | "spiritual" | "physical"   // codes MEN EMO REL SPI PHY
type Layer = "mood" | "habit" | "skill"
type StateFlip = { id: string /* SF-… */; n: number; dimension: Dimension; title: string;
                   need: { id: string; kind: "UN" | "dual" | "none"; label: string; source: string };
                   bad: string; good: string;
                   milestones: { id: "X" | "Y" | "Z"; title: string; threshold: number; layer: Layer; what: string }[];
                   measure: { scale: string; markers: { label: string; question: string; bad: string; good: string }[]; source: string };
                   issues: string[]; layer: Layer; prevalence: string; source: string;
                   status: "draft" | "reviewed" | "published"; version: number }
type StateFlipPublic = Pick<StateFlip, "id" | "dimension" | "title" | "bad" | "good" | "milestones"> &
                   { questions: { label: string; question: string }[] }          // no sources, no issues
type AkpLink = { from: string; to: string; type: "step-of" | "feeds" | "part-of" | "supports" | "fed-by" | "mirrors" }
type Akp = { id: string /* WG- ID- WS- WM- WI- WV- PR- */; name: string;
             family: "goal" | "identity" | "product" | "script" | "music" | "image" | "video";
             fn: "wellness" | "product" | "identity" | "brand"; kind: "goal" | "strategy";
             layer: string; modality: "Script" | "Music" | "Image" | "Video" | null;
             description: string; causalRole: string; flips: string[]; links: { to: string; type: AkpLink["type"] }[];
             source: string; status: "draft" | "reviewed"; version: number }
type Chapter = { id; versionId; journeyId?; flipId?; index: number; minutes: 3 | 5 | 10; milestone?: "X" | "Y" | "Z";
                 akps: { akpId: string; order: number; kind: "goal" | "strategy" }[] }   // ordered by `order`
type ChapterPublic = Omit<Chapter, "akps"> & { title: string; durationSec: number }
type Checkin = { id; journeyId; chapterId?; phase: "pre" | "post";
                 measures: { marker: string; value: number; max: 25 }[]; score: number /* 0–100, the sum */;
                 milestone?: "X" | "Y" | "Z"; at }   // milestone from the mean of the last two scores ≥ 45 / 65 / 85
type CohortOutcome = { flipId: string; retreatId?: string; stage?: 1 | 2 | 3; n: number; suppressed: boolean;
                       flipRate?: number; reached?: { X: number; Y: number; Z: number };
                       chaptersToFlipMedian?: number; meanChance?: number; costPerFlip?: Money; startScoreMedian?: number }
type TournamentResult = { id; flipId: string; chapterId?: string; media: "script" | "voice" | "music" | "image" | "video";
                          judge: string /* Causal AI model version */;
                          candidates: { supplier: string; model: string; akpIds: string[]; score: number; cost: Money }[];
                          winner: number /* index into candidates */; baselineScore?: number; upliftAfter?: number; decidedAt }
type IdentityKey = "outcomes" | "emotional" | "cognitive" | "regulation" | "capacity" | "archetype" |
                   "preferences" | "relational" | "values" | "risks" | "culture" | "meta"
type PersonaIdentity = { id: string; dims: Record<IdentityKey, { key: IdentityKey; value: string; detail: string }>;
                         archetype: "Explorer" | "Caregiver" | "Achiever" | "Seeker" | "Rebuilder" | "Guardian";
                         cogStyle: "analytic" | "intuitive" | "narrative" | "somatic";
                         value: "purpose" | "compassion" | "growth" | "balance" | "security" | "belonging";
                         spiritual: "welcome" | "neutral" | "secular only"; flags: string[]; flip: string;
                         mindspace: Record<"wellness" | "product" | "business" | "brand",
                                           { headline: string; facts: { label: string; value: string }[]; akps: string[] }> }
```

Persona identity is for the **synthetic** personas the buyer agents play; a real person's identity profile is out of v2 (it needs its own consent and is listed in §7 of General). Tournament results stay empty until the meta-AI tournament is built; the endpoint exists so the admin and the cost ledger agree on one shape from the start.
