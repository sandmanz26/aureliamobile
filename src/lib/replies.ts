/**
 * What Aurelia says back.
 *
 * Every message used to get the same sentence — "Got it — I've noted that for
 * the next revision of your session." — whether you asked for a female voice,
 * said you could not sleep, or typed nothing but "hello". One reply for every
 * input is the thing that makes a demo feel like a demo: the screen is clearly
 * not reading you, so you stop writing anything real into it.
 *
 * This is still mock. There is no model behind it and it does not understand
 * anything: it matches keywords, in order, and returns a written line. What it
 * buys is that the conversation survives being poked at, which is the whole
 * point of a demo somebody else is going to drive.
 *
 * **Order matters.** The first rule that matches wins, so the specific ones
 * come before the general ones — "make it shorter" must not be caught by the
 * rule that answers "make it".
 */

export interface Reply {
  /** What Aurelia says. */
  text: string
  /**
   * Whether this reply hands over the recommendation deck. Only the ones that
   * are actually a proposal do; an answer to "how did I sleep" is not.
   */
  proposes?: boolean
  /**
   * Whether Aurelia is agreeing to change the session itself.
   *
   * These are the ones that have to produce a new cut. Saying "adding white
   * noise underneath" over a card that still reads *Ready to play* on the
   * version from before is the app claiming to have done something it did not
   * do — and the thread is the only record of the request, so there was
   * nothing to go back to either.
   *
   * A brief ("I can't sleep") is not one of these: it proposes, and the deck
   * is what gets applied. Nor is the fallback, which says in as many words
   * that it is noting the request for the *next* revision.
   */
  changes?: boolean
  /**
   * Questions offered instead of an answer.
   *
   * For the one case where the user has told us they have nothing to say. A
   * blank "noted" there is the worst possible reply: it accepts an answer that
   * was not one and moves on, leaving them exactly as stuck. Handing back
   * smaller questions is the only useful move — and they are tappable, so
   * being stuck costs a tap rather than a sentence.
   */
  prompts?: string[]
}

interface Rule {
  id: string
  /** Matched against the message, lower-cased. */
  test: RegExp
  reply: Reply
}

const RULES: Rule[] = [
  // ------------------------------------------------------------- no answer --
  // First, deliberately. "I don't know" contains words other rules would
  // happily match, and a bare "?" would fall through to the fallback, which
  // answers a question that was never asked.
  {
    id: 'dont-know',
    // `?` is anchored — "what should I do?" is a question, not a shrug. The
    // rest are not, so "idk what to change" still lands here.
    test: /^\?+$|^\s*(idk|dunno|no idea|not sure)\b|i\s*(don'?t|do not)\s*know/,
    reply: {
      text: 'It’s alright. Here are few suggestions to help you understand better:',
      prompts: [
        'What did you like most about the meditation?',
        'Would you prefer a longer or shorter meditation next time?',
        'What kind of sounds help you relax before bed?',
        'How do you usually wind down before going to sleep?',
        'Is there anything that makes it harder for you to fall asleep?',
      ],
    },
  },

  // ---------------------------------------------------------------- length --
  {
    id: 'shorter',
    test: /\b(shorter|less time|too long|cut it down|quicker|brief)\b/,
    reply: {
      text: 'Shorter it is. I will take it down and lose the middle chapter rather than speeding anything up — a rushed session is worse than a short one.',
          changes: true,
    },
  },
  {
    id: 'longer',
    test: /\b(longer|extend|more time|too short|stretch)\b/,
    reply: {
      text: 'I can stretch it. Most of the added time goes into the middle, where nothing is asked of you — that is the part people actually want more of.',
          changes: true,
    },
  },
  {
    id: 'duration',
    test: /\b(\d{1,3})\s?(min|mins|minute|minutes|hour|hours|h)\b/,
    reply: {
      text: 'Noted — I will build it to that length and keep the chapters in proportion rather than padding the end.',
          changes: true,
    },
  },

  // ----------------------------------------------------------------- voice --
  {
    id: 'no-voice',
    test: /\b(no voice|without voice|no guidance|no words|instrumental|don'?t speak|no talking)\b/,
    reply: {
      text: 'No voice, then. The breath pacing carries it instead — it is slower to settle into, but nobody ever gets pulled out of it by a word they did not expect.',
          changes: true,
    },
  },
  {
    id: 'female-voice',
    test: /\b(female|woman|she)\b.*\bvoice\b|\bvoice\b.*\b(female|woman)\b|\bfemale voice\b/,
    reply: {
      text: 'A female voice, unhurried. I will keep the cue count low — nine or so across the whole thing, which is what the sessions people finish tend to have.',
          changes: true,
    },
  },
  {
    id: 'male-voice',
    test: /\b(male|man)\b.*\bvoice\b|\bvoice\b.*\b(male|man)\b|\bmale voice\b/,
    reply: {
      text: 'A male voice it is — low and slow, and I will pull it further back in the mix than the female cut, because it sits heavier against a quiet bed.',
          changes: true,
    },
  },

  // ---------------------------------------------------------------- layers --
  {
    id: 'white-noise',
    test: /\b(white noise|static|hiss|fan)\b/,
    reply: {
      text: 'Adding white noise underneath. I will keep it below the bed so it masks the room without becoming the thing you are listening to.',
          changes: true,
    },
  },
  {
    id: 'rain',
    test: /\b(rain|storm|thunder|drizzle)\b/,
    reply: {
      text: 'Rain going in. Steady rather than heavy — the recordings with thunder in them wake people at the wrong moment.',
          changes: true,
    },
  },
  {
    id: 'ocean',
    test: /\b(ocean|sea|waves|tide|water)\b/,
    reply: {
      text: 'An ocean bed, breathing at about six cycles a minute. That is slow enough that your own breath tends to follow it without being told to.',
          changes: true,
    },
  },
  {
    id: 'louder',
    test: /\b(louder|turn it up|raise|more volume)\b/,
    reply: {
      text: 'I will bring that layer up. Everything else stays where it is, so the balance you already liked does not move with it.',
          changes: true,
    },
  },
  {
    id: 'quieter',
    test: /\b(quieter|softer|turn it down|lower|too loud)\b/,
    reply: {
      text: 'Bringing it down. If it ends up too far back I would rather remove the layer than leave it just audible — half-there is the worst setting.',
          changes: true,
    },
  },

  // -------------------------------------------------------------- the ask --
  {
    id: 'cannot-sleep',
    test: /\b(can'?t sleep|cannot sleep|insomnia|awake|wake up|restless|tossing)\b/,
    reply: {
      text: 'That is the pattern I would build against. Something that descends slowly and ends without a chime, so nothing at the end gives you a reason to check the time.',
      proposes: true,
    },
  },
  {
    id: 'stress',
    test: /\b(stress|stressed|anxious|anxiety|tense|wound up|overwhelmed|panic)\b/,
    reply: {
      text: 'Then the useful hour is the one right after it, while the body is still braced for something that is no longer coming. I will build for that rather than for bedtime.',
      proposes: true,
    },
  },
  {
    id: 'tired',
    test: /\b(tired|exhausted|drained|worn out|no energy)\b/,
    reply: {
      text: 'Worn out rather than wound up, then — those want different things. This one should let you put the day down without ending it, so it brightens at the close instead of fading.',
      proposes: true,
    },
  },
  {
    id: 'focus',
    test: /\b(focus|concentrate|work|study|deadline|distracted)\b/,
    reply: {
      text: 'For focus the rule is that it has to be uninteresting. No melody you could follow, nothing that changes on a timescale you would notice.',
      proposes: true,
    },
  },
  {
    id: 'morning',
    test: /\b(morning|wake|start the day|get going)\b/,
    reply: {
      text: 'A climb rather than a jolt. The fast ones wake you up and then drop you an hour later, which is the complaint people come back with.',
      proposes: true,
    },
  },

  // ------------------------------------------------------------ the data --
  {
    id: 'how-did-i-sleep',
    test: /\b(how did i sleep|my sleep|sleep score|slept)\b/,
    reply: {
      text: 'Six hours forty last night, which is about your week. The light sleep is sitting high — that is usually what a late finish looks like rather than anything to worry about.',
    },
  },
  {
    id: 'greeting',
    test: /^\s*(hi|hey|hello|good morning|good evening|morning|yo)\b/,
    reply: {
      text: 'Morning, Adam. Tell me what kind of session you want and I will put one together — or say how you are feeling and I will pick the kind.',
    },
  },
  {
    id: 'thanks',
    test: /\b(thanks|thank you|nice|great|perfect|love it)\b/,
    reply: {
      text: 'Good. I will keep this one as the baseline, so the next version is measured against it rather than starting over.',
    },
  },
]

/**
 * The reply when nothing matched.
 *
 * It says what it actually did — took the note — rather than pretending to
 * have understood, because a confident non-answer is worse than a plain one.
 */
const FALLBACK: Reply = {
  text: 'Got it — I’ve noted that for the next revision of your session.',
}

export function replyTo(message: string): Reply {
  const text = message.toLowerCase()
  return RULES.find((rule) => rule.test.test(text))?.reply ?? FALLBACK
}

/** Exposed so a test or the flow map can enumerate what the demo can answer. */
export const REPLY_RULE_IDS = RULES.map((rule) => rule.id)
