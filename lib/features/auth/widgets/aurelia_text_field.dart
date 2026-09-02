import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

/// Pill-shaped text field with a leading icon, matching the Email/Password
/// fields on the Sign In screen.
class AureliaTextField extends StatelessWidget {
  const AureliaTextField({
    super.key,
    required this.hintText,
    required this.leadingIcon,
    this.controller,
    this.obscureText = false,
    this.trailing,
    this.keyboardType,
  });

  final String hintText;
  final IconData leadingIcon;
  final TextEditingController? controller;
  final bool obscureText;
  final Widget? trailing;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: Theme.of(context).textTheme.bodyLarge,
      decoration: InputDecoration(
        hintText: hintText,
        prefixIcon: Icon(leadingIcon, color: AppColors.iconSecondary, size: 20),
        suffixIcon: trailing,
      ),
    );
  }
}
