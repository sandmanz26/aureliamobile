import 'dart:ui';

import 'package:flutter/material.dart';
import '../../core/data/people.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/photo_circle.dart';
import '../chat/chat_session_controller.dart';
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
    // "All" is the catalogue as everyone else sees it; a draft belongs to you
    // and shows only where it is yours. That is what makes the filter worth a
    // tap rather than a narrowing of the same list.
    final shown = _mineOnly
        ? kSessions.where((s) => s.author == kCurrentUser).toList()
        : kPublishedSessions;

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
                      // 24/24 Regular in the frame — titleLg is semibold, so
                      // the weight is overridden rather than the style reused
                      // wholesale.
                      child: Text('Sessions',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleLg.copyWith(
                              height: 24 / 24, fontWeight: FontWeight.w400)),
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
                        // The frame draws this one at 8 and the wider chip at
                        // 12; it is 56 across because of it.
                        sidePadding: AppSpacing.s2,
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

/// Figma "Frame 10" (16523:14716) — a session as one line, read from the node
/// rather than eyeballed: 362x68, radius 20, 16 left and right, 18 top and
/// bottom, 12 between blocks, `primaryAxisAlignItems: MAX` so the figure is
/// pushed to the end.
///
/// The height is held rather than left to the content. Our body and label
/// styles carry 24 and 16 of line height where the frame's text block is 32
/// tall in total, so letting the rows size themselves is what made them 88.
///
/// **Two tap targets, not one.** The play disc opens the player; the rest of
/// the row opens that session's conversation, which is what the frame's own
/// prototype does — its transition lands on 16523:8166, a cockpit thread.
class _SessionRow extends StatelessWidget {
  const _SessionRow({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    final outcome = session.outcome.isEmpty ? null : session.outcome.first;
    final down = outcome != null &&
        (outcome.value.trim().startsWith('\u2212') ||
            outcome.value.trim().startsWith('-'));

    return Container(
      height: 68,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surface,
        // 20 is a raw value in the frame, and not a Figma variable either.
        borderRadius: BorderRadius.circular(20),
        boxShadow: _cardShadow,
      ),
      child: Stack(
        children: [
          // SizedBox.expand, not a bare Padding: the Row inside is only 35
          // tall, so the Stack would size to that and every Positioned below
          // would be measured from a box 16.5px lower than the card. The play
          // disc landed exactly that far under its artwork before this.
          SizedBox.expand(
            child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.md),
            child: Row(
              children: [
                // Drawn here for layout; the tappable copy of it is the last
                // child of the Stack.
                PhotoCircle(
                    photo: session.photo, size: 32, gradient: session.gradient),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(session.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            height: 19 / 14,
                            color: AppColors.textPrimary,
                          )),
                      const SizedBox(height: AppSpacing.s1),
                      _MetaLine(session: session),
                    ],
                  ),
                ),
                if (outcome != null) ...[
                  const SizedBox(width: AppSpacing.s3),
                  Tooltip(
                    message: outcome.label,
                    child: Container(
                      height: 25,
                      alignment: Alignment.center,
                      // The frame's own asymmetry: 9 before the arrow, 12
                      // after the figure.
                      padding: const EdgeInsets.fromLTRB(9, 3, 12, 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFBED),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                              down
                                  ? Icons.arrow_downward_rounded
                                  : Icons.arrow_upward_rounded,
                              size: 14,
                              color: AppPrimitives.success600),
                          const SizedBox(width: AppSpacing.s1),
                          Text(outcome.value,
                              style: const TextStyle(
                                fontSize: 12,
                                height: 19 / 12,
                                color: AppPrimitives.black,
                              )),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
            ),
          ),

          // Above the copy, not below it: a Text inside a Stack swallows the
          // tap meant for a full-card overlay beneath it. This codebase has
          // been bitten by that before, which is why it is written down.
          Positioned.fill(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                // The container opens this session's own thread, already
                // made — not a blank cockpit. The disc above plays it.
                onTap: () => Navigator.of(context).pushNamed(
                  '/chat',
                  arguments: ChatArgs(slug: session.slug),
                ),
                child: const SizedBox.expand(),
              ),
            ),
          ),

          // And the disc above that, so the smaller target wins inside the
          // larger one. 18 is where the 32px disc centres in a 68 row.
          Positioned(
            left: AppPadding.md,
            top: 18,
            width: 32,
            height: 32,
            child: _PlayDisc(session: session),
          ),
        ],
      ),
    );
  }
}

/// The frame's play affordance: an 11px rounded
/// triangle inside a 16px disc of white at a fifth opacity over a blur. Not a
/// bare glyph — the disc is what makes it read as a control on a photograph
/// that could be any colour.
class _PlayDisc extends StatelessWidget {
  const _PlayDisc({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
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
              ClipOval(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                  child: Container(
                    width: 16,
                    height: 16,
                    alignment: Alignment.center,
                    color: Colors.white.withValues(alpha: 0.2),
                    child: const Icon(Icons.play_arrow_rounded,
                        size: 11, color: AppColors.iconInverse),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Author, run time, and the two markers — all at the frame's 10/12 in #525252,
/// separated by its 10px hairline at a fifth of black.
///
/// **The markers are not in the frame.** The recreated glyph and the Published
/// label were asked for on top of it, and this line is where they cost least:
/// the row is 68 tall and already full, so a third block or a second pill
/// would have had to grow it.
class _MetaLine extends StatelessWidget {
  const _MetaLine({required this.session});

  final SessionRecord session;

  static const _style = TextStyle(
    fontSize: 10,
    height: 12 / 10,
    color: Color(0xFF525252),
  );

  @override
  Widget build(BuildContext context) {
    // Published is shown on your own work only, and that is a judgement call
    // rather than something the frame says. The label exists to separate a
    // session you have put out from one still sitting in the cockpit — a
    // distinction that only has two sides for the person who made it. On a
    // stranger's row there is no unpublished case to contrast with, so it
    // would be a badge every row wears, which says nothing and costs the
    // author its width on a 10px line.
    final mine = session.author == kCurrentUser;

    return Row(
      children: [
        // Clone-and-modify, said in one glyph. The same mark the app uses for
        // Recreate everywhere else, so it needs no legend.
        if (session.isRecreated) ...[
          Tooltip(
            message: 'Recreated from ${session.lineage[1].author}',
            child: const Icon(Icons.shuffle, size: 12, color: Color(0xFF525252)),
          ),
          const SizedBox(width: AppSpacing.s1),
        ],
        Flexible(
          child: Text(session.author,
              maxLines: 1, overflow: TextOverflow.ellipsis, style: _style),
        ),
        const _MetaDivider(),
        Text(session.durationLabel, style: _style),
        // A draft says nothing rather than saying "Draft" — the absence is the
        // state, which is what was asked for.
        if (mine && isPublished(session)) ...[
          const _MetaDivider(),
          const Text('Published', style: _style),
        ],
      ],
    );
  }
}

class _MetaDivider extends StatelessWidget {
  const _MetaDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 10,
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.s2),
      color: AppPrimitives.black.withValues(alpha: 0.2),
    );
  }
}

class _ScopeChip extends StatelessWidget {
  const _ScopeChip({
    required this.label,
    required this.active,
    required this.onTap,
    this.sidePadding = AppSpacing.s3,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;
  final double sidePadding;

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
          padding: EdgeInsets.symmetric(horizontal: sidePadding),
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
