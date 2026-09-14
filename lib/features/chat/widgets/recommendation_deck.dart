import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/data/recommendations.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

/// Figma: 156 x 150 per card.
///
/// The width is not a pixel fit — do not tighten it to the longest line. The
/// web hit this the hard way: at 144 the description measured 116 into a 120
/// column on one machine and ellipsised on another, because the same font
/// resolves differently per platform. 156 leaves the text column 132, which is
/// slack either way, and the same slack is worth keeping here.
const _cardW = 156.0;
const _cardH = 150.0;

/// The cards are near-parallel at ~8 degrees, and it is the drop down the
/// stack rather than a spread of angles that separates them. Fanning the
/// angles instead reads as a splay.
const _tilt = <double>[-8, -7, -6];
const _drop = <double>[0, 14, 19];

/// The tilted front card reaches ~10px left of the box; inset so it does not
/// hang into the message gutter.
const _lead = 10.0;

/// Room above the cards for the count, which straddles the front corner.
const _head = 18.0;

/// The tilted front card's footprint plus the lead: w·cos8 + h·sin8 + lead.
const _front = 174.0;

/// How far each card steps right. 88 is the Figma value — enough that the
/// cards behind show part of their own orb rather than a sliver of edge. It
/// narrows on a small screen, because the deck sits in the message column and
/// that column does not scroll sideways.
const _stepMin = 38.0;
const _stepMax = 88.0;

/// The folded deck: three recommendations as a stack you open, rather than a
/// rail you scroll.
///
/// [onOpen] is left out once the set has been applied — it is then a record of
/// what was asked for, and opening it would offer edits that no longer land.
class RecommendationDeck extends StatelessWidget {
  const RecommendationDeck({
    super.key,
    required this.recommendations,
    required this.count,
    this.onOpen,
  });

  final List<Recommendation> recommendations;
  final int count;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    final cards = recommendations.take(3).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final step = cards.length < 2
            ? _stepMax
            : ((constraints.maxWidth - _front) / (cards.length - 1))
                .clamp(_stepMin, _stepMax);
        final width = step * (cards.length - 1) + _front;

        final deck = SizedBox(
          width: width,
          height: 195,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Painted back to front, so the first card ends up on top.
              for (var index = cards.length - 1; index >= 0; index--)
                Positioned(
                  left: step * index + _lead,
                  top: _head + _drop[index],
                  child: Transform.rotate(
                    angle: _tilt[index] * math.pi / 180,
                    child: _DeckCard(recommendation: cards[index]),
                  ),
                ),

              // The count straddles the front card's tilted top-right corner —
              // most of the disc on the card, the rest overhanging it. Placed
              // off that corner, which the tilt has moved well in from the
              // card's own box.
              Positioned(
                left: _lead + 125,
                top: 1,
                child: Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: AppColors.brandDefault,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                          color: Color(0x14000000),
                          blurRadius: 6,
                          offset: Offset(0, 2)),
                    ],
                  ),
                  child: Text('$count',
                      style: AppTextStyles.label
                          .copyWith(color: AppColors.textStrong)),
                ),
              ),
            ],
          ),
        );

        if (onOpen == null) return deck;
        return Semantics(
          button: true,
          label: 'Open $count recommended ${count == 1 ? 'change' : 'changes'}',
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onOpen,
            child: deck,
          ),
        );
      },
    );
  }
}

class _DeckCard extends StatelessWidget {
  const _DeckCard({required this.recommendation});

  final Recommendation recommendation;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: _cardW,
      height: _cardH,
      clipBehavior: Clip.antiAlias,
      padding: const EdgeInsets.all(AppPadding.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.brandEmphasis.withValues(alpha: 0.45)),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(AppRadius.xl3),
          topRight: Radius.circular(AppRadius.xl2),
          bottomLeft: Radius.circular(AppRadius.xl2),
          bottomRight: Radius.circular(AppRadius.xl2),
        ),
        boxShadow: const [
          BoxShadow(color: Color(0x1A3C2405), blurRadius: 18, offset: Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipOval(
            child: Image.asset(recommendation.orb,
                width: 56, height: 56, fit: BoxFit.cover),
          ),
          const SizedBox(height: 10),
          Text(recommendation.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyLg),
          const SizedBox(height: 2),
          Expanded(
            child: Text(
              recommendation.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.label.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
