import 'package:flutter/material.dart';
import '../../core/data/notifications.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/photo_circle.dart';
import '../../core/widgets/section_header.dart';

const _avatarRing = [AppPrimitives.primary300, AppPrimitives.info300];

/// The activity feed — who is doing what with your sessions.
///
/// Grouped by age rather than listed flat, because "1s" and "3d" mean different
/// things and a reader scanning for what is new should not have to read the
/// timestamps to find the boundary. The chips narrow the same grouping rather
/// than replacing it, so the shape of the screen never changes under you.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  NotificationBucket? _filter;

  @override
  Widget build(BuildContext context) {
    final groups = bucketsFor(_filter)
        .map((bucket) => (
              bucket,
              kNotifications.where((n) => n.bucket == bucket).toList(),
            ))
        .where((group) => group.$2.isNotEmpty)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppPadding.md),
              child: Row(
                children: [
                  CircleSurfaceButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Back',
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: Text('Notifications', style: AppTextStyles.titleLg),
                  ),
                  const CoinPill(),
                ],
              ),
            ),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                itemCount: kNotificationFilters.length,
                separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                itemBuilder: (context, index) {
                  final (bucket, label) = kNotificationFilters[index];
                  return PillChip(
                    label: label,
                    selected: bucket == _filter,
                    onTap: () => setState(() => _filter = bucket),
                  );
                },
              ),
            ),
            Expanded(
              child: groups.isEmpty
                  ? Center(
                      child: Text('Nothing here for that stretch of time.',
                          style: AppTextStyles.bodySm),
                    )
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(
                          AppPadding.lg, AppSpacing.s4, AppPadding.lg, AppSpacing.s10),
                      children: [
                        for (final (bucket, items) in groups) ...[
                          Text(kBucketTitles[bucket]!,
                              style: AppTextStyles.bodySm),
                          const SizedBox(height: AppSpacing.s2),
                          for (final item in items)
                            _NotificationRow(item: item),
                          const SizedBox(height: AppSpacing.s4),
                        ],
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationRow extends StatelessWidget {
  const _NotificationRow({required this.item});

  final NotificationRecord item;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        onTap: () =>
            Navigator.of(context).pushNamed('/session', arguments: item.sessionSlug),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s2 + 2),
          child: Row(
            children: [
              PhotoCircle(photo: item.actorPhoto, size: 40, gradient: _avatarRing),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: item.actor,
                        style: AppTextStyles.bodySm.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      TextSpan(text: ' ${item.action}', style: AppTextStyles.bodySm),
                      // The age sits apart from the sentence — it is a stamp on
                      // the row, not the last word of it.
                      TextSpan(text: '   ${item.age}', style: AppTextStyles.bodySm),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              SizedBox(
                width: 40,
                height: 40,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    PhotoCircle(
                      photo: item.sessionPhoto,
                      size: 40,
                      gradient: const [
                        AppPrimitives.info900,
                        AppPrimitives.neutral950,
                      ],
                    ),
                    Container(
                      width: 18,
                      height: 18,
                      decoration: const BoxDecoration(
                        color: Color(0x73000000),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.play_arrow,
                          size: 11, color: AppColors.textInverse),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
