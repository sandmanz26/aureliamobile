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
