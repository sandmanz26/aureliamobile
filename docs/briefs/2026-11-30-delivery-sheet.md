# Monday delivery sheet (30 Nov 2026)

**For the business owner.** On 27 Nov the product owner committed six items for Monday, then the invoice (EUGENE-CONTEXT §0, A42). Below is each item: where to see it, the commit, its status, what to look at, and the one question we need answered. Everything is in the admin on staging and production (all flags are on). Every number is labelled spec, assumption, computed or measured; nothing is measured on real people yet.

Status words: **Done** = built and shipped. **Draft** = built, waiting for your review of the content. **Partial** = part of the ask is built; the rest is named.

| # | Committed item (hours) | Where | Commits | Status |
| --- | --- | --- | --- | --- |
| 1 | The first 1,000 AKPs as the foundation (6h) | Admin → AI brain → StateFlips → **AKP catalogue** tab (`/admin/stateflips`) | `7e6156e` (U141), `88996c9` (U145: catalogue redesign and relationship graph) | Draft |
| 2 | Graph over time (1.5h) | StateFlips → Sleep → **the cohort over time**; Reports → **three metric lines** over the Causal AI stages (`/admin/reports`) | `cef90fc` (U140), `0d0683d` (U146) | Done |
| 3 | Bad-to-good sleep in detail (1h) | StateFlips → **Sleep, in full**: bad 25 and good 85 from four check-in questions, steps X → Y → Z, who has it, DOJO links | `cef90fc` (U140), `88996c9` (U145: steps and cohort for every StateFlip) | Done |
| 4 | How it is calculated (1h) | StateFlips → **chapters to flip** and **chance it works**, each formula filled in per person; Reports → **How numbers are made** | `cef90fc` (U140), `689207d` (U135) | Done |
| 5 | AKPs in our agent (3h) | StateFlips → **sleep chapter 1 AKP graph**; AI brain → **How a session is built** (`/admin/session-builder`) | `88996c9` (U145), this week's U148 commit | Partial |
| 6 | Persona system (2h) | AI brain → **Personas** (`/admin/personas`): 1,000 people, current condition in five dimensions, Wellness Identity (12 dimensions), four-function mindspace | `41455ab` (U134), `cdc5ef7` (U138), `7e6156e` (U141) | Done |

## Item by item

**1. The first 1,000 AKPs.** 1,046 AKPs: 547 goals (the 125 StateFlips and their steps) and 499 strategies and tactics, with 653 links. 637 come from your workbooks; 409 were written by us to fill gaps and are marked "drafted by us". Brand AKPs are empty until the marketing sheet arrives.
*Look at:* the drafted rows; filter by StateFlip "Bad sleep → good sleep" to see one StateFlip's blocks.
*Question:* do you already have a populated AKP database (the 2025 backend), or is "120,000 AKPs" the authoring target?

**2. Graph over time.** The sleep cohort followed chapter by chapter (still going, stopped, flipped; average score), and three lines (uplift, success, cost per flip) across Causal AI stages 1 → 3 with their top drivers.
*Look at:* where the cohort's flipped line flattens, and the Stage 1 cost per flip.
*Question:* is "over time" by chapter and by stage what you meant, or calendar weeks for a pilot cohort?

**3. Sleep in detail.** What bad and good sleep mean in four questions anyone can answer each morning, the three steps (winds down, falls asleep faster, sleeps through), and who in the 1,000 personas has it (92, of whom 90 can start).
*Look at:* the four check-in questions and the cut-offs.
*Question:* are 45 / 65 / 85 the right thresholds for X, Y and Z?

**4. How it is calculated.** Chapters to flip = your +1.43 per chapter, faster in the mood stretch and slower in the skill stretch, calibrated to your 42. Chance it works = your 54% × how often they use it × readiness × severity × fit. Every person shows the sum filled in.
*Look at:* the three worked people (mild, moderate, severe).
*Question:* are you happy for the layer speeds (1.6 / 1.05 / 0.72) to stay our assumption until the pilot measures them?

**5. AKPs in our agent.** Built: the AKPs that make up sleep chapter 1 as a graph, and your Meta → Path → Script cascade as a page: 16 steps, each with what feeds it and what exists today, plus one fully worked example of chapter 1 (10 minutes, bars and elements E01… from your BAR / ELEMENTS workbook, CFAM targets such as entropy clarity 0.7 → 0.3). Not built: an agent that actually selects AKPs and writes the script; that needs the backend.
*Look at:* the worked example on How a session is built, step by step.
*Question:* who sets AKP priority and how it is used in a build (open decision 4.6)? Our default: goal AKPs choose, strategy AKPs ranked by fit to the step's layer.

**6. Persona system.** 1,000 synthetic people from cited age and country distributions, each with a life scenario, a condition score in five dimensions, risk flags, Wellness Identity and a mindspace per function. They drive the buyer agents, the cohorts and the cost model.
*Look at:* one persona's identity card and its condition.
*Question:* do the 12 identity dimensions match your Grand list, or should any be renamed?

## Also new this week

- **Therapeutic funnel** (`/admin/therapeutic-funnel`): per StateFlip, has the problem → starts → chapter 1 → X → Y → Z → stays good, with drop-offs, reasons and levers. Sleep: of 92 with the problem, about 44 are expected to flip.
- **Assumptions ledger and claims policy** (Wiki → B2B2C → Assumptions and claims): every load-bearing number with its source and status, and the words we use and avoid so Aurelia stays a wellness product.

## What we need from you

1. The AKP database question (item 1).
2. X / Y / Z thresholds (item 3).
3. AKP priority in a build (item 5).
4. Sign the one-sentence wellness purpose on the claims page.
