import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'auth_shell.dart';
import 'sign_in_screen.dart' show AuthRedirect;
import 'widgets/aurelia_text_field.dart';

/// Weak / fair / strong, from length plus variety. Enough to be honest, not a
/// lecture.
({String label, int bars, Color color})? _strengthOf(String password) {
  if (password.isEmpty) return null;
  var score = password.length >= 8 ? 1 : 0;
  if (RegExp(r'[A-Z]').hasMatch(password) && RegExp(r'[a-z]').hasMatch(password)) score++;
  if (RegExp(r'\d').hasMatch(password)) score++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 2) return (label: 'Weak', bars: 1, color: AppColors.feedbackError);
  if (score == 3) return (label: 'Fair', bars: 2, color: AppColors.feedbackWarning);
  return (label: 'Strong', bars: 3, color: AppColors.feedbackSuccess);
}

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key, this.redirect});

  final AuthRedirect? redirect;

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _obscure = true;
  bool _accepted = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _complete() {
    AuthScope.of(context).signIn();
    final navigator = Navigator.of(context);
    final route = widget.redirect?.route;
    if (route != null) {
      navigator.pushReplacementNamed(route, arguments: widget.redirect?.arguments);
    } else {
      navigator.pushNamedAndRemoveUntil('/home', (route) => false);
    }
  }

  Future<void> _submit() async {
    final password = _passwordController.text;
    if (password != _confirmController.text) {
      setState(() => _error = 'Those passwords don’t match. Check the second one.');
      return;
    }
    if (password.length < 8) {
      setState(() => _error = 'Use at least 8 characters.');
      return;
    }
    setState(() {
      _error = null;
      _submitting = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _submitting = false);
    _complete();
  }

  @override
  Widget build(BuildContext context) {
    final strength = _strengthOf(_passwordController.text);
    // Only complain once there is something to complain about — an error next
    // to an empty field is noise, not help.
    final mismatch = _confirmController.text.isNotEmpty &&
        _confirmController.text != _passwordController.text;

    return AuthShell(
      header: const AuthTabs(signInSelected: false),
      children: [
        AureliaTextField(
          controller: _nameController,
          hintText: 'Full name',
          leadingIcon: Icons.person_outline,
        ),
        const SizedBox(height: AppSpacing.s4),
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
        if (strength != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.s4, AppSpacing.s2, AppSpacing.s4, 0),
            child: Row(
              children: [
                for (var i = 0; i < 3; i++)
                  Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.only(right: 4),
                      decoration: BoxDecoration(
                        color: i < strength.bars ? strength.color : AppColors.borderSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                    ),
                  ),
                const SizedBox(width: AppSpacing.s2),
                Text(strength.label, style: AppTextStyles.caption),
              ],
            ),
          ),
        const SizedBox(height: AppSpacing.s4),
        AureliaTextField(
          controller: _confirmController,
          hintText: 'Confirm password',
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
        const SizedBox(height: AppSpacing.s4),
        // Consent is explicit and names what is actually collected — burying
        // special-category data in a linked document is the risk the PRD flags.
        InkWell(
          onTap: () => setState(() => _accepted = !_accepted),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: _accepted,
                onChanged: (value) => setState(() => _accepted = value ?? false),
                activeColor: AppColors.brandEmphasis,
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    'I agree to the Terms and the Privacy Policy, including how '
                    'Aurelia uses my mood, sleep and voice data.',
                    style: AppTextStyles.bodySm,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.s3),
            child: Text(_error!,
                style: AppTextStyles.bodySm.copyWith(color: AppColors.feedbackError)),
          ),
        const SizedBox(height: AppSpacing.s4),
        ElevatedButton(
          onPressed: _submitting || !_accepted ? null : _submit,
          child: Text(_submitting ? 'Creating account…' : 'Create account'),
        ),
        SocialSignIn(onUse: _complete),
        const SizedBox(height: AppSpacing.s6),
        Center(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(text: 'Already have an account? ', style: AppTextStyles.bodySm),
                WidgetSpan(
                  alignment: PlaceholderAlignment.middle,
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                    child: Text('Sign in', style: AppTextStyles.link),
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
