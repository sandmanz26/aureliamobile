import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/audio/voice_capture.dart';
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
/// **The mic is real now; the transcript is not.** Levels come off the device
/// through [VoiceCapture], the clip is written to disk, and the thread plays
/// that file back. The words underneath are still a fixed sample string,
/// because there is no speech service behind them — wiring one in replaces
/// `_transcribe` and nothing else.
enum _Phase { denied, recording, transcribing, review }

const _sampleTranscript =
    'Make it about twenty minutes, a bit slower, and keep the ocean sound '
    'underneath the whole way through.';

class VoiceRecorder extends StatefulWidget {
  const VoiceRecorder({
    super.key,
    required this.onSend,
    required this.onCancel,
    this.capture,
  });

  /// Confirmed transcript, how long the clip ran, and where it landed, so the
  /// thread can show the first two and play the third.
  final void Function(String transcript, Duration duration, String path) onSend;
  final VoidCallback onCancel;

  /// The microphone. Null is the device's. The tests pass
  /// [SilentVoiceCapture] — a test binding has no platform channels.
  final VoiceCapture? capture;

  @override
  State<VoiceRecorder> createState() => _VoiceRecorderState();
}

class _VoiceRecorderState extends State<VoiceRecorder> {
  static const _barCount = 28;

  final _transcriptController = TextEditingController();
  late final VoiceCapture _capture = widget.capture ?? DeviceVoiceCapture();
  StreamSubscription<double>? _levelSubscription;

  _Phase _phase = _Phase.recording;
  VoiceCaptureError? _failure;
  VoiceClip? _clip;
  /// Both tick nine times a second while the mic is open, and both are read
  /// by one small widget each. Notifiers rather than state, so the ticking
  /// rebuilds the meter and the clock and not the sheet around them.
  final _elapsed = ValueNotifier<Duration>(Duration.zero);
  final _levels = ValueNotifier<List<double>>(List.filled(_barCount, 0.15));
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
    unawaited(_levelSubscription?.cancel());
    // Only ours to close. A capture handed in by a test belongs to the test.
    if (widget.capture == null) unawaited(_capture.dispose());
    _transcriptController.dispose();
    _elapsed.dispose();
    _levels.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    _ticker?.cancel();
    await _levelSubscription?.cancel();
    _elapsed.value = Duration.zero;
    // 0.15, not 0: a flat line at the baseline still reads as a meter waiting
    // for sound, where an empty row reads as broken.
    _levels.value = List.filled(_barCount, 0.15);
    setState(() {
      _phase = _Phase.recording;
      _failure = null;
      _clip = null;
      _transcriptController.clear();
    });

    try {
      await _capture.start();
    } on VoiceCaptureException catch (error) {
      if (!mounted) return;
      setState(() {
        _failure = error.reason;
        _phase = _Phase.denied;
      });
      return;
    } catch (_) {
      // A belt to the capture's braces. Anything that escapes typed failures
      // still has to land somewhere visible: an unhandled error here left the
      // sheet on "Listening.." with a clock that never moved, which reads as
      // working and is the worst state of the three.
      if (!mounted) return;
      setState(() {
        _failure = VoiceCaptureError.unavailable;
        _phase = _Phase.denied;
      });
      return;
    }
    if (!mounted) return;

    // The clock is ours; the bars are the device's. Keeping them apart means a
    // silent room shows a flat meter against a running timer, which is the
    // truth, rather than the animation the old fake drew regardless.
    _ticker = Timer.periodic(const Duration(milliseconds: 110), (_) {
      _elapsed.value += const Duration(milliseconds: 110);
    });
    _levelSubscription = _capture.levels.listen((level) {
      _levels.value = [..._levels.value.skip(1), level];
    });
  }

  Future<void> _stop() async {
    // The phase flips first and the device is closed after. Awaiting the
    // cancel before the setState left the sheet on "Listening.." until the I/O
    // came back, which reads as a dropped tap.
    _ticker?.cancel();
    setState(() => _phase = _Phase.transcribing);
    unawaited(_levelSubscription?.cancel());
    _levelSubscription = null;

    final clip = await _capture.stop();
    if (!mounted) return;
    _clip = clip;
    // The recorder's own clock is authoritative for what the user watched;
    // the capture's is used only when it reports something longer, which is
    // the case where the first tick landed late.
    if (clip != null && clip.duration > _elapsed.value) {
      _elapsed.value = clip.duration;
    }

    _transcribe();
  }

  /// Where a speech service would go. The pause is not decoration — it is the
  /// shape the real call has, and the review step exists because transcription
  /// is never perfect.
  void _transcribe() {
    _transcribeTimer = Timer(const Duration(milliseconds: 1100), () {
      if (!mounted) return;
      setState(() {
        _transcriptController.text = _sampleTranscript;
        _phase = _Phase.review;
      });
    });
  }

  void _discard() {
    unawaited(_capture.cancel());
    widget.onCancel();
  }

  static String _format(Duration elapsed) {
    final total = elapsed.inSeconds;
    return '${total ~/ 60}:${(total % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_phase == _Phase.denied) return _buildDenied();
    if (_phase == _Phase.review) return _buildReview();
    return _buildRecording();
  }

  /// The mic said no. Two reasons, two remedies, so they get two sentences —
  /// "something went wrong" would leave the user with nothing to do.
  Widget _buildDenied() {
    final denied = _failure == VoiceCaptureError.permissionDenied;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppPadding.page, AppSpacing.s4, AppPadding.page, AppSpacing.s6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.mic_off_outlined, size: 28, color: AppColors.iconDefault),
          const SizedBox(height: AppSpacing.s3),
          Text(
            denied ? 'Aurelia cannot hear you' : 'The microphone is busy',
            style: AppTextStyles.bodyLg,
          ),
          const SizedBox(height: AppSpacing.s1),
          Text(
            denied
                ? 'Microphone access is off for Aurelia. Turn it on in your '
                    'device settings, or type instead.'
                : 'Another app may be using it. Close that and try again, or '
                    'type instead.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.s4),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _startRecording,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 44),
                    side: const BorderSide(color: AppColors.borderSubtle),
                  ),
                  child: Text('Try again', style: AppTextStyles.label),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.onCancel,
                  style: ElevatedButton.styleFrom(minimumSize: const Size(0, 44)),
                  child: const Text('Type instead'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReview() {
    final canSend = _transcriptController.text.trim().isNotEmpty;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppPadding.page, AppSpacing.s2, AppPadding.page, AppSpacing.s4),
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
                      child: Text('Transcript · ${_format(_elapsed.value)}',
                          style: AppTextStyles.caption),
                    ),
                    GestureDetector(
                      onTap: _discard,
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
                      ? () => widget.onSend(_transcriptController.text.trim(),
                          _elapsed.value, _clip?.path ?? '')
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
          AppPadding.page, AppSpacing.s3, AppPadding.page, AppSpacing.s6),
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
              ValueListenableBuilder<Duration>(
                valueListenable: _elapsed,
                builder: (context, elapsed, _) =>
                    Text(_format(elapsed), style: AppTextStyles.bodySm),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),
          // Live level meter — the thing that makes it read as actually recording.
          SizedBox(
            height: 40,
            child: ValueListenableBuilder<List<double>>(
              valueListenable: _levels,
              builder: (context, levels, _) => Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                for (final level in levels)
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
