import 'package:flutter/material.dart';
import '../../../core/audio/playback_controller.dart';
import '../../../core/data/people.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/photo_circle.dart';
import '../../player/player_screen.dart';

/// Figma "Chat: Play" (16523:18533) — the session that is running, parked in
/// the cockpit header: 362x68, radius 20, on the shared card shadow.
///
/// It exists so that starting a session is not a decision to leave the
/// conversation. Tapping it goes back to the full player; the transport stays
/// here so it can be paused without going anywhere.
///
/// Renders nothing when there is no session loaded, which is what keeps it out
/// of the header until the first play.
///
/// **The sound switch is not in the frame.** It is here because silence is
/// global and this is where you are when you notice you need it: the card is
/// on screen precisely when a session is running and you are doing something
/// else. Reachable only from the full player the switch would be two taps
/// away at the moment it is wanted — and, worse, a muted session playing here
/// would have nothing on it to say why it is silent.
class MiniPlayer extends StatelessWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = PlaybackScope.of(context);
    final track = playback.track;
    if (track == null) return const SizedBox.shrink();

    void open() => Navigator.of(context).pushNamed(
          '/play',
          arguments: PlayRequest(slug: track.slug, origin: ProfileOrigin.own),
        );

    return Container(
      // 68 is the frame's, held rather than left to the content: PhotoCircle
      // renders a disc at its size and the row would otherwise size itself.
      height: 68,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surface,
        // 20 is not on AppRadius and is not a Figma variable either — a raw
        // value in the frame, by decision.
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Color(0x0D000000), blurRadius: 24, spreadRadius: 4,
              offset: Offset(0, 5)),
        ],
      ),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppPadding.md, 0, AppPadding.md, AppSpacing.s1),
            child: Row(
              children: [
                InkWell(
                  onTap: open,
                  customBorder: const CircleBorder(),
                  child: PhotoCircle(
                      photo: track.photo, size: 32, gradient: track.gradient),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: InkWell(
                    onTap: open,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(track.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.bodyLg),
                        Text(track.author,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.label.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w400,
                            )),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.s3),
                IconButton(
                  onPressed: playback.toggleMuted,
                  tooltip:
                      playback.muted ? 'Turn sound on' : 'Turn sound off',
                  iconSize: 18,
                  constraints:
                      const BoxConstraints.tightFor(width: 32, height: 32),
                  padding: EdgeInsets.zero,
                  color: AppColors.iconDefault,
                  icon: Icon(playback.muted
                      ? Icons.volume_off_rounded
                      : Icons.volume_up_rounded),
                ),
                const SizedBox(width: AppSpacing.s3),
                IconButton(
                  onPressed: playback.toggle,
                  tooltip: playback.playing
                      ? 'Pause ${track.title}'
                      : 'Play ${track.title}',
                  iconSize: 20,
                  constraints: const BoxConstraints.tightFor(width: 32, height: 32),
                  padding: EdgeInsets.zero,
                  color: _accent,
                  icon: Icon(playback.playing
                      ? Icons.pause_rounded
                      : Icons.play_arrow_rounded),
                ),
              ],
            ),
          ),

          // Flush to the card's bottom edge and clipped by its radius, so the
          // bar is the card's own base rather than a rule sitting above it.
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            child: ValueListenableBuilder<Duration>(
              valueListenable: playback.elapsed,
              builder: (context, elapsed, _) {
                final progress = (elapsed.inMilliseconds /
                        playback.length.inMilliseconds)
                    .clamp(0.0, 1.0);
                return Stack(
                  children: [
                    ColoredBox(
                      color: _accent.withValues(alpha: 0.15),
                      child: const SizedBox.expand(),
                    ),
                    FractionallySizedBox(
                      widthFactor: progress,
                      child: const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                              colors: [_accent, Color(0xFFFFC500)]),
                          borderRadius: BorderRadius.horizontal(
                              right: Radius.circular(AppRadius.full)),
                        ),
                        child: SizedBox.expand(),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

const _accent = Color(0xFFFF881B);
