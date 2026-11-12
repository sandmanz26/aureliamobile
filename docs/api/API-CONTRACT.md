# Aurelia API contract plan · v1

**Owner:** Head of Engineering + Head of Product
**Status:** Draft for review. Nothing here is built; the clients still run on mock data.
**Scope:** what **production** runs today: `web_prod` @ `bc028a6`, design
**prod v1** (= staging v4, the default) and **prod v2** (= staging v5,
opt-in). Work that is only on staging today (for example the admin's well-being
outcomes) appears only as clearly marked *later* items.
**Companion:** [`openapi.yaml`](openapi.yaml) (OpenAPI 3.1, validated: 90
paths, 61 schemas) is the machine-readable form of §5–§6 in full and of the
core of §7 (users, moderation, AI metrics and policies, audit). The other admin
modules follow in P4. Where the two disagree, this document is the intent and
the YAML is a bug.

Read order:
1. §1 for the product the API serves.
2. §2 for the decisions this contract makes.
3. §3 for conventions.
4. §4 for the data model.
5. §5–§7 for endpoints.
6. §8 for the AI system.
7. §11 for what we still have to decide.

---

## 0 · Summary

- **One REST API, `https://api.aurelia.care/v1`, JSON over HTTPS.** It serves
  both clients: the React web app, which is the reference, and the Flutter
  app. The same contract serves prod v1 and prod v2; the design version is a
  **client** concern, so the API returns everything both need (§2.4).
- **The core loop is the API's first job:**
  1. sign in;
  2. onboarding;
  3. a conversation with Aurelia;
  4. proposals with reasons;
  5. a build (async, streamed progress);
  6. play;
  7. check-in;
  8. the next chapter and a reminder;
  9. progress told in words.

  Community, coins, challenges and admin come after it (§10).
- **AI features run server-side only.** Clients never hold a model key. Six AI
  capabilities sit behind the API (§8):
  - understanding the first sentence;
  - the cockpit conversation;
  - change proposals with a "Why";
  - the session build (script → voice → sound → visuals);
  - the next-chapter plan;
  - progress summaries in words.

  A safety layer runs on every user turn.
- **Honesty is part of the contract, not a UI choice.** No figure that is not
  the person's own, or that nobody measured, may be returned to a client
  without a `provenance` field. This is the project's honesty rule.

---

## 1 · What the API serves (production today)

| Area | Prod v1 (= staging v4, default) | Prod v2 (= staging v5) | API consequence |
| --- | --- | --- | --- |
| Entry | Home Ask, feeling chips, Quick Start (plays before sign-in) | Same, plainer visitor Home | Public catalogue reads, preview playback without auth |
| Sign-in | Email/password, "Continue with Google" | Same | Auth + OAuth; **must persist** (decision D2, §2.1) |
| Onboarding | Goal → feeling → style (length, voice, sounds) → editable summary; the typed sentence pre-fills it | Plus "Do you wear one of these?" (Apple Watch / Whoop / Oura / Not now) | `onboarding` resource; AI intent inference from free text |
| Cockpit | Own thread per person; the reply; a deck of proposals; the one "+" list; Apply builds v1.0 → v1.1 …; every build kept in the thread | Plus a **"Why?"** per proposal (what it does, what it is based on) | Conversations, messages (streamed), proposals with `basis`, builds (async) |
| Free limit | Counts only after the first build | Same | Entitlements resource; the limit is server-enforced |
| Player | Play, details sheet, check-in "How do you feel now?", Chapter 2 reminder (.ics) | Plus a wearable reading, a journal line, "what the next chapter changes"; **no analytics** | Playback URLs, play events, check-ins, the next-chapter plan |
| Home (signed in) | Next chapter first, recent conversations, one community shelf | Same | `home` aggregate endpoint |
| Progress | Your goals (sample analyses on v1) + Data sources | Progress in words from own check-ins, a two-week report date, a journal | `progress/summary`, `journal`, `signal-sources`, `connections` |
| Discover | Community shelves, creators, live, challenge | Cards show the summary, tags without "#", the challenge without ranks | Catalogue + challenges; the API exposes ranking **only where v1 needs it** |
| Publish / Recreate | Publish, unpublish, recreate (fork) | Plus a privacy note on publish | Publish state, forks with lineage |
| Me | Library (created / played), Credits & plan, notifications, invite, settings, help | Same | Wallet, plans, notifications, settings, account deletion |
| Admin `/admin` | 18 modules on mock data, **no auth** (P0) | Same | Separate admin API with RBAC (§7) |

---

## 2 · Decisions this contract makes

The open product decisions are listed in §11. These are the ones the contract
**takes** so engineering is not blocked. Each can be reversed before build.

1. **Persistent accounts (D2 = yes).** Sign-in persists via a refresh token.
   The journey, journal, check-ins, onboarding and conversations move from
   `localStorage` to the account. Without this no retention number can be
   measured (the retention test).
2. **Free plan limits builds, not messages** (logic-review decision 1). The
   server owns the counter: N builds per account per day, reset at local
   midnight. Conversation is unlimited, and the first build is never counted
  . The client renders `entitlements` and never computes the limit.
3. **One version model** (decision 3). A session owns an ordered list of
   versions: v1.0 for the first build, +0.1 per build. A fork is a new
   session at v1.0 that records `parent {sessionId, versionId}`. Live changes
   only on (Re)publish, and publish is refused while a build runs (decision 4,
   logic B3).
4. **The API serves both design versions from one shape.** Example: a proposal
   carries both `estimate` (nullable, with provenance) and `basis` (the
   reasons). Prod v1 renders the estimate; prod v2 renders the basis. The
   server sets `estimate` to `null` until an estimate is measured (the honesty rule), and
   prod v1 then hides the chip. No endpoint branches on design version. The
   client sends `X-Aurelia-UI: 4|5` **only for analytics**.
5. **Numbers are integers; formatting is the client's.** `plays: 18500`, not
   "18.5k". Both clients use one formatting rule (`docs/FOR-BACKEND.md` §1.1,
   now decided): ≥1000 → one decimal + k, ≥1,000,000 → one decimal + M,
   trailing ".0" dropped.
6. **Outcomes always carry provenance.** Any `Outcome` has `{label, value,
   unit, provenance: "self_reported"|"measured"|"sample", n, window}`. Sample
   data is never returned in production responses after launch.
7. **One conversation per session** (decision 9). A session's conversation is
   reopened with it. A Home ask opens a new conversation. Hand-offs carry
   `source` (logic D1, D2).
8. **Builds run server-side, independent of the screen** (logic D3), as jobs
   with streamed progress. The client may leave and come back.
9. **The safety layer is mandatory on every user-authored text input**
   (messages, journal, check-in notes, publish titles). It runs before
   generation.
10. **Privacy by default.**
    - Signal sources start off.
    - Consent is stored per source, with the consent-text version.
    - Journal and check-in notes are private and are used for generation only
      with the `personalisation` consent.
    - Publishing shares title, sound, visuals and script, never check-ins,
      journal, wearable data or the conversation (the prod v2 privacy note is
      the contract).

---

## 3 · Conventions

### 3.1 Transport and versioning

- Base URL `https://api.aurelia.care/v1`. Staging: `https://api.staging.aurelia.care/v1`.
- JSON (`application/json; charset=utf-8`). Timestamps in RFC 3339 UTC
  (`2026-11-10T09:00:00Z`). Durations in seconds. Ids are opaque strings with
  a type prefix (`usr_`, `ses_`, `ver_`, `cnv_`, `msg_`, `bld_`, `jrn_`, `chk_`,
  `jnl_`, `prp_`, `chl_`, `ntf_`). URLs use **slugs** for public sessions
  (`/sessions/{slugOrId}`) because the web routes already do (`/play/{slug}`).
- Breaking changes go to `/v2`. Additive changes (new fields, new enum values)
  are not breaking: **clients must ignore unknown fields and treat unknown
  enum values as "other"**. The web client already validates every response
  with Zod (`requestJson`). Schemas use `.passthrough()`-style tolerance for
  this reason.
- `Aurelia-Client: web/0.1.0+bc028a6` or `ios/…` on every request (support and
  telemetry). `X-Aurelia-UI: 4|5` (design version, analytics only).

### 3.2 Authentication

- `Authorization: Bearer <access token>`: a JWT, 15-minute lifetime.
  The refresh token is opaque, rotates, lives 30 days rolling (decision 14),
  and is stored in an httpOnly cookie on web and in secure storage on mobile.
- OAuth providers: Google (live in UI), Apple (required for iOS once Google is
  offered). The exchange runs server-side. Sign-up and sign-in share
  `POST /auth/oauth/{provider}`.
- Password reset **never reveals whether an address exists** (PRD rule). It
  always returns `202`.
- Public endpoints (catalogue, preview playback, challenges list) accept no
  token. Personalised fields are then simply absent.

### 3.3 Errors (RFC 9457 problem details)

```json
{
  "type": "https://api.aurelia.care/problems/build-limit-reached",
  "title": "Daily build limit reached",
  "status": 429,
  "code": "build_limit_reached",
  "detail": "You have used 5 of 5 builds today.",
  "retryable": false,
  "resetAt": "2026-11-11T00:00:00+07:00",
  "requestId": "req_01J…"
}
```

`code` is the stable, machine-readable key; clients switch on it, never on
`title`. `retryable` matches the client's existing `HttpError.retryable`
(408/429/5xx/network). Standard codes:

| HTTP | `code` | When |
| --- | --- | --- |
| 400 | `invalid_request` | Schema violation (with `errors[]` of `{path, message}`) |
| 401 | `unauthenticated` | Missing or expired token |
| 403 | `forbidden` | Authenticated but not allowed (e.g. editing someone else's session: logic G2) |
| 404 | `not_found` | Also returned for private resources you cannot see (no existence leak) |
| 409 | `conflict` / `build_in_progress` / `version_mismatch` | Publish while building; stale `If-Match` |
| 422 | `unsafe_content` | The safety layer blocked user content (§8.7); the body carries `support` resources |
| 422 | `consent_required` | The action needs a consent the user has not given |
| 429 | `rate_limited` / `build_limit_reached` | `Retry-After` header; `resetAt` for plan limits |
| 503 | `ai_unavailable` | Model or vendor outage; `retryable: true` |

### 3.4 Pagination, filtering, idempotency, concurrency

- Cursor pagination: `?limit=20&cursor=…` → `{ "data": [...], "nextCursor": "…" | null }`.
  `limit` ≤ 100.
- **Idempotency:** every `POST` that creates or costs something (messages,
  builds, check-ins, publish, recreate, payments) requires
  `Idempotency-Key: <uuid>`. A replay returns the first result for 24 h.
  Mobile networks drop responses, and a double build costs money and a
  version number.
- **Optimistic concurrency:** mutable documents return `ETag`. Writes send
  `If-Match`; a mismatch is `409 version_mismatch`.
- Rate limits per token: 60 req/min general, 20 messages/min, 10 builds/hour.
  Headers `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

### 3.5 Streaming

Two endpoints stream, with **Server-Sent Events** (`text/event-stream`):
- the assistant's reply to a message (§5.4);
- a build's progress (§5.6).

SSE was chosen over WebSockets because it works through the PWA service worker
rule (`/api` is never cached), proxies and Vercel, and it reconnects with
`Last-Event-ID`. Every stream ends with a terminal event (`message.completed`
/ `build.completed` / `error`). A client that loses the stream fetches the
resource by id; **streams are a convenience, the resource is the truth.**

### 3.6 Webhooks (outbound, later phases)

These are for partners and internal workers, not clients: `build.completed`,
`checkin.created`, `safety.flagged`, `subscription.updated`. They are signed
(`Aurelia-Signature: t=…,v1=HMAC-SHA256`) and retried with backoff for 24 h.

---

## 4 · Data model

Field names are camelCase on the wire. Shapes are what the clients model
today (`src/lib/*`, `src/chat/*`, `docs/FOR-BACKEND.md` §1), corrected by §2.
`?` = optional or nullable.

### 4.1 Account and onboarding

```
User {
  id, email, displayName, photoUrl?, createdAt,
  locale, timezone,                       // reminder time and the daily limit reset use the zone
  plan: "free" | "plus" | "pro",
  roles: Role[]                           // "member" for consumers; staff roles for admin (§7)
}

Onboarding {                              // GET/PUT /me/onboarding; ETag
  status: "not_started" | "done" | "skipped",
  goal?: "sleep" | "calm" | "clarity" | "focus" | "regulate" | "energy",
  feelings: string[],                     // from the feeling chips vocabulary (lib/feelings)
  length: 5 | 10 | 20,                    // minutes
  voice: "female" | "male" | "none",
  sounds: ("nature" | "music" | "frequencies" | "silence")[],
  wearable?: "apple_watch" | "whoop" | "oura" | "none",  // prod v2 asks; v1 leaves it null
  words?: string,                         // the sentence typed on Home, kept as said
  completedAt?
}
```

Goal labels and objectives are server-owned reference data
(`GET /reference/goals`), matching `GOALS` in `lib/onboarding.ts`, so both
clients render the same text.

### 4.2 Sessions, versions, lineage

```
Session {
  id, slug, title,
  ownerId, author: PersonSummary,
  cover: { photoKey, gradient: [hex, hex], imageUrl? },  // photoKey into the fixed map until media is generated
  description,                            // prod v1 card line
  summary,                                // prod v2 card line; detail and player sheet
  category: "meditations" | "music" | "energy" | "sleep" | "calm",
  intent,                                 // the creator's stated goal, one sentence
  goal?,                                  // Onboarding.goal it was built for
  tags: string[],                         // plain words; the client decides "#" (prod v1) or none (prod v2)
  durationSec,                            // derived from chapters, sent so lists need not load chapters
  stats: { plays: int, recreations: int, qualifiedPlays: int },
  outcomes: Outcome[],                    // ALWAYS with provenance (§2.6)
  visibility: "private" | "published" | "unpublished",
  liveVersionId?, currentVersionId,       // live = what listeners get; current = what the owner edits
  parent?: { sessionId, versionId },      // fork source (decision 6)
  shelves: ("community" | "picked" | "impact")[],
  createdAt, updatedAt, publishedAt?
}

Version {
  id, sessionId, label: "v1.0",           // +0.1 per build, per session
  state: "building" | "ready" | "failed",
  buildId,
  spec: SessionSpec,                      // what was built (§8.4)
  changes: ChangeRef[],                   // what went into it, shown on the build card in the thread
  durationSec, createdAt
}

Outcome { label, value: number, unit: "percent"|"points"|"minutes"|"bpm",
          provenance: "self_reported" | "measured" | "sample", n: int, window: "P7D" | … , note }

LineageStep { sessionId?, title, author: PersonSummary, versionLabel, note, private: bool }
PersonSummary { id, slug, name, photoUrl?, role }
```

### 4.3 Conversation (the cockpit)

```
Conversation {
  id, sessionId?,                         // null until the first build creates the session
  title, source: "home" | "chip" | "quick_start" | "onboarding" | "recreate" | "session" | "new",
  lastMessageAt, unread: int
}

Message {
  id, conversationId, role: "user" | "assistant" | "system_event",
  text, createdAt,
  status?: "sending" | "sent" | "read",
  voice?: { uploadId, durationSec, transcript },
  replyTo?: { messageId, role, excerpt },
  attachment?:
      { type: "proposals", proposalSetId }          // "Based on … this is what I'd recommend"
    | { type: "build", buildId, versionId, label }   // each Apply keeps its card (v3+)
    | { type: "session", sessionId },
  prompts?: string[],                    // suggestion chips under the reply ("Make it longer")
  safety?: { flagged: bool, category? }   // never shown as-is; drives the support card (§8.7)
}
```

### 4.4 Proposals ("Change this session": one list, with Why)

```
ProposalSet {
  id, conversationId, sessionId?, createdAt,
  sections: [
    { kind: "suggested",  title: "Aurelia suggests",  options: ChangeOption[] },  // preselected
    { kind: "diagnosis",  title: "Based on your diagnosis", options: ChangeOption[] },
    { kind: "experiment", title: "Experiments", options: ChangeOption[] }
  ]
}

ChangeOption {
  id, title,                              // ≤ 13 chars for the folded deck
  description,                            // "What it does"
  kind: "visual" | "sound" | "movement" | "voice" | "script" | "length",  // the sheet filter
  channel?: "audio" | "visuals",
  preselected: bool,
  isExperiment: bool,                     // untested: v2 says so; no estimate ever
  estimate?: { value: number, unit: "percent", provenance, n } | null,  // prod v1 chip; null until measured
  basis: {                                // prod v2 "Based on: …"
    goal?: string, lastCheckIn?: { mood: 1..5, label }, wearable?: string,
    words?: string, sessionHistory?: bool, text: string   // text = ready-to-render sentence
  },
  previewSessionSlug?                     // the audio sample the card plays
}
```

The server writes `basis.text` as a sentence, so both clients render the same
words, e.g. "your goal (“Sleep better”) and your wearable." It is joined as a
list (a known wording bug must not reappear).

### 4.5 Builds

```
Build {
  id, sessionId, conversationId, versionId,         // versionId reserved at accept time
  state: "queued" | "running" | "succeeded" | "failed" | "canceled",
  stage?: "plan" | "script" | "voice" | "sound" | "visuals" | "mix" | "publish_assets",
  progress: 0..1, etaSec?,
  error?: { code, retryable, message },
  countsTowardLimit: bool,                          // false for the first build
  createdAt, finishedAt?
}
```

### 4.6 Journey, check-ins, journal, progress

```
Journey {                                   // the five-chapter loop
  id, goal, name: "Sleep better", sessionId, chapterTarget: 5,
  chapters: [{ number, versionId?, unlockedAt, playedAt?, checkInId? }],
  reminder?: { time: "22:30", timezone, channel: "calendar" | "push" | "email", enabled }
  status: "active" | "completed" | "abandoned"
}

CheckIn {
  id, journeyId?, sessionId, versionId, chapter?,
  mood: 1..5,                               // Very unpleasant … Very pleasant
  note?: string (≤ 500),                    // prod v2 journal line; private
  wearable?: SignalReading,                 // prod v2 "Heart rate settled from 78 to 66 bpm"
  createdAt
}
// The response to POST check-in also carries the next-chapter plan:
NextChapterPlan { chapter: 2, unlocksAt, headline: "Chapter 2 is ready tomorrow night",
                  plan: "Chapter 2 keeps what worked and goes a little deeper.",
                  changes: ChangeRef[], reminderSuggestion: { time: "22:30" } }

JournalNote { id, text (≤ 500), mood?: 1..5, createdAt }     // private; prod v2

ProgressSummary {                           // prod v2 "Progress in words"
  goal, chaptersDone, chapterTarget,
  trend: "up" | "same" | "down" | "new",   // rule in lib/journey feelingSummary: halves, ±0.5
  usual?: "Pleasant",
  headline: "After one chapter you felt pleasant.",
  detail: "Aurelia needs two check-ins before it can say which way things are going.",
  basis: "Based on: 1 check-in after your chapters, and your Apple Watch (example data…)",
  nextReportAt, checkIns: CheckIn[]         // "See what's behind this"
}

Report { id, period: { from, to }, headline, body, highlights[], generatedAt }  // the two-week report
```

The `trend` and `usual` rules are **deterministic** and defined server-side
exactly as `feelingSummary()`. The AI writes only the words around them (§8.5),
never the direction.

### 4.7 Signals and consent

```
SignalSource { id: "apple_watch" | "whoop" | "oura" | "google_calendar" | "conversation_history" | …,
               name, group: "biological" | "contextual" | "behavioural", reads: string,  // what it reads, verbatim consent text
               consentTextVersion, availability: "live" | "coming_soon" }
Connection   { sourceId, state: "off" | "on" | "pending" | "error",
               consentedAt?, consentTextVersion?, lastSyncAt? }
SignalReading{ sourceId, metric: "heart_rate" | "hrv" | "sleep_duration" | …, start, end,
               summary: { from, to, unit }, provenance: "measured" | "example" }
```

New accounts have every connection `off`. The one exception: the source picked
in onboarding (prod v2) moves to `pending` until the OS/vendor permission
completes (§5.8).

### 4.8 Community, economy, notifications

```
Challenge { id, slug, title, summary, startsAt, endsAt, joined: int, days: int,
            rewardCoins: int, me?: { joined, daysDone, streak } }
ChallengeEntry { sessionId, session: SessionCard, addedAt, qualifiedPlays: int }
Wallet  { balance: int, currency: "coins", history: LedgerEntry[] }   // one currency (decision 12)
LedgerEntry { id, amount: int, reason: "invite" | "challenge" | "lineage" | "purchase" | "grant", ref?, createdAt }
Plan { id: "free" | "plus" | "pro", price: { amount, currency, interval }, entitlements: Entitlements }
Entitlements { buildsPerDay, buildsUsedToday, resetAt, maxLengthMin, voices: string[], publishing: bool }
Notification { id, kind: "person" | "account" | "challenge" | "journey", actor?: PersonSummary,
               text, sessionId?, createdAt, readAt? }
```

---

## 5 · Consumer endpoints

Legend: 🔓 public · 🔐 auth · 🤖 AI-backed · ⚡ streamed · ♻️ needs `Idempotency-Key`.
"v1/v2" marks fields that only one design version renders.

### 5.1 Auth and account

| Method | Path | | Notes |
| --- | --- | --- | --- |
| POST | `/auth/sign-up` | 🔓 ♻️ | `{email, password, displayName}` → `201 {user, accessToken}` + refresh cookie |
| POST | `/auth/sign-in` | 🔓 | `{email, password}` → `200 {user, accessToken}` |
| POST | `/auth/oauth/{provider}` | 🔓 | `provider ∈ google, apple`; `{idToken | code, nonce}`; creates the account on first use (`201`) |
| POST | `/auth/refresh` | 🔓 | Rotates the refresh cookie → `{accessToken}` |
| POST | `/auth/sign-out` | 🔐 | Revokes the refresh token |
| POST | `/auth/password-reset` | 🔓 | `{email}` → **always `202`** |
| POST | `/auth/password-reset/confirm` | 🔓 | `{token, newPassword}` |
| GET | `/me` | 🔐 | `User` + `entitlements` + `onboarding.status` (one call at app start) |
| PATCH | `/me` | 🔐 | `displayName`, `photo`, `locale`, `timezone` |
| DELETE | `/me` | 🔐 ♻️ | Deletion request; lineage credit becomes "Former member" (decision 14); `202` |
| POST | `/me/export` | 🔐 ♻️ | Data export job → emailed link (GDPR art. 20) |
| GET | `/me/entitlements` | 🔐 | The limit counter the cockpit shows ("Edits paused until …" becomes "Builds reset at …") |

### 5.2 Onboarding

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/reference/goals` | 🔓 | Goals, feelings, lengths, voices, sounds, wearables: labels and copy |
| POST | `/onboarding/infer` | 🔓 🤖 | `{text}` → `{goal?, feelings[], confidence, ask?}`. Pre-fills onboarding from the Home sentence ("Got it, Adam. Read from what you wrote."). Works before sign-in, so the sentence survives the auth wall. Rate-limited per IP. |
| GET | `/me/onboarding` | 🔐 | `Onboarding` (ETag) |
| PUT | `/me/onboarding` | 🔐 | Whole document. `status: "done"` triggers the first conversation's seed (§5.3). |
| POST | `/me/onboarding/replay` | 🔐 | Settings → Replay onboarding: status back to `not_started`; the journey is kept unless `{resetJourney: true}` |

### 5.3 Home, catalogue, people

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/home` | 🔓/🔐 | Signed out: hero copy, Quick Starts, community shelf. Signed in: `nextChapter` (journey card), `recentConversations[3]`, one community shelf; **no marketing blocks**. Live map **only** if `?include=live` (prod v1 visitors; prod v2 drops it). |
| GET | `/quick-starts` | 🔓 | `{id, title, photoKey, previewSessionSlug, starterPrompt}` |
| GET | `/sessions` | 🔓 | `?shelf=community|picked|impact&category=…&q=…&cursor` → `SessionCard[]` |
| GET | `/sessions/{slugOrId}` | 🔓 | `Session` (+ `chapters`, `layers`, `personalization`, `commonChanges`, `safety[]`). Private sessions → 404 unless owner. |
| GET | `/sessions/{id}/lineage` | 🔓 | `LineageStep[]` oldest first + `recreations` (cursor) |
| GET | `/sessions/{id}/versions` | 🔐 owner | `Version[]`, marking `live` and `current` |
| GET | `/people/{slug}` | 🔓 | Profile **projected from published sessions** (FOR-BACKEND §1.3) |
| GET | `/me/library` | 🔐 | `?tab=created|played` (Library = `/sessions` screen) |
| GET | `/creators` | 🔓 | Trusted creators shelf |
| GET | `/live` | 🔓 | Ongoing live sessions (prod v1 only; can return `[]`) |

### 5.4 Conversations and messages (cockpit) 🤖

| Method | Path | | Notes |
| --- | --- | --- | --- |
| POST | `/conversations` | 🔐 ♻️ | `{source, sessionId?, quickStartId?, recreateOf?, firstMessage?}` → `201 Conversation`. `source:"onboarding"` seeds the first message from `Onboarding` (shown word for word before send). Every first visit gets **its own** conversation; there is no shared demo thread. |
| GET | `/conversations` | 🔐 | Recent conversations (Home, Latest) |
| GET | `/conversations/{id}` | 🔐 | `Conversation` + the latest `ProposalSet` + `session` summary |
| GET | `/conversations/{id}/messages` | 🔐 | `?cursor&direction=backward` |
| POST | `/conversations/{id}/messages` | 🔐 🤖 ⚡ ♻️ | `{text, replyTo?, voiceUploadId?}`. With `Accept: text/event-stream` the reply streams (below); otherwise `202 {userMessage, assistantMessageId}` and the client polls. |
| POST | `/uploads/voice` | 🔐 | `multipart/form-data` audio ≤ 60 s → `{uploadId, transcript, durationSec}` (speech-to-text; §8.6) |
| POST | `/conversations/{id}/messages/{mid}/feedback` | 🔐 | 👍/👎 + reason, for evals (§8.8) |

**Message stream events** (`POST …/messages` with SSE):

```
event: message.accepted     data: {"userMessage": {...}, "assistantMessageId": "msg_…"}
event: safety.checked       data: {"flagged": false}
event: message.delta        data: {"text": "Slow breath cues and a longer exhale"}     (repeated)
event: message.prompts      data: {"prompts": ["Make it longer", "Male voice"]}
event: proposals.created    data: {"proposalSetId": "prp_…"}                            (only if the reply proposes)
event: build.started        data: {"buildId": "bld_…", "versionLabel": "v1.1"}          (only if the reply agreed to change it)
event: message.completed    data: {"message": {...}}
event: error                data: {problem details}
```

A reply that says it changes the session **must** start a build. A reply that
says "adding white noise" over an unchanged version is a contract violation
(`replies.ts`, `changes: true`).

### 5.5 Proposals 🤖

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/conversations/{id}/proposals` | 🔐 | The current `ProposalSet` (the deck and the "+" sheet are **one list**, D6) |
| POST | `/conversations/{id}/proposals/refresh` | 🔐 🤖 ♻️ | Regenerate (e.g. after a check-in) |
| GET | `/proposals/{setId}/options/{optionId}/why` | 🔐 | Optional long-form Why. The short form is already in `basis.text`. |

### 5.6 Builds 🤖⚡

| Method | Path | | Notes |
| --- | --- | --- | --- |
| POST | `/sessions/{id}/builds` or `/conversations/{id}/builds` | 🔐 ♻️ | `{changeOptionIds[], note?}` → `202 Build` (reserves `v1.x`). The first build of a conversation creates the `Session` (`id` returned). `429 build_limit_reached` with `resetAt` when over the plan; `409 build_in_progress` if one is running. |
| GET | `/builds/{id}` | 🔐 | `Build` |
| GET | `/builds/{id}/events` | 🔐 ⚡ | SSE: `build.stage {stage, progress}` … `build.completed {versionId}` / `build.failed {error}` |
| POST | `/builds/{id}/cancel` | 🔐 | Refunds the limit if canceled before `voice` |
| POST | `/sessions/{id}/revert` | 🔐 | `{versionId}`: current → an older cut (no build) |
| PATCH | `/sessions/{id}` | 🔐 owner | Rename (title only; versions keep numbers), cover, tags |
| DELETE | `/sessions/{id}` | 🔐 owner | Soft delete; forks keep credit |

### 5.7 Playback, plays, feedback

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/sessions/{id}/playback` | 🔓 preview / 🔐 full | `?version=live|current|{id}` → `{audio: {hlsUrl, mp3Url, expiresAt}, visuals: {kind, params}, chapters[], cues[], durationSec, preview: bool}`. Signed URLs (10 min). Signed out → 60-second preview (D4). Non-live versions → owner only (decision 4). |
| POST | `/plays` | 🔓/🔐 ♻️ | `{sessionId, versionId, startedAt, listenedSec, completed}`. Qualified play = ≥ 60 s or 25 %, once per listener per day (decision 10). Anonymous plays carry the per-browser id. |
| POST | `/sessions/{id}/feedback` | 🔐 | Player feedback (face + text): goes to the next proposals |

### 5.8 Journey, check-ins, reminders, journal, progress

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/journeys/current` | 🔐 | `Journey` or `404` (Home falls back to the visitor layout) |
| POST | `/journeys` | 🔐 ♻️ | Created by the server on the first build. Explicit create only for "start again" after Replay onboarding (replaces; there are never two). |
| POST | `/check-ins` | 🔐 🤖 ♻️ | `{sessionId, versionId, mood, note?}` → `201 {checkIn, nextChapterPlan, progressSummary}`. The plan is AI-written around a deterministic choice (§8.5). `note` goes through safety (§8.7). |
| PATCH | `/check-ins/{id}` | 🔐 | Add the journal line after saving the mood (`noteLastCheckIn`) |
| PUT | `/journeys/{id}/reminder` | 🔐 | `{time, timezone, channel}`; default time per goal (sleep 22:30, calm 18:00, clarity 07:30, focus 08:30, regulate 21:00, energy 07:00) |
| GET | `/journeys/{id}/reminder.ics` | 🔐 (signed link) | `text/calendar`, daily `RRULE` for the remaining chapters (same as `reminderIcs()`) |
| POST | `/me/push-subscriptions` | 🔐 | Web Push / APNs / FCM tokens (later; D3 is `.ics` until a sender exists) |
| GET | `/journal` | 🔐 | Merged check-in notes + notes, newest first |
| POST | `/journal` | 🔐 ♻️ | `{text, mood?}` → `JournalNote` (safety-checked) |
| DELETE | `/journal/{id}` | 🔐 | |
| GET | `/progress/summary` | 🔐 🤖 | `ProgressSummary` (prod v2). Prod v1 reads `/progress/goals` (below). |
| GET | `/progress/goals` | 🔐 | Prod v1 "Your goals" cards: **the person's own journeys only**. The sample analyses (`wellnessAnalysis.ts`) are not served. |
| GET | `/progress/reports` | 🔐 🤖 | Two-week reports (`Report[]`), generated by a scheduled job (§8.5) |

### 5.9 Signal sources and connections

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/signal-sources` | 🔓 | Catalogue with the verbatim `reads` consent text (`V5_SOURCES` adds Whoop) |
| GET | `/me/connections` | 🔐 | `Connection[]`, all `off` for a new account |
| PUT | `/me/connections/{sourceId}` | 🔐 | `{state: "on"|"off", consentTextVersion}`. `on` returns `{authorizeUrl}` for OAuth vendors (Whoop, Oura) or `{nativePermission: "healthkit"}` for Apple Watch (mobile). |
| POST | `/signals/ingest` | 🔐 (device) / signed (vendor webhook) | Batched readings `{sourceId, readings[]}`; vendors call `/webhooks/{vendor}` |
| GET | `/me/signals/summary` | 🔐 | `?sessionId&versionId&window` → `SignalReading[]` (the check-in card) |
| DELETE | `/me/signals` | 🔐 | Erase all ingested signal data |

### 5.10 Publish, recreate, community, challenges

| Method | Path | | Notes |
| --- | --- | --- | --- |
| POST | `/sessions/{id}/publish` | 🔐 ♻️ | `{versionId}` → live = that version. `409 build_in_progress` while building. Title and text go through moderation (§8.7). Response includes `shares: ["title","sound","visuals","script"]`, `private: ["check_ins","journal","wearable","conversation"]` (the prod v2 note). |
| DELETE | `/sessions/{id}/publish` | 🔐 | Unpublish: forks keep credit; links show "no longer available" (decision 5) |
| POST | `/sessions/{id}/recreate` | 🔐 ♻️ | Fork **this** session's live version (logic C1) → `201 {session, conversation}` at v1.0 with `parent` |
| GET | `/challenges` · `/challenges/{slug}` | 🔓 | `Challenge` (+ `me` if signed in) |
| GET | `/challenges/{slug}/entries` | 🔓 | `?view=journey` (prod v2: "Made for this journey", by `addedAt`, no rank fields) · `?view=ranked` (prod v1 podium: by `qualifiedPlays`) |
| POST | `/challenges/{slug}/join` · `/leave` | 🔐 | |
| POST | `/challenges/{slug}/entries` | 🔐 | Submit own published session |
| GET | `/notifications` · POST `/notifications/read` | 🔐 | `?bucket=today|yesterday|week|month`; `{ids[] | before}` |

### 5.11 Wallet, plans, invite

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/me/wallet` | 🔐 | `Wallet` (coins). Shown only in Me, Invite and challenges (D4); the API does not care where. |
| GET | `/plans` | 🔓 | `Plan[]` with `entitlements` (logic A4: one table) |
| POST | `/me/subscription` | 🔐 ♻️ | `{planId, interval}` → checkout session (payment provider TBD, §11) |
| GET | `/me/invite` · POST `/invites/redeem` | 🔐 | Link + reward (500 coins today); redeem `{code}` |

### 5.12 Studies (the feedback group)

For the 30-person, 8-week outcomes pilot. Participants see only their own
tasks. The answers feed `/admin/studies` (§7).

| Method | Path | | Notes |
| --- | --- | --- | --- |
| GET | `/me/studies` | 🔐 | Studies the user is enrolled in, with `cohort`, `week` and `due[]` (which questionnaires are open) |
| POST | `/studies/{id}/consent` | 🔐 ♻️ | `{consentTextVersion, signedAt}`; required before any study data is stored |
| GET | `/studies/{id}/instruments/{instrument}` | 🔐 | Questions for `who5`, `isi`, `gad7`, `promis_cog`, `promis_fatigue`, `pss10`, `phq9`, `sleep_diary`, `weekly`, `value` (server-owned text, versioned) |
| POST | `/studies/{id}/assessments` | 🔐 ♻️ | `{instrument, week, answers[], completedAt}` → `201 {score}`. A PHQ-9 item 9 > 0 or total ≥ 20 creates a same-day safety item for the study lead. The participant never sees a PHQ-9 score. |
| POST | `/studies/{id}/session-states` | 🔐 | `{sessionId, versionId, before: 1..5}`: the before-play tap (the after is the existing check-in) |
| POST | `/studies/{id}/adverse-events` | 🔐 ♻️ | "Something felt wrong": free text, reviewed by a person |
| POST | `/studies/{id}/withdraw` | 🔐 | Stops collection; already-collected data is kept or deleted per the consent choice |

Admin (§7) adds:
- `GET /admin/studies/{id}`: criteria, cohorts, the trajectory.
- `GET /admin/studies/{id}/participants`: pseudonymous ids only.
- `GET /admin/studies/{id}/participants/{pid}`.
- `GET /admin/studies/{id}/quality`: missing assessments and follow-ups.
- `POST /admin/studies/{id}/follow-ups/{itemId}/resolve`.

The rules (study week, responders, the meaningful change per instrument,
adherence, completeness, success criteria) are the ones in
`src/admin/data/study.ts`, moved server-side.

---

## 6 · Telemetry and experimentation

These endpoints replace the demo's `/api/clicks` and `/api/config` (both
unauthenticated today).

| Method | Path | | Notes |
| --- | --- | --- | --- |
| POST | `/events` | 🔓/🔐 | Batched `{events: [{name, at, props}]}`. Names include `screen_view`, `tap` (labels and positions only, **never field values**), `session_played`, `checkin_answered`, `returned` (the three retention-simulation test events). Dropped unless `analytics` consent is on (decision 15). |
| GET | `/config` | 🔓 | Feature flags + `productionVersions` mapping (`[{label:1, ui:4}, {label:2, ui:5}]`) so the picker and its defaults move without a deploy |
| GET | `/me/consents` · PUT `/me/consents/{kind}` | 🔐 | `kind ∈ analytics, personalisation, marketing`; each stores the text version |

---

## 7 · Admin API (`/v1/admin`, separate scope)

Admin uses SSO with staff accounts only and has its own token audience
(`aud: admin`). RBAC uses the roles in `admin/data/mock.ts` (super_admin, ops,
moderator, analyst, ai_engineer). **Every mutation writes the audit log.**
This closes logic G1, the P0.

| Area | Endpoints (all 🔐 staff) |
| --- | --- |
| Users | `GET /admin/users` (filters: status, plan, role, q) · `GET /admin/users/{id}` · `PATCH …` (role, status: suspend/reactivate) · `POST /admin/users/invite` |
| Sessions | `GET /admin/sessions` · `PATCH /admin/sessions/{id}` (status, shelves, featured) · `POST …/takedown` |
| Challenges | CRUD `/admin/challenges` (pacing, reward tiers) |
| Moderation | `GET /admin/moderation/queue` (reports + safety flags) · `POST /admin/moderation/{id}/resolve` `{action, note}` |
| AI monitoring | `GET /admin/ai/metrics?from&to&route` (tokens, cost, latency p50/p95, refusals, fallbacks, safety flags, eval scores) · `GET /admin/ai/traces/{id}` (redacted) |
| Cockpit rules → AI policies | `GET/PUT /admin/ai/policies/{route}`: a versioned system prompt, effort, model, allowed changes and tone rules per AI route (§8.2). Draft → publish with rollback. Replaces the keyword `RULES` table. |
| Signal sources | CRUD `/admin/signal-sources` (consent text versioned; a new version re-asks users) |
| Revenue / payments / coins | Read models from the payment provider + ledger; `POST /admin/coins/grant` |
| Notifications | `POST /admin/notifications/broadcast` (segments) |
| Experiments | `GET/PUT /admin/experiments` (flag rollouts, version mapping) |
| Compliance | `GET /admin/compliance/requests` (export/delete), consent stats |
| Audit | `GET /admin/audit?actor&action&from` |
| *Later (staging only today)* | `GET /admin/outcomes` + `GET /admin/users/{id}/outcome`: WHO-5, check-ins and heart rate per user. **Not in prod's contract**; it needs the WHO-5 question in the app and the Compliance wording first. |

---

## 8 · The AI system

### 8.1 Principles

1. **Server-side only, one gateway.** Every model call goes through an
   internal `ai-gateway` service. It owns the policies, the safety layer,
   caching, retries, fallbacks, logging and cost. No client and no other
   service calls a model directly.
2. **Structured where it drives the product, free text where it is talked to
   people.** Anything the app acts on (intent, proposals, a session spec, a
   plan) is returned as **schema-validated JSON** (structured outputs). Only
   the words people read are free text.
3. **Deterministic decisions stay in code.** Free-limit counting, version
   numbers, the progress `trend`, qualified plays, reminder times and the
   WHO-5 thresholds (later) are code, not model judgement. The model explains
   them; it does not decide them.
4. **Nothing invented about the person.** The model is given only the
   person's own data. Prompts forbid claims about effects, scores or numbers
   not present in the input. Outputs are checked by a validator that rejects
   any number not traceable to the input.
5. **Every AI output names its basis.** `basis` on proposals; `basis` on
   progress summaries. It is the prod v2 "Why", and it doubles as an audit
   trail.

### 8.2 AI routes

Each route is one policy in `/admin/ai/policies`: a versioned system prompt,
model, effort, schema and limits.

| Route | Trigger | Input | Output (schema) | Latency target | Notes |
| --- | --- | --- | --- | --- | --- |
| `intent.infer` | `POST /onboarding/infer` | the Home sentence | `{goal?, feelings[], confidence, ask?}` | p95 < 1.5 s | Low effort; replaces `inferFromWords()` keyword rules |
| `cockpit.reply` | `POST …/messages` | system policy + session spec + onboarding + last check-in + conversation | streamed text + tool calls `propose_changes`, `start_build`, `suggest_prompts` | first token < 1.5 s | Medium effort; the conversation. Replaces `replies.ts`. |
| `proposals.generate` | reply calls `propose_changes`, a check-in, refresh | goal, style answers, words, session spec, last check-in, feedback, wearable summary, catalogue of allowed changes | `ProposalSet` (sections, options, `basis`) | p95 < 4 s | Options **must come from the allowed-change catalogue** (no invented change types); honours "no …" (`deckFor`). |
| `session.spec` | `POST …/builds` | current spec + chosen options + onboarding | `SessionSpec` (§8.4) | p95 < 8 s | High effort: the most consequential output |
| `session.script` | build stage `script` | `SessionSpec` | chapters with timed cue text | part of the build | Feeds TTS; safety-checked |
| `chapter.plan` | `POST /check-ins` | mood, note, chapter n, spec, history | `NextChapterPlan` | p95 < 3 s | The direction (keep, gentler, deeper) is chosen **in code** from the mood; the model writes the sentence and picks changes within it |
| `progress.words` | `GET /progress/summary` (cached), two-week job | check-ins, notes (if consented), wearable summary | `{headline, detail, basis}` | p95 < 3 s; cached per check-in | `trend` and `usual` are passed in, not computed by the model |
| `report.biweekly` | scheduled | 14 days of the above | `Report` | batch | Runs on the **Batches API** (async, cheaper) |
| `safety.classify` | every user-authored text | text + short context | `{flagged, category: self_harm | crisis | medical_emergency | abuse | none, severity}` | p95 < 600 ms | Runs before generation; see §8.7 |
| `moderation.publish` | publish, report | title, summary, script | `{allow, reasons[]}` | p95 < 2 s | Public content only |

### 8.3 Model and request settings

The AI provider is **Anthropic (Claude) via the Anthropic API**, using the
official TypeScript SDK (`@anthropic-ai/sdk`), matching the stack.

- **Model:** `claude-opus-5-5` for every route. Thinking is always on with this
  model, and depth is set per route with `output_config.effort`. The default is
  `medium`, so **always set it explicitly**: `low` for `intent.infer`,
  `safety.classify` and `progress.words`; `medium` for `cockpit.reply`,
  `proposals.generate` and `chapter.plan`; `high` for `session.spec` and
  `session.script`.
  - Whether some high-volume routes (`intent.infer`, `safety.classify`) move
    to a cheaper model is a cost decision for the product owner (§11), made
    only after an eval shows quality holds.
  - The model id is a policy field, so the change needs no deploy.
- **Structured outputs:** routes with a schema use the SDK's
  `client.messages.parse()` with `output_config.format` (Zod schemas shared
  with the API's own response schemas). Tool calls in `cockpit.reply` use
  `strict: true` tools with `tool_choice: auto`; forced tool choice is not
  supported on this model.
- **Streaming:** `cockpit.reply` streams (`client.messages.stream`). The
  gateway re-emits text deltas as the SSE `message.delta` events in §5.4.
- **Prompt caching:** the system policy and the allowed-change catalogue go
  first and stay byte-stable, with `cache_control` on the stable prefix. The
  person's data and the conversation come after it. Volatile values
  (timestamps, request ids) never go in the system prompt. Monitor
  `usage.cache_read_input_tokens`.
- **Refusals and fallbacks:** check `stop_reason` before reading content. A
  `refusal` is mapped to a safe, scripted reply, never a blank screen (logic
  D6). Server-side refusal fallbacks are enabled (`fallbacks: "default"`
  under the `server-side-fallback-2026-07-01` beta). Fallback events are
  logged to AI monitoring.
- **Retries:** the SDK retries 408/409/429/5xx twice. The gateway adds a
  circuit breaker and maps exhaustion to `503 ai_unavailable` with
  `retryable: true`.
- **Data:** journal and notes are sent only with `personalisation` consent.
  Names are not needed and not sent. Data residency and zero-retention terms
  are a decision (§11).

Illustrative gateway call for `proposals.generate` (SDK pattern as documented;
verify against the installed SDK when implementing):

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ProposalSetSchema } from "@aurelia/contract"; // the same Zod schema the API returns

const client = new Anthropic();

const response = await client.messages.parse({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  system: [{ type: "text", text: policy.systemPrompt, cache_control: { type: "ephemeral" } }],
  messages: [{ role: "user", content: renderProposalInput(context) }],
  output_config: { effort: "medium", format: zodOutputFormat(ProposalSetSchema) },
});

if (response.stop_reason === "refusal" || !response.parsed_output) {
  return scriptedFallbackProposals(context); // never an empty sheet
}
return validateAgainstCatalogue(response.parsed_output, allowedChanges);
```

### 8.4 SessionSpec and the build pipeline

The model never produces audio. It produces a **spec**, and the build pipeline
renders it.

```
SessionSpec {
  goal, lengthSec, voice: { gender: "female"|"male"|"none", pace: 0.6..1.2 },
  sound: { bed: "nature"|"music"|"frequencies"|"silence", layers: [{id, level 0..100}], tuningHz? },
  visuals: { palette: [hex], movement: 0..1, form: "orb"|"waves"|… },
  breath?: { inhaleSec, exhaleSec },
  chapters: [{ label, startSec, endSec, intent }],
  constraints: { excluded: ["frequencies", "spiritual_language", …] }   // the person's "no …"
}
```

Pipeline stages (the `Build.stage` values): `plan` (`session.spec`) →
`script` (`session.script`) → `voice` (TTS vendor) → `sound` (sound-bed and
layer rendering, vendor or library) → `visuals` (parameters; generated imagery
later) → `mix` (loudness-normalised master, HLS + MP3) → `publish_assets`
(CDN).

The voice, sound and visual vendors sit behind internal interfaces
(`TtsProvider`, `SoundProvider`, `VisualProvider`) so they can be swapped. The
vendor choice is open (§11). Higgsfield is connected to our workspace as a
candidate for generated visuals and audio, to be evaluated. The prod web
player renders visuals from parameters today, so the API needs nothing more
for prod v1/v2.

### 8.5 Journey intelligence

- **Check-in → next chapter.** Code picks the direction from the mood:
  1–2 = gentler, 3 = keep, 4–5 = keep what worked and go a little deeper. It
  also picks the unlock time: tomorrow, or tomorrow night for sleep. The model
  (`chapter.plan`) writes the sentence and selects up to 3 allowed changes
  consistent with the direction. The result is the prod v2 "Chapter 2 keeps
  what worked and goes a little deeper." Prod v1 shows only the headline and
  the reminder.
- **Progress in words.** `trend` and `usual` are computed as in `feelingSummary`.
  The model writes `headline`/`detail` from them, under a rule: no
  percentages, no projections, no clinical words. The result is cached per
  check-in. Two-week reports are generated by a scheduled job in batch.

### 8.6 Voice input

`/uploads/voice` transcribes server-side with a speech-to-text vendor (open,
§11). The transcript becomes the message text. The audio is deleted after
transcription unless the user keeps voice notes. `vercel.json` currently
blocks the microphone (`Permissions-Policy`); that must change before launch.

### 8.7 Safety (mandatory)

- **Where it runs:** `safety.classify` on every user-authored text before any
  other route: messages, voice transcripts, check-in notes, journal, publish
  fields.
- **When it flags `crisis`/`self_harm` (severity ≥ medium):**
  - generation pauses for that turn;
  - the assistant returns the **scripted** support message, with local crisis
    resources by `locale` (`problem.code: unsafe_content` for non-chat inputs;
    in chat, a `message.completed` with `safety.flagged: true` and a support
    card);
  - a moderation item is created for a human. Aurelia never "treats".
- **Content rules for every generative route:** no medical claims, no
  diagnosis, no numeric health promises (decision 13), no
  spiritual/frequency claims when the person excluded them.
- **Moderation:** published content passes `moderation.publish`. User reports
  go to `/admin/moderation`.
- **Required before launch:** a written safety policy with clinical and legal
  review (logic H1–H3). This contract only provides the hooks.

### 8.8 Quality, evals and cost

- **Evals per route before launch, rerun on every policy change:**
  - golden conversations from the six personas and the three interviews;
  - "honours no …" checks;
  - "no invented numbers" checks;
  - schema validity;
  - basis faithfulness.
- 👍/👎 feedback (`…/feedback`) and the `checkin_answered` event feed the eval
  sets.
- **AI monitoring** (`/admin/ai/metrics`) tracks, per route: tokens, cost,
  latency, refusals, fallbacks, safety flags and eval score.
- **Budgets:** a hard per-user daily AI cost ceiling (alerts at 80 %), the
  plan's build limit, and per-route `max_tokens`. Cost per **completed core
  loop** (onboard → first chapter played → check-in) is the headline metric,
  not cost per request.

---

## 9 · Non-functional requirements

| Topic | Requirement |
| --- | --- |
| Availability | 99.5 % for the core loop; AI degradation returns scripted fallbacks, never a dead screen |
| Latency | Non-AI reads p95 < 300 ms; first streamed token < 1.5 s; first build < 60 s, typical < 30 s (the generating card's UX assumes under a minute) |
| Offline (PWA) | `/v1` responses are **never** cached by the service worker (existing rule). Catalogue and playback media use CDN caching with `Cache-Control` + range support for audio (the existing session-audio cache). |
| CORS / CSP | `connect-src` gains `https://api.aurelia.care` and the media CDN host; credentials over CORS only from the two web origins |
| Security | OWASP ASVS L2; refresh tokens httpOnly + SameSite=Lax; admin behind SSO + IP allowlist; secrets in a vault; per-tenant encryption of the journal and notes at rest |
| Privacy | GDPR and local health-data rules: data export and deletion (§5.1), consent with versioned text (§6), retention: messages 24 months, voice audio 0 days by default, signals 12 months, journal until deleted |
| Observability | `requestId` on every response; OpenTelemetry traces across the API, gateway and vendors; PII-free logs |
| Contract tests | The Zod schemas are the contract source. `openapi.yaml` is generated from them in CI, and both clients run contract tests against a mock server built from it. |

---

## 10 · Phasing

| Phase | Ships | Unblocks |
| --- | --- | --- |
| **P0 · Accounts and persistence** | §5.1, §5.2 (without `infer`), `/me`, consents; journey, check-ins and journal persisted (no AI yet); admin auth + audit | The real 8–12 person test, and closes G1 |
| **P1 · The AI core loop** | `intent.infer`, conversations + streamed `cockpit.reply`, proposals with `basis`, builds (spec → script → TTS → mix), playback, plays, `chapter.plan`, reminders (.ics), safety | Prod v1 and v2 run on real data end to end |
| **P2 · Progress and signals** | `progress.words`, two-week reports, signal sources (Apple Health first, then Whoop and Oura), push reminders | Prod v2's promises, without example data |
| **P3 · Community and economy** | Publish/recreate with lineage, challenges (journey + ranked views), wallet/ledger, plans + payments, notifications | Discover, Me → Credits & plan |
| **P4 · Admin and growth** | Admin modules on real data, AI policies console, experiments and config, the outcomes module | Operations at scale |

---

## 11 · Decisions needed

| # | Decision | Recommendation | Owner |
| --- | --- | --- | --- |
| 1 | Confirm the §2 decisions (persistence, builds-based limit and N, one version model, integers + formatting rule, provenance) | Accept as written | Product owner |
| 2 | Free plan N builds per day, and what Plus/Pro add | 5 builds/day free; Plus: 30/day, 20-min sessions, all voices; Pro: unlimited fair use + analytics | Product owner + business owner |
| 3 | AI cost posture: keep `claude-opus-5-5` on every route, or evaluate a cheaper model for `intent.infer` / `safety.classify` | Start on `claude-opus-5-5` with per-route effort; run the eval before any downgrade | Product owner |
| 4 | TTS, sound and visual vendors | Shortlist three per stage, blind listening test with the interviewees (voice quality came up in the interviews) | Head of Product |
| 5 | Speech-to-text vendor and the microphone policy | Pick with TTS; update `vercel.json` before P1 voice | Head of Engineering |
| 6 | Data residency and AI data-retention terms | Decide with legal before P1; affects which API platform and region | Legal + Engineering |
| 7 | Safety policy and crisis resources per country | Written policy + clinical review before any public beta | Product owner + clinical advisor |
| 8 | Payment provider and coin economy table (decisions 11–12) | Stripe (web) + store billing (mobile); one coin ledger | Product owner |
| 9 | WHO-5 in the app (prerequisite for admin outcomes) | Ask at start + every two weeks with the report, behind consent | Product owner + Compliance |
| 10 | Hosting | Keep Vercel for web; API + workers on a container platform with a Postgres + object store + queue | Head of Engineering |

---

## Appendix · Mapping from today's mock to this contract

| Client code today | Becomes |
| --- | --- |
| `lib/sessions/data.ts`, `queries.ts` | `GET /sessions`, `/sessions/{id}`, `/people/{slug}` |
| `chat/thread.ts` `OPENING_MESSAGES`, `RECOMMENDATIONS` | Removed: every conversation is the person's own; `ProposalSet` from `proposals.generate` |
| `lib/replies.ts` `RULES` | `cockpit.reply` policy (admin "Cockpit rules" → AI policies) |
| `chat/firstSession.ts` `deckFor`, `inferFromWords` | `proposals.generate`, `intent.infer` |
| `chat/addOptions.ts` | The allowed-change catalogue (server reference data) |
| `ChatPage` `FREE_SENDS` / `FREE_RESET_MINUTES` | `Entitlements` (builds-based, server-enforced) |
| `lib/onboarding.ts` (`aurelia.onboarding`) | `/me/onboarding`, `/reference/goals` |
| `lib/journey.ts` (`aurelia.journey`), `feelingSummary`, `reminderIcs` | `/journeys`, `/check-ins`, `/journal`, `/progress/summary`, `reminder.ics` |
| `lib/signals.ts` (`connectionsForWearable`) | `/signal-sources`, `/me/connections` |
| `lib/wellnessAnalysis.ts` (sample analyses) | Not served (prod v1 shows own journeys; S1) |
| `lib/credits.ts`, `notifications.ts`, `challenges.ts` | `/me/wallet`, `/notifications`, `/challenges` |
| `api/config.ts`, `api/clicks.ts`, `api/annotations.ts` | `/config`, `/events`; annotations stay an internal staging tool |
| `admin/data/mock.ts` | `/admin/*` |
