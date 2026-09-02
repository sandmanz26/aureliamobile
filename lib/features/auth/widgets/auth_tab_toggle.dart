import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

enum AuthTab { signIn, signUp }

/// The "Sign In / Sign Up" segmented control at the top of the auth screen.
class AuthTabToggle extends StatelessWidget {
  const AuthTabToggle({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final AuthTab selected;
  final ValueChanged<AuthTab> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s1),
      decoration: BoxDecoration(
        color: AppColors.backgroundElevated,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _TabSegment(
            label: 'Sign In',
            isSelected: selected == AuthTab.signIn,
            onTap: () => onChanged(AuthTab.signIn),
          ),
          _TabSegment(
            label: 'Sign Up',
            isSelected: selected == AuthTab.signUp,
            onTap: () => onChanged(AuthTab.signUp),
          ),
        ],
      ),
    );
  }
}

class _TabSegment extends StatelessWidget {
  const _TabSegment({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.s5,
          vertical: AppSpacing.s2,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Text(
          label,
          style: AppTextStyles.label.copyWith(
            color: isSelected ? AppColors.textStrong : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
