import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/community_card.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../../core/widgets/section_header.dart';
import '../home/home_screen.dart' show LiveSessionsCard, QuickStartCard;
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
  String _chip = 'All';

  static const _chips = [
    'All',
    'Meditations (12.5k)',
    'Music (8.3k)',
    'Energy (3.1k)',
    'Sleep (13.4k)',
    'Calm (22.3k)',
  ];

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
    ('6 of 30', 'Your day'),
    ('12.4k', 'Joined'),
    ('8 min', 'Per day'),
  ];

  Widget _shelf(Shelf shelf) {
    final sessions = sessionsOnShelf(shelf);
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
        itemCount: sessions.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
        itemBuilder: (context, index) => CommunityCard(
          session: sessions[index],
          onOpen: () =>
              Navigator.of(context).pushNamed('/session', arguments: sessions[index].slug),
          onRecreate: () =>
              Navigator.of(context).pushNamed('/recreate', arguments: sessions[index].slug),
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
                    AppPadding.md, AppPadding.md, AppPadding.md, 0),
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
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s5),

              // The one thing the app wants you to press today.
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
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
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Quick Start'),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 160,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                  itemCount: _quickStart.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
                  itemBuilder: (context, index) {
                    final (title, subtitle, photo, gradient) = _quickStart[index];
                    return QuickStartCard(
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
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Ongoing Live Sessions'),
              ),
              const SizedBox(height: AppSpacing.s4),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: LiveSessionsCard(),
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Recreate from Community'),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
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
              _shelf(Shelf.community),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Trusted Creators'),
              ),
              const SizedBox(height: AppSpacing.s4),
              SizedBox(
                height: 116,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
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
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Monthly Challenge!'),
              ),
              const SizedBox(height: AppSpacing.s4),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: AspectRatio(
                  aspectRatio: 362 / 240,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.xl2),
                    child: Stack(
                      children: [
                        const CoverImage(
                          photo: 'mindDance',
                          gradient: [AppPrimitives.neutral950, AppPrimitives.neutral700],
                          width: 760,
                          height: 520,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(AppPadding.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Align(
                                alignment: Alignment.topRight,
                                child: Material(
                                  color: const Color(0xE6FFFFFF),
                                  borderRadius: BorderRadius.circular(AppRadius.full),
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(AppRadius.full),
                                    onTap: () =>
                                        Navigator.of(context).pushNamed('/wellness'),
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
                              Row(
                                children: [
                                  for (final (value, label) in _challengeStats)
                                    Expanded(
                                      child: Container(
                                        margin: const EdgeInsets.only(right: AppSpacing.s2),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: AppSpacing.s2),
                                        decoration: BoxDecoration(
                                          color: const Color(0x33FFFFFF),
                                          borderRadius: BorderRadius.circular(AppRadius.lg),
                                        ),
                                        child: Column(
                                          children: [
                                            Text(value,
                                                style: AppTextStyles.label.copyWith(
                                                    color: AppColors.textInverse)),
                                            Text(label,
                                                style: AppTextStyles.caption.copyWith(
                                                    color: const Color(0xCCFFFFFF))),
                                          ],
                                        ),
                                      ),
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
              ),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(
                  title: 'Picked for You',
                  onSeeAll: () => Navigator.of(context).pushNamed('/explore'),
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              _shelf(Shelf.picked),

              const SizedBox(height: AppSpacing.s8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(
                  title: 'Sessions with Biggest Impact',
                  onSeeAll: () => Navigator.of(context).pushNamed('/explore'),
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
