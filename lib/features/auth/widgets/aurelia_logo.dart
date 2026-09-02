import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Aurelia wordmark. The mark itself is a placeholder approximation of the
/// Figma asset (a gradient squircle with a circular cutout) — swap for the
/// exported SVG/PNG when available.
class AureliaLogo extends StatelessWidget {
  const AureliaLogo({super.key, this.iconSize = 40});

  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: iconSize,
          height: iconSize,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppPrimitives.primary600, AppPrimitives.primary300],
            ),
          ),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Padding(
              padding: EdgeInsets.all(iconSize * 0.14),
              child: Container(
                width: iconSize * 0.32,
                height: iconSize * 0.32,
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.s3),
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [AppPrimitives.primary700, AppPrimitives.primary400],
          ).createShader(bounds),
          child: Text(
            'aurelia',
            style: TextStyle(
              fontSize: iconSize * 0.6,
              fontWeight: FontWeight.w600,
              color: AppColors.surface,
              letterSpacing: -0.5,
            ),
          ),
        ),
      ],
    );
  }
}
