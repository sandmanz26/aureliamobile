import { BatteryLow, Brain, CircleHelp, CloudRain, Moon, Target, Waves, Zap } from 'lucide-react'

// Shared by Home's feeling chips (U036) and onboarding's "How are you
// feeling today?" step (v4, U047), so both write the same sentences and
// reach the same reply rules.

/**
 * "How are you feeling?" — a way in for people who cannot put it into words
 * (U036). Picking one or more writes the sentence into the Ask field, where it
 * can be read and edited before sending; nothing is sent on a tap. Each
 * `says` is phrased to reach the matching reply rule in lib/replies.ts, so
 * the cockpit answers the feeling rather than a generic line. "Not sure" is
 * exclusive and asks Aurelia to help name it — she answers with smaller,
 * nameable states to pick from.
 */
export const FEELINGS = [
  { id: 'sleep', label: 'Hard to sleep', icon: Moon, says: 'I can’t sleep well' },
  { id: 'stressed', label: 'Stressed', icon: Zap, says: 'I’m stressed' },
  { id: 'anxious', label: 'Anxious', icon: Waves, says: 'I feel anxious' },
  { id: 'racing', label: 'Overthinking', icon: Brain, says: 'my mind keeps racing and I feel tense' },
  { id: 'focus', label: 'Can’t focus', icon: Target, says: 'I can’t focus' },
  { id: 'energy', label: 'Low energy', icon: BatteryLow, says: 'I have no energy' },
  { id: 'low', label: 'Feeling low', icon: CloudRain, says: 'I feel drained and low' },
  { id: 'unsure', label: 'Not sure', icon: CircleHelp, says: '' },
] as const
export const UNSURE_ASK = 'I don’t know exactly what I’m feeling right now — can you help me figure it out?'
/** At most this many at once — past three the sentence stops being one. */
export const MAX_FEELINGS = 3

export function feelingSentence(ids: string[]) {
  if (ids.includes('unsure')) return UNSURE_ASK
  const parts = FEELINGS.filter((f) => ids.includes(f.id)).map((f) => f.says)
  if (!parts.length) return ''
  const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`
}
