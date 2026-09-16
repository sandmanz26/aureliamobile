/// The one place this app talks to a microphone.
///
/// Same bargain as `audio_engine.dart`: the recorder widget owns *when* to
/// capture and what to show while it does; a [VoiceCapture] owns the device.
/// The tests install [SilentVoiceCapture] and never touch a platform channel.
library;

import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

/// Why a recording could not start. The recorder screen shows a different
/// sentence for each, because "something went wrong" is not actionable and
/// the two have different remedies.
enum VoiceCaptureError {
  /// The person said no, or the OS never asked because they said no before.
  permissionDenied,

  /// Permission was fine; the device or the encoder failed.
  unavailable,
}

class VoiceCaptureException implements Exception {
  const VoiceCaptureException(this.reason);

  final VoiceCaptureError reason;

  @override
  String toString() => 'VoiceCaptureException($reason)';
}

/// A finished recording.
class VoiceClip {
  const VoiceClip({required this.path, required this.duration});

  /// Where the audio landed on disk. A real build uploads this and keeps a
  /// URL; nothing here deletes it, because the thread still plays it back.
  final String path;
  final Duration duration;
}

abstract class VoiceCapture {
  /// Opens the mic and starts writing. Throws [VoiceCaptureException] rather
  /// than returning false, so a caller cannot forget to check.
  Future<void> start();

  /// Closes the file and hands it back. Null when nothing was captured.
  Future<VoiceClip?> stop();

  /// Throws the recording away — what the bin does.
  Future<void> cancel();

  /// Input level, 0..1, roughly once every 110ms while the mic is open. The
  /// meter is drawn straight from this, so a silent room draws a flat line
  /// rather than the animation a fake would give it.
  Stream<double> get levels;

  Future<void> dispose();
}

/// The real one, on `record`.
class DeviceVoiceCapture implements VoiceCapture {
  DeviceVoiceCapture() : _recorder = AudioRecorder();

  final AudioRecorder _recorder;
  final _levels = StreamController<double>.broadcast();

  StreamSubscription<Amplitude>? _amplitudes;
  DateTime? _startedAt;
  String? _path;

  /// The floor of the meter in dBFS. Anything quieter than this reads as
  /// silence; −45 is about a quiet room, which is where the bars should sit
  /// when nobody is talking.
  static const _floorDb = -45.0;

  /// Preferred first, and each one is a real fallback rather than a guess.
  ///
  /// AAC is what iOS and most Android devices want, and it is what a backend
  /// would rather receive. **Browsers do not have it**: MediaRecorder encodes
  /// Opus in a WebM container, so asking for AAC on the web fails the whole
  /// recording — which is precisely how this shipped broken the first time.
  /// Some Android builds are missing one of these too, so the list is asked
  /// rather than assumed.
  static const _encoders = [
    AudioEncoder.aacLc,
    AudioEncoder.opus,
    AudioEncoder.wav,
  ];

  Future<AudioEncoder> _encoder() async {
    for (final encoder in _encoders) {
      try {
        if (await _recorder.isEncoderSupported(encoder)) return encoder;
      } catch (_) {
        // A platform that cannot answer the question is not a reason to stop
        // asking about the next one.
      }
    }
    // Nothing answered yes. Try the preferred one anyway and let start() fail
    // with a message, rather than failing here with none.
    return AudioEncoder.aacLc;
  }

  @override
  Future<void> start() async {
    // Everything from here down is wrapped, and the catch-all at the bottom is
    // the point of it: an error that escapes this method leaves the recorder
    // sitting on "Listening.." with a dead clock, which looks like it is
    // working. That is exactly what happened on web, where the line below
    // throws.
    try {
      if (!await _recorder.hasPermission()) {
        throw const VoiceCaptureException(VoiceCaptureError.permissionDenied);
      }

      // **No filesystem on the web.** `getTemporaryDirectory` throws there, so
      // the browser gets no path at all: record_web keeps the audio itself and
      // hands back a blob URL from stop(). Everything above this file treats
      // that URL exactly like a path, because it only ever passes it back to
      // the audio engine.
      final path = kIsWeb
          ? ''
          : '${(await getTemporaryDirectory()).path}'
              '/aurelia-voice-${DateTime.now().millisecondsSinceEpoch}.m4a';

      await _recorder.start(
        RecordConfig(encoder: await _encoder(), bitRate: 96000),
        path: path,
      );

      _path = path;
      _startedAt = DateTime.now();
    } on VoiceCaptureException {
      rethrow;
    } catch (_) {
      throw const VoiceCaptureException(VoiceCaptureError.unavailable);
    }

    // Outside the try: a platform that cannot report levels is not a failed
    // recording, it is a flat meter. record_web is one — the clip is still
    // captured.
    _amplitudes = _recorder
        .onAmplitudeChanged(const Duration(milliseconds: 110))
        .listen((amplitude) {
      // dBFS is negative and logarithmic; the meter wants 0..1. Anything at
      // or below the floor is silence, 0 dB is as loud as it gets.
      final db = amplitude.current.isFinite ? amplitude.current : _floorDb;
      final level = ((db - _floorDb) / -_floorDb).clamp(0.0, 1.0);
      if (!_levels.isClosed) _levels.add(level);
    }, onError: (_) {});
  }

  @override
  Future<VoiceClip?> stop() async {
    await _amplitudes?.cancel();
    _amplitudes = null;

    // stop() returns a blob URL on web and the path we gave it elsewhere.
    String? path;
    try {
      path = await _recorder.stop() ?? _path;
    } catch (_) {
      path = null;
    }
    final started = _startedAt;
    _startedAt = null;
    _path = null;
    if (path == null || path.isEmpty || started == null) return null;

    return VoiceClip(path: path, duration: DateTime.now().difference(started));
  }

  @override
  Future<void> cancel() async {
    await _amplitudes?.cancel();
    _amplitudes = null;
    _startedAt = null;
    _path = null;
    await _recorder.cancel();
  }

  @override
  Stream<double> get levels => _levels.stream;

  @override
  Future<void> dispose() async {
    await _amplitudes?.cancel();
    await _levels.close();
    await _recorder.dispose();
  }
}

/// A recorder that opens no device.
///
/// It still runs a clock and still emits levels, so the meter animates and the
/// duration is real — everything the widget above it reads. What it cannot do
/// is produce audio, so [VoiceClip.path] is empty and playback of it is a
/// no-op. Tests use this; so does any platform where `record` is unavailable.
class SilentVoiceCapture implements VoiceCapture {
  SilentVoiceCapture({this.failWith});

  /// Set it and [start] throws — how the tests reach the denied-permission
  /// branch without a device that can deny anything.
  final VoiceCaptureError? failWith;

  final _levels = StreamController<double>.broadcast();
  final _random = Random(7);

  Timer? _ticker;
  DateTime? _startedAt;

  @override
  Future<void> start() async {
    final failure = failWith;
    if (failure != null) throw VoiceCaptureException(failure);

    _startedAt = DateTime.now();
    _ticker = Timer.periodic(const Duration(milliseconds: 110), (_) {
      if (!_levels.isClosed) _levels.add(0.25 + _random.nextDouble() * 0.75);
    });
  }

  @override
  Future<VoiceClip?> stop() async {
    _ticker?.cancel();
    _ticker = null;
    final started = _startedAt;
    _startedAt = null;
    if (started == null) return null;
    return VoiceClip(path: '', duration: DateTime.now().difference(started));
  }

  @override
  Future<void> cancel() async {
    _ticker?.cancel();
    _ticker = null;
    _startedAt = null;
  }

  @override
  Stream<double> get levels => _levels.stream;

  @override
  Future<void> dispose() async {
    _ticker?.cancel();
    await _levels.close();
  }
}
