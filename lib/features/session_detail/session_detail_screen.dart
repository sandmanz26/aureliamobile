import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';

/// Session detail — cover, creator, the one action the screen exists for, then
/// everything else behind uppercase collapsible rows.
///
/// A session carries far more than fits on one screen. Stacking it all flat
/// buries the play button; this keeps every heading visible at once and opens
/// only what is asked for. Overview starts open so the screen never loads as a
/// wall of closed rows.
class SessionDetailScreen extends StatefulWidget {
  const SessionDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  State<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends State<SessionDetailScreen> {
  final _open = <String>{'overview'};

  @override
  Widget build(BuildContext context) {
    final session = findSession(widget.slug);
    // An unknown slug is a bad link, not an error state worth a screen.
    if (session == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.of(context).pop();
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.s10),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.md),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back),
                    color: AppColors.iconDefault,
                    tooltip: 'Back',
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.bookmark_border),
                    color: AppColors.iconDefault,
                    tooltip: 'Save',
                  ),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.ios_share),
                    color: AppColors.iconDefault,
                    tooltip: 'Share',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AspectRatio(
                    aspectRatio: 362 / 240,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.xl2),
                      child: Stack(
                        children: [
                          CoverImage(
                            photo: session.photo,
                            gradient: session.gradient,
                            width: 760,
                            height: 520,
                          ),
                          Padding(
                            padding: const EdgeInsets.all(AppPadding.md),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.s3, vertical: 4),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: const Color(0x80FFFFFF)),
                                    borderRadius: BorderRadius.circular(AppRadius.full),
                                  ),
                                  child: Text(
                                    session.category.toUpperCase(),
                                    style: AppTextStyles.caption
                                        .copyWith(color: AppColors.textInverse, letterSpacing: 1.4),
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.s2),
                                Text(session.title,
                                    style: AppTextStyles.titleLg
                                        .copyWith(color: AppColors.textInverse)),
                                const SizedBox(height: 4),
                                Text(
                                  '${session.minutes} min · ${session.plays} plays · ${session.recreated} recreations',
                                  style: AppTextStyles.bodySm
                                      .copyWith(color: const Color(0xE6FFFFFF)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    children: [
                      const PhotoCircle(
                        photo: 'avatar',
                        size: 40,
                        gradient: [AppPrimitives.info300, AppPrimitives.primary300],
                      ),
                      const SizedBox(width: AppSpacing.s3),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(session.author, style: AppTextStyles.label),
                            Text(session.authorRole,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                      OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 32),
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                        ),
                        child: Text('Follow', style: AppTextStyles.label),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.play_arrow, size: 20),
                          label: const Text('Play session'),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s2),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.of(context)
                            .pushNamed('/recreate', arguments: session.slug),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 52),
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
                        ),
                        icon: const Icon(Icons.repeat, size: 18),
                        label: const Text('Recreate'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  Row(
                    children: [
                      const Icon(Icons.monetization_on_outlined,
                          size: 12, color: AppColors.iconSecondary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Playing earns 5 coins · recreating credits ${session.author} with 10',
                          style: AppTextStyles.caption,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  for (final section in _sections(session))
                    _AccordionRow(
                      label: section.label,
                      meta: section.meta,
                      expanded: _open.contains(section.id),
                      onToggle: () => setState(() {
                        if (!_open.remove(section.id)) _open.add(section.id);
                      }),
                      child: section.build(context),
                    ),
                  const SizedBox(height: AppSpacing.s6),
                  Material(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      onTap: () => Navigator.of(context)
                          .pushNamed('/recreate', arguments: session.slug),
                      child: Padding(
                        padding: const EdgeInsets.all(AppPadding.md),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: const BoxDecoration(
                                color: AppColors.brandDefault,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.auto_awesome,
                                  size: 18, color: AppColors.iconStrong),
                            ),
                            const SizedBox(width: AppSpacing.s3),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Make it yours', style: AppTextStyles.label),
                                  Text(
                                    'Fork this session and tune it in chat — ${session.author} stays credited.',
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
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

  List<_Section> _sections(SessionRecord s) => [
        _Section('overview', 'Overview', null, (context) => _Overview(session: s)),
        _Section(
          'structure',
          'Session structure',
          '${s.chapters.length} chapters · ${s.totalMinutes} min',
          (context) => _Chapters(session: s),
        ),
        _Section('layers', 'Sound layers', '${s.layers.length} layers',
            (context) => _Layers(session: s)),
        _Section('personalization', 'Personalization', null,
            (context) => _Rows(items: s.personalization)),
        _Section('changes', 'What people changed', '${s.recreated} recreations',
            (context) => _Changes(session: s)),
        _Section('lineage', 'Lineage', '${s.lineage.length} versions',
            (context) => _Lineage(session: s)),
        _Section('safety', 'Safety & licensing', null, (context) => _Safety(session: s)),
      ];
}

class _Section {
  const _Section(this.id, this.label, this.meta, this.build);

  final String id;
  final String label;
  final String? meta;
  final Widget Function(BuildContext) build;
}

class _AccordionRow extends StatelessWidget {
  const _AccordionRow({
    required this.label,
    required this.meta,
    required this.expanded,
    required this.onToggle,
    required this.child,
  });

  final String label;
  final String? meta;
  final bool expanded;
  final VoidCallback onToggle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: onToggle,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.s4),
              child: Row(
                children: [
                  Expanded(child: Text(label.toUpperCase(), style: AppTextStyles.overline)),
                  if (meta != null) ...[
                    Text(meta!, style: AppTextStyles.caption),
                    const SizedBox(width: AppSpacing.s2),
                  ],
                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.keyboard_arrow_down,
                        size: 18, color: AppColors.iconSecondary),
                  ),
                ],
              ),
            ),
          ),
          if (expanded)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s5),
              child: child,
            ),
        ],
      ),
    );
  }
}

class _Overview extends StatelessWidget {
  const _Overview({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(session.summary,
            style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary)),
        const SizedBox(height: AppSpacing.s4),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.backgroundElevated,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('CREATOR’S INTENT',
                  style: AppTextStyles.caption.copyWith(letterSpacing: 1.4)),
              const SizedBox(height: 6),
              Text(session.intent,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary)),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.s4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final item in session.outcome)
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(right: AppSpacing.s2),
                  padding: const EdgeInsets.all(AppSpacing.s3),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.borderSubtle),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.value, style: AppTextStyles.titleMd),
                      const SizedBox(height: 2),
                      Text(item.label,
                          style: AppTextStyles.caption
                              .copyWith(color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      Text(item.note, style: AppTextStyles.caption),
                    ],
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.s3),
        // Not a clinical claim, and the screen has to say so.
        Text(
          'Figures are self-reported by listeners and are not clinical measurements.',
          style: AppTextStyles.caption,
        ),
      ],
    );
  }
}

class _Chapters extends StatelessWidget {
  const _Chapters({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < session.chapters.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.s2),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 24,
                  height: 24,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: AppColors.backgroundElevated,
                    shape: BoxShape.circle,
                  ),
                  child: Text('${i + 1}', style: AppTextStyles.caption),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(session.chapters[i].label,
                                style: AppTextStyles.label),
                          ),
                          Text('${session.chapters[i].minutes} min',
                              style: AppTextStyles.caption),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(session.chapters[i].detail, style: AppTextStyles.caption),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Horizontal share bar — mix levels and "what people changed".
class _Meter extends StatelessWidget {
  const _Meter({required this.value});

  final int value;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: LinearProgressIndicator(
        value: value / 100,
        minHeight: 4,
        backgroundColor: AppColors.backgroundElevated,
        valueColor: const AlwaysStoppedAnimation(AppColors.brandEmphasis),
      ),
    );
  }
}

class _Layers extends StatelessWidget {
  const _Layers({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final layer in session.layers)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.s4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(layer.name, style: AppTextStyles.label)),
                    Text('${layer.level}%', style: AppTextStyles.caption),
                  ],
                ),
                const SizedBox(height: 6),
                _Meter(value: layer.level),
                const SizedBox(height: 6),
                Text(layer.detail, style: AppTextStyles.caption),
              ],
            ),
          ),
      ],
    );
  }
}

class _Rows extends StatelessWidget {
  const _Rows({required this.items});

  final List<LabelValue> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final item in items)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: Text(item.label, style: AppTextStyles.bodySm)),
                const SizedBox(width: AppSpacing.s4),
                Flexible(
                  child: Text(
                    item.value,
                    textAlign: TextAlign.right,
                    style: AppTextStyles.bodySm.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Changes extends StatelessWidget {
  const _Changes({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'The edits made most often when someone forks this session. '
          'Start from any of them in Recreate.',
          style: AppTextStyles.caption,
        ),
        const SizedBox(height: AppSpacing.s3),
        for (final change in session.commonChanges)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.s3),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(change.label,
                          style: AppTextStyles.bodySm
                              .copyWith(color: AppColors.textPrimary)),
                    ),
                    Text(change.value, style: AppTextStyles.caption),
                  ],
                ),
                const SizedBox(height: 6),
                _Meter(value: int.tryParse(change.value.replaceAll('%', '')) ?? 0),
              ],
            ),
          ),
      ],
    );
  }
}

class _Lineage extends StatelessWidget {
  const _Lineage({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < session.lineage.length; i++)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(top: 6),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: i == session.lineage.length - 1
                            ? AppColors.brandEmphasis
                            : AppColors.border,
                      ),
                    ),
                    if (i < session.lineage.length - 1)
                      const Expanded(
                        child: VerticalDivider(width: 1, color: AppColors.borderSubtle),
                      ),
                  ],
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.s4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(session.lineage[i].title, style: AppTextStyles.label),
                        const SizedBox(height: 2),
                        Text(
                          '${session.lineage[i].author} · ${session.lineage[i].note}',
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Safety extends StatelessWidget {
  const _Safety({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final line in session.safety)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.s2),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 3),
                  child: Icon(Icons.verified_user_outlined,
                      size: 14, color: AppColors.iconSecondary),
                ),
                const SizedBox(width: AppSpacing.s2),
                Expanded(child: Text(line, style: AppTextStyles.bodySm)),
              ],
            ),
          ),
      ],
    );
  }
}
