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
it is the *means*, not the point.

> **Status** Written 2 Oct 2026 against `web_app` @ `289bd74`. Kept identical
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
