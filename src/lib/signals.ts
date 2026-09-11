// The signal sources behind My Wellness.
//
// A "signal" is anything Aurelia can read to decide what a session should be.
// They are grouped by what they tell it about: the body, the day, and the room
// you are in. A real build swaps this for the `integrations` table and an OAuth
// connection per source — the shape here is deliberately close to it.

import type { LucideIcon } from 'lucide-react'
import { CalendarDays, CircleDot, CloudSun, MapPin, MessagesSquare, Watch } from 'lucide-react'

export type SignalGroup = 'Biological' | 'Cognitive' | 'Atmospheric'

export interface SignalSource {
  id: string
  name: string
  group: SignalGroup
  icon: LucideIcon
  /** Whether it is connected out of the box, before the visitor touches anything. */
  defaultOn: boolean
  /** What Aurelia actually reads from it — shown on the row, so consent is informed. */
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

export function sourcesInGroup(group: SignalGroup) {
  return SIGNAL_SOURCES.filter((source) => source.group === group)
}

/** The state the screen opens in. */
export function defaultConnections(): Record<string, boolean> {
  return Object.fromEntries(SIGNAL_SOURCES.map((source) => [source.id, source.defaultOn]))
}
