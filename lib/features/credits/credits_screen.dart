import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/data/credits.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';

/// The card shadow every surface in this design shares (Figma effect 16520:822).
const _cardShadow = [
  BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 24,
      spreadRadius: 4,
      offset: Offset(0, 5)),
];

const _muted = Color(0xFF525252);
const _rule = Color(0xFFF0F0F0);

/// Figma "Profile/Credits" (16658:29260) — where the coin balance goes.
///
/// The balance is drawn on ten screens and, until now, led nowhere from any of
/// them. It is the third frame of the `Profile` section (16659:41283), which
/// also carries Profile and Profile/Settings — and the prototype proves the
/// link: the coin pill in the Settings header transitions to this frame.
///
/// Three cards on a 20 gutter, 20 apart, 24 top and bottom, each radius 20
/// with the shared shadow. No coin pill in this header — the frame hides its
/// own Trailing, which is right: the balance is the subject of the screen, so
/// repeating it in the chrome would state it twice.
class CreditsScreen extends StatefulWidget {
  const CreditsScreen({super.key});

  @override
  State<CreditsScreen> createState() => _CreditsScreenState();
}

class _CreditsScreenState extends State<CreditsScreen> {
  bool _copied = false;

  Future<void> _copy() async {
    await Clipboard.setData(const ClipboardData(text: kInviteLink));
    if (!mounted) return;
    setState(() => _copied = true);
    await Future<void>.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 20 across, 12 down, 20 between the back button and the title.
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppPadding.page, vertical: AppSpacing.s3),
              child: Row(
                children: [
                  CircleSurfaceButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Back',
                    size: 44,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: AppPadding.page),
                  Expanded(
                    child: Text('Credits',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.titleLg),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppPadding.page, vertical: AppSpacing.s6),
                children: [
                  // Total — the label growing and the figure held right.
                  _Card(
                    child: Row(
                      children: [
                        Expanded(
                            child: Text('Total Credits',
                                style: AppTextStyles.bodyLg)),
                        const CoinMark(size: 32),
                        const SizedBox(width: AppSpacing.s3),
                        // 24 Medium in the frame. The library has no 24 Medium
                        // style — it has Title Large at Semibold and Title
                        // Large Regular — so this is written out rather than
                        // bent onto the nearest one.
                        const Text(kTotalCredits,
                            style: TextStyle(
                                fontSize: 24,
                                height: 28 / 24,
                                fontWeight: FontWeight.w500,
                                color: AppColors.textPrimary)),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppPadding.page),

                  // Invite — the only thing on this screen that earns credits.
                  _Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text('Invite Friends, Get Credits!',
                            style: AppTextStyles.bodyLg),
                        const SizedBox(height: AppSpacing.s2),
                        const Text(
                            'Share the link below with a friend. When they sign '
                            'up, you both get $kInviteReward credits!',
                            style: TextStyle(
                                fontSize: 14,
                                height: 21 / 14,
                                fontWeight: FontWeight.w300,
                                color: _muted)),
                        const SizedBox(height: AppPadding.page),
                        // The frame draws this as a pill with a *gradient*
                        // hairline — the same brand gradient as the coin, at
                        // half a pixel. A border cannot take a gradient, so it
                        // is a padded gradient background with the white field
                        // inset over it.
                        Container(
                          padding: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            borderRadius:
                                BorderRadius.circular(AppRadius.full),
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFFFF8514), Color(0xFFFFE270)],
                            ),
                          ),
                          child: Container(
                            height: 42,
                            padding: const EdgeInsets.only(
                                left: AppPadding.md, right: AppSpacing.s3),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius:
                                  BorderRadius.circular(AppRadius.full),
                            ),
                            child: Row(
                              children: [
                                const Expanded(
                                  child: Text(kInviteLink,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                          fontSize: 14,
                                          height: 19 / 14,
                                          fontWeight: FontWeight.w300,
                                          color: Color(0xFF626262))),
                                ),
                                const SizedBox(width: 14),
                                IconButton(
                                  onPressed: _copy,
                                  tooltip: _copied
                                      ? 'Link copied'
                                      : 'Copy referral link',
                                  iconSize: 16,
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints.tightFor(
                                      width: 32, height: 32),
                                  color: _copied
                                      ? AppColors.feedbackSuccess
                                      : AppColors.iconDefault,
                                  icon: Icon(_copied
                                      ? Icons.check
                                      : Icons.copy_rounded),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppPadding.page),

                  // History — the card grows to the list rather than scrolling
                  // inside it.
                  _Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text('History', style: AppTextStyles.bodyLg),
                        for (var i = 0; i < kCreditHistory.length; i++) ...[
                          if (i > 0)
                            const Padding(
                              padding: EdgeInsets.symmetric(
                                  vertical: AppSpacing.s2),
                              child: Divider(height: 1, color: _rule),
                            )
                          else
                            const SizedBox(height: AppSpacing.s2),
                          _HistoryRow(entry: kCreditHistory[i]),
                        ],
                      ],
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

class _Card extends StatelessWidget {
  const _Card({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppPadding.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: _cardShadow,
      ),
      child: child,
    );
  }
}

class _HistoryRow extends StatelessWidget {
  const _HistoryRow({required this.entry});

  final CreditEntry entry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                // Underlined and Regular where the rest of the line is Light —
                // the frame marks the person as the subject of the sentence
                // rather than giving them a colour.
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(
                      text: entry.who,
                      style: const TextStyle(
                          fontWeight: FontWeight.w400,
                          decoration: TextDecoration.underline),
                    ),
                    TextSpan(text: ' ${entry.what}'),
                  ]),
                  style: const TextStyle(
                      fontSize: 14,
                      height: 19 / 14,
                      fontWeight: FontWeight.w300,
                      color: AppColors.textPrimary),
                ),
              ),
              const SizedBox(width: 7),
              Text(entry.age,
                  style: const TextStyle(
                      fontSize: 14,
                      height: 18 / 14,
                      fontWeight: FontWeight.w300,
                      color: AppColors.textSecondary)),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          Row(
            children: [
              const CoinMark(size: 20),
              const SizedBox(width: 3),
              Text('+${entry.amount}',
                  style: const TextStyle(
                      fontSize: 14,
                      height: 18 / 14,
                      color: AppColors.textPrimary)),
            ],
          ),
        ],
      ),
    );
  }
}
