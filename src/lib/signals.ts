// The signal sources behind My Wellness.
//
// A "signal" is anything Aurelia can read to decide what a session should be.
// They are grouped by what they tell it about: the body, the day, and the room
// you are in. A real build swaps this for the `integrations` table and an OAuth
// connection per source — the shape here is deliberately close to it.

import type { LucideIcon } from 'lucide-react'
import { Activity, CalendarDays, CircleDot, CloudSun, MapPin, MessagesSquare, Watch } from 'lucide-react'

export type SignalGroup = 'Biological' | 'Cognitive' | 'Atmospheric'

export interface SignalSource {
  id: string
  name: string
  group: SignalGroup
  icon: LucideIcon
  /** Whether it is connected out of the box, before the visitor touches anything. */
  defaultOn: boolean
  /**
   * What Aurelia actually reads from it.
   *
   * Not rendered — the design's rows are a single line. Kept because it is the
   * content the consent story needs somewhere (see the PRD's My Wellness
   * section), and because whatever the integration pulls has to match it.
   */
  reads: string
}

export const SIGNAL_GROUPS: SignalGroup[] = ['Biological', 'Cognitive', 'Atmospheric']

export const SIGNAL_SOURCES: SignalSource[] = [
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    group: 'Biological',
    icon: Watch,
    defaultOn: true,
    reads: 'Heart rate, sleep stages, activity',
  },
  {
    id: 'oura-ring',
    name: 'Oura Ring',
    group: 'Biological',
    icon: CircleDot,
    defaultOn: false,
    reads: 'Readiness, HRV, body temperature',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    group: 'Cognitive',
    icon: CalendarDays,
    defaultOn: true,
    reads: 'Busy blocks only — never titles or guests',
  },
  {
    id: 'conversation-history',
    name: 'Conversation History',
    group: 'Cognitive',
    icon: MessagesSquare,
    defaultOn: true,
    reads: 'What you asked Aurelia for, and what helped',
  },
  {
    id: 'weather-data',
    name: 'Weather Data',
    group: 'Atmospheric',
    icon: CloudSun,
    defaultOn: true,
    reads: 'Daylight, pressure, temperature',
  },
  {
    id: 'location-data',
    name: 'Location Data',
    group: 'Atmospheric',
    icon: MapPin,
    defaultOn: false,
    reads: 'Coarse area, to know the season and daylight',
  },
]

/**
 * v5 (U053): sources only design v5 lists. Whoop is here because one of the
 * three interviewed users wears one; kept out of SIGNAL_SOURCES so v1–v4 and
 * the admin list are unchanged.
 */
export const V5_SOURCES: SignalSource[] = [
  { id: 'whoop', name: 'Whoop', group: 'Biological', icon: Activity, defaultOn: false, reads: 'Heart rate, HRV, sleep, strain' },
]

export function sourcesInGroup(group: SignalGroup, v5 = false) {
  return [...SIGNAL_SOURCES, ...(v5 ? V5_SOURCES : [])].filter((source) => source.group === group)
}

/** Onboarding's wearable choice (v5) → the source it switches on. */
const WEARABLE_SOURCE: Record<string, string> = { 'apple-watch': 'apple-watch', whoop: 'whoop', oura: 'oura-ring' }

/** v5: everything off except the wearable the person chose in onboarding. */
export function connectionsForWearable(wearable: string | undefined): Record<string, boolean> {
  const on = wearable ? WEARABLE_SOURCE[wearable] : undefined
  return Object.fromEntries([...SIGNAL_SOURCES, ...V5_SOURCES].map((source) => [source.id, source.id === on]))
}

/** The state the screen opens in. `allOff` is design v4 (U050): nothing connected until the person connects it. */
export function defaultConnections(allOff = false): Record<string, boolean> {
  return Object.fromEntries(SIGNAL_SOURCES.map((source) => [source.id, allOff ? false : source.defaultOn]))
}
