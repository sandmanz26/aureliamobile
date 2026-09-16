import type { Recommendation } from './RecommendationCard'

/**
 * The folded deck — Figma "Frame 74" (16523:8076), read off the node rather
 * than a screenshot.
 *
 * Three cards of the same size, all tilted the same 12°, stepping right and
 * down. What makes it read as a deck rather than as one card with edges behind
 * it is that **the cards behind show their own orb**, and that is the one thing
 * this was getting wrong: a step of 59 puts the second card's orb at 101–152 in
 * the front card's own coordinates, and the front card ends at 135 — so with
 * the orb where the front card puts it, all 51px of it sit behind and you see
 * nothing but a white edge.
 *
 * Figma's trick is that cards two and three are not the front card repeated.
 * They centre their content (`counterAxisAlignItems: CENTER`), which moves only
 * the orb — the text block is stretched and stays put — from x=12 to x=42. That
 * 30px is what pushes the orb past the card in front, so about 17px of it
 * shows. Everything else about the three cards is identical.
 */

/** Figma: 135 x 133, solved from the rotated bounding box (159.678 x 158.158). */
const CARD_W = 135
const CARD_H = 133
/** All three, not a fan. A spread of angles reads as a splay. */
const TILT = -12
/** The tilted card's axis-aligned box: w·cos12 + h·sin12, w·sin12 + h·cos12. */
const BOX_W = 159.68
const BOX_H = 158.16
/** `rotate` turns about the centre, so a card's box sits this far inside the
 *  footprint it paints. Position by the footprint; offset to get the box. */
const OFF_X = (BOX_W - CARD_W) / 2
const OFF_Y = (BOX_H - CARD_H) / 2
/** How far each card falls below the front one. Measured, and not even. */
const DROP = [0, 9, 15]
/** Room above the front card for the count, which overhangs its top edge. */
const HEAD = 6
/**
 * How far each card steps right. 59 is Figma's, and it is the number the orbs
 * depend on: much less and the centred orb goes back behind the front card.
 * It narrows only on a screen too small to hold the deck at all — the message
 * column does not scroll sideways, so overflowing is worse than tightening.
 * 196 is the page gutters plus the front card's own box, less the 4 it leads
 * by; at 59 the deck is 278 wide and holds its full size down to about 315.
 */
const STEP = 'clamp(38px, (100vw - 196px) / 2, 59px)'

/** The orb, and the gutter the text keeps. Horizontal padding is 16 — the text
 *  column measures 103 — but vertical is 12: 12 + 51 + 12 + 46 + 12 = 133. */
const ORB = 51

/** Both shadows the frame carries, in its own order. */
const CARD_SHADOW = '14px 9px 14px 4px rgba(0, 0, 0, 0.03), 4px 4px 5px rgba(0, 0, 0, 0.03)'
/** The 1px hairline every recommendation card wears, from the frame's own
 *  gradient handles. Painted as two backgrounds because a gradient cannot be a
 *  border-color. */
const CARD_BORDER = {
  border: '1px solid transparent',
  backgroundImage:
    'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(217deg, #ffe682, #fcc181)',
  backgroundOrigin: 'border-box' as const,
  backgroundClip: 'padding-box, border-box' as const,
}

interface RecommendationDeckProps {
  recommendations: Recommendation[]
  count: number
  /** Left out once the set has been applied: it is then a record of what was
   *  asked for, and opening it would offer edits that no longer land. */
  onOpen?: () => void
}

export function RecommendationDeck({ recommendations, count, onOpen }: RecommendationDeckProps) {
  // Front card first in the DOM for the reader; painted last via z-index.
  const cards = recommendations.slice(0, 3)
  const Tag = onOpen ? 'button' : 'div'
  const last = cards.length - 1

  return (
    <Tag
      {...(onOpen
        ? {
            type: 'button' as const,
            onClick: onOpen,
            'aria-label': `Open ${count} recommended ${count === 1 ? 'change' : 'changes'}`,
          }
        : {})}
      style={{
        width: `calc(${STEP} * ${last} + ${BOX_W}px)`,
        height: HEAD + (DROP[last] ?? 0) + BOX_H,
      }}
      className={`relative block shrink-0 text-left ${onOpen ? 'u-press' : ''}`}
    >
      {cards.map((recommendation, index) => {
        const front = index === 0
        return (
          <span
            key={recommendation.id}
            className={`absolute flex flex-col gap-12 rounded-[20px] px-16 py-12 ${
              // The asymmetric top-left corner is the front card's alone —
              // rectangleCornerRadii is [36, 20, 20, 20] there and a flat 20 on
              // the two behind, whose corner never shows anyway.
              front ? 'rounded-tl-[36px]' : ''
            }`}
            style={{
              ...CARD_BORDER,
              left: `calc(${STEP} * ${index} + ${OFF_X}px)`,
              top: HEAD + (DROP[index] ?? 0) + OFF_Y,
              width: CARD_W,
              height: CARD_H,
              rotate: `${TILT}deg`,
              zIndex: cards.length - index,
              boxShadow: CARD_SHADOW,
            }}
          >
            <img
              src={recommendation.orb}
              alt=""
              // The whole trick, in one class. Centred, the orb clears the card
              // in front and you can see which change this is; left-aligned
              // like the front card's, it is hidden completely. The front card
              // outdents its own by 4 — it has no card to clear, and the wide
              // top-left corner wants the room.
              className={`shrink-0 rounded-full object-cover ${front ? '-ml-4' : 'mx-auto'}`}
              style={{ width: ORB, height: ORB }}
            />
            <span className="flex min-w-0 flex-col gap-2">
              {/* 14/14 and 10/15 in the frame, both tighter than the scale's
                  own leading. `.text-style-*` sets line-height itself and sits
                  outside Tailwind's utility layer, so the override needs `!`. */}
              <span className="text-style-body-small line-clamp-1 leading-[14px]! text-text-primary">
                {recommendation.title}
              </span>
              <span className="text-style-caption line-clamp-2 font-light! leading-[15px]! text-text-secondary">
                {recommendation.description}
              </span>
            </span>
          </span>
        )
      })}

      {/* The count straddles the front card's tilted top edge — most of the
          disc on the card, the rest overhanging it — and is tilted with it. */}
      <span
        className="text-style-body-small absolute z-10 flex items-center justify-center rounded-full bg-brand-default font-medium! text-text-primary"
        style={{ left: 113, top: HEAD - 2.6, width: 25, height: 25, rotate: `${TILT}deg` }}
        aria-hidden="true"
      >
        {count}
      </span>
    </Tag>
  )
}
