# Aurelia — frontend readiness for a running product

Written for whoever has to answer "what does the frontend need before this is
a real product, not a demo?" — a PM sequencing work, or an engineer picking up
the next ticket. It is not a wishlist; every item below is tied to a specific
gap in the code as it stands today, not a generic pre-launch checklist copied
from somewhere else.

**Part I is what a real end user hits.** The first version of this document
led with engineering infrastructure — data fetching, bundle splitting, test
tooling — which are real and necessary, but answer "what does an engineer
need to build this on," not "what breaks for the person actually using the
app." Part I is that second question, asked directly. Part II is the
supporting engineering work underneath it, kept because it's still true, but
it is the *means*, not the point. **Part III is a risk register**,
specifically for the moment real AI and a real backend replace the mock
cockpit and the mock catalogue — written for a project that has no developer
seated yet and is still finalizing scope with the client, so every risk ends
in something to *decide or specify now*, not something to code now.

**All three parts are about the consumer site at `web_app`'s main routes —
not `/admin`.** The admin CMS has its own gaps, covered in passing in Part
II only because a couple of its fixes (lazy-loading, a password gate) are
cheap and unrelated to the client-facing product; nothing here is scoped
around it.

> **Status** Written 2 Oct 2026 against `web_app` @ `ca14759`. Kept identical
> on `web_app` and `admin_cms` the way the other `docs/FOR-*.md` files are.

---

# Part I · What a real end user hits

## 1 · Every "blank slate" screen, not just the one PRD already names

`docs/PRD.md` §08 lists "Day-0 user with no personalisation" as a missing
state, scoped to Home's Quick Start and Live Sessions. **The real scope is
every screen that shows a statistic or a history**, because the mock catalogue
is never anything but an established, active account:

| Screen | What it assumes | What a real day-0 user actually has |
| --- | --- | --- |
| Home | Quick Start, Live Sessions populated | Nothing made yet |
| Profile | "6 Posts," 18,513 plays, a Sessions/Recreated shelf | Zero of everything |
| Progress / My Wellness | Chapters, Social Impact, Insights tabs all have data to chart | Nothing to chart — these tabs have never been empty in the mock data |
| Credits | A balance and five history rows | 0 credits, no history |
| Challenges | A leaderboard to view | Possibly no challenge joined at all |
| Notifications | A bucketed feed (Today/Yesterday/Earlier) | An empty feed, on day one, forever until something happens |

None of these have a designed empty state today because the mock catalogue
can't produce one — `Adam Nilson` always has history. This needs actual
design work, not just an engineering fallback, because "zero everything"
is the literal first five minutes of every real account that will ever exist,
and right now it's the one experience nobody has looked at.

## 2 · The cockpit's real latency has no UI — this is bigger than "failure," which PRD already names

PRD §08 names *generation failed or timed out* as the cockpit's missing
state. That's the failure case. The **success case that takes real time** is
a separate, unaddressed gap: today, asking for a session and getting "a new
cut, named v1.3" is instant, because `replyTo()` is a keyword match
(`src/lib/replies.ts`) and nothing actually generates audio. A real model
reply and real audio generation each take real wall-clock time — plausibly
seconds for a chat reply, and meaningfully longer for a full session's worth
of mixed audio.

This needs a designed wait state that is not just a spinner: how long is
"too long" before the UI should say so, can the user navigate away and come
back to a session still generating, does a finished session need to notify
them (push/in-app) if they've left the cockpit, and does the existing
version-list UI (`DraftVersion`) show "generating" as a distinct state from
"ready" — today it only knows "exists."

## 3 · Real audio delivery, not a 10-second looped bed

Every session plays the same `assets/audio/session-bed.wav`, byte-identical
regardless of the session (`docs/FOR-BACKEND.md` §2.4). A real generated
10–20 minute file changes the playback UX in ways that don't show up yet:

- **Progressive playback vs. full download.** Waiting for a 15-minute file to
  finish downloading before "Play" works is a bad default; streaming or
  chunked playback needs a decision and a loading state the scrubber can show
  (buffered-vs-played, the way video players distinguish the two).
- **iOS Safari blocks audio that doesn't start from a direct user gesture.**
  The very first play on iOS must be triggered by the tap itself, not by a
  state update that happens after — a common, silent failure mode for
  exactly this kind of app, and nothing in the current player
  (`u-scrubber`, `AudioPlayerContext`) has been exercised against it, since
  the Playwright verification used in this project runs Chromium only.
- **Background/cross-route playback.** `AudioPlayerProvider` is deliberately
  mounted above the router "so a session being built has to survive leaving
  /chat to play it and coming back" — that's the right instinct, but it's
  only been proven for in-app navigation. A real user backgrounding the
  browser tab or locking their phone mid-session is a different code path
  (media session API, lock-screen controls) that doesn't exist yet.

## 4 · Getting signed out on every reload is not a demo quirk to a real user — it's why they leave

`AuthContext` holds `signedIn` in memory with no persistence, "so the app
opens on the case for itself" — explicitly a demo setting, per both
CLAUDE.md and PRD's own open question #1 ("what is the real session
lifetime?"). Translated to a real person: they close the tab, open it
tomorrow, and are signed out — for a habit-forming wellness product, that is
not a rough edge, it's the single most retention-costing gap on this list.
Worth prioritizing above almost everything else here, specifically because
it's invisible in every demo (nobody closes the tab and comes back a day
later mid-walkthrough) and maximally visible to every real user.

## 5 · The payment flow is a page, not a flow

`/upgrade` exists as a screen, but PRD's own P0 is blunt: "No pricing or
subscription model exists anywhere in the product." Once one does, the FE
work is a second project of its own: card entry and validation, 3D Secure
redirect/challenge handling, a specific UI for a declined card, proration
copy when switching tiers mid-cycle, a cancel/downgrade flow, and receipts.
None of this is built, and none of it can be, until the pricing decision
lands — but it's worth naming now so it isn't discovered as a surprise-sized
project the week pricing finally ships.

## 6 · Consent toggles don't connect or disconnect anything

My Wellness's signal sources (`src/lib/signals.ts`, now also mirrored in the
admin Signal Sources module) are booleans in local state. A real Apple Watch
or Oura Ring connection is an OAuth grant: turning one on needs a real
redirect/consent flow, and turning one off needs to actually **revoke** that
grant, not just flip a switch — which means a "disconnecting…" state and a
failure mode ("we couldn't disconnect that, try again") that the current
toggle has no room for. This is also where the admin-side consent text
(`reads`) stops being documentation and starts being the literal string a
real OAuth consent screen needs to show.

## 7 · Account deletion doesn't delete anything

PRD §08 is direct: "Delete is missing entirely, not just its state." Today,
confirming deletion on `/settings` just signs the session out — the account
and its data are untouched. For a real user, this is both a trust question
(did it actually work?) and a compliance one (GDPR's right to erasure). The
FE needs a real async flow here: a confirmation that the *request* was
received, realistic language about when it completes (immediately? a grace
period?), and a transactional email trigger — none of which has a UI pattern
in this app yet, because nothing today is asynchronous enough to need one.

## 8 · Numbers that claim to be real need to *be* real once real users exist

Home's "Ongoing Live Sessions" shows a world map of global activity, and
Explore's "Trusted Creators" and the various leaderboards imply a ranking
over real usage. All of it is invented today, which is honestly labeled
throughout this project's own docs — but the moment real users exist in
small numbers, a confident "2,847 people meditating right now" stops being
charming placeholder content and starts being a specific, visible lie to the
first thousand real people who can tell the number doesn't match a quiet
app. This needs a decision before launch, not after: wire it to something
real (which likely means the websocket/polling layer this app doesn't have
yet), or redesign the module to not claim a number it can't back — not
"ship it and see."

## 9 · Error and empty-state copy needs this product's own voice

`replies.ts`'s fallback reply is deliberately specific: *"Got it — I've
noted that for the next revision of your session"* rather than "Sorry,
something went wrong." The whole product is written in that register — calm,
specific, never apologetic-sounding. A generic toast library's default
copy ("Error: request failed with status 500") would be a tone break on
every single error surface at once, the first time any of them actually
fires. This is content work, not just an error-boundary component, and it's
cheap to do *before* errors are common and expensive to retrofit toast by
toast afterward.

## 10 · Accessibility and real device diversity, not the one Chromium viewport this project has tested in

Every verification in this project's history — including every Playwright
script run this session — has been Chromium, usually at one or two fixed
viewport widths. Real end users bring: screen readers (the cockpit is
chat-shaped, which needs deliberate focus management, not default DOM
order), keyboard-only navigation, `prefers-reduced-motion` (the app leans on
custom transform animations — `.u-page`, the folded-deck tilt effect, the
podium), real font-scaling settings, and — concretely, likely to actually
bite — **iOS Safari's autoplay restriction**, already called out in §3,
which nothing in this project's test history would ever have caught.

## 11 · Legal pages and localization

Two real-launch requirements with no visible home in the current app: a
linked Terms of Service and Privacy Policy (required by app stores, ad
platforms and payment processors alike, and currently not found anywhere in
`src/pages/`), and localization — worth flagging now because
`src/admin/data/commerce.ts`'s `REGION_PRICING` already lists Indonesia,
India, Brazil and Japan with local currencies, implying multi-region intent
that the consumer app's hardcoded-English strings don't yet support. i18n is
structural work (extracting every string, choosing a library, deciding the
date/currency formatting convention) that gets more expensive the more pages
exist with strings baked directly into JSX — cheaper to start before the
next 10 pages ship than after.

## 12 · The moderation queue has no echo back to the person it's about

The new admin Moderation/reports workflow lets an operator action a report
against someone's session. Today, nothing tells *that person* anything — no
notification, no explanation, no appeal path. A real user whose published
work gets quietly removed with zero feedback will assume it's a bug, not a
decision, and either way the product owes them *something* (a notification
in the existing feed, at minimum) once this queue is doing more than looking
realistic.

---

# Part II · The engineering work underneath Part I

None of Part I is buildable without this. Kept from the first version of
this document, compressed, because it's still accurate — it's just support
structure, not the end-user story itself.

## 13 · No data-fetching layer, anywhere

Every page reads a `const` array or (in three admin modules) a context
seeded from one — nothing has a concept of loading, error, or staleness,
because nothing has ever needed one. `src/admin/data/AdminDataContext.tsx`'s
pattern of named mutator functions (`setUserRole`, `saveSession`, …) is the
template to generalize: it already isolates *what* changes from *how*, so a
real API call replaces a function body without touching a page. What it
doesn't model yet is the async part. **Recommendation:** adopt TanStack
Query or SWR now, wrapping today's synchronous mock calls in resolved
promises — free today, and it's the seam every item in Part I ultimately
needs (a wait state, a retry, a "did that actually save").

## 14 · `/admin` has no authentication, independent of any backend

Every admin module — several of which now mutate real data — is reachable
by URL alone. A `SiteLock`-style password gate (explicitly a deterrent, not
real security, matching the pattern the consumer app already uses) closes
this today without waiting on a backend.

## 15 · Zero automated test coverage

"No test runner is configured" (CLAUDE.md, verbatim) and every verification
in this project's history, including this session's, has been a throwaway
Playwright script that disappears with the container. Stand up Vitest +
React Testing Library, and promote the next verification script into a
committed CI test instead — starting with sign-in, publish/unpublish, and
consent toggles, since this product carries real compliance weight
(`docs/FOR-BACKEND.md` §7) and an untested regression there is an incident,
not a bug.

## 16 · Admin's bundle and mobile parity

Admin's 18 pages were eagerly bundled instead of code-split — **fixed this
session** (`src/App.tsx`, `AdminLayout.tsx` now `lazy()` + `Suspense`,
matching the consumer app's existing pattern). Separately: `docs/CHANGE-LOG.md`
is a passive record of web/mobile drift, not an active one — nothing stops
a shipped web change from never getting a matching Flutter ticket, and the
gap compounds as web's pace increases.

## 17 · No observability, and no settled secrets convention

No error tracking, analytics, or performance monitoring exists; the feature
flag store and site lock are well-reasoned precedents for config management,
but there's no general convention yet for the next environment variable or
API key.

## 18 · The image pipeline

Hotlinked Unsplash photos (`src/lib/photos.ts`) have no availability
guarantee, no responsive variants, and real licensing exposure at scale —
this is already in `docs/FOR-BACKEND.md` §6 as inherited debt, repeated here
because it blocks real content from day one and needs a backend-side answer
before the FE work can start.

---

# Part III · Risk register — when real AI and a real backend replace the mocks

Scoped to the main consumer site only. Written for where this project
actually is: no developer seated yet, still finalizing scope with the
client. That means the useful work right now is not code — it's locking down
the handful of decisions below *before* a developer's first sprint collides
with them, because every one of these is cheap to decide on paper and
expensive to discover mid-integration.

## AI integration

### R1 — Replies are instant today; a real model is not, and nothing in the UI knows how to wait

`replyTo()` (`src/lib/replies.ts`) is a synchronous keyword match — sub-
millisecond, always. A real model call has real, variable latency: maybe
under a second, maybe several, occasionally much longer if it's also
generating a full session. ChatPage today has no "thinking" state, no
streaming-token rendering, no cancel-mid-reply affordance, and no timeout
message — because it has never once needed any of them.

**Lock down now:** whether the real reply streams token-by-token or arrives
whole, and what the UI shows while waiting (and after how long it should
start saying so). **Cheap to de-risk before a developer even starts:**
artificially delay the mock reply by a couple of seconds and see how badly
the current UI copes — that single change surfaces most of this risk for
free, on mock data, before it's tangled up with real model behavior too.

### R2 — The reply contract has to stay structured, or the UI loses the ability to tell "talked about it" from "did it"

Every mock `Reply` carries machine-readable flags — `proposes`, `changes`,
`prompts` — not just prose, and `replies.ts`'s own comments are explicit
about why: *"Saying 'adding white noise underneath' over a card still naming
the previous cut is the app claiming to have done something it did not do."*
A real model left to free-write prose has no reliable way to signal that
same distinction unless it's required to.

**Lock down now, as a condition on whoever builds the AI layer:** the real
system must emit the same structured signal (function-calling / tool-use /
a constrained JSON shape) alongside anything conversational — carry forward
exactly the `Reply { text, proposes, changes, prompts }` shape in
`docs/FOR-BACKEND.md` §2.3. This is a one-sentence requirement to put in a
spec today and a painful retrofit to discover is missing after the chat UI
is already built against free-text replies.

### R3 — Audio generation can fail independently of the reply that promised it

Today a "reply" and "the session now exists" are the same instant. A real
pipeline is at least two steps — the model agrees to a change, then audio
actually renders — and the second step can fail (or just take much longer)
even when the first step succeeded. Nothing in the current version-list UI
(`DraftVersion`) distinguishes "the plan is confirmed" from "the file is
actually ready," because there's never been a gap between them to show.

**Lock down now:** whether the API models this as one call or two, and what
the FE shows in between — this changes the chat UI's state machine, not
just its copy, so it needs deciding before that state machine gets built.

### R4 — Nothing today ever gets held back from the user, and this is a mental-health product

The admin side already models safety interventions that assume a real model
will sometimes need to be stopped (`blocked` / `rerouted` / `escalated` /
`logged`, by category — self-harm language, crisis keywords, medical
claims). The consumer cockpit, by contrast, shows every reply the instant it
exists; nothing is ever withheld for a check, because a keyword matcher
never produces anything worth checking.

**Lock down now:** what the end user's cockpit actually shows when a real
reply gets blocked or rerouted — silently substituted, visibly paused with
"let me think about that differently," or something else. This is a safety
and liability question as much as a UX one, and per `docs/FOR-BACKEND.md`
§7 the product already carries documented compliance weight here — it
should not be improvised the week the real model starts producing output
nobody has reviewed in advance.

### R5 — A quota or budget limit may someday change what the user experiences, and today nothing could show that even if it existed

The admin side already models a monthly spend ceiling with the system
degrading to a cheaper model past it, and PRD's own open question #3 asks
outright what the free tier caps. Whatever the eventual answer, the
consumer UI has zero concept today of "you've hit a limit" or "this reply
came from a lighter model because of one" — there is no affordance for it
anywhere in the cockpit.

**Lock down now:** nothing urgent to decide yet — this one is legitimately
blocked on the pricing/plan decision in PRD's open questions — but worth
flagging to the client now as a UI surface that pricing will create, so it
isn't sized as "just add a modal" the week pricing finally lands.

### R6 — This project's whole verification method assumes deterministic replies, and a real model isn't one

Every check run in this project's history — manual or Playwright — has
relied on the mock engine's replies being the same every time. A real
model's output varies run to run by design. Any test or script written
against exact reply text breaks the moment the swap happens, which means
the testing approach itself (assert on structure and behavior — did a new
version appear, did the right flag fire — never on exact wording) needs to
be the convention from the first test written, not a rewrite after the fact.

## Backend integration

### R7 — The mock data shapes were designed for a demo, not validated against a real schema, and some are flagged as provisional by this project's own documentation

`docs/FOR-BACKEND.md` already names specific fields as "a decision to
revisit" — `plays` and `recreated` are pre-formatted strings ("18.5k") that
assume the client never needs the raw number; `age` on notifications is
pre-formatted the same way. If a real backend returns raw numbers and
timestamps instead, every component currently rendering these fields
verbatim needs rework, not just a type change.

**Lock down now, in the client finalization conversation specifically:**
freeze the exact field shapes (which strings are pre-formatted vs. raw,
which enums are closed vs. open) before a developer builds against either
assumption — this is exactly the kind of decision that's free to pin down
on paper now and expensive to renegotiate after the FE and backend have
each independently guessed.

### R8 — Every list in the app loads everything at once, because the mock catalogue is small enough to

26 sessions, a handful of challenges, a short notification feed — none of
it has ever needed pagination, infinite scroll, or search debouncing,
because all of it fits in memory trivially. A real catalogue won't. This is
a structural rework of every list screen (Explore, Sessions, Notifications),
not a styling pass, and worth sizing into the backend-integration estimate
explicitly rather than assuming the existing components "basically work"
once they're pointed at a real endpoint.

### R9 — Two tabs or two devices can disagree once there's a real backend, and nothing today has ever had to notice

State today comes from one static bundle per browser tab, so "is this
stale" has never been a question that could even arise. A real backend
means a user can have the app open on a phone and a laptop at once; if one
publishes a session or changes a setting, nothing currently revalidates the
other. This needs a decided strategy (polling, websockets, or an accepted
"refresh to see it" limitation) before it's a bug report instead of a
design choice.

### R10 — "Something went wrong" won't be enough once failures are real and varied

A real backend fails in distinguishable ways — an expired session, a
rejected form value, a rate limit, a server error, no network at all — each
of which wants different handling (redirect to sign-in vs. an inline field
error vs. a retry-later banner vs. an offline notice). Nothing in the FE
today distinguishes any of these because nothing can currently fail at all.

**Lock down now:** agree an error-shape convention with whoever builds the
backend (a stable error code per failure class, not just an HTTP status and
a free-text message) before integration starts, so the FE can build one
dispatcher instead of guessing case-by-case as real errors start arriving.

### R11 — The frontend currently ships on its own schedule, and a real backend ends that

`web_app` today is self-contained — it can be built and deployed with zero
coordination, because there is nothing else to be in sync with. The moment
a real backend exists, a breaking API change on either side can break the
other mid-rollout. This is a process risk, not a code one, and the cheapest
time to agree on a mitigation (API versioning, a staging environment both
sides deploy to first, a contract test) is before either side has shipped
anything against the other — a client-finalization conversation topic, not
an engineering ticket.

### What to put in front of the client now, while scope is still open

Of the eleven risks above, these five are pure *decisions* — free to settle
on paper during finalization, before any code exists to rework:

| Risk | The one-sentence ask |
| --- | --- |
| R2 | The AI layer must emit structured `proposes`/`changes`/`prompts` signals alongside any reply, not prose alone. |
| R3 | State whether "confirm the change" and "render the audio" are one API call or two. |
| R4 | Decide what the cockpit shows when a real reply gets blocked or rerouted, before a real model produces the first one that needs it. |
| R7 | Freeze the exact field shapes (pre-formatted vs. raw, closed vs. open enums) the backend will return. |
| R10 | Agree a stable error-code convention, not just HTTP status + free text. |

The rest (R1, R5, R6, R8, R9, R11) are either cheap to de-risk against the
existing mock today (R1, R6), genuinely blocked on an upstream decision
(R5), or process agreements rather than specs (R8, R9, R11) — worth naming
in the same conversation, but they don't block finalization the way the five
above do.

---

## Where to start

Interleaving both parts by what a real user would actually notice first:

1. **Real session persistence** (§4) — the single highest-retention-cost gap,
   and invisible in every walkthrough because nobody re-opens a demo a day
   later.
2. **Gate `/admin`** (§14) — no backend dependency, closes a P0 today.
3. **The cockpit's real-latency wait state** (§2) and **real audio playback**
   (§3, iOS autoplay specifically) — both become visible the moment a real
   model or real generated audio is wired in, so the UI for them should exist
   *before* that day, not be improvised on it.
4. **Day-0 empty states across Profile / Progress / Credits / Notifications**
   (§1) — every real account starts here; it should not be the least-tested
   state in the app.
5. **Adopt TanStack Query / SWR now** (§13) — the seam everything above
   actually needs.
6. **Error/empty copy in the product's own voice** (§9) and **basic error
   tracking** (§17) — cheap, and better before errors are common than after.
7. Everything gated on a product or backend decision — pricing (§5), the
   image pipeline (§18), real social-proof numbers (§8) — raised now so
   they're a planned project, not a late discovery.

---

## Where this fits among the other documents

This is the fifth `docs/FOR-*.md` file, alongside `FOR-BACKEND.md`,
`FOR-MOBILE.md`, `FOR-PRODUCT.md` and `FOR-AI-AGENT.md` — same rule: kept
identical on `web_app` and `admin_cms`, updated in the same commit as
whatever changes what it describes.
