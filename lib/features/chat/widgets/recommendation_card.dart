import 'package:flutter/material.dart';
import '../../../core/data/people.dart';
import '../../player/player_screen.dart';
import '../../../core/data/recommendations.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../recreate/recreate_handoff.dart';
import '../../../core/data/sessions.dart';

/// Which card this is.
///
/// In the cockpit it is a change you add to or remove from the set being built
/// (173x246, with the score it would move). On the player it is a starting
/// point you fork, so the score and the toggle go and a Recreate takes their
/// place — the frame's 173x214.
enum RecommendationVariant { toggle, recreate }

/// Figma "Frame 45" (16523:9513), read from the file rather than a screenshot:
/// 173 wide, 16px padding, 12px between blocks, on a 1px gradient hairline
/// (#FFE682 -> #FCC181 at 217°, off the frame's own gradient handles).
///
/// `rectangleCornerRadii` is [48, 20, 20, 20] — the top-left is more than
/// twice the others, and that asymmetry is the card's signature. Neither value
/// is on [AppRadius], and in Figma neither is a variable either: several
/// frames use 20 and 48 as raw numbers by decision, so the literals here are
/// correct rather than a gap to close.
///
/// The play glyph sits *on* the orb rather than in a badge beside it: the orb
/// is the preview, and a corner badge read as a second control.
class RecommendationCard extends StatelessWidget {
  const RecommendationCard({
    super.key,
    required this.recommendation,
    this.applied = false,
    this.onToggle,
    this.variant = RecommendationVariant.toggle,
  });

  final Recommendation recommendation;
  final bool applied;
  final VoidCallback? onToggle;
  final RecommendationVariant variant;

  @override
  Widget build(BuildContext context) {
    final recreate = variant == RecommendationVariant.recreate;

    return Container(
      width: 173,
      padding: const EdgeInsets.all(1),
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(48),
          topRight: Radius.circular(20),
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
        // A gradient hairline: the border is the gradient and the card paints
        // its own surface on top, which is what the web's double background
        // does with background-clip.
        gradient: LinearGradient(
          begin: Alignment(-0.78, -0.63),
          end: Alignment(0.78, 0.63),
          colors: [Color(0xFFFFE682), Color(0xFFFCC181)],
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(AppPadding.md),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(47),
            topRight: Radius.circular(19),
            bottomLeft: Radius.circular(19),
            bottomRight: Radius.circular(19),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Orb(recommendation: recommendation),
            const SizedBox(height: AppSpacing.s3),
            Text(
              recommendation.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 2),
            Expanded(
              child: Text(
                recommendation.description,
                maxLines: recreate ? 3 : 2,
                overflow: TextOverflow.ellipsis,
                // Sofia Pro Light in the frame.
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w300,
                ),
              ),
            ),
            if (!recreate) ...[
              const SizedBox(height: AppSpacing.s3),
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'Improve Score',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s2),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s2, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFBED),
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.arrow_upward,
                            size: 12, color: AppPrimitives.success600),
                        Text(
                          recommendation.improveScore,
                          style: AppTextStyles.caption
                              .copyWith(color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: AppSpacing.s3),
            // Center(widthFactor: 1) rather than a bare Container: inside a
            // Column an aligned box with no width takes the whole 173.
            Center(
              widthFactor: 1,
              child: recreate
                  ? OutlinedButton.icon(
                      // `preview` is the session this card plays, and it is
                      // the one a Recreate forks — the card has no other
                      // session to offer.
                      onPressed: () {
                        final session = findSession(recommendation.preview);
                        if (session != null) openRecreate(context, session);
                      },
                      style: _pill,
                      icon: const Icon(Icons.shuffle,
                          size: 12, color: AppColors.iconDefault),
                      label: Text('Recreate', style: AppTextStyles.label),
                    )
                  : OutlinedButton.icon(
                      onPressed: onToggle,
                      style: _pill,
                      icon: Icon(applied ? Icons.delete_outline : Icons.add,
                          size: 12, color: AppColors.iconDefault),
                      label: Text(applied ? 'Remove' : 'Add',
                          style: AppTextStyles.label),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  static final _pill = OutlinedButton.styleFrom(
    minimumSize: const Size(0, 32),
    shape: const StadiumBorder(),
    side: const BorderSide(color: AppColors.borderSubtle),
    foregroundColor: AppColors.textPrimary,
    padding: const EdgeInsets.fromLTRB(12, 0, 14, 0),
  );
}

/// The 73px preview disc, and the only control on the card that used to look
/// like one and do nothing. It plays.
class _Orb extends StatelessWidget {
  const _Orb({required this.recommendation});

  final Recommendation recommendation;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Play ${recommendation.title}',
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(
          '/play',
          arguments: PlayRequest(
            slug: recommendation.preview,
            origin: ProfileOrigin.own,
          ),
        ),
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 73,
          height: 73,
          child: Stack(
            alignment: Alignment.center,
            children: [
              ClipOval(
                child: Image.asset(recommendation.orb,
                    width: 73, height: 73, fit: BoxFit.cover),
              ),
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_arrow_rounded,
                    size: 16, color: AppColors.iconInverse),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
