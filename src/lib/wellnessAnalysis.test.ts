import { describe, expect, it } from 'vitest'
import type { Analysis } from './wellnessAnalysis'
import { ANALYSES, analysisForSession, chapterBrief, nextChapterOf, predictionOf, progressOf, statusOf, summaryOf } from './wellnessAnalysis'

const clarity = ANALYSES.find((a) => a.id === 'mental-clarity')!

describe('wellness analysis', () => {
  it('derives progress from the objective metric, so ring, card and list agree', () => {
    for (const a of ANALYSES) expect(progressOf(a)).toBe(a.metrics[0].value)
  })

  it('uses one set of thresholds for the status', () => {
    expect(statusOf(50).heading).toBe('Great Progress!')
    expect(statusOf(49).heading).toBe('Good Progress')
    expect(statusOf(35).heading).toBe('Good Progress')
    expect(statusOf(34).heading).toBe('Needs Improvement')
  })

  it('writes the summary from the strongest shift', () => {
    expect(summaryOf(clarity)).toBe('In a short time you moved from anxious to calm by 35%.')
  })

  it('says so when progress dipped since yesterday', () => {
    const dipped: Analysis = { ...clarity, sinceYesterday: -4 }
    expect(summaryOf(dipped)).toMatch(/^Progress dipped 4% since yesterday/)
  })

  it('names the next chapter and its brief from the record', () => {
    expect(nextChapterOf(clarity)).toBe(2)
    expect(predictionOf(clarity)).toContain('chapter one')
    expect(chapterBrief(clarity)).toBe('Create Chapter 2 with 435 Hz, Longer exhale and Warmer light')
  })

  it('finds the analysis a session has, and none for others', () => {
    expect(analysisForSession('dolphins-frequency')?.id).toBe('mental-clarity')
    expect(analysisForSession('golden-hour')).toBeUndefined()
  })

  it('never lists the same helper twice (a Figma frame did)', () => {
    for (const a of ANALYSES) expect(new Set(a.helped.map((h) => h.title)).size).toBe(a.helped.length)
  })
})
