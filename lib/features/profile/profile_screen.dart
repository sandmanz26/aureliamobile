import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../shell/app_drawer.dart';

/// Profile — who you are on Aurelia, and what you have published.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static const _stats = [('12', 'Posts'), ('4.2k', 'Played'), ('318', 'Recreated')];

  @override
  Widget build(BuildContext context) {
    final published = kSessions.take(4).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/profile'),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.s10),
          children: [
            Padding(
              padding: const EdgeInsets.all(AppPadding.md),
              child: Row(
                children: [
                  Builder(
                    builder: (context) => CircleSurfaceButton(
                      icon: Icons.menu,
                      tooltip: 'Open menu',
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(child: Text('Profile', style: AppTextStyles.titleLg)),
                  const CoinPill(),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            const Center(
              child: PhotoCircle(
                photo: 'avatar',
                size: 96,
                gradient: [AppPrimitives.primary300, AppPrimitives.info300],
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            Center(child: Text('Adam Nilson', style: AppTextStyles.titleMd)),
            const SizedBox(height: 2),
            Center(child: Text('Community creator · Joined 2025', style: AppTextStyles.caption)),
            const SizedBox(height: AppSpacing.s6),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: Row(
                children: [
                  for (final (value, label) in _stats)
                    Expanded(
                      child: Column(
                        children: [
                          Text(value, style: AppTextStyles.titleMd),
                          Text(label, style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s6),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pushNamed('/chat'),
                      child: const Text('New session'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pushNamed('/invite'),
                      child: const Text('Invite'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: Text('Published sessions', style: AppTextStyles.titleMd),
            ),
            const SizedBox(height: AppSpacing.s4),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: AppSpacing.s3,
                crossAxisSpacing: AppSpacing.s3,
                childAspectRatio: 1,
                children: [
                  for (final session in published)
                    GestureDetector(
                      onTap: () => Navigator.of(context)
                          .pushNamed('/session', arguments: session.slug),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        child: Stack(
                          children: [
                            CoverImage(
                              photo: session.photo,
                              gradient: session.gradient,
                              width: 400,
                              height: 400,
                            ),
                            Padding(
                              padding: const EdgeInsets.all(AppSpacing.s3),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    session.title,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppTextStyles.label
                                        .copyWith(color: AppColors.textInverse),
                                  ),
                                  Text('${session.minutes} min',
                                      style: AppTextStyles.caption
                                          .copyWith(color: const Color(0xE6FFFFFF))),
                                ],
                              ),
                            ),
                          ],
                        ),
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
