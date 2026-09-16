import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/audio/audio_engine.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

/// A sent voice note: scrub bar, duration, and the transcript underneath.
///
/// It plays the file the mic actually wrote. When there is no file — a device
/// that could not record, or the silent capture the tests run on — the bar
/// still runs against the recorded duration, so the bubble behaves the same
/// either way and only the sound is missing.
class VoiceMessage extends StatefulWidget {
  const VoiceMessage({
    super.key,
    required this.duration,
    required this.transcript,
    this.path,
    this.engine,
  });

  final Duration duration;
  final String transcript;

  /// Where this note's audio lives. Null or empty means there is none.
  final String? path;

  /// The player. Null is the real one; the tests hand in a silent engine
  /// because a test binding has no platform channels.
  final AudioEngine? engine;

  @override
  State<VoiceMessage> createState() => _VoiceMessageState();
}

class _VoiceMessageState extends State<VoiceMessage> {
  static const _barCount = 26;

  bool _playing = false;
  /// Read only by the bars. A notifier keeps the bubble, its avatar and its
  /// timestamp out of the sixteen rebuilds a second a clip would otherwise
  /// cost.
  final _progress = ValueNotifier<double>(0);
  Timer? _timer;

  AudioEngine? _engine;
  StreamSubscription<Duration>? _positions;
  StreamSubscription<void>? _completion;
  bool _loaded = false;

  /// True when there is a file to play. Everything below still works when
  /// there is not — the bar runs on a timer instead.
  bool get _hasAudio => (widget.path ?? '').isNotEmpty;
  late final List<double> _bars = _waveform();

  /// A stable pseudo-waveform per clip, derived from the duration, so the same
  /// message draws the same bars on every rebuild instead of dancing.
  List<double> _waveform() {
    var seed = (widget.duration.inMilliseconds ~/ 37).clamp(1, 1 << 30);
    return List.generate(_barCount, (_) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return 0.25 + (seed % 1000) / 1000 * 0.75;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    unawaited(_positions?.cancel());
    unawaited(_completion?.cancel());
    // Only ours to close; an engine handed in by a test belongs to the test.
    if (widget.engine == null) unawaited(_engine?.dispose());
    _progress.dispose();
    super.dispose();
  }

  /// Built on first play, not in initState: a thread can hold a dozen of these
  /// and none of them should hold a decoder until someone presses play.
  Future<AudioEngine> _ensureEngine() async {
    final engine = _engine ??= widget.engine ?? JustAudioEngine();
    if (!_loaded) {
      final length = await engine.loadFile(widget.path!);
      _loaded = true;
      _total = (length != null && length > Duration.zero) ? length : widget.duration;
      _positions = engine.positionStream.listen((position) {
        _progress.value =
            (position.inMilliseconds / _total.inMilliseconds.clamp(1, 1 << 30))
                .clamp(0.0, 1.0);
      });
      _completion = engine.completions.listen((_) async {
        await engine.stop();
        _progress.value = 0;
        if (mounted) setState(() => _playing = false);
      });
    }
    return engine;
  }

  late Duration _total = widget.duration;

  Future<void> _toggle() async {
    if (!_hasAudio) {
      _toggleWithoutAudio();
      return;
    }
    final engine = await _ensureEngine();
    if (!mounted) return;
    if (_playing) {
      await engine.pause();
      if (mounted) setState(() => _playing = false);
    } else {
      setState(() => _playing = true);
      await engine.play();
    }
  }

  /// No file behind this note, so the bar runs against the duration that was
  /// recorded. It is the old behaviour, kept for exactly that case rather than
  /// left as the only behaviour.
  void _toggleWithoutAudio() {
    if (_playing) {
      _timer?.cancel();
      setState(() => _playing = false);
      return;
    }
    final step = 60 / widget.duration.inMilliseconds.clamp(1, 1 << 30);
    setState(() => _playing = true);
    _timer = Timer.periodic(const Duration(milliseconds: 60), (timer) {
      final next = _progress.value + step;
      if (next >= 1) {
        _progress.value = 0;
        timer.cancel();
        // Reaching the end is the one tick the bubble itself cares about.
        setState(() => _playing = false);
      } else {
        _progress.value = next;
      }
    });
  }

  String get _durationLabel {
    final total = widget.duration.inSeconds.clamp(1, 1 << 30);
    return '${total ~/ 60}:${(total % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 283),
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.s3, vertical: AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.brandDefault,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: _toggle,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppColors.iconStrong,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(_playing ? Icons.pause : Icons.play_arrow,
                      size: 16, color: AppColors.iconInverse),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: SizedBox(
                  height: 24,
                  child: ValueListenableBuilder<double>(
                    valueListenable: _progress,
                    builder: (context, progress, _) => Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        for (var i = 0; i < _bars.length; i++)
                          Expanded(
                            child: Container(
                              height: 24 * _bars[i],
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              decoration: BoxDecoration(
                                color: AppColors.iconStrong.withValues(
                                  alpha:
                                      i / _bars.length <= progress ? 0.95 : 0.35,
                                ),
                                borderRadius:
                                    BorderRadius.circular(AppRadius.full),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Text(_durationLabel,
                  style: AppTextStyles.caption.copyWith(color: AppColors.textStrong)),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          const Divider(height: 1, color: Color(0x1A000000)),
          const SizedBox(height: AppSpacing.s2),
          Text(widget.transcript,
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textStrong)),
        ],
      ),
    );
  }
}
