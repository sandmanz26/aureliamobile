/**
 * The one shared list of the five wellness dimensions (U145, J206): mental,
 * emotional, relational, spiritual, physical. StateFlips, the persona
 * condition (personaConditionV4), the Healing Map and the Therapeutic map all
 * read it from here. The two maps keep their own "worlds" (their data is not
 * renamed): WORLD_TO_DIMENSION says which dimension each world is, and both
 * map pages show that mapping. The only difference is a name: both maps call
 * the physical dimension "sleep", because sleep is the physical world they
 * built first. No imports, so any module can use it without a cycle.
 */

export type Dimension = 'mental' | 'emotional' | 'relational' | 'spiritual' | 'physical'
export type DimCode = 'MEN' | 'EMO' | 'REL' | 'SPI' | 'PHY'

export interface DimensionInfo {
  id: Dimension
  code: DimCode
  label: string
  /** What it covers, in plain words. */
  plain: string
}

export const FIVE_DIMENSIONS: readonly DimensionInfo[] = [
  { id: 'mental', code: 'MEN', label: 'Mental', plain: 'thinking, focus and worry' },
  { id: 'emotional', code: 'EMO', label: 'Emotional', plain: 'feelings and mood' },
  { id: 'relational', code: 'REL', label: 'Relational', plain: 'people around them' },
  { id: 'spiritual', code: 'SPI', label: 'Meaning and purpose', plain: 'what makes life feel worthwhile' },
  { id: 'physical', code: 'PHY', label: 'Physical', plain: 'sleep, energy and body' },
]

export const DIMENSION_IDS: Dimension[] = FIVE_DIMENSIONS.map((d) => d.id)
export const dimensionInfo = (d: Dimension) => FIVE_DIMENSIONS.find((x) => x.id === d)!

/** A world id of the Healing Map or the Therapeutic map. */
export type MapWorld = 'sleep' | 'mental' | 'emotional' | 'relational' | 'spiritual'

/** Healing Map and Therapeutic map worlds → the shared dimension. */
export const WORLD_TO_DIMENSION: Record<MapWorld, Dimension> = { sleep: 'physical', mental: 'mental', emotional: 'emotional', relational: 'relational', spiritual: 'spiritual' }
export const DIMENSION_TO_WORLD: Record<Dimension, MapWorld> = { physical: 'sleep', mental: 'mental', emotional: 'emotional', relational: 'relational', spiritual: 'spiritual' }

/** One line for a map page: "Sleep → Physical · Mental → Mental · …". */
export function worldMappingLine(worlds: readonly { id: MapWorld; label: string }[]): string {
  return worlds.map((w) => `${w.label} → ${dimensionInfo(WORLD_TO_DIMENSION[w.id]).label}`).join(' · ')
}
