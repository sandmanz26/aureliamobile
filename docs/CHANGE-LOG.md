# Change log

Which environment has what, without reconstructing it from three `git log`s.

`web_app` (staging) and `mobile_app` move on every commit — as of the
production split, mobile is being treated the same way: a place things land
and get tried, not a stable copy of anything. `web_prod` is the one that is
allowed to lag, on purpose, and only catches up when the product owner asks
for it. So "are all three the same" is never true for `web_prod` by design;
it is true for `web_app` and `mobile_app` only in the sense that they should
not know about each other's features for long without a reason — not that
their code is identical, since one is React and the other Flutter.

**Kept identical across `web_app`, `admin_cms`, `web_prod`, `mobile_app` and
`storybook`, the same way `docs/PRD.md` is.** Whichever branch you open this
from, it should read the same. Update it in the same commit as the change,
every time — that is the whole point of it existing.

## Entry format

```
### <date> — <short name of the change>
**Lands on:** <branch(es) the commit actually reached>
**Not on:** <branch(es) that could plausibly want it but do not have it yet, and why>

<1-3 sentences: what changed and why, not a re-explanation of the commit body.>
```

Newest first. A branch left off "Not on" entirely means the change does not
apply there (a Flutter-only fix has nothing to say about `web_prod`).

---

### 2026-09-29 — Match ProfilePage's header and stats to Figma 16744:6367

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level, no shared
component contract changed).

Pulled the full node tree for the "Profile" frame straight from Figma via the
Desktop Bridge plugin and diffed it against `ProfilePage.tsx` property by
property. Fixed what was specific to this page: the header title is Title
Large *Regular* (24/400), not the Title Large SemiBold used for other page
headings; the menu/share/settings buttons are a radius-12 squircle, not a
full circle, with 20px icons throughout (was 24/18/18); the name and each
stat value read at Body (16/Regular) with the label at Label Regular
(12/Regular), not Title/Label's larger Medium pairing; the tab bar is Body
Small (14/Regular) with 20px icons, not Label (12/Medium) with 16px icons.
Left two things alone even though the frame disagrees with them: `CoinPill`
and `SessionGridCard` are shared across 4-5 other pages, and changing their
shape or type scale from one page's Figma reference risks second-guessing
frames I haven't checked. Also left the old stale `Figma 16698:4947` code
comment's node reference updated to the one actually used here.

### 2026-09-29 — Fix a dead typography class on the Player Beta card title

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (Flutter and the catalogue
never had this typo).

`PlayerBetaPage.tsx`'s card title used `text-style-title-lg`, which is not one
of the 16 generated `text-style-*` classes (the real one is
`text-style-title-large`) — Tailwind silently dropped it, so the heading
rendered with no typography styling at all. Found while auditing the web app
against a Figma sweep that put every text layer in `Aurelia AI - Daniel` onto
the same 16 `Aurelia/*` text styles: the token definitions on both sides
already matched, but this is a real place the app's own code wasn't using
them. A second pass is still open — ~76 places in the app use raw
`text-[Npx]` sizes instead of a `text-style-*` class, several matching the
scale exactly (redundant, not broken) and a handful (13px, 22px, 26px, 8px)
outside it — not yet triaged for whether each is intentional.

### 2026-09-29 — The Alignment Score needle animates

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (no component contract
change — `AlignmentGauge`'s props are the same, just no longer static).

The gauge needle on a wellness goal's Alignment Score used to snap straight
to its final position. It now mounts pointed at "Challenging" (0) and
sweeps to the real score on the next frame — since `AlignmentGauge` mounts
fresh every time a goal card is expanded, it replays on every expand, not
just once per page load. Done as a CSS `transform: rotate()` transition on
the needle's `<g>` rather than recomputing its triangle on every animation
frame: the shape is drawn once, the browser interpolates the angle.
`transition-duration` collapses to 1ms under `prefers-reduced-motion` via
the existing blanket rule in `motion.css` — nothing extra needed for that.

---

### 2026-09-29 — My Wellness gets an Analytics tab

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (not built there yet — the Figma reference
was web-first) / `storybook` (new shared pieces — `TagRow`'s new home,
`AlignmentGauge`, `WellnessObjectiveCard` — worth a story once this settles).

My Wellness now opens on a tab switcher: **Analytics**, new, showing a
person's wellness goals as expandable cards (XP progress toward the goal,
"what's helping me progress," a semicircle "Alignment Score" gauge running
from Challenging to Aligned, and before/after state tags) — and **Connect**,
which is the screen exactly as it already existed (signal sources by
group, the toggles), now just living behind a tab instead of being the
whole page. Both action buttons on a goal card ("Analyze my state" and its
topic-specific pair) hand off into the cockpit through the same `ask`
route-state Home's own prompt box uses, rather than going nowhere.

Mock data (`lib/wellnessGoals.ts`) is invented and deliberately specific,
same convention as the rest of `lib/` — not derived from a session's own
`tags`, which describe its topic for the catalogue rather than why it's
working for the person looking at this screen.

Pulled `TagRow` (the "+N overflow" hashtag row) out of `SessionDetailPage`
into `components/ui/TagRow.tsx` so this screen's tag list and that one
share it instead of a second copy — the exact kind of duplication flagged,
not yet occurring, in the last code-quality pass.

### 2026-09-29 — Code-quality pass: split the god files, kill the duplication

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (a web-specific refactor — no Dart
equivalent of any of these files) / `storybook` (no component contract
changed, nothing new to catalogue).

A second senior-level pass, this one on structure rather than security/SEO —
scalability, duplication, and whether the code explains itself. UI, mock data
and demo state are explicitly untouched; every fix below is internal.

- **`ChatPage.tsx` was 956 lines.** Most of that is legitimate — eight
  distinct, heavily-commented "door" effects for the cockpit's entry points,
  which is inherent complexity, not sloppiness. But the ~150-line per-message
  rendering block (run-grouping, prompts, attachments, the recommendation
  deck) was a separable concern with a clean prop boundary. Extracted to
  `components/chat/ChatMessageItem.tsx`; `ChatPage.tsx` is now 858 lines and
  its render body reads as "what happens," not "and here's how one bubble
  draws." Verified behaviorally identical end-to-end (send, build, publish,
  free-limit trip) in a real browser before and after.
- **`src/lib/sessions.ts` was 1,607 lines** — 1,400 of them the 26-record
  mock catalogue, the rest the dozen functions that read and mutate it. Split
  into `lib/sessions/data.ts` (the shapes and the records) and
  `lib/sessions/queries.ts` (`findSession`, `sessionsOnShelf`, publish/
  unpublish, ...), re-exported through `lib/sessions/index.ts` so all 22
  existing `from '../lib/sessions'` imports keep resolving unchanged — zero
  consumer files touched. This *is* the seam `docs/FOR-BACKEND.md` describes
  as the one a real API replaces; it was buried after 1,400 lines of records
  before this.
- **`CARD_SHADOW` was copy-pasted, identical down to its comment, into four
  page files** (`Progress`, `Wellness`, `Sessions`, `Credits`). One of them
  would have drifted the next time this shadow changes. Consolidated into
  `lib/shadows.ts`, with a note on why it's a hand-written constant rather
  than a generated design token (effects aren't in the Figma export yet).
- **`README.md` was describing a version of this app that no longer exists**
  — its "Structure" section listed four files from an early Figma-sync
  proof of concept, and claimed session photography was "a placeholder, no
  image assets exported yet," when cover art has been hotlinked from
  Unsplash by a documented, deliberate architecture for most of this
  project's life. Rewritten to describe the app as it actually is today:
  real folder structure, the four state-management contexts and why each
  one exists, the routing/guard layers, error handling, metadata — with the
  token-pipeline section (which was accurate) kept intact.
- Found, and flagged rather than silently fixed: the "Open menu" drawer
  button is reimplemented per-page in nine places, with sizes, colors and
  press-state classes that have already drifted from each other (`size-40`
  vs `size-44`, some missing `u-press`, Home's has no background at all).
  Not touched here — unifying it means picking one appearance, which is a
  design call, not a refactor, and the instruction for this pass was
  explicitly to leave the UI alone.

---

### 2026-09-29 — Production-readiness pass: SEO, security headers, error handling

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (a web-specific pass — `strict` TS, Vercel
headers, `<title>` hoisting and `robots.txt` have no Flutter equivalent) /
`storybook` (no component-level change).

A senior-level pass ahead of the backend engineer joining, covering code
structure, security and SEO/metadata — with the mock-data reality (see
`docs/FOR-BACKEND.md`) deliberately left untouched. Findings and fixes:

- **TypeScript `strict` was off** in all three tsconfigs. Turning it on
  surfaced zero errors — the code was already disciplined — but the setting
  itself matters once real, possibly-`null` API responses replace the mock
  constants. `api/config.ts`, the one serverless function in the repo, was
  not covered by *any* tsconfig project and so was never actually
  typechecked by `npm run typecheck`; it now has its own
  (`tsconfig.api.json`), and passes strict mode cleanly too.
- **No `ErrorBoundary` anywhere.** A render crash unmounted React entirely to
  a blank white page. Added one (`src/components/ErrorBoundary.tsx`) around
  the whole app, with an on-brand fallback and a `console.error` seam marked
  for a real error-reporting service later.
- **No catch-all route.** An unmatched path rendered nothing, and
  `vercel.json`'s SPA rewrite still answered 200 — a dead link looked like a
  blank page that loaded fine. Added `NotFoundPage` on `*`, `noindex`d.
- **No per-page `<title>` or meta description**, anywhere — every route
  showed the same static "Aurelia" tab title, and social/search previews
  would too. Added `PageMeta` (uses React 19's native `<title>`/`<meta>`
  hoisting, no library) and wired it into every consumer page.
- **No security headers, no CSP.** Added `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (camera,
  microphone and geolocation all denied — nothing in the web client calls
  any of them yet; the voice recorder's waveform is `Math.random()`, not a
  real mic, unlike the Flutter client's), `Strict-Transport-Security`, and a
  `Content-Security-Policy` scoped to the domains the app actually loads
  from. Verified against a simulated CSP in a real browser: zero violations.
- **`api/config.ts` hardening**, within its documented unauthenticated-by-
  design shape: capped the flag count and key length an unauthenticated POST
  can write (a storage-cost knob otherwise open-ended), and stopped
  returning raw upstream error text to the caller (logged server-side
  instead).
- **`robots.txt` added, `noindex, nofollow` set globally.** The site is a
  password-gated private preview on invented data — nothing here should be
  indexed yet. Both are commented with exactly what to change when that
  stops being true.
- **A real bug**: `INVITE_LINK` was defined twice with two different
  domains — `lib/credits.ts` had a typo'd `aurellia.ai`, `InvitePage.tsx`
  had its own locally-declared, correctly-spelled copy. Depending on which
  screen a user copied their referral link from, they got a different URL.
  Consolidated to the one in `lib/credits.ts` (typo fixed), `InvitePage`
  now imports it — same fix applied to the duplicated `500`-coin reward
  constant.
- Deleted `PlaceholderPage.tsx` — confirmed unreferenced anywhere in the
  tree (superseded by `ModuleGuard`'s inline "not part of this walkthrough"
  state).

**Deliberately not changed**, because it needs a decision or a backend, not
a cleanup pass: `/admin` and `/api/config` remain unauthenticated (both
already documented P0/known-limitations in `docs/PRD.md` and
`docs/FOR-BACKEND.md` — a demo-flag toggle is not auth, and bolting on a
fake client-side login would be worse than the honest gap); no test
framework added (none exists today, and choosing one is worth the
incoming backend engineer's input); the site lock and mock data are
untouched, as asked.

---

### 2026-09-29 — `GeneratingShape` now traces the actual reference sequence

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no `/__demo` concept there yet) /
`storybook` (still behind an unreleased flag, no story yet).

The first pass at the `chat.generatingV2` morphing mark used an arbitrary
on/off pattern across four cells, not Figma's actual "Squares, Spinner
squares-6" reference. Traced the reference frame by frame (pixel-sampled
each frame's slot-aligned grid position and corner colors, not eyeballed):
a single lit cell walks clockwise TL→TR→BR→BL, leaving a pale trail as it
grows into a full square over the first four steps, then walks the same
four corners again erasing the cell two steps behind it, shrinking back to
one corner before the loop restarts. `GeneratingShape.tsx` rewritten to
that exact walk/present-set logic, with the lit cell's gradient and the
settled cells' fill color matched to the reference's sampled hex values.
Still off by default behind `chat.generatingV2`.

---

### 2026-09-29 — Profile header matched to Figma: bigger avatar, stats beside it

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (its own profile screen, not audited here) /
`storybook` (page-level layout, not a cataloged component).

Checked against the Figma "Profile" frame (16698:4914) and found three real
drifts, on both the signed-in profile and anyone else's: the avatar was 72px
where the frame draws 88; the stats row (Posts/Played/Recreated) was a
separate full-width block below the name instead of living in the same text
column beside the avatar, so its numbers sat flush with the page edge rather
than lining up under the name; and its labels had no color class, so they
inherited body's ink brown (`text-primary`) instead of the frame's muted
gray (`text-secondary`). All three fixed in `ProfilePage.tsx`; verified at
both mobile and desktop widths.

---

### 2026-09-28 — A second, dark "generating" treatment behind a demo flag

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no `/__demo` concept there yet) /
`storybook` (the two new pieces — `GeneratingShape`, `RotatingStatus` — are
shared components once this settles; add stories once it does).

Chat's "building your session" message now has a second look, `chat.generatingV2`
in `/__demo`, off by default: a small morphing-squares mark
(`GeneratingShape`) next to a status line that cycles through what the build
is doing (`RotatingStatus`), combined in `SessionProgressCardV2`. It only
covers the generating phase — once a build finishes, the thread falls back to
the existing `SessionProgressCard` for the ready state regardless of which
option drew the loading, since there is no reference yet for a "finished"
option 2. With the flag off, Chat is pixel-for-pixel what it was before.

---

### 2026-09-28 — A wider, more deliberate desktop content column

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no desktop concept) / `storybook` (no
component story depends on page-level width).

Every consumer page's content column was capped at 720px (a few at 900px)
on desktop — narrow enough, next to the 313px sidebar, to leave a
noticeably lopsided strip of empty page on anything wider than a small
laptop. Feed and detail pages (Home, Explore, Profile, Sessions, Session
Detail, Challenge Detail, Notifications, Help, Credits, Wellness, Session
Settings, Account Settings, Progress, See All, Recreate) now cap at 960px.
Chat's own thread column goes to 800px rather than the full 960 — wide
message bubbles read worse, not better. The Player and Invite/Upgrade
pages, whose content is a single focused card rather than a feed, land at
640px — same direction, sized to what they actually hold. `PageSkeleton`
matches the new 960px so a lazy-loaded route's loading state doesn't jump
in width once the real page arrives.

One thing widening the column surfaced on its own: Profile's session grid
(`grid-cols-2`, cards locked to a fixed aspect ratio) turned into two
oversized tiles at 960px, since the aspect ratio scales card height right
along with the wider column. Gave it `lg:grid-cols-4`, the same move
`SeeAllPage` already made for its own card grid — proportioned cards, not
a redesign. Left `Sign In` / `Sign Up` / `Forgot Password` / `Reset
Password` deliberately alone: their fixed-width "card floating on an
elevated background" look is an intentional, previously Figma-matched
pattern distinct from the main app's content layout, and `Sign In`
specifically ties its width to a hand-tuned photo crop via a locked aspect
ratio — widening it isn't a plain number change. Flagging it rather than
touching it blind.

### 2026-09-28 — The real coin artwork, everywhere the coin appears

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (worth carrying over so the two clients'
currencies keep matching) / `storybook` (add a story for `CoinMark` when
convenient).

`CoinMark` drew the coin as a CSS gradient disc with a ring punched out of
the middle — a stand-in until real artwork existed. It now renders the
supplied icon (`src/assets/coin-icon.png`, 80x80, so every size this app
actually uses is scaled down from a real source rather than up from one) at
whatever size the caller asks for, same as before. Also caught and fixed
one hand-rolled coin the earlier "thirteen places" cleanup had missed —
Invite's own "+500" badge was still drawing a `Coins` glyph in the old
gradient circle by hand; it goes through `CoinMark` now too.

### 2026-09-28 — A closed challenge stops offering to join it

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Challenge Detail and
Explore are web-specific.

Once `endsInDays <= 0`, Challenge Detail's stat pill reads "Ended" instead
of "Ends in 0 days," and the sticky footer button becomes "View Winners" —
scrolling to the podium instead of navigating to `/chat` to join something
that is already over. Explore's own challenge card gets the same swap on
its "Join" pill. The `focus-sprint` sample challenge (added last commit to
demo the last-day state) now demonstrates this one instead — `endsInDays:
0`, `yourDay: 7` (finished), and every leaderboard trend arrow cleared to
`null`, since a closed board has no more movement left to show.

### 2026-09-28 — Drop the simulated phone status bar; this is web-first now

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (Flutter has its own real OS chrome, never
this) / `storybook` — no component story depended on it.

`MobileStatusBar` (the "9:41" clock plus signal/wifi/battery icons drawn at
the top of every screen) is deleted, along with every place that rendered
it — `AppLayout`, `AuthShell`, `PlayerPage`, `PlayerBetaPage`. The product
is being built for web first, so simulating a phone's own status bar no
longer makes sense at the top of it. Removing it left a real gap to close,
not just a component to delete: `.u-sticky-top`'s `top: 54px` (clearing the
status band on mobile widths) is now `top: 0` everywhere, and the eleven
pages that sized their root to `calc(100vh-54px)` with an `lg:min-h-screen`
override now just use `min-h-screen` (or `h-screen` for Chat) at every
width — the same height the status bar used to eat is now available to the
page everywhere, not only on desktop. The drawer's top padding, which used
to reserve 54px so its own content lined up below the status band, drops to
the same 24 it already used on desktop.

### 2026-09-28 — A working Rewards sheet, and a challenge on its last day

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Challenge Detail is a
web-specific screen.

The "Rewards" pill on Challenge Detail did nothing when tapped; it now opens
a real bottom sheet ("Rewards for Winners!") listing the top-3 prizes —
coins and a premium-plan length per rank — built the same portal/backdrop/
Escape way every other sheet in this app is. `ChallengeRecord` gained a
`rewards` field for it, populated on all three challenges. The pill itself
also gets a translucent background and a chevron instead of a solid fill
and a straight arrow, matching Figma. A third sample challenge, "7-Day
Focus Sprint," was added specifically to show the screen on a challenge's
last day (`endsInDays: 1`, a near-complete progress line, a full and still-
moving leaderboard) — the other two only covered mid-run and day-one. Adding
it surfaced a real pluralization bug ("Ends in 1 days") that no existing
data had ever triggered; fixed alongside it.

### 2026-09-28 — Trusted Creators drops its session count; a real ranking icon

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Explore, Challenge Detail
and Notifications are web-specific screens.

Explore's "Trusted Creators" row no longer shows a "N sessions" caption
under each name, matching the Figma frame — the count was added earlier
this session for a genuine reason (dead-end taps on zero-session creators),
but `trustedCreators()` already sorts by session count first, so the
caption was redundant with what the sort order already guarantees. The
Figma design's podium-with-a-star ranking icon was a trophy cup everywhere
it appeared in code (Challenge Detail's "Rewards" pill, the challenge-added
row in Notifications) — swapped to lucide's `Podium` icon, the closest
match the library has (not a pixel copy of Figma's custom glyph). Explore's
own Monthly Challenge card was also missing that badge in the top-left
corner entirely — Figma has it, the card never rendered any icon there —
now added.

### 2026-09-28 — Skeleton states for slow photos and route chunks

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (own loading-state work, if any) /
`storybook` (add a story for `Skeleton`/`PageSkeleton` when convenient) — a
new shared `.u-shimmer` animation in `motion.css`, a `Skeleton` primitive,
and a `PageSkeleton` fallback. `CoverImage` shows the shimmer over its
gradient floor while a session's Unsplash photo is still loading, fading
the photo in on load rather than popping it in; the gradient-on-failure
behavior is unchanged. Every consumer page under `AppLayout` is now its own
lazy chunk (`React.lazy` + `Suspense`), with `PageSkeleton` as the fallback
— the drawer, status band and page shell stay mounted throughout, so only
the content area shows the skeleton, and only the first time a route's
chunk is fetched in a session. `/play` and `/player-beta` get the same
treatment with their own `Suspense`, being outside `AppLayout`.

### 2026-09-27 — Settings' row rhythm, Profile's dividers and tab styling

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Settings' row list and
Profile's tab switcher are web-specific.

- **Settings' "Connected Accounts" toggle** had no explicit height, so it
  hugged its own content while every `Row` below it is a fixed `h-56` —
  visibly shorter, breaking the list's row rhythm. Given the same `h-56`.
- **Profile's stats row** lost its `divide-x` dividers in an earlier redesign
  pass working from a different reference; a supplied comparison shows them
  back, so they're restored (`divide-x divide-border-subtle`).
- **Profile's tab switcher**: "Sessions" is "My Sessions" in the reference,
  with a rounded-badge icon (`Sticker`, replacing `Music2`) rather than a
  music note, and the active tab's underline is the brand orange
  (`#ff881b`, the one CLAUDE.md already documents as tokenless) rather than
  `text-primary` black.

---

### 2026-09-27 — Only one connected account is ever signed in; Account Deletion loses its red

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Settings' account list is
web-specific.

Two problems in the dummy "Add another Google account" flow shipped
earlier today:

- Every connected account showed a tick, including a freshly-added one that
  had never been switched to — not a state a real multi-account switcher
  can be in. Rows now share one `activeEmail`, only the active one gets a
  tick, and tapping any other one opens a confirmation
  (`SwitchAccountDialog`, "Aurelia will switch to showing {name}'s credits,
  sessions and history instead") rather than switching silently — switching
  changes what the rest of the app shows, so it gets the same "ask before
  doing it" treatment Account Deletion already has.
- Reported back that the row list should read as one color throughout.
  Account Deletion's `tone="danger"` red (verified correct against Figma in
  the previous entry) is removed at the user's explicit request — `Row` no
  longer takes a `tone` prop at all, since nothing else used it.

---

### 2026-09-27 — Profile's cards reverted to the full-bleed style; a dummy second Google account

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Flutter's Profile screen
and Settings have their own implementations.

- **Profile's session cards** (Figma 16685:23193) go back to the full-bleed
  photo-with-overlay style `SessionGridCard` already uses on the community
  grid and the challenge shelf — image-top / white-panel-below, from an
  earlier redesign pass, was matching a different reference than this one.
  `SessionGridCard` gained two props to serve both callers: `showAuthor`
  (off on your own profile, which already says whose sessions these are
  once in its header) and `playOrigin` (so the player's byline still points
  back to 'own' from here, not 'community'). Profile's own card markup —
  and the `SessionCard`/`toCard` mapping type it needed — is gone in favor
  of passing real `SessionRecord`s straight through, which also moves its
  Recreate action onto the same shared `useRecreateTarget` every other
  Recreate button already uses instead of a fourth hand-rolled copy.
- **"Add another Google account"** had no `onClick` at all — the same gap
  this session has found repeatedly elsewhere. It now appends one of two
  plausible dummy accounts per press (no OAuth to hand this to, same as
  Sign Up "creating" an account with no backend behind it), and hides
  itself once both are added.
- Checked against a supplied reference and found already correct, so left
  alone: Account Deletion's red (`tone="danger"` on `Row` already colors
  both the icon and the label), and the Mulish heading font on Profile's
  own title and name — a serif render in one of the supplied comparison
  screenshots turned out to be from a different tool, not this codebase.

---

### 2026-09-25 — Home's card pair: measured the rotation instead of eyeballing it

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Home's promo section is
web-specific.

The previous pass at this section (below) guessed the two cards were fanned
in *opposite* directions at a shallow ~9°, based on eyeballing a render.
Reported back as still not matching. Fitted a rotated bounding box to each
card's own pixels in the supplied reference (`cv2.minAreaRect`, independent
per card) instead of guessing again: both cards come back at the *same*
~30° rotation with a true aspect of 289:458 — parallel, not mirrored, and
three times steeper than either the previous 9° or the original 10–12°.
That aspect ratio (0.631) is close enough to this file's original 180:286
(0.629) to confirm the size and ratio were already right; only the rotation
was too shallow and the cards too small relative to the frame. Re-verified
by fitting the same measurement to a screenshot of the rebuilt section —
both cards land within a few hundredths of a degree of 30°.

---

### 2026-09-25 — Real Home artwork, a real login photo, and a genuine fan instead of a stack

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Home's promo section and the
login photo are web-specific; Flutter's own Home and Sign In are unaffected.

Three fixes from supplied reference images and files, all against Figma
16698:2103 (Home) and 16698:15285 (Sign In), reported back as still not
matching after the last pass:

- **The Home promo's two-card pair** (`16698:4451`) was rotating both cards
  the *same* direction (`-10deg`/`-12deg`) at roughly half Figma's card
  width, which read as one tight, slightly-skewed stack rather than a fan.
  Figma's own cards are 298.88×337.68 (aspect ≈0.885, not the 180×286 this
  was built against) and rotate in *opposite* directions with daylight
  between them at the top, converging lower down. Rebuilt at the right
  aspect ratio, `±9deg`, and a real `gap-24` in place of the 7px the two
  cards used to sit almost flush across.
- **The closing CTA's figure-in-a-network** was a hand-drawn SVG
  approximation (`CommunityNetwork.tsx`) standing in for artwork nobody had
  on hand yet. Replaced with the real export, supplied directly as
  `aurelia-network.png`; the SVG had no other callers and was deleted rather
  than left as dead code.
- **Sign In's background photo** was hotlinked from Unsplash
  (`photo="affirmations"`), which is a flat gradient in any sandbox without
  network access to it — including this one, which is exactly why the first
  two passes at this screen could only be checked against the gradient
  floor, never the real composition. The actual export was supplied
  (`auth-hero.png`, 402×661) and is now bundled directly; Sign Up and Forgot
  Password's shared `AuthPhotoHeader` moved to the same file. Sign In was
  rendering it stretched to cover the full card height at first — a 661-tall
  image forced to cover a taller viewport zooms in hard — fixed by sizing the
  image at its own native aspect ratio and positioning the fade against
  *its* height (59.6%→95.9%) rather than the full page's.

---

### 2026-09-25 — Fixed the login page's proportions; matched Sign Up and Forgot Password to it

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Flutter's auth screens keep
their own forms for now.

The first pass at the new Sign In (yesterday's entry below) put the photo in
its own `54vh` box with a flat white panel under it — reported back as still
not matching Figma. It didn't: Figma's photo runs the *full* 874px frame, and
only the bottom 480 ("Body") carries a panel that is itself a gradient,
transparent at its own top and solid by its own midpoint — 45%/55%, not
54%/46%, and the photo never actually stops behind the panel, it fades under
it. Rebuilt with the photo full-bleed behind everything and the panel sized
to the frame's real 480/874, so "Welcome to Aurelia." now lands where the
fade actually resolves instead of a fixed vh guess.

Sign Up and Forgot Password had no Figma redesign of their own, but were
asked to match: both now open with the same photo band (`AuthPhotoHeader`,
new shared export in `AuthShell.tsx` — shorter and un-pinned to Sign In's
exact ratio, since a name/email/password form needs room to scroll under it
that two buttons and a line of legal text didn't). Their own forms and logic
are unchanged; only the chrome around them moved off the old centered-logo
`AuthShell` layout. `AuthTabs` (the Sign In/Sign Up pill switcher) has no
callers left after this and was removed rather than left dead. The
still-untouched `AuthShell` component keeps `ResetPasswordPage` working —
that screen wasn't part of this request.

Also fixed a second real bug found while checking all three: the mark's
full-width centering wrapper sat over the back button (both pinned at
`top-16`) and silently ate its clicks in Playwright — `pointer-events-none`
on that wrapper in both `SignInPage` and `AuthPhotoHeader`, since the mark
itself was never meant to be a target.

---

### 2026-09-25 — A mood check-in once a session finishes playing

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Flutter's Player screen has
no equivalent yet.

Per Figma 16698:12236 / 16698:12300 / 16698:15499: finishing a session now
surfaces a card over the player — "How does listening to this make you
feel?" with five moods, then one optional "What's going on?" free-text
follow-up. Nothing is sent anywhere; there is no backend yet to hold a mood
log, so answering (or the small "Skip") just closes the card.

The bed audio element loops (`AudioPlayerContext`), so it never fires a real
`ended` event — the clock just wraps back to 0 and keeps going. "Finished"
is detected as a wrap: the clock was within half a second of the end and is
now near zero, which a manual scrub or the ±15s skip landing near 0 on its
own does not produce. Fires once per playthrough of a given session.

Building it surfaced a real CSS trap: `.u-tap` sets `position: relative` on
whatever it's given, which — in a later cascade layer than Tailwind's own —
beat `absolute` on the same "Skip" button and left it sitting top-left in
normal flow instead of top-right where it was told to go. Fixed by moving
the positioning to a wrapping element and keeping `.u-tap` on the button
alone; noted in `CLAUDE.md` next to the rest of what `.u-tap` does.

---

### 2026-09-25 — Login screen becomes a social-only welcome gate

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (Flutter's sign-in screen keeps its own
form for now) / `storybook`.

`SignInPage` no longer shares `AuthShell` with Sign Up/Forgot/Reset — it now
has its own full-bleed layout (Figma 16698:15285): a photo (`affirmations`,
same fallback gradient it already had elsewhere) fading to white, "Welcome to
Aurelia.", and two full-width "Continue with Google/Apple" buttons in place of
the email/password form. Nothing about sign-in itself changed underneath —
there is no backend to check credentials against, so both buttons call the
same mock `complete()` the form's submit used to. `/signup` and
`/forgot-password` had no other link into them anywhere in the app, so both
stay reachable from a small line under the legal text even though the
reference doesn't show either.

Added an `inverse` prop to `AureliaLogo` for the wordmark over a photo instead
of the light background it otherwise assumes — the tile turns solid white and
its cutouts turn transparent (via an SVG mask) rather than white-on-orange, so
the same single source of truth for the mark now covers both cases.

---

### 2026-09-25 — Session Detail: lineage arrow opens the player

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Session Detail's own Lineage
Tree exists only on web.

Per Figma 16698:8196: tapping a Lineage Tree row's arrow went back to the
session's own detail page regardless of which step was tapped, since a
lineage step doesn't carry its own catalogue entry (only title/author/note
are modelled). It now opens the player for the session whose lineage is being
looked at — the one thing every row can actually do. The bottom Recreate
button already routed to chat correctly (`recreate.screen` is off by
default), so it needed no change.

---

### 2026-09-25 — Account Deletion confirmation, and a real Log Out bug it surfaced

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Settings has no Flutter
screen with an Account Deletion row yet.

`AccountSettingsPage`'s "Account Deletion" row had no `onClick`, same gap as
"Join Challenge" yesterday. It now opens a centered "Are you sure?" dialog
(`DeleteAccountDialog`, portalled, matching the frame: a solid coral warning
badge, Cancel + a red "Delete Account") — confirming ends the session, since
there is no backend to delete an account from and "you won't be able to sign
in again" has to mean at least that much.

Building it surfaced a real, pre-existing bug in **Log Out**, on the same
screen: `signOut()` then `navigate('/home')`, called together, let `signOut`'s
re-render land while the route was still `/settings` — `RequireAuth` saw a
signed-out user on a guarded page and threw the departure to `/login` out from
under the navigate call. Traced with a navigation-event log: the arrival at
`/home` was visible, then overwritten by `/login` about 20ms later. Fixed for
both doors with one `endSession()` (navigate first, `signOut` deferred by a
tick) — Log Out was not a one-off case invented for this change, it had been
silently doing this since the screen shipped.

---

### 2026-09-24 — "Join Challenge" opens a thread instead of doing nothing

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — Challenge Detail has no
Flutter equivalent screen yet, so there is nothing there to be missing this.

`ChallengeDetailPage`'s "Join Challenge" button had no `onClick` at all —
pressing it did nothing, silently. It now navigates to `/chat` with a
`challenge: { title }` route state; a new effect in `ChatPage` (same shape as
Quick Start and Recreate — clears the thread first, keyed on `location.key`
so joining twice opens twice) seeds the opening exchange: the user's line
stating which challenge, and Aurelia's welcome back, matching the Figma
reference exactly (`Hi Aurelia AI, I'm joining the {title} Challenge!` /
`Hi Adam, welcome to the challenge!` + the two follow-on lines).

---

### 2026-09-24 — Home's white-to-cream gradient, and Profile's tabs

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` — the gradient fix is
markup-only (no shared component changed), and Profile's redesign is
web-specific until the Flutter client is asked to follow it.

- **Home's Adaptive Wellness section** sat on flat white instead of easing
  into the frame's cream — the previous implementation split white/cream
  across two hand-placed divs at a guessed boundary (after Quick Start),
  which put the whole cream stop behind the dark CTA banner where Figma's own
  page (`16653:14937`) says it should still be 23% away. Replaced with one
  percentage-stop gradient (`linear-gradient(180deg, #FFFFFF 77%, #FFF1DB
  100%)`) on the page's outer wrapper, matching Figma's own gradient exactly
  and surviving real content reflow the way two fixed divs could not.
- **`FeatureCard`** (the six tiles in that section): card fill was
  `bg-background-elevated` (`#F2F1EF`, an off-white grey) where Figma's fill
  is pure white bound to a variable, and the card had no shadow at all where
  Figma draws `0 5px 24px 4px rgba(0,0,0,0.05)`. The icon circle's gradient
  had the right two colors (`#FFF1DB` → `#FFE682`) but the wrong angle (160°,
  down-right) against Figma's actual handle positions (225°, down-left).
  Fixed all three against `16659:38933`.
- **Profile page redesign**, per updated Figma flow: avatar and name/location
  are now a left-aligned row instead of a centered column; the stats row
  dropped its dividers; and a **Sessions / Recreated** tab switcher sits
  between the stats and the grid — Sessions shows everything this person has
  published, Recreated narrows that to the ones that are themselves a fork
  (the same `isRecreated` / `lineage.length > 2` test the session row's own
  marker already uses, so the tab never disagrees with a card's own badge).
  The card itself changed from a full-bleed image with text overlaid on top
  to an image-top / white-content-below layout — title, description and the
  played/recreated counts now sit in a plain white area under the art rather
  than painted over it in inverse text.

---

### 2026-09-24 — Flutter: three real bugs and one inert-data pattern, twice

**Lands on:** `mobile_app`
**Not on:** `web_app` / `admin_cms` / `web_prod` / `storybook` — Flutter-only
fixes; none of these three bugs exist on web, and the pattern the fourth item
found (mock rows with no `onTap`) was already fixed there.

- Home's "Ask Aurelia" field sent on Enter (`textInputAction: send` +
  `onSubmitted`); it is a composer, not a one-line search box, so Enter now
  inserts a newline (`TextInputType.multiline` / `TextInputAction.newline`,
  `minLines: 1, maxLines: 5`) and only the arrow button sends.
- The drawer's signed-in-only "Latest" section named three sessions that did
  not exist and had no `onTap` at all — the same "three inert divs" bug the
  web sidebar already had fixed. Now built from the same three real slugs
  web's `RECENT_SLUGS` uses, and each row opens that session's thread.
- The Player screen's sheet can be dragged by hand (it rides the page's own
  scroll), but `_sheetUp` only ever changed when the grabber was tapped — drag
  it up, tap the grabber to bring it down, and it snapped back up because the
  app still thought it was resting at the bottom. A scroll listener now keeps
  the flag in step with wherever a drag actually left it.
- Same inert-row pattern found again, unprompted, in Explore's "Trusted
  Creators" rail: four hardcoded names, two of which had no matching person
  in the catalogue at all — tapping one would have silently opened *your own*
  profile (`findPerson(slug) ?? findPerson(null)!`), not an error. Replaced
  with a new `trustedCreators()` in `core/data/people.dart`, mirroring web's
  `trustedCreators()` in `src/lib/people.ts` exactly (real people, sorted by
  published-session count), with each avatar now opening that person's
  profile.

---

### 2026-09-23 — `@figma/code-connect` added as a dev dependency

**Lands on:** `web_app`
**Not on:** `admin_cms` / `web_prod` / `mobile_app` / `storybook` — dev
tooling only, no source changed; propagate to `admin_cms` the normal way
(`--ff-only` merge) whenever this is next merged, no urgency on its own.

Installed via `npm install --save-dev @figma/code-connect` (resolved
`^2.0.1`) while investigating Figma Code Connect for design/code parity.
Nothing wired up yet — no `figma.config.json` or `.figma.tsx` files —
because this file's Figma components are unpublished, plain frames with
generic layer names ("Frame 43", not "Title"), which Code Connect's prop
mapping needs to be worth doing, and publishing/scaffolding needs a Figma
personal access token this environment doesn't have. Revisit once both are
in place.

---

### 2026-09-22 — `storybook` branch: a component catalogue

**Lands on:** `storybook` (new branch, cut from `web_app`)
**Not on:** `web_app` / `admin_cms` / `web_prod` / `mobile_app` — this is
tooling for the React component library specifically; nothing in `src/`
itself changed, and mobile has no equivalent component set to catalogue.

A `*.stories.tsx` file beside every one of the 32 files in
`src/components/` (`ui/` and `chat/`, plus `SiteLock`) — Storybook 10 on
the Vite/React builder, with a global decorator (`.storybook/preview.tsx`)
that wraps every story in the same Router/Auth/AudioPlayer/ChatSession/
FeatureFlags stack `main.tsx` uses, so a component that calls `useAuth()`
or renders a `<Link>` just works instead of throwing. `BuildBadge`/
`BuildStamp` needed `__BUILD_ID__` etc. stubbed in `main.ts`'s `viteFinal`,
since Storybook runs its own Vite instance and never sees `web_app`'s
`vite.config.ts` `define` block. See `docs/STORYBOOK.md` for the whole
convention, including how this branch stays in step with `web_app` going
forward — it is not a one-time snapshot.

### 2026-09-22 — Analytics, and a security review

**Lands on:** `mobile_app`
**Not on:** `web_app` / `admin_cms` / `web_prod` — requested for the Flutter
client specifically; the web app has no equivalent instrumentation and this
pass did not add one.

Two asks in one pass: add analytics, and review the app's structure and code
for security, fixing what was found.

**Analytics** is a new seam, `core/analytics/`, on the same pattern as the
audio engine and voice capture: an `AnalyticsService` interface, a
console-only default (`ConsoleAnalytics` — nothing leaves the device, because
there is still no backend to send it to), and fakes for tests
(`NoopAnalytics`, `RecordingAnalytics`). `AnalyticsRouteObserver` logs a
screen view on every navigation, push or walk-back, for all 19 screens for
free. Business events are logged from the controllers that already own the
actions rather than from each screen: sign-up/login/logout, session play,
a message sent (never its words), recommendations applied, publish /
unpublish / revert, a fork started, a voice memo started or thrown away.
12 new tests (`test/analytics_test.dart` plus one in `widget_test.dart`)
assert the wiring rather than the debug-console output.

**The security review** found no secret in the repo and no network call this
app makes that has anything to leak — the real finding was gaps waiting for
the day something real is added. Fixed: `.gitignore` now explicitly excludes
a release keystore, `key.properties`, and the SSO config files
`docs/SSO.md` already said don't belong in git, none of which existed before
this pass either — the rule is what keeps that true once one shows up, not a
sign one already had. `android/app/build.gradle.kts` gained a signing-config
seam that reads a real keystore from `key.properties` when one exists and
falls back to the debug key exactly as before when it does not — release
still ships debug-signed today, unchanged, until a real keystore is dropped
in. And a real bug: cancelling a voice memo mid-recording (not from the
review screen) skipped the capture's own `cancel()`, leaving the mic open
and the partial file on disk until dispose() eventually caught up — both
cancel paths now go through the same cleanup, `cancel()` deletes its own
file rather than trusting the plugin to have done it, and a new
`clearStaleRecordings()` sweeps orphaned recordings left from a previous run
on every launch. See "Before this ships to a store" in `CLAUDE.md` for the
one item this pass could not fix here — release still needs a real signing
keystore and a verified build on a real device before it ships, neither of
which a sandbox with no device and an older pinned Flutter than this
project's own can responsibly do.

### 2026-09-22 — Session Detail redrawn against Figma
**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (staging-only per standing instruction, awaiting a
promotion ask); `mobile_app` (no Flutter equivalent built).

Session Detail was checked against the current Figma frame end to end and
turned out to have drifted a long way: the seven-section accordion
(Overview, Session structure, Sound layers, Personalization, What people
changed, Lineage, Safety & licensing) is gone from this screen, replaced
with what the frame actually shows — a full-bleed cover with Back/Share/Play
floating on it instead of a separate header bar, the author row, title,
a collapsing description ("Read More"), hashtag chips, two Played/Recreated
stat boxes, a "Recreate your own version" row of preset cards (reusing the
same enhancement catalogue Session settings and the chat Add sheet already
draw from — Increase yellow, Less movement, 432 Hz, Male voice over — each
one forking straight into chat with that change already stated), and a
"Details → Lineage Tree" card built from the exact same row Progress's own
Lineage Tree already draws (`16523:19712`), down to reusing its dates. The
deeper data (layers, chapters, personalization, safety) isn't shown here
any more but is not gone from the app — Session settings already covers the
editable half of it, and nothing else on this page read it.

Two things added to the data model to support it: `SessionRecord.tags`
(hashtags, authored per session, not derived) and `lineageDate()` in
`sessions.ts` — Progress's own lineage dates were already fixed/reused
regardless of session, so this pulls that fact into one shared function
instead of leaving it duplicated the next time a screen needs a lineage
row.

Also fixed, caught while building this: the same `.u-page`-transform
containing-block trap documented above for the Apply changes button, this
time on the new sticky Recreate bar — plus a second bug the first fix
hadn't hit yet, since neither screen had been checked at desktop width
before now. A portalled `fixed inset-x-0` bar centers on the *whole*
window, sidebar included, once escaped to `document.body` — wrong on the
desktop layout's persistent 313px sidebar, where the bar needs to center on
the content column beside it instead. Both this page's bar and Session
settings' Apply changes button now carry `lg:left-[313px]`.

### 2026-09-22 — Session settings: queue style changes, then Apply
**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (staging-only per explicit request, awaiting a
promotion ask); `mobile_app` (no Flutter equivalent built).

Session settings' Visual and Sound tabs gained a real Add/Remove state:
tapping "Add" on an explore card highlights it and flips the button to
"Remove," a floating "Apply changes" button appears with a running count
across both tabs, and tapping it hands the composed sentence (e.g. "Add
Tibetan singing bowls, Aulos (Greek flute)") to Chat's existing
`applyChanges` mechanic — posted as the user's own message, which then
generates a new version, same as typing a change directly in the thread.
Also fixed in the same commit: the floating button initially rendered
through the routed page's own box rather than the viewport, the same
`.u-page` transform trap documented above for sheets and modals — now
portalled to `document.body`.

### 2026-09-22 — Chat text size, adjustable from Settings
**Lands on:** `mobile_app` (`a6c37c9`)
**Not on:** `web_app` / `admin_cms` / `web_prod` — the complaint that prompted
this ("14px feels small next to ChatGPT") was specific to a phone; the web
chat bubble stays fixed at `bodySm`.

Settings gained a real "Chat text size" control (Small/Medium/Large, i.e.
bodySm/bodyLg/bodyLarge) with a live preview, replacing the earlier
hard-coded `bodyLg` experiment on the same two bubbles. In-memory only, like
everything else in the app except mute on web — resets to Small on a fresh
launch.

### 2026-09-22 — PRD.md re-synced onto `mobile_app`
**Lands on:** `mobile_app` (`3621307`)
**Not on:** n/a — this entry is the fix, not a gap.

`mobile_app`'s copy of `docs/PRD.md` had drifted behind `web_app` by two
whole sections (Player Beta, the staging/production split) from earlier in
this same run. Caught while adding the entry above; ported verbatim from
`web_app@fb6b1fc`. If this file (`CHANGE-LOG.md`) had existed then, that gap
would have been visible immediately instead of found by diffing.

### 2026-09-21 — Player Beta: the disc-and-sleeve card
**Lands on:** `web_app` / `admin_cms` (`8cec627`)
**Not on:** `web_prod` (staging-only feature, not asked to ship);
`mobile_app` (web-only per the feature's own PRD entry).

The swipeable version card redrawn as a record behind its own cover
sleeve — matching a reference clip's composition, but with this app's own
brand gradient on the label rather than the clip's photography.

### 2026-09-21 — Player Beta: moved from Settings into `/__demo`
**Lands on:** `web_app` / `admin_cms` (`bf1226b`, plus the redirect fix in
`9eeeabb`)
**Not on:** `web_prod`, `mobile_app` — same reasons as above.

Reversed the earlier call (below): the switch is `player.beta`, a flag
under the Player module in `/__demo`'s registry, not a Settings preference.
`/play/...` itself now also redirects to the beta page when the flag is on
— not only the mini player and the attached-session card — with an escape
hatch (`skipBeta` router state) so the beta page's own "open full player"
link does not bounce straight back.

### 2026-09-21 — Player Beta, first cut: a Settings preference
**Lands on:** `web_app` / `admin_cms` (`ec2da39`) — **superseded same day**,
see the entry above. Left in the log because the log is a record of what
happened, not just of what stuck.

The first version of the swipeable session-and-earlier-cuts card, gated by
a toggle in `AccountSettingsPage` rather than `/__demo`. Replaced hours
later at the product owner's request.

### 2026-09-21 — Upgrade's third bullet; Explore's flip word
**Lands on:** `web_app` / `admin_cms` (`368726a`)
**Not on:** `web_prod` (routine content/UI change, not asked to ship yet);
no mobile equivalent requested.

Added "Priority placement in Explore" as the third value bullet on the
Upgrade page (feedback from Daniel). "Trusted Creators" now cycles the
second word (Creators/Guides/Storytellers/Voices) via a new `FlipWord`
component.

### 2026-09-21 — The build says which site it is, everywhere
**Lands on:** `web_app` / `admin_cms` (`a629a12`)
**Not on:** `web_prod` — this is infrastructure for telling staging and
production apart, so it is deliberately live on staging first and folded
into the same eventual promotion as everything else above; no mobile
equivalent (mobile has no deployment-environment concept yet).

`BuildBadge` — `Staging · 0.1.0 · d135f24` — added to the consumer drawer,
the admin sidebar and the `/__demo` header, reading `src/lib/build.ts`.
Deliberately does not link to `/__demo` (that console sits outside the
password on purpose).

### 2026-09-21 — `web_prod` created; staging and production split
**Lands on:** `web_app` / `admin_cms` / **`web_prod`** (`d135f24` — the
branch's own seed commit)
**Not on:** `mobile_app` — no deployment concept there yet, see above.

The event this log exists to make legible going forward. `web_prod` now
carries the production cut and only fast-forwards from `web_app` on
request (never committed to directly). `api/config.ts`'s KV key is now
scoped by `VERCEL_ENV`: production keeps the bare key
(`aurelia:demo:config`), every other deployment appends its branch
(`aurelia:demo:config:web_app`) — so the two flag sets do not sync, on
purpose. `/__demo`'s **This build** panel gained an Environment row.

**`web_prod` has not moved since this seed.** Everything above this entry
except the two rows that name it explicitly is on `web_app`/`admin_cms`
only — production is currently 8 commits behind staging, and stays that
way until asked.

---

## Standing note on `mobile_app`'s role

As of the entry above, mobile is where active work happens the same way
`web_app` does — try things, adjust, revert if they do not land. There is no
`mobile_prod` and none has been asked for; if that changes, it gets the same
treatment `web_prod` got and an entry here saying so.
