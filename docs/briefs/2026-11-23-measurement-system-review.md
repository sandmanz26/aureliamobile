# The 2025 measurement system, reviewed for the 2026 MVP

**Asked by Eugene** (WhatsApp, 23 Nov 2026):

> Check all tabs against our own admin to see if Claude can extract some more angles to how we measure things. DONT USE EVERYONE. Just those Claude AI thinks based on our Admin and MVP product 2026 has important to include for better analysis. It was designed for old Aurelia 2025, so much might not make sense. Let Claude make a deep analysis and return based on importance scores what metrics segment might be useful for the new product design. Because we still want to keep things simple. And use the most critical that Admin doesn't cover.

**Source:** `2025-measurement-system.xlsx` (kept beside this file). It has 8 tabs and about 250 rows.

## In one minute

- **Most of the sheet does not fit 2026.** About 230 of the 250 rows measure the 2025 product: creators running ad campaigns, podcast and audiobook listening, skill mastery, and brain-signal "entropy" that nothing in today's app can sense. They are not worth carrying over.
- **The admin already covers money and well-being outcomes.** That means revenue, MRR, churn, LTV, payments and pricing, plus WHO-5, check-ins, heart rate and mood change per session.
- **The admin does not measure behaviour or causes.** Nobody can see:
  - whether people come back;
  - where they stop inside a session;
  - how long it takes someone to move from a bad state to a good one (the "state flip" Eugene's model is built on);
  - which building blocks of a session actually help;
  - whether the usage cap turns into Plus;
  - what a user costs to acquire through a creator.
- **The shortlist below is 10 metrics in 5 groups,** all of them gaps. That is enough to run the dual track (buyer agents and digital retreats) and nothing more.

## What each tab is, and the verdict

| Tab | Rows | What it is | Verdict |
| --- | --- | --- | --- |
| **IVAN** | 28 | Metrics at three levels: campaign (L1), script (L2), user (L3). Covers top performers, technique performance, supply and demand, retention, completion, feedback counts. | **The useful core.** The ideas carry over once "campaign" and "script" become "journey" and "session". |
| **Sheet17** | 16 | A four-layer summary: Skills, Habits, Moods, States. | **The idea is good** (habits, mood and state layers match 2026). Most of the individual metrics are not measurable. |
| **Wellness** | 89 | Three models: Skill Acquisition (29), Shannon Entropy (30), Utility Index (30). | **Keep the Utility Index idea** (it is the 2025 attribution prompt) and a handful of state metrics. Drop Skill Acquisition (a 2025 skills product). Drop entropy (it needs signals the app does not have; "neural variability" is not measurable). |
| **User Experince** | 46 | Content and listening metrics, many written for podcasts, video and audiobooks. | **Keep the listening behaviour:** completion, drop-off point, skips, start delay. Drop the text-linguistics metrics (lexical diversity, syntactic complexity, keyword density); they belong in the script judge, not a dashboard. Drop podcast and video subscription metrics. |
| **Business** | 48 | Revenue, campaign advertising, content monetisation, competitive benchmarks, CAC and churn. | **Keep the unit economics the admin lacks:** CAC, LTV:CAC, and conversion from a specific trigger. Drop the ad-campaign ranks, CPM and market share; they are not decisions an MVP makes. |
| Sheet13, Sheet15, Sheet14 | small | Example scores for invented users ("Pixelman") and versions; one row. | Examples only; nothing to carry over. |

## How each metric was scored

Each candidate gets 1–3 on three questions:
- **Decides something now:** does it change a decision about the 2026 MVP, its state-flip model, the retreat or Plus?
- **Measurable now:** can the demo, or a first backend, measure it?
- **Admin gap:** is it missing from today's admin?

The importance score is the product of the three (top is 27). Only metrics scoring 12 or more are kept.

## The shortlist: 10 metrics in 5 groups

| # | Metric (2026 name) | From the sheet | What it answers | Decides | Measurable | Gap | Score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Getting started** | | | | | | | |
| 1 | **Time to first play**, and the share who play on their first visit | UX044 Average Session Start Delay; UX016 CTR | Does the one-sentence promise hold, or do people stall before hearing anything? | 3 | 3 | 3 | **27** |
| 2 | **Drop-off point inside a session** | UX034 Listener Drop-off Point; UX017 Skip Rate; UX001 Completion | Where in a session do people stop, and is it the intro, a technique or the length? | 3 | 3 | 3 | **27** |
| **B. Coming back** | | | | | | | |
| 3 | **Return by cohort: day 1, 7, 30** (measured, not predicted) | IVAN Retention Score; B018 User Retention Rate | Are people still here? The admin only has the buyer agent's predictions. | 3 | 2 | 3 | **18** |
| 4 | **Consistency: sessions in the last 7 days** (forgiving, "4 of 7") | W010 Consistency Ratio; Sheet17 Habits | Is a habit forming, without punishing a missed day? | 3 | 3 | 2 | **18** |
| **C. The state flip** | | | | | | | |
| 5 | **Before → after a session**, from the check-in | W056 Post-Practice Difference; W082 Immediate Impact Rating | Does one session move them? The admin shows an average per session but not who it moved or for how long. | 3 | 3 | 2 | **18** |
| 6 | **Time to flip:** days from a person's first low check-in to a steady good one | W052 State Transition Speed; W039 Recovery Time | Eugene's "sweet spot": when the user starts moving from bad to good, which is when to offer Plus. | 3 | 2 | 3 | **18** |
| **D. What works** | | | | | | | |
| 7 | **Building-block effect:** which voice, technique, length or sound goes with a better check-in | IVAN Technique Performance and Top Impact Entities; W060 Utility Score | Which parts of a session cause the improvement. It feeds the AI that builds the next session ("the AI that builds the AI"). | 3 | 2 | 3 | **18** |
| 8 | **Supply against demand:** moments and goals people ask for, against what the catalogue and building blocks offer | IVAN Supply and Demand | What to build next. It pairs with the user journey's persona demand. | 2 | 2 | 3 | **12** |
| **E. Paying, and what a user costs** | | | | | | | |
| 9 | **Cap → Plus conversion:** the share who hit the free limit, then the share of those who subscribe within 7 days | B013, B016 Conversion Rate (narrowed to the trigger) | Eugene's model in one number: does the AI usage cap sell Plus, or drive people away? | 3 | 2 | 3 | **18** |
| 10 | **CAC and LTV:CAC by channel** (creator, retreat, organic) | B033 CAC; B037 LTV:CAC; B011 CPA | Is a creator-led retreat seat worth what it costs? The admin has LTV but not CAC. | 3 | 1 | 3 | **9** → kept, as the retreat's own number |

**Metric 10 is kept below the threshold** because Retreat-in-a-Box (J149) is mainly a bet on acquisition cost. It cannot be measured until there is a first paid cohort.

## Considered and left out

| Metric | Why left out |
| --- | --- |
| Mastery Change Index, Skill Mastery, Competency Benchmark | Built for the 2025 skills and chakra path model; nothing in 2026 measures "mastery". The state flip (5, 6) replaces it. |
| All Shannon-entropy metrics (entropy level, neural variability, cognitive dissonance…) | They need continuous physiological or brain signals. The wearable is example data until a backend exists. |
| General Satisfaction, Entity Ratings, Number of Feedbacks Left | Satisfaction scores are model guesses or star ratings. The 2026 outcome is the person's own check-in (Artefact lesson 5). Check-in response rate is folded into 4. |
| Readability, lexical diversity, syntactic complexity, rhythm and tempo | Script quality. They belong in the judge rubric run on every prompt change (API contract §8.8), not on a dashboard. |
| Podcast and video conversion, social share rate, buffering | Not this product, or not yet. |
| Ad-campaign ranks, CTR, CPM, CPC, market share, competitive positioning | No paid acquisition yet. Rebuild them, if ever, from 10. |
| Revenue, MRR, ARPU, churn, LTV, payments | Already in the admin (Revenue, Pricing, Payments). |

## Where they would live in the admin, kept simple

| Metric | Home | It already has |
| --- | --- | --- |
| 1, 2, 3, 4 | A **Retention** view beside Revenue, fed by click insights now and the backend later | Click insights (`/__demo/insights`) records views and taps; buyer agent predictions for comparison |
| 5, 6 | **Outcomes** (Well-being outcomes) | WHO-5, check-ins, heart rate |
| 7 | **Sessions**, as a column per building block, from the attribution prompt (Backend old, "utility index") | Average mood change per session |
| 8 | **User journey**, as a Coverage column | Persona demand per moment (U105) |
| 9 | **Pricing** | Paid conversion overall |
| 10 | **Retreat-in-a-Box**, when built | — |

Each of the ten maps to a stage of the business funnel (O43):
- 1 and 2 → entry;
- 5 and 7 → aha;
- 9 → the cap and the upsell;
- 3, 4 and 6 → staying.

So one model serves the funnel, the buyer agents (which predict them) and the digital retreats (which measure them).
