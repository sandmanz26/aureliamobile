# How Aurelia heals

Aurelia moves a person from a bad state to a good one, one chapter at a time. This page explains the words we use for that, and walks through the first example built out in full: going from bad sleep to good sleep. The numbers behind it are in the admin under **Product lab → StateFlips** (staging only for now).

Nothing here is measured on real users yet. Every number is labelled: **Spec** (from the business owner's plan), **Assumption** (our own stated choice), **Computed** (worked out from the others) or **Research** (a published sleep scale).

## Key terms

- **Dimension.** One of the five areas of life Aurelia works on: mental (thoughts), emotional (feelings), relational (people), spiritual (meaning and purpose) and physical (sleep, energy, body). Every person has a score in each.
- **Universal need.** Something every person needs inside a dimension, like restful sleep (physical) or feeling connected (relational). There are hundreds; each can be in a bad or a good state.
- **StateFlip.** One concrete change of a universal need from a bad state to a good one, with steps on the way: X, then Y, then Z. The plan starts with 125 of them, 25 in each dimension, and grows towards thousands.
- **DOJO.** The business owner's knowledge workbook. *VES* lists body areas (7 chakras, 12 meridians). Each has *concepts* arranged by *evolutionary frame*, like belt levels (0-1, 0-2 … 2-3). *Duals* pair an issue with its wellness state (insomnia → restful sleep). *Causal layers* say how fast things change: moods in hours to days, habits in days to weeks, skills in weeks to months.
- **AKP (atomic knowledge point).** One small building block of a chapter, like a breath pattern, a mood, a story or a music tempo. *Goal AKPs* say what to reach (the StateFlips). *Strategy and tactic AKPs* say how (concepts, skills, methods, techniques). In *tournaments* the blocks compete, and the ones that move people further are used more; AI models compete the same way on quality and cost.
- **Chapter.** One sitting: a single audio of about 10 minutes, made for one person. (The Cost report calls it a session.)
- **Session.** A programme of chapters towards one goal, like better sleep.
- **Check-in.** Four questions the morning after each chapter. Their answers add up to the sleep score.
- **Chance it works.** Our prediction of the share of people who reach the good state.
- **Cost per flip.** The AI cost of the chapters for one person who reaches the good state, counting the chapters of the people it does not help.
- **Causal AI stage.** How much the AI has learned from real use: stage 1 today (under 1,000 sessions), stage 2 after 10,000, stage 3 after 100,000.

## The sleep StateFlip

**Bad sleep, score 25 of 100.** Lies awake for most of an hour, wakes three times or more, gets five or six hours and drags through the morning. That matches a PSQI score of 10 or more and an ISI score of 15–21 (moderate insomnia).

**Good sleep, score 85.** Falls asleep within 20 minutes, sleeps through or wakes once, gets 7–9 hours and wakes rested. That matches PSQI 5 or less and ISI 0–7.

The sleep score is the sum of four check-in answers, 25 points each:

| Check-in question | Bad | Good | Based on |
| --- | --- | --- | --- |
| How long did it take to fall asleep? | 45–60 minutes | 20 minutes or less | ISI and PSQI; National Sleep Foundation (Research) |
| How many times did you wake for more than 5 minutes? | 3 or more | 1 or none | National Sleep Foundation (Research) |
| How many hours did you sleep? | under 6 | 7–9 | AASM / Sleep Research Society (Research) |
| How rested did you feel this morning, 1–5? | 1–2 | 4–5 | Our own question (Assumption) |

### The path: X → Y → Z

1. **X, winds down before bed (score 45).** The evening feels calmer. This is the *mood* layer, which moves first and fastest. DOJO: Respiratory Awareness and Breath Synchronization (Lung meridian), Relaxation Routines (Bladder meridian), nuance N5 Restorative Routines.
2. **Y, falls asleep faster (score 65).** A wind-down routine and a regular bedtime most nights. This is the *habit* layer. DOJO: Sleep Hygiene (Heart meridian, frame 0-3), dual DI003 Improving Sleep Quality (insomnia → restful sleep).
3. **Z, sleeps through and wakes rested (score 85): the StateFlip.** Settles back after a waking without effort. This is the *skill* layer, the slowest. DOJO: Sleep Quality and Sleep Optimization (Heart meridian), dual DI005 Achieving Restful Recovery, skills SK9 Stress Recovery and SK10 Mind-Body Synchronization.

## How many chapters, and how likely

**Chapters to flip.** Each chapter adds the plan's 1.43 points, faster in the mood stretch (×1.6), about average in the habit stretch (×1.05) and slower in the skill stretch (×0.72), adjusted for where the person starts and how long the problem has lasted. With everything average, 25 → 85 takes 42 chapters, exactly the plan's figure; a milder start takes far fewer, a severe one more.

**Chance it works.** The plan's 54%, multiplied by how often the person would use it, how ready they are to change, how bad their sleep is, and whether audio suits them; kept between 5% and 90%.

**The group over time.** Of the 1,000 simulated people, 90 have sleep as their main need once the risk-flagged are left out (they are shown *Need help now?*, never a programme). Followed chapter by chapter, half would reach good sleep within about 34 chapters if it works for them, and just under half of the group gets there in the end. Most of the rest stop along the way. The admin page shows this as charts, with what drives each stretch and a breakdown for every chapter.

## What this is for

The StateFlips are the goals the Causal AI works towards. Each one links to the strategy building blocks that reach it, so sessions and chapters can be assembled for a person and then tested on real people. When real check-ins arrive, they replace the assumptions here, and the chance it works becomes a measured number.
