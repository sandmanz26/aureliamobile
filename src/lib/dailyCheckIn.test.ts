import { beforeEach, describe, expect, it } from 'vitest'
import { DAILY_KEY, dayKey, entryFor, readDaily, saveEntry, weekOf } from './dailyCheckIn'

describe('daily check-in', () => {
  beforeEach(() => localStorage.removeItem(DAILY_KEY))

  it('builds a Monday-first week with today and the future marked', () => {
    const week = weekOf(new Date(2026, 10, 13)) // Friday 13 Nov 2026
    expect(week.map((d) => d.day)).toEqual([9, 10, 11, 12, 13, 14, 15])
    expect(week[0].label).toBe('MON')
    expect(week.find((d) => d.today)?.day).toBe(13)
    expect(week.filter((d) => d.future).map((d) => d.day)).toEqual([14, 15])
  })

  it('keeps one entry per day, replacing an edit', () => {
    const today = dayKey(new Date(2026, 10, 13))
    saveEntry({ date: today, mood: 3, helped: null, note: '' })
    saveEntry({ date: today, mood: 5, helped: true, note: 'Slept well' })
    expect(readDaily()).toHaveLength(1)
    expect(entryFor(readDaily(), today)).toMatchObject({ mood: 5, helped: true, note: 'Slept well' })
  })

  it('ignores a stored value of the wrong shape', () => {
    localStorage.setItem(DAILY_KEY, '[{"date":"x"}]')
    expect(readDaily()).toEqual([])
  })
})
