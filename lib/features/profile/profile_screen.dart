import 'package:flutter/material.dart';
import '../../core/data/people.dart';
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

/// One screen for two readings of the same thing. `/profile` with no argument
/// is the signed-in user's; with a person slug it is somebody else's, reached
/// by tapping a creator anywhere their name appears — the player sheet, a
/// session's byline.
///
/// What changes between them is only the chrome around the same content: your
/// own profile opens the drawer, offers your coin balance and the gear; a
/// stranger's offers a way back and a way to follow. The published work below
/// is theirs in both cases, which is the point of the screen.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, this.person});

  /// Whose profile. Null is your own — see [findPerson].
  final String? person;

  @override
  Widget build(BuildContext context) {
    final subject = findPerson(person) ?? findPerson(null)!;
    final own = subject.isSelf;

    // The signed-in profile keeps its designed figures and shelf. Anyone
    // else's is assembled from what they have actually published — showing
    // Adam's work under a stranger's name is worse than showing them three
    // sessions.
    final stats = own
        ? _stats
        : [
            ('${subject.sessions.length}',
                subject.sessions.length == 1 ? 'Post' : 'Posts'),
            (subject.sessions.first.plays, 'Played'),
            (subject.sessions.first.recreated, 'Recreated'),
          ];
    final cards = own
        ? _cards
        : [
            for (final session in subject.sessions)
              _Published(
                title: session.title,
                photo: session.photo,
                description: session.description,
                plays: session.plays,
                recreated: session.recreated,
                gradient: session.gradient,
              ),
          ];

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: own ? const AppDrawer(current: '/profile') : null,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.page, AppPadding.md, AppPadding.page, AppSpacing.s10),
          children: [
            Row(
              children: [
                if (own)
                  Builder(
                    builder: (context) => CircleSurfaceButton(
                      icon: Icons.menu,
                      tooltip: 'Open menu',
                      size: 44,
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  )
                else
                  CircleSurfaceButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Back',
                    size: 44,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Text(own ? 'Profile' : subject.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.titleLg),
                ),
                if (own)
                  const CoinPill()
                else
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                      shape: const StadiumBorder(),
                      side: const BorderSide(color: AppColors.border),
                      padding:
                          const EdgeInsets.symmetric(horizontal: AppPadding.md),
                    ),
                    child: Text('Follow', style: AppTextStyles.label),
                  ),
                const SizedBox(width: AppSpacing.s3),
                CircleSurfaceButton(
                  icon: Icons.share_outlined,
                  tooltip: own ? 'Share profile' : 'Share ${subject.name}',
                  size: 44,
                  onPressed: () {},
                ),
                // Only on your own profile: there is nothing of a stranger's
                // to configure. This is also the only way into Settings, and
                // therefore the only way to sign out.
                if (own) ...[
                  const SizedBox(width: AppSpacing.s3),
                  CircleSurfaceButton(
                    icon: Icons.settings_outlined,
                    tooltip: 'Settings',
                    size: 44,
                    onPressed: () => Navigator.of(context).pushNamed('/settings'),
                  ),
                ],
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
                child: PhotoCircle(
                  photo: subject.photo,
                  size: 92,
                  gradient: const [
                    AppColors.backgroundElevated,
                    AppColors.backgroundElevated
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            Center(child: Text(subject.name, style: AppTextStyles.titleMd)),
            Center(
              child: Text(own ? 'Dubai, UAE' : subject.role,
                  textAlign: TextAlign.center, style: AppTextStyles.label),
            ),

            const SizedBox(height: AppSpacing.s6),
            Container(
              padding: const EdgeInsets.symmetric(vertical: AppPadding.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Row(
                children: [
                  for (final (value, label) in stats) ...[
                    Expanded(
                      child: Column(
                        children: [
                          Text(value, style: AppTextStyles.titleMd),
                          const SizedBox(height: AppSpacing.s1),
                          Text(label, style: AppTextStyles.label),
                        ],
                      ),
                    ),
                    if (label != stats.last.$2)
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
              itemCount: cards.length,
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
                  _PublishedCard(card: cards[index]),
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
                        icon: Icons.play_arrow_rounded,
                        tooltip: 'Play ${card.title}',
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
