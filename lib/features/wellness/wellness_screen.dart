import 'package:flutter/material.dart';

import '../../core/data/signals.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../shell/app_drawer.dart';

/// My Wellness — what Aurelia is allowed to read about you.
///
/// Every other screen spends signals; this is the only one that shows what they
/// are and lets you take them back. So the counts are not decoration: the
/// "4 of 6" and the three meters are computed from the switches below them, and
/// moving any switch moves them. A summary that could disagree with the
/// controls under it would be worse than no summary.
class WellnessScreen extends StatefulWidget {
  const WellnessScreen({super.key});

  @override
  State<WellnessScreen> createState() => _WellnessScreenState();
}

class _WellnessScreenState extends State<WellnessScreen> {
  late final Map<String, bool> _connections = defaultConnections();

  int _connectedIn(SignalGroup group) =>
      sourcesInGroup(group).where((s) => _connections[s.id] ?? false).length;

  @override
  Widget build(BuildContext context) {
    final active = _connections.values.where((on) => on).length;
    final total = _connections.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      // The drawer, not a back arrow: this screen is a nav destination, and
      // the web keeps the menu button on it for that reason. It was the one
      // screen here that sent you back to wherever you came from instead.
      drawer: const AppDrawer(current: '/wellness'),
      appBar: AppBar(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        titleSpacing: AppSpacing.s3,
        leadingWidth: AppPadding.page + 40,
        leading: Builder(
          builder: (context) => Padding(
            padding: const EdgeInsets.only(left: AppPadding.page),
            child: CircleSurfaceButton(
              icon: Icons.menu,
              tooltip: 'Open menu',
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
        ),
        title: Text('My Wellness', style: AppTextStyles.titleLg),
        actions: const [CoinPill(), SizedBox(width: AppPadding.page)],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            AppPadding.page, 0, AppPadding.page, AppSpacing.s12),
        children: [
          // Summary. Everything here is derived from the switches below.
          Container(
            padding: const EdgeInsets.all(AppSpacing.s4),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.xl2),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Active Signals',
                        style: AppTextStyles.bodyMd
                            .copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text('$active', style: AppTextStyles.headlineMd),
                        const SizedBox(width: 6),
                        Text('/ $total Sources', style: AppTextStyles.bodySm),
                      ],
                    ),
                  ],
                ),
                const SizedBox(width: AppSpacing.s4),
                Expanded(
                  child: Column(
                    children: [
                      for (final group in SignalGroup.values) ...[
                        _Meter(
                          label: group.label,
                          connected: _connectedIn(group),
                          total: sourcesInGroup(group).length,
                        ),
                        if (group != SignalGroup.values.last)
                          const SizedBox(height: 6),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          for (final group in SignalGroup.values) ...[
            const SizedBox(height: AppSpacing.s6),
            // 14/14 Light in #9A9A9A — a quieter grey than the secondary ink
            // token, and flush with the cards under it, as the frame has it.
            Text(
              group.label,
              style: AppTextStyles.bodyMd.copyWith(
                fontWeight: FontWeight.w300,
                height: 1,
                color: const Color(0xFF9A9A9A),
              ),
            ),
            const SizedBox(height: AppSpacing.s3),
            for (final source in sourcesInGroup(group)) ...[
              _SourceRow(
                source: source,
                on: _connections[source.id] ?? false,
                onChanged: (next) =>
                    setState(() => _connections[source.id] = next),
              ),
              const SizedBox(height: AppSpacing.s3),
            ],
          ],
          const SizedBox(height: AppSpacing.s4),
          _RequestRow(onTap: () => _openRequestSheet(context)),
        ],
      ),
    );
  }

  void _openRequestSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
      ),
      builder: (_) => const _RequestSheet(),
    );
  }
}

/// Share of a group's sources that are connected.
class _Meter extends StatelessWidget {
  const _Meter({required this.label, required this.connected, required this.total});

  final String label;
  final int connected;
  final int total;

  @override
  Widget build(BuildContext context) {
    final share = total == 0 ? 0.0 : connected / total;
    return Semantics(
      label: '$label: $connected of $total connected',
      child: Row(
        children: [
          SizedBox(width: 84, child: Text(label, style: AppTextStyles.bodySm)),
          const SizedBox(width: 10),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.full),
              child: Container(
                height: 6,
                color: const Color(0xFFFBE7D2),
                alignment: Alignment.centerLeft,
                // No minimum width: a group with nothing connected must read as
                // empty, not as a sliver that suggests something is on.
                child: FractionallySizedBox(
                  widthFactor: share,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFFB25E), Color(0xFFFF881B)],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SourceRow extends StatelessWidget {
  const _SourceRow({required this.source, required this.on, required this.onChanged});

  final SignalSource source;
  final bool on;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    // 362x56 in the frame: radius 20, 16 either side. The height is held so a
    // long source name cannot grow the row past its neighbours.
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: AppPadding.md),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFFFFF1DB),
              shape: BoxShape.circle,
            ),
            child: Icon(source.icon, size: 16, color: AppColors.iconStrong),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Text(source.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.bodyMd),
          ),
          _Switch(
            key: ValueKey('switch-${source.id}'),
            on: on,
            label: source.name,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _Switch extends StatelessWidget {
  const _Switch({
    super.key,
    required this.on,
    required this.label,
    required this.onChanged,
  });

  final bool on;
  final String label;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      toggled: on,
      label: '${on ? 'Disconnect' : 'Connect'} $label',
      child: GestureDetector(
        onTap: () => onChanged(!on),
        // 40x22 with an 18 knob inset 2, so 2 of track shows all the way
        // round it. Off is the frame's own #E5E5E5, not the elevated
        // background token — that token is warm and read as a third state
        // beside the white knob.
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          width: 40,
          height: 22,
          decoration: BoxDecoration(
            color: on ? AppColors.textPrimary : const Color(0xFFE5E5E5),
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 160),
            alignment: on ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              margin: const EdgeInsets.all(2),
              width: 18,
              height: 18,
              decoration: const BoxDecoration(
                color: AppColors.surface,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RequestRow extends StatelessWidget {
  const _RequestRow({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.xl2),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: Color(0xFFFF881B),
                shape: BoxShape.circle,
              ),
              child: Text('!',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.label.copyWith(
                    color: AppColors.textInverse,
                    fontWeight: FontWeight.w700,
                    height: 2,
                  )),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Don’t see your favorite device or app?',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm
                          .copyWith(fontWeight: FontWeight.w500)),
                  Text('Tell us what you’d like to see next!',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.caption),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.iconSecondary),
          ],
        ),
      ),
    );
  }
}

/// Ask for a source Aurelia does not support yet.
class _RequestSheet extends StatefulWidget {
  const _RequestSheet();

  @override
  State<_RequestSheet> createState() => _RequestSheetState();
}

class _RequestSheetState extends State<_RequestSheet> {
  final _controller = TextEditingController();
  String? _sent;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canSend = _controller.text.trim().isNotEmpty;
    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.s6,
        right: AppSpacing.s6,
        top: AppSpacing.s5,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.s8,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.close),
              tooltip: 'Close',
            ),
          ),
          const _SpiralMark(),
          const SizedBox(height: AppSpacing.s5),
          if (_sent != null) ...[
            Text('Thanks — that’s logged.',
                textAlign: TextAlign.center, style: AppTextStyles.titleMd),
            const SizedBox(height: AppSpacing.s2),
            Text('We’ll let you know if $_sent becomes a source you can connect.',
                textAlign: TextAlign.center, style: AppTextStyles.bodySm),
            const SizedBox(height: AppSpacing.s5),
            _SendButton(label: 'Done', onPressed: () => Navigator.of(context).pop()),
          ] else ...[
            SizedBox(
              width: 250,
              child: Text('Don’t see your favorite device or app?',
                  textAlign: TextAlign.center, style: AppTextStyles.titleMd),
            ),
            const SizedBox(height: AppSpacing.s2),
            Text('Tell us what you’d like to see next!',
                textAlign: TextAlign.center, style: AppTextStyles.bodySm),
            const SizedBox(height: AppSpacing.s5),
            TextField(
              controller: _controller,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'E.g. Garmin',
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s5, vertical: AppSpacing.s4),
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
                  borderSide: const BorderSide(color: AppColors.brandEmphasis),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            _SendButton(
              label: 'Send',
              // A submit that appears to do nothing is worse than a disabled one.
              onPressed: canSend
                  ? () => setState(() => _sent = _controller.text.trim())
                  : null,
            ),
          ],
        ],
      ),
    );
  }
}

class _SendButton extends StatelessWidget {
  const _SendButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.iconDefault,
          disabledBackgroundColor: AppColors.iconDefault.withValues(alpha: 0.4),
          foregroundColor: AppColors.textInverse,
          disabledForegroundColor: AppColors.textInverse.withValues(alpha: 0.7),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
        ),
        child: Text(label, style: AppTextStyles.buttonLg),
      ),
    );
  }
}

/// Aurelia's mark, as it appears on the request sheet.
class _SpiralMark extends StatelessWidget {
  const _SpiralMark();

  @override
  Widget build(BuildContext context) =>
      const SizedBox(width: 64, height: 64, child: AureliaLogo(iconSize: 64, markOnly: true));
}
