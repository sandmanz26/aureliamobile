import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_text_styles.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.brandDefault,
        brightness: Brightness.light,
        primary: AppColors.brandDefault,
        onPrimary: AppColors.textOnBrand,
        secondary: AppColors.brandEmphasis,
        surface: AppColors.surface,
        error: AppColors.feedbackError,
      ),
      textTheme: TextTheme(
        headlineMedium: AppTextStyles.headlineLg,
        headlineSmall: AppTextStyles.headlineMd,
        titleMedium: AppTextStyles.titleMd,
        bodyLarge: AppTextStyles.bodyLg,
        bodyMedium: AppTextStyles.bodyMd,
        bodySmall: AppTextStyles.bodySm,
        labelLarge: AppTextStyles.label,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        hintStyle: AppTextStyles.bodyLg.copyWith(color: AppColors.textSecondary),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppPadding.lg,
          vertical: AppPadding.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.full),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.full),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.full),
          borderSide: const BorderSide(color: AppColors.brandEmphasis, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.full),
          borderSide: const BorderSide(color: AppColors.feedbackError),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.buttonPrimaryBackground,
          foregroundColor: AppColors.buttonPrimaryForeground,
          disabledBackgroundColor: AppColors.buttonDisabledBackground,
          disabledForegroundColor: AppColors.buttonDisabledForeground,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          textStyle: AppTextStyles.buttonLg,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: AppColors.buttonSecondaryBackground,
          foregroundColor: AppColors.buttonSecondaryForeground,
          minimumSize: const Size.fromHeight(52),
          side: const BorderSide(color: AppColors.buttonSecondaryBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.buttonGhostForeground,
          textStyle: AppTextStyles.link,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtle,
        thickness: 1,
      ),
    );
  }
}
