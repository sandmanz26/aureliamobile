import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

/// Voice capture with a visible result, rather than a state that ends silently.
///
/// recording → a live level meter and a running timer, so it is obvious the mic
/// is open; stopping transcribes and lands in review, where the words are shown
/// and can be sent, re-recorded, or thrown away. Nothing reaches the thread
/// until the user confirms it — the transcript is a draft, not a fait accompli.
///
/// A real build feeds the levels from the audio session and the text from a
/// speech service; neither changes the shape of this widget.
enum _Phase { recording, transcribing, review }

const _sampleTranscript =
    'Make it about twenty minutes, a bit slower, and keep the ocean sound '
    'underneath the whole way through.';

class VoiceRecorder extends StatefulWidget {
  const VoiceRecorder({super.key, required this.onSend, required this.onCancel});

  /// Confirmed transcript plus how long the clip ran, so the thread can show both.
  final void Function(String transcript, Duration duration) onSend;
  final VoidCallback onCancel;

  @override
  State<VoiceRecorder> createState() => _VoiceRecorderState();
}

class _VoiceRecorderState extends State<VoiceRecorder> {
  static const _barCount = 28;

  final _random = Random();
  final _transcriptController = TextEditingController();

  _Phase _phase = _Phase.recording;
  Duration _elapsed = Duration.zero;
  List<double> _levels = List.filled(_barCount, 0.15);
  Timer? _ticker;
  Timer? _transcribeTimer;

  @override
  void initState() {
    super.initState();
    _startRecording();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _transcribeTimer?.cancel();
    _transcriptController.dispose();
    super.dispose();
  }

  void _startRecording() {
    _ticker?.cancel();
    setState(() {
      _phase = _Phase.recording;
      _elapsed = Duration.zero;
      _levels = List.filled(_barCount, 0.15);
      _transcriptController.clear();
    });
    _ticker = Timer.periodic(const Duration(milliseconds: 110), (_) {
      setState(() {
        _elapsed += const Duration(milliseconds: 110);
        _levels = [..._levels.skip(1), 0.25 + _random.nextDouble() * 0.75];
      });
    });
  }

  void _stop() {
    _ticker?.cancel();
    setState(() => _phase = _Phase.transcribing);
    _transcribeTimer = Timer(const Duration(milliseconds: 1100), () {
      if (!mounted) return;
      setState(() {
        _transcriptController.text = _sampleTranscript;
        _phase = _Phase.review;
      });
    });
  }

  String get _duration {
    final total = _elapsed.inSeconds;
    return '${total ~/ 60}:${(total % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_phase == _Phase.review) return _buildReview();
    return _buildRecording();
  }

  Widget _buildReview() {
    final canSend = _transcriptController.text.trim().isNotEmpty;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppPadding.lg, AppSpacing.s2, AppPadding.lg, AppSpacing.s4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(AppPadding.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.borderSubtle),
              borderRadius: BorderRadius.circular(AppRadius.xl),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('Transcript · $_duration', style: AppTextStyles.caption),
                    ),
                    GestureDetector(
                      onTap: widget.onCancel,
                      child: const Icon(Icons.delete_outline,
                          size: 16, color: AppColors.iconDefault),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s2),
                // Editable, because transcription is never perfect.
                TextField(
                  controller: _transcriptController,
                  maxLines: 3,
                  onChanged: (_) => setState(() {}),
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary),
                  decoration: const InputDecoration(
                    isDense: true,
                    filled: false,
                    contentPadding: EdgeInsets.zero,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: _startRecording,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 44),
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                  side: const BorderSide(color: AppColors.borderSubtle),
                ),
                icon: const Icon(Icons.refresh, size: 15),
                label: Text('Record again', style: AppTextStyles.label),
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: canSend
                      ? () => widget.onSend(_transcriptController.text.trim(), _elapsed)
                      : null,
                  style: ElevatedButton.styleFrom(minimumSize: const Size(0, 44)),
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('Send'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecording() {
    final busy = _phase == _Phase.transcribing;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppPadding.lg, AppSpacing.s3, AppPadding.lg, AppSpacing.s6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (!busy)
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(right: AppSpacing.s2),
                  decoration: const BoxDecoration(
                    color: AppColors.feedbackError,
                    shape: BoxShape.circle,
                  ),
                ),
              Text(
                busy ? 'Transcribing…' : 'Listening..',
                style: AppTextStyles.bodySm.copyWith(color: AppColors.textStrong),
              ),
              const SizedBox(width: AppSpacing.s2),
              Text(_duration, style: AppTextStyles.bodySm),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),
          // Live level meter — the thing that makes it read as actually recording.
          SizedBox(
            height: 40,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                for (final level in _levels)
                  Container(
                    width: 3,
                    height: 40 * (busy ? 0.2 : level),
                    margin: const EdgeInsets.symmetric(horizontal: 1.5),
                    decoration: BoxDecoration(
                      color: AppColors.iconStrong.withValues(alpha: busy ? 0.35 : 0.85),
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton.icon(
                onPressed: busy ? null : _stop,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 56),
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
                  side: BorderSide.none,
                ),
                icon: const Icon(Icons.stop, size: 16),
                label: Text('Stop', style: AppTextStyles.label),
              ),
              const SizedBox(width: AppSpacing.s2),
              IconButton.filled(
                onPressed: widget.onCancel,
                tooltip: 'Cancel recording',
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.surface,
                  foregroundColor: AppColors.iconStrong,
                  minimumSize: const Size(57, 56),
                ),
                icon: const Icon(Icons.mic_none, size: 19),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
