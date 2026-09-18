# Aurelia — Flutter client

Context for anyone (human or AI) reading this code for the first time. It
covers what is here, the decisions that are not obvious from the source, and
the things that will mislead you if nobody tells you.

**This branch is the Flutter app and nothing else.** The repository keeps one
app per branch:

| Branch | What is on it |
| --- | --- |
| `mobile_app` | This Flutter app |
| `web_app` | The React + Vite consumer web app |
| `admin_cms` | Deliberately identical to `web_app`; kept in step with `--ff-only` |

Cloning the default branch and looking for `pubspec.yaml` is the first thing
that goes wrong. `git checkout mobile_app`.

---

## Running it

```bash
flutter pub get     # after any pubspec change — the fonts live there now
flutter analyze     # must come back "No issues found!"
flutter test        # 52 tests, ~25s
flutter run         # onto whatever single device is attached
```

Flutter **3.27.1 / Dart 3.6.0**. Newer stable channels move the goalposts under
this app — `--web-renderer` is already gone in this one — so match the version
before concluding something is broken.

**There are three native plugins, and the no-plugins rule is over.** It held
for months and it bought a real thing — `flutter run` on a fresh machine with
no CocoaPods step and no Gradle plugin resolution. It did not survive the
first product requirement that needed a device: a wellness app whose player is
silent and whose microphone does nothing is not demoable.

| Plugin | For | Pinned because |
| --- | --- | --- |
| `just_audio` ^0.10.0 | the session bed and voice-note playback | 0.11+ needs a newer SDK than 3.6 |
| `record` ^6.0.0 | the cockpit's voice memo | 7.x needs Dart 3.12 |
| `path_provider` ^2.1.5 | where a recording is written | 2.1.6+ needs Dart 3.10 |

A blind `flutter pub upgrade --major-versions` breaks the build on all three.
Nothing else may join them without the same argument being made again.

**Both plugins sit behind a seam, and that is not decoration.** `AudioEngine`
and `VoiceCapture` (in `core/audio/`) are the only files that import them.
Every widget test installs `SilentAudioEngine` and `SilentVoiceCapture`, which
keep real clocks and real streams — so the tests still assert that the bar
moves, that pause holds it and that a refused mic shows its own screen, without
a platform channel anywhere near them. `AureliaApp` takes both as constructor
arguments for exactly that.

### Verifying a change

`analyze` and `test` are the whole loop — there is no golden-image suite and no
integration driver. Run both before you commit; `dart fix --apply` clears most
of what `analyze` finds on its own.

Run them **before** reaching for a device. The tests drive the real screens on
a 420px surface, and a `RenderFlex` overflow fails them, so most layout bugs
surface in fifteen seconds rather than after a two-minute install. That is how
the player's statistic tile was caught overflowing by a quarter of a pixel.

### Picking a device

```bash
flutter devices                 # what is actually attached
flutter emulators               # what could be started
flutter emulators --launch <id>
flutter run -d <device-id>      # needed the moment more than one is attached
```

`flutter run` with nothing attached but a desktop target will happily build the
desktop app, which is not what this is. Check `flutter devices` first if the
window that opens looks wrong.

Device setup, emulators and signing are in the [device runbook](https://claude.ai/code/artifact/16e2c84d-6b64-4fdc-aace-a8e85e9d1cc3).

### In a browser

A CI box or a container usually has no emulator, and the web target is the
quickest way to *look* at a screen there:

```bash
flutter run -d chrome           # needs CHROME_EXECUTABLE set if chrome is not on PATH

# or build it once and serve the folder
flutter build web
(cd build/web && python3 -m http.server 8099)
```

Treat it as a preview, not a platform: this app ships to phones, and the web
build exists to see pixels, not to be correct.

**If the page renders blank, that is the trap and not your change.** Flutter
fetches the CanvasKit engine from `gstatic.com` at run time, even though the
build has already written a copy into `build/web/canvaskit/`, and when that
request fails the page stays white with nothing in the UI to say so — the only
sign is a failed request in the browser console. `web/flutter_bootstrap.js`
exists to point the loader at the copy we ship, which makes the web build
self-contained. If you ever see a blank page again, check that file survived.

Two things that legitimately fail offline and are *not* this: Unsplash cover
art, which falls back to its gradient by design, and a Roboto fetch Flutter
makes for its own fallback face, which nothing in this app uses.

### If `flutter` is not found

In a fresh container the SDK is usually installed but not on `PATH`:

```bash
export PATH="/opt/flutter/bin:$PATH"     # or wherever `find / -name flutter -type d` lands
```

---

## Layout

```
lib/
  core/
    audio/     PlaybackController — what is on the deck, and its clock
    auth/      AuthScope — an InheritedWidget holding one bool
    data/      The entire catalogue, as const Dart. No network, no database.
    theme/     Colours, type, spacing, radius. Mirrors the web's tokens 1:1.
    widgets/   Anything used by more than one screen
  features/
    chat/      The cockpit, plus the thread it draws (chat_session_controller)
    <name>/<name>_screen.dart      one directory per screen, 19 in total
main.dart    routes, as a switch on settings.name
```

There is no state-management package. Screens hold their own `State`, and the
three pieces that outlive a screen are `InheritedNotifier`s stacked above
`MaterialApp` in `main.dart`:

| Scope | Holds | Why it cannot live on a screen |
| --- | --- | --- |
| `AuthScope` | signed in or not | Every guarded route asks |
| `PlaybackScope` | the session on the deck, and its clock | Starting a session is not a decision to stay on the player |
| `ChatSessionScope` | the cockpit thread, the applied set, the rebuild | Going off to play what you just built must not throw it away |

The last two are the same bug in two directions, and each would have torn down
the other. At this size that is not a shortcut to be corrected later — it is
less code than any library would add, and the seams are where you would put one
when there is a real backend.

**The timers for a rebuild live on `ChatSessionController`, not on the screen.**
A generation that stops because someone opened the player is the same bug
wearing a different hat.

---

## The things that will mislead you

**Everything is mock data and it is meant to look real.** `lib/core/data/` holds
21 sessions, a challenge, a notification feed and six signal sources, all as
compile-time `const`. The figures in them (play counts, "−43% stress") are
invented. They are deliberately specific because a demo full of "Lorem" cannot
be reasoned about — but nothing here came from a measurement.

**Cover art is hotlinked from Unsplash at runtime.** Every card layers a photo
over a design-token gradient, and the gradient is the floor, not a fallback: if
the network is gone the card still reads as designed. So **an app that is all
flat gradients is not broken — it has no network.** This is the single most
common false bug report on this codebase.

**Sign-in does not persist, on purpose.** `AuthScope` holds a bool in memory.
Every launch starts signed out so the app opens on the case for itself rather
than on someone's leftover session. That is right while the data is mock and
wrong the moment an account holds real history — treat it as a setting with an
expiry date, not the session model.

**The web app is the reference implementation.** Where the two disagree, the web
is right and this changes. Not because it matters more, but because a single
reference is the only way two codebases stay in step. Four things follow: the
type scale mirrors the web's `--text-*` steps exactly; the face is **Mulish**,
bundled under `assets/fonts/` because it is the `font-family/base` variable in
Figma (leaving the family unset looked like parity and was not — it rendered
each platform's system UI face on both clients); the page gutter is 20
(`AppPadding.page`), which is what every consumer screen on the web carries at
phone width; and brand/illustration vectors move across as the same SVG path
strings, parsed at runtime by `core/widgets/svg_path.dart`, rather than being
re-traced by hand.

**Every face is Mulish, the player's cue included.** That cue was the one style
in the system still set in a serif, which the design used to separate a line
the session speaks from the interface around it. The separation is now carried
by Light at 21/28.5, matching the web, and the serif is gone from `pubspec.yaml`
and from `assets/fonts/`.

**The clock comes from the engine, not from a timer.** `PlaybackController`
used to count its own ticks; it now subscribes to `AudioEngine.positionStream`,
so a stall or a seek cannot put the bar out of step with the sound. It also
reads the clip's real length off the engine — `playback.length`, not the
`duration` constant — because the bed is ten seconds today and a session with
its own file will not be. `length` never returns zero, because every progress
bar above divides by it.

**The session bed is `assets/audio/session-bed.wav`**, byte for byte the same
file the web app serves at `/audio/session-bed.wav`, so the two clients sound
alike rather than merely looking alike.

**The microphone is real; the transcription is not.** `VoiceCapture` opens the
device, the level meter is drawn from actual amplitude, and the clip is written
to disk and played back in the thread. The words under it are still a fixed
sample string — there is no speech service behind them, and wiring one in
replaces `_transcribe` in `voice_recorder.dart` and nothing else.

**Two things about recording that cost a build each, so they are written down:**

- **The web has no filesystem.** `getTemporaryDirectory()` throws there, so the
  browser gets no path and `record` hands back a `blob:` URL from `stop()`
  instead. `AudioEngine.loadFile` checks the scheme, because nothing above it
  should have to know which platform it is on.
- **Browsers have no AAC encoder.** MediaRecorder writes Opus in WebM, so
  asking for `aacLc` fails the whole recording. The encoder is negotiated
  through `isEncoderSupported` rather than assumed — some Android builds are
  missing one too.

Both of those first showed up as a recorder stuck on "Listening.." with a dead
clock, which reads as working. Every failure in `VoiceCapture.start` is a typed
`VoiceCaptureException` now, and the widget catches anything that escapes
anyway, because a visible error beats a convincing freeze.

**Sign-in with Google or Apple is a seam with a dummy behind it.** The two
buttons used to call one handler and sign you straight in. They are two
providers now, with a spinner on the pressed one, both disabled while either
runs, and three distinct failures — a cancel says nothing, because the user
dismissed the sheet themselves. `AuthController.account` records which door
you came through. Nothing talks to Google or Apple yet: `docs/SSO.md` has the
client IDs, entitlements and backend verification that turning it on needs.

**Explore and Sessions are two screens.** `explore_screen.dart` is the browse
surface with the shelves; `session_list_screen.dart` is the Sessions frame, a
list of 68px rows. They shared one screen for a while, which is how Explore's
shelves ended up under the Sessions title. And there is no Chat entry anywhere
in the design — the cockpit is reached by "New session" in the drawer, and by a
session row, which is where the frame's own prototype points.

**A session row has two tap targets and two markers, and only the sizes come
from the frame.** The play disc opens the player; the rest of the row opens
that session's conversation. The recreated glyph and the Published label were
asked for on top of the design — see `docs/PRD.md` for why each shows when it
does. `isRecreated` is not a stored flag: every session opens on an Aurelia
starter template, so a two-step lineage is an original and a third step means a
person stood between, which is what recreating is.

**A session row opens that session's thread, already made.** The cockpit is
one controller above the navigator, so the thread it holds has to be told which
session it is about: `openSession()` replaces the messages with that session's
opening and lays the deck open rather than folding it, because an existing
session's changes are what you came to look at. It no-ops on the session
already open — going off to play it and coming back returns the thread as you
left it, the same bargain `load()` makes on the playback controller.

That is also why **"New session" passes `fresh: true`**. The controller
outlives the screen by design, so without it the drawer would reopen whichever
session was last in the cockpit.

**The catalogue has drafts, and they are reachable in exactly one place.**
`kPublishedSessions` is what every public surface reads — shelves, categories,
the creator index. `kSessions` is the whole thing, and the only surface that
reads it is Sessions under "Created by you". A draft has no plays, no earnings
and no community, so Progress shows zeroes and says why rather than borrowing
figures, and a draft must never swell anyone's published-session count.

**Progress is three tabs over one shell** (`features/progress/`), reached by
Insights in the cockpit's ⋯. Every size on it is read off the Figma frames'
*leaf* nodes, not their depth-4 summaries: the summaries stop before the text
nodes, so type is the one thing a shallow read cannot give you, and it is what
reads wrong first. Two places where the frame and this app differ on purpose:

- A lineage row's caret points down in Figma because the row is a disclosure
  in the prototype with nothing behind it. Here the row opens that session, so
  the caret points the way it goes.
- The objective card's hairline is a gradient ring. Figma draws strokes INSIDE,
  overlaying the padding box; a Flutter ring is real layout on every edge, so a
  pixel comes off the vertical padding to keep the card at the frame's 68.

**A version card's play glyph plays that cut**, at
`PlayRequest(slug:, versionId:)`. The deck key becomes `slug#version`, and that
matters: the deck refuses to reload the track already on it, so without a
distinct key pressing play on v1.2 would carry on playing v1.3.

**`AppRadius` is a closed scale** — 0/2/4/8/12/16/24/32/full. A literal that is
not on it is almost always a mistake. The web had eleven elements silently
rendering square because `rounded-6/10/20` are not real Tailwind classes;
the same class of bug is what the scale exists to prevent.

---

## Conventions worth keeping

**`Container` with an `alignment` and no `width` takes every pixel its parent
offers.** This has bitten three times — the Explore "Create" pill, the profile
card's "Recreate" pill, and Recreate's voice options, each rendering as a
full-width bar instead of hugging its label. Inside a `Row` it is harmless
(the constraint is unbounded); inside a `Column`, `Wrap` or a sized box it is
not. Use `Center(widthFactor: 1)` when a box must hug its child.

**A ticking timer must not call `setState` on a screen.** Three did: the session
progress (22/s), the recorder's meter and clock (9/s), a playing voice note
(16/s) — each rebuilding everything around it for one small number. They are
`ValueNotifier`s read by a `ValueListenableBuilder` around the one widget that
needs them. Any new animation should follow that shape.

**`const` is enforced, not hoped for.** `analysis_options.yaml` turns on
`prefer_const_*`, `avoid_unnecessary_containers` and `sized_box_for_whitespace`.
`flutter analyze` must be clean before a commit; `dart fix --apply` handles most
of what it finds.

**Text is a hit-test target.** A `Text` inside a `Stack` will swallow a tap
meant for a full-card overlay beneath it. Put the overlay above the copy. The
Sessions row is the worked example: the card-wide tap that opens the
conversation sits *over* the title and byline, and the play disc sits over that
again, so the smaller target wins inside the larger one.

**A `Stack` sizes to its tallest non-positioned child, not to its parent.** So
a `Positioned` inside it is measured from that child's box, which is rarely the
box you drew on paper. The Sessions row's content is 35 tall inside a 68 card,
and the play disc landed exactly 16.5px — half the difference — below its own
artwork, looking like a nudge rather than a layout bug. `SizedBox.expand`
around the content fixes it. Assert the two rects are equal rather than
trusting the eye; at that size the error reads as a design choice.

**The tests are behavioural, not golden.** 49 of them, driving real screens
through real taps: the sign-in gate remembers where you were going, the
recommendation set can be dropped and applied, a session keeps playing when you
walk back to the cockpit, notifications group by age. They also catch overflow,
because a `RenderFlex` overflow fails the test — which is how the 420px surface
found five layout bugs the eye did not.

---

## Known scaling points

None of these matter at demo size. All of them will matter with a backend.

- `sessionsOnShelf` / `sessionsInCategory` scan the whole catalogue and allocate
  a new list on every call, including inside `build`. Fine at 21 records; wants
  an index at 21,000.
- `Image.network` has an in-memory cache only — no disk cache, so scrolling away
  and back re-downloads. The usual fix (`cached_network_image`) pulls in native
  plugins, which costs the one-command build above. Worth it when the artwork is
  ours rather than hotlinked; not before.
- Page-level `ListView(children: [...])` builds every section eagerly. Distinct
  sections make `.builder` awkward, but the first frame pays for the whole page.
- `/admin` has no authentication at all. It is on the web branches, not this
  one, but it is the same product and the same P0.
- `Timer.periodic` at 16Hz drives the playback clock whenever a session is
  playing, and it keeps running with the app in the background. A real engine
  would report its own position and this goes away; until then it is a battery
  cost nobody has measured.

---

## Where the product decisions live

Behaviour that looks arbitrary in the source usually is not — the reasoning is
in `docs/PRD.md` on this branch. Two examples: recommendations arrive already
applied (the user's job is to remove, not opt in), and the leaderboard is public
by default, which is a decision about a mental-health product and not a detail.
If you are about to change one of those, read the entry first.
