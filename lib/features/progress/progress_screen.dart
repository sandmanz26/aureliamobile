import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/data/progress.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/objective_sheet.dart';
import '../../core/widgets/photo_circle.dart';
import '../chat/chat_session_controller.dart';
import '../player/player_screen.dart';

/// The card shadow every surface in this design shares (Figma effect
/// 16520:822).
const _cardShadow = <BoxShadow>[
  BoxShadow(
      color: Color(0x0D000000), blurRadius: 24, spreadRadius: 4,
      offset: Offset(0, 5)),
];

/// The lineage card's own, which is not that one: tighter and darker.
const _lineageShadow = <BoxShadow>[
  BoxShadow(color: Color(0x14000000), blurRadius: 14, offset: Offset(0, 4)),
];

const _ink = AppColors.textPrimary; // #3C2405
const _muted = Color(0xFF525252);
const _quiet = Color(0xFF9A9A9A);
const _rule = Color(0xFFD6D6D6);
const _hairline = Color(0xFFF0F0F0);
const _green = Color(0xFF0CBA65);

/// Every size on this screen is read off the frames' leaf nodes rather than
/// their depth-4 summaries, because the summaries stop before the text nodes —
/// type is the one thing a shallow read cannot give you, and the thing that
/// reads wrong first.
TextStyle _type(
  double size,
  double line, {
  FontWeight weight = FontWeight.w400,
  Color color = _ink,
}) =>
    AppTextStyles.bodyMd.copyWith(
      fontSize: size,
      height: line / size,
      fontWeight: weight,
      color: color,
    );

/// What the route hands this screen: which session, and which tab to open on.
class ProgressRequest {
  const ProgressRequest({required this.slug, this.tab = ProgressTab.chapters});

  final String slug;
  final ProgressTab tab;
}

/// Figma "Progress" (16523:19484 / 19606 / 19752) — what a session has done
/// since it was made, behind Insights in the cockpit's menu.
///
/// Three tabs over one shell, which is how the frames are drawn: the header
/// and the chip row are identical across all three and only the body changes.
class ProgressScreen extends StatefulWidget {
  const ProgressScreen({
    super.key,
    required this.slug,
    this.tab = ProgressTab.chapters,
  });

  final String slug;
  final ProgressTab tab;

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  late ProgressTab _tab = widget.tab;
  String? _openVersion = 'v3';

  @override
  Widget build(BuildContext context) {
    final session = findSession(widget.slug);
    if (session == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          Navigator.of(context)
              .pushNamedAndRemoveUntil('/sessions', (_) => false);
        }
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    final progress = progressFor(session);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        // A Column, not a ListView: the header sits outside the scroller so it
        // stays put, as it does on every other screen here.
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: 68,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppPadding.page),
                child: Row(
                  children: [
                    CircleSurfaceButton(
                      icon: Icons.arrow_back,
                      tooltip: 'Back',
                      size: 44,
                      onPressed: () => Navigator.of(context).maybePop(),
                    ),
                    const SizedBox(width: AppPadding.page),
                    Expanded(
                      child: Text('Sessions',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleLg),
                    ),
                    CircleSurfaceButton(
                      icon: Icons.more_horiz,
                      tooltip: 'More options',
                      size: 44,
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(AppPadding.page),
                children: [
                  // 35 tall, radius 40, 12/8 padding, 8 to the label, 7 apart.
                  SizedBox(
                    height: 35,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        for (final entry in const [
                          (
                            ProgressTab.chapters,
                            'Chapters',
                            Icons.menu_book_outlined
                          ),
                          (
                            ProgressTab.social,
                            'Social Impact',
                            Icons.people_outline
                          ),
                          (
                            ProgressTab.insights,
                            'Insights',
                            Icons.auto_awesome
                          ),
                        ])
                          Padding(
                            padding: const EdgeInsets.only(right: 7),
                            child: _Chip(
                              label: entry.$2,
                              icon: entry.$3,
                              active: _tab == entry.$1,
                              onTap: () => setState(() => _tab = entry.$1),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  if (_tab == ProgressTab.chapters)
                    _Chapters(
                      session: session,
                      progress: progress,
                      openVersion: _openVersion,
                      onToggle: (id) => setState(
                          () => _openVersion = _openVersion == id ? null : id),
                      onEditObjective: () async {
                        final next = await showObjectiveSheet(
                            context, progress.objective);
                        if (next == null || !context.mounted) return;
                        // Written to lib/, not held here: the screen is not
                        // where a goal should be kept.
                        writeObjective(session.slug, next);
                        setState(() {});
                      },
                    )
                  else if (_tab == ProgressTab.social)
                    _SocialImpact(session: session, progress: progress)
                  else
                    _Insights(progress: progress),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.icon,
    required this.active,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
        decoration: BoxDecoration(
          color: active ? _ink : Colors.transparent,
          border: Border.all(color: active ? _ink : _rule),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? AppColors.textInverse : _ink),
            const SizedBox(width: AppSpacing.s2),
            Text(label,
                style: _type(12, 19,
                    color: active ? AppColors.textInverse : _ink)),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------- chapters --

class _Chapters extends StatelessWidget {
  const _Chapters({
    required this.session,
    required this.progress,
    required this.openVersion,
    required this.onToggle,
    required this.onEditObjective,
  });

  final SessionRecord session;
  final Progress progress;
  final String? openVersion;
  final ValueChanged<String> onToggle;

  /// The one editable thing on this screen, and the pencil did nothing.
  final VoidCallback onEditObjective;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Figma "Frame 10" (16523:19525) — 362x68, 16 all round, 12 between
        // blocks, and the one card on this screen with a gradient hairline: it
        // is what every figure on the other two tabs is measured against, and
        // the only thing here you edit.
        Container(
          height: 68,
          padding: const EdgeInsets.all(1),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            boxShadow: _cardShadow,
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFFFE682), Color(0xFFFCC181)],
            ),
          ),
          child: Container(
            // 16 all round in the frame. Figma draws the hairline INSIDE the
            // card, overlaying the padding box; the ring above is real layout,
            // 1px on every edge, so a pixel comes off the vertical padding and
            // the card still stands at the frame's 68.
            padding: const EdgeInsets.symmetric(
                horizontal: AppPadding.md, vertical: AppPadding.md - 1),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(19),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFFF1DB),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.adjust, size: 20, color: _ink),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Objective',
                          style: _type(12, 12,
                              weight: FontWeight.w300, color: _muted)),
                      const SizedBox(height: AppSpacing.s1),
                      Text(progress.objective,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: _type(14, 19)),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.s3),
                Tooltip(
                  message: 'Edit objective',
                  child: InkWell(
                    onTap: () => onEditObjective(),
                    child:
                        const Icon(Icons.edit_outlined, size: 16, color: _ink),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.s8),
        Text('Version History',
            style: _type(14, 14, weight: FontWeight.w300, color: _quiet)),
        for (final version in progress.versions) ...[
          const SizedBox(height: AppPadding.md),
          _VersionCard(
            version: version,
            open: openVersion == version.id,
            onToggle: () => onToggle(version.id),
            onPlay: () => Navigator.of(context).pushNamed(
              '/play',
              arguments:
                  PlayRequest(slug: session.slug, versionId: version.id),
            ),
            // Chapters is the version history — the cockpit's menu no longer
            // carries a second one — so going back to a cut happens here, and
            // the work lands in the conversation because that is where this
            // session's changes are accounted for.
            onRevert: () {
              final chat = ChatSessionScope.read(context)
                ..pointAt(
                    id: version.id, label: version.title, slug: session.slug)
                ..sayReverted(version.title);
              assert(chat.currentVersionId == version.id);
              Navigator.of(context).pop();
            },
          ),
        ],
      ],
    );
  }
}

/// One cut of the session — Figma "card" (16523:19540).
///
/// The art is 120 tall under a fifth of black, the two controls sit on a 32px
/// row inset 16 from the card, and the body is 16 all round.
class _VersionCard extends StatelessWidget {
  const _VersionCard({
    required this.version,
    required this.open,
    required this.onToggle,
    required this.onPlay,
    required this.onRevert,
  });

  final Version version;
  final bool open;
  final VoidCallback onToggle;
  final VoidCallback onPlay;

  /// Point the draft back at this cut and say so in the thread.
  final VoidCallback onRevert;

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: _cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            height: 120,
            child: Stack(
              children: [
                // Not wrapped in a Positioned: CoverImage is one already, and
                // two of them writing the same parent data is an assertion.
                CoverImage(
                  photo: version.photo,
                  gradient: version.gradient,
                  width: 724,
                  height: 240,
                  scrim: false,
                ),
                // The frame darkens the art by a fifth so the two controls on
                // it read at any cover.
                const Positioned.fill(
                    child: ColoredBox(color: Color(0x33000000))),
                Positioned(
                  left: AppPadding.md,
                  right: AppPadding.md,
                  top: AppPadding.md,
                  height: 32,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // The glyph plays this cut, not the session: each version
                      // is its own recording, and hearing what a change did is
                      // the reason the card carries a figure for it at all.
                      Tooltip(
                        message: 'Play ${version.title}',
                        child: InkWell(
                          onTap: onPlay,
                          customBorder: const CircleBorder(),
                          child: ClipOval(
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                              child: Container(
                                width: 32,
                                height: 32,
                                color: const Color(0x33FFFFFF),
                                child: const Icon(Icons.play_arrow,
                                    size: 16, color: AppColors.textInverse),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const Spacer(),
                      // Revert sits beside the figure it would undo, on the
                      // art rather than in the body: it acts on the cut, and
                      // the body is about what the cut did.
                      Tooltip(
                        message: 'Revert to ${version.title}',
                        child: InkWell(
                          onTap: onRevert,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          child: ClipRRect(
                            borderRadius:
                                BorderRadius.circular(AppRadius.full),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                              child: Container(
                                height: 32,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.s2 + 2),
                                alignment: Alignment.center,
                                color: const Color(0x33FFFFFF),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.history,
                                        size: 14,
                                        color: AppColors.textInverse),
                                    const SizedBox(width: AppSpacing.s1),
                                    Text('Revert',
                                        style: _type(12, 12,
                                            weight: FontWeight.w500,
                                            color: AppColors.textInverse)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s2),
                      // 8 all round, 4 to the figure, and the figure is green —
                      // not the ink token, which is what it was read as before.
                      Container(
                        height: 32,
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFBED),
                          borderRadius: BorderRadius.circular(40),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.arrow_upward,
                                size: 16, color: _green),
                            const SizedBox(width: AppSpacing.s1),
                            Text(version.delta,
                                style: _type(14, 19,
                                    weight: FontWeight.w500, color: _green)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppPadding.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                InkWell(
                  onTap: onToggle,
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(version.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: _type(14, 21)),
                      ),
                      const SizedBox(width: AppSpacing.s2),
                      Icon(
                          open
                              ? Icons.keyboard_arrow_up
                              : Icons.keyboard_arrow_down,
                          size: 16,
                          color: _ink),
                    ],
                  ),
                ),
                if (open) ...[
                  const SizedBox(height: AppSpacing.s2),
                  // The rule is the frame's own: a 1px hairline the full height
                  // of the block, 4 in from the card's text column and 12 from
                  // the copy, marking the chapter as a quotation rather than
                  // more card text.
                  IntrinsicHeight(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(width: AppSpacing.s1),
                        const SizedBox(
                            width: 1, child: ColoredBox(color: _rule)),
                        const SizedBox(width: AppSpacing.s3),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(version.chapter,
                                  style:
                                      _type(12, 19, weight: FontWeight.w500)),
                              const SizedBox(height: AppSpacing.s2),
                              Text(version.detail,
                                  style: _type(12, 18,
                                      weight: FontWeight.w300, color: _muted)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                // 12 between blocks when the chapter is showing, 16 when it is
                // not — the frame draws the two states as separate cards and
                // they differ.
                SizedBox(height: open ? AppSpacing.s3 : AppPadding.md),
                Row(
                  children: [
                    PhotoCircle(
                        photo: version.authorPhoto,
                        size: 16,
                        gradient: version.gradient),
                    const SizedBox(width: AppSpacing.s2),
                    Expanded(
                      child: Text(version.author,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: _type(10, 10)),
                    ),
                    const Icon(Icons.schedule, size: 10, color: _ink),
                    const SizedBox(width: AppSpacing.s1),
                    Text(version.minutes,
                        style: _type(10, 10, weight: FontWeight.w300)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ----------------------------------------------------------- social impact --

class _SocialImpact extends StatelessWidget {
  const _SocialImpact({required this.session, required this.progress});

  final SessionRecord session;
  final Progress progress;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 174 tall: one 180-wide tile beside two 81s, as the frame has it —
        // earnings is the figure the other two explain.
        SizedBox(
          height: 174,
          child: Row(
            children: [
              SizedBox(
                width: 180,
                child: _Stat(
                    value: progress.earnings, label: 'Earnings', coin: true),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  children: [
                    SizedBox(
                      height: 81,
                      child: _Stat(
                          value: progress.timesPlayed, label: 'Times played'),
                    ),
                    const SizedBox(height: AppSpacing.s3),
                    SizedBox(
                      height: 81,
                      child:
                          _Stat(value: progress.recreated, label: 'Recreated'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppPadding.md),

        // Figma "Highlight/Assessment" (16523:19679) — 20 all round, 20 between
        // the list and See All, 8 inside the list, and each row carries 7 above
        // and below its own copy.
        _Card(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Community', style: _type(14, 19)),
                if (progress.community.isEmpty) ...[
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                      'Nothing yet — this one is not published, so nobody can '
                      'play it but you.',
                      style: _type(12, 19,
                          weight: FontWeight.w300, color: _muted)),
                ],
                for (final event in progress.community) ...[
                  const SizedBox(height: AppSpacing.s2),
                  _CommunityRow(event: event),
                  const SizedBox(height: AppSpacing.s2),
                  // The frame rules under every row here, the last one
                  // included — and at #F0F0F0, lighter than the #D6D6D6 the
                  // lineage card uses.
                  const SizedBox(
                      height: 1, child: ColoredBox(color: _hairline)),
                ],
              ],
            ),
            if (progress.community.isNotEmpty)
              _SeeAll(count: progress.communityTotal),
          ],
        ),
        const SizedBox(height: AppPadding.md),

        // Figma "Highlight/Assessment" (16523:19712).
        _Card(
          shadow: _lineageShadow,
          children: [
            Text('Lineage Tree', style: _type(14, 19)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = 0; i < progress.lineage.length; i++) ...[
                  if (i > 0) ...[
                    const SizedBox(height: AppSpacing.s2),
                    const SizedBox(height: 1, child: ColoredBox(color: _rule)),
                    const SizedBox(height: AppSpacing.s2),
                  ],
                  _LineageRow(
                    entry: progress.lineage[i],
                    gradient: session.gradient,
                    // The 8 of padding falls between the row and the rule, so
                    // the first row carries it below, the last above and the
                    // ones between on both sides.
                    padTop: i > 0,
                    padBottom: i < progress.lineage.length - 1,
                    onTap: () => Navigator.of(context)
                        .pushNamed('/session', arguments: session.slug),
                  ),
                ],
              ],
            ),
            _SeeAll(count: progress.lineageTotal),
          ],
        ),
      ],
    );
  }
}

/// A figure and its name — Figma "Highlight/Assessment" (16523:19649, 19661).
///
/// 20 left and right, 10 top and bottom — not 16 all round — and the figure is
/// Regular 22/25 in plain black, not the bold 28 it had been read as.
class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label, this.coin = false});

  final String value;
  final String label;
  final bool coin;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: AppPadding.page, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: _cardShadow,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (coin) ...[
            const Coin(size: 40),
            const SizedBox(height: 10),
          ],
          FittedBox(
            child: Text(value, style: _type(22, 25, color: Colors.black)),
          ),
          const SizedBox(height: 3),
          Text(label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: _type(12, 19, color: _quiet)),
        ],
      ),
    );
  }
}

/// The coin, as the frame draws it: a gradient disc on #FFE682 -> #FF881B, not
/// a glyph inside a coloured circle. 40 in the earnings tile, 20 on a row.
class Coin extends StatelessWidget {
  const Coin({super.key, this.size = 40});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
        ),
      ),
      child: Center(
        child: Container(
          width: size * 0.675,
          height: size * 0.675,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border:
                Border.all(color: const Color(0x73FFFFFF), width: size / 20),
          ),
        ),
      ),
    );
  }
}

class _CommunityRow extends StatelessWidget {
  const _CommunityRow({required this.event});

  final CommunityEvent event;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        // Top-aligned: the coin sits on the first line of a message that runs
        // to two.
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(children: [
                    TextSpan(
                        text: event.person,
                        style: const TextStyle(
                            decoration: TextDecoration.underline)),
                    TextSpan(text: ' ${event.did}'),
                  ]),
                  style: _type(12, 19),
                ),
                Text(event.when,
                    style: _type(10, 19, color: const Color(0xFF828282))),
              ],
            ),
          ),
          const SizedBox(width: AppPadding.page),
          SizedBox(
            height: 20,
            child: Row(
              children: [
                const Coin(size: 20),
                const SizedBox(width: 3),
                Text(event.coins, style: _type(14, 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LineageRow extends StatelessWidget {
  const _LineageRow({
    required this.entry,
    required this.gradient,
    required this.padTop,
    required this.padBottom,
    required this.onTap,
  });

  final LineageEntry entry;
  final List<Color> gradient;
  final bool padTop;
  final bool padBottom;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.only(
            top: padTop ? AppSpacing.s2 : 0,
            bottom: padBottom ? AppSpacing.s2 : 0),
        child: Row(
          children: [
            PhotoCircle(photo: entry.authorPhoto, size: 35, gradient: gradient),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(entry.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: _type(13, 19)),
                  const SizedBox(height: AppSpacing.s1),
                  Text('Created by ${entry.author}, ${entry.date}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: _type(10, 15, color: _muted)),
                ],
              ),
            ),
            // The frame draws a 16px caret in a 24 box. It points down there
            // because the row is a disclosure in the prototype; here the row
            // opens the session, so it points the way it goes.
            const SizedBox(
              width: 24,
              height: 24,
              child: Icon(Icons.chevron_right, size: 16, color: _ink),
            ),
          ],
        ),
      ),
    );
  }
}

class _SeeAll extends StatelessWidget {
  const _SeeAll({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: InkWell(
        onTap: () {},
        child: Text('See All ($count)', style: _type(12, 18, color: _muted)),
      ),
    );
  }
}

/// A white card at the frame's 20 padding, 20 radius and 20 between its blocks.
class _Card extends StatelessWidget {
  const _Card({required this.children, this.shadow = _cardShadow});

  final List<Widget> children;
  final List<BoxShadow> shadow;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppPadding.page),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: shadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const SizedBox(height: AppPadding.page),
            children[i],
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- insights --

/// Figma "Frame 97" (16523:19792) — 12 between cards, not 16, and each is 16
/// all round with the glyph 12 from a column that runs title, body, date at 8
/// apart.
class _Insights extends StatelessWidget {
  const _Insights({required this.progress});

  final Progress progress;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < progress.insights.length; i++) ...[
          if (i > 0) const SizedBox(height: AppSpacing.s3),
          Container(
            padding: const EdgeInsets.all(AppPadding.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              boxShadow: _cardShadow,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.auto_awesome, size: 20, color: _ink),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(progress.insights[i].title, style: _type(14, 19)),
                      const SizedBox(height: AppSpacing.s2),
                      Text(progress.insights[i].body,
                          style: _type(12, 19,
                              weight: FontWeight.w300, color: _muted)),
                      const SizedBox(height: AppSpacing.s2),
                      Text(progress.insights[i].date,
                          style: _type(10, 15, color: _quiet)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
