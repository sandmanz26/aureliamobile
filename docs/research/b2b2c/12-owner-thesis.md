# The business owner's thesis

*Part of the [B2B2C research](/wiki/b2b2c). **This page is his thesis, not a measurement.** It records the scale claims from the business owner's deck and chats (24 and 27 Nov 2026) in his words, so they are not lost and not mistaken for evidence. Next to each claim is our note on what would make it measurable. Nothing on this page has been measured on Aurelia users: there are none yet.*

## In one minute

- **The idea:** Aurelia as a "meta-AI engine for your wellness quests". Thousands of text, image, audio, voice and video models compete in internal tournaments, judged by the Causal AI, to deliver "the proven pathway to a state change" (a StateFlip). His comparison is momondo or Skyscanner for airlines: Aurelia is the logic layer, the models are the carriers.
- **The scale he describes:** about 120,000 AKPs ("legos", building blocks), combining into more than 500 billion unique variations; 500 million people in need; 10 StateFlips a year each, so 5 billion StateFlips a year; a valuation that holds "even at a radical floor of $1.00 per flip".
- **Where we stand:** each of these is a target or a belief. The admin computes what it can from stated assumptions (the [Cost report](/admin/reports/cost) and the three metric lines on [Reports](/admin/reports)), and labels them Assumed.

## The claims, and what would make each measurable

| His claim (his words, not measured) | Status today | What would make it measurable |
| --- | --- | --- |
| **A meta-AI engine**: many suppliers' models compete in tournaments judged by the Causal AI | Not built. The cost model picks one model per media by preset; no tournament runs. | Log every tournament: candidates, the judge's score, the winner, the cost. A winner that beats a fixed baseline on the next check-in, more often than chance, is the measurement. |
| **About 120,000 AKPs** (building blocks, "everything called entities") | The admin's AKP catalogue holds a small hand-made set; the 2025 documents describe the taxonomy but came without data. | An exported AKP table with ids, kind (goal or strategy) and links, counted by the backend. The count is then a fact; how many are ever *used* in a winning chapter is the more useful number. |
| **500 billion unique variations** of those AKPs | A combinatorial upper bound, not a count of anything that exists. | Report the variations actually generated and played, and how many reached a check-in. The bound is fine as a picture; it is not a metric. |
| **5 billion StateFlips a year** (500 million people × 10) | Market sizing by assumption. No flip has been measured yet. | Count flips: a person whose check-in score crosses the good threshold and stays there (the sleep StateFlip's 85). Then flips per active person per year, from real accounts. |
| **A $1 per flip floor** | The cost model puts cost per flip between about $2 and $27 by Causal AI stage on its assumptions (see Reports → Three metric lines). | Real compute bills per chapter (the 2025 test sessions are the only measured costs so far), divided by measured flips. Price per flip can then be compared to cost per flip. |
| **Compute cost trends toward zero by 2028** | A forecast. | Track the supplier price table over time (prices are dated in the Cost report) and the real cost per chapter month by month. |
| **Living Intelligence tiles** (500+ learnings a day, 10B+ insights, 1.5M+ links, 100M+ pathways, 300M+ state possibilities) | Investor visuals. No data behind them in anything we have received. | Each needs a definition and a counter in the backend before it can be shown as a number. Until then they stay off any screen that reads as a measurement. |

## How we use it

- In the admin, a figure that comes from this thesis is labelled **Business owner's document** in the report's Data sources, never Measured.
- When a claim gets a counter in the backend, its row above moves to "measured" with the date, and the admin shows the measured value next to his.
