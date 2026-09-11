import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/community_card.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/section_header.dart';
import '../shell/app_drawer.dart';

/// Home — the same screen signed in or out.
///
/// A visitor reads the whole pitch without an account. Nothing is fake-disabled:
/// every control behaves like the real thing right up to the point it needs an
/// account, and then hands the visitor to sign-in with their destination
/// remembered. The one unavoidable difference is the app bar — a visitor has no
/// coin balance, so the pill is Sign in until there is an account behind it.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
    ('Guided Breath Work', 'Personalized exprience.', 'breathwork',
        [AppPrimitives.neutral700, AppPrimitives.neutral400]),
  ];

  static const _features = [
    (Icons.trending_up, 'Mood Progress', 'Tracks baseline shifts'),
    (Icons.waves, 'Mindful Waves', 'Real-time frequency tuning'),
    (Icons.music_note_outlined, 'Adaptive Audio', 'Adaptive soundscapes'),
    (Icons.air, 'Breathwork Sync', 'Custom breathing patterns'),
    (Icons.monetization_on_outlined, 'Daily Coins', 'Earn daily rewards'),
    (Icons.groups_outlined, 'Community Mix', 'Shared Practices'),
  ];

  /// Everything account-only on this screen funnels through here, so the
  /// sign-in ask is identical wherever it is triggered from.
  void _gate(String destination, {Object? arguments}) {
    requireSignIn(
      context,
      destination: destination,
      arguments: arguments,
      then: () => Navigator.of(context).pushNamed(destination, arguments: arguments),
    );
  }

  @override
  Widget build(BuildContext context) {
    final signedIn = AuthScope.of(context).signedIn;

    return Scaffold(
      drawer: const AppDrawer(current: '/home'),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFFFFFF), Color(0xFFFFF1DB), Color(0xFFFFFFFF)],
            stops: [0, 0.6, 1],
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Builder(
                      builder: (context) => CircleSurfaceButton(
                        icon: Icons.menu,
                        tooltip: 'Open menu',
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    if (signedIn)
                      const CoinPill()
                    else
                      // A visitor has no coin balance — offer the account instead.
                      TextButton(
                        onPressed: () => _gate('/home'),
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.surface,
                          foregroundColor: AppColors.textPrimary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.full),
                          ),
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.s5, vertical: AppSpacing.s2),
                        ),
                        child: Text('Sign in', style: AppTextStyles.label),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s6),

              // Hero — the prompt is the product, so it comes first.
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: Column(
                  children: [
                    Text(
                      'Create the space you imagine.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.titleLg,
                    ),
                    const SizedBox(height: AppSpacing.s6),
                    _AskAureliaField(onTap: () => _gate('/chat')),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.s10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: SectionHeader(title: 'Ongoing Live Sessions'),
              ),
              const SizedBox(height: AppSpacing.s4),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: LiveSessionsCard(),
              ),

              const SizedBox(height: AppSpacing.s10),
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
                      onTap: () => _gate('/chat'),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s12),
              _GenerativeWellnessBanner(onStart: () => _gate('/chat')),

              const SizedBox(height: AppSpacing.s12),
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
              SizedBox(
                height: 230,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                  itemCount: sessionsOnShelf(Shelf.community).length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
                  itemBuilder: (context, index) {
                    final session = sessionsOnShelf(Shelf.community)[index];
                    return CommunityCard(
                      session: session,
                      onOpen: () => _gate('/session', arguments: session.slug),
                      onRecreate: () => _gate('/recreate', arguments: session.slug),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.s4, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundElevated,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Text('Adaptive Wellness', style: AppTextStyles.caption),
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    Text(
                      'Aurelia learns your state, and gets better with you.',
                      style: AppTextStyles.headlineMd,
                    ),
                    const SizedBox(height: AppSpacing.s3),
                    Text(
                      'The more you create, the more Aurelia understands your rhythm. '
                      'Personalized to you from day one.',
                      style: AppTextStyles.bodyMd,
                    ),
                    const SizedBox(height: AppSpacing.s6),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: AppSpacing.s3,
                      crossAxisSpacing: AppSpacing.s3,
                      childAspectRatio: 1.25,
                      children: [
                        for (final (icon, title, description) in _features)
                          _FeatureTile(icon: icon, title: title, description: description),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.s12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppPadding.lg, vertical: AppSpacing.s10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.xl2),
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF3C2405), Color(0xFFFF881B)],
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Ready to restore?',
                        style: AppTextStyles.headlineMd
                            .copyWith(color: AppColors.textInverse),
                      ),
                      const SizedBox(height: AppSpacing.s2),
                      Text(
                        'Free to start, no credit card required!',
                        style: AppTextStyles.bodySm
                            .copyWith(color: const Color(0xE6FFFFFF)),
                      ),
                      const SizedBox(height: AppSpacing.s6),
                      ElevatedButton.icon(
                        onPressed: () => _gate('/chat'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.surface,
                          foregroundColor: AppColors.textPrimary,
                          minimumSize: const Size(0, 52),
                        ),
                        icon: const Icon(Icons.repeat, size: 16),
                        label: const Text('Get Started'),
                      ),
                    ],
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

/// The prompt field. Tapping it is the moment a visitor commits, so that is
/// where the sign-in ask lands — not on page load.
class _AskAureliaField extends StatelessWidget {
  const _AskAureliaField({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Row(
          children: [
            Expanded(child: Text('Ask Aurelia..', style: AppTextStyles.bodyMd)),
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.backgroundElevated,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.mic_none, size: 16, color: AppColors.iconDefault),
            ),
            const SizedBox(width: AppSpacing.s2),
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.iconDefault,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_upward, size: 16, color: AppColors.iconInverse),
            ),
          ],
        ),
      ),
    );
  }
}

/// The world-map activity card. The map itself is an exported asset on web; on
/// mobile it is drawn as a warm gradient until that asset is added to the
/// bundle, with the three counters in the same place either way.
class LiveSessionsCard extends StatelessWidget {
  const LiveSessionsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 362 / 320,
      child: Container(
        padding: const EdgeInsets.fromLTRB(
            AppPadding.md, AppSpacing.s10, AppPadding.md, AppPadding.md),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.xl2),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFFE1A8), Color(0xFFFF9A1F)],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Row(
              children: [
                for (final (value, label) in [('87k', 'People'), ('20k', 'Today'), ('50', 'Now')])
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s3),
                      decoration: BoxDecoration(
                        color: const Color(0x40FFFFFF),
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                      ),
                      child: Column(
                        children: [
                          Text(value,
                              style: AppTextStyles.titleLg
                                  .copyWith(color: AppColors.textInverse)),
                          Text(label,
                              style: AppTextStyles.caption
                                  .copyWith(color: AppColors.textInverse)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class QuickStartCard extends StatelessWidget {
  const QuickStartCard({
    super.key,
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
            children: [
              CoverImage(photo: photo, gradient: gradient, width: 320, height: 320),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s2, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xE6FFFFFF),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Text('Create', style: AppTextStyles.caption
                          .copyWith(color: AppColors.textPrimary)),
                    ),
                    const Spacer(),
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textInverse,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.caption.copyWith(color: const Color(0xE6FFFFFF)),
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

class _GenerativeWellnessBanner extends StatelessWidget {
  const _GenerativeWellnessBanner({required this.onStart});

  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFF1B1006),
      // Only vertical padding here: the card pair below has to reach the
      // screen edges, so the horizontal inset is applied per child instead.
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
            child: Container(
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s3, vertical: AppSpacing.s2),
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0x8CFF881B)),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
              ).createShader(bounds),
              child: Text(
                'Generative Wellness Care',
                style: AppTextStyles.label.copyWith(color: AppColors.textInverse),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.s6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
            child: Text(
              'Your Personal\nMindfulness Guide',
              style: AppTextStyles.headlineLg.copyWith(
                color: AppColors.textInverse,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
            child: Text(
              'Everything you need to reflect, restore, and reset, all in one adaptive app.',
              style: AppTextStyles.bodyLg.copyWith(color: AppColors.textInverse),
            ),
          ),
          const SizedBox(height: AppSpacing.s8),
          // The left card sits flush against the left edge of the screen with
          // all four corners visible; the pair bleeds past the *right* edge.
          // The 24 of left padding is tied to the rotation, not eyeballed: at
          // -10deg a 180x286 card measures 227 across once turned, putting its
          // corner 23.5 left of its layout box. Transform.rotate does not
          // affect layout, so the overflow is clipped rather than laid out.
          SizedBox(
            height: 300,
            child: ClipRect(
              child: OverflowBox(
                maxWidth: double.infinity,
                alignment: Alignment.centerLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(width: 24),
                    Transform.rotate(
                      angle: -10 * math.pi / 180,
                      child: const _PromoCard(
                        photo: 'underwater',
                        gradient: [AppPrimitives.info900, AppPrimitives.neutral950],
                      ),
                    ),
                    const SizedBox(width: 7),
                    Transform.rotate(
                      angle: 12 * math.pi / 180,
                      child: const _PromoCard(
                        photo: 'glow',
                        gradient: [Color(0xFFFFD9A8), Color(0xFFF97B14)],
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
            child: Text(
              'Chat with Aurelia to instantly create custom meditations, soundscapes, '
              'and breathwork tailored to how you feel right now.',
              style: AppTextStyles.bodySm.copyWith(color: const Color(0xCCFFFFFF)),
            ),
          ),
          const SizedBox(height: AppSpacing.s6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
            child: OutlinedButton.icon(
              onPressed: onStart,
              style: OutlinedButton.styleFrom(
                backgroundColor: const Color(0x14FFFFFF),
                foregroundColor: AppColors.textInverse,
                side: const BorderSide(color: Color(0x33FFFFFF)),
                minimumSize: const Size(0, 52),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
              ),
              icon: const Text('Start your Journey'),
              label: const Icon(Icons.arrow_forward, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.photo, required this.gradient});

  final String photo;
  final List<Color> gradient;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 180,
      height: 286,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.xl2),
        child: Stack(
          alignment: Alignment.center,
          children: [
            CoverImage(
              photo: photo,
              gradient: gradient,
              width: 360,
              height: 572,
              scrim: false,
            ),
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Color(0x40FFFFFF),
                shape: BoxShape.circle,
              ),
              // Drawn rather than Material's icon so it matches the web glyph
              // exactly. Points right: this is a play control.
              child: CustomPaint(size: const Size(13, 18), painter: _PlayTrianglePainter()),
            ),
          ],
        ),
      ),
    );
  }
}

/// The play triangle inside each promo card's button.
class _PlayTrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = const Color(0xF2FFFFFF));
  }

  @override
  bool shouldRepaint(covariant _PlayTrianglePainter oldDelegate) => false;
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppPadding.md),
      decoration: BoxDecoration(
        color: AppColors.backgroundElevated,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              color: AppPrimitives.primary200,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: AppColors.iconDefault),
          ),
          const Spacer(),
          Text(title, style: AppTextStyles.label),
          const SizedBox(height: 2),
          Text(
            description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }
}
