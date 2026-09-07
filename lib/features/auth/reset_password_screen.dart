import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'auth_shell.dart';
import 'widgets/aurelia_text_field.dart';

/// Password reset, second step — what the emailed link opens.
///
/// A real build validates the token in the URL before showing the form and has
/// its own expired / already-used state; here the screen assumes a good token.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _obscure = true;
  bool _submitting = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_passwordController.text.length < 8) {
      setState(() => _error = 'Use at least 8 characters.');
      return;
    }
    if (_passwordController.text != _confirmController.text) {
      setState(() => _error = 'Those passwords don’t match.');
      return;
    }
    setState(() {
      _error = null;
      _submitting = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _submitting = false;
      _done = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_done) {
      return AuthShell(
        header: Text('Password changed', style: AppTextStyles.titleMd),
        children: [
          Center(
            child: Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.backgroundElevated,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_outline,
                  size: 28, color: AppColors.feedbackSuccess),
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          Text('Your password has been updated.',
              textAlign: TextAlign.center, style: AppTextStyles.bodyLg),
          const SizedBox(height: AppSpacing.s3),
          Text('Any other device signed into this account has been signed out.',
              textAlign: TextAlign.center, style: AppTextStyles.bodySm),
          const SizedBox(height: AppSpacing.s6),
          ElevatedButton(
            onPressed: () {
              AuthScope.of(context).signIn();
              Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
            },
            child: const Text('Continue to Aurelia'),
          ),
        ],
      );
    }

    final mismatch = _confirmController.text.isNotEmpty &&
        _confirmController.text != _passwordController.text;

    return AuthShell(
      header: Text('Set a new password', style: AppTextStyles.titleMd),
      children: [
        Text(
          'Pick something you haven’t used on this account before. '
          'At least 8 characters.',
          style: AppTextStyles.bodySm,
        ),
        const SizedBox(height: AppSpacing.s4),
        AureliaTextField(
          controller: _passwordController,
          hintText: 'New password',
          leadingIcon: Icons.lock_outline,
          obscureText: _obscure,
          onChanged: (_) => setState(() {}),
          trailing: IconButton(
            tooltip: _obscure ? 'Show password' : 'Hide password',
            icon: Icon(
              _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.iconSecondary,
              size: 20,
            ),
            onPressed: () => setState(() => _obscure = !_obscure),
          ),
        ),
        const SizedBox(height: AppSpacing.s4),
        AureliaTextField(
          controller: _confirmController,
          hintText: 'Confirm new password',
          leadingIcon: Icons.lock_outline,
          obscureText: _obscure,
          onChanged: (_) => setState(() {}),
        ),
        if (mismatch)
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.s4, 6, 0, 0),
            child: Text('Passwords don’t match yet.',
                style: AppTextStyles.caption.copyWith(color: AppColors.feedbackError)),
          ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.s3),
            child: Text(_error!,
                style: AppTextStyles.bodySm.copyWith(color: AppColors.feedbackError)),
          ),
        const SizedBox(height: AppSpacing.s4),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          child: Text(_submitting ? 'Saving…' : 'Save new password'),
        ),
      ],
    );
  }
}
