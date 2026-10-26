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
