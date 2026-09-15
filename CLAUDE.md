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
flutter test        # 33 tests, ~15s
flutter run         # onto whatever single device is attached
```

Flutter **3.27.1 / Dart 3.6.0**. Newer stable channels move the goalposts under
this app — `--web-renderer` is already gone in this one — so match the version
before concluding something is broken.

One dependency, `cupertino_icons`, and **no native plugins** — so there is no
CocoaPods step for iOS and no Gradle plugin resolution to break on Android.
Keep it that way if you can; it is the reason a new machine can build this in
one command. That rule has one visible cost, worth knowing before you file a
bug: **the player makes no sound.** See `core/audio/playback_controller.dart`.

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
    <name>/<name>_screen.dart      one directory per screen, 18 in total
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

**The player is silent, and that is a decision.** `PlaybackController` holds a
track, a play/pause flag and a clock that ticks — everything the player screen
and the mini player read. What it does not hold is an audio element, because
there is no way to get one without a native plugin and the no-plugins rule
above is what keeps the build to one command. Point `_tick` at a real engine
and every screen over it is already correct. Until then: **an app whose player
shows a moving bar and plays nothing is not broken.**

**Explore and Sessions are two screens.** `explore_screen.dart` is the browse
surface with the shelves; `session_list_screen.dart` is the Sessions frame, a
list of 68px rows. They shared one screen for a while, which is how Explore's
shelves ended up under the Sessions title. And there is no Chat entry anywhere
in the design — the cockpit is reached by "New session" in the drawer.

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
meant for a full-card overlay beneath it. Put the overlay above the copy.

**The tests are behavioural, not golden.** 33 of them, driving real screens
through real taps: the sign-in gate remembers where you were going, the
recommendation set can be dropped and applied, a session keeps playing when you
walk back to the cockpit, notifications group by age. They also catch overflow,
because a `RenderFlex` overflow fails the test — which is how the 420px surface
found four layout bugs the eye did not.

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
