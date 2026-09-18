import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/data/recommendations.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';

/// Figma "Frame 74" (16523:8076), read off the node rather than a screenshot.
///
/// Three cards of the same size, all tilted the same 12°, stepping right and
/// down. What makes it read as a deck rather than as one card with edges
/// behind it is that **the cards behind show their own orb**, and that is the
/// one thing this was getting wrong: at the old step the second card's orb sat
/// entirely behind the front card and you saw nothing but a white edge.
///
/// Figma's trick is that cards two and three are not the front card repeated.
/// They centre their content, which moves only the orb — the text block is
/// stretched and stays put. That is what pushes the orb past the card in
/// front, so about 17px of it shows. Everything else about the three cards is
/// identical.

/// 135 x 133, solved from the rotated bounding box (159.678 x 158.158).
const _cardW = 135.0;
const _cardH = 133.0;

/// All three, not a fan. A spread of angles reads as a splay.
const _tilt = -12.0;

/// The tilted card's axis-aligned box: w·cos12 + h·sin12, w·sin12 + h·cos12.
const _boxW = 159.68;
const _boxH = 158.16;

/// `Transform.rotate` turns about the centre and leaves layout alone, so a
/// card's box sits this far inside the footprint it paints. Position by the
/// footprint; offset to get the box.
const _offX = (_boxW - _cardW) / 2;
const _offY = (_boxH - _cardH) / 2;

/// How far each card falls below the front one. Measured, and not even.
const _drop = <double>[0, 9, 15];

/// Room above the front card for the count, which overhangs its top edge.
const _head = 6.0;

/// How far each card steps right. 59 is Figma's, and it is the number the orbs
/// depend on: much less and the centred orb goes back behind the front card.
/// It narrows only on a screen too small to hold the deck at all — the message
/// column does not scroll sideways, so overflowing is worse than tightening.
const _stepMin = 38.0;
const _stepMax = 59.0;

/// The orb. Horizontal padding is 16 — the text column measures 103 — but
/// vertical is 12: 12 + 51 + 12 + 46 + 12 = 133.
const _orb = 51.0;

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

    final last = cards.length - 1;

    return LayoutBuilder(
      builder: (context, constraints) {
        final step = cards.length < 2
            ? _stepMax
            : ((constraints.maxWidth - _boxW) / last).clamp(_stepMin, _stepMax);
        final width = step * last + _boxW;

        final deck = SizedBox(
          width: width,
          height: _head + _drop[last] + _boxH,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Painted back to front, so the first card ends up on top.
              for (var index = last; index >= 0; index--)
                Positioned(
                  left: step * index + _offX,
                  top: _head + _drop[index] + _offY,
                  child: Transform.rotate(
                    angle: _tilt * math.pi / 180,
                    child: _DeckCard(
                      recommendation: cards[index],
                      front: index == 0,
                    ),
                  ),
                ),

              // The count straddles the front card's tilted top edge — most of
              // the disc on the card, the rest overhanging it — and is tilted
              // with it.
              Positioned(
                left: 113,
                top: _head - 2.6,
                child: Transform.rotate(
                  angle: _tilt * math.pi / 180,
                  child: Container(
                    width: 25,
                    height: 25,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: AppColors.brandDefault,
                      shape: BoxShape.circle,
                    ),
                    child: Text('$count',
                        style: AppTextStyles.bodySm.copyWith(
                            fontWeight: FontWeight.w500,
                            color: AppColors.textPrimary)),
                  ),
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
  const _DeckCard({required this.recommendation, required this.front});

  final Recommendation recommendation;

  /// The front card keeps its wide top-left corner and outdents its own orb;
  /// the two behind centre theirs, which is what makes them visible at all.
  final bool front;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: _cardW,
      height: _cardH,
      clipBehavior: Clip.antiAlias,
      padding: const EdgeInsets.symmetric(
          horizontal: AppPadding.md, vertical: AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.brandEmphasis.withValues(alpha: 0.45)),
        borderRadius: BorderRadius.only(
          // rectangleCornerRadii is [36, 20, 20, 20] on the front card and a
          // flat 20 on the two behind, whose corner never shows anyway.
          topLeft: Radius.circular(front ? 36 : 20),
          topRight: const Radius.circular(20),
          bottomLeft: const Radius.circular(20),
          bottomRight: const Radius.circular(20),
        ),
        boxShadow: const [
          BoxShadow(
              color: Color(0x08000000),
              blurRadius: 14,
              spreadRadius: 4,
              offset: Offset(14, 9)),
          BoxShadow(
              color: Color(0x08000000), blurRadius: 5, offset: Offset(4, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // The whole trick, in one alignment. Centred, the orb clears the
          // card in front and you can see which change this is; left-aligned
          // like the front card's, it is hidden completely. The front card
          // outdents its own by 4 — it has no card to clear, and the wide
          // top-left corner wants the room.
          Align(
            alignment: front ? Alignment.centerLeft : Alignment.center,
            child: Transform.translate(
              offset: Offset(front ? -4 : 0, 0),
              child: ClipOval(
                child: Image.asset(recommendation.orb,
                    width: _orb, height: _orb, fit: BoxFit.cover),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          // 14/14 and 10/15 in the frame, both tighter than the scale's own
          // leading.
          Text(recommendation.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodySm.copyWith(
                  height: 14 / 14, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Expanded(
            child: Text(
              recommendation.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.captionLight.copyWith(height: 15 / 10),
            ),
          ),
        ],
      ),
    );
  }
}
