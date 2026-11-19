# Aurelia — what an AI working here should know

**Covers up to J133** · updated 19 Nov 2026

The working knowledge of the agent that has run this project, written so any
other AI (or developer) can pick it up and act the same way. It is the short,
current version. History and detail live elsewhere:

- `docs/HANDOFF.md`: the full handover, including §17, every request (J) and change (U).
- `docs/WORK-JOURNAL.md`: what was asked and answered; the Open items table (O1–O39).
- `docs/UPDATE-LOG.md`: every code change, with how to revert it.
- `CLAUDE.md`: engineering conventions.

**Rule (owner, J129):** every request adds what was learned to this file, in the
same push. Rewrite stale lines rather than appending contradictions, and move
"Covers up to" to the latest J. `src/guides/records.test.ts` fails the check
when this file is behind the journal.

---

## 1 · The product in one paragraph

Aurelia turns one sentence about how someone feels into a personal guided
wellness session: voice, sound, visuals and script, made by AI and delivered as
chapters with a daily check-in. Today it is a **frontend only**: React web app
(reference) plus a Flutter app, with realistic **sample data** and no backend,
no real AI, and no persisted sign-in. The admin CMS lives in the same app at
`/admin` and has **no authentication** (P0). The team wiki lives at `/wiki`.

## 2 · People and how to work with them

- **The session owner** (Werner) writes in **Indonesian**; reply in Indonesian.
  Deliverables for others (reports, wiki pages, messages to Eugene) are in **English**.
- **Eugene** is the lead or founder. His briefs arrive as WhatsApp screenshots;
  read them as the request. He thinks in big systems ("an AI that builds the
  AI"), so turn that into concrete, phased steps.
- **Posture:** head of product and head of engineering.
  - Say what is missing, give an opinion when asked "bagaimana menurutmu", and propose phases.
  - When an ask is vague, pick the most reasonable reading, act, and state the assumption.
- **The owner reads the result, not the process.** Answer in short sections,
  with tables where they help. End with the decisions that are still theirs.

## 3 · Release rules (the ones that bite)

- **Branches.** `web_app` is staging, where everything lands first. `admin_cms` is always
  `--ff-only` identical to `web_app`. `web_prod` is production.
- **Production moves only on an explicit request** ("naikkan ke prod", "stag dan
  prod"). A screenshot taken from production is not a request. The environment's
  safety check refuses a `web_prod` push the request did not ask for (J118).
- **J076:** the wiki must be identical on both sites, so documents changes do
  go to production. New app work therefore sits behind `RELEASES` in
  `src/versions/releases.ts`, set to `BUILD.environment !== 'production'`.
- **Flags that are currently staging only:**

  | Flag | Feature |
  | --- | --- |
  | `journeyTags` | Tags, review and coverage in the user journey |
  | `sidebarRail` | The desktop icon rail, the default since U093 |
  | `personas` | The personas module |
  | `buyerAgent` | Buyer agent results |

- **Shipped but not flagged:** the reworked user journey (U092, U095) and the
  "Product lab" sidebar name (U096). They reach production with the next push there.
- **Mobile below `lg` is frozen** unless the owner asks for a mobile change.
  Desktop-only changes go through a prop or `lg:` classes, and are checked at 402px.

## 4 · Recording, every request

Every request, code or not, gets all of these in the same push:

| What | Where |
| --- | --- |
| A J-entry | `WORK-JOURNAL.md` |
| A copy of the J row | `HANDOFF.md` §17 |
| An update to this file | `AI-KNOWLEDGE.md` |

A code change also gets:

| What | Where |
| --- | --- |
| A U-entry | `UPDATE-LOG.md` (index row + entry) |
| A patch | `docs/update-log/patches/U###-<sha>.patch` |
| An entry | `CHANGE-LOG.md` (inside the fenced block under "Entry format", newest first) |
| A copy of the U row | `HANDOFF.md` §17 |

Further rules:
- Decisions waiting on someone go into **Open items**.
- **No secrets anywhere**: not the site passwords, not tokens.
- Commits end with the session's attribution trailer. Never put a model name in commits or docs.
- `src/guides/records.test.ts` enforces the §17 ledger and this file's "Covers up to".

## 5 · What exists now (state on 18 Nov 2026)

**Consumer app**
- Design versions v1–v5. Production shows three of its own: prod v1 = staging v3,
  v2 = v4, v3 = v5 (the default).
- Desktop sidebar (staging): starts as a 72px icon rail and expands to 232px.
  Every icon is 20px; rail tiles are 56px. The phone drawer is unchanged.

**Wiki (`/wiki`, was `/guide`; old links redirect).** Tabs:
- Feedback group playbook (v1–v3)
- Admin guideline (v1–v3)
- Product requirements
- API contract (rewritten as a team document in U086)
- Research (Insight Timer; v2 round 2 is the default, v1 round 1)
- Backend (old)
- Artefact
- Design system

**Admin.** The sidebar groups fold.

**Admin → Product lab**
- **User journey.** 4 stages, 10 moments, 3 screens.
  - Tabs on staging: Map, Tags & review, Coverage, Tag setup.
  - One side panel per moment.
  - Screens link to the moments they serve.
  - Edits are saved per browser; Export/Import is the way to share them.
- **Personas** (staging).
  - 300 seeded synthetic personas.
  - Each has a role-play prompt.
  - Panels are balanced by goal and can be exported.
- **Buyer agent results** (staging). One demo run on ten personas.

**Knowledge-base export.** `scripts/knowledge/export.py` writes the wiki as Markdown for
`danielaurelia26/aureliabase_knowledge`. Push it only on request. This session cannot
reach that repository yet (O33).

## 6 · Positions taken (and why), newest first

**User journey (J122–J127).** An internal opportunity map: moment → feature →
evidence → decision. It is not a user feature.
- Eugene confirmed it: driven by the product team, it should evolve like
  Trello or Asana, and be data Claude can reason over.
- The blocker is per-browser storage.
- Phases were proposed in O36 and put on hold by the owner.

**Personas (J128, J131).** Good for forming hypotheses before real research, never as evidence. Since U099 each is a full profile (bio, weekday, sleep, stressors, coping, Big Five, tech, decision style, deal breakers, success, quotes). Coherence rules live in `personas.ts` and its test. Since U100 each also has `profile.testing`: jobs, pain, first sentence, spend, alternatives, buy triggers, objections, access, connectivity, and three When/Does/Expect scenarios. Every prompt states that the persona is synthetic.

**Buyer test agent (J132, O38).** Eugene's idea. It reads a persona panel export plus a stimulus and answers per persona in a fixed schema: try, pay, price thresholds, objection, what flips it, confidence. Use it to compare A vs B, never as absolute conversion, and validate the winner with real people. First step proposed: an export pack plus a results import, before any backend.

**Buyer agent results (J133, U101).** Admin → Product lab → Buyer agent results. Runs live as data in `src/admin/data/buyerRuns.ts` (schema, instructions, findings). A test pins each run to the panel its seed draws, so a change to the persona generator that reshuffles the panel fails the check: then re-run, or pin the run to its ids. The demo (ten personas, $9.99 Plus) gave 8/10 try, 1 pay + 4 maybe, a fair band of $3–6, and found three incoherent personas (O39). To add a run: play the panel with `BUYER_INSTRUCTIONS`, append a `BuyerRun`.

**The 2025 backend documents (J099, J109–J112).**
- They contain **no code**: they hold prompts, Pydantic shapes, a rubric and principles.
- What is reusable:
  - the script prompt's modality rules;
  - entity tags on script elements;
  - the attribution prompt (`utility_index` −1…1);
  - the LLM-as-judge rubric;
  - seven edit modes;
  - pause markup;
  - media prompts.
- What is not:
  - the word table: about 310 words a minute is reading pace;
  - the "expert" persona;
  - model scores treated as truth;
  - the Deep Dive figures.
- A 2025 Python codebase exists somewhere; asking for it is O31.

**Insight Timer, round 2 (J130).** The report is the wiki Research tab, v2.
- **Usage:** three jobs (sleep, getting through a crisis, the plain timer). People choose by voice, pacing and how much the guide talks.
- **Retention:** people stay for their history and leave over anything between open and play. Onboarding is about 25 steps, with the paywall before sign-up. The category baseline is 3–5% at day 30.
- **Adopt now:**
  - the sentence goes straight to play;
  - the check-in after the chapter, once a day, skippable;
  - a low check-in gets care and a "Need help now?" link;
  - guidance controls (less talking, longer pauses, skip the intro, end with a bell);
  - "Same as last night";
  - forgiving consistency ("4 of 7");
  - one reminder;
  - a fair-paywall rule.
- **Avoid:** the quiz, an early paywall, streak alarms, invented co-presence numbers, live events and a teacher marketplace.
- **Known own-goal:** the demo opens the daily check-in on every sign-in (`src/lib/dailyCheckIn.ts`). Change it before real users (O37).

**Aurelia Pro (J110, O32).** A corporate wellness edition (B2B2C), to be explored
with employee and HR personas. Not built.

## 7 · Traps this agent hit (so you do not)

- **Tailwind v4.**
  - A component's baked-in `w-full` beats a caller's `w-auto`; use `w-auto!`.
  - The radius scale is closed (`rounded-10` renders square).
  - `--spacing: 1px`.
- **`versions.css` hides every `[aria-label='Open menu']` in v4/v5.** It once hid the
  admin's menu button on phones. Give admin controls their own labels.
- **oxlint.**
  - Passing a function that reads a ref, during render, fails `react(refs)`.
  - Exporting a constant from a component file fails `only-export-components`. Put data in `src/admin/data/`.
- **Saving the user journey writes two keys**: the map and the tags.
  Moving a moment keeps its tags and its screen links.
- **"I can't see it" is usually one of three things:**
  - a cached build: check the badge's commit, then tap Reload on the update toast;
  - production rather than staging;
  - a feature that is staging-only by design.
- **Playwright.**
  - `goto` reloads and loses sign-in; navigate with pushState.
  - Scope selectors to the dialog: `getByLabel('Stage')` matches many elements.
- **Agent worktrees** live in `.claude/worktrees/`. They are excluded locally
  through `.git/info/exclude`; never commit them. Bring an agent's work in by
  cherry-picking, then re-run `npm run check`.
- **Admin selects:** one style in `admin.css` (`.adm-root select`: no native appearance, 32px right padding, an SVG chevron). Do not add per-page select padding.
- **Admin dark mode and native controls:** without `color-scheme`, a select's option list stays light. `.adm-root` (shell, Modal, SidePanel) handles it. Any new admin portal must carry `adm-root`.
- **Mermaid creates ~100 chunks.** It is grouped into `mermaid-vendor` (vite `codeSplitting.groups`) and kept out of the precache. Without that, the service worker grew from 181 to 268 entries.
- **Mulish ships weights 300–600 only.** 700 and 800 render as faked bold.

## 8 · Verifying, the short recipe

1. `npm run check`, which runs typecheck, oxlint (`--deny-warnings`) and vitest.
2. Build. Staging: `VERCEL_ENV=preview VERCEL_GIT_COMMIT_REF=web_app`. Production: `VERCEL_ENV=production VERCEL_GIT_COMMIT_REF=web_prod`. Use `npx vite build --outDir <tmp>`.
3. Serve the build with `npx vite preview --outDir <tmp> --port N`.
4. Drive it with Playwright (`/opt/pw-browsers/chromium`), with the site unlocked through localStorage (key `aurelia.site.unlocked`; the value is the site password, which lives only in `src/demo/siteLock.ts`).
5. Check 1440px and 402px, no overflow and no console errors, and look at a screenshot once.
