import 'package:flutter/material.dart';
import '../../../core/data/people.dart';
import '../../../core/data/sessions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/cover_image.dart';
import '../../player/player_screen.dart';

/// The original a fork is being made from, shown in the thread.
///
/// Recreate used to arrive as a sentence — "Recreate X by Y, at N minutes" —
/// which names the session but does not show it, and gives you no way to hear
/// the thing you are about to change. This is the same hand-off with the
/// session attached to it: cover, title, author, run time, and a play control
/// that opens the player on it.
///
/// It sits under the message that carries it rather than at the end of the
/// thread, so everything said afterwards comes after it.
class AttachedSession extends StatelessWidget {
  const AttachedSession({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context) {
    final session = findSession(slug);
    // A slug that resolves to nothing is not worth a broken card: the message
    // above still says what is being recreated.
    if (session == null) return const SizedBox.shrink();

    return Container(
      width: 283,
      padding: const EdgeInsets.all(AppSpacing.s2),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0D000000),
              blurRadius: 24,
              spreadRadius: 4,
              offset: Offset(0, 5)),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: SizedBox(
              width: 56,
              height: 56,
              child: Stack(
                children: [
                  CoverImage(
                    photo: session.photo,
                    gradient: session.gradient,
                    width: 160,
                    height: 160,
                    scrim: false,
                  ),
                  Positioned.fill(
                    child: Material(
                      color: Colors.black.withValues(alpha: 0.25),
                      child: Tooltip(
                        message: 'Play ${session.title}',
                        child: InkWell(
                          onTap: () => Navigator.of(context).pushNamed(
                            '/play',
                            arguments: PlayRequest(
                                slug: session.slug,
                                origin: ProfileOrigin.community),
                          ),
                          child: const Icon(Icons.play_arrow_rounded,
                              size: 20, color: AppColors.iconInverse),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(session.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13,
                        height: 19 / 13,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(session.author,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption),
                const SizedBox(height: 2),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.schedule,
                        size: 10, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${session.durationLabel} mins',
                        style: AppTextStyles.caption),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.s1),
        ],
      ),
    );
  }
}
