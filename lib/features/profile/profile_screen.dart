import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../shell/app_drawer.dart';

/// One of the four sessions the demo profile has published.
class _Published {
  const _Published({
    required this.title,
    required this.photo,
    required this.description,
    required this.plays,
    required this.recreated,
    required this.gradient,
  });

  final String title;
  final String photo;
  final String description;
  final String plays;
  final String recreated;
  final List<Color> gradient;
}

const _cards = <_Published>[
  _Published(
    title: 'Dolphins frequency',
    photo: 'dolphins',
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: [AppPrimitives.info800, AppPrimitives.info400],
  ),
  _Published(
    title: 'Soft Reset',
    photo: 'calm',
    description: 'This helped Adam feel more relaxed, with 91% less tension.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: [AppPrimitives.warning300, AppPrimitives.danger200],
  ),
  _Published(
    title: 'Deep Space',
    photo: 'mindDance',
    description: 'This helped Adam quiet thoughts by 38% in less than a week.',
    plays: '12.1k',
    recreated: '980',
    gradient: [AppPrimitives.neutral950, AppPrimitives.neutral700],
  ),
  _Published(
    title: 'Clear Skies',
    photo: 'mountains',
    description: 'This helped Adam boost focus by 46% in less than a week.',
    plays: '9.8k',
    recreated: '640',
    gradient: [AppPrimitives.info200, AppPrimitives.neutral100],
  ),
];

const _stats = [('6', 'Posts'), ('18,513', 'Played'), ('1,528', 'Recreated')];

/// Profile — who you are on Aurelia, and what you have published.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/profile'),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.md, AppPadding.md, AppPadding.md, AppSpacing.s10),
          children: [
            Row(
              children: [
                Builder(
                  builder: (context) => CircleSurfaceButton(
                    icon: Icons.menu,
                    tooltip: 'Open menu',
                    size: 44,
                    onPressed: () => Scaffold.of(context).openDrawer(),
                  ),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(child: Text('Profile', style: AppTextStyles.titleLg)),
                const CoinPill(),
                const SizedBox(width: AppSpacing.s3),
                CircleSurfaceButton(
                  icon: Icons.ios_share,
                  tooltip: 'Share profile',
                  size: 44,
                  onPressed: () {},
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.s6),
            // The avatar sits in a 2px gold ring, so it reads as a portrait
            // rather than as another round photo in a page full of them.
            Center(
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppPrimitives.primary300, AppPrimitives.primary600],
                  ),
                ),
                child: const PhotoCircle(
                  photo: 'avatar',
                  size: 92,
                  gradient: [AppColors.backgroundElevated, AppColors.backgroundElevated],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            Center(child: Text('Adam Nilson', style: AppTextStyles.titleMd)),
            Center(child: Text('Dubai, UAE', style: AppTextStyles.label)),

            const SizedBox(height: AppSpacing.s6),
            Container(
              padding: const EdgeInsets.symmetric(vertical: AppPadding.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Row(
                children: [
                  for (final (value, label) in _stats) ...[
                    Expanded(
                      child: Column(
                        children: [
                          Text(value, style: AppTextStyles.titleMd),
                          const SizedBox(height: AppSpacing.s1),
                          Text(label, style: AppTextStyles.label),
                        ],
                      ),
                    ),
                    if (label != _stats.last.$2)
                      const SizedBox(
                        height: 36,
                        child: VerticalDivider(
                          width: 1,
                          thickness: 1,
                          color: AppColors.borderSubtle,
                        ),
                      ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s6),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _cards.length,
              // 230 tall whatever the screen width, as on the web: the cards
              // hold four lines of text, so they cannot scale with the column.
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: AppSpacing.s3,
                crossAxisSpacing: AppSpacing.s3,
                mainAxisExtent: 230,
              ),
              itemBuilder: (context, index) =>
                  _PublishedCard(card: _cards[index]),
            ),
          ],
        ),
      ),
    );
  }
}

class _PublishedCard extends StatelessWidget {
  const _PublishedCard({required this.card});

  final _Published card;

  @override
  Widget build(BuildContext context) {
    const inverse = AppColors.textInverse;
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: Stack(
        fit: StackFit.expand,
        children: [
          CoverImage(
            photo: card.photo,
            gradient: card.gradient,
            width: 520,
            height: 460,
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.s3),
            child: LayoutBuilder(
              builder: (context, constraints) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _GlassCircle(
                        icon: Icons.bookmark_border,
                        tooltip: 'Save ${card.title}',
                      ),
                      // Flexible so the pill gives way rather than pushing
                      // past the card edge when the label runs long.
                      Flexible(
                        child: _RecreatePill(
                          title: card.title,
                          // The label is dropped rather than truncated once
                          // the card is too narrow to hold it, as on the web.
                          showLabel: constraints.maxWidth >= 124,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        card.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.bodySm.copyWith(
                          fontWeight: FontWeight.w600,
                          color: inverse,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s1),
                      Text(
                        card.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.caption
                            .copyWith(color: const Color(0xE6FFFFFF)),
                      ),
                      const SizedBox(height: AppSpacing.s2),
                      // Flexible, not fixed: on the narrowest phones the two
                      // counts together are wider than half a screen, and a
                      // clipped number is worse than an ellipsis.
                      Row(
                        children: [
                          for (final count in [
                            '▶ ${card.plays}',
                            '⟳ ${card.recreated}',
                          ]) ...[
                            Flexible(
                              child: Text(
                                count,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.caption
                                    .copyWith(color: const Color(0xE6FFFFFF)),
                              ),
                            ),
                            if (count.startsWith('▶'))
                              const SizedBox(width: AppSpacing.s3),
                          ],
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassCircle extends StatelessWidget {
  const _GlassCircle({required this.icon, required this.tooltip});

  final IconData icon;
  final String tooltip;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.surface.withValues(alpha: 0.9),
        ),
        child: Icon(icon, size: 16, color: AppColors.iconDefault),
      ),
    );
  }
}

class _RecreatePill extends StatelessWidget {
  const _RecreatePill({required this.title, required this.showLabel});

  final String title;
  final bool showLabel;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Recreate $title',
      child: Container(
        height: 32,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.full),
          color: AppColors.surface.withValues(alpha: 0.9),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.repeat, size: 14, color: AppColors.iconDefault),
            if (showLabel) ...[
              const SizedBox(width: AppSpacing.s1),
              Flexible(
                child: Text(
                  'Recreate',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.label,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
