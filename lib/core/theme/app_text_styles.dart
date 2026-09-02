/// Typography scale. Font family is a placeholder (Inter) pending
/// confirmation from the Figma file's text styles.
library;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'app_spacing.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle _base({
    required double fontSize,
    required FontWeight fontWeight,
    required double lineHeight,
    Color color = AppColors.textPrimary,
    double? letterSpacing,
  }) {
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: lineHeight,
      color: color,
      letterSpacing: letterSpacing,
    );
  }

  static TextStyle get headlineLg => _base(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        lineHeight: AppLineHeight.tight,
      );

  static TextStyle get headlineMd => _base(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        lineHeight: AppLineHeight.tight,
      );

  static TextStyle get titleMd => _base(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.snug,
      );

  static TextStyle get bodyLg => _base(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        lineHeight: AppLineHeight.normal,
      );

  static TextStyle get bodyMd => _base(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        lineHeight: AppLineHeight.normal,
        color: AppColors.textSecondary,
      );

  static TextStyle get bodySm => _base(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        lineHeight: AppLineHeight.normal,
        color: AppColors.textSecondary,
      );

  static TextStyle get label => _base(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.snug,
      );

  static TextStyle get buttonLg => _base(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.snug,
        color: AppColors.buttonPrimaryForeground,
      );

  static TextStyle get link => _base(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.snug,
        color: AppColors.textBrand,
      );
}
