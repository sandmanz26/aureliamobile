import 'package:flutter/material.dart';
import '../../core/data/help.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../shell/app_drawer.dart';

/// Help — the FAQ, as a stack of cards rather than the hairline accordion used
/// on Session detail.
///
/// Different job, so a different form: there each row is one facet of a single
/// thing, and the rules between them hold that together. Here each row is an
/// unrelated question, and separating them into cards makes it obvious you can
/// skip the nine you do not have.
///
/// More than one can be open at a time — comparing two answers is a normal
/// thing to want, and closing the one you are reading to open another is not.
class HelpScreen extends StatefulWidget {
  const HelpScreen({super.key});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> {
  final _open = <String>{};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/help'),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppPadding.md),
              child: Row(
                children: [
                  Builder(
                    builder: (context) => CircleSurfaceButton(
                      icon: Icons.menu,
                      tooltip: 'Open menu',
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(child: Text('Help', style: AppTextStyles.titleLg)),
                  const CoinPill(),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                    AppPadding.lg, 0, AppPadding.lg, AppSpacing.s10),
                children: [
                  for (final topic in kHelpTopics) ...[
                    _TopicCard(
                      topic: topic,
                      expanded: _open.contains(topic.question),
                      onToggle: () => setState(() {
                        if (!_open.remove(topic.question)) {
                          _open.add(topic.question);
                        }
                      }),
                    ),
                    const SizedBox(height: AppSpacing.s3),
                  ],
                  const SizedBox(height: AppSpacing.s3),
                  Container(
                    padding: const EdgeInsets.all(AppPadding.md),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.borderSubtle),
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Still stuck?',
                            style: AppTextStyles.bodySm
                                .copyWith(color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        Text(
                          'Write to support@aurelia.ai and include the session '
                          'name — it makes the answer much faster.',
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
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

class _TopicCard extends StatelessWidget {
  const _TopicCard({
    required this.topic,
    required this.expanded,
    required this.onToggle,
  });

  final HelpTopic topic;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        onTap: onToggle,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: 18, vertical: AppSpacing.s4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(topic.question, style: AppTextStyles.bodyLg),
                  ),
                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.keyboard_arrow_down,
                        size: 20, color: AppColors.iconSecondary),
                  ),
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox(width: double.infinity),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.s2),
                  child: Text(topic.answer, style: AppTextStyles.bodySm),
                ),
                crossFadeState: expanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 220),
                sizeCurve: Curves.easeInOut,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
