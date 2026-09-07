import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

/// A sent voice note: scrub bar, duration, and the transcript underneath.
///
/// Playback here is a timer against the recorded duration — there is no audio
/// file behind a mocked recording. Swapping in a real player later means
/// replacing [_progress] with its position; nothing else about the bubble changes.
class VoiceMessage extends StatefulWidget {
  const VoiceMessage({super.key, required this.duration, required this.transcript});

  final Duration duration;
  final String transcript;

  @override
  State<VoiceMessage> createState() => _VoiceMessageState();
}

class _VoiceMessageState extends State<VoiceMessage> {
  static const _barCount = 26;

  bool _playing = false;
  double _progress = 0;
  Timer? _timer;
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
    super.dispose();
  }

  void _toggle() {
    if (_playing) {
      _timer?.cancel();
      setState(() => _playing = false);
      return;
    }
    final step = 60 / widget.duration.inMilliseconds.clamp(1, 1 << 30);
    setState(() => _playing = true);
    _timer = Timer.periodic(const Duration(milliseconds: 60), (timer) {
      setState(() {
        _progress += step;
        if (_progress >= 1) {
          _progress = 0;
          _playing = false;
          timer.cancel();
        }
      });
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
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      for (var i = 0; i < _bars.length; i++)
                        Expanded(
                          child: Container(
                            height: 24 * _bars[i],
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            decoration: BoxDecoration(
                              color: AppColors.iconStrong.withValues(
                                alpha: i / _bars.length <= _progress ? 0.95 : 0.35,
                              ),
                              borderRadius: BorderRadius.circular(AppRadius.full),
                            ),
                          ),
                        ),
                    ],
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
