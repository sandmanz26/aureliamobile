import 'dart:async';
import 'package:flutter/material.dart';
import 'audio_engine.dart';

/// What is on the deck: enough of a session to draw the player and the mini
/// player without either of them going back to the catalogue.
@immutable
class Track {
  const Track({
    required this.slug,
    required this.title,
    required this.author,
    required this.photo,
    required this.gradient,
  });

  final String slug;
  final String title;
  final String author;

  /// A key into `coverPhotos`, the same one the session record carries.
  final String photo;
  final List<Color> gradient;
}

/// Playback, held above the navigator — the mobile mirror of the web app's
/// `AudioPlayerContext`.
///
/// Owned by a screen it would be torn down the moment someone walked back to
/// the cockpit, which is the opposite of what a player is for: you start a
/// session in order to carry on doing something else while it runs. So the
/// clock lives here, one level above every route, and the player screen is a
/// view onto it rather than its owner.
///
/// In memory rather than storage, like the rest of a visit — a relaunch is a
/// new silence.
///
/// **This used to make no sound.** The clock was a `Timer` counting on its
/// own, because every audio package for Flutter ships native code and the
/// one-command build on a fresh machine was worth more than the noise. It is
/// not worth more than a demoable product, so there is a real engine now —
/// but it arrives through [AudioEngine], and this class still knows nothing
/// about which one. That is what keeps the widget tests plugin-free.
class PlaybackController extends ChangeNotifier {
  PlaybackController({AudioEngine? engine, this.asset = defaultAsset})
      : _engine = engine ?? JustAudioEngine() {
    _positions = _engine.positionStream.listen((position) {
      // The engine is the clock. Reading it rather than counting our own ticks
      // is what stops the bar drifting from the sound when a load stalls or
      // someone scrubs.
      elapsed.value = position;
    });
  }

  /// The bed every session plays over, and the same bytes the web app serves
  /// at `/audio/session-bed.wav`. Mock, like the catalogue it plays under.
  static const defaultAsset = 'assets/audio/session-bed.wav';

  /// The bed's length, and the fallback when the engine cannot report one —
  /// a zero here would divide by zero in every progress bar above.
  static const duration = Duration(seconds: 10);

  final AudioEngine _engine;
  final String asset;

  late final StreamSubscription<Duration> _positions;

  Track? _track;
  bool _playing = false;
  Duration _length = duration;

  /// How long the clip on the deck actually runs, as the engine measured it.
  /// The screens divide by this, so it must never be zero.
  Duration get length => _length.inMilliseconds == 0 ? duration : _length;

  /// The clock, kept off [notifyListeners] on purpose: it moves 16 times a
  /// second and only the progress bar and the two timestamps care. Read it
  /// with a `ValueListenableBuilder` around that one widget — a screen that
  /// rebuilds wholesale on this is the bug this project has already fixed
  /// three times.
  final elapsed = ValueNotifier<Duration>(Duration.zero);

  Track? get track => _track;
  bool get playing => _playing;

  /// Whether the bed is silenced. A preference, not a property of the track —
  /// which is why it survives [load] and [stop] and is applied to whatever is
  /// on the deck next.
  ///
  /// **It does not survive a relaunch, and the web's does.** There the switch
  /// is one localStorage line; here the only key-value store is a fourth
  /// native plugin, and the rule this app is built on (see CLAUDE.md) is that
  /// a plugin has to earn its place. Remembering a mute does not, yet.
  bool get muted => _muted;
  bool _muted = false;

  /// Put a session on the deck without starting it.
  ///
  /// Re-loading the session already there would restart it, and returning to
  /// the player mid-session is exactly when that must not happen.
  void load(Track next) {
    if (_track?.slug == next.slug) return;
    _track = next;
    // Paused on the engine, not only in the field: `setAsset` on a playing
    // player goes on playing, so a screen that said Play while the previous
    // session was still audible is exactly what this stops.
    if (_playing) unawaited(_engine.pause());
    _playing = false;
    elapsed.value = Duration.zero;
    notifyListeners();

    // Every session plays the same bed today, so the engine is only reloaded
    // to rewind it. When a session carries its own file this takes `next`.
    unawaited(_engine.load(asset).then((measured) {
      if (measured != null && measured > Duration.zero) {
        _length = measured;
        notifyListeners();
      }
    }).catchError((_) {
      // A bed that will not load is not worth a broken screen: the bar stays
      // at zero and the button still works. Nothing above reads an error.
    }));
  }

  void toggle() {
    if (_track == null) return;
    _playing ? _pause() : _play();
  }

  /// Move the playhead.
  ///
  /// Clamped here rather than at every call site, so a skip button can hand it
  /// `elapsed + 15s` past the end without checking. The notifier is set as
  /// well as the engine: paused, nothing is reading the clock, so the bar
  /// would not move until the next play.
  void seek(Duration to) {
    if (_track == null) return;
    final target = to < Duration.zero
        ? Duration.zero
        : (to > length ? length : to);
    elapsed.value = target;
    unawaited(_engine.seek(target));
  }

  /// Silence, without stopping the session.
  ///
  /// Muting is not pausing and the difference is the point: you open a session
  /// in a room where you cannot make noise and still want the clock, the cues
  /// and the art.
  void toggleMuted() {
    _muted = !_muted;
    notifyListeners();
    unawaited(_engine.setMuted(_muted));
  }

  void stop() {
    _playing = false;
    _track = null;
    elapsed.value = Duration.zero;
    unawaited(_engine.stop());
    notifyListeners();
  }

  void _play() {
    _playing = true;
    notifyListeners();
    // Re-applied on every play: the engine is reloaded whenever a new session
    // goes on the deck, and a fresh source comes back at full volume.
    unawaited(_engine.setMuted(_muted));
    unawaited(_engine.play());
  }

  void _pause() {
    _playing = false;
    notifyListeners();
    unawaited(_engine.pause());
  }

  @override
  void dispose() {
    unawaited(_positions.cancel());
    unawaited(_engine.dispose());
    elapsed.dispose();
    super.dispose();
  }
}

class PlaybackScope extends InheritedNotifier<PlaybackController> {
  const PlaybackScope({
    super.key,
    required PlaybackController super.notifier,
    required super.child,
  });

  static PlaybackController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<PlaybackScope>();
    assert(scope?.notifier != null, 'PlaybackScope is missing above this widget');
    return scope!.notifier!;
  }

  /// The controller without subscribing to it — for a tap handler, which wants
  /// to call [PlaybackController.toggle] and not to rebuild when it does.
  static PlaybackController read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<PlaybackScope>();
    assert(scope?.notifier != null, 'PlaybackScope is missing above this widget');
    return scope!.notifier!;
  }
}
