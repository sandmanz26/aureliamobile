/// Typography scale.
///
/// No font package: the family is left unset so each platform uses its own UI
/// face — San Francisco on iOS and macOS, Roboto on Android. That matches the
/// web app, whose `--font-sans` is the same system stack, and it removes a
/// runtime font download along with a dependency that has to keep pace with
/// every Flutter release.
///
/// If the brand ever settles on a specific face, bundle it under `fonts:` in
/// pubspec.yaml and name it in [_base] — one line, one place.
library;

import 'package:flutter/material.dart';
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
    return TextStyle(
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

  /// 10px — the smallest text in the system: card meta, stat labels, hints.
  static TextStyle get caption => _base(
        fontSize: 11,
        fontWeight: FontWeight.w400,
        lineHeight: AppLineHeight.snug,
        color: AppColors.textSecondary,
      );

  /// Uppercase section label — the accordion rows on Session detail and the
  /// small headings on Recreate.
  static TextStyle get overline => _base(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.snug,
        letterSpacing: 1.4,
      );

  static TextStyle get titleLg => _base(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        lineHeight: AppLineHeight.tight,
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
