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
### 2026-10-09 — v2: promo banner light follows the cursor

Version 2 only. Home's dark promo banner tracks the pointer (mouse or finger): a soft warm light trails it with a 700ms ease, the two roaming glows lean the opposite way for depth, and the light fades out when the pointer leaves. Pointer position is written to CSS variables on the section, so moving never re-renders React. v1 Home pixel-identical at 402/820/1440. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — v2: stronger promo glow, coin-flip profile picture

Version 2 only. (1) Home promo banner: the two `u-glow-drift` glows switch to `v2-glow-roam` — they now travel across the banner, grow to 1.25x and brighten by up to +0.35 opacity, instead of a barely visible pulse. (2) `/profile`: the 88px avatar is wrapped in `CoinFlip` — it spins in like a tossed coin on arrival and flips to a gold coin face and back on tap or hover (guarded so a flip can't retrigger itself). In v1 `CoinFlip` renders the picture alone; `/profile` and Home v1 pixel-identical apart from the commit hash. Listed in the v2 pop-up. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — v2: typing placeholder and pulsing live map on Home

Version 2 only. (12) Home's Ask field types out four example prompts, holds, erases and cycles; it stops and shows "Ask Aurelia.." while focused or filled, and under reduced motion (`useTypewriterPlaceholder`). (13) The Live Sessions map pulses a soft orange ring out of 17 of the live dots baked into the art (positions measured from the PNG). v1 Home pixel-identical at 402/820/1440. Listed in the v2 pop-up. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — v2: moving soft background on the new-chat screen

`EmptyThread`: in Version 2 three blurred warm blobs drift slowly (18–26s loops) behind the orb, edges masked so nothing reads as a box; the orb breathes and its inner lights drift; the greeting rises in after it. Hooks (`v2-empty`, `v2-ambient`, `v2-orb`, `v2-greeting`) are inert in v1 — `/chat` empty state pixel-identical at 402px. Listed in the v2 pop-up. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — v2: Total Credits counts up

`/credits`: in Version 2 the Total Credits figure counts up to its value (same `CountUp` as `CoinPill`). v1 unchanged. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — v2 "What changes" pop-up rewritten

The Version 2 dialog now summarises v2 in five groups (Motion, Interactions, Player, Tablet, Unchanged) instead of one flat list; `UiVersion.changes` is grouped and the list scrolls inside the dialog on short screens. Staging only. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — Version 2 round 2 (staging only)

All behind the design switcher (`v2`); v1 is unchanged — `/home`, `/explore`, `/sessions`, `/login` pixel-identical at 402, 820 and 1440px.

1. **Feature-card icon micro-animations removed** (reverted `2d7e96d`; `FeatureCard` back to its old props).
2. **Voice input:** the black button is pause/resume, so in v2 it shows Pause / Play instead of MicOff (`VoiceRecorder.tsx`).
3. **Player on every screen:** while a session is loaded, its MiniPlayer floats at the bottom of every AppLayout screen except `/chat` (which already shows it); page bottom bars move up above it (`V2Shell.FloatingPlayer`).
4. **Page transitions:** forward navigation slides in from the right, back from the left, with a soft blur (`data-nav` on `.u-page`).
5. **Bottom sheets:** grab handle, follow the finger, rubber-band upward, close when flicked or dragged past a third (via their backdrop's own close), otherwise spring back (`V2Shell.useSheetDrag`).
6. **Pull to refresh** at the top of any AppLayout page: resistance, spinner, then the screen remounts (no tab reload, which would sign you out).
7. **Coin counter:** `CoinPill` counts up to its balance.
8. **Tablet (640–1023px):** Home splits Live Sessions / Quick Start, Sessions is two columns, promo cards and Explore hero are resized, sign-in is a centred card. Done with `data-tablet` hooks + v2-scoped media queries; phones and `lg:` untouched.

Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — Staging bar: version switcher on every page

The design-version picker moved out of `BuildBadge` into `src/versions/StagingBar.tsx`: a 28px dark bar fixed to the top of every route (consumer app, `/login`, `/admin`, `/__demo`), showing environment, version · commit and the `Design v1 ▾` picker. It takes real space — `data-staging-bar` on <html> pads the body and shortens `h-dvh`/`h-screen`/`min-h-*` layouts and sticky tops by 28px (`versions.css`), checked for no overflow at 402 and 1440 on `/home`, `/chat`, `/login`, `/admin`, `/__demo`. Renders nothing on production, so production layout is unchanged; on staging every page sits 28px lower, on request. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — Version 2: feature-card icon micro-animations

Home's six feature cards get one looping micro-animation per icon (rise, wave, beat, breeze, flip, gather), staggered so they never move together, plus a tilt-and-glow on desktop hover. Version 2 only (`versions.css`); `FeatureCard` gains an optional `motion` prop and a `u-feature-icon` hook. v1 `/home` at 402px pixel-identical. Listed in the v2 "What changes" dialog. Branches: `web_app`, `admin_cms`. Not `web_prod`.

### 2026-10-09 — Staging version switcher, and Version 2 (more motion)

- **Version switcher** (`src/versions/`): a `v1 ▾` picker beside the build badge (drawer foot, admin sidebar, `/__demo`). Choosing a version opens a "What changes in Version N" dialog first; Switch applies it and saves it in this browser (`aurelia.ui.version`). Renders nothing on production, which is pinned to v1 regardless of storage.
- **Version 2** (`src/styles/versions.css`, all rules under `:root[data-ui-version='2']`): blur-and-rise page entrances, scroll-driven reveals for sections/cards/list rows on every page, slow zoom on card photos (+hover zoom on desktop), springier press and hover lift, springier drawer/sheet/dialog. Reduced motion still disables all of it.
- Version 1 is the app unchanged: `/home`, `/explore`, `/sessions`, `/login` at 402px pixel-identical. The one visible addition on v1 is the picker itself next to the staging badge.
- Branches: `web_app`, `admin_cms`. **Not** `web_prod` (on request: no production updates).

### 2026-10-09 — `web_prod` fast-forwarded to `web_app`

On request, production moved from `d135f24` to this commit: everything on staging, including the desktop-only Home, sign-in and wellness changes and the staging/production label fix. Version left at 0.1.0. Branches: `web_app`, `admin_cms`, `web_prod`.

### 2026-10-08 — Sign-in desktop: one centred card

`SignInPage.tsx`, `lg:` only: the split screen is now a single centred card (max 1040x640, thin `border-black/8`, soft shadow, `rounded-24`, 12px inner padding) holding a 440px inset photo with the headline and the form beside it. Mobile untouched (402px pixel-identical). Branches: `web_app`, `admin_cms`.

### 2026-10-08 — Staging no longer labelled Production

Staging is a separate Vercel project that deploys `web_app` as *its* production branch, so `VERCEL_ENV=production` there and the build badge said **Production**. `vite.config.ts` now reports production only when the branch is `web_prod`; `api/config.ts` and `api/annotations.ts` apply the same rule, so staging stops writing the bare `aurelia:demo:config` / `aurelia:demo:annotations` keys (production's) and uses `…:web_app`. Staging's published flags therefore start from whatever is under the `:web_app` key — re-publish once on staging. Branches: `web_app`, `admin_cms`.

### 2026-10-08 — Sign-in desktop: smaller inset photo with headline

`SignInPage.tsx`, `lg:` only: the photo is no longer ~75% of the window — it is an inset rounded panel (`rounded-24`, 16px page margin, 44% wide, max 720px) carrying a new headline, "Wellness, shaped around how you feel.", and a one-line subtitle over a bottom scrim. Back button and logo move onto the panel; the form centres in the remaining width at max 400px. Mobile untouched (402px pixel-identical). Branches: `web_app`, `admin_cms`.

### 2026-10-08 — Home promo banner contained on desktop

`HomePage.tsx`: at `lg:` the dark "Generative Wellness Care" banner is no longer full-bleed — it sits in the content column (912px max, `rounded-[20px]`, 48px padding, `mt-40`) like every other section, since it was the only edge-to-edge block on the page. Mobile untouched (402px pixel-identical). Branches: `web_app`, `admin_cms`.

### 2026-10-08 — Promo banner folds into one row on desktop (902px to 412px tall)

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (desktop only) /
`storybook` (page section).

The dark "Generative Wellness Care" banner stacked three blocks on desktop
(headline, a 494px-tall card pair, then copy and CTA), 902px in all. At
`lg:` it is now a two-column grid: badge, headline, copy and Start your
Journey on the left, the rotated card pair on the right at a smaller
`--promo-card` (170px) with `overflow-visible` so the 30° corners are not
clipped by the narrower column. 412px tall at 1440px. `--promo-card` moved
from the inline style into classes so it can change at the breakpoint; the
new grid wrapper has no classes below `lg:`. Mobile banner compared
pixel-for-pixel before and after: identical.

---

### 2026-10-08 — Wellness goal card: progress and Alignment Score side by side on desktop

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (desktop only) /
`storybook` (worth a refresh of `WellnessObjectiveCard`'s expanded story).

At `lg:` the expanded "Learn more" panel puts "What's helping me progress"
and the Alignment Score panel in two equal-height columns instead of two
full-width stacked boxes, where the gauge sat alone in a wide grey box with
the state lists pushed to opposite edges. The two action buttons below now
line up under each column. `AlignmentPanel` itself is untouched (the Player
check-in shares it). Mobile card compared pixel-for-pixel: identical.

---

### 2026-10-07 — Home's closing CTA becomes a left/right banner on desktop

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (desktop only) /
`storybook` (page section, not a shared component).

At `lg:` the "Casual Intelligence for Global Community" card lays out as a
banner: headline and subline left-aligned on the left, Get Started on the
right, gradient turned 90° so espresso sits behind the words and orange
behind the button. The gradient moved from an inline style to Tailwind
classes so it can change at the breakpoint. Mobile card compared
pixel-for-pixel before and after: identical.

---

### 2026-10-07 — Sign-in gets a real desktop layout; mobile frozen by rule

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (desktop only) /
`storybook` (page, not a shared component).

`/login` at desktop width was the 402px phone screen floating in the middle
of an empty window. At `lg:` it is now a split screen: the photo fills the
left side full height, the form sits in a 480px panel on the right, logo
centred over the photo. Every change is `lg:`-scoped; the 402px screen was
compared pixel-for-pixel before and after and is identical. `CLAUDE.md` now
records the product owner's standing rule that mobile web is frozen unless a
change is explicitly asked for.

---

### 2026-10-07 — Desktop taste-skill review: Home spacing regression, feature grid

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (desktop only) /
`storybook` (no story affected).

First review run through `design-taste-frontend` (Redesign - Preserve, desktop
`lg:` only) over the skill's in-scope surfaces: Home below the hero, Upgrade,
Invite. Upgrade and Invite already read well at 1440px; two fixes on Home:

- **The live-sessions/Quick Start row sat flush under the prompt box.** A
  regression from the side-by-side change: both sections dropped their `mt-40`
  at `lg:` and nothing replaced it. The wrapper now carries `lg:mt-40`;
  measured gap is 51px on desktop, identical to mobile.
- **The six Adaptive Wellness feature cards ran 2 x 3 at desktop width**,
  each card mostly empty space. `lg:grid-cols-3` makes it 3 x 2. Mobile stays
  2 columns.

Mobile re-measured at 402px: gap and grid unchanged.

---

### <date> — <short name of the change>
**Lands on:** <branch(es) the commit actually reached>
**Not on:** <branch(es) that could plausibly want it but do not have it yet, and why>

<1-3 sentences: what changed and why, not a re-explanation of the commit body.>
```

Newest first. A branch left off "Not on" entirely means the change does not
apply there (a Flutter-only fix has nothing to say about `web_prod`).

---

### 2026-10-07 — taste-skill installed as a project skill, with Aurelia overrides

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request; tooling only, nothing ships) /
`mobile_app` (the skill puts native mobile out of scope) / `storybook`.

Vendored upstream `design-taste-frontend` (taste-skill `b482f7a`, MIT) into
`.claude/skills/design-taste-frontend/`, unedited except for an overrides
block at the top: Figma tokens, Mulish, Lucide, light-only, Unsplash covers,
the 1px spacing scale and existing copy win over the skill's defaults, and
it applies to new or pitch-like surfaces, not the cockpit, player or admin.

### 2026-10-07 — Promo banner's card pair drifted from the text column on wide desktop

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (no desktop width there) /
`storybook` (no story affected).

The dark "Generative Wellness Care" banner's rotated card pair bleeds past
both edges of its row on purpose — Figma's own "content SPACE_BETWEEN,"
drawn for the 402px mobile frame it reads as dramatic on. On a wide desktop
window that row has no cap, so it centers on the *window* while the text
above and below it centers on its own 960px column; both share a centre
point mathematically, but the text's left edge sits well left of where the
(much wider) row's own content starts, which reads as the cards drifting
away from the text rather than sitting with it. Measured before fixing:
at 2560px the cards' row spanned the full 2300px of available width while
the text stayed capped at 960. Capped and centered the row with
`lg:mx-auto lg:max-w-[960px]`, same column as the text; below `lg:` it still
bleeds exactly as before (verified: 0–402px at a 402-wide viewport,
unchanged).

---

### 2026-10-07 — Desktop sweep: a dead hamburger on Chat/Help, Sessions' single column

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (nothing here applies — no
desktop sidebar or `lg:` concept on Flutter) / `storybook` (no story
affected).

A broader desktop-mode pass (no `/design` skill exists on this account —
checked — so this was a manual sweep: screenshot every main authenticated
page at 1440px, compare against mobile, fix what's actually broken). Three
real findings, all `lg:`-scoped, mobile re-verified pixel-identical at 402px
on every page touched:

- **`ChatHeader`'s "Open menu" button had no `lg:hidden`.** Every other
  page's own hamburger does (`HomePage`, `ExplorePage`, `SessionsPage`,
  `ProfilePage`, `WellnessPage`, `InvitePage`, `RecreatePage` — checked all
  eight `openDrawer` call sites). On desktop the mobile drawer it opens is
  itself `lg:hidden`, so the button did nothing and sat there redundant next
  to the already-visible sidebar. Hidden it, plus the same `<span
  className="hidden lg:block" />` spacer those other headers use — without
  it, `justify-between` with only one remaining child snaps that child to
  the start instead of keeping the coin pill / more-menu pinned right.
- **`HelpPage` had the identical gap** — found by the same audit, fixed the
  same way (its title sits in the same flex group as the button, so no
  spacer was needed there).
- **`SessionsPage`'s list was a single column inside its own 960px-capped
  container** — every row at full container width, so ~24 sessions made the
  page nearly 3200px tall with the right half of the screen empty the whole
  way down. `lg:grid lg:grid-cols-2` on the list; the empty-state message
  gets `lg:col-span-2` so it isn't shoved into one narrow column.

Checked and left alone: `PlayerPage` and `ProfilePage` already read fine at
960/640px caps; `WellnessPage`'s single-column goal cards aren't a long
enough list to need a second column the way Sessions did.

---

### 2026-10-07 — Desktop only: a narrower sidebar, and Home's map/Quick Start side by side

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (nothing here applies —
Flutter has no desktop sidebar or `lg:` breakpoint concept) / `storybook`
(no story affected).

Both changes are `lg:`-scoped; nothing here touches the mobile layout —
checked against a 402-wide viewport before and after, pixel-identical.

- **The desktop sidebar was the mobile drawer's own width.** `AppLayout`'s
  persistent `<aside>` carried the same `313px` as the Figma "Menu" frame —
  right for a slide-out panel, oversized for a column that sits beside the
  page at all times. Narrowed to `260px`. Two other places hardcode an
  offset to sit a fixed bottom bar beside that sidebar rather than under it
  (`SessionDetailPage` and `SessionSettingsPage`, both `lg:left-[313px]`) —
  updated both to `lg:left-[260px]` in the same change, or the bars would
  have landed under a 53px gap. The mobile drawer itself is a separate
  element with its own width and was never touched (confirmed at 313px,
  unchanged).
- **Home's "Ongoing Live Sessions" map and "Quick Start" were stacked on
  desktop the same way they are on mobile**, despite the extra width going
  unused. Wrapped both sections in an `lg:grid lg:grid-cols-2` row. The map
  keeps its own aspect ratio (its gradient margin can't be cropped without
  losing the design, so it was never a candidate for a forced height) and
  becomes the taller column at this width; Quick Start's section stretches
  to match via the grid's default `items-stretch`, and its card row (now
  `flex-1`, cards `lg:h-auto`) fills that height rather than leaving blank
  space under a short 160px row. Measured live: both sections render at
  identically 432px on a 1440px-wide screen.

---

### 2026-10-07 — Chat header dropdown: real Insights/Settings icons

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth the same swap if
the Flutter cockpit has an equivalent menu) / `storybook` (worth a story
refresh for `ChatHeader`).

Replaced `ChatHeader`'s "More options" dropdown — lucide's `TrendingUp` and
`SlidersHorizontal` stand-ins — with the real exported icons
(`icon-menu-insights.png`, `icon-menu-settings.png`), same treatment as
Progress's Chapters/Insights tabs: a small `ComponentType<{ size,
className }>` wrapper per icon so the existing `<Icon size={19} .../>` call
site didn't need to change shape.

---

### 2026-10-07 — Chat header's Publish button: 16px text, should be 14px

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth checking the
Flutter equivalent for the same size) / `storybook` (no story for
`ChatHeader` yet).

The dropdown's "Publish" button carried `text-style-body` (16px) instead of
`text-style-body-small` (14px) — a one-class fix in `ChatHeader.tsx`.

---

### 2026-10-07 — Chat's "ready" result gets a collapsible "Reasoning"

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth the same addition if
the cockpit's generating/ready flow gets built there) / `storybook` (worth a
story for `SessionReasoningCard`).

A new reference showed the chat cockpit's "ready" result sitting under a
"Here it is:" label with a collapsible "Reasoning" chip — closed by default,
opening onto a short paragraph explaining what was built, before the result
card itself. Added `SessionReasoningCard`
(`src/components/chat/SessionReasoningCard.tsx`) and swapped it in for
`SessionProgressCard` specifically in `ChatPage`'s `sessionState === 'ready'`
branch — the `generating` branch (`SessionProgressCard`/`SessionProgressCardV2`,
the percentage-climbing state) is untouched. Confirmed with the user this
should show for any round that reaches "ready," not just a brand-new thread,
since `sessionState` already reaches `'ready'` the same way on a first build
and on every later "Apply new changes." The reasoning text itself is a
placeholder string for now — there's no brief/changes history yet to compose
a real explanation from, and the user asked for placeholder copy "close
enough to fit" rather than wiring it up today.

---

### 2026-10-07 — A soft ambient drift on the promo banner's glow

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth the same touch if
the promo banner gets built there) / `storybook` (not worth its own story —
the motion is the whole point and a static catalogue frame can't show it).

Home's dark "Generative Wellness Care" banner has two blurred orange
ellipses behind its content (Figma's own "Ellipse 6/7") that were flat and
static. Added `.u-glow-drift` to `motion.css` — a slow opacity-and-scale
breathe, 10s and 13s on the two blobs with a negative delay on the second so
they drift out of phase rather than pulsing in unison, which is what keeps
it reading as ambient instead of a visible beat. Parameterised on a
`--glow-opacity` custom property since the two ellipses keep their own
different resting opacity (0.5 and 0.35) and one keyframe rule needed to
serve both without either jumping on its first frame. Picked up by the
existing `prefers-reduced-motion` blanket rule in the same file, same as
every other animation here — nothing extra needed for that.

---

### 2026-10-07 — Live-sessions stats count up instead of sitting pre-filled

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth the same treatment
on the Flutter equivalent) / `storybook` (worth a story for `CountUp`).

The "Ongoing Live Sessions" card's three numbers (87k People, 20k Today, 50
Now) were static text on both `HomePage` and `ExplorePage` — each page held
its own copy of the same hardcoded array. Added
`src/components/ui/CountUp.tsx`: ticks a number up from 0 to its target over
1.2s on mount, eased the same decelerating curve as everything else in this
app, with a `formatCompactCount` helper for the "87k" shorthand. Both pages
now hold the stats as numbers and animate them the same way instead of
printing the formatted string outright. `prefers-reduced-motion` is checked
by hand here — there's no CSS transition to tween formatted text like "87k",
so `motion.css`'s blanket rule has nothing to catch; reduced motion skips
straight to the final value.

---

### 2026-10-07 — Player's post-session check-in: Alignment Score, unified into the sheet, and shared with Session Detail's Lineage Tree

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (this whole flow is worth
porting — the Flutter player had neither the old floating check-in nor this
one) / `storybook` (worth stories for `AlignmentPanel` and `LineageTreeCard`
now that both are shared components).

A new reference for `PlayerPage`'s post-session state, compared against what
was actually in the code. Four confirmed gaps, each checked with the user
before building rather than guessed:

- **The mood check-in was a `fixed` card floating over the sheet, with its
  own "Skip."** The reference shows it flowing as the first block inside the
  same scrollable sheet content, pushing the session's own info down rather
  than sitting on top of it — once it is part of the scroll, scrolling past
  it *is* skipping it, so "Skip" is gone. `SessionCheckInCard` is now
  `SessionCheckIn`, a normal block rendered inside the scroller.
- **No Alignment Score.** The reference shows the same score-gauge-plus-
  Previous/Current-state panel `WellnessObjectiveCard` draws on `/wellness`,
  under the check-in's mood-or-text step, in both states. Extracted that
  panel into `src/components/wellness/AlignmentPanel.tsx` (gauge + the two
  state-tag columns) so `WellnessObjectiveCard` and `PlayerPage` draw it
  from one place instead of each growing their own copy — the same mistake
  `TagRow` made once already. The score and before/after tags are mock
  constants (65%, `anxious/scattered/overwhelmed` → `aligned/grounded/
  peaceful`) — there is no backend to compute a real one.
- **Two new action chips, "Elaborate on my experience" and "Suggest my
  morning boost,"** sit after the tags, visible whether or not the session
  has finished. Same hand-off Wellness's own "Analyze my state" chips use:
  `navigate('/chat', { state: { ask: '…' } })`, landing in the cockpit with
  the question already asked.
- **"Details" showed "Creator's intent / In the mix / Set for you"; the
  reference shows the Lineage Tree** `SessionDetailPage` already draws.
  Extracted `LineageRow` and its wrapping card into
  `src/components/ui/LineageTreeCard.tsx`, shared by both pages now.
  `SessionDetailPage`'s own Details section switched to the same shared
  component in the same change — one fewer place for the two pages to drift
  apart from. `session.intent`/`.layers`/`.personalization` are no longer
  read on this page; nothing else used them.

"Recreate your own version" was the one section the reference didn't show at
all in any of its three states — confirmed with the user it stays, same
position, rather than assuming the omission meant delete it.

---

### 2026-10-07 — PlayerPage had its own divergent tag chip; "TagRow is still wrong" was actually two different pages

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth checking whether the
Flutter player has the same divergence) / `storybook` (no story change needed,
`TagRow` already has one).

Several rounds of "the tag colour is still wrong" after `TagRow.tsx` had
already been fixed turned out to be two separate, visually near-identical
pages: `/session/:slug` (`SessionDetailPage`, uses `TagRow`, was correct) and
`/play/:slug` (`PlayerPage`), which had its own hardcoded solid-`#FF881B`
pill, added under a comment citing a different Figma frame (`16760:1688`) as
justification for not sharing `TagRow`. Every fix to `TagRow` was correct and
simply never touched the page being screenshotted. Found by asking for the
rendered `<span>`'s literal `class` attribute from devtools, which didn't
match `TagRow` at all — a faster path than the cache/build/deploy checks that
preceded it (browser cache, Vercel build cache via a diagnostic colour push,
CSS bundle filename, all ruled out first). `PlayerPage` now renders
`<TagRow tags={tags} />` like every other page; its own `SHOWN_TAGS`/`overflow`
locals are gone. Lesson for next time one component's fix "isn't showing up":
confirm the exact route in the URL bar before re-checking the component, since
two pages can render the same session data in two different hand-rolled
markups.

---

### 2026-10-07 — Recently Played cards needed their own text scrim; Session Detail's style cards were a size and an icon off

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both gaps are worth
checking for on the Flutter equivalents) / `storybook` (worth a story
refresh if `RecentCard` or `StylePresetCard` ever gets pulled out as its
own component).

Two separate reference comparisons in one round:

- **Explore's "Recently Played" shelf (`RecentCard`)** painted its title/
  author/time text directly over `CoverImage`'s scrim with no extra
  backdrop, unlike `SessionGridCard`'s frosted panel. A bright photo (the
  cyan half of the reference's own example) left the text low-contrast.
  Added the same tapered `backdrop-blur-sm` panel behind just the text
  block, masked so it fades in rather than cutting off sharply.
- **Session Detail's style-preset cards** (`StylePresetCard`, the
  "Recreate your own version" shelf) had a 48px orb in a 164px card and a
  full-width `Repeat2` button. The reference shows the same 73px-orb,
  173px-card proportions as `PlayerPage`'s own recreate shelf, and a
  pill-shaped button sized to its content, with `Shuffle` for the icon —
  not `Repeat2`. Matched both. The page's other `Shuffle`-less button, the
  sticky bottom "Recreate" CTA, had the same icon mismatch (its
  `bg-[#331B04]` colour was already correct) and is now `Shuffle` too.
  `StylePresetCard` stays its own component rather than merging into
  `RecommendationCard` — it forks a style brief, not a session preview,
  and the two have different navigation targets.

---

### 2026-10-07 — Player's "Recreate your own version" orbs were missing their play glyph

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (worth checking whether the
Flutter player's equivalent cards have the same gap) / `storybook` (worth a
story refresh for `RecommendationCard`'s `recreate` variant).

`RecommendationCard`'s 73px orb carried a comment stating the screen's own
card deliberately has no play glyph over it, citing a different frame
elsewhere in the same file that does. The reference for `PlayerPage`'s own
"Recreate your own version" shelf (`recreate` variant) shows a translucent
white circle with a play triangle centred on the orb — the comment's
distinction didn't hold for this variant specifically. Added that glyph, same
visual language as `HomePage`'s `PlayGlyph`, scaled down for the 73px orb;
the cockpit's `toggle` cards (used from `ChatMessageItem`) are unaffected and
still render the plain orb, which matches their own reference.

---

### 2026-10-07 — Style cards: the sharp top-right corner was a misread, reverted; they need an orange border

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (the border fix applies
there too) / `storybook` (worth a story refresh for `StylePresetCard`).

- **The previous round's `rounded-tr-4` was wrong.** It was read off a
  hand-drawn circle annotating a screenshot, interpreted as "the
  top-right corner is sharper than the others." A clean, unannotated
  reference this round shows all four corners equally rounded — zoomed
  in, there's no asymmetry at all. Reverted to plain `rounded-16`. The
  annotation was pointing at something else on that card (most likely
  the missing border below), not the corner geometry; worth remembering
  that a circled region doesn't always mean "this exact edge is wrong,"
  especially near a corner where a border and a radius both live.
- **What the card actually needs: a visible border**, not the near-
  invisible `border-border-subtle` it had — pixel-sampled the new
  reference at `#F2A54B`, an orange that doesn't match an existing
  token, so it's an explicit value like the session's other off-token
  colours.
- Confirmed live: corners uniform, border visibly orange, matching the
  reference card-for-card.

### 2026-10-07 — Session Detail: tag colour/size, and one corner of the style cards

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both fixes apply there
too) / `storybook` (`TagRow` is a shared component — worth a story
refresh).

- **`TagRow`** (the `#hashtag` pills on Session Detail, shared with My
  Wellness) was `bg-gold-100 text-warning-700` at `text-style-caption`
  (10px) — a pale yellow chip with dark amber text, nowhere close to the
  reference's warm peach chip with vivid orange text. Pixel-sampled the
  reference screenshot rather than guess: background `#FDF3E9`, text
  `#EF8B39` — neither matches an existing token, so both are explicit
  values, same treatment as the other off-token colours already logged
  in `DESIGN-SYSTEM-HISTORY.md`. Bumped the type from caption to
  `text-style-body-small` (14px) and the padding from `px-10 py-4` to
  `px-12 py-6` to match the chunkier pill in the reference — confirmed
  against a live screenshot, not just the computed styles.
- **`StylePresetCard`** (the "Increase Yellow" / "Less movement" cards
  under "Recreate your own version") was a uniform `rounded-16` on all
  four corners; the reference has a visibly tighter top-right corner —
  close to square, not just a smaller round. Added `rounded-tr-4` on top
  of the existing `rounded-16`.

### 2026-10-07 — "New session" radius corrected; Player Beta removed entirely

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (the Flutter app never
had Player Beta, so nothing to remove there; the radius fix doesn't
apply, it's web-only chrome) / `storybook` (if the drawer's "New
session" button or the plain player have a story, refresh the radius
there too).

- **Drawer's "New session" button** was `rounded-[60px]`; Figma's own
  value for this frame is 16px. The code comment citing "radius 60" was
  wrong, not aspirational — corrected both.
- **Player Beta removed, not just left off.** It was a deliberate,
  documented feature (`/__demo`'s `player.beta` flag, default off,
  described at length in `CLAUDE.md` and `PRD.md`) — explicitly asked to
  be taken out this round rather than kept dormant: *"that screen
  shouldn't exist anymore, we should be using the previous default."*
  Removed the whole surface rather than just disabling it:
  - Deleted `src/pages/PlayerBetaPage.tsx` and `src/lib/playerBeta.ts`
    (the `playerHref()` URL-rewrite helper).
  - Removed the `/player-beta/:slug` route and its lazy import from
    `App.tsx`.
  - `PlayerPage.tsx` no longer checks the flag or redirects to the beta
    page — `/play/:slug` is now the only player, unconditionally.
  - `MiniPlayer.tsx` and `AttachedSession.tsx` link straight to
    `/play/:slug` again instead of rewriting the href through
    `playerHref()`.
  - Removed the `beta` feature from the `player` module in
    `src/demo/modules.ts` — the `/__demo` console no longer offers a
    switch for a screen that doesn't exist.
  - Removed the "Player Beta" section from `PRD.md` (and the
    `PlayerBeta` node from its site-map diagram) and the long `/__demo`
    explainer paragraph from `CLAUDE.md` — both described current
    behavior, and the behavior is gone.
  - Verified: `tsc -b` and a production build are clean with no
    `PlayerBetaPage` chunk in the output, and `/play/:slug` no longer
    redirects anywhere.

### 2026-10-07 — Real icons for the drawer's Invite a Friend / Help rows

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same two icons apply
there too) / `storybook` (worth a story update alongside the other four
nav icons from the previous round).

- Same treatment as the previous round's four nav rows: `UserPlus` and
  `HelpCircle` (lucide stand-ins) replaced with the real exported icons
  (`src/assets/icon-nav-invite.png`, `icon-nav-help.png`) through the
  same `NavIcon` wrapper already in `AppLayout.tsx`. `UserPlus` stays in
  use on `/admin/users` — a different, unrelated placement — so only
  this file's two call sites changed.

### 2026-10-06 — Real icons for the drawer's four nav rows

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same four icons apply
there too) / `storybook` (worth a story update for the new assets).

- The drawer's "Sign In" / "Explore" / "Sessions" / "My wellness" rows
  were lucide stand-ins (`User`, `Compass`, `ListMusic`, `Waves`) — none
  a real match for the Figma reference's own glyphs. Replaced all four
  with the actual exported icons (`src/assets/icon-nav-*.png`), rendered
  through a small `NavIcon` wrapper in `AppLayout.tsx` rather than
  lucide components, since `NavItem`'s `text-icon-default` colour
  wrapper has nothing to tint on a flat PNG — the colour is baked into
  each file already.
- Caught and fixed one mistake before pushing: Explore's and My
  wellness's files were swapped on the first pass (the wave/chart icon
  is My wellness's, the stacked-cards icon is Explore's) — a live
  screenshot comparison against the reference caught it immediately.
- Note for later: the Sign In icon's stroke renders at `#171717`
  (near-black); the other three are `#331B04`, the same off-token brown
  already logged in `DESIGN-SYSTEM-HISTORY.md`'s open-colours table.
  Left as supplied rather than recoloured — these are the user's own
  exported assets, not ours to repaint without being asked — but it may
  be worth a matching re-export later if the slight mismatch is visible
  side by side.

### 2026-10-06 — The generating-V2 build card: a missing shadow, an oversized icon

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same two fixes apply
if/when this option ships there) / `storybook` (`SessionProgressCardV2`
and `GeneratingShape` already have an entry there per the round that
introduced them — worth a refresh).

- `SessionProgressCardV2` (`/__demo` `chat.generatingV2`, the "building
  your session" card with the morphing-squares mark and rotating status
  line) had no shadow at all — `rounded-24 bg-surface-default p-16`,
  nothing else — unlike the Figma reference. Added `CARD_SHADOW`.
- `GeneratingShape` was rendered at 54px, the same height as the regular
  `SessionProgressCard`'s circular photo thumbnail. The two don't read
  the same at that size: a photo at 54px is just a photo, but a flat
  2×2 grid of saturated gold squares at the same pixel height reads
  noticeably larger next to two lines of 14px/10px text. Reduced to
  40px (both the one call site and the component's own default).
- Verified by actually driving the build flow in a live browser rather
  than guessing from the component in isolation — the `generatingV2`
  demo flag only takes effect from a fresh page load (`FeatureFlags`
  reads it once on mount; a same-tab `localStorage` write mid-session
  doesn't trigger a re-read, only a `storage` event from *another* tab
  does), so it has to be set before the first navigation, not toggled
  partway through a running session.

### 2026-10-06 — The inverse logo gap is closed, and a better live-sessions map asset

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both assets apply
there too) / `storybook` (`AureliaLogo`'s rendering changed again — worth
a story refresh, same as the last logo round).

- **`AureliaLogo`'s `inverse` variant** — the white mark used over Sign
  In's and Sign Up's photo header — was still the hand-traced SVG cutout
  noted as a gap in the last logo round ("no white export of the new
  mark exists yet"). Got the real export this round
  (`src/assets/aurelia-mark-inverse.png`): one flat image with the mark
  *and* the wordmark already white, not a mark to recolour and a
  separately-styled word next to it. `AureliaLogo` renders it as a single
  image for `inverse` now instead of composing mark + text, which also
  means `markOnly` has no effect combined with `inverse` — there's no
  placement that needs that combination yet, and no mark-only crop of
  this asset to serve it from if there were.
- **`live-sessions-map.png` replaced outright** with a better-composed
  source image (same 362:320 aspect ratio as the card, so `bg-cover`
  still shows it at zero crop) — the dot-map sits much closer to the top
  of its own canvas than the old asset did. No CSS changes needed on
  either `HomePage.tsx` or `ExplorePage.tsx`; both read the same file.

### 2026-10-06 — Self-hosted Mulish: the sidebar font wasn't actually different, it was a race

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (nothing to port — the
Flutter app bundles its own font asset rather than linking a webfont) /
`storybook` (should pick up the same self-hosted file so its catalogue
doesn't race the same way).

- **The drawer's font looked different signed out vs signed in** — same
  component (`AppLayout.tsx`'s `SidebarContent`, one copy for both
  states), same `text-style-body` class either way, so nothing in the
  code actually branches on sign-in state here. The real cause: Mulish
  was linked from `fonts.googleapis.com` with `display=swap`, which
  means the browser paints with a fallback system font first and swaps
  in Mulish only once it's fetched. Opening the drawer signed out (right
  after the page loads) and opening it again signed in (after several
  more seconds of clicking through the sign-in flow) are two different
  points in that race — same font, same file, different odds of having
  already won the swap.
- Fixed by removing the external dependency rather than tuning the
  timing: downloaded the actual font file
  (`fonts.gstatic.com/s/mulish/v18/1Ptvg83HX_SGhgqk3wot.woff2` — the
  same **one** variable-font binary Google's own CSS points all four
  requested weights at; it isn't four separate files) to
  `public/fonts/mulish-variable.woff2`, added the matching four
  `@font-face` blocks (300/400/500/600) to `src/index.css`, and replaced
  `index.html`'s Google Fonts `<link rel="stylesheet">` with
  `<link rel="preload" as="font">` pointed at the local file. That
  removes the "fetch a stylesheet, parse it, discover the font URL,
  *then* fetch the font" waterfall entirely — the browser starts
  fetching the one file it actually needs immediately, from the same
  origin as everything else.
- Confirmed live: `document.fonts.status` reads `"loaded"` on first
  check now (previously timing-dependent), and the drawer's rendered
  glyphs are pixel-identical signed out vs signed in.

### 2026-10-06 — Sign In's hero photo: real asset, no more Unsplash+ watermark

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same asset should
replace the equivalent there) / `storybook` (not a shared component).

- `src/assets/auth-hero.png` — the meditation photo behind Sign In, and
  reused by `AuthShell` for Sign Up and Forgot Password — was a licensed
  Unsplash+ preview, watermarked. Replaced with the real supplied photo
  (same scene, same crop, exactly 2x the old file's pixel dimensions).
  One file, so all three screens picked it up with no code change.

### 2026-10-06 — The "Back" button sweep missed two buttons entirely, not just their radius

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same fix applies there)
/ `storybook` (not a shared component).

- The earlier radius sweep changed every back button's corner from
  `rounded-full` to `rounded-12`, but two of them — `SessionSettingsPage`
  and `ProfilePage`'s own (viewing someone else) — had no
  `bg-surface-default` at all, so they rendered as a bare floating arrow
  with no card behind it rather than a wrong-radius card. A side-by-side
  the user sent this round made the gap obvious. Added the background
  (and `shadow-sm`) to both.
- While fixing those two, standardized every back button to the exact
  same recipe — `size-44`, `bg-surface-default`, a shadow
  (`shadow-sm` or `CARD_SHADOW`, whichever the file already used
  elsewhere) — rather than leaving `ChallengeDetailPage` and
  `SeeAllPage` at `size-40` or `SessionDetailPage`/`PlayerPage` without a
  shadow. The photo-overlay back buttons (`Sign In`, `AuthShell`) are
  untouched on purpose — `bg-black/30 backdrop-blur-sm` over a photo is a
  deliberately different treatment, not a missed case.

### 2026-10-06 — The real logo, replacing the hand-traced approximation

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (the Flutter app should
get the same asset — `docs/FOR-MOBILE.md` says the vectors are shared,
not re-traced) / `storybook` (the shared `AureliaLogo` component
deserves a story refresh since its rendering changed).

- `AureliaLogo.tsx`'s own doc comment already said what to do here: *"If
  the original vector exists... drop it in and replace the shapes
  below."* Got the real export this round (`src/assets/aurelia-mark.png`,
  48×48) after two failed attempts earlier in the session — one arrived
  as a 1×1 placeholder, one came through as a live chat interjection that
  never saved to a readable file. A proper message attachment finally
  worked.
- Swapped the hand-traced SVG (a rounded tile with a sweep and a dot,
  approximating the real mark) for an `<img>` of the actual asset, in the
  one file every placement reads from — hero, drawer, admin sidebar,
  sign-in, site lock all update together. The `inverse` variant (plain
  white tile for photo overlays, used on Sign In / Sign Up) is unchanged
  — there's no white export of the new mark yet, so it still falls back
  to the hand-traced cutout version for that one context.

### 2026-10-06 — My Wellness's Analytics/Connect chips were still rounded-full

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same fix applies there)
/ `storybook` (not a shared component).

- `WellnessTabButton` (the two standalone pills above the tab content,
  not the shared `SegmentedControl`) was `rounded-full`. Missed in the
  earlier hamburger/back/Recreate sweeps because it's its own
  one-off component. Now `rounded-12`.

### 2026-10-06 — Progress page: real icons for Chapters and Insights, not lucide stand-ins

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same two icons apply
there too) / `storybook` (worth a story update for the new icon assets).

- The "Chapters" tab icon (lucide `Library`, a book-stack glyph) and the
  "Insights" tab/card icon (lucide `Sparkles`) were always approximations
  — a comment on the insight card already flagged this: *"Outline in the
  frame (`vuesax/outline/star`), not a filled glyph"*. Replaced both with
  the actual exported PNGs (`src/assets/icon-chapters.png`,
  `src/assets/icon-insight.png`), rendered through two small wrapper
  components (`ChaptersIcon`, `InsightIcon`) that accept the same
  `size`/`className` shape the lucide icons did, so the `Tab` component
  and the `TABS` array needed no restructuring beyond widening the icon
  prop's type from `typeof Library` to `ComponentType<{ size?; className?
  }>`.
- Icon files came in as flat PNG (16×16 and 20×20) rather than SVG — SVG
  attachments aren't accepted by the chat's upload path (it expects a
  rendered raster image, and SVG is markup that needs a render step
  first, which is also commonly blocked as a script-injection vector).
  PNG at icon size is the right call here regardless: these are small,
  flat, single-use glyphs, not art that benefits from being scalable.

### 2026-10-06 — Live-sessions map: reverted the "140% crop," the gradient margin was the design all along

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same revert applies
there) / `storybook` (not a shared component).

- **The `backgroundSize: '140% auto'` / `backgroundPosition: 'center
  bottom'` crop from two rounds ago was wrong.** It was built on the
  assumption that the source asset's own top gradient band (no dots,
  ~28% of its height) was slack to crop out. A side-by-side the user
  sent this round, normalized to the same scale, showed the opposite:
  the correct look (their "yang seharusnya") has visible gradient padding
  on *both* top and bottom of the card, not dots filling it edge to edge.
  Re-measuring the source PNG confirms it: dots span 28.1%–77.5% of the
  image's height, a bottom margin as real as the top one, previously
  unmeasured. Since the card's aspect ratio exactly matches the image's,
  plain `bg-cover bg-center` — what both pages had *before* the "fix" —
  shows the whole image at exactly zero crop, reproducing that margin on
  every edge. Reverted both `HomePage.tsx` and `ExplorePage.tsx` to it.
- Confirmed by normalizing the user's two screenshots to the same width
  and comparing directly (not by eye at different scales, which is what
  made the "too much top space" read as a real bug two rounds ago), and
  again live after reverting: the rendered card now matches their
  reference almost exactly.

### 2026-10-06 — Explore's top gradient and live-sessions map were never fixed (only Home's copy was); hamburger and back buttons standardized sitewide

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (all fixes here apply
there too, including the duplicate-component lesson below) / `storybook`
(not shared components, except the icon-button radius — worth a story
update there too).

- **Explore's "Ongoing Live Sessions" map card was still `bg-cover
  bg-center`.** A previous round fixed the empty-top-space problem on
  Home's copy of this card (`backgroundSize: '140% auto'` +
  `backgroundPosition: 'center bottom'`) and reported it done — but
  `ExplorePage.tsx` has its own, separate copy of the exact same card
  (same `liveSessionsMap` asset, same markup), never touched. That's why
  the complaint kept coming back after being marked fixed: the two pages
  render two different instances of this "component." Applied the same
  fix here. There is no shared `LiveSessionsMapCard` component — that's
  worth doing if this duplication bites again.
- **Explore's top header gradient** didn't match its Figma frame
  (`16744:9604`, "Top Header"): Figma's is a 122px band fading from
  `rgba(255,230,130,0.6)` to fully transparent, laid over the page's own
  background; the code had an opaque `#FFE682` fading to opaque
  `#FFFFFF`, sized only to its (shorter) content instead of the full
  122px. Now matches both the color stops and the height.
- **The hamburger "Open menu" button was a different component on nearly
  every page** — `rounded-full` at size 40 or 44, `text-icon-strong`,
  inconsistent icon sizes, one page (`InvitePage`) even hand-rolling its
  own three-bar icon instead of lucide's `Menu`. `ProfilePage`'s own
  button (`rounded-12`, size 44, `text-icon-default`, `Menu` at 20) was
  already the odd one out in the *correct* direction — Figma's actual
  spec. Standardized every page's hamburger to match it: `Home`,
  `Explore`, `Sessions`, `Wellness`, `Invite`, `Help`.
- **The "Back" button had the same problem** — `rounded-full` on every
  page except two (`SessionDetailPage`, `ChallengeDetailPage`, already
  `rounded-12` from an earlier round). Standardized the rest to
  `rounded-12` too: `Home`'s drawer aside, `Player`, `Session Settings`,
  `Progress`, `Account Settings` (this round's ss5), `Credits`,
  `Notifications`, `Player Beta`, `Profile`'s own (viewing someone else),
  `See All`, and the photo-overlay back buttons on `Sign In` and the
  shared `AuthShell` (Sign Up / Forgot Password).
- **Explore's filter button, next to the coin pill, doesn't exist in
  Figma** — removed. The category chips row and its "All Categories"
  sheet (opened from the chip itself) still work exactly as before; only
  the redundant header shortcut to the same sheet is gone.

**Not changed — needs the actual asset:** the Settings "Credit
Redemption" row icon. The current code (`CircleDollarSign` from lucide)
doesn't match the diamond/sparkle shape in the screenshot sent this
round, but that screenshot is of the row itself, not the icon file — so
there's nothing to extract the real shape from. Asked for the actual
icon export rather than guessing at a lucide substitute.

### 2026-10-06 — Explore hero radius and Trusted Creators type size; two other flagged items already matched spec

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both real fixes apply
there too) / `storybook` (not shared components).

- **Explore's hero banner radius** was `rounded-24`; Figma's own Layout
  panel for this frame gives `Radius 20px`, not a value on Tailwind's
  closed scale (0/2/4/8/12/16/24/32/full), so it's `rounded-[20px]` as a
  deliberate raw value — same treatment as `radius/20` and `radius/48`
  elsewhere in this codebase (see `CLAUDE.md`). Height was already correct
  (`aspect-[362/244]`, matching Figma's `Height Fixed 244px`).
- **"Trusted Creators" names** were `text-style-caption` (10px); changed to
  `text-style-body` (16px) as asked. Confirmed live via `getComputedStyle`
  (scoped to the `/profile/:slug` avatar links — a plain text match on a
  creator's name also catches that same person's author credit elsewhere
  on the page, rendered at a different size).

**Not changed — already matched the request when checked:** the Monthly
Challenge card's subtitle (`ExplorePage.tsx`, `challenge.summary`) is
already `text-style-body-small`, 14px, confirmed via live
`getComputedStyle`. The "Picked for You" / "Biggest Impact" shelf cards'
Recreate pill is already `rounded-12`, confirmed the same way (12px) —
this is the same `SessionGridCard` component fixed in the previous round;
the flagged screenshot likely predates that fix reaching the screen it
was taken from.

### 2026-10-06 — Last three Recreate/Join radii, and the live-sessions map's real top-space problem

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (all four fixes apply
there too) / `storybook` (not shared components).

- **Three more "Recreate"/"Join" buttons were still `rounded-full`**,
  missed in earlier rounds because each lives in a different file:
  `SessionGridCard`'s Recreate pill (grid/shelf cards), `RecommendationCard`'s
  Recreate link (chat cockpit), `SessionDetailPage`'s mini style-card
  Recreate button, and Challenge Detail's "Join Challenge" / "View Winners"
  sticky CTA. All four now `rounded-12`, confirmed live via
  `getComputedStyle`.
- **Home's "Ongoing Live Sessions" map card had real empty space at its
  top, not a CSS margin problem.** The previous round checked the section's
  own `mt-*` spacing against Figma and found it already correct, and said
  so. A clearer side-by-side from the user prompted a second look: the
  source asset `src/assets/live-sessions-map.png` (1086×960) has the exact
  same aspect ratio as the card (362/320), so `bg-cover`/`bg-center` was
  applying zero crop — meaning the top ~27% of the image, which is pure
  gradient with no map dots, was rendering as-is. Fixed without touching
  the asset: `backgroundSize: '140% auto'` + `backgroundPosition: 'center
  bottom'` scales the image up and crops the overflow from the top,
  anchoring the visible crop to the bottom where the dots and stats row
  are. Confirmed live with a screenshot — map content now fills the card
  edge to edge.

### 2026-10-06 — Two more "less rounded" fixes; a third item traced to the Player Beta flag, not a bug

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both radius fixes apply
there too) / `storybook` (not shared components).

- **Home's closing CTA — "Get Started"** was `rounded-[40px]`; the
  reference calls for `rounded-12`.
- **Challenge Detail's Rewards pill** was still `rounded-full` — the color
  and position were corrected in an earlier round, but its radius was
  missed. Now `rounded-12`.

**Not changed:** the third item ("playing a podium/ranked-list cover opens
a card, not the full-screen player"). Traced it to `player.beta` — the
`/__demo` flag documented in `PRD.md`'s "Player Beta" section, default
off (`unreleased: true` in `src/demo/modules.ts`). When it's on, *every*
`/play/:slug` link redirects to the card-style beta player, by design —
"a direct link is not a way around the flag." Verified live: with the
flag off (a clean browser), the same podium link opens the plain
full-screen player correctly. The screenshot's "Sleep Meditation / Adam
Nilson" card is the app's own default demo track, which points at this
being session/flag state in the browser that reported it, not a code
path specific to Challenge Detail's podium or ranked list. Asked the
user to confirm via `/__demo` → Player → Player Beta before changing
anything, since bypassing the flag for one entry point would contradict
how it's built everywhere else.

### 2026-10-06 — Home: menu button shadow, composer buttons less rounded

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same header and composer) /
`storybook` (not shared components).

Two confirmed fixes from this round:

- **The "Open menu" hamburger button had no background and no shadow** —
  transparent lines floating directly on the hero gradient, unlike its own
  row-mate (Sign in / the coin pill), which already carries
  `bg-surface-default shadow-sm`. Matched it to that sibling exactly.
- **The Ask Aurelia composer's mic and send buttons were `rounded-full`**;
  the reference calls for `rounded-12`, consistent with every other
  "less rounded" chip/button fix already made across the app this round.

Two items from the same feedback batch are not done:

- **A replacement Aurelia logo** was attached but arrived as a 16×16
  placeholder with no usable image data (same failure mode as an earlier
  round's icon attachment) — asked the user to resend it as the actual
  file or pasted SVG markup.
- **"Reduce space at the top" of the Ongoing Live Sessions card** does not
  reproduce on the current build: measured live, the gaps are exactly
  `mt-40` (composer → heading) and `mt-16` (heading → card), which
  `DESIGN-SYSTEM-HISTORY.md`-adjacent prose in this very document already
  records as fact-checked against the frame in an earlier pass ("40, 40,
  16, 24, 48, 24, checked in the browser"). Flagged back to the user rather
  than undone on the strength of one screenshot that may be a stale build.

### 2026-10-05 — Player header: dropped the extra sound-switch button

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same header) /
`storybook` (not a shared component).

The frame draws three controls in this header — back, coin, share. A fourth,
a mute toggle, had been added between the coin and share; the component's
own comment already flagged it as "a fourth control in a row the frame drew
with three," and this round's screenshot asked for it to come out. Removed
the button and reverted the row's gap from 12 back to the frame's own 16,
which the comment said was only tightened to fit the fourth control.
`MiniPlayer` carries its own mute toggle already and is unaffected —
`muted`/`toggleMuted` stay in `AudioPlayerContext`, only this page's own
unused destructuring of them (and the now-unused `Volume2`/`VolumeX`
imports) came out.

### 2026-10-04 — Explore page matched to Figma's annotated "Issue 1" frame (16810:8673)

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (every item here applies
there too) / `storybook` (not shared components beyond `CoinMark`, already
covered).

Read the referenced node directly rather than going by the screenshot's five
callouts alone — the node data settled exactly what two of them meant:

- **Hero banner height.** `aspect-[362/200]` → `aspect-[362/244]`, matching
  the frame's own fixed 362×244 content box.
- **"Trusted Guides" heading.** This was a `FlipWord` cycling through
  Creators/Guides/Storytellers/Voices — the screenshot simply caught it
  mid-cycle. The frame's own text node is a single static string, "Trusted
  Creators", with no sign the heading was ever meant to rotate; switched to
  that plain string and dropped the now-unused `FlipWord` import and the
  `ReactNode` title type it required.
- **The Monthly Challenge section rendered every entry in `CHALLENGES`** as a
  horizontal shelf, with the heading pluralizing past one. Every other
  section's Figma frame has a `carousel` child; this one has a single `card`
  — confirmed by reading the node tree, not inferred from the screenshot. Cut
  to `CHALLENGES[0]` and a permanently singular "Monthly Challenge!".
- **The "Join" pill** was `rounded-full`; the frame's own button
  (`Frame 16`) is `cornerRadius: 12`.
- **The points/joined/days stat chips** were `rounded-full`; the frame's
  `statistic` chips are `cornerRadius: 8`. The points chip's icon was
  lucide's generic `Coins` glyph — the frame calls it `icon-token`, the same
  asset `CoinPill` already draws its balance beside everywhere else, so it's
  now `CoinMark` instead.

### 2026-10-04 — Chat cockpit matched to Figma's "Chat" frame (16809:4944), and Recreate's colour fixed sitewide

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (every item here applies
there too) / `storybook` (`CoinPill`, `RecommendationCard` and
`SessionGridCard` are shared components and should get a story update).

Read the referenced Figma node directly (`figma_get_component_for_development`,
`figma_get_file_data`) rather than guessing from the screenshot alone, since
several of these are precise colour/radius corrections:

- **`ChatHeader`'s four icon buttons and `CoinPill`** (shared by 13 screens)
  were `rounded-full` with no shadow; the frame specifies `rounded-12` with
  the same `0 5px 24px 4px rgba(0,0,0,0.05)` drop shadow already used on
  other floating controls in this app (`UpgradePage`, `FeatureCard`).
- **Aurelia's own chat bubble carried an avatar, a "Aurelia" label and a
  timestamp.** The frame runs it as plain paragraph text, flush with the
  page's own left gutter — no sender chrome on that side at all. Removed
  `AureliaLogo`, the label, and the per-run timestamp; `endsRun` (the prop
  that existed only to gate that timestamp) is gone from
  `ChatMessageItem` and its caller along with it.
- **The user's own bubble was a flat `brand-default` fill with a uniform
  `rounded-16` and its own timestamp underneath.** The frame's bubble
  (16809:4985) is a diagonal gradient (`#FFE270` → `#FF993B`) with a
  sent-message tail — the corner nearest the sender, bottom-right, comes to
  a point (`rectangleCornerRadii: [16,16,0,16]`). Timestamp removed to
  match; the read-receipt ticks went with it; the data field itself is
  unchanged.
- **`RecommendationCard` read its asymmetric `[48,20,20,20]` radius off a
  different, older Figma frame** (`16523:9513`, cited in the component's own
  comment). This screen's own card (`16809:4992`) is a uniform `20`,
  confirmed by reading the node directly — switched to match, and the
  border gradient corrected to the established `#FF881B → #FFE682` pair
  (the frame's own paint style resolves to `#FF8514 → #FFE270`;
  `DESIGN-SYSTEM-HISTORY.md` already records that difference as
  deliberately left alone). The play glyph drawn over the orb on every card
  is gone — this screen's own two visible cards carry no such overlay in
  the source file; the `Link` still plays on tap.
- **The suggestion-chip row (`Apply new changes` + the plain suggestions)
  was `rounded-full`.** Figma's own chips are `rounded-12`, and the "Apply
  new changes" chip specifically carries the same brand-gradient hairline
  as the recommendation cards — added via the same border-image technique,
  rather than a plain grey border like the other chips.
- **Every "Recreate" control site-wide used `text-text-primary` (`#3C2405`)
  or, on `SessionDetailPage`'s filled CTA, `bg-icon-strong` (pure black).**
  `#331B04` is already logged in `DESIGN-SYSTEM-HISTORY.md`'s open-colours
  table as the distinct brown this exact control uses in Figma — applied
  as a literal across all four instances (`SessionGridCard`,
  `RecommendationCard`'s recreate variant, and both of
  `SessionDetailPage`'s).

### 2026-10-04 — Session settings tabs: wrong active style and radius, not just rounding

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same tab treatment) /
`storybook` (not a shared component).

The Script/Visual/Sound tabs (and the trailing gear button) on Session
settings had two things wrong, not one: `rounded-full` instead of the
closed-corner `rounded-12` already corrected on Progress's own tab row, and
— the bigger miss — an active state styled as a light pill with a dark
outline (`border-icon-strong bg-surface-default text-text-primary`) where
the reference is a solid dark fill with inverse text, the same treatment
Progress's `Tab` component already uses. Matched both rows to that same
pattern: active is `border-text-primary bg-text-primary text-text-inverse`,
inactive is `border-[#d6d6d6] bg-transparent text-text-primary`. Confirmed
live — the screenshot's thick black bar under "Hold for four counts" is a
device text-selection handle in the user's own screenshot, not anything
this app renders; no code change follows from it.

### 2026-10-04 — Challenge Detail: Rewards pill sat too far from the sheet

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` / `storybook` (not a
shared component).

The previous pass moved this pill off the seam and gave it generous
clearance from the sheet — a reasonable read of that round's Figma crop,
but this round's screenshot showed the reference sits much closer, 8–12px
above the sheet rather than the ~56px it landed at. `bottom-56` → `bottom-34`,
measured live to a 10px gap between the pill and the sheet's visual top.

### 2026-10-04 — Progress page: Insights/Chapters/Social Impact tabs less rounded

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same tab shape) /
`storybook` (not a shared component).

`Tab`'s own comment claimed "radius 40," which for a 35-tall chip is just
`rounded-full` with extra headroom — a full stadium pill either way. The
screenshot comparison showed the actual reference uses a closed rounded
corner, not a pill. Changed to `rounded-12`, matching the radius this
session's other over-rounded chips (`Chip.tsx` and others) were already
corrected to. The same round also flagged the per-row icon in the Insights
list (`vuesax/outline/star`, currently standing in as lucide's `Sparkles`)
as the wrong shape, with the correct glyph supplied as a file attachment —
but what reached this session was a 16×16, 425-byte placeholder with no
usable artwork in it, so that swap is not done; asked the user to resend
the actual SVG markup or a larger export.

### 2026-10-04 — Challenge Detail: Rewards pill restyled off the seam, and the excess gap above the CTA removed

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (both are shape-of-the-page
decisions the Flutter screen should match) / `storybook` (not a shared
component).

Two more fixes on this page, same round of feedback:

- **The gap between Created Session and the sticky CTA bar was much larger
  than it needed to be.** `pb-140` on the content column was added as a
  manual reserve so the last row of cards would never sit under the sticky
  footer — but the footer is `position: sticky`, not `fixed`: it already
  occupies its own slot in normal flow at the true end of the page, so
  nothing above it needs to reserve room by hand. The 140px reserve was
  solving a problem `position: sticky` already solves on its own, and the
  cost was a wall of empty space the screenshot called out directly.
  Replaced with `pb-32`, matching the `mt-32` already set above the Created
  Session section, and reverted the sheet's `pt-40` (added last round to
  clear the Rewards pill, see below) back to `pt-24` now that the pill no
  longer sits in that flow.
- **The Rewards pill had the wrong style and the wrong position.** Last
  round's fix gave it more clearance from the row below by pushing the
  sheet's content down — a reasonable surface read of a 2px gap, but the
  side-by-side Figma comparison in this round showed the real issue was
  upstream: the pill isn't meant to sit on the hero/sheet seam at all. The
  reference floats it well inside the photo, dark and translucent
  (`bg-black/45 backdrop-blur-sm`, `text-text-inverse`) like every other
  control that sits directly over a cover photo — the Play glyphs on
  `SessionGridCard` and `CoverDisc` use the same pairing — rather than the
  solid light pill this had. Moved it from the sheet container into the
  hero container itself (`bottom-56` inside the now-bled hero), restyled to
  match, and left the small gold dot at the pill's edge in the reference
  unaddressed — no way to tell what value or state it represents from a
  screenshot, same reasoning as the podium gradient left open earlier in
  this file.

### 2026-10-04 — Challenge Detail: status-bar gap, Rewards collision, and a missing safe-area inset

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (the session-card blur mask
and the safe-area pattern both apply to the Flutter screens too) /
`storybook` (not a shared component beyond `SessionGridCard`, see below).

Four fixes from the same round of feedback:

- **`SessionGridCard`'s frosted caption panel reads as a seam, not a
  gradient.** `backdrop-blur-sm` has no fade of its own — the rectangle it's
  painted on cuts blur intensity off instantly at its own edge, visible
  against a sharp photo above it even though the *background colour* fades
  via the existing gradient. Added a `mask-image` (and its `-webkit-` form)
  on the same element so the blur itself tapers out over the top ~40% of
  the panel instead of stopping hard.
- **`ChallengeDetailPage`'s hero never bled into AppLayout's status-bar
  clearance.** Every other full-bleed hero (`SessionDetailPage`,
  `ExplorePage`'s header band) counters the `pt-[30px]` AppLayout adds below
  `lg` with its own `-mt-[30px]` plus 30 extra pixels of height, so the
  photo reaches the true top of the viewport instead of stopping where the
  status-bar clearance starts. This page's hero was never given that
  treatment, so `bg-background-default` showed through as a flat strip
  above the back/coin/share row — confirmed via `getBoundingClientRect()`
  (hero top was `y: 30`, not `0`) before the fix and a live screenshot
  after. `aspect-[402/300]` doesn't combine with a `+30px` offset the way a
  fixed height does, so the fix is `h-[calc(100vw*300/402+30px)]`, with
  `lg:h-auto` handing sizing back to the aspect ratio once AppLayout's own
  clearance resets to 0.
- **The Rewards pill nearly touched the "joined/ends" row under it.**
  Measured live: the button (`-top-22`, `h-44`) left only a 2px gap above
  content that starts at the sheet's `pt-24` — close enough to read as a
  collision, which is what the screenshot showed next to the correct Figma
  spacing. Changed the sheet's top padding to `pt-40`, which doesn't move
  the button (still floating on the seam, unaffected by padding) but gives
  the row below it an 18px gap instead of 2.
- **The sticky "Join Challenge" bar had no safe-area-inset-bottom.** Every
  other bottom-pinned control in this codebase that needs one
  (`PlayerPage`'s transport) adds `env(safe-area-inset-bottom)` to its own
  bottom padding; this bar never had it, so on a real phone with a home
  indicator the button's bottom edge sits under that bar instead of clear
  of it — read from the screenshot as "the CTA is hit by an overlay."
  `pb-12` is now `pb-[calc(12px+env(safe-area-inset-bottom))]`, matching
  PlayerPage's own pattern. `env()` resolves to `0` outside a real device,
  so this doesn't change anything in a desktop browser or this sandbox —
  only on the hardware the bug actually shows on.

### 2026-10-04 — Adaptive Wellness eyebrow chip: 10px to the 12px every other chip uses

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same text-style swap
needed there) / `storybook` (not a shared component).

The eyebrow's border/fill was already fixed to match the shared `Chip`
look in an earlier pass, but its text style wasn't checked at the same
time: `text-style-caption` is 10px, where `Chip.tsx` itself (and the Figma
reference) both read 12px. Swapped to `text-style-label-regular` — 12px at
the lighter weight the eyebrow actually uses, as opposed to `text-style-
label`'s medium weight on the interactive filter chips. Confirmed via
computed style (`font-size: 12px`) and a live screenshot.

### 2026-10-04 — Home's closing CTA padding, and three Challenge Detail fixes

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (all four fixes below need
filing for the Flutter equivalents) / `storybook` (no shared component
changed — `HomePage.tsx`'s own CTA block and `ChallengeDetailPage.tsx` are
both page-local).

**Home's closing CTA.** The "Casual Intelligence for Global Community"
card's own code comment already documented the intended line break ("the
frame breaks after 'for'") and added `text-balance` specifically to hit
it — but `px-20` left the text column wide enough that balancing still
landed on "Casual Intelligence for Global / Community" instead. Tested
`px-32` (no change) and `px-48` (correct break) directly against the
reference before picking it — `text-balance`'s break point is sensitive to
exactly how much width is left for the headline, not a linear function of
the padding value, so the middle guess didn't move it at all.

**Challenge Detail**, four Figma-flagged fixes, one a real functional gap
rather than styling: the back/share buttons went from `rounded-full` to
`rounded-12`, matching the squircle treatment applied elsewhere this
session. **The podium's and the ranked list's "play" discs had no click
handler at all** — tapping a track did nothing, where the design means it
to open the full player; both now link to `/play/:slug` the same way
`SessionGridCard` already does elsewhere, verified live (clicking rank 1's
disc now lands on `/play/dolphins-frequency`). The "Created Session" cards
were rendering at a 2:3 ratio (`aspect-[234/351]`) — markedly more
elongated than the 4:5 ratio `SessionGridCard` itself defaults to and the
Home/Explore community shelf uses — tall enough to crowd the page's sticky
"Join Challenge" bar; now `aspect-[4/5]`, matching the component's own
default and giving the sticky footer more breathing room. The podium's
background gradient was also flagged as not matching Figma — left
unchanged pending exact values, since this is a color-matching call and the
screenshot alone didn't give enough confidence to guess at it correctly.

### 2026-10-04 — Adaptive Wellness feature-grid icons: rounded squares, not circles

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only) / `mobile_app` (same badge shape needs
filing there) / `storybook` (`FeatureCard` should get a story refreshed).

`FeatureCard`'s gradient icon badge was `rounded-full` — a perfect circle —
where the Figma reference draws a rounded square, the same "squircle" ratio
the app's own icon tile already uses (`AureliaLogo.tsx`'s `rx="17"` on a
60px tile ≈ 28%, which maps to `rounded-12` on this component's 40px
badge). Only used on Home's Adaptive Wellness grid, so no other screen was
affected.

### 2026-10-04 — Filter chips less rounded sitewide, a frosted card caption, a mismatched eyebrow fixed

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — staging-only per the supplied Figma references) /
`mobile_app` (the Flutter chip/card equivalents need the same three changes,
not filed yet) / `storybook` (`Chip` and `SessionGridCard` should get their
stories refreshed there to match).

Three more Figma corrections, this time to shared components rather than
one page: `Chip.tsx` — the filter-pill component every category row on
Home, Explore and Notifications shares — went from `rounded-full` to
`rounded-12`, fixing all three screens' filter rows in one place rather than
three separate ones. `SessionGridCard` (used on Home, Explore, See All,
Profile and the challenge shelf) gained a `backdrop-blur-sm` frosted panel
behind just its title/stats block — not a blur over the whole card, which
would have also softened the Play/Recreate buttons above it; the panel
needed its own `z-20` stacking context so its `-z-10` backdrop couldn't
escape and render behind the photo instead of behind the text, confirmed via
computed style (`backdrop-filter: blur(8px)`, text still painting on top).
Home's "Adaptive Wellness" eyebrow chip, which used a different one-off
style (`rounded-full bg-background-elevated`, a solid fill) rather than the
shared `Chip` look, now matches it: `rounded-12`, a `border-[#D6D6D6]`
outline, transparent background.

### 2026-10-04 — Home's Generative Wellness banner: less rounding, gapped cards

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request — per three supplied Figma reference screenshots, this
batch is staging-only for now) / `mobile_app` (the banner's own Flutter
build needs the same three changes, not filed yet) / `storybook` (not an
extracted component).

Three Figma-flagged corrections to Home's dark "Generative Wellness Care"
banner (`HomePage.tsx`'s promo section): the badge went from `rounded-full`
to `rounded-12` and the "Start your Journey" button from `rounded-full` to
`rounded-16` — both were full pills where the frame draws a noticeably
flatter corner. The rotated photo-card pair (`Frame 25`, 16698:4451) kept
its existing -30° tilt but the flex gap between them went from `gap-16` to
`gap-48` — at `gap-16` the two cards' rotated corners visually touched
despite the normal-flow gap between their (unrotated) bounding boxes, since
rotation doesn't shift the box the gap is measured from. Verified against
all three reference screenshots at both a 420px mobile width and 1440px
desktop.

### 2026-10-04 — Site lock default password changed to AURELIA2.0

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no site lock on mobile) / `storybook`
(not a component).

`SITE_PASSWORD`'s fallback in `src/demo/siteLock.ts` changed from
`aurelia-preview` to `AURELIA2.0`, by request. Still the documented
courtesy-lock, not security — `VITE_SITE_PASSWORD` overrides it per
deployment without touching git history, same as before. Updated the one
other literal reference to the old password, in `docs/FOR-AI-AGENT.md`'s
Playwright unlock snippet. Verified live: the old password no longer
unlocks the site, the new one does.

### 2026-10-02 — A risk register for AI + backend integration, scoped to the main site only

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (web-FE-specific, though several risks —
the reply contract, error taxonomy, pagination — apply in spirit) /
`storybook` (not a component).

Added Part III to `docs/FOR-FRONTEND-READINESS.md`: eleven risks for the
moment real AI and a real backend replace the mock cockpit and catalogue,
explicitly scoped to the consumer site (not `/admin`) and written for where
this project actually is — no developer seated yet, still finalizing scope
with the client — so every risk ends in something to *decide or specify
now* rather than a coding task. Highlights: the reply contract needs to stay
structured (`proposes`/`changes`/`prompts`) or the UI loses the ability to
tell "talked about it" from "did it," exactly the failure `replies.ts`'s own
comments already guard against; nothing today ever holds a reply back for a
safety check even though the admin side already models that a real model
will need one; the mock data shapes documented as "a decision to revisit" in
`docs/FOR-BACKEND.md` need freezing before a developer builds against either
side's guess; and this project's whole verification history assumes
deterministic replies, which a real model will not give it. Closes with a
five-item "put this in front of the client now" shortlist — the risks that
are pure decisions, free to settle on paper during finalization.

### 2026-10-02 — FOR-FRONTEND-READINESS.md restructured around the end user, not the engineering plumbing

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (web-FE-specific) / `storybook` (not a
component).

The first version of this doc led with data-fetching layers and bundle
splitting — real, but an answer to "what does an engineer need," not "what
does the person using the app hit." Restructured into two parts: Part I is
what a real end user actually experiences first — every screen's blank-slate
day-one state (not just Home, which was the only one PRD's own table named),
the cockpit's real generation latency with no wait-state UI, real audio
delivery (including iOS Safari's autoplay-needs-a-direct-tap trap, untested
by this project's Chromium-only verification history), getting signed out
on every reload, a payment flow that's a page and not a flow, consent
toggles that don't connect or disconnect anything real, account deletion
that deletes nothing, "live" numbers that need to become true once real
users exist, and error copy that needs the product's own voice. Part II
keeps the original engineering-infrastructure content as the supporting
work underneath Part I, not the headline. The "where to start" list is
reordered accordingly — real session persistence now leads, since it's the
single most retention-costing gap and the one most invisible in any
walkthrough.

### 2026-10-02 — Admin's 18 pages are code-split now, not shipped in one bundle

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent bundle) / `storybook` (not a
component).

First concrete item off `docs/FOR-FRONTEND-READINESS.md`'s "start now" list.
Every admin page was imported eagerly in `src/App.tsx`, so opening the
Dashboard downloaded all 18 modules' code regardless of which one an admin
actually wanted — the same mistake the 22 consumer pages solved with
`lazy()` and a shared `<Suspense>` boundary. `AdminLayout` now wraps its own
`<Outlet />` in exactly that pattern, and every admin page is `lazy()`
alongside the consumer ones. No behavior change — confirmed every admin
route still loads correctly — only a lighter bundle for the common case.

### 2026-10-02 — A fifth `FOR-*` doc: what the frontend needs before this is a real product

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (web-FE-specific, though the testing and
observability sections apply in spirit) / `storybook` (not a component).

Added `docs/FOR-FRONTEND-READINESS.md` — a forward-looking audit of what has
no code path today because nothing in the app can currently fail, take time,
or arrive asynchronously: no data-fetching layer (every screen reads a
`const` or a context seeded from one), no loading/error/empty states
anywhere, `/admin` still has no auth even though three of its modules now
mutate real data, zero automated tests, no image pipeline beyond hotlinking
Unsplash, admin's 18 pages are not code-split the way the 22 consumer pages
already are, and no observability of any kind. Ends with a priority-ordered
"start here" list rather than a flat gap list, since the request was to
begin addressing it, not just name it. CLAUDE.md's documents table updated
to list it as the fifth `FOR-*` file.

### 2026-10-02 — Admin gets two modules on Aurelia's actual mechanics, not generic SaaS admin

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (admin is web-only) / `storybook` (not a
shared component).

A product-owner review of the admin panel so far (Users, Sessions,
Challenges, Payments, Revenue, …) found it was all generic SaaS-operator
boilerplate — nothing in it was distinctly *Aurelia*. Two new modules close
that: **Cockpit Rules** (`/admin/cockpit-rules`) is the admin's window onto
`src/lib/replies.ts`'s keyword-matched reply engine — today's entire "AI" —
listing all ~20 rules with their trigger pattern (shown, not editable: a
typo there would silently break matching) and letting an operator tune the
reply text and whether it proposes a brief or produces a new cut.
**Signal Sources** (`/admin/signal-sources`) manages the six My Wellness
integrations from `src/lib/signals.ts`, including `reads` — the literal
consent sentence a member agrees to, which makes this screen a compliance
surface and not just copy. Both import the real arrays the consumer app
runs rather than a parallel admin-scale mock, unlike every other admin
module (deliberately — see `docs/FOR-BACKEND.md` §4.2 for why that split is
intentional, not an inconsistency to fix).

### 2026-10-02 — Admin's mock data is cross-linked, shares one data layer, and users get a detail page

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (admin is web-only) / `storybook` (not a
shared component).

Two gaps from the admin work above, both raised by the product owner in the
same breath — "make sure this is easy to wire to a real backend later" and
"clicking into another user should show that user's own mock data" — turned
out to be the same fix. `ContentSession`, `CoinTx` and `AuditEntry` used to
carry a free-text author/user/actor name generated independently of the
`USERS` table, so two mock rows could share a name without being the same
account; they now carry the real id (`authorId`, `userId`, `actorId`)
alongside it, generated by actually picking a `USERS` row rather than a
fresh random name. That made a real `/admin/users/:id` page possible:
clicking a user now opens their own profile — sessions they authored, their
coin ledger, their audit history — instead of a name with nothing behind
it. Separately, Users/Sessions/Challenges each held their own local
`useState` copy of the same mock array, so a role change on Users was
invisible from the new user-detail page reading "the same" data; all three
now read and write through one `AdminDataProvider` (`src/admin/data/
AdminDataContext.tsx`) wrapping the admin shell, with one named function per
mutation (`setUserRole`, `toggleSessionStatus`, `saveChallenge`, …). That
context is also the intended seam for a real backend: swapping a mutator's
body for an API call needs no page to change. `docs/FOR-BACKEND.md` §4 now
documents the shapes, the id-based linkage decision, and the endpoints these
three screens imply.

### 2026-10-02 — Admin gets a Challenges module, and Sessions/Users get real controls

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (admin is web-only) / `storybook` (not a
shared component).

The one genuinely missing admin capability — challenge setup and editing —
is now a 16th module (`/admin/challenges`): create, edit and delete a
challenge's copy, pacing and three reward tiers, reusing the same
`ChallengeRecord` shape the consumer app reads so nothing can drift between
them. Leaderboards and session entries stay read-only, since those are
earned by play, not written by an admin. Sessions gained an actual
Edit sheet and a one-click Publish/Unpublish, and Users gained a working
"Invite user" and per-row Suspend/Reactivate and role change — all three
were previously read-only tables whose copy promised controls that weren't
wired up. Users, Sessions and Logs (Audit) were otherwise already adequate
for what was asked; Audit stays intentionally read-only (append-only by
design). Added two shared primitives other admin pages can now reuse:
`Button` (primary/secondary/danger/ghost) and `Modal`, plus shared form-field
styles — replacing one-off button and dialog markup with the same chrome
everywhere. Like the rest of `src/admin/`, edits are in-memory only and
reset on reload; there is still no backend.

### 2026-10-02 — Review annotations show up to 700px wide, not just 499px

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent tool) / `storybook` (not a
component).

Raised `MOBILE_WEB_BREAKPOINT` (`src/demo/modules.ts`) from 500 to 700. The
annotation pen button and its pins now render on any window narrower than
700px, not just true phone widths — the single constant also drives the
`/__demo` console's own description text, so that copy updated with it.

### 2026-10-01 — Fixed a race that could wipe shared annotations on first open

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent tool) / `storybook` (not a
component).

A real bug in the server sync added just above: opening the tool in a
browser with no local cache starts `annotations` at `[]` before the first
GET has even come back. The push effect only skipped data it recognized as
freshly arrived from the server (by reference) — it had no way to know
`[]` was "haven't checked yet" rather than "someone cleared every note" —
so if that GET took longer than the 700ms push debounce, the empty state
reached the server first and overwrote every real annotation other people
had already placed. Reported as: open it on a second browser and the whole
set reads as 0, even though the first browser still shows them. Added a
ref that only flips true once the first fetch has resolved (configured or
not) and gates the push effect on it, so nothing pushes before the tool
has actually seen what the server holds. Verified with a deliberately
slowed mock server: zero pushes before the slow GET resolves, the existing
annotation survives.

### 2026-10-01 — Review annotations sync through a server, not just localStorage

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent tool) / `storybook` (not a
component).

Annotations lived only in the browser's own `localStorage`, so a pin dropped
on one phone or browser was invisible everywhere else — the only way to move
notes between people was the `.txt` export. Added `api/annotations.ts`, the
same KV-backed pattern `api/config.ts` already uses for flags (Upstash Redis
over its REST API, scoped per deployment by `VERCEL_ENV` so staging and
production don't share pins, `configured: false` when `KV_REST_API_URL`/
`KV_REST_API_TOKEN` aren't set). Unlike flags there's no draft/publish
split — every local change (add, edit, drag, delete, import, clear-all)
debounces to one POST, and an open tab polls every 15s, so a pin another
person drops shows up without a reload. `localStorage` stays as the offline
cache and the fallback when KV isn't configured, so the tool still works
exactly as before in that case. The menu's bottom line reports which mode
it's actually in (`Synced…` / `Local only…` / `Sync error…`) plus the KV
key, the same transparency `/__demo` already gives its own sync state.
Last-write-wins, no merge — same simplification `api/config.ts` already
makes for flags, and an accepted gap for a low-traffic internal tool.

### 2026-10-01 — Challenge podium: rank 1's headroom, and a solid Rewards pill

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (not a shared component).

`ChallengeDetailPage.tsx`'s podium: rank 1's number sat right against the
card's `pt-16`, since its column alone carries no extra top margin (it's
the tallest of the three) — bumped the shared padding to `pt-24` so it
reads with the same headroom as 2nd and 3rd, which was the comparison
against Figma. The "Rewards" pill was `bg-surface-default/20` with white
(`text-inverse`) text and a blur — translucent, so it read as whatever the
cover photo underneath happened to be rather than its own control, unlike
every other floating button over a cover photo in the app (the back/share
buttons on `SessionDetailPage`'s own cover are solid `bg-surface-default`
with a dark icon). Made it solid and dark-on-light to match both Figma and
that convention.

### 2026-10-01 — "Delete all notes" in the review annotation menu

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent tool) / `storybook` (not a
component).

Deleting a batch of test pins one at a time (open, Delete, repeat) was the
only way to clear them — relevant now that the scroll-anchoring fix above
means old pins placed before it have to be dropped and re-placed rather
than migrated. The menu's "Delete all notes" clears every annotation on
every page (same scope the existing "All notes" list already covers), with
a native confirm naming the count before it does anything irreversible.

### 2026-10-01 — Session cover bleeds under the status band, not a color patch

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no mobile-status-bar concern there) /
`storybook` (not a component).

The flat strip added earlier to close the seam above `SessionDetailPage`'s
cover (under the mobile status-bar padding) painted the session's own
gradient over its own 30px box, independently of the cover below it — two
renders of the same gradient at two different heights, meeting at a visible
seam rather than one continuous color, which read as a bug of its own.
`CoverImage` fills whatever box it's given (`object-cover`, gradient and
scrim all `inset-0`), so instead the cover box itself now grows 30px taller
and bleeds upward (`-mt-[30px] h-[calc(100vw*0.8+30px)]`, reset on `lg:`):
the real photo extends under the status band, same principle as Sign In's
hero image, rather than a separate patch trying to match it.

### 2026-10-01 — Review annotation pins anchored to the page, not the viewport

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no equivalent tool) / `storybook` (not a
component).

A pin dropped on a scrolled screen stayed glued to that screen position as
you kept scrolling, instead of staying over the content it was marking —
because the whole overlay, pins included, was `position: fixed`, so none
of it ever scrolled with the page. `x`/`y` were (and still are) a percent
of the viewport, which carries no scroll information, so a `fixed` pin
rendered at the same spot on screen regardless of where the page was
scrolled to. Pins now render in a separate, non-fixed layer anchored at
the document's own (0, 0) — ordinary `position: absolute`, so they scroll
with the content like anything else on the page — and a new `scrollY`
field on each annotation (the scroll position at the moment it was placed
or last dragged) resolves `y` into one fixed spot in the full document:
`scrollY + (y / 100) * vh`. That spot holds across a scroll and across a
reload. The tool's own chrome (FAB, menu, note editor, toast) stays
genuinely viewport-fixed, which is what it needs. `NoteCard` now takes a
`scrollY` too, to project a pin's document position back to a screen
position when the editor opens. The `.txt` export gained a `scroll:` line;
older exports without one default it to 0.

### 2026-10-01 — Explore's Quick Start card: horizontal, with its own Play action

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (not a shared component —
each page's Quick Start rail is local markup).

`ExplorePage.tsx`'s Quick Start card was a 160×160 square with only a
"Create" label — not a real second action, since the whole card was one
`<Link to="/chat">`. Figma specs a 236×160 horizontal card with two
independent actions: a Play button and a Create pill, the same shape
`HomePage.tsx`'s own Quick Start rail already has. Rebuilt the card to
match that shape, and wired Play to something real: `standInFor()` in
`src/lib/quickStart.ts` — a helper that already existed, matched to each
card's catalogue stand-in, but was never called from anywhere — now opens
`/play/:slug` as a preview of that kind of session, while Create still
opens the cockpit. `HomePage.tsx`'s own Play button is unchanged and still
just opens chat (same as Create there); not touched here since the user
flagged Explore specifically.

### 2026-10-01 — Settings row height to match Figma 16523:13934

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (not a shared component).

`AccountSettingsPage.tsx`'s `Row` (Credit Redemption, Account Deletion, Log
Out) was `h-56`; Figma specs it at 64px. One-line fix.

### 2026-10-01 — Stop iOS rubber-band bounce from exposing the root background

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (no WebView bounce concern there) /
`storybook` (not a component).

Added `overscroll-behavior-y: none` on `html` in `src/index.css`. A real
iPhone screenshot taken inside WhatsApp's in-app browser showed a flat
`#FAFAFA` band above Sign In's hero photo — pixel-sampling confirmed it is
an exact match for `--color-background-default`, i.e. our own root
background, not a layout bug in the page. iOS WebKit's rubber-band bounce
at the document edge briefly reveals whatever sits behind the viewport-
filling app shell; `overscroll-behavior-y: none` is the standard fix and
applies globally rather than to Sign In alone, since any page is equally
exposed to the same bounce. Can't be reproduced or verified in this
sandbox (Chromium automation has no touch-bounce physics) — needs
re-checking on the real device that showed the bug.

### 2026-10-01 — Two unlisted layout probes: /__about and /__about/gallery

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (web-only scratch pages, not
a component or a Flutter screen).

Two new pages, `src/pages/dev/AboutLayoutPage.tsx` and
`GalleryLayoutPage.tsx`, registered at `/__about` and `/__about/gallery` —
top-level routes outside `AppLayout`, not linked from anywhere in the app,
same as `/__demo`. Purpose-built for judging an About/Gallery *layout*
without Aurelia's own content doing the work of making it look good: the
business ("Fathom Studio," an architecture and interiors studio), the
copy, the team, and the nine gallery projects are all invented and have
nothing to do with this product. Styled with the app's existing tokens and
components so what's on trial is the structure, not a second design
system. No new entry in `robots.txt` — the file already disallows the
whole site.

### 2026-10-01 — Review annotations, switched from `/__demo`

**Lands on:** `web_app` / `admin_cms`
**Not on:** `web_prod` (moves on request) / `mobile_app` (a web review tool;
the Flutter client has no `/__demo`) / `storybook` (a presenter tool, not a
shared component).

New `annotations` flag with its own card under the site lock in `/__demo`,
default off and untouched by Enable/Disable all. When on — and only below
500px wide, never on `/__demo` — a draggable 40px pen button lets a reviewer
pin numbered, draggable notes on any screen, save them to a `.txt` and open
one back, with each note in the list jumping to its screen. Notes live in
the reviewer's localStorage; the `.txt` is how they travel.

### 2026-09-30 — Make Sign In's form the guaranteed-visible element, not just reachable

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

Revises the previous entry's fix. Making the button/legal-text block
scrollable meant it was no longer *invisible* on a short phone, but it still
needed a scroll to see — the ask was for the form to always be on screen
with no action required, on any device. Swapped which element gives way:
the photo is now `flex-1 min-h-0` (crops via `object-cover` down to however
much space is left, all the way to nothing) and the form block is
`shrink-0` (always renders at its full natural size, never compressed).
Verified with Playwright that the "Create an account" link's own bounding
box sits fully inside the viewport — not just reachable by scrolling — at
896, 667, 568, and a deliberately extreme 480px viewport height, with
screenshots confirming the photo crops cleanly rather than distorting at
any of them.

### 2026-09-30 — Fix Sign In's content getting clipped on short mobile viewports

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

Asked to make Sign In, Sign Up, and Forgot Password's height responsive on
mobile. Sign Up and Forgot Password were already correct — both scroll their
form under a fixed 200px photo header via `min-h-0 flex-1 overflow-y-auto`.
Sign In was the one page without it: its photo is `shrink-0` at a fixed
402/661 ratio (~661px tall on a 402-wide phone), and its button/legal-text
block below had no `min-h-0` or scroll of its own, so on anything shorter
than ~880px — measured, that's the Google/Apple buttons and the "Create an
account" / "Forgot password?" links entirely — the flex item refused to
shrink below its content size and the excess was clipped by the card's
`overflow-hidden`, not scrollable. Confirmed with Playwright at 896/667/568px
viewport heights: at 667 and 568 the sign-up link rendered at y=863,
unreachably below the visible card. Brought Sign In in line with the other
two screens' already-correct pattern.

### 2026-09-30 — Fix PlayerPage's sheet typography against Figma; found a bigger gap underneath it

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

The user pointed at Figma 16760:2848 ("Player" x2) expecting the sheet
below the transport to end up looking like it. Pulled all 120 of its text
nodes; the content that has a direct match in `PlayerPage.tsx` — author,
stats, tags — was one type-scale step off exactly like SessionDetail's own
pass, and is fixed the same way: stat values to Title Large Regular
(24/Regular, was Title/20/Medium), their labels to Label Regular (12, was
Body Small/14), the author name to Body (16, was Body Small Medium/14).
The `#hashtag` chips don't go through the shared `TagRow` here — this page
has its own inline chip markup — so they could be changed outright to the
frame's solid `#FF881B` pill at Body Small Light, no variant-prop decision
needed the way SessionDetail's did.

**The bigger finding:** that Figma frame is not just this page with
different type sizes. It has an "Alignment Score" card (the same
Challenging/Aligned gauge and Previous/Current State chips built for
`WellnessObjectiveCard` earlier this session), a "scale" section, and a
comparison-toggle block that don't exist anywhere in `PlayerPage.tsx` today
— real missing sections, not a font mismatch. Left unbuilt pending a
decision on scope; the title, description, tag, and Details/Lineage-Tree
content that *is* already on the page matches this Figma frame's own copy
almost verbatim, so the frame reads as "add these sections to the existing
sheet," not "rebuild the sheet."

### 2026-09-30 — Close SessionDetail's cover seam; fix ten type-scale mismatches against Figma

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

**Cover seam:** the previous entry's fix for Home/Explore's status-band seam
doesn't apply here — this cover is sized by `aspect-[375/300]`, and the same
negative-margin-plus-padding bleed would grow the box past its intended
ratio. Added a flat 30px strip above it in the session's own gradient
instead, closing the seam without a second image fetch or fighting the
aspect-ratio math.

**Typography:** pulled every text node under Figma 16744:9649 with its style
name and diffed against the page. Ten mismatches, all a size or weight off
rather than a totally different scale: the session title was Title Large
(24/SemiBold) where the frame draws Title (20/Medium — Title Large is for
the sticky page header, not a content heading); the summary and its "Read
More" control, the two stat values and their labels, the "Recreate your own
version"/"Details" headings, "Lineage Tree" and its rows, "See All", the
style-preset cards' body and reason text, and the footer's Recreate button
(also `h-52 rounded-full` → the frame's `h-56 rounded-16`, and a
`font-semibold` the frame doesn't draw) were each one step off the scale
Figma actually specifies.

**Not fixed — needs a decision:** the `#hashtag` chips use the shared
`TagRow` component (`bg-gold-100`/`text-warning-700`, Caption 10px), but
this frame draws them as solid `#FF881B` pills at Body Small Light (14px) —
a different chip design, not just a font size. `TagRow` has no variant
prop and is also used by `WellnessObjectiveCard`, whose own Figma reference
matches the pale style already there, so this isn't a case of one page being
wrong; the two screens want different chips. Left alone pending a decision
on whether to add a `tone` prop or give SessionDetail its own chip markup.

### 2026-09-30 — Bleed Home/Explore's header gradients under the status band; fix SessionDetail's floating controls

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

Closes the seam the previous entry flagged as a known gap, and fixes three
more mismatches found comparing the live app against Figma 16744:6839
(Explore) and 16744:9649 (Session Detail).

**Home and Explore:** both paint their own gradient on their root div, which
sat *inside* `AppLayout`'s new status-bar padding — so the padding showed
the layout's flat `#FAFAFA` instead of the page's own color. Fixed with the
standard bleed pair (`-mt-[30px] pt-[30px] lg:mt-0 lg:pt-0`) on each page's
own background container, which pulls the background up to the true top of
the viewport while an equal padding keeps the content where it already was.
Explore's fix is more than a seam patch: its gradient was a `#ffffff →
#fff6e6 → #ffffff` wash carried down the *entire* page, where Figma's
`Top Header` draws `#FFE682 → #FFFFFF` confined to just the 122px status-bar
+ header band — the header row is now wrapped in its own gradient container
instead of the gradient living on the page root.

**Session Detail's floating controls:** the back and share buttons were a
40px circle at the page's `left/right-16`; the frame draws a 44px
radius-12 squircle at `left/right-20` (the app's usual 20px gutter). The
play button was a 56px circle sitting 16px off the bottom edge; the frame
is 44px and sits well clear of it, so it moved to `bottom-40`. The author
row's avatar was 40px with a 12px gap and an 18px chevron on Body Small
Medium; the frame draws a 24px avatar, an 8px gap, a 12px chevron, and Body
Regular (no medium override) — all now match.

**Also checked, no change:** the profile tab's active underline was reported
as not spanning the full tab width, but a live render + `getBoundingClientRect`
measurement shows it already does (each tab is a `flex-1` button with its
own full-width `border-b-2`) — likely a stale build on the report side.

**Known gap, not yet fixed:** Session Detail's cover image has the same
seam as Home/Explore had, but its container is sized by `aspect-[375/300]`
rather than fixed padding — the same bleed pair would fight the aspect
ratio and grow the box taller than intended, so it needs a different
technique (extending the image layer itself, not the container) rather
than the one used here.

### 2026-09-30 — Bring back mobile status-bar clearance in AppLayout

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` (Flutter draws its own real status bar, not
a web simulation of one) / `storybook` (no component affected).

Ahead of a mobile-focused pass: added `pt-[30px] lg:pt-0` to the single
`<Outlet />` wrapper in `AppLayout.tsx`, so every consumer route below the
`lg` breakpoint clears space for the device's own status bar without a
per-page change — the same reasoning that already centralizes the
sticky-header behaviour in one `.u-sticky-top` class. This reintroduces, in
smaller form, a "simulated phone status bar" band the code's own comments
say used to sit above the page and was deliberately removed when the product
went web-first; the removal stands for `lg` and up.

**Known gap, not yet fixed:** pages that paint a full-bleed background or
photo from their own root (`HomePage` and likely `ExplorePage`,
`SessionDetailPage`, `ChallengeDetailPage`, `PlayerPage`) draw that
background on a div *inside* the padded wrapper, so the new 30px sits above
it in the wrapper's own `--color-background-default` (`#FAFAFA`) rather than
the page's own color — a faint seam, confirmed on Home. Plain-background
pages (Settings, Profile, the sign-in gate) show no seam. Fixing the
hero-style pages means extending each one's own background into that band
individually, which is a further, separate change.

### 2026-09-30 — Slice AccountSettingsPage's account row and delete dialog to Figma

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level, no shared
component contract changed).

Pulled Figma 16744:6630 (Settings) and 16744:6819 (the delete-account toast)
via the Desktop Bridge and diffed both against `AccountSettingsPage.tsx`.
The connected-account row's name/email were on Body/Body Small (16/14) where
the frame draws Body Small/Caption (14/10) — the 10px difference is exactly
what showed up as a 76px-tall row in devtools against Figma's 66px. "Add
another Google account" was a full pill with no border where the frame draws
a radius-12 chip with a `#D6D6D6` stroke, and its label was a raw
`text-[14px]` instead of a token. The delete-account dialog collapsed three
different gaps (8 between title/description, 24 icon-to-copy, 32
copy-to-buttons) into one flat `gap-16`, used lucide-sized `h-47`/`rounded-full`
buttons where the frame draws `h-56`/`radius-16`, ran the description on Body
Small where the frame specifies Body Small *Light*, and drew its icon at 48px
in a pale `danger-300` where the frame is 64px in a saturated red — switched
to `fill-feedback-error`, the same token already backing the Delete button,
rather than adding a new unbound red to match Figma's un-tokenized `#EF2B2B`
exactly. `SwitchAccountDialog` shares the same button/gap shape and wasn't
touched — no Figma reference for it was checked in this pass.

### 2026-09-29 — Fix the gap between ProfilePage's stats and its tab bar

**Lands on:** `web_app`
**Not on:** `admin_cms` (propagate on the next `--ff-only` merge) / `web_prod`
(moves on request) / `mobile_app` / `storybook` (page-level only).

The tab bar had no margin-top at all — what read as spacing was only the tab
button's own `py-12` tap-target padding. Figma 16744:6367 puts a real 32px
gap between the stats row and the tab bar; added `mt-32` to the tab
container rather than growing the padding, since that padding is a
different concern (the button's own hit area) that happened to be doing
double duty.

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
