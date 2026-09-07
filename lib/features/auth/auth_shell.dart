import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';

/// The frame every account screen shares: back arrow, a header slot, the mark.
/// Four screens use it, so the chrome is defined once and a change to it cannot
/// leave one of them looking different from the rest.
class AuthShell extends StatelessWidget {
  const AuthShell({super.key, required this.header, required this.children});

  /// Sits where the Sign In / Sign Up tabs do — tabs, or a plain title.
  final Widget header;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.lg, AppSpacing.s4, AppPadding.lg, AppSpacing.s10),
          children: [
            SizedBox(
              height: 44,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: CircleSurfaceButton(
                      icon: Icons.arrow_back,
                      tooltip: 'Back',
                      size: 44,
                      onPressed: () {
                        final navigator = Navigator.of(context);
                        if (navigator.canPop()) {
                          navigator.pop();
                        } else {
                          navigator.pushReplacementNamed('/home');
                        }
                      },
                    ),
                  ),
                  header,
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s10),
            const Center(child: AureliaLogo()),
            const SizedBox(height: AppSpacing.s10),
            ...children,
          ],
        ),
      ),
    );
  }
}

/// Shared between Sign In and Sign Up, which are one control in two places.
class AuthTabs extends StatelessWidget {
  const AuthTabs({super.key, required this.signInSelected});

  final bool signInSelected;

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
          _Segment(
            label: 'Sign In',
            selected: signInSelected,
            onTap: () {
              if (signInSelected) return;
              Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
          _Segment(
            label: 'Sign Up',
            selected: !signInSelected,
            onTap: () {
              if (!signInSelected) return;
              Navigator.of(context).pushReplacementNamed('/signup');
            },
          ),
        ],
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s5, vertical: AppSpacing.s2),
        decoration: BoxDecoration(
          color: selected ? AppColors.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Text(
          label,
          style: AppTextStyles.label.copyWith(
            color: selected ? AppColors.textStrong : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

/// "Or continue using" rule plus the two social buttons, identical on both forms.
class SocialSignIn extends StatelessWidget {
  const SocialSignIn({super.key, required this.onUse});

  final VoidCallback onUse;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: AppSpacing.s6),
        Row(
          children: [
            const Expanded(child: Divider()),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
              child: Text('Or continue using', style: AppTextStyles.bodySm),
            ),
            const Expanded(child: Divider()),
          ],
        ),
        const SizedBox(height: AppSpacing.s6),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: onUse,
                child: const GoogleMark(),
              ),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: OutlinedButton(
                onPressed: onUse,
                child: const Icon(Icons.apple, size: 22, color: AppColors.iconDefault),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
