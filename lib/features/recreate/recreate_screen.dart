import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/cover_image.dart';
import '../chat/chat_screen.dart' show RecreateBrief;

/// Recreate — forking someone else's session.
///
/// The point of the community loop: you do not start from a blank prompt, you
/// start from something that already worked for someone and say what should be
/// different. So this screen is a diff, not a form — the original is pinned at
/// the top, every control states a change against it, and the summary at the
/// bottom is literally the brief handed to chat.
///
/// Attribution is not optional and not a toggle: a fork keeps its lineage, and
/// the original creator is credited and paid coins on every play.
class RecreateScreen extends StatefulWidget {
  const RecreateScreen({super.key, required this.slug});

  final String slug;

  @override
  State<RecreateScreen> createState() => _RecreateScreenState();
}

class _RecreateScreenState extends State<RecreateScreen> {
  static const _voices = ['Same as original', 'Female · warm', 'Male · low', 'No voice'];
  static const _paces = ['Slower', 'Same', 'Faster'];

  final _noteController = TextEditingController();

  late double _minutes;
  String _voice = _voices.first;
  String _pace = _paces[1];
  late Set<String> _layers;
  bool _ready = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_ready) return;
    final session = findSession(widget.slug);
    if (session == null) return;
    _minutes = session.minutes.toDouble();
    _layers = session.layers.map((layer) => layer.id).toSet();
    _ready = true;
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  /// Only differences make the list — a fork that changes nothing is a replay.
  List<LabelValue> _changes(SessionRecord session) {
    final dropped =
        session.layers.where((layer) => !_layers.contains(layer.id)).toList();
    return [
      if (_minutes.round() != session.minutes)
        LabelValue('Length', '${session.minutes} → ${_minutes.round()} min'),
      if (_voice != _voices.first) LabelValue('Voice', _voice),
      if (_pace != _paces[1]) LabelValue('Pace', _pace),
      if (dropped.isNotEmpty)
        LabelValue('Removed', dropped.map((layer) => layer.name).join(', ')),
      if (_noteController.text.trim().isNotEmpty)
        LabelValue('Note', _noteController.text.trim()),
    ];
  }

  void _applyPreset(SessionRecord session, String change) {
    setState(() {
      if (change.contains('longer')) {
        _minutes = (session.minutes * 1.5).roundToDouble().clamp(3, 60);
      } else if (change.contains('shorter')) {
        _minutes = (session.minutes * 0.6).roundToDouble().clamp(3, 60);
      } else if (change.contains('Slowed') || change.contains('slower')) {
        _pace = 'Slower';
      } else if (change.contains('male voice')) {
        _voice = 'Male · low';
      } else if (change.contains('guiding voice')) {
        _voice = 'Female · warm';
      } else if (change.contains('Removed the guidance') || change.contains('Dropped')) {
        for (final layer in session.layers) {
          if (layer.id == 'voice' || layer.id == 'pulse' || layer.id == 'affirm') {
            _layers.remove(layer.id);
            break;
          }
        }
      } else {
        _noteController.text = change;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = findSession(widget.slug);
    if (session == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.of(context).pop();
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    final changes = _changes(session);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        title: Text('Recreate', style: AppTextStyles.label),
        centerTitle: true,
        leading: IconButton(
          onPressed: () => Navigator.of(context).maybePop(),
          icon: const Icon(Icons.arrow_back),
          color: AppColors.iconDefault,
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.lg, 0, AppPadding.lg, AppSpacing.s6),
          children: [
            // The original, fixed — everything below is stated against it.
            Container(
              padding: const EdgeInsets.all(AppSpacing.s3),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border.all(color: AppColors.borderSubtle),
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 64,
                    height: 64,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: Stack(
                        children: [
                          CoverImage(
                            photo: session.photo,
                            gradient: session.gradient,
                            width: 160,
                            height: 160,
                            scrim: false,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BASED ON',
                            style: AppTextStyles.caption.copyWith(letterSpacing: 1.4)),
                        const SizedBox(height: 2),
                        Text(session.title, style: AppTextStyles.label),
                        const SizedBox(height: 2),
                        Text(
                          '${session.author} · ${session.minutes} min · ${session.recreated} recreations',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s5),
            Text(
              'Tell Aurelia what should be different. Anything you leave alone '
              'stays as ${session.author} made it.',
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary),
            ),

            const SizedBox(height: AppSpacing.s5),
            Text('START FROM A COMMON EDIT', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s3),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: session.commonChanges.length,
                separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                itemBuilder: (context, index) {
                  final change = session.commonChanges[index];
                  return OutlinedButton(
                    onPressed: () => _applyPreset(session, change.label),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                      side: const BorderSide(color: AppColors.borderSubtle),
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.auto_awesome, size: 13),
                        const SizedBox(width: 6),
                        Text(change.label, style: AppTextStyles.label),
                        const SizedBox(width: 6),
                        Text(change.value, style: AppTextStyles.caption),
                      ],
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: AppSpacing.s6),
            Row(
              children: [
                Expanded(child: Text('LENGTH', style: AppTextStyles.overline)),
                Text('${_minutes.round()} min',
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary)),
              ],
            ),
            Slider(
              value: _minutes,
              min: 3,
              max: 60,
              divisions: 57,
              activeColor: AppColors.brandEmphasis,
              onChanged: (value) => setState(() => _minutes = value),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('3 min', style: AppTextStyles.caption),
                Text('original ${session.minutes} min', style: AppTextStyles.caption),
                Text('60 min', style: AppTextStyles.caption),
              ],
            ),

            const SizedBox(height: AppSpacing.s6),
            Text('VOICE', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s3),
            Wrap(
              spacing: AppSpacing.s2,
              runSpacing: AppSpacing.s2,
              children: [
                for (final option in _voices)
                  _ChoicePill(
                    label: option,
                    selected: _voice == option,
                    onTap: () => setState(() => _voice = option),
                  ),
              ],
            ),

            const SizedBox(height: AppSpacing.s6),
            Text('PACE', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s3),
            Row(
              children: [
                for (final option in _paces)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.s2),
                      child: _ChoicePill(
                        label: option,
                        selected: _pace == option,
                        expand: true,
                        onTap: () => setState(() => _pace = option),
                      ),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: AppSpacing.s6),
            Text('KEEP THESE LAYERS', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s3),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border.all(color: AppColors.borderSubtle),
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Column(
                children: [
                  for (var i = 0; i < session.layers.length; i++) ...[
                    if (i > 0) const Divider(height: 1),
                    CheckboxListTile(
                      value: _layers.contains(session.layers[i].id),
                      onChanged: (value) => setState(() {
                        if (value == true) {
                          _layers.add(session.layers[i].id);
                        } else {
                          _layers.remove(session.layers[i].id);
                        }
                      }),
                      controlAffinity: ListTileControlAffinity.leading,
                      activeColor: AppColors.brandEmphasis,
                      title: Text(session.layers[i].name,
                          style: AppTextStyles.bodySm
                              .copyWith(color: AppColors.textPrimary)),
                      subtitle: Text(session.layers[i].detail,
                          style: AppTextStyles.caption),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s6),
            Text('ANYTHING ELSE', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s3),
            TextField(
              controller: _noteController,
              maxLines: 3,
              onChanged: (_) => setState(() {}),
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'e.g. keep the ocean under the whole thing, '
                    'and end without a chime',
                hintStyle: AppTextStyles.bodySm,
                contentPadding: const EdgeInsets.all(AppPadding.md),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  borderSide: const BorderSide(color: AppColors.borderSubtle),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  borderSide: const BorderSide(color: AppColors.borderSubtle),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  borderSide: const BorderSide(color: AppColors.brandEmphasis),
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.s6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppPadding.md),
              decoration: BoxDecoration(
                color: AppColors.backgroundElevated,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('YOUR VERSION', style: AppTextStyles.overline),
                  const SizedBox(height: AppSpacing.s3),
                  if (changes.isEmpty)
                    Text(
                      'No changes yet — pick an edit above, or send it as-is to '
                      'start tuning in chat.',
                      style: AppTextStyles.bodySm,
                    )
                  else
                    for (final change in changes)
                      Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 3),
                              child: Icon(Icons.repeat,
                                  size: 14, color: AppColors.iconSecondary),
                            ),
                            const SizedBox(width: AppSpacing.s2),
                            Expanded(
                              child: Text.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text: '${change.label}: ',
                                      style: AppTextStyles.bodySm,
                                    ),
                                    TextSpan(
                                      text: change.value,
                                      style: AppTextStyles.bodySm
                                          .copyWith(color: AppColors.textPrimary),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  const SizedBox(height: AppSpacing.s3),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 2),
                        child: Icon(Icons.monetization_on_outlined,
                            size: 12, color: AppColors.iconSecondary),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Published as a fork of “${session.title}”. ${session.author} '
                          'stays credited in the lineage and earns 10 coins each time '
                          'your version is played.',
                          style: AppTextStyles.caption,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      // The commit action stays reachable however far down the form you are.
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.lg, AppSpacing.s3, AppPadding.lg, AppSpacing.s3),
          decoration: const BoxDecoration(
            color: AppColors.background,
            border: Border(top: BorderSide(color: AppColors.borderSubtle)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton.icon(
                onPressed: () => Navigator.of(context).pushNamed(
                  '/chat',
                  arguments: RecreateBrief(
                    title: session.title,
                    author: session.author,
                    minutes: _minutes.round(),
                    changes: changes
                        .map((change) => '${change.label}: ${change.value}')
                        .toList(),
                  ),
                ),
                icon: const Icon(Icons.auto_awesome, size: 18),
                label: const Text('Create my version'),
              ),
              const SizedBox(height: AppSpacing.s2),
              Text('Opens in chat so you can keep tuning it out loud.',
                  style: AppTextStyles.caption),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChoicePill extends StatelessWidget {
  const _ChoicePill({
    required this.label,
    required this.selected,
    required this.onTap,
    this.expand = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 40,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
        decoration: BoxDecoration(
          color: selected ? AppColors.brandDefault : AppColors.surface,
          border: Border.all(
            color: selected ? Colors.transparent : AppColors.borderSubtle,
          ),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Text(
          label,
          style: AppTextStyles.label.copyWith(
            color: selected ? AppColors.textStrong : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}
