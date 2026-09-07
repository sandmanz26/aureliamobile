import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'auth_shell.dart';
import 'widgets/aurelia_text_field.dart';

/// Where the sign-in wall sends someone, and where to continue afterwards.
class AuthRedirect {
  const AuthRedirect({this.route, this.arguments});

  final String? route;
  final Object? arguments;
}

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key, this.redirect});

  final AuthRedirect? redirect;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Signs in and continues to whatever the user was trying to open — never
  /// back to a generic landing.
  void _complete() {
    AuthScope.of(context).signIn();
    final navigator = Navigator.of(context);
    final route = widget.redirect?.route;
    if (route != null) {
      navigator.pushReplacementNamed(route, arguments: widget.redirect?.arguments);
    } else if (navigator.canPop()) {
      navigator.pop();
    } else {
      navigator.pushReplacementNamed('/home');
    }
  }

  Future<void> _submit() async {
    if (_submitting) return;
    setState(() => _submitting = true);
    // Dummy login — no backend yet, so any submit signs in after a beat.
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() => _submitting = false);
    _complete();
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      header: const AuthTabs(signInSelected: true),
      children: [
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
            tooltip: _obscurePassword ? 'Show password' : 'Hide password',
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
            onPressed: () => Navigator.of(context).pushNamed('/forgot-password'),
            child: const Text('Forgot Password?'),
          ),
        ),
        const SizedBox(height: AppSpacing.s2),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          child: Text(_submitting ? 'Signing in…' : 'Sign In'),
        ),
        SocialSignIn(onUse: _complete),
        const SizedBox(height: AppSpacing.s6),
        Center(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(text: 'New here? ', style: AppTextStyles.bodySm),
                WidgetSpan(
                  alignment: PlaceholderAlignment.middle,
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacementNamed('/signup'),
                    child: Text('Create an account',
                        style: AppTextStyles.link),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
