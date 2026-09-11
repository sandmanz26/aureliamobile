// The notification feed.
//
// Every row is somebody doing something to a session of yours, so each carries
// both the person and the session — the feed is the clearest place the
// community loop is visible from.

import type { CoverKey } from './photos'

export type NotificationBucket = 'today' | 'yesterday' | 'week' | 'month'

export interface NotificationRecord {
  id: string
  actor: string
  actorPhoto: CoverKey
  /** What they did, as it reads after the name. */
  action: string
  /** Compact age — "1s", "2m", "3h", "2d". */
  age: string
  bucket: NotificationBucket
  /** The session it happened to, so the row can be opened. */
  sessionSlug: string
  sessionPhoto: CoverKey
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
    id: 'n1',
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
    actor: 'Chloe Anderson',
    actorPhoto: 'creatorChloe',
    action: 'listens to your session',
    age: '3h',
    bucket: 'today',
    sessionSlug: 'rainy-mind',
    sessionPhoto: 'rain',
  },
  {
    id: 'n6',
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
    actor: 'Daniel Brooks',
    actorPhoto: 'creatorDaniel',
    action: 'started following you',
    age: '26d',
    bucket: 'month',
    sessionSlug: 'deep-grounding',
    sessionPhoto: 'forest',
  },
]
