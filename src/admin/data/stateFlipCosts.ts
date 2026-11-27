/**
 * Cost per StateFlip, for the Cost report (U145, J206). For each of the 125
 * StateFlips: cost per flip = cost per chapter × chapters played per person
 * on average ÷ the group's mean chance it works (stateFlipFormulas.summarise,
 * the sleep formulas generalised). Per dimension: the people-weighted mean of
 * its StateFlips' cost per flip (Σ group × cost ÷ Σ group). Beside it the
 * population-weighted average cost per person to reach the target, from
 * personaConditionV4.populationCost (a different question: one person's whole
 * journey across dimensions, not one flip). Stage 1, Balanced, 10 minutes.
 */

import { DIMENSIONS, populationCost, type Dimension } from './personaConditionV4'
import { flipNumbers, stateFlips, type StateFlip } from './stateFlips'

export interface FlipCostRow {
  flip: StateFlip
  group: number
  medianChapters: number
  chaptersPlayed: number
  meanChance: number
  costPerChapter: number
  costPerFlip: number
}

export interface DimensionCost {
  dimension: Dimension
  flips: number
  /** People counted across its StateFlips (a person in two groups counts twice). */
  people: number
  /** Σ group × cost per flip ÷ Σ group. */
  costPerFlip: number
  cheapest: FlipCostRow
  dearest: FlipCostRow
}

export interface StateFlipCosts {
  rows: FlipCostRow[]
  byDimension: DimensionCost[]
  /** People-weighted mean cost per flip over all 125. */
  overallCostPerFlip: number
  costPerChapter: number
  population: ReturnType<typeof populationCost>
}

const weighted = (rs: FlipCostRow[]) => {
  const n = rs.reduce((t, r) => t + r.group, 0)
  return n ? rs.reduce((t, r) => t + r.group * r.costPerFlip, 0) / n : NaN
}

let CACHE: StateFlipCosts | undefined

export function stateFlipCosts(): StateFlipCosts {
  if (CACHE) return CACHE
  const rows: FlipCostRow[] = stateFlips()
    .map((f) => {
      const n = flipNumbers(f)
      return { flip: f, group: n.group, medianChapters: n.medianChapters, chaptersPlayed: n.chaptersPlayed, meanChance: n.meanChance, costPerChapter: n.costPerChapter, costPerFlip: n.costPerFlip }
    })
    .filter((r) => r.group > 0)
  const byDimension = DIMENSIONS.map((d) => {
    const rs = rows.filter((r) => r.flip.dimension === d)
    const sorted = [...rs].sort((a, b) => a.costPerFlip - b.costPerFlip)
    return { dimension: d, flips: rs.length, people: rs.reduce((t, r) => t + r.group, 0), costPerFlip: weighted(rs), cheapest: sorted[0], dearest: sorted[sorted.length - 1] }
  })
  return (CACHE = { rows, byDimension, overallCostPerFlip: weighted(rows), costPerChapter: rows[0]?.costPerChapter ?? NaN, population: populationCost() })
}
