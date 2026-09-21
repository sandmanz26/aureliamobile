# Aurelia — for an AI agent

Orientation for an automated agent (Claude Code or otherwise) picking this
repository up cold. Written to be read in one pass, before touching anything.

**If you read only one section, read §1 and §2.** Nearly every wasted hour in
this project's history came from one of the four facts in §1.

> **Status** Written 20 Sep 2026 against `mobile_app` @ `e4fc580` and
> `web_app` @ `4dfaa4b`.

---

## 1 · Four facts that invalidate the obvious approach

### 1.1 One app per branch. There is no branch with everything.

| Branch | Contents | Toolchain |
| --- | --- | --- |
| `web_app` | React 19 + Vite + TypeScript + Tailwind v4. The consumer client **and** the admin CMS. | `npm` |
| `admin_cms` | **Byte-identical to `web_app`.** A name for a workstream, not different code. | `npm` |
| `web_prod` | The production cut of the web client. **Allowed to be behind `web_app`.** | `npm` |
| `mobile_app` | Flutter 3.47.3 / Dart 3.13.3. | `flutter` |

```bash
git checkout mobile_app     # then pubspec.yaml exists
git checkout web_app        # then package.json exists
```

Cloning the default branch and looking for either is the first thing that goes
wrong. A `find` for `pubspec.yaml` on the wrong branch returns nothing and
looks like a broken clone.

**`admin_cms` is kept in step with `--ff-only`:**

```bash
git checkout web_app && git commit ... && git push -u origin web_app
git checkout admin_cms && git merge --ff-only web_app && git push -u origin admin_cms
```

A divergence between them is a mistake, not a feature.

**`web_prod` is not kept in step, and that is the point.** It is the production
deployment's branch, it fast-forwards to `web_app`, and it moves **only when
the product owner asks for a release**:

```bash
git checkout web_prod && git merge --ff-only web_app && git push -u origin web_prod
git checkout web_app
```

Work being finished is not a reason to run that. Somebody asking for it is the
only reason. Never commit directly on `web_prod`: the next `--ff-only` will
refuse, and if it does refuse, stop and say so rather than forcing it.

### 1.2 The web app is the reference implementation

Where the two clients disagree, **the web is right and the Flutter app
changes.** Not because it matters more — because a single reference is the only
way two codebases stay in step.

So when asked to fix a visual difference on mobile, **read the web source for
that element and diff the values.** Do not redesign it:

```bash
git show web_app:src/pages/HomePage.tsx | grep -n "Ongoing Live Sessions" -A 40
git show web_app:src/components/chat/RecommendationDeck.tsx
git show web_app:src/assets/live-sessions-map.png > assets/images/live-sessions-map.png
```

### 1.3 Everything is mock, and it is meant to look real

26 sessions, 2 challenges, a notification feed, 6 signal sources — all
compile-time constants in `src/lib/*.ts` and `lib/core/data/*.dart`. Every
figure ("18.5k plays", "−43% stress") is invented and deliberately specific.

**Do not "fix" a number by making it plausible. It already is.**

### 1.4 Nothing you cannot run proves anything

There is no backend, no CI in this container, and the environment an agent runs
in usually has neither an Android SDK nor a device. State that limit rather
than implying a verification you did not do. See §4.

---

## 2 · Standing rules

These are not preferences. Each exists because breaking it cost a real build or
a real revert.

| Rule | Why |
| --- | --- |
| **Update `docs/PRD.md` in the same commit as the behaviour.** | It is the only record of *why*, and it is identical on all three branches by rule. |
| **Log token / variable / type-scale changes in `docs/DESIGN-SYSTEM-HISTORY.md`.** | The pipeline regenerates; the reasoning does not survive anywhere else. |
| **Never edit `src/styles/tokens.css` by hand.** | It is generated from `design-tokens/figma-export.json` by `npm run build:tokens`. The next export silently reverts you. |
| **Edit `design-tokens/figma-export.json` surgically.** | A `JSON.stringify` rewrite reformats 500 lines and buries the diff. This happened once and was reverted. |
| **`vercel.json` takes no comments of any kind.** | Vercel validates against a strict schema; a `"comment"` key inside a `headers` entry fails the build. This happened once. |
| **Do not run Prettier on `web_app`.** | There is no config, so it would reformat the tree to double quotes and semicolons and bury the next diff. |
| **Never push to a branch you were not told to.** | |
| **Never push `web_prod` unless the product owner asks in that turn.** | It is the live site. Standing instruction, given explicitly: production moves on request, not on judgement. |
| **Do not open a pull request unless asked.** | |
| **Read the node before claiming a Figma frame is implemented.** | Claiming otherwise happened three times in a row once, and was wrong each time. |

---

## 3 · Reading Figma

**Reads need no plugin.** `figma_get_component_for_development` and
`figma_get_component_image` work over REST with just a `fileUrl`. The Desktop
Bridge is only needed for *writes*.

Two things that will mislead you:

- **`figma_get_file_data`'s `nodeIds` parameter does not filter.** It returns
  the page list regardless, so you cannot search the file by name this way.
  Get the node id from the user's link.
- **Read leaf nodes, not depth-4 summaries.** The summaries stop before the
  text nodes, so type — size, weight, leading — is the one thing a shallow read
  cannot give you, and it is what reads wrong first.

Also true of the file itself:

- `layoutSizingVertical: FIXED` text boxes hold glyphs at a fixed height, so
  they overflow their box. A card measuring 108 rather than 114 can be correct.
- `radius/20` and `radius/48` are **not variables in Figma either**. Several
  frames use them as raw values, so `rounded-[20px]` is correct rather than a
  workaround. Do not invent tokens for them.

---

## 4 · How to verify, honestly

### 4.1 Flutter (`mobile_app`)

```bash
export PATH="/opt/flutter/bin:$PATH"     # usually installed, rarely on PATH
flutter analyze     # must say "No issues found!"
flutter test        # 62 tests, ~25s
```

The tests drive real screens on a 420×3200 surface and a `RenderFlex` overflow
*fails* one — so most layout bugs surface in fifteen seconds. They are
behavioural, not golden.

**What they cannot see.** A missing asset and a theme border bleeding through
both passed 62 green tests and a clean analyze, and were only found by running
on an emulator. If you have not run the app, say so.

### 4.2 Web (`web_app`)

```bash
npm install
npm run typecheck   # tsc -b
npm run lint        # oxlint
npm run build
```

**`npm run typecheck` runs `tsc -b`, not `tsc --noEmit`.** The root `tsconfig`
has `"files": []` and delegates to project references, so `tsc --noEmit` checks
nothing and passes on a broken tree. Use the script.

### 4.3 Driving the real web app

The most reliable verification available in a container. Playwright is not in
the repo's dependencies; install it in the scratchpad.

```bash
npm run dev                             # vite, port 5173
# Chromium is pre-installed:
#   executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
```

Facts that will cost you a run each:

- **The site lock:** `localStorage.setItem('aurelia.site.unlocked', 'aurelia-preview')`
  in an init script.
- **Sign-in does not survive `page.goto`.** It is a bool in memory. Navigate
  in-app, or sign in again after every `goto`. Module-level state (the publish
  record) is wiped the same way.
- Most guarded routes bounce to `/login`; fill `input[placeholder="Email"]` /
  `input[placeholder="Password"]` and click the **form's** Sign In button —
  there are two on the page.
- At 402px the desktop `<aside>` is hidden but **still in the DOM**. Selectors
  like `a[href^="/chat/"]` resolve it. Use `.last()` or `.filter({ visible: true })`.
- **Measure computed styles**, do not eyeball screenshots. This is what caught
  a 92px gap, a 32-vs-24 greeting weight and w600 headlines.

---

## 5 · The traps, per codebase

### 5.1 Tailwind v4 (`web_app`)

| Trap | Symptom |
| --- | --- |
| **`--spacing: 1px`** | Numeric utilities map 1:1 to pixels. `p-16` is 16px, not 4rem. Read every number as px. |
| **The radius scale is closed** — 0/2/4/8/12/16/24/32/full | `rounded-6`, `rounded-10`, `rounded-20` are not classes and render **square, silently**. Eleven elements were doing this. Use `rounded-[20px]`. |
| **v4 orders utilities by its own layers, not string order** | A `w-full` baked into a component beats a caller's `w-[228px]`. |
| **`.text-style-*` sits outside the utility layer** | It beats utilities regardless of order. Overriding weight or leading needs `!`. Caused two real bugs. |
| **`rotate-*` sets the standalone `rotate` property**, not `transform` | A probe reading `transform` reports no rotation on an element that is plainly rotated. |
| **`.u-page` animates with a transform** | A transformed ancestor becomes the containing block for `position: fixed`, so a `fixed inset-0` overlay pins to the *page box*. Sheets and modals must go through `createPortal`. Measured at `y=1710` in an 874px viewport once. |
| **Grid and flex children default to `min-width: auto`** | A wide child stretches its column instead of scrolling. `min-w-0` on the item. |
| **Absolutely positioned covers paint over normal-flow content** | `CoverImage` fills its parent; anything on top needs `relative`. |
| **`.u-tap` widens a target with a pseudo-element** | An audit measuring element boxes reports a 16px link as too small when it is not. |

**One rule per gap.** A section's spacing belongs to its own `mt-*`, not also
to a parent's `pb-*`. Home once had 92px between two blocks from three rules
stacking, and 92 appeared nowhere in the source. If a gap will not match Figma,
check whether it is set twice before changing the number you can see.

### 5.2 Flutter (`mobile_app`)

| Trap | Symptom |
| --- | --- |
| **`Container` with `alignment` and no `width`** | Takes every pixel its parent offers; a pill renders as a full-width bar. `Center(widthFactor: 1)`. |
| **A `Stack` sizes to its tallest non-positioned child** | A `Positioned` is measured from the wrong box. A play disc sat exactly 16.5px low and read as a design choice. |
| **Text is a hit-test target** | A `Text` in a `Stack` swallows taps meant for an overlay beneath it. Put the overlay above the copy. |
| **A ticking timer calling `setState`** | Everything rebuilds for one number. Use `ValueNotifier` + `ValueListenableBuilder`. |
| **`AppRadius` is closed** | A literal off the scale is almost always a mistake. |
| **`find.byTooltip` matches Semantics too** (Flutter 3.47+) | `tester.widget<Tooltip>(...)` throws. Use `find.byWidgetPredicate`. |
| **`InputDecoration`'s borders do not cascade** | `border: none` leaves `enabledBorder`/`focusedBorder` from the theme drawing. This put a second box inside the Home composer. |

### 5.3 Android toolchain

**Read the versions out of `flutter create`, never pick them.** Three failures
came from guessing:

| Guess | Rejected by |
| --- | --- |
| Gradle 8.3 | Java 21 |
| Gradle 8.7 | the Flutter Gradle Plugin's minimum of 8.14.0 |
| a version bump alone | four APIs that were removed, not aged |

```bash
cd /tmp && rm -rf _probe && flutter create _probe >/dev/null && \
  cat _probe/android/settings.gradle.kts _probe/android/build.gradle.kts \
      _probe/android/app/build.gradle.kts _probe/android/gradle.properties && \
  grep distributionUrl _probe/android/gradle/wrapper/gradle-wrapper.properties
```

The project adds only `namespace` and `applicationId` to those files.

---

## 6 · "It is not showing up" — check these first

In order. Most reports resolve at step 1 or 2.

1. **Are you on the right branch?**
2. **Is the feature flagged off?** `/__demo` is a feature-flag console and
   flags persist in `localStorage`. `src/demo/modules.ts` is the registry;
   `built: false` means nothing is behind it, `unreleased: true` means built
   and switched off. If a screen is missing and the code plainly renders it,
   check the flags before debugging the component.
3. **Is it the deploy, not the code?** `/__demo` opens with a **This build**
   panel — commit, branch, build time. If the commit is behind the branch you
   pushed, the deployment is behind and clearing a cache will not help. If it
   matches and a screen still looks old, it is the browser. A styling bug was
   once misdiagnosed this way; the live icons had never existed in git history.
4. **All flat gradients?** No network. Cover art is hotlinked from Unsplash and
   the gradient is the floor, not a fallback. The most common false report on
   this codebase.
5. **Blank Flutter web page?** CanvasKit is fetched from `gstatic.com` at run
   time and fails silently. `web/flutter_bootstrap.js` points the loader at the
   shipped copy — check it survived.

---

## 7 · The architecture, in one table each

### Web (`web_app`)

```
src/
  pages/        one file per consumer screen (22)
  admin/pages/  one file per admin module (15)
  components/chat/   the cockpit's own parts
  components/ui/     everything shared
  layouts/      AppLayout (drawer + shell), AdminLayout
  lib/          the catalogue and its helpers — no network, no database
  chat/         ChatSessionContext, the recreate hand-off
  audio/        AudioPlayerContext
  auth/         AuthContext + useSignInGate
  demo/         the /__demo feature-flag console
  styles/       tokens.css — GENERATED
api/config.ts   the only server code in the project
```

### Flutter (`mobile_app`)

```
lib/
  core/audio/   PlaybackController, AudioEngine, VoiceCapture (the plugin seams)
  core/auth/    AuthScope, the SSO seam
  core/data/    the entire catalogue, as const Dart
  core/theme/   mirrors the web's tokens 1:1
  core/widgets/ anything used by more than one screen
  features/     one directory per screen (22)
main.dart       routes, as a switch on settings.name
```

Three `InheritedNotifier`s above `MaterialApp` hold everything that outlives a
screen: `AuthScope`, `PlaybackScope`, `ChatSessionScope`. There is no
state-management package, and that is deliberate — at this size it is less code
than any library would add, and the seams are where you would put one when
there is a backend.

---

## 8 · Commit and push discipline

- Commit messages explain **why**, not what. The diff shows what. Long bodies
  are normal here; look at `git log` before writing one.
- State what was verified and what was not, in the message. "Not build-tested:
  this container has no Android SDK" belongs in the commit, not only in chat.
- Web changes go to `web_app`, then `admin_cms` by `--ff-only`, then **both**
  are pushed.
- `web_prod` is not part of that. It is pushed only when a release was asked
  for, by `--ff-only` from `web_app`, and never as a side effect of finishing
  something.
- `docs/PRD.md` must stay identical on all three branches.
- Never push to a branch you were not told to. Never open a PR unasked.

---

## 9 · Reading order for a cold start

1. `CLAUDE.md` **on the branch you are on** — different per branch.
2. `docs/PRD.md` — why anything behaves the way it does.
3. This file.
4. `docs/FOR-MOBILE.md` or the web `CLAUDE.md`, depending on the task.
5. `docs/FOR-BACKEND.md` if the task touches data shapes.
6. `docs/DESIGN-SYSTEM-HISTORY.md` before touching tokens (on `web_app`).
7. `docs/SSO.md` before touching auth (on `mobile_app`).
