import { useFeatureFlags } from '../demo/FeatureFlags'
import type { SessionRecord } from '../lib/sessions'

/**
 * The brief a Recreate hands to the cockpit.
 *
 * Lives here rather than in ChatPage because four screens build one and the
 * page only reads it. When they disagreed the thread opened on a fork of
 * nothing in particular.
 */
export interface RecreateBrief {
  slug: string
  title: string
  author: string
  minutes: number
  /** What should be different. Empty means the brief was never stated. */
  changes: string[]
}

/** A fork with nothing said about it yet — the whole brief, when the Recreate
 *  screen is skipped and the conversation is where the differences get stated. */
export function briefFor(session: SessionRecord): RecreateBrief {
  return {
    slug: session.slug,
    title: session.title,
    author: session.author,
    minutes: session.minutes,
    changes: [],
  }
}

/**
 * Where Recreate goes.
 *
 * Two answers, and the flag decides which. With `recreate.screen` on it is the
 * form: sliders for length, voice and pace, a layer list, and a brief composed
 * at the bottom. With it off — the default — Recreate opens the cockpit with
 * the fork already attached and asks the same question in words.
 *
 * The screen's own footer said where it was going all along ("Opens in chat so
 * you can keep tuning it out loud"), which is the argument against it: it is a
 * form you fill in to reach a conversation that can take the same answers, and
 * every control on it is a sentence Aurelia already understands. Skipping it
 * costs nothing and saves a screen; the form is still there, one switch away,
 * because a slider is a better instrument than a sentence for "how long" and
 * that may yet win.
 *
 * One hook, four call sites: a Recreate that behaved differently depending on
 * which card you pressed would be worse than either answer.
 */
export function useRecreateTarget(session: SessionRecord | undefined) {
  const { isEnabled } = useFeatureFlags()
  if (!session) return { to: '/home', state: undefined }
  if (isEnabled('recreate.screen')) return { to: `/recreate/${session.slug}`, state: undefined }
  return { to: '/chat', state: { recreate: briefFor(session) } }
}
