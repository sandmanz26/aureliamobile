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

**Kept identical across `web_app`, `admin_cms`, `web_prod` and `mobile_app`,
the same way `docs/PRD.md` is.** Whichever branch you open this from, it
should read the same. Update it in the same commit as the change, every
time — that is the whole point of it existing.

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
