import type { AgentId, DesignId } from './buyerSim'

/**
 * The agent's reading of each re-run report (U104, J139), written from the
 * computed tallies; `buyerSim.test.ts` pins the figures these sentences quote,
 * so a change to the rules that moves them fails the check.
 */

export const OVERALL_SUMMARY: string[] = [
  'Production v1 is clearly the weakest under every set of rules. Nothing plays before an account, so only 53–61% hear a session on the first visit, against 81–89% on production v2 and v3. Then the chat opens on a demo conversation and the numbers shown are not theirs. About 3% come back after a week, against 6–10%.',
  'Production v2 and v3 are close, and they differ in the way you would expect. v3’s progress in words and Why help the people who want proof, so more of them come back: day 7 is 10% against 8% under the v2 rules. v3’s extra onboarding question (the wearable) costs impatient people before their own session; under the v3 rules it loses 3 people there, and completion drops from 63% to 53%. The net is roughly a tie.',
  'So the recommendation is not v2 or v3 but v3 with the wearable question moved to after the first session. That should keep v3’s return gain without its onboarding loss. It is the first thing to check with the feedback group.',
  'The same three reasons cost people in every version: an account before their own session (5–7 people), a voice they cannot change (3–5), and English only. None of the three versions answers them; they are product gaps, not design-version differences.',
  'Return stays low everywhere. The best case is day 30 at about 4% of the panel, inside the category’s 3–5%. Among the few who are still active, 33–47% would be “very disappointed” without it, close to the 40% bar. Aurelia’s question is not whether people who stay love it, but how to get more of them past the first week.',
  'Agent v1’s rules, which were not calibrated, overstate everything: every person finishes, and day 7 is 10–22%. Keep them only as a warning. Read agent v3’s numbers as the best estimate, and agent v2’s as the range’s other end.',
]

export const SUMMARIES: Record<AgentId, Record<DesignId, string[]>> = {
  1: {
    1: [
      'Uncalibrated rules: 9 of 10 hear a session and all of them finish. Snags only slow people down. No one says yes without a snag on the way here (5 yes, 4 maybe).',
      'Even so, coming back is low (day 7 10%), because nothing waits for them tomorrow and the numbers in the player are not theirs; 6 of the 10 lose interest for that reason.',
    ],
    2: [
      'Quick Start before an account and “Chapter 2 is ready tomorrow” double the return under these rules (day 7 19%, 3.2 sessions in week one).',
      'Price is the main reason not to stay (5 of 10), as in run v1: the fair band sits under $9.99.',
    ],
    3: [
      'The highest numbers on the page (day 7 22%, day 30 9%), and the least believable: these rules let every snag pass.',
      'Read it as the ceiling an agreeable agent would report, which is why runs v2 and v3 added calibration.',
    ],
  },
  2: {
    1: [
      'Half the panel never hears a session (53%): 7 cannot read or will not try at Home, and 5 leave when asked for an account before anything plays.',
      'Building their own session is where most people are slowed (19 of 24), because the chat opens on a demo conversation. The numbers shown are not theirs, the most common reason for not coming back (13).',
      'Day 7 about 3%, day 30 about 1%, below the category baseline. Nobody is “very disappointed” without it.',
    ],
    2: [
      'Hearing a Quick Start session before an account lifts activation to 81%; the same 5 still leave at sign-in, but after hearing one.',
      '15 try without a snag. Day 7 8%, day 30 3%, inside the category baseline. 46% of the people still active would be very disappointed without it.',
      'Why people do not stay: nothing brings them back (10), price (7), an account first (5).',
    ],
    3: [
      'The best of the three under these rules: day 7 10%, day 30 4%, 2.3 sessions in week one, 2 would pay and 9 might.',
      'Progress in words and the Why help the proof-seekers. Nothing-brings-them-back falls from 10 to 5. Price becomes the top reason (9).',
      'The wearable question slows 6 people in onboarding, one more than v2, but under these rules nobody leaves over it.',
    ],
  },
  3: {
    1: [
      'With the research’s evidence applied, 61% hear a session; sign-in is where the funnel loses most (7 leave, 11 slowed), because nothing plays before it.',
      'The demo conversation slows 22 of 25 when they build their own. Numbers that are not theirs are the top reason not to return (15). Day 7 about 3%.',
      'Only 12% would recommend it. It is the version to retire.',
    ],
    2: [
      'Activation 89%: almost everyone hears a Quick Start session. Sign-in still costs 7 (an account first is their deal breaker).',
      'Completion 63%; day 7 7%, day 30 2%. 33% of the active would be very disappointed without it.',
      'Why people stop: nothing brings them back (10), an account first (7), the voice (5).',
    ],
    3: [
      'Same activation as v2 (89%). Six questions before their own session cost 3 impatient people in onboarding, so completion drops to 53%.',
      'Those who get through come back as often (day 7 6.5% against 6.8%) and love it more: 43% very disappointed against 33%. The return features work; the extra question costs.',
      'Moving the wearable question to after the first session is the single change this report points to.',
    ],
  },
}
