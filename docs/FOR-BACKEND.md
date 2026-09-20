# Aurelia — for a backend engineer

**There is no backend.** Both clients are frontend-only, running on mock data
compiled into the bundle. This document is the specification for the backend
that has to exist, written from what the product already does — every screen,
every state, every figure it shows — rather than from a wishlist.

Read it as: *here is what the clients will call, and here is why each field is
shaped the way it is.* Where a decision has not been made, it says so and does
not invent one.

> **Status** Written 20 Sep 2026 against `mobile_app` @ `e4fc580` and
> `web_app` @ `4dfaa4b`. Kept identical on all three branches.

---

## 0 · Read this first

| Fact | Consequence for you |
| --- | --- |
| One app per git branch | `web_app` = React client + admin CMS · `admin_cms` = identical copy · `mobile_app` = Flutter. There is no `main`/`master` with everything in it. |
| All data is `const` in the bundle | `src/lib/*.ts` (web) and `lib/core/data/*.dart` (Flutter) are the entire "database". 27 sessions, 2 challenges, a notification feed, 6 signal sources. |
| Every figure is invented | "18.5k plays", "−43% stress", "1,323 credits" came from nobody's measurement. They are deliberately specific so a demo can be reasoned about. Do not treat them as seed data with meaning. |
| The two clients must agree | The web app is the reference implementation. Any API you design is consumed by both, and a field that only one can use is a bug in the design. |
| Exactly one server endpoint exists | `api/config.ts` on `web_app` — the demo feature-flag store. It is not part of the product. See §8. |

---

## 1 · The domain, as the clients already model it

These are not proposals. They are the shapes the UI reads today, field for
field, in `lib/core/data/sessions.dart` and `src/lib/sessions.ts`.

### 1.1 Session

The central object. A session is a generated audio meditation with a
structure, a provenance chain, and reported outcomes.

```
Session
  slug             string      stable id, used in every URL: /play/{slug}
  title            string
  photo            enum key    into a fixed cover-photo map, NOT a URL (see §6)
  gradient         [color]     painted under the photo; the floor, not a fallback
  description      string      one line, shown on cards
  summary          string      a paragraph, shown on detail and the player sheet
  author           string      display name
  authorPhoto      enum key    creator portrait
  authorRole       string      e.g. "Community creator · 34 published sessions"
  plays            string      PRE-FORMATTED: "18.5k", not 18500
  recreated        string      PRE-FORMATTED: "1.5k"
  minutes          int         nominal length
  seconds          int         the m:ss remainder the design shows
  category         string      one of 5: Meditations, Music, Energy, Sleep, Calm
  intent           string      the creator's stated goal, one sentence
  outcome          [Outcome]   self-reported effects — see the warning below
  layers           [SoundLayer]
  chapters         [Chapter]
  personalization  [LabelValue]
  commonChanges    [LabelValue]  what recreators most often change, with a share
  lineage          [LineageStep] provenance, oldest first
  safety           [string]    disclaimers shown on detail
  shelves          [enum]      community | picked | impact — which rows it appears on
  published        bool        false = a draft, visible only to its author
```

```
Outcome      { label, value, note }    e.g. Stress / "−43%" / "self-reported, first week"
SoundLayer   { id, name, detail, level }   level is 0–100, how present in the mix
Chapter      { label, minutes, detail }
LabelValue   { label, value }
LineageStep  { title, author, note }
```

**`plays` and `recreated` are strings, and that is a decision to revisit.** The
clients render them verbatim because the design specifies "18.5k", not 18500.
A real API should return integers and let the clients format — but then both
clients need the same abbreviation rule, or the same session reads differently
on each. Pick one and put it in the API contract.

**`outcome` is self-reported and must stay labelled as such.** Every value
carries a `note` saying where it came from, and the PRD makes this a
requirement rather than a nicety: presenting "−43% stress" unqualified next to
a wellness claim is a regulatory problem. Your API must carry the provenance
string, not just the number.

**`totalMinutes` is derived, not stored.** It is the sum of `chapters[].minutes`.
The clients compute it. If your API returns both a length and chapters, they
will disagree eventually.

### 1.2 Derived, not stored

Three things the clients compute. Decide deliberately whether the backend takes
them over — each has a reason for being derived.

| Value | Rule | Why derived |
| --- | --- | --- |
| `isRecreated` | `lineage.length > 2` | Every session starts from an Aurelia starter template. Two steps = an original; a third means a person stood between. A stored flag would drift from the chain it describes. |
| `totalMinutes` | `sum(chapters.minutes)` | One source for a duration. |
| tags on the player | slug + category + layer names + personalization labels | Adding a `tags` field would mean editing 27 entries to say what the other fields already say. |

### 1.3 Person

Assembled from published sessions, never stored as its own list.

```
Person { name, slug, photo, role, sessions[], isSelf }
```

A creator with no published sessions has no profile. This is deliberate: a
separate people table drifts from the sessions table. If your backend has a
users table (it will), the *profile* endpoint should still project from
published work rather than from a denormalised counter — or you will ship a
profile claiming 34 sessions next to a shelf showing 4.

**Drafts must never swell a published count.** `kPublishedSessions` vs
`kSessions` in Flutter, `PUBLISHED_SESSIONS` vs `SESSIONS` on web. Every public
surface reads the published list. Only "Created by you" on the Sessions screen
reads the whole thing.

### 1.4 Version / cut

The cockpit produces versions of a session. Today this lives in memory in
`ChatSessionController` (Flutter) / `ChatSessionContext` (web).

```
DraftVersion { id, label, change, at, slug }
```

- `label` is the human name: "Sleep meditation v1.2" → "v1.3".
- `change` is what produced it, **in the user's own words**.
- `slug` is the catalogue session this cut stands in for (nothing is really
  generated yet — see §5).

**Version labels bump off the newest version, not the current one.** Revert to
v1.2 with a v1.4 in the list and the next change is v1.5, not a second v1.3.
History stays a list, not a tree. That is the right shape for a demo and the
only one a single progress card can point at honestly — but a real system may
want a tree, and if it does, the UI needs redesigning first.

### 1.5 Publish state

```
publishSession(slug)    → published = true
unpublishSession(slug)  → published = false
isPublished(session)    → thisRunsRecord[slug] ?? session.published
```

A **map**, not a set of published slugs: a catalogue session that shipped
published has to be able to go the other way. Your API needs both directions.

The cockpit's menu derives its label from two values:

| `publishedVersionId` | vs `currentVersionId` | Menu shows |
| --- | --- | --- |
| null | — | **Publish** |
| equal | — | *nothing* — a button that would do nothing is worse than no button |
| different | — | **Republish** |
| any non-null | — | plus **Unpublish** |

So the API must be able to answer "which cut is live", not just "is it live".

### 1.6 Challenge

```
Challenge
  slug, title, summary, photo, gradient
  joined          string    pre-formatted, "2.3k" or "0"
  points          int       what finishing is worth, in coins
  endsInDays, totalDays, minutesPerDay
  yourDay         int?      null = the current user has not joined
  leaderboard     [Contender]
  sessionSlugs    [string]  sessions made for this challenge

Contender { rank, sessionSlug, creator, creatorPhoto, plays, trend }
```

**The board ranks sessions, not people.** What competes is the work; the
creator is credited beside it. `trend` is `up | down | null`, and null on the
podium because the top three show no arrow.

One of the two challenges is deliberately empty — `joined: "0"`, no
leaderboard, no sessions — so the day-one state of a challenge exists in the
data rather than only in someone's imagination.

### 1.7 Credits

```
CreditEntry { id, who, what, age, amount }
INVITE_LINK, INVITE_REWARD = 500, TOTAL_CREDITS = "1,323"
```

**The coin economy has exactly one defined rule: the referral reward.** Earning
and spending are otherwise unspecified — see §9. Do not design a ledger schema
until that is answered, because the answer determines whether entries are
immutable postings or mutable balances.

### 1.8 Notification

```
Notification { id, actor, actorPhoto, action, age, bucket, sessionSlug, sessionPhoto }
```

`age` is pre-formatted ("1s", "2m", "3h", "2d") and `bucket` groups the feed
(Today / Yesterday / Earlier). Both should become server-side timestamps with
client-side formatting — same argument as `plays`.

### 1.9 Signal source (the consent surface)

```
SignalSource { id, name, group, icon, defaultOn, reads }
```

`reads` is the sentence saying *what Aurelia actually reads from it*. This is
not marketing copy; it is the consent record. If your backend stores consent,
it must store the text the user consented to, versioned — not a boolean.

---

## 2 · Endpoints the clients imply

Nothing here exists. This is the surface the screens already need.

### 2.1 Auth

| Route | Notes |
| --- | --- |
| `POST /auth/sign-up` | email, password, consent flags. The sign-up form has a special-category consent checkbox — see §7. |
| `POST /auth/sign-in` | |
| `POST /auth/forgot-password` | **Must not reveal whether an address is registered.** The confirmation copy is identical either way, and the PRD names this as a decision, not an oversight. |
| `POST /auth/reset-password` | Token in the link. Expired/used tokens have no designed state yet (§9). |
| `POST /auth/sso` | Verify a Google/Apple id token server-side. See §3. |
| `POST /auth/sign-out` | |
| `DELETE /account` | The screen exists; the confirmation state does not. |

**Session lifetime is unanswered.** Both clients hold "signed in" as a boolean
in memory and start signed out on every launch. That is a demo setting with an
expiry date, not the session model. You are choosing it.

### 2.2 Catalogue

| Route | Notes |
| --- | --- |
| `GET /sessions?shelf=&category=` | Shelves: `community`, `picked`, `impact`. Categories: the five above plus "All". |
| `GET /sessions/{slug}` | The full record in §1.1. |
| `GET /sessions/mine` | Published **and** drafts — the only surface that returns unpublished work. |
| `GET /people/{slug}` | Projected from published sessions. |
| `GET /creators` | "Trusted Creators" on Explore. Ranking input undefined (§9). |

Three shelves — "Picked for You", "Trusted Creators", "Sessions with Biggest
Impact" — **each imply a ranking with no defined input set.** The last is built
on self-reported outcome figures, which is a weak basis for a shelf with that
title. Flagged as P2 in the PRD; it is your problem the moment the endpoint is
real.

### 2.3 The cockpit (the actual product)

This is the loop the whole app exists for, and it is the least specified.

| Route | Notes |
| --- | --- |
| `POST /threads` | Start a session-building conversation. |
| `POST /threads/{id}/messages` | Text or voice. Returns Aurelia's reply. |
| `POST /threads/{id}/build` | Apply the chosen changes, produce a new cut. |
| `GET /threads/{id}/versions` | The cut list. |
| `POST /sessions/{slug}/publish` / `unpublish` | §1.5. |

**The reply engine is a keyword matcher, and it is honest about that.**
`replies.ts` / `replies.dart` holds ~20 rules matched in order, first match
wins, with a fallback that says it took a note rather than pretending to
understand. When a model sits behind this, the contract the clients depend on
is the *shape*, not the text:

```
Reply {
  text      string
  proposes  bool        hand over the recommendation deck
  changes   bool        this produces a new cut
  prompts   [string]?   questions offered instead of an answer
}
```

`changes: true` is the one that matters most: it means the client must show a
new version. Saying "adding white noise underneath" over a card still naming
the previous cut is the app claiming to have done something it did not do.

**Generation has no failure state designed.** Not timeout, not rejection, not
offline. The cockpit *is* the product and its only failure mode is undesigned —
top of the list in PRD §07. Do not ship the endpoint before that conversation
happens.

### 2.4 Playback

| Route | Notes |
| --- | --- |
| `GET /sessions/{slug}/audio` | Today: one 10-second bed, `assets/audio/session-bed.wav`, byte for byte the same file on both clients. |
| `GET /sessions/{slug}/versions/{id}/audio` | **Each cut is its own recording.** The clients key the deck on `slug#versionId` precisely so pressing play on v1.2 does not keep playing v1.3. |
| `POST /sessions/{slug}/plays` | Nothing counts plays today. |

Clip length is read off the engine, not assumed — the bed is 10s and a real
session will not be. Your API should still return a duration so a player can
draw a bar before the first byte arrives.

### 2.5 Challenges, credits, notifications

| Route | Notes |
| --- | --- |
| `GET /challenges`, `GET /challenges/{slug}` | |
| `POST /challenges/{slug}/join` | **Joining does not change state in either client yet.** Publish does; Join does not. |
| `GET /credits`, `GET /credits/history` | |
| `GET /notifications` | Bucketed feed. |
| `GET /signals`, `PUT /signals/{id}` | The consent toggles. |

---

## 3 · SSO — the seam is built, the verification is not

`lib/core/auth/sso.dart` (Flutter) defines `SsoProvider.signIn(provider)`
returning an `SsoAccount { provider, id, email, name, photo, idToken }`, with
three distinct failures: `cancelled`, `network`, `rejected`. A
`DummySsoProvider` returns a fixed account after ~900 ms. Nothing talks to
Google or Apple.

Two things for you, both in `docs/SSO.md`:

**Apple's email is not an identifier.** It is sent once, on first
authorisation, and may be a private relay address that stops working if the
user disconnects the app. **Accounts must key off the provider's stable id.**
The dummy returns a relay address on purpose so nobody writes code assuming
otherwise.

**A signed-in state is currently a client-side claim.** The id token is what a
backend verifies, and there is no backend to verify it — the same limitation
the email-and-password path already has.

---

## 4 · Admin (`/admin` on the web branches)

Fifteen modules exist as screens: Dashboard, Users, Sessions, AI Monitoring,
Payments, Revenue, Pricing, Coins, Moderation, Compliance, Roles, Experiments,
Notifications, Audit, Settings.

> ### `/admin` has no authentication of any kind.
> Every module is reachable by typing its URL. This is the P0 in the PRD and it
> is in the code, not just the document. It needs real auth, roles and an audit
> trail before the backend exists, not after — the Roles and Audit screens are
> already drawn and will imply capabilities the API must actually enforce.

---

## 5 · What is mock, precisely

| Looks real | Actually |
| --- | --- |
| 27 sessions with full structure | compile-time constants |
| Play counts, recreations, outcomes | invented, deliberately specific |
| Audio playback | one 10-second bed, looped, for every session |
| Voice memo | **the mic is real**; the transcript is a fixed sample string |
| Google / Apple sign-in | two real paths, a dummy behind both |
| Publish / unpublish | a map held in memory for the run |
| Cover art | hotlinked from Unsplash at runtime |
| Credit balance and history | constants |

**The microphone is the one genuinely real input.** `VoiceCapture` opens the
device, the level meter is drawn from actual amplitude, the clip is written to
disk and plays back in the thread. Only the words under it are fake. Wiring a
speech service replaces `_transcribe` in `voice_recorder.dart` and nothing
else.

---

## 6 · Media: the part that will bite

**Cover art is hotlinked from Unsplash at runtime**, keyed by a `photo` enum
rather than a URL. Every card layers that photo over a token gradient, and the
gradient is the floor, not a fallback — a card with no network still reads as
designed.

Consequences:

1. **An app showing flat gradients is not broken; it has no network.** This is
   the single most common false bug report on this codebase.
2. Your API should return real image URLs *and* the gradient pair, because the
   clients will keep painting the gradient underneath.
3. Hotlinking a third-party CDN is fine for a demo and not for production
   (PRD P2). You are inheriting an image pipeline: upload, resize, cache,
   rights.
4. Flutter's `Image.network` has an in-memory cache only — no disk cache — so
   scrolling away and back re-downloads. The usual fix pulls in native plugins,
   which the mobile app has been careful about. Worth it when the artwork is
   ours.

---

## 7 · Privacy, consent and the things a lawyer will ask about

This is a **mental-health product**. Four items are already live decisions in
the UI:

1. **Special-category data.** Mood, sleep, voice recordings and biometrics.
   The sign-up checkbox is not sufficient; PRD P1 says this needs legal review.
   Your schema will hold this data — design retention and deletion before the
   first row.
2. **Consent text is versioned data, not a boolean.** See §1.9.
3. **Password reset must not reveal registration.** §2.1.
4. **The leaderboard is public by default.** The PRD calls this out explicitly
   as a decision about a mental-health product rather than a detail. Whether a
   challenge participant must appear publicly is open (§9).

---

## 8 · The one existing endpoint, and why it is not a model

`web_app/api/config.ts` — the demo feature-flag store.

```
GET  /api/config  → { configured: bool, flags: { [id]: bool } | null }
POST /api/config  → replaces the flag set
```

Backed by Upstash Redis over its REST API (`KV_REST_API_URL` +
`KV_REST_API_TOKEN`, injected by Vercel). With those absent it returns
`configured: false` and the client falls back to compiled defaults.

> **`/api/config` is unauthenticated.** Anyone who finds it can POST a new flag
> set, including the site lock. Narrow by design — it only stores booleans —
> but it is not a pattern to copy, and the site lock in front of the app is a
> courtesy, not a control: the check runs in the browser and the password is
> inlined into the JavaScript bundle.

---

## 9 · Decisions you are blocked on

From PRD §09, unchanged and unanswered:

1. **What is the real session lifetime?** "Signed out every launch" is a demo
   setting.
2. **What earns a coin, and what spends one?** Blocks the ledger schema.
3. **What does the free tier cap, and what does paying remove?** The cockpit
   pauses after 3 sends today — a number chosen for a demo, not a plan. No
   pricing model exists anywhere (P0).
4. **Must a challenge participant appear on the public leaderboard?**
5. **What happens to sessions personalised on a signal the user has since
   switched off?** Regenerate, freeze, or warn — all three are defensible and
   the data model differs for each.
6. **Who owns a recreated session, and what share of its coins reaches the
   original creator, through how many generations of lineage?** Lineage is a
   chain, not a single parent, so this is a graph-payout question.

Plus one you inherit outright: **the referral reward on sign-up alone is
trivially farmable** with disposable email. It needs an activation trigger, a
per-account cap and a self-referral check.

---

## 10 · Where to read further

| File | On branch | What it holds |
| --- | --- | --- |
| `docs/PRD.md` | all three | Product requirements and every "why" behind a behaviour. Identical on all branches by rule. |
| `docs/SSO.md` | `mobile_app` | The SSO seam, packages, entitlements, and what verification needs. |
| `docs/FOR-MOBILE.md` | all three | The Flutter client in detail. |
| `docs/FOR-AI-AGENT.md` | all three | Orientation for an automated agent, including the traps. |
| `CLAUDE.md` | each branch | That branch's own engineering notes. Different per branch — read the one you are on. |
| `src/lib/*.ts` | `web_app` | The entire mock dataset, heavily commented. |
| `lib/core/data/*.dart` | `mobile_app` | The same dataset in Dart. |
