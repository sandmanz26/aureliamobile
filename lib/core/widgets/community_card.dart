import 'package:flutter/material.dart';
import '../data/sessions.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';
import 'cover_image.dart';

/// A community session as it appears on a shelf.
///
/// The whole card opens the session; Recreate and Save sit above that so they
/// stay their own targets rather than being swallowed by it.
class CommunityCard extends StatelessWidget {
  const CommunityCard({
    super.key,
    required this.session,
    required this.onOpen,
    required this.onRecreate,
  });

  final SessionRecord session;
  final VoidCallback onOpen;
  final VoidCallback onRecreate;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      height: 230,
      child: Stack(
        children: [
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.xl),
              child: Stack(
                children: [
                  CoverImage(
                    photo: session.photo,
                    gradient: session.gradient,
                    width: 520,
                    height: 460,
                  ),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(onTap: onOpen),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.s3),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _RoundAction(icon: Icons.bookmark_border, onTap: onOpen),
                    _RecreateButton(onTap: onRecreate),
                  ],
                ),
                const Spacer(),
                IgnorePointer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.title,
                        style: AppTextStyles.bodyLg.copyWith(
                          color: AppColors.textInverse,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s1),
                      Text(
                        session.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.bodySm.copyWith(color: const Color(0xE6FFFFFF)),
                      ),
                      const SizedBox(height: AppSpacing.s2),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              session.author,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.caption
                                  .copyWith(color: const Color(0xE6FFFFFF)),
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.play_circle_outline,
                                  size: 12, color: Color(0xE6FFFFFF)),
                              const SizedBox(width: 2),
                              Text(session.plays,
                                  style: AppTextStyles.caption
                                      .copyWith(color: const Color(0xE6FFFFFF))),
                              const SizedBox(width: AppSpacing.s2),
                              const Icon(Icons.repeat, size: 12, color: Color(0xE6FFFFFF)),
                              const SizedBox(width: 2),
                              Text(session.recreated,
                                  style: AppTextStyles.caption
                                      .copyWith(color: const Color(0xE6FFFFFF))),
                            ],
                          ),
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
    );
  }
}

class _RoundAction extends StatelessWidget {
  const _RoundAction({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xE6FFFFFF),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: const SizedBox(
          width: 32,
          height: 32,
          child: Icon(Icons.bookmark_border, size: 16, color: AppColors.iconDefault),
        ),
      ),
    );
  }
}

class _RecreateButton extends StatelessWidget {
  const _RecreateButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xE6FFFFFF),
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.full),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3, vertical: 7),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.repeat, size: 14, color: AppColors.textPrimary),
              const SizedBox(width: AppSpacing.s1),
              Text('Recreate', style: AppTextStyles.label),
            ],
          ),
        ),
      ),
    );
  }
}
