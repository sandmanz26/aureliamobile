// The notification feed.
//
// Most rows are somebody doing something to a session of yours, so those carry
// both the person and the session — the feed is the clearest place the
// community loop is visible from. Two kinds speak for the product instead and
// carry neither.

import type { CoverKey } from './photos'

export type NotificationBucket = 'today' | 'yesterday' | 'week' | 'month'

/**
 * Not every notification is somebody doing something.
 *
 * The frame carries three row components, not one: a person (their face, and
 * their name in bold), an account notice (a sparkle on pale gold), and a
 * community notice (a white mark on the dark brown). The feed only modelled
 * the first, so the other two could not be rendered at all.
 */
export type NotificationKind = 'person' | 'account' | 'challenge'

export interface NotificationRecord {
  id: string
  kind: NotificationKind
  /** The person, on a `person` row. The other two kinds speak for the product. */
  actor?: string
  actorPhoto?: CoverKey
  /** What they did, as it reads after the name — or the whole line, without one. */
  action: string
  /** Compact age — "1s", "2m", "3h", "2d". */
  age: string
  bucket: NotificationBucket
  /** The session it happened to, so the row can be opened. */
  sessionSlug?: string
  sessionPhoto?: CoverKey
}

/** Chips across the top. `all` is a view, not a bucket. */
export const NOTIFICATION_FILTERS: { id: 'all' | NotificationBucket; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'Last 30 days' },
]

export const BUCKET_TITLES: Record<NotificationBucket, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Last 7 days',
  month: 'Last 30 days',
}

/** Buckets are cumulative: last 7 days includes today and yesterday. */
export const FILTER_BUCKETS: Record<'all' | NotificationBucket, NotificationBucket[]> = {
  all: ['today', 'yesterday', 'week', 'month'],
  today: ['today'],
  yesterday: ['yesterday'],
  week: ['today', 'yesterday', 'week'],
  month: ['today', 'yesterday', 'week', 'month'],
}

export const NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'n0',
    kind: 'account',
    action: 'You have now upgraded to Aurelia AI Plus',
    age: '1s',
    bucket: 'today',
  },
  {
    id: 'n1',
    kind: 'person',
    actor: 'Aria Moon',
    actorPhoto: 'creatorAria',
    action: 'listens to your session',
    age: '1s',
    bucket: 'today',
    sessionSlug: 'dolphins-frequency',
    sessionPhoto: 'dolphins',
  },
  {
    id: 'n2',
    kind: 'person',
    actor: 'Maya Rivers',
    actorPhoto: 'creatorMaya',
    action: 'recreated your session',
    age: '2m',
    bucket: 'today',
    sessionSlug: 'ocean-breath',
    sessionPhoto: 'waves',
  },
  {
    id: 'n3',
    kind: 'person',
    actor: 'Theo Waves',
    actorPhoto: 'creatorTheo',
    action: 'saved your session',
    age: '18m',
    bucket: 'today',
    sessionSlug: 'mind-dance',
    sessionPhoto: 'mindDance',
  },
  {
    id: 'n4',
    kind: 'person',
    actor: 'Nina Harper',
    actorPhoto: 'creatorNina',
    action: 'started following you',
    age: '1h',
    bucket: 'today',
    sessionSlug: 'golden-hour',
    sessionPhoto: 'glow',
  },
  {
    id: 'n5',
    kind: 'person',
    actor: 'Chloe Anderson',
    actorPhoto: 'creatorChloe',
    action: 'listens to your session',
    age: '3h',
    bucket: 'today',
    sessionSlug: 'rainy-mind',
    sessionPhoto: 'rain',
  },
  {
    id: 'n5b',
    kind: 'challenge',
    action: 'A new monthly challenge has been added!',
    age: '1h',
    bucket: 'today',
  },
  {
    id: 'n6',
    kind: 'person',
    actor: 'Jonas Webber',
    actorPhoto: 'creatorJonas',
    action: 'joined the challenge with you',
    age: '9h',
    bucket: 'yesterday',
    sessionSlug: 'inner-balance',
    sessionPhoto: 'stones',
  },
  {
    id: 'n7',
    kind: 'person',
    actor: 'Lucas Martin',
    actorPhoto: 'creatorLucas',
    action: 'recreated your session',
    age: '16h',
    bucket: 'yesterday',
    sessionSlug: 'quiet-space',
    sessionPhoto: 'meadow',
  },
  {
    id: 'n8',
    kind: 'person',
    actor: 'Amara Osei',
    actorPhoto: 'creatorAmara',
    action: 'listens to your session',
    age: '22h',
    bucket: 'yesterday',
    sessionSlug: 'deep-grounding',
    sessionPhoto: 'forest',
  },
  {
    id: 'n9',
    kind: 'person',
    actor: 'Sara Trezeguat',
    actorPhoto: 'creatorSophia',
    action: 'saved your session',
    age: '2d',
    bucket: 'week',
    sessionSlug: 'raise-your-vibration',
    sessionPhoto: 'vibration',
  },
  {
    id: 'n10',
    kind: 'person',
    actor: 'Adam Nilson',
    actorPhoto: 'avatar',
    action: 'recreated your session',
    age: '3d',
    bucket: 'week',
    sessionSlug: 'cosmic-flow',
    sessionPhoto: 'cosmic',
  },
  {
    id: 'n11',
    kind: 'person',
    actor: 'Mia Parker',
    actorPhoto: 'creatorMia',
    action: 'started following you',
    age: '4d',
    bucket: 'week',
    sessionSlug: 'dream-drift',
    sessionPhoto: 'underwater',
  },
  {
    id: 'n12',
    kind: 'person',
    actor: 'Daniel Kim',
    actorPhoto: 'creatorEthan',
    action: 'listens to your session',
    age: '6d',
    bucket: 'week',
    sessionSlug: 'inner-balance',
    sessionPhoto: 'stones',
  },
  {
    id: 'n13',
    kind: 'person',
    actor: 'Emma Carter',
    actorPhoto: 'creatorAria',
    action: 'recreated your session',
    age: '11d',
    bucket: 'month',
    sessionSlug: '528-hz-reset',
    sessionPhoto: 'water',
  },
  {
    id: 'n14',
    kind: 'person',
    actor: 'Sofia Martinez',
    actorPhoto: 'creatorAmara',
    action: 'saved your session',
    age: '17d',
    bucket: 'month',
    sessionSlug: 'inner-frequency',
    sessionPhoto: 'glow',
  },
  {
    id: 'n15',
    kind: 'person',
    actor: 'Daniel Brooks',
    actorPhoto: 'creatorDaniel',
    action: 'started following you',
    age: '26d',
    bucket: 'month',
    sessionSlug: 'deep-grounding',
    sessionPhoto: 'forest',
  },
]
