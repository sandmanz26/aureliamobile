/// The one place this app talks to an audio plugin.
///
/// [PlaybackController] owns *when* a session plays; an [AudioEngine] owns
/// *how*. Keeping them apart is what let the app ship for months with no sound
/// at all, and it is what makes a widget test possible now that there is
/// sound: the tests install [SilentAudioEngine] and never load a plugin.
///
/// If this app ever swaps just_audio for something else, this file is the
/// whole of the change.
library;

import 'dart:async';

import 'package:just_audio/just_audio.dart';

/// What a player has to be able to do for the screens above it.
abstract class AudioEngine {
  /// Point the engine at a bundled asset. Returns the clip's real length,
  /// which the caller uses instead of assuming one.
  Future<Duration?> load(String assetPath);

  /// The same, for a file on disk — a voice note the user just recorded.
  Future<Duration?> loadFile(String path);

  Future<void> play();
  Future<void> pause();

  /// Back to the start and stopped — what "take it off the deck" means.
  Future<void> stop();

  Future<void> seek(Duration position);

  /// Silence without stopping. A muted session is still running — the clock,
  /// the cues and the art carry on — so this is a volume, not a transport.
  Future<void> setMuted(bool muted);

  /// Where the clip actually is, as the engine reports it. The screens read
  /// this rather than counting their own ticks, so a stall or a seek cannot
  /// put the bar and the sound out of step.
  Stream<Duration> get positionStream;

  /// Fires when the clip reaches its end. The bed loops, so nothing in this
  /// app listens yet — it is here so a session with a real ending can.
  Stream<void> get completions;

  Future<void> dispose();
}

/// The real one, on just_audio.
class JustAudioEngine implements AudioEngine {
  JustAudioEngine() : _player = AudioPlayer();

  final AudioPlayer _player;

  @override
  Future<Duration?> load(String assetPath) async {
    // The bed is ten seconds and the session is meant to keep running, so the
    // engine loops it rather than the controller restarting it by hand — a
    // hand-rolled loop is audible as a gap at the seam.
    await _player.setLoopMode(LoopMode.one);
    return _player.setAsset(assetPath);
  }

  @override
  Future<Duration?> loadFile(String path) async {
    // A voice note plays once and stops. Only the session bed loops.
    await _player.setLoopMode(LoopMode.off);
    // On the web a "recording" is a blob: URL rather than a file on disk, and
    // setFilePath cannot open one. Both come through this method because
    // nothing above it should have to know which platform it is on.
    return path.startsWith('blob:') || path.startsWith('http')
        ? _player.setUrl(path)
        : _player.setFilePath(path);
  }

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> stop() async {
    await _player.stop();
    await _player.seek(Duration.zero);
  }

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  @override
  Future<void> setMuted(bool muted) => _player.setVolume(muted ? 0 : _volume);

  /// Loud enough to sit under a room, quiet enough not to announce itself —
  /// the web player's own 0.7.
  static const _volume = 0.7;

  @override
  Stream<Duration> get positionStream => _player.positionStream;

  @override
  Stream<void> get completions => _player.processingStateStream
      .where((state) => state == ProcessingState.completed);

  @override
  Future<void> dispose() => _player.dispose();
}

/// An engine that does everything except make a noise.
///
/// This is what the widget tests run on, and it is not a stub: it keeps a
/// clock, so a test can assert that the bar moves, that pausing stops it and
/// that loading a new track resets it — all the behaviour the screens
/// actually depend on — without a plugin, a platform channel or a device.
class SilentAudioEngine implements AudioEngine {
  SilentAudioEngine({this.clipLength = const Duration(seconds: 10)});

  /// What [load] reports back. A test that wants a different length sets it.
  final Duration clipLength;

  final _positions = StreamController<Duration>.broadcast();
  final _completions = StreamController<void>.broadcast();

  Duration _position = Duration.zero;
  Timer? _timer;
  bool _disposed = false;

  static const _interval = Duration(milliseconds: 60);

  @override
  Future<Duration?> load(String assetPath) async {
    _timer?.cancel();
    _timer = null;
    _position = Duration.zero;
    _emit();
    return clipLength;
  }

  @override
  Future<Duration?> loadFile(String path) => load(path);

  @override
  Future<void> play() async {
    _timer?.cancel();
    _timer = Timer.periodic(_interval, (_) {
      final next = _position + _interval;
      // Wrapping, not stopping: the bed loops, and the real engine is in
      // LoopMode.one for the same reason.
      _position = next >= clipLength ? next - clipLength : next;
      _emit();
    });
  }

  @override
  Future<void> pause() async {
    _timer?.cancel();
    _timer = null;
  }

  @override
  Future<void> stop() async {
    await pause();
    _position = Duration.zero;
    _emit();
  }

  @override
  Future<void> seek(Duration position) async {
    _position = position;
    _emit();
  }

  /// Recorded rather than ignored: a test asserts the switch reaches the
  /// engine, which is the half of muting that a screen cannot show.
  @override
  Future<void> setMuted(bool muted) async => this.muted = muted;

  bool muted = false;

  @override
  Stream<Duration> get positionStream => _positions.stream;

  @override
  Stream<void> get completions => _completions.stream;

  void _emit() {
    if (!_disposed) _positions.add(_position);
  }

  @override
  Future<void> dispose() async {
    _disposed = true;
    _timer?.cancel();
    await _positions.close();
    await _completions.close();
  }
}
