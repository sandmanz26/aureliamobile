import 'dart:async';
import 'package:flutter/material.dart';

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
/// **There is no sound yet, and that is a dependency decision, not an
/// oversight.** Every audio package for Flutter ships native code, and this
/// app's one-command build on a fresh machine is the thing that buys. The
/// seam is [_tick]: point it at a real engine and every screen above it is
/// already correct, because none of them reads anything but this controller.
class PlaybackController extends ChangeNotifier {
  /// The length of the bed the web app plays. Ten seconds, looping — long
  /// enough to read as running, short enough to watch the bar come round.
  static const duration = Duration(seconds: 10);

  static const _interval = Duration(milliseconds: 60);

  Track? _track;
  bool _playing = false;
  Timer? _timer;

  /// The clock, kept off [notifyListeners] on purpose: it moves 16 times a
  /// second and only the progress bar and the two timestamps care. Read it
  /// with a `ValueListenableBuilder` around that one widget — a screen that
  /// rebuilds wholesale on this is the bug this project has already fixed
  /// three times.
  final elapsed = ValueNotifier<Duration>(Duration.zero);

  Track? get track => _track;
  bool get playing => _playing;

  /// Put a session on the deck without starting it.
  ///
  /// Re-loading the session already there would restart it, and returning to
  /// the player mid-session is exactly when that must not happen.
  void load(Track next) {
    if (_track?.slug == next.slug) return;
    _track = next;
    elapsed.value = Duration.zero;
    notifyListeners();
  }

  void toggle() {
    if (_track == null) return;
    _playing ? _pause() : _play();
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _playing = false;
    _track = null;
    elapsed.value = Duration.zero;
    notifyListeners();
  }

  void _play() {
    _playing = true;
    _timer?.cancel();
    _timer = Timer.periodic(_interval, (_) => _tick());
    notifyListeners();
  }

  void _pause() {
    _timer?.cancel();
    _timer = null;
    _playing = false;
    notifyListeners();
  }

  /// One step of the clock. The bed loops, so the end is a wrap rather than a
  /// stop — the session runs until someone pauses it.
  void _tick() {
    final next = elapsed.value + _interval;
    elapsed.value = next >= duration ? next - duration : next;
  }

  @override
  void dispose() {
    _timer?.cancel();
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
