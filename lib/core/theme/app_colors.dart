/// Aurelia color system — mirrors the Figma variable structure 1:1:
/// `Aurelia Brand` (literal seeds) -> `Aurelia Primitives` (50-950 ramps,
/// aliased to Brand) -> `Aurelia Semantic` (role-based tokens, aliased to
/// Primitives). Keep this file in sync whenever the Figma variables change.
library;

import 'package:flutter/material.dart';

/// Tier 1: literal seed colors. Nothing in the app should reference these
/// directly — go through [AppPrimitives] or [AppColors] instead.
class _Brand {
  _Brand._();

  static const primary = Color(0xFFFFD242);
  static const neutral = Color(0xFF3C2405);
  static const danger = Color(0xFFD93C3D);
  static const warning = Color(0xFFF5A623);
  static const info = Color(0xFF4285F4);
  static const success = Color(0xFF34A853);
}

/// Tier 2: Tailwind-style 50-950 ramps. Each ramp's anchor stop is the exact
/// [_Brand] seed; the rest are literal tints/shades computed around it.
class AppPrimitives {
  AppPrimitives._();

  // primary (gold) — anchored at 400
  static const primary50 = Color(0xFFFFFBEB);
  static const primary100 = Color(0xFFFFF3C4);
  static const primary200 = Color(0xFFFFE58A);
  static const primary300 = Color(0xFFFFDA5C);
  static const primary400 = _Brand.primary; // #FFD242
  static const primary500 = Color(0xFFF2B705);
  static const primary600 = Color(0xFFD69E02);
  static const primary700 = Color(0xFFA67C01);
  static const primary800 = Color(0xFF7A5C01);
  static const primary900 = Color(0xFF524001);
  static const primary950 = Color(0xFF2E2400);

  // neutral (espresso, warm-tinted ink) — anchored at 900
  static const neutral50 = Color(0xFFFAFAFA);
  static const neutral100 = Color(0xFFF2F1EF);
  static const neutral200 = Color(0xFFE4E1DC);
  static const neutral300 = Color(0xFFCBC4B8);
  static const neutral400 = Color(0xFF7B7B7B);
  static const neutral500 = Color(0xFF6B6255);
  static const neutral600 = Color(0xFF574E42);
  static const neutral700 = Color(0xFF453D33);
  static const neutral800 = Color(0xFF322B22);
  static const neutral900 = _Brand.neutral; // #3C2405
  static const neutral950 = Color(0xFF241503);

  // danger (red) — anchored at 500
  static const danger50 = Color(0xFFFEF2F2);
  static const danger100 = Color(0xFFFEE2E2);
  static const danger200 = Color(0xFFFECACA);
  static const danger300 = Color(0xFFFCA5A5);
  static const danger400 = Color(0xFFF87171);
  static const danger500 = _Brand.danger; // #D93C3D
  static const danger600 = Color(0xFFB91C1C);
  static const danger700 = Color(0xFF991B1B);
  static const danger800 = Color(0xFF7F1D1D);
  static const danger900 = Color(0xFF601818);
  static const danger950 = Color(0xFF3D0F0F);

  // warning (amber) — anchored at 500
  static const warning50 = Color(0xFFFFFBEB);
  static const warning100 = Color(0xFFFEF0C7);
  static const warning200 = Color(0xFFFDDE8A);
  static const warning300 = Color(0xFFFBC750);
  static const warning400 = Color(0xFFF8B32E);
  static const warning500 = _Brand.warning; // #F5A623
  static const warning600 = Color(0xFFD4890F);
  static const warning700 = Color(0xFFA96A0C);
  static const warning800 = Color(0xFF7D4E09);
  static const warning900 = Color(0xFF533405);
  static const warning950 = Color(0xFF2E1D03);

  // info (blue) — anchored at 500
  static const info50 = Color(0xFFEFF6FF);
  static const info100 = Color(0xFFDBEAFE);
  static const info200 = Color(0xFFBFDBFE);
  static const info300 = Color(0xFF93C5FD);
  static const info400 = Color(0xFF609DF7);
  static const info500 = _Brand.info; // #4285F4
  static const info600 = Color(0xFF2563EB);
  static const info700 = Color(0xFF1D4ED8);
  static const info800 = Color(0xFF1E40AF);
  static const info900 = Color(0xFF1E3A8A);
  static const info950 = Color(0xFF17275C);

  // success (green) — anchored at 500
  static const success50 = Color(0xFFF0FDF4);
  static const success100 = Color(0xFFDCFCE7);
  static const success200 = Color(0xFFBBF7D0);
  static const success300 = Color(0xFF86EFAC);
  static const success400 = Color(0xFF4ADE80);
  static const success500 = _Brand.success; // #34A853
  static const success600 = Color(0xFF16A34A);
  static const success700 = Color(0xFF15803D);
  static const success800 = Color(0xFF166534);
  static const success900 = Color(0xFF14532D);
  static const success950 = Color(0xFF052E16);

  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);
}

/// Tier 3: role-based tokens. Widgets should only ever reference these.
class AppColors {
  AppColors._();

  static const background = AppPrimitives.neutral50;
  static const backgroundElevated = AppPrimitives.neutral100;
  static const surface = AppPrimitives.white;
  static const surfaceSunken = AppPrimitives.neutral50;

  static const border = AppPrimitives.neutral300;
  static const borderSubtle = AppPrimitives.neutral200;

  static const textPrimary = AppPrimitives.neutral900;
  static const textSecondary = AppPrimitives.neutral400;
  static const textStrong = AppPrimitives.black;
  static const textInverse = AppPrimitives.white;
  static const textOnBrand = AppPrimitives.neutral900;
  static const textBrand = AppPrimitives.primary600;

  static const brandDefault = AppPrimitives.primary400;
  static const brandEmphasis = AppPrimitives.primary600;

  static const interactivePrimary = AppPrimitives.neutral900;
  static const interactivePrimaryText = AppPrimitives.neutral900;

  static const iconDefault = AppPrimitives.neutral900;
  static const iconStrong = AppPrimitives.black;
  static const iconSecondary = AppPrimitives.neutral400;
  static const iconInverse = AppPrimitives.white;

  static const feedbackSuccess = AppPrimitives.success500;
  static const feedbackWarning = AppPrimitives.warning500;
  static const feedbackError = AppPrimitives.danger500;
  static const feedbackInfo = AppPrimitives.info500;

  // Button semantics
  static const buttonPrimaryBackground = AppPrimitives.neutral900;
  static const buttonPrimaryBackgroundPressed = AppPrimitives.neutral800;
  static const buttonPrimaryForeground = AppPrimitives.white;

  static const buttonSecondaryBackground = AppPrimitives.white;
  static const buttonSecondaryForeground = AppPrimitives.neutral900;
  static const buttonSecondaryBorder = AppPrimitives.neutral300;

  static const buttonDisabledBackground = AppPrimitives.neutral200;
  static const buttonDisabledForeground = AppPrimitives.neutral400;

  static const buttonGhostForeground = textBrand;
}
