import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/session_grid_card.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../../core/widgets/section_header.dart';
import '../home/home_screen.dart' show LiveSessionsCard;
import '../shell/app_drawer.dart';

/// Sessions — the browse surface behind the Sessions nav item.
///
/// Home argues for the product; this screen is what you use once you are in it.
/// No marketing: a banner for the one thing to press today, then shelves.
class SessionsScreen extends StatefulWidget {
  const SessionsScreen({super.key});

  @override
  State<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends State<SessionsScreen> {
  String _chip = kAllCategories;

  /// Sessions part-way through, with how far in they are.
  static const _recentlyPlayed = <(String, int, double)>[
    ('inner-frequency', 5, 0.62),
    ('quiet-space', 9, 0.28),
    ('rainy-mind', 14, 0.81),
  ];

  static final _chips = <String>[
    kAllCategories,
    for (final category in kCategories) category.label,
  ];

  static String _categoryFor(String chip) {
    for (final category in kCategories) {
      if (category.label == chip) return category.name;
    }
    return kAllCategories;
  }

  static const _quickStart = [
    ('Affirmations', 'Personalized exprience.', 'affirmations',
        [AppPrimitives.danger400, AppPrimitives.warning300]),
    ('Sleep Meditation', 'Personalized exprience.', 'sleep',
        [AppPrimitives.neutral700, AppPrimitives.neutral400]),
  ];

  static const _creators = [
    ('Ethan Miller', 'creatorEthan', '52 sessions'),
    ('Daniel Carter', 'creatorDaniel', '38 sessions'),
    ('Sophia Reynolds', 'creatorSophia', '27 sessions'),
    ('Maya Bennett', 'creatorMaya', '19 sessions'),
  ];

  static const _challengeStats = [
    (Icons.monetization_on_outlined, '250 pts'),
    (Icons.group_outlined, '2.3k joined'),
    (Icons.schedule, '30 days'),
  ];

  Widget _shelf(Shelf shelf, {bool filtered = false}) {
    final sessions =
        sessionsOnShelf(shelf, filtered ? _categoryFor(_chip) : kAllCategories);
    if (sessions.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
        child: Text('Nothing in $_chip yet — try another category.',
            style: AppTextStyles.bodySm),
      );
    }
    return SizedBox(
      height: 303,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
        itemCount: sessions.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
        // The same card the See All grid uses, at the design's 228x303.
        itemBuilder: (context, index) => SizedBox(
          width: 228,
          child: SessionGridCard(
            session: sessions[index],
            aspectRatio: 228 / 303,
            onOpen: () =>
                Navigator.of(context).pushNamed('/session', arguments: sessions[index].slug),
            onRecreate: () =>
                Navigator.of(context).pushNamed('/recreate', arguments: sessions[index].slug),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(current: '/sessions'),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFFFFFF), Color(0xFFFFF6E6), Color(0xFFFFFFFF)],
            stops: [0, 0.4, 1],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(bottom: AppSpacing.s12),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppPadding.page, AppPadding.md, AppPadding.page, 0),
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
                    Expanded(child: Text('Explore', style: AppTextStyles.titleLg)),
                    const CoinPill(),
                    const SizedBox(width: AppSpacing.s2),
                    CircleSurfaceButton(
                      icon: Icons.bookmark_border,
                      tooltip: 'Saved sessions',
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s5),

              // The one thing the app wants you to press today.
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: GestureDetector(
                  onTap: () => Navigator.of(context).pushNamed('/chat'),
                  child: AspectRatio(
                    aspectRatio: 362 / 200,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.xl2),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          const CoverImage(
                            photo: 'bloom',
                            gradient: [AppPrimitives.info900, AppPrimitives.danger500],
                            width: 760,
                            height: 420,
                            scrim: false,
                          ),
                          Container(
                            width: 56,
                            height: 56,
                            decoration: const BoxDecoration(
                              color: Color(0xCCFFFFFF),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.play_arrow,
                                size: 30, color: Color(0xCC000000)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(title: 'Quick Start'),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 160,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  itemCount: _quickStart.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
                  itemBuilder: (context, index) {
                    final (title, subtitle, photo, gradient) = _quickStart[index];
                    return _ExploreQuickStartCard(
                      title: title,
                      subtitle: subtitle,
                      photo: photo,
                      gradient: gradient,
                      onTap: () => Navigator.of(context).pushNamed('/chat'),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(title: 'Ongoing Live Sessions'),
              ),
              const SizedBox(height: AppSpacing.s4),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: LiveSessionsCard(),
              ),

              // Sessions in progress. The only shelf with a progress bar,
              // because it is the only one where "how far in am I" is why you
              // came back — the rest are things you have not started.
              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(
                  title: 'Recently Played',
                  onSeeAll: () => Navigator.of(context)
                      .pushNamed('/see-all', arguments: Shelf.picked),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 150,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  itemCount: _recentlyPlayed.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
                  itemBuilder: (context, index) {
                    final (slug, minutes, progress) = _recentlyPlayed[index];
                    final session = findSession(slug);
                    if (session == null) return const SizedBox.shrink();
                    return _RecentCard(
                      session: session,
                      minutes: minutes,
                      progress: progress,
                      onTap: () => Navigator.of(context)
                          .pushNamed('/session', arguments: session.slug),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(
                  title: 'Recreate from Community',
                  action: 'All Categories',
                  onSeeAll: () => Navigator.of(context)
                      .pushNamed('/see-all', arguments: Shelf.community),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                // 32, which is what a chip measures: 12px label on a 16 line
                // over 8 of padding. A taller rail hands the chips a tight
                // height and stretches them past the web's.
                height: 32,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  itemCount: _chips.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                  itemBuilder: (context, index) => PillChip(
                    label: _chips[index],
                    selected: _chips[index] == _chip,
                    onTap: () => setState(() => _chip = _chips[index]),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              _shelf(Shelf.community, filtered: true),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(title: 'Trusted Creators'),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 116,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  itemCount: _creators.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s5),
                  itemBuilder: (context, index) {
                    final (name, photo, sessions) = _creators[index];
                    return SizedBox(
                      width: 84,
                      child: Column(
                        children: [
                          PhotoCircle(
                            photo: photo,
                            size: 72,
                            gradient: const [
                              AppPrimitives.primary300,
                              AppPrimitives.info300,
                            ],
                          ),
                          const SizedBox(height: AppSpacing.s2),
                          Text(name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.caption
                                  .copyWith(color: AppColors.textPrimary)),
                          Text(sessions,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.caption),
                        ],
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(title: 'Monthly Challenge!'),
              ),
              const SizedBox(height: AppSpacing.s4),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: AspectRatio(
                  aspectRatio: 362 / 240,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.xl2),
                    child: Stack(
                      children: [
                        const CoverImage(
                          photo: 'neural',
                          gradient: [AppPrimitives.neutral950, AppPrimitives.warning700],
                          width: 760,
                          height: 520,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(AppPadding.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Spacer(),
                              Text(
                                '30-Day Nervous System Reset',
                                style: AppTextStyles.titleMd
                                    .copyWith(color: AppColors.textInverse),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Slow down and build a calmer daily rhythm.',
                                style: AppTextStyles.bodySm
                                    .copyWith(color: const Color(0xE6FFFFFF)),
                              ),
                              const SizedBox(height: AppSpacing.s3),
                              // Three facts as pills, as the design sets them.
                              Wrap(
                                spacing: AppSpacing.s2,
                                runSpacing: AppSpacing.s2,
                                children: [
                                  for (final (icon, label) in _challengeStats)
                                    Container(
                                      height: 28,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: AppSpacing.s3),
                                      decoration: BoxDecoration(
                                        color: const Color(0x33FFFFFF),
                                        borderRadius:
                                            BorderRadius.circular(AppRadius.full),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(icon,
                                              size: 12,
                                              color: AppColors.textInverse),
                                          const SizedBox(width: 6),
                                          Text(label,
                                              style: AppTextStyles.caption.copyWith(
                                                  color: AppColors.textInverse)),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // The whole card opens the challenge, as on the web.
                        // It sits above the copy because a Text takes the hit
                        // test itself and would otherwise swallow the tap.
                        Positioned.fill(
                          child: Semantics(
                            button: true,
                            label:
                                'Open the 30-Day Nervous System Reset challenge',
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () => Navigator.of(context).pushNamed(
                                  '/challenge',
                                  arguments: 'nervous-system-reset'),
                            ),
                          ),
                        ),
                        // Join is last, so it keeps its own corner.
                        Positioned(
                          top: AppPadding.md,
                          right: AppPadding.md,
                          child: Material(
                            color: const Color(0xE6FFFFFF),
                            borderRadius: BorderRadius.circular(AppRadius.full),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(AppRadius.full),
                              onTap: () => Navigator.of(context).pushNamed(
                                  '/challenge',
                                  arguments: 'nervous-system-reset'),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.s3, vertical: 7),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('Join', style: AppTextStyles.label),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.arrow_forward,
                                        size: 13, color: AppColors.textPrimary),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(
                  title: 'Picked for You',
                  onSeeAll: () => Navigator.of(context)
                      .pushNamed('/see-all', arguments: Shelf.picked),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              _shelf(Shelf.picked),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(
                  title: 'Sessions with Biggest Impact',
                  onSeeAll: () => Navigator.of(context)
                      .pushNamed('/see-all', arguments: Shelf.impact),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              _shelf(Shelf.impact),
            ],
          ),
        ),
      ),
    );
  }
}

/// A session you are part-way through.
class _RecentCard extends StatelessWidget {
  const _RecentCard({
    required this.session,
    required this.minutes,
    required this.progress,
    required this.onTap,
  });

  final SessionRecord session;
  final int minutes;
  final double progress;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 236,
        height: 150,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          child: Stack(
            children: [
              CoverImage(
                  photo: session.photo,
                  gradient: session.gradient,
                  width: 480,
                  height: 300),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.25),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.play_arrow_rounded,
                          size: 18, color: AppColors.textInverse),
                    ),
                    const Spacer(),
                    Text(
                      session.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textInverse,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        PhotoCircle(
                          photo: session.authorPhoto,
                          size: 16,
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
                                .copyWith(color: const Color(0xE6FFFFFF)),
                          ),
                        ),
                        const Icon(Icons.schedule,
                            size: 11, color: Color(0xE6FFFFFF)),
                        const SizedBox(width: 4),
                        Text('$minutes mins',
                            style: AppTextStyles.caption
                                .copyWith(color: const Color(0xE6FFFFFF))),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                ),
              ),
              // How far in you are, pinned to the card's bottom edge.
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  height: 4,
                  color: Colors.white.withValues(alpha: 0.25),
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: progress,
                    child: Container(color: const Color(0xFFFF881B)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Explore's Quick Start card — a 160 square with a small Create pill, not
/// Home's wider card with a play button on it. The two screens deliberately
/// show the same seven prompts in different shapes, so this is its own widget
/// rather than a variant flag on the Home one.
class _ExploreQuickStartCard extends StatelessWidget {
  const _ExploreQuickStartCard({
    required this.title,
    required this.subtitle,
    required this.photo,
    required this.gradient,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final String photo;
  final List<Color> gradient;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 160,
        height: 160,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CoverImage(
                photo: photo,
                gradient: gradient,
                width: 320,
                height: 320,
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 24,
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.s2),
                      decoration: BoxDecoration(
                        color: AppColors.surface.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      // Center with widthFactor 1, not Container.alignment:
                      // an alignment on the Container makes it take the whole
                      // width it is offered, and the pill has to hug its word.
                      child: Center(
                        widthFactor: 1,
                        child: Text('Create', style: AppTextStyles.caption),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.bodySm.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textInverse,
                          ),
                        ),
                        Text(
                          subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption
                              .copyWith(color: const Color(0xE6FFFFFF)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
