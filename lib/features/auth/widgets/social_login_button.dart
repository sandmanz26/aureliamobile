import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Outlined pill button used for "continue with Google/Apple".
class SocialLoginButton extends StatelessWidget {
  const SocialLoginButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.label,
  });

  final Widget icon;
  final VoidCallback onPressed;
  final String? label;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: AppPadding.md),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon,
          if (label != null) ...[
            const SizedBox(width: AppSpacing.s2),
            Text(label!, style: TextStyle(color: AppColors.buttonSecondaryForeground)),
          ],
        ],
      ),
    );
  }
}
