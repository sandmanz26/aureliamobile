import type { ChangeKind } from '../components/chat/FilterChips'
import type { Recommendation } from '../components/chat/RecommendationCard'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'

// What the cockpit's "+" sheet offers (AddSheet), as data: the changes
// Aurelia can argue for from the diagnosis, and the experiments it cannot
// predict. Kept apart from the sheet so the thread can name what a build
// contained (addOptionTitles) without importing a component.

export interface AddOption {
  id: string
  title: string
  description: string
  orb: string
  /** Diagnosis cards carry the score they would move; experiments carry the
   *  channel they would change instead — the two are different claims. */
  improveScore?: string
  channel?: 'Audio' | 'Visuals'
  /** What it acts on — the sheet's filter (U045). */
  kind: ChangeKind
}

/** What Aurelia can improve from what it already knows about this session. */
export const FROM_DIAGNOSIS: AddOption[] = [
  {
    id: 'yellow',
    title: 'Increase yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '3%',
    orb: orbIncreaseYellow,
    kind: 'visual',
  },
  {
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '6%',
    orb: orbLessMovement,
    kind: 'movement',
  },
]

/** Things Aurelia cannot predict the effect of, offered as experiments. */
export const EXPERIMENTS: AddOption[] = [
  {
    id: 'aulos',
    title: 'Aulos (Greek flute)',
    description: 'Experiment adding a touch of ancient Greece flute',
    channel: 'Audio',
    orb: orb432hz,
    kind: 'sound',
  },
  {
    id: 'art-deco',
    title: 'Art Deco',
    description: 'How about adding an Art Deco style to the visuals?',
    channel: 'Visuals',
    orb: orbLessMovement,
    kind: 'visual',
  },
]

export const ALL_OPTIONS = [...FROM_DIAGNOSIS, ...EXPERIMENTS]

/** Titles of picked options, for the thread to say what a build contained. */
export function addOptionTitles(ids: string[]) {
  return ALL_OPTIONS.filter((option) => ids.includes(option.id)).map((option) => option.title)
}

/** What a proposed change acts on, read from its words — for a deck card that has no sheet entry. */
function kindOf(text: string): ChangeKind {
  if (/breath|exhale|movement|scan|rhythm/i.test(text)) return 'movement'
  if (/tone|sound|chime|melody|voice|pulse|silence|hz|music|noise|words|noting/i.test(text)) return 'sound'
  return 'visual'
}

/**
 * Aurelia's proposals as rows of the "+" sheet (design v4, U051 — D6).
 *
 * The chat had three ways to pick changes from two lists with two scores
 * (Increase yellow was 12% on the deck and 3% in the sheet) and two
 * selections that did not know about each other (O12). In v4 there is one
 * list: the deck's proposals arrive pre-selected at the top of the sheet. A
 * proposal the sheet already lists keeps the sheet's entry — one score per
 * change, the per-change figure rather than the deck's flat 12% — and one it
 * does not becomes a row of its own.
 */
export function asOptions(deck: Recommendation[]): AddOption[] {
  return deck.map((card) => {
    const listed = ALL_OPTIONS.find((option) => option.id === card.id)
    if (listed) return listed
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      orb: card.orb,
      improveScore: card.improveScore,
      kind: kindOf(`${card.title} ${card.description}`),
    }
  })
}

