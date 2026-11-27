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
  'life-situation': { term: 'Life situation', plain: 'What is happening in a person’s life right now, like exams, a new baby or losing a job.' },
  'wellness-score': { term: 'Wellness score', plain: 'Where a person starts on our 0–100 scale, higher is better. Below 40 is severe, 40–64 moderate, 65 and up mild.' },
  screening: { term: 'Screening band', plain: 'A rough sort from a few short questions, like the PHQ-2 or GAD-2 forms. It is never a diagnosis.' },
  traceable: { term: 'Traces back to data', plain: 'We can work the number out again from the answers, people or prices behind it. We get the same result.' },
  recomputed: { term: 'Worked out again', plain: 'The number calculated a second time, here, straight from the underlying data. Not copied from the report.' },
  median: { term: 'Median', plain: 'The middle value when all answers are sorted from low to high. One extreme answer cannot pull it.' },
  'stated-wtp': { term: 'Stated willingness to pay', plain: 'What each made-up person says they would pay a month, written in their profile: free only, up to $5, up to $10, or more.' },
  'offer-effect': { term: 'What was tested', plain: 'How much of a change comes from showing a different offer. We replay the old offer on the new people to measure it.' },
  'panel-effect': { term: 'Who was asked', plain: 'How much of a change comes from asking different made-up people. Same offer, other people.' },
  'rules-effect': { term: 'The rules', plain: 'How much comes from the AI counting more facts about each person, with everything else held still.' },
  'like-for-like': { term: 'Like for like', plain: 'Both numbers measure the same offer. Only then is a rise or fall a trend.' },
  bridge: { term: 'Bridge chart', plain: 'Starts at the old number, adds each cause as a step up or down, and ends at the new number.' },
  'risk-flag': { term: 'Risk flag', plain: 'The person may be in danger, for example very low mood with thoughts of self-harm. Aurelia shows Need help now? and never sells to them.' },
  condition: { term: 'Current condition', plain: 'How a person is doing right now across five areas of life, each scored 0–100. Higher is better. It is never a diagnosis.' },
  dimensions: { term: 'Five dimensions', plain: 'The five areas the business owner named: mental, emotional, relational (people), spiritual (meaning and purpose) and physical.' },
  'main-need': { term: 'Main need', plain: 'The weakest of a person’s five dimensions. It is what Aurelia would work on first.' },
  readiness: { term: 'Readiness to change', plain: 'How close a person is to acting: not yet, thinking, preparing, acting or maintaining. From the stages-of-change model.' },
  confidence: { term: 'Confidence to change', plain: 'How sure a person is that they can change things, from 1 to 10. Psychologists call it self-efficacy.' },
  acuity: { term: 'Acute, ongoing or long-standing', plain: 'How long it has been going on. Acute means weeks, ongoing means months, long-standing means a year or more.' },
  // U140 (J202): the words of Product lab → StateFlips and the wiki's "How Aurelia heals".
  stateflip: { term: 'StateFlip', plain: 'One concrete change from a bad state to a good one, like bad sleep (25 of 100) to good (85).' },
  'universal-need': { term: 'Universal need', plain: 'Something every person needs, like restful sleep or feeling connected. Each of the five dimensions holds many.' },
  dojo: { term: 'DOJO', plain: 'The business owner’s knowledge workbook. It links body areas to concepts, issue-to-wellness pairs, skills, habits and moods.' },
  akp: { term: 'AKP', plain: 'Atomic knowledge point: one small building block of a session, like a breath pattern, a mood or a story. Goal AKPs say what to reach; strategy AKPs say how.' },
  tournament: { term: 'Tournament', plain: 'Building blocks compete for a place in a session. The ones that move people further win and are used more.' },
  session: { term: 'Session', plain: 'A journey towards one goal, like better sleep. It is made of many chapters, one per sitting.' },
  'check-in': { term: 'Check-in', plain: 'Four short questions the morning after each chapter. The answers give the sleep score.' },
  'sleep-score': { term: 'Sleep score', plain: 'Our 0–100 sleep measure from the check-in, higher is better. 25 is bad sleep, 85 is good sleep.' },
  'chance-it-works': { term: 'Chance it works', plain: 'Our prediction of the share of people who reach the good state. It is calculated, not measured yet.' },
  'cost-per-flip': { term: 'Cost per flip', plain: 'What it costs to make the chapters for one person who reaches the good state. It includes the people it does not help.' },
  'causal-stage': { term: 'Causal AI stage', plain: 'How much the AI has learned from real use. Stage 1 is under 1,000 sessions; stage 3 is 100,000 or more.' },
  'causal-layer': { term: 'Causal layer', plain: 'DOJO’s three speeds of change. Moods move in days, habits in weeks, skills in months.' },
  dropout: { term: 'Stopped', plain: 'People who stop using Aurelia before reaching the good state. Our model assumes most failures look like this.' },
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
