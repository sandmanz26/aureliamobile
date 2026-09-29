// The "Analytics" tab on My Wellness — what a goal is doing for you, as
// opposed to `signals.ts`, which is what Aurelia is allowed to read to
// figure that out. Two different questions, two different tabs, two
// different files.
//
// Invented, deliberately specific — same convention as the rest of `lib/`.
// Not derived from `lib/sessions`: a session's own `tags` describe its
// topic for the catalogue, not the mechanisms behind why it's working for
// *you*, which is what this screen is actually claiming to show.

export interface WellnessGoal {
  id: string
  /** The small line above the title — "Session 1", "Objective". */
  kind: string
  title: string
  xpCurrent: number
  xpTarget: number
  /** "What's helping me progress" body copy. */
  progress: string
  /** Hashtags under the progress copy — `TagRow` folds anything past 4. */
  tags: string[]
  /** 0–100. Where the needle sits between "Challenging" and "Aligned". */
  alignmentScore: number
  previousState: string[]
  currentState: string[]
  /** The topic-specific half of the two footer buttons — "Analyze my state" is shared, this isn't. */
  secondaryAction: string
}

export const WELLNESS_GOALS: WellnessGoal[] = [
  {
    id: 'mental-clarity',
    kind: 'Session 1',
    title: 'Gain mental clarity',
    xpCurrent: 3000,
    xpTarget: 4000,
    progress:
      "This track uses decelerating musical tempos and chaotic word patterns to mimic the brain's natural pre-sleep state.",
    tags: [
      'dolphinfrequency',
      'breathwork',
      'grounding',
      '432hz',
      'oceansounds',
      'meditation',
      'calm',
      'stressrelief',
      'eveningwinddown',
    ],
    alignmentScore: 65,
    previousState: ['anxious', 'scattered', 'overwhelmed'],
    currentState: ['aligned', 'grounded', 'peaceful'],
    secondaryAction: 'Chat about sleep',
  },
  {
    id: 'improve-sleep',
    kind: 'Objective',
    title: 'Improve my sleep',
    xpCurrent: 600,
    xpTarget: 1800,
    progress:
      'A consistent wind-down window and a cooler room have moved your average sleep score up over the last two weeks.',
    tags: ['sleepscore', 'winddown', 'consistency', 'temperature', 'noscreens', 'melatonin', 'deepsleep'],
    alignmentScore: 40,
    previousState: ['restless', 'wired', 'latenights'],
    currentState: ['settled', 'steady', 'rested'],
    secondaryAction: 'Chat about sleep',
  },
]
