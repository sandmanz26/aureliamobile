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

### 2026-09-22 — `storybook` branch: fixed `vercel.json` for deployment

**Lands on:** `storybook`
**Not on:** everywhere else — this branch's own deploy config only.

`vercel.json` was inherited from `web_app` unchanged when the branch was
cut, and pointed at the wrong build entirely: `npm run build` into `dist/`,
which builds the consumer app rather than the catalogue. Deployed as-is,
Vercel would have shipped another copy of `web_app` with no Storybook in
sight. Now `npm run build-storybook` into `storybook-static/`, verified by
running the exact command Vercel would. See "Deploying it (Vercel)" in
`docs/STORYBOOK.md` for why this needs its own Vercel project rather than
folding into `web_app`/`web_prod`'s.

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
