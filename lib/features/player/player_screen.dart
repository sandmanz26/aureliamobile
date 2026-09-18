import 'package:flutter/material.dart';
import '../../core/audio/playback_controller.dart';
import '../../core/data/people.dart';
import '../../core/data/recommendations.dart';
import '../../core/data/progress.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../chat/widgets/recommendation_card.dart';

/// What the `/play` route is handed.
///
/// The slug alone cannot say whose session this is: one built in the cockpit
/// has no catalogue entry and borrows a slug to play against, so the screen
/// that opened the player states the entry point rather than leaving the
/// byline to guess from the author's name.
@immutable
class PlayRequest {
  const PlayRequest({required this.slug, this.origin, this.versionId});

  final String slug;
  final ProfileOrigin? origin;

  /// Which cut of it. Progress's version cards ask for one by id; everything
  /// else asks for the session, which is the version that is current.
  final String? versionId;
}

/// Lines the session speaks, shown one at a time under the art. Mock, like
/// everything in `core/data` — as is the bed they play over.
const _cues = <String>[
  'Now take a deep breath in',
  'Hold it — and let the shoulders drop',
  'Breathe out, slower than you came in',
  'Let the next one arrive on its own',
];

/// How much of the sheet shows before anything is dragged. The frame is
/// 402x874 with a 705 hero, so 169 is the frame's own number — held as the
/// peek rather than the hero as a fixed height, which is what lets the screen
/// survive a device that is not 874 tall.
const _sheetPeek = 169.0;

/// How far the skip buttons move the playhead.
const _skip = Duration(seconds: 15);

String _clock(Duration value) {
  final m = value.inMinutes;
  final s = value.inSeconds % 60;
  return '$m:${s.toString().padLeft(2, '0')}';
}

/// Figma "Player" (16523:9905) — the screen behind the play glyph.
///
/// The art is the screen, not a header on it: cover full-bleed, the transport
/// floating on top, and a white sheet (radius 24 on its top corners only) that
/// carries everything you would read rather than hear.
///
/// It is a view onto [PlaybackController], not its owner — walking back to the
/// cockpit leaves the session running, which is the whole point of starting
/// one.
class PlayerScreen extends StatefulWidget {
  const PlayerScreen({
    super.key,
    required this.slug,
    this.origin,
    this.versionId,
  });

  final String slug;
  final ProfileOrigin? origin;

  /// Which cut of the session to play. Null is the session as it stands.
  final String? versionId;

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  final _scroll = ScrollController();
  bool _expanded = false;
  bool _sheetUp = false;
  double _heroHeight = 0;

  @override
  void initState() {
    super.initState();
    // Put this session on the deck. load() no-ops when it is already there, so
    // arriving back from the cockpit does not restart what is playing.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final session = findSession(widget.slug);
      if (session == null || !mounted) return;
      final version = findVersion(session, widget.versionId);
      PlaybackScope.read(context).load(Track(
        // A cut is its own recording, so it gets its own key. Without that the
        // deck would see the session it is already playing and keep playing
        // it — press play on v1.2 and you would go on hearing v1.3.
        slug: version == null ? session.slug : '${session.slug}#${version.id}',
        title: version?.title ?? session.title,
        // A version belongs to the same person and sits under the same art
        // unless it changed it, so only what the version states overrides.
        author: session.author,
        photo: version?.photo ?? session.photo,
        gradient: version?.gradient ?? session.gradient,
      ));
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  /// The sheet has two resting places, as the frame does: sitting under the
  /// transport, and pulled up to just below the status bar. It rides the
  /// screen's own scroll rather than becoming a second panel, so free
  /// scrolling still does what it did.
  void _snap(bool up) {
    setState(() => _sheetUp = up);
    final top = MediaQuery.paddingOf(context).top;
    _scroll.animateTo(
      up ? (_heroHeight - top).clamp(0.0, _scroll.position.maxScrollExtent) : 0,
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = findSession(widget.slug);
    final version = session == null ? null : findVersion(session, widget.versionId);
    if (session == null) {
      // A pasted or stale slug: back to somewhere real rather than an empty
      // player.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.of(context).pushNamedAndRemoveUntil('/home', (_) => false);
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: LayoutBuilder(
        builder: (context, constraints) {
          _heroHeight = constraints.maxHeight - _sheetPeek;
          return SingleChildScrollView(
            controller: _scroll,
            child: Stack(
              children: [
                // The cover runs a whole viewport, not just the hero. The
                // sheet's rounded top corners are only legible because the art
                // carries on behind them — over a white page they cut white
                // out of white and the radius reads as square.
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: constraints.maxHeight,
                  child: Stack(
                    children: [
                      CoverImage(
                        photo: version?.photo ?? session.photo,
                        gradient: version?.gradient ?? session.gradient,
                        width: 804,
                        height: 1750,
                        scrim: false,
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    SizedBox(
                      height: _heroHeight,
                      child: _Hero(session: session),
                    ),
                    _Sheet(
                      session: session,
                      version: version,
                      origin: widget.origin,
                      expanded: _expanded,
                      sheetUp: _sheetUp,
                      onReadMore: () => setState(() => _expanded = !_expanded),
                      onSnap: _snap,
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Back 15 / forward 15, flanking the play disc.
///
/// Not in the frame, which draws the disc alone. It is here because the bar
/// above it is draggable now and a drag is the wrong instrument for "say that
/// last bit again": on a ten-minute session fifteen seconds is under three
/// pixels of track.
class _SkipButton extends StatelessWidget {
  const _SkipButton({required this.seconds, required this.onPressed});

  final int seconds;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final back = seconds < 0;
    return Tooltip(
      message: back ? 'Back ${-seconds} seconds' : 'Forward $seconds seconds',
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: Container(
          width: 44,
          height: 44,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(back ? Icons.rotate_left_rounded : Icons.rotate_right_rounded,
                  size: 28, color: AppColors.iconInverse),
              // The number sits in the glyph's own gap, which is what that gap
              // is for.
              Text('${seconds.abs()}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    height: 1,
                    color: AppColors.textInverse,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}

/// The scrubber's track: the frame's rest colour under the frame's warm fill.
///
/// A [Slider] paints its active track in one flat colour, and this one is a
/// gradient — so the track shape is the whole of the customisation and the
/// rest of the control is stock, which is the point. `BaseSliderTrackShape`
/// gives the rect, insetting by the overlay radius: with that set to the
/// thumb's 14 the track starts exactly where the frame puts it.
class _ScrubberTrack extends SliderTrackShape with BaseSliderTrackShape {
  const _ScrubberTrack();

  @override
  void paint(
    PaintingContext context,
    Offset offset, {
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required Animation<double> enableAnimation,
    required Offset thumbCenter,
    Offset? secondaryOffset,
    bool isEnabled = false,
    bool isDiscrete = false,
    required TextDirection textDirection,
  }) {
    final rect = getPreferredRect(
      parentBox: parentBox,
      offset: offset,
      sliderTheme: sliderTheme,
      isEnabled: isEnabled,
      isDiscrete: isDiscrete,
    );
    if (rect.isEmpty) return;

    final canvas = context.canvas;
    final radius = Radius.circular(rect.height / 2);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, radius),
      Paint()..color = Colors.black.withValues(alpha: 0.4),
    );

    final end = thumbCenter.dx.clamp(rect.left, rect.right);
    if (end <= rect.left) return;
    final active = Rect.fromLTRB(rect.left, rect.top, end, rect.bottom);
    canvas.drawRRect(
      RRect.fromRectAndRadius(active, radius),
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFFAE4B46), Color(0xFFFFC500)],
        ).createShader(active),
    );
  }
}

/// Art, transport, cue and scrubber — everything you hear rather than read.
class _Hero extends StatelessWidget {
  const _Hero({required this.session});

  final SessionRecord session;

  @override
  Widget build(BuildContext context) {
    final playback = PlaybackScope.of(context);

    return SafeArea(
      bottom: false,
      child: DefaultTextStyle.merge(
        style: const TextStyle(color: AppColors.textInverse),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppPadding.page, vertical: AppSpacing.s3),
              child: Row(
                children: [
                  CircleSurfaceButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Back',
                    size: 44,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const Spacer(),
                  // The same coin the cockpit header wears — one mark for the
                  // currency, not a lookalike per screen.
                  const CoinPill(),
                  const SizedBox(width: AppSpacing.s2),
                  // Sound off without stopping the session: you open one in a
                  // room where you cannot make noise and still want the clock,
                  // the cues and the art.
                  CircleSurfaceButton(
                    icon: playback.muted
                        ? Icons.volume_off_rounded
                        : Icons.volume_up_rounded,
                    tooltip:
                        playback.muted ? 'Turn sound on' : 'Turn sound off',
                    size: 44,
                    onPressed: playback.toggleMuted,
                  ),
                  const SizedBox(width: AppSpacing.s2),
                  CircleSurfaceButton(
                    icon: Icons.ios_share,
                    tooltip: 'Share',
                    size: 44,
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            // Centres in what is left above the caption, which lands the 96px
            // disc at the frame's own y=321 in a 402x874 — by flow rather than
            // by a magic number.
            Expanded(
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _SkipButton(
                      seconds: -_skip.inSeconds,
                      onPressed: () =>
                          playback.seek(playback.elapsed.value - _skip),
                    ),
                    const SizedBox(width: AppSpacing.s6),
                    Tooltip(
                      message: playback.playing ? 'Pause' : 'Play',
                      child: InkWell(
                        onTap: playback.toggle,
                        customBorder: const CircleBorder(),
                        child: Container(
                          width: 96,
                          height: 96,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            playback.playing
                                ? Icons.pause_rounded
                                : Icons.play_arrow_rounded,
                            size: 48,
                            color: AppColors.iconInverse,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s6),
                    _SkipButton(
                      seconds: _skip.inSeconds,
                      onPressed: () =>
                          playback.seek(playback.elapsed.value + _skip),
                    ),
                  ],
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppPadding.page, 0, AppPadding.page, 85),
              child: ValueListenableBuilder<Duration>(
                valueListenable: playback.elapsed,
                builder: (context, elapsed, _) {
                  // The engine's own measurement, not the constant: the bed
                  // is ten seconds today but a session with its own file will
                  // not be, and this bar must not have to be told.
                  final duration = playback.length;
                  final progress = (elapsed.inMilliseconds / duration.inMilliseconds)
                      .clamp(0.0, 1.0);
                  // Clamped rather than wrapped: `% length` is 0 at both
                  // ends, so the session used to end by telling you to
                  // breathe in.
                  final cue = _cues[
                      (progress * _cues.length).floor().clamp(0, _cues.length - 1)];

                  return Column(
                    children: [
                      Text(cue,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.playerCue),
                      const SizedBox(height: AppSpacing.s10),
                      // A real Slider, not three painted boxes.
                      //
                      // The boxes drew the shape of a control over a clock —
                      // the knob's position was `elapsed / duration`, so it
                      // moved when the audio moved and never the other way
                      // round. This is the first thing a listener reaches for:
                      // a session is a spoken thing, and missing a line means
                      // wanting the last twenty seconds back. Drag, tap to
                      // jump, and the value a screen reader announces all come
                      // with the widget.
                      //
                      // The frame's look is kept in the theme: the 7px track
                      // on black at 40%, the warm fill, the 28px white knob —
                      // and the overlay is sized to the thumb so the track
                      // insets by the frame's own 14 either side.
                      SizedBox(
                        height: 28,
                        child: SliderTheme(
                          data: SliderThemeData(
                            trackHeight: 7,
                            trackShape: const _ScrubberTrack(),
                            thumbColor: AppColors.surface,
                            thumbShape: const RoundSliderThumbShape(
                                enabledThumbRadius: 14,
                                elevation: 0,
                                pressedElevation: 0),
                            overlayShape:
                                const RoundSliderOverlayShape(overlayRadius: 14),
                            overlayColor: Colors.white.withValues(alpha: 0.12),
                          ),
                          child: Slider(
                            value: elapsed.inMilliseconds
                                .clamp(0, duration.inMilliseconds)
                                .toDouble(),
                            max: duration.inMilliseconds.toDouble(),
                            onChanged: (value) => playback
                                .seek(Duration(milliseconds: value.round())),
                            semanticFormatterCallback: (value) =>
                                '${_clock(Duration(milliseconds: value.round()))} '
                                'of ${_clock(duration)}',
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s3),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_clock(elapsed),
                              style: const TextStyle(
                                  fontSize: 8, color: AppColors.textInverse)),
                          Text(_clock(duration),
                              style: const TextStyle(
                                  fontSize: 8, color: AppColors.textInverse)),
                        ],
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Everything you would read rather than hear.
class _Sheet extends StatelessWidget {
  const _Sheet({
    required this.session,
    required this.version,
    required this.origin,
    required this.expanded,
    required this.sheetUp,
    required this.onReadMore,
    required this.onSnap,
  });

  final SessionRecord session;
  final Version? version;
  final ProfileOrigin? origin;
  final bool expanded;
  final bool sheetUp;
  final VoidCallback onReadMore;
  final ValueChanged<bool> onSnap;

  /// Hashtags, as the frame has them. Derived rather than stored: a tags field
  /// would mean editing 21 catalogue entries to say what the category and the
  /// mix already say.
  List<String> get _tags {
    final tags = <String>[
      session.slug.replaceAll('-', ''),
      session.category.toLowerCase(),
      for (final layer in session.layers)
        layer.name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), ''),
      for (final item in session.personalization)
        item.label.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), ''),
    ];
    return tags.where((tag) => tag.isNotEmpty).toSet().toList();
  }

  static const _shownTags = 6;

  @override
  Widget build(BuildContext context) {
    final tags = _tags;
    final overflow = tags.length - _shownTags;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
      ),
      padding: const EdgeInsets.fromLTRB(
          AppPadding.page, AppPadding.md, AppPadding.page, AppSpacing.s10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // The grabber is the control, not an ornament: a tap snaps the sheet
          // between its two rests. Dragging is the screen's own scroll.
          Center(
            child: Semantics(
              button: true,
              label: sheetUp ? 'Collapse details' : 'Expand details',
              child: InkWell(
                onTap: () => onSnap(!sheetUp),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.s1),
                  child: Container(
                    width: 36,
                    height: 5,
                    decoration: BoxDecoration(
                      color: const Color(0xFF7F7F7F).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: AppPadding.md),
          InkWell(
            onTap: () => Navigator.of(context).pushNamed(
              '/profile',
              arguments: profileArgument(session.author, origin),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                PhotoCircle(
                    photo: session.authorPhoto,
                    size: 24,
                    gradient: session.gradient),
                const SizedBox(width: AppSpacing.s2),
                Flexible(
                  child: Text(session.author,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      )),
                ),
                const Icon(Icons.chevron_right,
                    size: 16, color: AppColors.iconDefault),
              ],
            ),
          ),

          const SizedBox(height: AppPadding.page),
          Text(version?.title ?? session.title, style: AppTextStyles.titleLg),
          const SizedBox(height: AppSpacing.s2),
          // Clamped to the frame's lines. Expanding drops the clamp, so "Read
          // More" is a real disclosure rather than a link to somewhere else.
          Text(
            session.summary,
            maxLines: expanded ? null : 4,
            overflow: expanded ? TextOverflow.visible : TextOverflow.ellipsis,
            style: AppTextStyles.bodySm.copyWith(fontWeight: FontWeight.w300),
          ),
          const SizedBox(height: AppSpacing.s2),
          Center(
            widthFactor: 1,
            child: TextButton(
              onPressed: onReadMore,
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: const Size(0, 32),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(expanded ? 'Read Less' : 'Read More',
                  style: AppTextStyles.bodySm.copyWith(color: _accent)),
            ),
          ),

          const SizedBox(height: AppPadding.page),
          Wrap(
            spacing: AppSpacing.s2,
            runSpacing: AppSpacing.s2,
            children: [
              for (final tag in tags.take(_shownTags)) _Tag(label: '#$tag'),
              if (overflow > 0) _Tag(label: '+$overflow'),
            ],
          ),

          const SizedBox(height: AppPadding.lg),
          Row(
            children: [
              Expanded(
                child: _Stat(
                    value: session.plays,
                    label: 'Played',
                    icon: Icons.play_arrow_rounded),
              ),
              const SizedBox(width: AppPadding.md),
              Expanded(
                child: _Stat(
                    value: session.recreated,
                    label: 'Recreated',
                    icon: Icons.shuffle),
              ),
            ],
          ),

          const SizedBox(height: AppPadding.lg),
          Text('Recreate your own version', style: AppTextStyles.bodyLg),
          const SizedBox(height: AppPadding.md),
          SizedBox(
            height: 214,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: kRecommendations.length,
              separatorBuilder: (_, __) => const SizedBox(width: 11),
              itemBuilder: (context, index) => RecommendationCard(
                recommendation: kRecommendations[index],
                variant: RecommendationVariant.recreate,
              ),
            ),
          ),

          const SizedBox(height: AppPadding.lg),
          Text('Details', style: AppTextStyles.bodyLg),
          const SizedBox(height: AppPadding.md),
          Container(
            padding: const EdgeInsets.all(AppPadding.page),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.borderSubtle),
              // 20 is not on AppRadius and is not a Figma variable either —
              // the frame uses it as a raw value, by decision.
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Creator’s intent', style: AppTextStyles.label
                    .copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                Text(session.intent,
                    style: AppTextStyles.bodySm
                        .copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: AppPadding.page),
                Text('In the mix', style: AppTextStyles.label
                    .copyWith(color: AppColors.textSecondary)),
                for (final layer in session.layers) ...[
                  const SizedBox(height: 10),
                  _DetailRow(label: layer.name, value: '${layer.level}%'),
                ],
                const SizedBox(height: AppPadding.page),
                Text('Set for you', style: AppTextStyles.label
                    .copyWith(color: AppColors.textSecondary)),
                for (final item in session.personalization) ...[
                  const SizedBox(height: 10),
                  _DetailRow(label: item.label, value: item.value),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The accent the design uses for links and hashtags. It has no variable in
/// Figma — the audit found it used 35 times with nothing behind it — so it is
/// a literal here for the same reason it is one on the web.
const _accent = Color(0xFFFF881B);

class _Tag extends StatelessWidget {
  const _Tag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s2),
      decoration: BoxDecoration(
        color: _accent.withValues(alpha: 0.1),
        border: Border.all(color: _accent),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Text(label, style: AppTextStyles.label.copyWith(color: _accent)),
    );
  }
}

/// What the session has done, as a figure rather than a sentence.
class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label, required this.icon});

  final String value;
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppPadding.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.borderSubtle),
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Column(
        children: [
          Text(value, style: AppTextStyles.titleLg),
          const SizedBox(height: AppSpacing.s1),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              // Flexible, not a bare Text: "Recreated" at 14px measures 128.25
              // into the 128 the icon and its gap leave in a half-width tile,
              // and a quarter of a pixel is still an overflow.
              Flexible(
                child: Text(label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodySm),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(label,
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary)),
        ),
        const SizedBox(width: AppPadding.md),
        Flexible(
          child: Text(value,
              textAlign: TextAlign.right, style: AppTextStyles.caption),
        ),
      ],
    );
  }
}
