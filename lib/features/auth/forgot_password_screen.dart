import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'auth_shell.dart';
import 'widgets/aurelia_text_field.dart';

/// Password reset, request step.
///
/// The confirmation deliberately does not say whether the address exists — the
/// same message either way. Telling an anonymous visitor "no account with that
/// email" hands them a way to test whether any address is registered, and for a
/// wellness app that leaks something people would rather not have leaked.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _sent = false;
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _submitting = false;
      _sent = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_sent) {
      final email = _emailController.text.trim();
      return AuthShell(
        header: Text('Check your inbox', style: AppTextStyles.titleMd),
        children: [
          Center(
            child: Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.backgroundElevated,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.mark_email_read_outlined,
                  size: 26, color: AppColors.iconDefault),
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          Text(
            'If an account exists for ${email.isEmpty ? 'that address' : email}, '
            'a reset link is on its way.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyLg,
          ),
          const SizedBox(height: AppSpacing.s3),
          Text(
            'The link works once and expires in 30 minutes. Check your spam '
            'folder before asking for another.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.s6),
          // Demo affordance: there is no mail server, so the reset step is
          // reachable directly. A real build only gets here from the email.
          ElevatedButton(
            onPressed: () => Navigator.of(context).pushNamed('/reset-password'),
            child: const Text('Open the reset link'),
          ),
          const SizedBox(height: AppSpacing.s2),
          TextButton(
            onPressed: () => setState(() => _sent = false),
            child: const Text('Use a different email'),
          ),
        ],
      );
    }

    return AuthShell(
      header: Text('Forgot password', style: AppTextStyles.titleMd),
      children: [
        Text(
          'Enter the email you signed up with and we’ll send a link to set a '
          'new password.',
          style: AppTextStyles.bodySm,
        ),
        const SizedBox(height: AppSpacing.s4),
        AureliaTextField(
          controller: _emailController,
          hintText: 'Email',
          leadingIcon: Icons.mail_outline,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: AppSpacing.s4),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          child: Text(_submitting ? 'Sending…' : 'Send reset link'),
        ),
        const SizedBox(height: AppSpacing.s6),
        Center(
          child: TextButton.icon(
            onPressed: () => Navigator.of(context).maybePop(),
            icon: const Icon(Icons.arrow_back, size: 15),
            label: const Text('Back to sign in'),
          ),
        ),
      ],
    );
  }
}
