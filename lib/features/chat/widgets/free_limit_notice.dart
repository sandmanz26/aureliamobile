import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Figma "Free Limit" — what the cockpit says when you have used up the free
/// plan's creations.
///
/// It sits above the composer rather than in the thread, because it is not
/// something Aurelia said: it is the product speaking about itself. Putting it
/// in the transcript would make the limit look like part of the conversation,
/// and it would scroll away.
///
/// Two ways out, and the order is the point. **New Session** is first and
/// solid because it costs nothing and is what most people want; **Upgrade** is
/// second and outlined because the screen is already interrupting them and a
/// filled paywall button on top of that reads as a toll gate.
class FreeLimitNotice extends StatelessWidget {
  const FreeLimitNotice({
    super.key,
    required this.resetAt,
    required this.onNewSession,
    required this.onUpgrade,
  });

  /// When the allowance comes back, already formatted — "9:55 PM".
  final String resetAt;
  final VoidCallback onNewSession;
  final VoidCallback onUpgrade;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppPadding.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0D000000),
              blurRadius: 24,
              spreadRadius: 4,
              offset: Offset(0, 5)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 20,
                height: 20,
                margin: const EdgeInsets.only(top: 1),
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFF5A623),
                ),
                child: const Icon(Icons.priority_high,
                    size: 13, color: AppColors.textInverse),
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Session paused until $resetAt',
                        style: const TextStyle(
                            fontSize: 14,
                            height: 19 / 14,
                            color: AppColors.textPrimary)),
                    const SizedBox(height: 4),
                    Text(
                        'You’ve reached your current creation limit. You can '
                        'continue creating when your usage resets at $resetAt, '
                        'or upgrade to keep going now.',
                        style: const TextStyle(
                            fontSize: 12,
                            height: 18 / 12,
                            fontWeight: FontWeight.w300,
                            color: Color(0xFF525252))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 44,
                  child: ElevatedButton(
                    onPressed: onNewSession,
                    child: const Text('New Session'),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: SizedBox(
                  height: 44,
                  child: OutlinedButton.icon(
                    onPressed: onUpgrade,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFD6D6D6)),
                      foregroundColor: AppColors.textPrimary,
                    ),
                    icon: const Icon(Icons.auto_awesome,
                        size: 16, color: Color(0xFFFF881B)),
                    label: const Text('Upgrade'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
