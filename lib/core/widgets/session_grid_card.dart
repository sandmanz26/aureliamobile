import 'package:flutter/material.dart';
import '../data/sessions.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';
import 'cover_image.dart';
import 'photo_circle.dart';

/// The tall session card used on the See All grid and the challenge shelf.
///
/// Different from the shelf card on Home: it leads with Play rather than Save,
/// and it credits the creator by face as well as name — on a grid of eight,
/// "who made this" is the fastest thing to scan by.
class SessionGridCard extends StatelessWidget {
  const SessionGridCard({
    super.key,
    required this.session,
    required this.onOpen,
    required this.onRecreate,
    this.aspectRatio = 164 / 205,
  });

  final SessionRecord session;
  final VoidCallback onOpen;
  final VoidCallback onRecreate;

  /// The challenge shelf runs wider and shorter than the grid.
  final double aspectRatio;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: aspectRatio,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Stack(
          children: [
            CoverImage(
              photo: session.photo,
              gradient: session.gradient,
              width: 420,
              height: 520,
            ),
            Material(color: Colors.transparent, child: InkWell(onTap: onOpen)),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.s2 + 2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _PlayBadge(onTap: onOpen),
                      // Flexible: the grid cell is narrow, and a pill that
                      // cannot shrink overflows the row instead of trimming.
                      Flexible(child: _RecreatePill(onTap: onRecreate)),
                    ],
                  ),
                  const Spacer(),
                  IgnorePointer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          session.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.bodyLg.copyWith(
                            color: AppColors.textInverse,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          session.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.bodySm
                              .copyWith(color: const Color(0xE6FFFFFF)),
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Row(
                          children: [
                            PhotoCircle(
                              photo: session.authorPhoto,
                              size: 20,
                              gradient: const [
                                AppPrimitives.primary300,
                                AppPrimitives.info300,
                              ],
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                session.author,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.caption
                                    .copyWith(color: AppColors.textInverse),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.play_arrow,
                                size: 11, color: Color(0xE6FFFFFF)),
                            const SizedBox(width: 3),
                            Text(session.plays,
                                style: AppTextStyles.caption
                                    .copyWith(color: const Color(0xE6FFFFFF))),
                            const SizedBox(width: AppSpacing.s2),
                            Text('|',
                                style: AppTextStyles.caption
                                    .copyWith(color: const Color(0x80FFFFFF))),
                            const SizedBox(width: AppSpacing.s2),
                            const Icon(Icons.repeat, size: 11, color: Color(0xE6FFFFFF)),
                            const SizedBox(width: 3),
                            Text(session.recreated,
                                style: AppTextStyles.caption
                                    .copyWith(color: const Color(0xE6FFFFFF))),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlayBadge extends StatelessWidget {
  const _PlayBadge({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0x73000000),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: const SizedBox(
          width: 32,
          height: 32,
          child: Icon(Icons.play_arrow, size: 16, color: AppColors.textInverse),
        ),
      ),
    );
  }
}

class _RecreatePill extends StatelessWidget {
  const _RecreatePill({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xF2FFFFFF),
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.full),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.repeat, size: 13, color: AppColors.textPrimary),
              const SizedBox(width: 4),
              Flexible(
                child: Text('Recreate',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
