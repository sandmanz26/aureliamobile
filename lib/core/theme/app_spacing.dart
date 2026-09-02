/// Numeric scale — mirrors the `Aurelia Numbers` Figma variable collection
/// (radius, spacing, line-height, padding, margin).
library;

class AppRadius {
  AppRadius._();

  static const none = 0.0;
  static const sm = 4.0;
  static const md = 8.0;
  static const lg = 12.0;
  static const xl = 16.0;
  static const xl2 = 24.0;
  static const xl3 = 32.0;
  static const full = 999.0;
}

class AppSpacing {
  AppSpacing._();

  static const s0 = 0.0;
  static const s1 = 4.0;
  static const s2 = 8.0;
  static const s3 = 12.0;
  static const s4 = 16.0;
  static const s5 = 20.0;
  static const s6 = 24.0;
  static const s8 = 32.0;
  static const s10 = 40.0;
  static const s12 = 48.0;
  static const s16 = 64.0;
  static const s20 = 80.0;
  static const s24 = 96.0;
}

/// Line-height multipliers (applied via [TextStyle.height]).
class AppLineHeight {
  AppLineHeight._();

  static const tight = 1.2;
  static const snug = 1.35;
  static const normal = 1.5;
  static const relaxed = 1.65;
  static const loose = 1.8;
}

/// Semantic padding scale — aliases [AppSpacing], same as the Figma tokens.
class AppPadding {
  AppPadding._();

  static const xs = AppSpacing.s2;
  static const sm = AppSpacing.s3;
  static const md = AppSpacing.s4;
  static const lg = AppSpacing.s6;
  static const xl = AppSpacing.s8;
}

/// Semantic margin scale — aliases [AppSpacing], same as the Figma tokens.
class AppMargin {
  AppMargin._();

  static const xs = AppSpacing.s2;
  static const sm = AppSpacing.s3;
  static const md = AppSpacing.s4;
  static const lg = AppSpacing.s6;
  static const xl = AppSpacing.s8;
}
