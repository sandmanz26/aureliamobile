# Assumptions ledger and claims policy

*Part of the [B2B2C research](/wiki/b2b2c). Written 28 Nov 2026 (U148, J206). Not legal advice. The regulation behind the policy is on [Claims and regulation](/wiki/b2b2c/regulation); the scale claims are on [His thesis](/wiki/b2b2c/owner-thesis).*

## In one minute

- **No number in the admin is measured on real people yet.** Every figure that drives a decision is a spec value, an assumption, or a computation on those. This page lists each one, where it comes from, and what pilot measurement would replace it.
- **Aurelia is a wellness product, and its words must keep it one.** Under the EU MDR, the UK MHRA's guidance and the US FDA's general wellness policy, it is the *intended purpose shown in claims* that makes software a medical device, not the technology. Treating, curing or preventing insomnia, anxiety or depression is a medical purpose; "helping you wind down at night" is not.
- **From 2 August 2026 the EU AI Act requires telling people they are dealing with AI and marking synthetic audio.** Every session is AI-made and voiced.
- **Internal names stay internal.** "Therapeutic funnel", "Healing map" and "medical range" are the team's working names in the admin. They must not appear in the app, on the site, in creator copy or in a partner deck.

## Status words

| Status | Meaning |
| --- | --- |
| **Spec** | From the business owner's MVP, Causal AI and Admin spec, or his deck. His target or belief. |
| **Assumption** | Chosen by us to make a model run. No source. |
| **Computed** | Worked out by our code from spec values, assumptions and synthetic personas. Only as good as its inputs. |
| **Measured** | Counted from real use or real bills. Today only the 2025 test-session costs. |

## The ledger

| # | Assumption | Value | Source | Status | What would measure it |
| --- | --- | --- | --- | --- | --- |
| 1 | Chance a journey works (flip probability, Causal AI stage 1) | 54% (74.5% stage 2, 89% stage 3) | Spec PDF; `costModel.ts` STAGES | Spec | Share of pilot journeys whose check-in score reaches 85 and stays there two chapters in a row |
| 2 | Uplift per chapter (stage 1) | +1.43 points of 100 (1.88, 2.73) | Spec PDF | Spec | Mean change in the check-in score per chapter played, in the pilot |
| 3 | Chapters to flip, 25 → 85 | 42 (32, 22) | Spec PDF; our layered curve is calibrated to give 42 | Spec | Median chapters from start to flip among people who flip |
| 4 | Our sleep cohort's chapters and chance | Median 34 chapters; average chance 49% (90 synthetic people) | `stateFlipFormulas.ts` | Computed | As 1 and 3, for real sleepers |
| 5 | Layer speeds (how fast each stretch moves against the spec's average) | Mood 1.6×, habit 1.05×, skill 0.72× | Ours, from the DOJO time scales (moods days, habits weeks, skills months) | Assumption | Score change per chapter in each stretch (below 45, 45–65, 65–85) |
| 6 | Milestones X, Y, Z | 45, 65, 85 of 100 | Ours; 85 as "good" from the check-in markers | Assumption (markers: research) | Whether people at 65 and 85 report they sleep well; adjust cut-offs |
| 7 | Who stops before the end | 60% of those it does not help | `stateFlipFormulas.ts` DROPOUT_SHARE | Assumption | Play and check-in logs: stops per chapter |
| 8 | Non-responders | Improve at half speed, stall below 64 | `stateFlipFormulas.ts` | Assumption | Score paths of people who play every chapter without flipping |
| 9 | Stays good after the flip | 80% at 12 weeks | Therapeutic funnel (U148) | Assumption | 4- and 12-week follow-up check-ins after a flip |
| 10 | Persona rules | 1,000 synthetic people; sleep need, severity, readiness, helpers, minutes a day from cited distributions; risk-flagged excluded | `personasV4.ts`, `personaConditionV4.ts` | Computed (synthetic) | The pilot's intake answers, compared field by field |
| 11 | Model prices | Per million tokens, characters or minutes, dated | Suppliers' own pages; `costModel.ts` SUPPLIERS | Research (prices); cost per chapter Computed | Real bills per chapter |
| 12 | Cost per flip | $4.98 → $2.04 → $0.58 by stage | Spec PDF | Spec | Real compute bills ÷ measured flips |
| 13 | $1 per flip floor | $1 | His deck | Spec (thesis) | As 12, at scale |
| 14 | Price per flip | $19.99 | Spec PDF | Spec | What paying pilot users pay, and refund rate |
| 15 | 120,000 AKPs | 120,000 | His chats | Spec (thesis) | An exported AKP table; our catalogue holds 1,046 drafts, 409 written by us |
| 16 | 500 billion variations | 500B | His deck | Spec (thesis) | Variations actually generated and played |
| 17 | 5 billion StateFlips a year | 500M people × 10 | His deck | Spec (thesis) | Counted flips |
| 18 | 125 StateFlips | 25 per dimension | His plan; ours from the persona issues, Deeksha needs and DOJO duals | Spec (count); steps of all but sleep drafted by us | Review by the business owner; usage per StateFlip in the pilot |
| 19 | Entropy clarity, a grounding session | 0.7 → 0.3 | BAR / ELEMENTS workbook, CFAM tab | Spec (example) | No measure defined yet; proxy: the next morning's check-in |
| 20 | Words in a 10-minute bedtime chapter | About 405 | [How a session is built](/admin/session-builder) | Assumption | Completion ratio and skips per element |
| 21 | Buyer agents' "would try", "would pay" | Per run | `buyerRun*.ts` | Computed (synthetic) | Real sign-up and payment rates |
| 22 | Week-8 completion and funnel targets | 20–50% and per stage | Business funnel; B2B2C research | Research / Assumption | Pilot funnel |

## Claims policy

**One intended purpose, used everywhere:** *Aurelia offers AI-generated audio sessions for everyday wellbeing: relaxation, winding down, sleep habits and managing everyday stress. It is not a medical device and does not diagnose, treat, cure or prevent any condition. If you are struggling, talk to a doctor or a local help line.*

### Words we use and avoid

| Avoid | Use instead | Why |
| --- | --- | --- |
| "Heal", "healing" (as a promise to a person) | "Feel better", "wind down", "build a calmer routine" | Healing implies treating a condition: a medical purpose under EU MDR / MDCG 2019-11 and the MHRA guidance |
| "Therapeutic precision", "therapy", "therapist", "therapeutic" in public copy | "Guided sessions", "personal practice" | Therapy claims make it a device; Illinois HB 1806 and Nevada AB 406 fine AI "therapy" per violation |
| "Medical foundation", "clinically proven", "evidence-based treatment" | "Built on published sleep research" (only where a citation is shown and true) | Health claims need trial-grade evidence held in advance (FTC Health Products guidance; CAP Code) |
| "Treats / cures insomnia, anxiety, depression"; "prevents burnout" | "Helps you wind down at night"; "practices for everyday stress" | Naming or preventing a condition is a medical purpose (MHRA worked examples; FDA general wellness: "sleep management" is wellness, "treats insomnia" is not) |
| "+85.7% better sleep", "stress −50%", "54% chance it works", any number from the admin | No outcome numbers until a study of this product exists | Quantified claims need substantiation; our figures are spec values or simulations |
| "For people with [a diagnosis]" | "For busy minds and restless evenings" | A diagnosed target group is a medical purpose (MHRA) |
| A session that sounds like a human wrote or reads it | "Your sessions are made by AI" and marked synthetic audio | EU AI Act Art. 50 from 2 Aug 2026; California SB 243; Utah HB 452 |
| Mood or feeling data shown to employers or creators per person | Aggregates only | Health data (GDPR art. 9); emotion inference at work is banned under the EU AI Act Art. 5 |

Creators follow the same table; their posts count as Aurelia's claims (MHRA Example 6; FTC Endorsement Guides). The full creator list is on [Claims and regulation](/wiki/b2b2c/regulation).

### Scan of our own copy (28 Nov 2026)

Words counted in `src/admin` (code and labels, tests excluded) and in the wiki's How Aurelia heals and B2B2C pages:

| Word | Admin | Wiki | Verdict |
| --- | --- | --- | --- |
| "therapeutic" | 65 | 14 | Internal metric name ("Therapeutic map", "Therapeutic funnel", "therapeutic outcomes"); the pages already say so. Keep in the admin, never public |
| "heal", "healing" | 39 | 15 | "Healing Map" and the wiki title "How Aurelia heals" are the business owner's names. Internal only; rename before anything is shared outside the team |
| "therapy", "therapist" | 34 | 55 | Mostly synthetic personas ("sees a therapist") and the regulation pages. Fine |
| "medical" | 13 | 49 | "Medical range" in the Cost report is labelled internal; the rest is regulation text. Fine |
| "insomnia" | 36 | 21 | DOJO duals ("insomnia → restful sleep") and research citations. Internal; never in app copy |
| "treat", "treatment" | 20 | 52 | Regulation text and persona help. Fine |
| "cure" | 0 in labels | 2 | Only as a word to avoid. Fine |
| "therapeutic precision", "medical foundation" | 0 | 0 | His phrases from chats; not in our copy |

No admin label was changed: each risky word is either his quoted name or already marked as internal on the page. Public surfaces (the app and the site) were not part of this scan.

## Decisions for the business owner

1. Sign the intended-purpose sentence above, or correct it.
2. Agree that "Healing Map", "How Aurelia heals" and "therapeutic" stay internal, and pick public names before any external demo.
3. Agree that no outcome number is shown to buyers until the pilot measures it.
