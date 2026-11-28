# Buyer agent test 9: show people their first chapter

U150, J208, 28 Nov 2026. A prediction from written rules on simulated people, not a measurement. Code: `src/admin/data/buyerRunV9.ts` (rules), `src/admin/data/akpAssembly.ts` (how the chapter is put together), declaration `V9_CHANGE` in `runChanges.ts`. On the admin: Reports → Buyer agent report → Detail → Test 9.

## What was tested

- **Who:** the same 975 people as test 8 (persona set v4, 1,000 minus the 25 risk-flagged, who get "Need help now?" and never an offer).
- **A:** test 8's winner, unchanged: "A journey for your StateFlip X: free first week, then $10/month". Played by test 8's own rules, so A here is test 8's B person by person.
- **B:** the same journey and price, but the offer shows the person their own first chapter, assembled from catalogue AKPs matched to their Wellness Identity and condition. For example: *"Your first chapter: 4-7-8 breathing, warm low voice at 110 words a minute, 55 BPM tanpura drone, warm amber colours, 10 min."*

How the chapter is assembled (one AKP per role): the technique from their regulation style (breath first → 4-7-8, or a 4-in-6-out exhale when worry or panic rules out breath holds), the StateFlip's own script AKP, voice timbre from their voice preference, pace and tempo from their tempo preference, the music bed from their main need, colours from their palette preference, and their own session length. 975 people got 316 different previews from 56 catalogue AKPs.

## Headline results

| | A (test 8's journey) | B (with their first chapter) |
| --- | ---: | ---: |
| Would try | 321 (33%) | 412 (42%) |
| Would pay after the free week | 170 (17%) | 245 (25%) |
| Expected paid plans (yes 1, maybe ½) | 286.5 | 373 |

173 people pay more readily on B; nobody pays less readily, and nobody who would try A drops out on B.

**Why.** Three things change when the promise becomes a chapter you can picture:
1. **It fits better** (fit 0.8 → 0.9): the journey was already named after their problem; now the voice, tempo, colours and technique are theirs too. Split: +45 expected paid plans.
2. **It can be judged before it is trusted** (the doubt term shrinks by 20%, 5% for people who distrust AI). Split: +41.5.
3. **It shows their own length**, which lifts the "a journey asks too much" load for people with under 5 minutes a day. Split: 0: those people were held back by other things too.

The steps add up exactly to B − A (286.5 → 373).

## By dimension and archetype (would pay, A → B)

| Main need | People | A → B |
| --- | ---: | ---: |
| Physical | 307 | 63 → 84 |
| Relational | 265 | 32 → 49 |
| Mental | 237 | 52 → 78 |
| Meaning and purpose | 121 | 7 → 12 |
| Emotional | 45 | 16 → 22 |

| Archetype | People | A → B |
| --- | ---: | ---: |
| Achiever | 217 | 45 → 65 |
| Explorer | 191 | 26 → 39 |
| Seeker | 183 | 40 → 58 |
| Guardian | 148 | 26 → 35 |
| Rebuilder | 126 | 21 → 29 |
| Caregiver | 110 | 12 → 19 |

Relative to group size, B gains most for emotional needs (+13 points) and Seekers (+10); least for Guardians (+6). Meaning and purpose stays the weakest group: 12 of 121.

## Objections (among those who would not pay)

| Objection | A | B |
| --- | ---: | ---: |
| Does it work for me? (doubt) | 544 | 445 |
| $10 a month is a lot for me | 203 | 222 |
| Not in my language | 56 | 63 |
| Not about my problem | 2 | 0 |

Doubt is still the first objection by far; the preview answers about a fifth of it. Price rises as an objection only because people whose doubt was answered now stop at price instead. The "picked for me by an AI" put-off we added for people who distrust AI is never anyone's largest objection.

## Chance to reach the targets (AI brain)

Would pay after the free week: 17.4% → 25.1% against the 15% target. **The business chance does not move (6.7% → 6.7%)**: test 8's journey already met that target, so the business chance is held back by the other funnel stages (the free limit, day 7, day 30), not by paying. The preview is now a candidate feature on the AI brain ("Show each person their first chapter"), with its lift discounted × 0.2 from stated to real.

## Caveats

- The size of the effect is our assumption (fit +0.1, doubt −20%), written in `V9_RULES`. The direction is plausible; the size is not measured.
- The assembly rules are ours and simple; no clinician has reviewed them, and the catalogue's voice, music and image AKPs are drafted by us.
- Stated intent from rules overstates real buying. The honest next step is a real split: half the visitors see the preview.
