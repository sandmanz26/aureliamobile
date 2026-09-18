import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Figma "drawer" inside Session/Insights/Chapters/Objective (16659:41284).
///
/// The pencil on the Objective card had no handler at all — the one editable
/// thing on the Insights screen, and it did nothing. This is what the frame
/// says it opens: a bottom sheet asking for the goal the whole screen is
/// measured against.
///
/// Save is disabled until something is typed, which the frame draws as the
/// same button at 50% — not a different colour, so it reads as "not yet"
/// rather than "not for you".
Future<String?> showObjectiveSheet(BuildContext context, String objective) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: AppColors.iconStrong.withValues(alpha: 0.2),
    builder: (context) => _ObjectiveSheet(objective: objective),
  );
}

class _ObjectiveSheet extends StatefulWidget {
  const _ObjectiveSheet({required this.objective});

  final String objective;

  @override
  State<_ObjectiveSheet> createState() => _ObjectiveSheetState();
}

class _ObjectiveSheetState extends State<_ObjectiveSheet> {
  late final _field = TextEditingController(text: widget.objective);

  @override
  void dispose() {
    _field.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ready = _field.text.trim().isNotEmpty;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        width: double.infinity,
        // 40 above, 32 below, 20 at the sides, 32 between the three blocks.
        padding: const EdgeInsets.fromLTRB(
            AppPadding.page, AppSpacing.s10, AppPadding.page, AppSpacing.s8),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 64 in the frame — the icon is the sheet's whole illustration,
            // and it carries the brand orange rather than the gold.
            const Icon(Icons.adjust, size: 64, color: Color(0xFFFF881B)),
            const SizedBox(height: AppSpacing.s6),
            Text('Write your Objective', style: AppTextStyles.titleMd),
            const SizedBox(height: AppSpacing.s2),
            const Text(
                'Set a goal to guide your experience and track your progress.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 14,
                    height: 21 / 14,
                    fontWeight: FontWeight.w300,
                    color: Color(0xFF525252))),
            const SizedBox(height: AppSpacing.s8),
            SizedBox(
              height: 44,
              child: TextField(
                controller: _field,
                autofocus: true,
                onChanged: (_) => setState(() {}),
                onSubmitted: (_) => _save(),
                decoration: InputDecoration(
                  hintText: 'E.g. Improve my sleep pattern',
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppPadding.md, vertical: 0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    borderSide: const BorderSide(color: Color(0xFFD6D6D6)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    borderSide: const BorderSide(color: Color(0xFFD6D6D6)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    borderSide:
                        const BorderSide(color: AppColors.brandEmphasis),
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.s8),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 47,
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFD6D6D6)),
                        foregroundColor: AppColors.textPrimary,
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: SizedBox(
                    height: 47,
                    child: ElevatedButton(
                      onPressed: ready ? _save : null,
                      child: const Text('Save'),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _save() {
    final next = _field.text.trim();
    if (next.isEmpty) return;
    Navigator.of(context).pop(next);
  }
}
