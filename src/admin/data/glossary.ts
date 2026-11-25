/**
 * Admin → Reports, in plain language (U128, J181). The words the reports
 * cannot avoid, each with a definition a person with no product, AI or
 * finance background can read. Report text marks a glossary word as
 * `{{id|shown text}}` (or `{{id}}` to show the term itself); `RichText`
 * renders it as a `Term` with a dotted underline and this definition as its
 * tooltip. `glossary.test.ts` fails when a marked id has no entry, and
 * `reportSummaries.test.ts` fails when a jargon word in a summary is not
 * marked.
 */

export interface GlossaryEntry {
  term: string
  plain: string
}

export const GLOSSARY = {
  simulated: { term: 'Simulated people', plain: 'Made-up people played by an AI. Each has an age, a country and a life. They are not real users.' },
  'paid-plan': { term: 'Paid plan', plain: 'Aurelia Plus: the subscription that removes the free limit. It costs $10 a month in the app today.' },
  'free-limit': { term: 'Free limit', plain: 'How many sessions a person can make for free before Aurelia asks them to pay.' },
  points: { term: 'Points', plain: 'The difference between two percentages. 44% is 8 points more than 36%.' },
  'fair-price': { term: 'Fair price range', plain: 'The monthly prices the simulated people called fair: not suspiciously cheap, not too expensive.' },
  test: { term: 'Test', plain: 'One round of asking the simulated people. We ran seven, changing the product, price or people between rounds.' },
  target: { term: 'Target', plain: 'The share the team hopes for at this step. A goal we set, not a result.' },
  journey: { term: 'Customer journey', plain: 'The five steps a person takes: arrives, enjoys a first session, uses up the free sessions, starts paying, keeps using.' },
  chapter: { term: 'Audio session', plain: 'One audio session made by AI for one person: words, voice, music and a picture. The data calls it a chapter.' },
  'person-helped': { term: 'Person helped', plain: 'One person whose sleep goes from bad to good: from 25 to 85 on a 0–100 scale.' },
  'learning-stage': { term: 'Learning stage', plain: 'How much the AI has learned from use. Stage 1 is today; stage 3 is after 100,000+ sessions.' },
  estimate: { term: 'Estimate', plain: 'A calculation from suppliers’ prices and our own guesses. It changes when the guesses do.' },
  assumption: { term: 'Assumption', plain: 'A number from the business owner’s plan, used to see where it leads. Nobody has measured it.' },
  measured: { term: 'Measured', plain: 'Counted from real people or real bills. The only kind of number we can fully trust.' },
  sample: { term: 'Sample data', plain: 'Invented numbers that look real, so the screens can be read before a real study runs. Not measured.' },
  'feedback-group': { term: 'Feedback group', plain: 'A planned study: 30 real people use Aurelia for 8 weeks and tell us how they feel. It has not started yet.' },
  preset: { term: 'Middle option', plain: 'The middle of three ready-made choices of AI suppliers: cheap, middle and best quality.' },
} satisfies Record<string, GlossaryEntry>

export type TermId = keyof typeof GLOSSARY

export const isTermId = (id: string): id is TermId => Object.hasOwn(GLOSSARY, id)

/**
 * Words a layperson stumbles on. Any of them in summary text must sit inside
 * a `{{…}}` mark, or be rewritten.
 */
export const JARGON: RegExp[] = [
  /\bprediction\b/i,
  /\bpersonas?\b/i,
  /\bbuyer agents?\b/i,
  /\bfunnel\b/i,
  /\bcap\b/i,
  /\bupsell\b/i,
  /\baha\b/i,
  /\bflips?\b/i,
  /\bstate-flip\b/i,
  /\bcohort\b/i,
  /\bPlus\b/,
  /\b(Balanced|Lean|Premium)\b/,
  /\bstage [123]\b/i,
  /\bbreak-even\b/i,
  /\bKPI\b/,
  /\bpts\b/,
  /\bfair band\b/i,
  /\bd\d\b/,
  /\bv\d\b/,
  /\bseed\b/i,
  /\bgenerator\b/i,
  /\bledger\b/i,
  /\bscenario\b/i,
  /\bspec\b/i,
  /\b[JU]\d{2,3}\b/,
  /\bchapters?\b/i,
  /\bpoints\b/i,
  /\btarget\b/i,
  /\bsimulated\b/i,
]

const MARK = /\{\{([a-z-]+)(?:\|([^}]*))?\}\}/g

export type Segment = { text: string; term?: TermId }

/** Splits marked text into plain runs and glossary terms. Unknown ids render as plain text. */
export function segments(s: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of s.matchAll(MARK)) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) })
    const id = m[1]
    const shown = m[2] ?? (isTermId(id) ? GLOSSARY[id].term.toLowerCase() : id)
    out.push(isTermId(id) ? { text: shown, term: id } : { text: shown })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ text: s.slice(last) })
  return out
}

/** The text as a reader sees it, marks removed. */
export const plainText = (s: string) => segments(s).map((x) => x.text).join('')

/** The ids a text marks, known or not. */
export const markedIds = (s: string) => [...s.matchAll(MARK)].map((m) => m[1])

/** Jargon left in the unmarked runs of a text. */
export function unmarkedJargon(s: string): string[] {
  const bare = segments(s).filter((x) => !x.term).map((x) => x.text).join(' ')
  return JARGON.filter((re) => re.test(bare)).map((re) => bare.match(re)![0])
}
