/**
 * The card shadow every surface in this design shares (Figma effect
 * 16520:822) — a raw Tailwind arbitrary value because it isn't wired into
 * the Figma variable export yet (`design-tokens/figma-export.json` only
 * carries color, spacing, radius and type; effects aren't synced). Until it
 * is, this is the one place that spells it out — it used to be redeclared
 * verbatim in four separate page files, which is exactly how one of them
 * would end up drifting the next time this shadow changes in Figma.
 */
export const CARD_SHADOW = 'shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]'
