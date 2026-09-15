/// Typography scale.
///
/// **The face is Mulish**, bundled under `fonts:` in pubspec.yaml rather than
/// downloaded at runtime. It is the `font-family/base` variable in Figma, and
/// for a while neither client used it: the web's token export carried "SF Pro"
/// and this file left the family unset, so both platforms quietly rendered the
/// system UI face and agreed with each other about the wrong thing. Naming it
/// in one place here is what keeps that from coming back.
///
library;

import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  /// The app's face. Named once; every style below goes through [_base].
  static const fontFamily = 'Mulish';

  static TextStyle _base({
    required double fontSize,
    required FontWeight fontWeight,
    required double lineHeight,
    Color color = AppColors.textPrimary,
    double? letterSpacing,
    String family = fontFamily,
  }) {
    return TextStyle(
      fontFamily: family,
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: lineHeight,
      color: color,
      letterSpacing: letterSpacing,
    );
  }

  /// Every step below is the web app's `--text-*` scale, which is the Figma
  /// scale: size, weight and line height all come across unchanged, so a
  /// heading set as a title on one platform is the same heading on the other.
  /// Line heights are given as multipliers of the size, since Flutter's
  /// `height` is a ratio where CSS states the pixels: 40/32, 28/20 and so on.

  /// 32/40 — the banner and closing-CTA headlines.
  static TextStyle get headlineMd => _base(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        lineHeight: 40 / 32,
      );

  /// 24/32 — screen titles.
  static TextStyle get titleLg => _base(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        lineHeight: 32 / 24,
      );

  /// 20/28 — section headings.
  static TextStyle get titleMd => _base(
        fontSize: 20,
        fontWeight: FontWeight.w500,
        lineHeight: 28 / 20,
      );

  /// 16/24 — running text.
  static TextStyle get bodyLg => _base(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        lineHeight: 24 / 16,
      );

  /// 16/24, secondary — running text that is not the point of the screen.
  static TextStyle get bodyMd => _base(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        lineHeight: 24 / 16,
        color: AppColors.textSecondary,
      );

  /// 14/20 — the workhorse: card copy, list rows, sheet bodies.
  static TextStyle get bodySm => _base(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        lineHeight: 20 / 14,
        color: AppColors.textSecondary,
      );

  /// 10/14 — the smallest text in the system: card meta, stat labels, hints.
  static TextStyle get caption => _base(
        fontSize: 10,
        fontWeight: FontWeight.w400,
        lineHeight: 14 / 10,
        color: AppColors.textSecondary,
      );

  /// 12/16 — buttons, chips, counts and anything that names a control.
  static TextStyle get label => _base(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        lineHeight: 16 / 12,
      );

  /// The label, tracked out and set in caps — the accordion rows on Session
  /// detail and the small headings on Recreate.
  static TextStyle get overline => _base(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        lineHeight: 16 / 12,
        letterSpacing: 1.4,
      );

  /// The primary button: body size, semibold, on the button's own foreground.
  static TextStyle get buttonLg => _base(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        lineHeight: 24 / 16,
        color: AppColors.buttonPrimaryForeground,
      );

  /// A link in running text, and the "See All" beside a section heading.
  static TextStyle get link => _base(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        lineHeight: 16 / 12,
        color: AppColors.textBrand,
      );

  /// 21/28.5 — the player's spoken cue.
  ///
  /// It used to be the one style in the system that was not Mulish: the design
  /// set it in a serif to separate a line the session says to you from the
  /// interface around it. Every face is now Mulish, so the separation is
  /// carried by Light at 21 instead — which is what the web does.
  static TextStyle get playerCue => _base(
        fontSize: 21,
        fontWeight: FontWeight.w300,
        lineHeight: 28.5 / 21,
        color: AppColors.textInverse,
      );
}
