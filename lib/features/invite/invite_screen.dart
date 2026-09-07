import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/photo_circle.dart';
import '../shell/app_drawer.dart';

/// Invite a Friend.
///
/// The referral link is the whole screen — everything above it exists to explain
/// why to send it. So the field is wide, the URL is fully visible, and copying
/// is one tap with a state change that proves it worked.
class InviteScreen extends StatefulWidget {
  const InviteScreen({super.key});

  @override
  State<InviteScreen> createState() => _InviteScreenState();
}

class _InviteScreenState extends State<InviteScreen> {
  static const _reward = 500;

  // A per-user code has to be here in production, or two people's invites are
  // indistinguishable and neither can be credited. Shown plain for the demo.
  static const _inviteLink = 'https://www.aurelia.ai/inviteafriend';

  bool _copied = false;

  Future<void> _copy() async {
    await Clipboard.setData(const ClipboardData(text: _inviteLink));
    if (!mounted) return;
    setState(() => _copied = true);
    // The confirmation is temporary — a button stuck on "Copied" stops reading
    // as a button you can press again.
    await Future<void>.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/invite'),
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
                  Expanded(child: Text('Invite a Friend', style: AppTextStyles.titleLg)),
                  const CoinPill(),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: _InviteConstellation(reward: _reward),
            ),
            const SizedBox(height: AppSpacing.s10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: Column(
                children: [
                  Text('Invite Friends, Get Points!',
                      textAlign: TextAlign.center, style: AppTextStyles.titleLg),
                  const SizedBox(height: AppSpacing.s3),
                  Text(
                    'Share the link below with a friend. When they sign up, '
                    'you both get $_reward credits!',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMd,
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Container(
                    height: 56,
                    padding: const EdgeInsets.fromLTRB(AppSpacing.s5, 0, AppSpacing.s3, 0),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      border: Border.all(color: AppPrimitives.warning300),
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _inviteLink,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.bodyMd,
                          ),
                        ),
                        GestureDetector(
                          onTap: _copy,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _copied ? AppColors.feedbackSuccess : null,
                              gradient: _copied
                                  ? null
                                  : const LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [Color(0xFFFFA83B), Color(0xFFF2801A)],
                                    ),
                            ),
                            child: Icon(_copied ? Icons.check : Icons.copy,
                                size: 18, color: AppColors.iconInverse),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  AnimatedOpacity(
                    opacity: _copied ? 1 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Text(
                      'Link copied — paste it anywhere.',
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.feedbackSuccess),
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

/// The dashed orbits, glow and avatars. Decorative, so it carries no semantics.
class _InviteConstellation extends StatelessWidget {
  const _InviteConstellation({required this.reward});

  final int reward;

  /// Orbiting friends, placed as fractions of the illustration box.
  static const _orbit = [
    ('creatorSophia', 66.0, 0.28, 0.13),
    ('creatorDaniel', 52.0, 0.07, 0.44),
    ('creatorMaya', 60.0, 0.89, 0.58),
    ('creatorEthan', 56.0, 0.52, 0.83),
  ];

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 320),
        child: AspectRatio(
          aspectRatio: 1,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final box = constraints.maxWidth;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  // Warm centre glow the rings sit in.
                  Positioned.fill(
                    child: Padding(
                      padding: EdgeInsets.all(box * 0.14),
                      child: const DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [Color(0x8CFFB74D), Color(0x14FFD68C)],
                            stops: [0, 0.7],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned.fill(
                    child: Padding(
                      padding: EdgeInsets.all(box * 0.06),
                      child: CustomPaint(painter: _DashedCirclePainter()),
                    ),
                  ),
                  Positioned.fill(
                    child: Padding(
                      padding: EdgeInsets.all(box * 0.24),
                      child: CustomPaint(painter: _DashedCirclePainter()),
                    ),
                  ),

                  // You, in the middle, with what an invite is worth.
                  Align(
                    alignment: Alignment.center,
                    child: Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppColors.surface,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                  color: Color(0x1F000000),
                                  blurRadius: 16,
                                  offset: Offset(0, 6)),
                            ],
                          ),
                          child: const PhotoCircle(
                            photo: 'avatar',
                            size: 132,
                            gradient: [
                              AppPrimitives.warning500,
                              AppPrimitives.neutral700,
                            ],
                          ),
                        ),
                        Positioned(
                          top: -6,
                          left: box * 0.16,
                          child: Container(
                            height: 32,
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(AppRadius.full),
                              boxShadow: const [
                                BoxShadow(
                                    color: Color(0x1F000000),
                                    blurRadius: 10,
                                    offset: Offset(0, 3)),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 16,
                                  height: 16,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: LinearGradient(
                                      colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
                                    ),
                                  ),
                                  child: const Icon(Icons.monetization_on_outlined,
                                      size: 10, color: AppColors.textInverse),
                                ),
                                const SizedBox(width: 6),
                                Text('+$reward', style: AppTextStyles.label),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  for (final (photo, size, left, top) in _orbit)
                    Positioned(
                      left: box * left - size / 2 - 4,
                      top: box * top - size / 2 - 4,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.surface,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                                color: Color(0x1A000000),
                                blurRadius: 10,
                                offset: Offset(0, 4)),
                          ],
                        ),
                        child: PhotoCircle(
                          photo: photo,
                          size: size,
                          gradient: const [
                            AppPrimitives.primary300,
                            AppPrimitives.warning400,
                          ],
                        ),
                      ),
                    ),

                  // Two markers that say this spreads by place and by conversation.
                  _Marker(icon: Icons.place, left: box * 0.77, top: box * 0.14),
                  _Marker(icon: Icons.chat_bubble, left: box * 0.15, top: box * 0.75),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _Marker extends StatelessWidget {
  const _Marker({required this.icon, required this.left, required this.top});

  final IconData icon;
  final double left;
  final double top;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: left - 14,
      top: top - 14,
      child: Container(
        width: 28,
        height: 28,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFFA83B), Color(0xFFF2801A)],
          ),
        ),
        child: Icon(icon, size: 15, color: AppColors.iconInverse),
      ),
    );
  }
}

class _DashedCirclePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = AppPrimitives.warning300;

    final radius = size.width / 2;
    final centre = Offset(radius, radius);
    // 4px dash, 6px gap, walked round the circumference.
    const dash = 4.0;
    const gap = 6.0;
    final circumference = 2 * 3.141592653589793 * radius;
    final steps = (circumference / (dash + gap)).floor();
    for (var i = 0; i < steps; i++) {
      final start = i * (dash + gap) / radius;
      canvas.drawArc(
        Rect.fromCircle(center: centre, radius: radius),
        start,
        dash / radius,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _DashedCirclePainter oldDelegate) => false;
}
