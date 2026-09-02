import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'widgets/aurelia_logo.dart';
import 'widgets/aurelia_text_field.dart';
import 'widgets/auth_tab_toggle.dart';
import 'widgets/social_login_button.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  AuthTab _tab = AuthTab.signIn;
  bool _obscurePassword = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    // TODO: wire up to the real auth use case.
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Header(
                tab: _tab,
                onTabChanged: (tab) => setState(() => _tab = tab),
              ),
              const SizedBox(height: AppSpacing.s10),
              const Center(child: AureliaLogo()),
              const SizedBox(height: AppSpacing.s10),
              AureliaTextField(
                controller: _emailController,
                hintText: 'Email',
                leadingIcon: Icons.mail_outline,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: AppSpacing.s4),
              AureliaTextField(
                controller: _passwordController,
                hintText: 'Password',
                leadingIcon: Icons.lock_outline,
                obscureText: _obscurePassword,
                trailing: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: AppColors.iconSecondary,
                    size: 20,
                  ),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text('Forgot Password?'),
                ),
              ),
              const SizedBox(height: AppSpacing.s2),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSignIn,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation(AppColors.buttonPrimaryForeground),
                        ),
                      )
                    : const Text('Sign In'),
              ),
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
                    child: SocialLoginButton(
                      icon: const _GoogleMark(),
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: SocialLoginButton(
                      icon: Icon(Icons.apple, color: AppColors.iconDefault, size: 22),
                      onPressed: () {},
                    ),
                  ),
                ],
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.tab, required this.onTabChanged});

  final AuthTab tab;
  final ValueChanged<AuthTab> onTabChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: _CircleIconButton(
              icon: Icons.arrow_back,
              onPressed: () => Navigator.of(context).maybePop(),
            ),
          ),
          AuthTabToggle(selected: tab, onChanged: onTabChanged),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.onPressed});

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onPressed,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s3),
          child: Icon(icon, size: 20, color: AppColors.iconDefault),
        ),
      ),
    );
  }
}

/// Simple "G" placeholder for the Google mark until the real brand asset is
/// wired in (third-party logos aren't tokenized).
class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return const Text(
      'G',
      style: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Color(0xFF4285F4),
      ),
    );
  }
}
