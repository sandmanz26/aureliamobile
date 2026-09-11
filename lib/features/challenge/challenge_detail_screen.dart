import 'package:flutter/material.dart';
import '../../core/data/challenges.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/cover_image.dart';
import '../../core/widgets/photo_circle.dart';
import '../../core/widgets/session_grid_card.dart';

const _avatarRing = [AppPrimitives.primary300, AppPrimitives.info300];

/// Days completed, in the pill the design puts under every name.
class _DaysPill extends StatelessWidget {
  const _DaysPill({required this.days, this.bordered = true});

  final int days;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 26,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: bordered ? Border.all(color: AppColors.borderSubtle) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt, size: 12, color: AppColors.brandEmphasis),
          const SizedBox(width: 4),
          Flexible(
            child: Text('$days days',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.label),
          ),
        ],
      ),
    );
  }
}

/// Movement since the last update, as a solid triangle — a plain up/down mark
/// reads better than a trend line at this size, and the direction is in the
/// shape, not only the colour.
class _TrendMark extends StatelessWidget {
  const _TrendMark({required this.trend});

  final Trend trend;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(10, 7),
      painter: _TrianglePainter(
        up: trend == Trend.up,
        color: trend == Trend.up
            ? AppColors.feedbackSuccess
            : AppColors.feedbackError,
      ),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  const _TrianglePainter({required this.up, required this.color});

  final bool up;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    if (up) {
      path
        ..moveTo(size.width / 2, 0)
        ..lineTo(size.width, size.height)
        ..lineTo(0, size.height);
    } else {
      path
        ..moveTo(0, 0)
        ..lineTo(size.width, 0)
        ..lineTo(size.width / 2, size.height);
    }
    canvas.drawPath(path..close(), Paint()..color = color);
  }

  @override
  bool shouldRepaint(covariant _TrianglePainter oldDelegate) =>
      oldDelegate.up != up || oldDelegate.color != color;
}

/// The top three, drawn as a podium.
///
/// Column height encodes rank, not days — the bars are the standings, and the
/// exact figure sits on each pill next to the name. Order is 2 / 1 / 3 so the
/// winner is centre, which is what a podium means.
class _Podium extends StatelessWidget {
  const _Podium({required this.top});

  final List<Contender> top;

  @override
  Widget build(BuildContext context) {
    if (top.length < 3) return const SizedBox.shrink();
    final columns = [
      (top[1], 86.0, 64.0, 8.0),
      (top[0], 118.0, 76.0, 0.0),
      (top[2], 62.0, 58.0, 16.0),
    ];

    return Container(
      padding: const EdgeInsets.fromLTRB(14, AppSpacing.s5, 14, 0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.xl2),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFFFE6A8), Color(0xFFFF9A1F)],
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (final (contender, barHeight, avatar, topPad) in columns)
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(top: topPad, left: 5, right: 5),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('${contender.rank}',
                        style: AppTextStyles.bodySm
                            .copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppColors.surface,
                        shape: BoxShape.circle,
                      ),
                      child: PhotoCircle(
                        photo: contender.photo,
                        size: avatar,
                        gradient: _avatarRing,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s2),
                    Text(
                      contender.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    _DaysPill(days: contender.days, bordered: false),
                    const SizedBox(height: AppSpacing.s3),
                    Container(
                      height: barHeight,
                      decoration: const BoxDecoration(
                        color: Color(0x59FFFFFF),
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(AppRadius.xl),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class ChallengeDetailScreen extends StatelessWidget {
  const ChallengeDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context) {
    final challenge = findChallenge(slug);
    if (challenge == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) Navigator.of(context).pop();
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    final podium = challenge.leaderboard.take(3).toList();
    final ranked = challenge.leaderboard.skip(3).toList();
    final sessions = challenge.sessionSlugs
        .map(findSession)
        .whereType<SessionRecord>()
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                Stack(
                  children: [
                    AspectRatio(
                      aspectRatio: 402 / 300,
                      child: Stack(
                        children: [
                          CoverImage(
                            photo: challenge.photo,
                            gradient: challenge.gradient,
                            width: 820,
                            height: 620,
                            scrim: false,
                          ),
                          SafeArea(
                            bottom: false,
                            child: Padding(
                              padding: const EdgeInsets.all(AppPadding.md),
                              child: Row(
                                children: [
                                  CircleSurfaceButton(
                                    icon: Icons.arrow_back,
                                    tooltip: 'Back',
                                    onPressed: () =>
                                        Navigator.of(context).maybePop(),
                                  ),
                                  const Spacer(),
                                  const CoinPill(),
                                  const SizedBox(width: AppSpacing.s2),
                                  CircleSurfaceButton(
                                    icon: Icons.ios_share,
                                    tooltip: 'Share challenge',
                                    onPressed: () {},
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Transform.translate(
                  offset: const Offset(0, -24),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(AppRadius.xl2),
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(
                        AppPadding.lg, AppSpacing.s6, AppPadding.lg, AppSpacing.s6),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: AppSpacing.s2,
                          runSpacing: AppSpacing.s2,
                          children: [
                            _StatusPill(
                                icon: Icons.group_outlined,
                                label: '${challenge.joined} joined'),
                            _StatusPill(
                                icon: Icons.schedule,
                                label: 'Ends in ${challenge.endsInDays} days'),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s4),
                        Text(challenge.title, style: AppTextStyles.titleLg),
                        const SizedBox(height: AppSpacing.s2),
                        Text(challenge.summary, style: AppTextStyles.bodyMd),
                        const SizedBox(height: AppSpacing.s6),
                        _Podium(top: podium),
                        const SizedBox(height: AppSpacing.s2),
                        for (final contender in ranked)
                          _RankedRow(contender: contender),
                        if (sessions.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.s8),
                          Text('Created Session', style: AppTextStyles.titleMd),
                        ],
                      ],
                    ),
                  ),
                ),
                if (sessions.isNotEmpty)
                  Transform.translate(
                    offset: const Offset(0, -24),
                    child: SizedBox(
                      height: 230,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding:
                            const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                        itemCount: sessions.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(width: AppSpacing.s3),
                        itemBuilder: (context, index) => SizedBox(
                          width: 260,
                          child: SessionGridCard(
                            session: sessions[index],
                            aspectRatio: 260 / 230,
                            onOpen: () => Navigator.of(context).pushNamed(
                                '/session',
                                arguments: sessions[index].slug),
                            onRecreate: () => Navigator.of(context).pushNamed(
                                '/recreate',
                                arguments: sessions[index].slug),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // The one action the screen exists for, reachable from anywhere on it.
          SafeArea(
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
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(56)),
                    child: const Text('Join Challenge'),
                  ),
                  if (challenge.yourDay != null) ...[
                    const SizedBox(height: AppSpacing.s2),
                    Text(
                      'You are on day ${challenge.yourDay} of ${challenge.totalDays} · '
                      'about ${challenge.minutesPerDay} min a day',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.borderSubtle),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.iconDefault),
          const SizedBox(width: 6),
          Text(label, style: AppTextStyles.label),
        ],
      ),
    );
  }
}

class _RankedRow extends StatelessWidget {
  const _RankedRow({required this.contender});

  final Contender contender;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.borderSubtle)),
      ),
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s3 + 2),
      child: Row(
        children: [
          SizedBox(
            width: 14,
            child: Text('${contender.rank}', style: AppTextStyles.bodySm),
          ),
          const SizedBox(width: AppSpacing.s2 + 2),
          PhotoCircle(photo: contender.photo, size: 40, gradient: _avatarRing),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  contender.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.bodySm.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text('Joined ${contender.joined}', style: AppTextStyles.caption),
              ],
            ),
          ),
          _DaysPill(days: contender.days),
          if (contender.trend != null) ...[
            const SizedBox(width: AppSpacing.s2),
            _TrendMark(trend: contender.trend!),
          ],
        ],
      ),
    );
  }
}
