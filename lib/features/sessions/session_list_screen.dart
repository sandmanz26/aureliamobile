import 'package:flutter/material.dart';
import '../../core/data/people.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/photo_circle.dart';
import '../player/player_screen.dart';
import '../shell/app_drawer.dart';

/// The card shadow every surface in this design shares (Figma effect
/// 16520:822).
const _cardShadow = <BoxShadow>[
  BoxShadow(
      color: Color(0x0D000000), blurRadius: 24, spreadRadius: 4,
      offset: Offset(0, 5)),
];

/// Figma 16523:14684 — Sessions.
///
/// Its own screen, not the browse surface. The drawer lists Explore and
/// Sessions separately and the two frames are different; for a while this
/// route and Explore were one screen wearing two names, which put Explore's
/// shelves under the Sessions title.
///
/// There is no Chat entry anywhere in the design — the cockpit is reached by
/// "New session" in the drawer, and by a session's own rows here.
class SessionListScreen extends StatefulWidget {
  const SessionListScreen({super.key});

  @override
  State<SessionListScreen> createState() => _SessionListScreenState();
}

class _SessionListScreenState extends State<SessionListScreen> {
  bool _mineOnly = false;

  @override
  Widget build(BuildContext context) {
    final shown = _mineOnly
        ? kSessions.where((s) => s.author == kCurrentUser).toList()
        : kSessions;

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/sessions'),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header: 68 tall on the page gutter, 12 top and bottom, 20
            // between the menu and the title.
            SizedBox(
              height: 68,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: Row(
                  children: [
                    Builder(
                      builder: (context) => CircleSurfaceButton(
                        icon: Icons.menu,
                        tooltip: 'Open menu',
                        size: 44,
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    const SizedBox(width: AppPadding.page),
                    Expanded(
                      child: Text('Sessions',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleLg
                              .copyWith(height: 24 / 24)),
                    ),
                    const SizedBox(width: AppPadding.md),
                    const CoinPill(),
                  ],
                ),
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(AppPadding.page),
                children: [
                  // The frame's chips: 35 tall, fully round, 7 apart.
                  Row(
                    children: [
                      _ScopeChip(
                        label: 'All',
                        active: !_mineOnly,
                        onTap: () => setState(() => _mineOnly = false),
                      ),
                      const SizedBox(width: 7),
                      _ScopeChip(
                        label: 'Created by you',
                        active: _mineOnly,
                        onTap: () => setState(() => _mineOnly = true),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),

                  if (shown.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s10),
                      child: Text(
                        'Nothing published yet — a session you make in the '
                        'cockpit lands here.',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySm,
                      ),
                    )
                  else
                    for (final session in shown) ...[
                      _SessionRow(session: session),
                      if (session != shown.last)
                        const SizedBox(height: AppSpacing.s3),
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

/// Figma "Frame 10" (16523:14716) — a session as one line, at the frame's own
/// size: 362x68, radius 20, 16px sides, a 32px round thumbnail, 12px to the
/// text and a 25px-tall figure on the end.
///
/// The height is held rather than left to the content. Our body and label
/// styles carry 24 and 16 of line height where the frame's text block is 32
/// tall in total, so letting the rows size themselves is what made them 88.
class _SessionRow extends StatelessWidget {
  const _SessionRow({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    final outcome = session.outcome.isEmpty ? null : session.outcome.first;
    final down = outcome != null &&
        (outcome.value.trim().startsWith('−') ||
            outcome.value.trim().startsWith('-'));

    return Container(
      height: 68,
      clipBehavior: Clip.antiAlias,
      padding: const EdgeInsets.symmetric(horizontal: AppPadding.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        // 20 is a raw value in the frame, and not a Figma variable either.
        borderRadius: BorderRadius.circular(20),
        boxShadow: _cardShadow,
      ),
      child: Row(
        children: [
          Tooltip(
            message: 'Play ${session.title}',
            child: InkWell(
              onTap: () => Navigator.of(context).pushNamed(
                '/play',
                arguments: PlayRequest(
                    slug: session.slug, origin: ProfileOrigin.community),
              ),
              customBorder: const CircleBorder(),
              child: SizedBox(
                width: 32,
                height: 32,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    PhotoCircle(
                        photo: session.photo,
                        size: 32,
                        gradient: session.gradient),
                    const Icon(Icons.play_arrow_rounded,
                        size: 16, color: AppColors.iconInverse),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: InkWell(
              onTap: () => Navigator.of(context)
                  .pushNamed('/session', arguments: session.slug),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(session.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        height: 19 / 16,
                        color: AppColors.textPrimary,
                      )),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Flexible(
                        child: Text(session.author,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              height: 1,
                              color: AppColors.textSecondary,
                            )),
                      ),
                      const SizedBox(width: AppSpacing.s2),
                      Container(
                          width: 1, height: 10, color: AppColors.border),
                      const SizedBox(width: AppSpacing.s2),
                      Text('${session.totalMinutes} min',
                          style: const TextStyle(
                            fontSize: 12,
                            height: 1,
                            color: AppColors.textSecondary,
                          )),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (outcome != null) ...[
            const SizedBox(width: AppSpacing.s3),
            Tooltip(
              message: outcome.label,
              child: Container(
                height: 25,
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s2),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFBED),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(down ? Icons.trending_down : Icons.trending_up,
                        size: 12, color: AppPrimitives.success600),
                    const SizedBox(width: AppSpacing.s1),
                    Text(outcome.value,
                        style: const TextStyle(
                          fontSize: 12,
                          height: 1,
                          color: AppColors.textPrimary,
                        )),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ScopeChip extends StatelessWidget {
  const _ScopeChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: active,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.full),
        child: Container(
          height: 35,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
          decoration: BoxDecoration(
            color: active ? AppColors.textPrimary : AppColors.surface,
            border: Border.all(
                color: active ? AppColors.textPrimary : const Color(0xFFD6D6D6)),
            borderRadius: BorderRadius.circular(AppRadius.full),
            boxShadow: _cardShadow,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              height: 1,
              color: active ? AppColors.textInverse : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
