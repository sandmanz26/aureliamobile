/**
 * What a session has done since it was made — the three tabs behind Insights.
 *
 * Mock, like the rest of `lib/`, and deliberately specific for the same
 * reason: a demo full of zeroes cannot be reasoned about. Nothing here came
 * from a measurement.
 *
 * Everything is keyed off a session rather than global, because Progress is
 * opened from a session's own cockpit and is about that one.
 */
import type { CoverKey } from './photos'
import type { SessionRecord } from './sessions'
import { totalMinutes } from './sessions'

export type ProgressTab = 'chapters' | 'social' | 'insights'

/** One earlier cut of the session, newest first. */
export interface Version {
  id: string
  title: string
  /** The change this version made, as its author described it. */
  chapter: string
  detail: string
  author: string
  authorPhoto: CoverKey
  /** How much it moved the objective. */
  delta: string
  minutes: string
  photo: CoverKey
  gradient: string
}

/** Something a listener did with the session, and what it earned. */
export interface CommunityEvent {
  id: string
  person: string
  did: string
  when: string
  coins: string
}

/** A step in the chain this session came from or spawned. */
export interface LineageEntry {
  id: string
  title: string
  author: string
  authorPhoto: CoverKey
  date: string
}

/** A pattern Aurelia claims to have noticed. */
export interface Insight {
  id: string
  title: string
  body: string
  date: string
}

export interface Progress {
  objective: string
  versions: Version[]
  earnings: string
  timesPlayed: string
  recreated: string
  community: CommunityEvent[]
  communityTotal: number
  lineage: LineageEntry[]
  lineageTotal: number
  insights: Insight[]
}

/**
 * Built from the session so the numbers agree with the row that opened it —
 * a session showing 124k plays in the list must not show something else here.
 * The rest is invented per the file's own standard.
 */
/** The goal a listener sets, by the kind of session they set it against. */
const OBJECTIVES: Record<string, string> = {
  Sleep: 'Improve my sleep',
  Calm: 'Lower my stress',
  Energy: 'Start the day better',
  Music: 'Find my focus',
  Meditations: 'Build a daily practice',
}

/**
 * One cut of a session, by the id its card carries — what the player is asked
 * for when you press play on a version rather than on the session itself.
 *
 * Undefined when nothing is asked for, which is the session as it stands.
 */
export function findVersion(session: SessionRecord, id: string | null | undefined): Version | undefined {
  if (!id) return undefined
  return progressFor(session).versions.find((version) => version.id === id)
}

export function progressFor(session: SessionRecord): Progress {
  const minutes = totalMinutes(session)
  const clock = `${minutes}:${String(session.seconds ?? 0).padStart(2, '0')} mins`
  const draft = session.published === false

  return {
    // Not session.intent: that is the creator's sentence about what the mix is
    // for, and it runs long. The objective is the listener's own goal, short
    // enough to sit on one line beside an edit button — as the frame has it.
    objective: OBJECTIVES[session.category] ?? 'Feel better day to day',

    versions: [
      {
        id: 'v3',
        title: `${session.title} v1.3`,
        chapter: session.chapters[1]?.label ?? 'The Off-Switch',
        detail: session.chapters[1]?.detail ?? session.summary,
        author: session.author,
        authorPhoto: session.authorPhoto,
        delta: '12%',
        minutes: clock,
        photo: session.photo,
        gradient: session.gradient,
      },
      {
        id: 'v2',
        title: `${session.title} v1.2`,
        chapter: session.chapters[0]?.label ?? 'Arrival',
        detail: session.chapters[0]?.detail ?? session.summary,
        author: session.author,
        authorPhoto: session.authorPhoto,
        delta: '8%',
        minutes: clock,
        photo: 'bloom',
        gradient: session.gradient,
      },
    ],

    // A draft has earned nothing and been played by nobody, which is the whole
    // difference between it and a session that is out.
    earnings: draft ? '0' : '2,521',
    timesPlayed: draft ? '0' : session.plays,
    recreated: draft ? '0' : session.recreated,

    community: draft
      ? []
      : [
          {
            id: 'dolores',
            person: 'Dolores',
            did: 'improved her sleep today using your session',
            when: 'Today',
            coins: '+10',
          },
          {
            id: 'hanna',
            person: 'Hanna',
            did: 'recreated her own version using your session',
            when: 'Yesterday',
            coins: '+25',
          },
        ],
    communityTotal: draft ? 0 : 10,

    lineage: session.lineage.map((step, index) => ({
      id: `${step.author}-${index}`,
      title: step.title,
      author: step.author,
      authorPhoto: index === session.lineage.length - 1 ? session.authorPhoto : 'avatar',
      date: ['2026.2.23', '2026.6.21', '2026.12.10'][index] ?? '2026.6.21',
    })),
    lineageTotal: 10,

    insights: [
      {
        id: 'coffee',
        title: 'Less coffee, better sleep',
        body:
          'On days when you drink less coffee, you tend to sleep better and wake up feeling more rested the next day.',
        date: '2026.6.21',
      },
      {
        id: 'routine',
        title: 'Your sleep likes a routine',
        body:
          'Your sleep quality tends to improve when you go to bed and wake up around the same time, helping your body settle into a more regular rhythm.',
        date: '2026.6.21',
      },
      {
        id: 'active',
        title: 'Active days, deeper rest',
        body:
          'You tend to get better-quality sleep on days when you’re more physically active, suggesting that movement may be helping you wind down at night.',
        date: '2026.6.21',
      },
      {
        id: 'evenings',
        title: 'Your evenings matter more than you think',
        body:
          'You tend to sleep better on evenings with less screen time, which may give your mind more space to slow down before bed.',
        date: '2026.6.21',
      },
    ],
  }
}
