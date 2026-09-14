import 'package:flutter/material.dart';
import '../data/sessions.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Figma 16523:18461 — "All Categories" as a bottom sheet rather than a link.
///
/// The category row on the shelf only shows what fits; this is the whole list,
/// with the one in force marked rather than merely tinted. Picking closes it,
/// because a filter sheet that stays open hides the thing it just changed.
Future<String?> showCategorySheet(BuildContext context, String selected) {
  return showModalBottomSheet<String>(
    context: context,
    backgroundColor: AppColors.surface,
    barrierColor: AppColors.iconStrong.withValues(alpha: 0.4),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
    ),
    builder: (context) => _CategorySheet(selected: selected),
  );
}

class _CategorySheet extends StatelessWidget {
  const _CategorySheet({required this.selected});

  final String selected;

  @override
  Widget build(BuildContext context) {
    final all = <String>[
      kAllCategories,
      for (final category in kCategories) category.name,
    ];

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
            AppPadding.page, AppPadding.lg, AppPadding.page, AppPadding.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('All Categories', style: AppTextStyles.titleLg),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  tooltip: 'Close',
                  icon: const Icon(Icons.close,
                      size: 24, color: AppColors.iconDefault),
                ),
              ],
            ),
            const SizedBox(height: AppPadding.md),
            Flexible(
              child: ListView(
                shrinkWrap: true,
                children: [
                  for (final filter in all)
                    _CategoryRow(
                      label: filter,
                      active: filter == selected,
                      onTap: () => Navigator.of(context).pop(filter),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? const Color(0x1AFF881B) : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s3, vertical: AppPadding.md),
          child: Row(
            children: [
              // The bare name, not the chip's label — the shelf chips carry the
              // library count because they compete for a tap, and a full list
              // of names reads better without it.
              Expanded(child: Text(label, style: AppTextStyles.bodyLg)),
              if (active)
                const Icon(Icons.check, size: 20, color: AppColors.textPrimary),
            ],
          ),
        ),
      ),
    );
  }
}
