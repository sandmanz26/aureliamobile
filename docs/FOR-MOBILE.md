# Aurelia — for a mobile engineer

Everything needed to build, run, change and ship the Flutter client without
rediscovering what has already cost someone a build.

`CLAUDE.md` on this branch is the short version and stays authoritative for
conventions. This is the long version: setup on a real machine, the
architecture and why it is that shape, the traps with their symptoms, and the
parity rule that governs every visual decision.

> **Status** Written 20 Sep 2026 against `mobile_app` @ `e4fc580`.
> Toolchain verified on macOS with Flutter 3.47.3.

---

## 1 · Getting the code at all

**The repository keeps one app per branch.** There is no branch containing
everything.

| Branch | What is on it |
| --- | --- |
| `mobile_app` | This Flutter app |
| `web_app` | The React + Vite consumer client **and** the admin CMS |
| `admin_cms` | Deliberately identical to `web_app`, kept in step with `--ff-only` |

```bash
git clone https://github.com/sandmanz26/aureliamobile
cd aureliamobile
git checkout mobile_app          # ← cloning the default branch and looking for
                                 #   pubspec.yaml is the first thing that goes wrong
```

---

## 2 · Toolchain

**Flutter 3.47.3 / Dart 3.13.3.**

```bash
flutter --version
flutter pub get
flutter analyze     # must say "No issues found!"
flutter test        # 62 tests, ~25s
```

### 2.1 The Android versions are read, never chosen

This cost three failed builds in a row and is now a rule in `CLAUDE.md`:

| Guess | Rejected by |
| --- | --- |
| Gradle 8.3 (what Flutter 3.27.1 generated the project with) | Java 21, which a current Android Studio installs |
| Gradle 8.7 (3.27.1's own maximum) | the Flutter Gradle Plugin, minimum 8.14.0 |
| a version bump alone | four APIs that were **removed**, not merely aged |

The project is now **Gradle 9.3.1 / AGP 9.1.0 / Kotlin 2.4.0 / Java 17**, in
the Kotlin DSL (`.kts`). The four removals:

| Gone | Replaced by |
| --- | --- |
| `rootProject.buildDir` (Gradle 9) | `layout.buildDirectory` |
| `android.enableJetifier` (AGP 9) | nothing; no dependency here needs it |
| `kotlinOptions` (Kotlin 2.x) | `compilerOptions`, taking the `JvmTarget` enum |
| `JavaVersion.VERSION_1_8` | 17, which AGP 9 requires |

`android/gradle.properties` also carries two opt-outs that **Flutter's own
migrator re-adds on every run** if the repo does not state them — which made
them a permanent local change that aborted `git pull` twice:

```properties
android.builtInKotlin=false    # AGP 9 can compile Kotlin itself; we use kotlin-android
android.newDsl=false           # AGP 9's new DSL; our files are the classic android { }
```

**When the SDK moves again, read the numbers out of `flutter create`:**

```bash
cd /tmp && rm -rf _probe && flutter create _probe >/dev/null && \
  cat _probe/android/settings.gradle.kts _probe/android/build.gradle.kts \
      _probe/android/app/build.gradle.kts _probe/android/gradle.properties && \
  grep distributionUrl _probe/android/gradle/wrapper/gradle-wrapper.properties
```

The only things this project adds to those files are `namespace` and
`applicationId`, both `com.aurelia.care.aurelia_mobile`.

### 2.2 The three native plugins

The no-plugins rule held for months and bought `flutter run` on a fresh machine
with no CocoaPods step. It did not survive the first requirement that needed a
device: a wellness app whose player is silent and whose microphone does nothing
is not demoable.

| Plugin | For | Held at |
| --- | --- | --- |
| `just_audio` ^0.10.0 | the session bed and voice-note playback | 0.10.x |
| `record` ^6.0.0 | the cockpit's voice memo | 6.x |
| `path_provider` ^2.1.5 | where a recording is written | 2.x |

**Those ceilings were Dart 3.6 limits and that reason is gone.** Each was held
because the next major needed a newer Dart — 3.12 for `record`, 3.10 for
`path_provider`. Dart is 3.13.3 now. The constraints are what has been tested,
not what is possible: if an Android build fails inside one of these, raising it
is a legitimate first move.

**Both plugins sit behind a seam and that is not decoration.** `AudioEngine`
and `VoiceCapture` in `core/audio/` are the only files that import them. Every
widget test installs `SilentAudioEngine` and `SilentVoiceCapture`, which keep
real clocks and real streams — so the tests assert that the bar moves, that
pause holds it and that a refused mic shows its own screen, without a platform
channel anywhere near them. `AureliaApp` takes both as constructor arguments
for exactly that.

> **Flutter is deprecating the Kotlin Gradle Plugin.** Running on a device
> prints a warning that future Flutter versions will *fail* to build apps that
> apply KGP — including through plugins, and `record_android` is named. Moving
> to Built-in Kotlin is real upcoming work, and it probably starts with raising
> `record` to 7.x now that Dart allows it.

---

## 3 · Running it on a device

### 3.1 Android emulator

```bash
flutter emulators                          # what could be started
flutter emulators --launch <emulator_id>   # wait for the home screen, 30–60s
flutter devices
flutter run -d emulator-5554
```

`-d` is required the moment more than one target exists — on macOS, `macos` and
`chrome` are always there, and `flutter run` will happily build the desktop app.

**To create a new AVD you need `avdmanager`**, which is in *Android SDK
Command-line Tools* and is not installed by default: Android Studio → Settings →
Languages & Frameworks → Android SDK → SDK Tools → check **Android SDK
Command-line Tools (latest)**. The syntax is `flutter emulators --create --name
aurelia` — the name goes behind a flag, not positionally.

**Two-finger trackpad gestures are pinch-zoom on the emulator window**, not
scroll. To scroll inside the app, click-and-drag with one finger. To test the
voice memo, edit the AVD → Show Advanced Settings → **Virtual microphone uses
host audio input**, or the recorder shows "Aurelia cannot hear you" on a
device that is perfectly capable.

**`adb` is usually not on `PATH`:**

```bash
echo 'export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"' >> ~/.zshrc
```

### 3.2 A real iPhone

```bash
# global, once per machine — run from anywhere
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
brew install cocoapods
```

Then, in the repo:

```bash
open ios/Runner.xcworkspace
```

1. **Xcode → Settings (⌘,) → Accounts → +** → sign in with your Apple ID.
2. Project navigator → blue **Runner** → **TARGETS → Runner** → **Signing &
   Capabilities**.
3. Tick **Automatically manage signing**, pick your **Team**.
4. **Change the Bundle Identifier.** `com.aurelia.care.aureliaMobile` is not
   yours and Xcode cannot issue a profile for it. Use something like
   `com.yourname.aurelia`. **Do not commit that change** — it belongs to your
   machine, not the repo.
5. `flutter run -d <device-id>`.
6. First launch is refused: **Settings → General → VPN & Device Management →
   Apple Development: \<your email\> → Trust**, then run again.

**Developer Mode is hidden until the Mac has tried to use the device for
development.** It is not missing. Connect by cable, tap Trust, then open Xcode
→ Window → Devices and Simulators (⇧⌘2) and select the phone — *that* is what
makes the item appear in **Settings → Privacy & Security**, near the bottom.
Toggle on, restart, confirm.

If the Mac does not see the phone at all, check **Finder's sidebar** first: a
charge-only USB-C cable will never work, and no amount of Settings will fix it.
`xcrun devicectl list devices` gives the precise state.

A free Apple ID signs builds that **expire after 7 days**. Re-run to refresh.

### 3.3 In a browser (a CI box or a container)

```bash
flutter run -d chrome           # needs CHROME_EXECUTABLE if chrome is not on PATH
flutter build web && (cd build/web && python3 -m http.server 8099)
```

Treat it as a preview, not a platform. **A blank page is the trap, not your
change**: Flutter fetches CanvasKit from `gstatic.com` at run time even though
the build wrote a copy into `build/web/canvaskit/`, and a failed fetch leaves
the page white with nothing in the UI to say so. `web/flutter_bootstrap.js`
points the loader at the shipped copy. If a blank page ever returns, check that
file survived.

---

## 4 · Architecture

```
lib/
  core/
    audio/     PlaybackController — what is on the deck, and its clock
               AudioEngine       — the only file importing just_audio
               VoiceCapture      — the only file importing record
    auth/      AuthScope, SSO seam
    data/      the entire catalogue, as const Dart. No network, no database.
    theme/     colours, type, spacing, radius — mirrors the web's tokens 1:1
    widgets/   anything used by more than one screen
  features/
    chat/      the cockpit, plus ChatSessionController which holds its thread
    <name>/<name>_screen.dart    one directory per screen, 22 screens
main.dart      routes, as a switch on settings.name
```

**There is no state-management package.** Screens hold their own `State`. Three
things outlive a screen and are `InheritedNotifier`s stacked above
`MaterialApp` in `main.dart`:

| Scope | Holds | Why it cannot live on a screen |
| --- | --- | --- |
| `AuthScope` | signed in or not | every guarded route asks |
| `PlaybackScope` | the session on the deck, and its clock | starting a session is not a decision to stay on the player |
| `ChatSessionScope` | the cockpit thread, the applied set, the rebuild | going off to play what you just built must not throw it away |

The last two are the same bug in two directions and each would have torn down
the other. At this size that is not a shortcut to correct later — it is less
code than any library would add, and the seams are where you would put one when
there is a real backend.

**The timers for a rebuild live on `ChatSessionController`, not on the screen.**
A generation that stops because someone opened the player is the same bug
wearing a different hat.

### 4.1 Playback

- The clock comes from **`AudioEngine.positionStream`**, not a timer, so a
  stall or a seek cannot put the bar out of step with the sound.
- `playback.length` is the engine's measurement, not the `duration` constant —
  the bed is 10s today and a real session will not be. It never returns zero,
  because every bar above divides by it.
- **Each cut is its own recording.** The deck key is `slug#versionId`, and the
  deck refuses to reload the track already on it — without a distinct key,
  pressing play on v1.2 would carry on playing v1.3.
- `load()` pauses the engine as well as clearing the flag: `setAsset` on a
  playing `just_audio` player goes on playing, which left the previous session
  audible under a screen that said Play.
- `seek()` clamps in the controller so a ±15s button can hand it a value past
  either end, and sets the notifier as well as the engine — paused, nothing is
  reading the clock, so the bar would not move until the next play.
- **Mute is a volume, not a transport.** A muted session keeps running: the
  clock, the cues and the art. `AudioEngine.setMuted` is re-applied on every
  play, because the engine is reloaded whenever a session goes on the deck and
  a fresh source comes back at full volume.

### 4.2 The cockpit

`ChatSessionController` holds the thread, the applied recommendation set, the
version list and the publish state.

- `openSession(session)` replaces the messages with that session's opening and
  lays the deck **open** rather than folded — an existing session's changes are
  what you came to look at. It **no-ops on the session already open**, so going
  off to play it and coming back returns the thread as you left it. Same
  bargain `load()` makes on the playback controller.
- That is also why **"New session" passes `fresh: true`** — the controller
  outlives the screen, so without it the drawer would reopen whichever session
  was last in the cockpit.
- `addVersion()` runs when a build **starts**, not when it finishes, so the
  history can show the one being made.
- `reset()` opens **empty** — the orb, the greeting, the openers. It used to
  open on the demo conversation, which was about a session the user had not
  made, so "New session" opened on somebody else's.

---

## 5 · The parity rule

**The web app is the reference implementation.** Where the two disagree, the
web is right and this changes — not because it matters more, but because a
single reference is the only way two codebases stay in step.

Four things follow:

1. **One type scale.** `AppTextStyles` mirrors the web's `--text-*` steps
   exactly — sixteen named styles matching the sixteen `Aurelia/*` Figma text
   styles, same size, same weight, same leading.
2. **One face: Mulish**, bundled under `assets/fonts/` because it is the
   `font-family/base` variable in Figma. Leaving the family unset *looked* like
   parity and was not: it rendered each platform's system UI face on both
   clients, so the two agreed with each other about the wrong thing.
3. **One page gutter: 20** (`AppPadding.page`).
4. **Shared assets, not re-made ones.** Brand and illustration vectors move
   across as the same SVG path strings, parsed at runtime by
   `core/widgets/svg_path.dart`. Raster assets are the same files.

### 5.1 How to check parity on a specific screen

When something "looks different from web", do not eyeball it. Read the web
source for that element and diff the values:

```bash
git show web_app:src/pages/HomePage.tsx | grep -n "Ongoing Live Sessions" -A 40
git show web_app:src/components/chat/RecommendationDeck.tsx
```

Two real examples this found in one pass:

- **Ongoing Live Sessions was an empty orange box.** The web draws
  `live-sessions-map.png` as the card background; of five assets in
  `src/assets/`, that was the one that never made it into the Flutter bundle.
  The file even said so in its own comment.
- **The Home composer drew a second box inside itself.** It set
  `border: InputBorder.none` — but `enabledBorder` and `focusedBorder` are
  *separate properties that do not fall back to `border`*, so the app's
  `inputDecorationTheme` (which paints a filled stadium for the auth fields)
  drew its pill inside the card.

Copying an asset across branches:

```bash
git show web_app:src/assets/live-sessions-map.png > assets/images/live-sessions-map.png
```

---

## 6 · Traps, with the symptom each produces

| Trap | Symptom |
| --- | --- |
| **`Container` with `alignment` and no `width`** takes every pixel its parent offers. | A pill renders as a full-width bar. Bitten three times. Use `Center(widthFactor: 1)`. |
| **A `Stack` sizes to its tallest non-positioned child**, not to its parent. | A `Positioned` lands measured from the wrong box. The Sessions row's play disc sat exactly 16.5px low — half the difference between a 35-tall content row and a 68-tall card — and read as a nudge, not a bug. `SizedBox.expand` fixes it; assert the two rects are equal rather than trusting the eye. |
| **Text is a hit-test target.** | A `Text` inside a `Stack` swallows a tap meant for a full-card overlay beneath it. Put the overlay *above* the copy. |
| **A ticking timer calling `setState` on a screen.** | Everything rebuilds for one small number. Three did this — session progress at 22/s, the recorder's meter at 9/s, a playing voice note at 16/s. Use a `ValueNotifier` read by a `ValueListenableBuilder` around the one widget that needs it. |
| **`AppRadius` is a closed scale** — 0/2/4/8/12/16/24/32/full. | A literal off the scale is almost always a mistake. The web had eleven elements silently rendering square because `rounded-6/10/20` are not real Tailwind classes. |
| **`find.byTooltip` also matches Semantics** from Flutter 3.47. | `tester.widget<Tooltip>(...)` throws a cast error. Use `find.byWidgetPredicate((w) => w is Tooltip && ...)` when you need to read the match back. |
| **The web has no filesystem.** | `getTemporaryDirectory()` throws; `record` returns a `blob:` URL from `stop()`. `AudioEngine.loadFile` checks the scheme so nothing above it has to know the platform. |
| **Browsers have no AAC encoder.** | Asking for `aacLc` fails the whole recording. The encoder is negotiated through `isEncoderSupported`; some Android builds lack one too. |
| **All flat gradients.** | **Not a bug — no network.** Cover art is hotlinked from Unsplash and the gradient is the floor. The single most common false report on this codebase. |

Both recording traps first showed as a recorder stuck on "Listening.." with a
dead clock, which reads as working. Every failure in `VoiceCapture.start` is a
typed `VoiceCaptureException` now, and the widget catches anything that
escapes, because a visible error beats a convincing freeze.

---

## 7 · Verifying a change

`analyze` and `test` are the whole loop. There is no golden-image suite and no
integration driver.

```bash
flutter analyze     # must be clean; dart fix --apply clears most of it
flutter test        # 62 behavioural tests
```

**Run them before reaching for a device.** The tests drive the real screens on
a 420×3200 surface, and a `RenderFlex` overflow *fails* a test — so most layout
bugs surface in fifteen seconds rather than after a two-minute install. That is
how the player's statistic tile was caught overflowing by a quarter of a pixel.

The tests are behavioural, not golden: the sign-in gate remembers where you
were going, a recommendation set can be dropped and applied, a session keeps
playing when you walk back to the cockpit, notifications group by age, the
scrubber can be dragged, mute reaches the engine.

**They cannot see everything.** Both bugs in §5.1 — a missing asset and a theme
border bleeding through — passed 62 green tests and a clean analyze. Running on
a device remains the only way to catch that class.

`const` is enforced, not hoped for: `analysis_options.yaml` turns on
`prefer_const_*`, `avoid_unnecessary_containers` and `sized_box_for_whitespace`.

---

## 8 · Known scaling points

None matter at demo size. All matter with a backend.

- `sessionsOnShelf` / `sessionsInCategory` scan the whole catalogue and
  allocate a new list on every call, **including inside `build`**. Fine at 26
  records; wants an index at 26,000.
- `Image.network` has an in-memory cache only — no disk cache.
- Page-level `ListView(children: [...])` builds every section eagerly.
- `/admin` has no authentication. It is on the web branches, but it is the same
  product and the same P0.

---

## 9 · Where to read further

| File | What it holds |
| --- | --- |
| `CLAUDE.md` | This branch's engineering notes — the short, authoritative version. |
| `docs/PRD.md` | Product requirements and the reasoning behind behaviour that looks arbitrary. Identical on all three branches by rule. |
| `docs/SSO.md` | The SSO seam, packages, entitlements, what verification needs. |
| `docs/FOR-BACKEND.md` | The API this client will consume. |
| `docs/FOR-AI-AGENT.md` | Orientation for an automated agent. |
| `lib/core/data/*.dart` | The whole dataset, heavily commented. |
