import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/auth/sso.dart';
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
              AppPadding.page, AppSpacing.s4, AppPadding.page, AppSpacing.s10),
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
///
/// The two buttons used to call one handler and sign you in on the spot. They
/// are two paths now, each going through an [SsoProvider]: the pressed one
/// shows a spinner, both are disabled while either runs, and the three ways it
/// can fail are three different outcomes rather than nothing happening.
class SocialSignIn extends StatefulWidget {
  const SocialSignIn({super.key, required this.onUse, this.provider});

  /// Called once an account has come back and [AuthController] holds it.
  final VoidCallback onUse;

  /// Who does the signing in. Null is [DummySsoProvider] — there is no real
  /// SDK wired up yet; see `docs/SSO.md`.
  final SsoProvider? provider;

  @override
  State<SocialSignIn> createState() => _SocialSignInState();
}

class _SocialSignInState extends State<SocialSignIn> {
  late final SsoProvider _sso = widget.provider ?? DummySsoProvider();

  /// Which button is mid-flight, so it alone shows the spinner.
  SsoProviderId? _busy;

  Future<void> _start(SsoProviderId provider) async {
    if (_busy != null) return;
    setState(() => _busy = provider);

    try {
      final account = await _sso.signIn(provider);
      if (!mounted) return;
      AuthScope.of(context).signInWith(account);
      widget.onUse();
    } on SsoException catch (error) {
      if (!mounted) return;
      setState(() => _busy = null);
      // A cancel gets no banner: the user dismissed the sheet themselves and
      // being told about it reads as a telling-off.
      if (error.failure == SsoFailure.cancelled) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(switch (error.failure) {
          SsoFailure.network =>
            'Could not reach ${provider.label}. Check your connection and try again.',
          SsoFailure.rejected =>
            '${provider.label} could not sign you in. Try email instead.',
          SsoFailure.cancelled => '',
        }),
      ));
    }
  }

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
              child: _SocialButton(
                provider: SsoProviderId.google,
                busy: _busy == SsoProviderId.google,
                // Both go dead while either runs: two provider sheets at once
                // is a state neither SDK defines.
                enabled: _busy == null,
                onPressed: () => _start(SsoProviderId.google),
                child: const GoogleMark(),
              ),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: _SocialButton(
                provider: SsoProviderId.apple,
                busy: _busy == SsoProviderId.apple,
                enabled: _busy == null,
                onPressed: () => _start(SsoProviderId.apple),
                child: const Icon(Icons.apple, size: 22, color: AppColors.iconDefault),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.provider,
    required this.busy,
    required this.enabled,
    required this.onPressed,
    required this.child,
  });

  final SsoProviderId provider;
  final bool busy;
  final bool enabled;
  final VoidCallback onPressed;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Continue with ${provider.label}',
      child: OutlinedButton(
        onPressed: enabled ? onPressed : null,
        child: busy
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppColors.iconDefault),
              )
            : child,
      ),
    );
  }
}
