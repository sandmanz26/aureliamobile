import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import 'app_drawer.dart';

/// A screen designed but not built yet. Says so plainly rather than pretending.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    super.key,
    required this.route,
    required this.title,
    required this.description,
  });

  final String route;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: AppDrawer(current: route),
      body: SafeArea(
        child: Column(
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
                  Expanded(child: Text(title, style: AppTextStyles.titleLg)),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.xl),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: const BoxDecoration(
                          color: AppColors.backgroundElevated,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.hourglass_empty,
                            size: 24, color: AppColors.iconDefault),
                      ),
                      const SizedBox(height: AppSpacing.s4),
                      Text(title, style: AppTextStyles.titleMd),
                      const SizedBox(height: AppSpacing.s2),
                      Text(description,
                          textAlign: TextAlign.center, style: AppTextStyles.bodySm),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
