import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/session_grid_card.dart';
import '../../core/widgets/community_network.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/section_header.dart';
import '../chat/chat_screen.dart' show ChatArgs;
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

  /// "All" plus every category, with its library count — built from the
  /// catalogue rather than typed out, so a chip cannot name a category that
  /// does not exist.
  static final _chips = <String>[
    kAllCategories,
    for (final category in kCategories) category.label,
  ];

  /// The category a chip stands for; null for "All".
  static String? _categoryFor(String chip) {
    for (final category in kCategories) {
      if (category.label == chip) return category.name;
    }
    return null;
  }

  /// What the community rail shows under the active chip.
  List<SessionRecord> get _communitySessions =>
      sessionsInCategory(_categoryFor(_chip) ?? kAllCategories);

  /// A one-tap way in for each of the things Aurelia actually makes, so the
  /// rail doubles as the answer to "what can I even ask for?".
  static const _quickStart = [
    ('Affirmations', 'Personalized exprience.', 'affirmations',
        [AppPrimitives.danger400, AppPrimitives.warning300]),
    ('Guided Breath Work', 'Personalized exprience.', 'breathwork',
        [AppPrimitives.neutral700, AppPrimitives.neutral400]),
    ('Sleep Meditation', 'Wind down for the night.', 'sleep',
        [AppPrimitives.info950, AppPrimitives.info600]),
    ('Focus Sound', 'Stay with one thing.', 'rain',
        [AppPrimitives.neutral800, AppPrimitives.info500]),
    ('Morning Reset', 'Start the day settled.', 'morning',
        [AppPrimitives.warning700, AppPrimitives.warning300]),
    ('Stress Relief', 'Come down a notch.', 'stress',
        [AppPrimitives.success900, AppPrimitives.success500]),
    ('Deep Calm', 'Nothing asked of you.', 'calm',
        [AppPrimitives.info900, AppPrimitives.neutral950]),
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

  /// The mic means "talk to Aurelia", so it should land on a live mic rather
  /// than an idle composer.
  void _gateVoice() => _gate('/chat', arguments: const ChatArgs(startVoice: true));

  @override
  Widget build(BuildContext context) {
    final signedIn = AuthScope.of(context).signedIn;

    return Scaffold(
      drawer: const AppDrawer(current: '/home'),
      body: ColoredBox(
        color: Colors.white,
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(bottom: AppSpacing.s12),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppPadding.page, AppPadding.md, AppPadding.page, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Builder(
                      builder: (context) => CircleSurfaceButton(
                        icon: Icons.menu,
                        tooltip: 'Open menu',
                        size: 44,
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    if (signedIn)
                      const CoinPill()
                    else
                      // A visitor has no coin balance — offer the account
                      // instead, in the pill the balance would have occupied.
                      // It carries the same shadow: the header is white, so
                      // without one the pill reads as bare text.
                      GestureDetector(
                        onTap: () => _gate('/home'),
                        child: Container(
                          height: 44,
                          alignment: Alignment.center,
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.s5),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius:
                                BorderRadius.circular(AppRadius.full),
                            boxShadow: const [
                              BoxShadow(
                                  color: Color(0x14000000),
                                  blurRadius: 8,
                                  offset: Offset(0, 2)),
                            ],
                          ),
                          child: Text('Sign in', style: AppTextStyles.label),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s6),

              // The warm wash is the opening act — hero, live sessions and
              // quick start — and it ends where the dark banner begins, so
              // everything past the banner sits on plain white, as on the web.
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0xFFFFFDF6),
                      Color(0xFFFFF1DB),
                      Color(0xFFFFF9EF),
                    ],
                    stops: [0, 0.55, 1],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                  // Hero — the prompt is the product, so it comes first.
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                    child: Column(
                      children: [
                        const AureliaLogo(iconSize: 64, markOnly: true),
                        const SizedBox(height: AppSpacing.s5),
                        Text.rich(
                          TextSpan(children: [
                            const TextSpan(text: 'Create the '),
                            TextSpan(
                              text: 'space',
                              style: TextStyle(
                                fontStyle: FontStyle.italic,
                                color: const Color(0xFFE9A93A),
                              ),
                            ),
                            const TextSpan(text: ' you imagine.'),
                          ]),
                          textAlign: TextAlign.center,
                          style: AppTextStyles.headlineMd.copyWith(fontSize: 28, height: 1.25),
                        ),
                        const SizedBox(height: AppSpacing.s6),
                        _AskAureliaField(
                          // An empty send still opens chat — nothing to carry, but
                          // the tap plainly meant "take me there".
                          onSubmit: (text) => _gate('/chat',
                              arguments: text.isEmpty ? null : ChatArgs(ask: text)),
                          onVoice: _gateVoice,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.s10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                    // Body weight, not a section title: on the web this one
                    // heading is set smaller than the others on purpose, so
                    // the live card below it carries the section.
                    child: Text(
                      'Ongoing Live Sessions',
                      style: AppTextStyles.bodyMd
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: AppPadding.page),
                    child: LiveSessionsCard(),
                  ),

                  const SizedBox(height: AppSpacing.s10),
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
                  ],
                ),
              ),
              _GenerativeWellnessBanner(onStart: () => _gate('/chat')),

              const SizedBox(height: AppSpacing.s12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: SectionHeader(title: 'Recreate from Community'),
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
              SizedBox(
                height: 303,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  itemCount: _communitySessions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s3),
                  itemBuilder: (context, index) {
                    final session = _communitySessions[index];
                    // The same card the See All grid uses, so the two cannot
                    // drift apart the way a separate community card did.
                    return SizedBox(
                      width: 228,
                      child: SessionGridCard(
                        session: session,
                        aspectRatio: 228 / 303,
                        onOpen: () => _gate('/session', arguments: session.slug),
                        onRecreate: () => _gate('/recreate', arguments: session.slug),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.s12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
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

              // Closing CTA. The network sits above the card and bleeds to
              // both page edges — it is the argument the card then states in
              // words, so it is wider than the content column on purpose.
              const SizedBox(height: AppSpacing.s12),
              LayoutBuilder(
                builder: (context, constraints) {
                  final drawing =
                      constraints.maxWidth / CommunityNetwork.aspectRatio;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // The card overlaps the foot of the drawing, the way
                      // `-mb-24` does on the web: the box is short by that
                      // much and the painting spills past it.
                      SizedBox(
                        height: drawing - AppSpacing.s6,
                        child: const OverflowBox(
                          alignment: Alignment.topCenter,
                          maxHeight: double.infinity,
                          child: CommunityNetwork(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                        child: Container(
                          key: const ValueKey('home-cta'),
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppPadding.page, vertical: AppSpacing.s10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(AppRadius.xl2),
                            gradient: const LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF3C2405), Color(0xFFFF881B)],
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(
                                'Casual Intelligence for Global Community',
                                textAlign: TextAlign.center,
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
                              OutlinedButton(
                                onPressed: () => _gate('/chat'),
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: Colors.white.withValues(alpha: 0.12),
                                  foregroundColor: AppColors.textInverse,
                                  side: BorderSide(
                                      color: Colors.white.withValues(alpha: 0.35)),
                                  minimumSize: const Size(0, 52),
                                  padding: const EdgeInsets.symmetric(horizontal: 28),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(AppRadius.full),
                                  ),
                                ),
                                child: const Text('Get Started'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
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
/// A composer, not a search field: sized for a sentence about how you want to
/// feel, with the actions under what you typed rather than crowding the end of
/// the line.
///
/// A visitor can type here without an account. The ask lands on send, not on
/// the first keystroke: someone who has just written what they want is far
/// likelier to finish signing up than someone stopped before saying anything,
/// and what they typed travels with them so it never has to be written twice.
class _AskAureliaField extends StatefulWidget {
  const _AskAureliaField({required this.onSubmit, required this.onVoice});

  final ValueChanged<String> onSubmit;
  final VoidCallback onVoice;

  @override
  State<_AskAureliaField> createState() => _AskAureliaFieldState();
}

class _AskAureliaFieldState extends State<_AskAureliaField> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() => widget.onSubmit(_controller.text.trim());

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.s4, AppSpacing.s4 - 2, AppSpacing.s4, 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: const Color(0xFFEFA63C), width: 1.5),
        borderRadius: BorderRadius.circular(AppRadius.xl2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _controller,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => _submit(),
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.textPrimary),
            decoration: InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              hintText: 'Ask Aurelia..',
              hintStyle: AppTextStyles.bodyMd,
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: widget.onVoice,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: AppColors.backgroundElevated,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.mic_none,
                      size: 17, color: AppColors.iconDefault),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: _submit,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: AppColors.iconDefault,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_upward,
                      size: 18, color: AppColors.iconInverse),
                ),
              ),
            ],
          ),
        ],
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
        width: 236,
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Glass over the photo, as the design has it.
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
                        Container(
                          height: 30,
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xE6FFFFFF),
                            borderRadius: BorderRadius.circular(AppRadius.full),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.auto_awesome,
                                  size: 13, color: AppColors.textPrimary),
                              const SizedBox(width: 6),
                              Text('Create', style: AppTextStyles.label
                                  .copyWith(color: AppColors.textPrimary)),
                            ],
                          ),
                        ),
                      ],
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
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
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
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
            child: Text(
              'Your Personal\nMindfulness Guide',
              style: AppTextStyles.headlineMd
                  .copyWith(color: AppColors.textInverse),
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
            child: Text(
              'Everything you need to reflect, restore, and reset, all in one adaptive app.',
              style: AppTextStyles.bodyLg.copyWith(color: AppColors.textInverse),
            ),
          ),
          const SizedBox(height: AppSpacing.s8),
          // The left card sits flush against the left edge of the screen with
          // all four corners visible; the pair bleeds past the *right* edge.
          // Both numbers here are derived from the card width, not eyeballed:
          // a card turned -10deg measures 1.26 times its width, so each corner
          // hangs 0.13 widths outside its box — that overhang is the left
          // padding, and it is what lets the left card sit flush to the screen
          // edge with all four corners visible. The band is 1.78 widths tall.
          // Transform.rotate does not affect layout, so the rest is clipped.
          SizedBox(
            height: promoCardWidth(context) * 1.78,
            child: ClipRect(
              child: OverflowBox(
                maxWidth: double.infinity,
                alignment: Alignment.centerLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(width: promoCardWidth(context) * 0.13),
                    Transform.rotate(
                      angle: -10 * math.pi / 180,
                      child: const _PromoCard(
                        photo: 'underwater',
                        gradient: [AppPrimitives.info900, AppPrimitives.neutral950],
                      ),
                    ),
                    const SizedBox(width: 7),
                    Transform.rotate(
                      angle: -12 * math.pi / 180,
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
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
            child: Text(
              'Chat with Aurelia to instantly create custom meditations, soundscapes, '
              'and breathwork tailored to how you feel right now.',
              style: AppTextStyles.bodySm.copyWith(color: const Color(0xCCFFFFFF)),
            ),
          ),
          const SizedBox(height: AppSpacing.s6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
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

/// The pair's one number. At a 402pt screen this lands on the Figma's 180, and
/// it stops at 280 so the cards scale without taking over a tablet.
double promoCardWidth(BuildContext context) =>
    MediaQuery.of(context).size.width.clamp(0, 622) * 0.45 < 150
        ? 150
        : (MediaQuery.of(context).size.width * 0.45).clamp(150, 280);

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.photo, required this.gradient});

  final String photo;
  final List<Color> gradient;

  @override
  Widget build(BuildContext context) {
    final width = promoCardWidth(context);
    return SizedBox(
      width: width,
      // A card is 1.589 times as tall as it is wide — 180:286.
      height: width * 286 / 180,
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
