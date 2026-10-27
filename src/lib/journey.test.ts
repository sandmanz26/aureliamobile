import { beforeEach, describe, expect, it } from 'vitest'
import { addCheckIn, defaultReminderTime, readJourney, reminderIcs, resetJourney, setReminder, startJourney } from './journey'

describe('journey', () => {
  beforeEach(() => localStorage.clear())

  it('keeps the first session and every check-in across visits', () => {
    expect(readJourney()).toBeNull()
    startJourney({ goal: 'sleep', name: 'Sleep better', slug: 'dolphins-frequency', href: '/play/dolphins-frequency' })
    addCheckIn(3, 1)
    addCheckIn(4, 2)
    setReminder('22:30')
    expect(readJourney()).toMatchObject({ name: 'Sleep better', reminder: '22:30', checkIns: [{ at: 1, mood: 3 }, { at: 2, mood: 4 }] })
  })

  it('does nothing without a journey, and forgets on reset', () => {
    expect(addCheckIn(5)).toBeNull()
    startJourney({ goal: null, name: 'x', slug: 'y', href: '/play/y' })
    resetJourney()
    expect(readJourney()).toBeNull()
  })

  it('reads an edited or older record as none', () => {
    localStorage.setItem('aurelia.journey', JSON.stringify({ name: 'x', checkIns: [{ at: 1, mood: 9 }] }))
    expect(readJourney()).toBeNull()
  })

  it('suggests a reminder time for the goal', () => {
    expect(defaultReminderTime('sleep')).toBe('22:30')
    expect(defaultReminderTime(null)).toBe('20:00')
  })
})

describe('reminderIcs', () => {
  it('starts tomorrow at the chosen time and repeats for the chapters left', () => {
    const ics = reminderIcs({ name: 'Sleep better', time: '22:30', remaining: 4, url: 'https://x/home', from: new Date(2026, 9, 25, 21, 0) })
    expect(ics).toContain('DTSTART:20261026T223000')
    expect(ics).toContain('RRULE:FREQ=DAILY;COUNT=4')
    expect(ics).toContain('SUMMARY:Aurelia · Sleep better: your next chapter')
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR')
  })
})

describe('journal and feeling summary (v5, U053)', () => {
  beforeEach(() => localStorage.clear())

  it('keeps a note on the last check-in and journal lines on their own', async () => {
    const { noteLastCheckIn, addJournalNote } = await import('./journey')
    startJourney({ goal: 'sleep', name: 'Sleep better', slug: 'dolphins-frequency', href: '/play/dolphins-frequency' })
    addCheckIn(3, 1)
    noteLastCheckIn('  Fell asleep before midnight  ')
    addJournalNote('Long day, skipped the session', 2, 5)
    expect(readJourney()).toMatchObject({ checkIns: [{ mood: 3, note: 'Fell asleep before midnight' }], notes: [{ at: 5, text: 'Long day, skipped the session', mood: 2 }] })
  })

  it('ignores empty notes', async () => {
    const { addJournalNote } = await import('./journey')
    startJourney({ goal: null, name: 'x', slug: 'y', href: '/play/y' })
    addJournalNote('   ')
    expect(readJourney()?.notes).toBeUndefined()
  })

  it('says the direction in words, never a score', async () => {
    const { feelingSummary } = await import('./journey')
    expect(feelingSummary([])).toEqual({ trend: 'new', usual: '', count: 0 })
    expect(feelingSummary([{ at: 1, mood: 3 }])).toMatchObject({ trend: 'new', usual: 'Neutral' })
    expect(feelingSummary([{ at: 1, mood: 2 }, { at: 2, mood: 3 }, { at: 3, mood: 4 }, { at: 4, mood: 4 }])).toMatchObject({ trend: 'up', usual: 'Pleasant', count: 4 })
    expect(feelingSummary([{ at: 1, mood: 4 }, { at: 2, mood: 4 }])).toMatchObject({ trend: 'same' })
    expect(feelingSummary([{ at: 1, mood: 5 }, { at: 2, mood: 2 }])).toMatchObject({ trend: 'down' })
  })
})
