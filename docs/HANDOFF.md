# Aurelia — handoff

The complete picture for whoever (human or model) picks this project up next:
the context, the people and how they work, the state of every branch and
environment, how the code is put together, how work is recorded and shipped,
how to verify it honestly, and what is still open.

> **Status:** written 1 Nov 2026 against `web_app` @ `e5c3dcf` (U057 / J058).
> Production (`web_prod`) is at `bc028a6` (U055). If the branch heads have
> moved, trust `git log` and the logs (§9) over this snapshot.

**Read order for a cold start:** §1 → §2 (and Appendix A, the complete rulebook) → §3 → §4, then `CLAUDE.md` (the
authoritative engineering conventions), then whichever later section your task
touches. §12 lists the traps that cost the most time; skim it before your
first change.

---

## Contents

1. [What Aurelia is, and who is involved](#1--what-aurelia-is-and-who-is-involved)
2. [Standing rules (non-negotiable)](#2--standing-rules-non-negotiable)
3. [Repository, branches, environments](#3--repository-branches-environments)
4. [Where things stand right now](#4--where-things-stand-right-now)
5. [Stack and architecture](#5--stack-and-architecture)
6. [Design versions (v1–v5, and production's own two)](#6--design-versions-v1v5-and-productions-own-two)
7. [Feature map by version, with files](#7--feature-map-by-version-with-files)
8. [Admin CMS](#8--admin-cms)
9. [How work is recorded (U / J / O / CHANGE-LOG / patches)](#9--how-work-is-recorded)
10. [How work is shipped (staging, production, CI, deploys)](#10--how-work-is-shipped)
11. [How to verify (recipes that work here)](#11--how-to-verify)
12. [Traps this project has actually hit](#12--traps-this-project-has-actually-hit)
13. [Research, reports and deliverables](#13--research-reports-and-deliverables)
14. [Open decisions and known gaps](#14--open-decisions-and-known-gaps)
15. [Tools and connectors available to an agent](#15--tools-and-connectors)
16. [Glossary](#16--glossary)
- [Appendix A · The rulebook: every rule of the game, with its source](#appendix-a--the-rulebook-every-rule-of-the-game-with-its-source)
- [Appendix B · Research compendium: every result](#appendix-b--research-compendium-every-result)

---

## 1 · What Aurelia is, and who is involved

**Aurelia** is a generative wellness app. A person says how they feel or what
they want ("I can't fall asleep, my mind keeps racing"). Aurelia builds a
personal audio-visual session for it (meditation, breathwork, sleep), and the
person changes it through a conversation (the "cockpit"). Sessions can be
published, played and recreated by others. A community layer (Discover,
creators, challenges) and a coin economy sit around it. A wearable or other
"signal sources" can inform the sessions.

**Everything is a front-end demo on mock data.** There is no backend: no
accounts, no real AI, no real wearable data. The plumbing (TanStack Query,
typed HTTP, storage, error reporting, three small serverless endpoints on
Upstash KV) is production-grade, so a backend can plug in. The data is
deliberately realistic and invented. Treat every figure in `src/lib/` and
`src/admin/data/` as sample data.

**Two clients.** The React web app in this repository (`web_app`) is the
**reference implementation**. The Flutter app (`mobile_app`) follows it, and
is currently far behind (§4).

### People

| Who | Role | How they show up |
| --- | --- | --- |
| **The session owner** | Runs these Claude sessions and decides day to day. Writes in **Indonesian**. Eugene addresses them as Daniel in WhatsApp. | The requests in the work journal. Often forwards Eugene's or users' feedback as screenshots. |
| **Eugene** (Eugene Werner) | Owner / stakeholder. Gives product feedback, often by WhatsApp screenshot. Asked for the work to be analysed "with AI". | Quoted in J038, J047–J048, J054 ("This header has to follow as you scroll down", the admin well-being outcomes request). |
| **Ishmeet, Olivia, Bryan** | The first three real users interviewed (late Oct 2026). Their feedback produced design v5. | J049; the v5 proposal report. |
| **Six simulated personas** | Maya, Sari, Tom, Raka, Dewi, Leo: the AI-simulated first-time users of the retention simulation. | J039, J046; the retention and owner reports. |

Use **they/them** for anyone whose pronouns have not been stated.

### How the session owner likes to work

- **Reply in Indonesian.** Deliverables for others (reports, PDFs, user
  updates) are in **English**, in plain language.
- **Act as a senior PM / product designer**, not only an engineer: interpret
  feedback, propose, recommend, and say what the recommendation rests on.
- Reports for the owner use a fixed format: before → suggestion → now →
  impact. They tag figures **Measured** vs **Predicted** and carry the label
  "AI analysis · Based on Claude self-analysis and deep research" (§13).
- They often forward a screenshot with one line of text. Read the
  screenshot carefully: the red markings are the request.
- They like a short status in chat and the detail in the logs.

---

## 2 · Standing rules (non-negotiable)

Each of these came from the owner, or from a mistake that was expensive once.

1. **Staging first; production moves only on explicit request.** Every commit
   lands on `web_app` (and `admin_cms`). `web_prod` is fast-forwarded *only*
   when the session owner asks ("naikkan ke production", "di prod juga …").
   Work being finished is not a reason. Never commit on `web_prod`. If
   `--ff-only` fails, stop and say so.
2. **`admin_cms` is byte-identical to `web_app`.** After every push to
   `web_app`, run `git checkout admin_cms && git merge --ff-only web_app &&
   git push origin admin_cms`.
3. **The mobile web layout (below `lg:`, the 402px frame) is frozen**, unless
   the user explicitly asks for a mobile change. Desktop work goes in `lg:`
   utilities. Check every desktop change at 402px.
4. **Do not dirty earlier design versions.** "Jangan sampai mengotori v2." A new
   idea goes into a new version (or the version the owner names). Prove v1–vN
   are unchanged with a pixel comparison (§11.4).
5. **Every request is logged, code or not** (§9): a J-entry for every request;
   for code, also a U-entry, a patch file and a CHANGE-LOG entry, all in the
   same push. Anything awaiting a decision goes into **Open items**.
6. **No secrets in any document or commit message.** That covers site
   passwords, pairing codes and tokens. The site passwords are given in chat
   only; they live in `src/demo/siteLock.ts` and can be overridden by
   `VITE_SITE_PASSWORD`.
7. **Never run Prettier** (no config; it would reformat the tree).
8. **Never edit `src/styles/tokens.css`.** It is generated from
   `design-tokens/figma-export.json` (`npm run build:tokens`).
9. **Commit messages** end with the attribution trailer the session provides
   (`Co-Authored-By: …` and `Claude-Session: …`). Do **not** put a model
   identifier in commits, PR text, code or docs.
10. **No pull request** unless asked. The workflow is direct pushes to the
    branches above.
11. Verify before claiming. Run `npm run check`, build, and drive the real app
    in a browser for anything visual. Report failures as failures.

---

## 3 · Repository, branches, environments

Repository: **`sandmanz26/aureliamobile`** (GitHub). One app per branch:

| Branch | What | Head (1 Nov) | Moves |
| --- | --- | --- | --- |
| `web_app` | React app: consumer client + admin CMS. **Work happens here.** Staging. | `e5c3dcf` | every change |
| `admin_cms` | Identical to `web_app` | `e5c3dcf` | ff after every `web_app` push |
| `web_prod` | Production cut of `web_app` | `bc028a6` (U055) | ff **on request only** |
| `mobile_app` | Flutter 3.x client | `2e3f202` (27 Sep) | stale, see §14 |
| `storybook` | Storybook catalogue of `src/components/` | `6e144b7` (27 Sep) | stale, see §14 |
| `claude/figma-variable-check-t6kazm` | The branch a fresh cloud session may open on: an almost empty Flutter scaffold, reverted. **Not the app.** | `ea49ba6` | — |

> **First thing in a fresh container:** `git fetch origin web_app && git
> checkout -B web_app origin/web_app && npm install`. A cloud session can
> start on the scaffold branch above, where `CLAUDE.md`, `docs/` and
> `package.json` do not exist. That looks like data loss, but it is only the
> wrong branch.

### Deployments (Vercel)

| Vercel project | Branch | What it is |
| --- | --- | --- |
| `aureliamobile` | `web_app` (Vercel "preview" = **Staging**) | staging site |
| `aureliaprod` | `web_prod` (Vercel "production") | **https://aureliaprod.vercel.app** (admin: `/admin`) |
| `storybook` | `storybook` | component catalogue |

- Deploy status is visible on GitHub as commit statuses ("Vercel –
  aureliaprod", etc.): `gh api repos/sandmanz26/aureliamobile/commits/<sha>/statuses`.
- `VERCEL_ENV` is read at build time:
  - it sets the environment label (Production / Staging / Local) in the build badge and in `/__demo`;
  - it picks the KV key scope (production uses the bare key; other deployments append the branch);
  - it decides which design version is the default (§6).
- **Both sites are behind a shared password** (`src/demo/siteLock.ts`). It
  differs between staging and production. It is a courtesy, not security: it
  is inlined into the bundle. The password values are not written here.
  `/__demo` (the flag console) sits outside the lock.
- **Environment variables:**
  - `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or the `UPSTASH_*` equivalents): Upstash, used by `/api/config`, `/api/annotations` and `/api/clicks`. Without them every endpoint reports `configured: false`.
  - `VITE_SITE_PASSWORD`: overrides the default site password.
  - `VITE_PRODUCTION_URL`, `VITE_STAGING_URL`: optional cross-links in `/__demo`.
- **CI:** `.github/workflows/ci.yml` runs typecheck, lint, test and build on
  every push to the web branches. A red run is never promoted.

---

## 4 · Where things stand right now

### Production (`web_prod` @ `bc028a6`, U055)

- **Version bar and picker are visible on production** (U054, temporary; owner
  said "nanti kita clean up"). Production offers **two versions of its own**
  (U055):
  - **prod v1 = staging v4.** This is the default every visitor sees.
  - **prod v2 = staging v5.** Opt-in, saved per browser.
- It includes everything up to U055: onboarding, first-session fixes, chapter
  check-in and reminder, four tabs, offline support, the v5 interview changes
  (behind v2) and the foundation work.

### Staging (`web_app` @ `e5c3dcf`): ahead of production by

| U | What | In prod? |
| --- | --- | --- |
| U056 | Chat composer 59 → 75px (every version); Explore/Discover header follows the scroll (every version); admin **Well-being outcomes** page and per-user panel | **No** |
| U057 | v5 "Why?" sentence fix (prod v2 still shows "your goal and “Sleep better”") | **No** |
| J052–J058 | Docs only (answers, What's New PDF) | n/a |

Promoting these is waiting on a request.

### Last things delivered (most recent first)

- **J058 / U057:** `docs/user-updates/Aurelia-Whats-New-v5.pdf`, a 4-page
  English guide for users. Eight changes, each on a v5 screenshot marked in
  orange. Users were to receive it.
- **J055–J057:** the v5 update text in English bullets, in a short version,
  and formatted for WhatsApp (single-asterisk bold).
- **J054 / U056:** the chat box, Explore header and admin outcomes (above).
- **J049 / U053:** design v5 and the v5 proposal report.

### Branches that have fallen behind

- `mobile_app` (Flutter) stopped at 27 Sep. It lacks roughly U032 onward,
  including v3–v5, onboarding, tabs and offline.
- `storybook` stopped at 27 Sep. It lacks stories for, among others,
  `TabBar`, `ChapterCheckIn`, `NextChapterCard`, `FeelingProgress`, the
  taller `ChatComposer` and the admin outcomes page.
- `CHANGE-LOG.md` and `PRD.md` are meant to be identical on every branch.
  Since late September they have only been updated on
  `web_app`/`admin_cms`/`web_prod`.

---

## 5 · Stack and architecture

Full conventions are in `CLAUDE.md`. In short:

- **React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, TanStack
  Query 5, Zod 4, Vitest + Testing Library, oxlint, vite-plugin-pwa,
  three.js** (lazy, behind a flag). Node ≥ 20.19.
- **Scripts:**
  - `npm run dev` (port 5173);
  - `npm run check` = `tsc -b` + `oxlint --deny-warnings` + `vitest run` (what CI runs);
  - `npm run build`;
  - `npm run build:tokens`.
  - Use `npm run typecheck`, not `tsc --noEmit`, which checks nothing here.
- **Tailwind v4 specifics:**
  - `--spacing: 1px`, so `p-16` = 16px.
  - The radius scale is closed (0/2/4/8/12/16/24/32/full; anything else renders square).
  - Utilities order by layer, not by string order.
  - `rotate-*` sets the CSS `rotate` property.
- **Layout of `src/`:**
  - `pages/`: one file per consumer screen.
  - `admin/`: `AdminLayout`, `pages/`, `components/` (DataTable, Charts, ui), `data/` (mock, outcomes, commerce, challenges).
  - `components/`: `chat/` (cockpit), `ui/` (shared), `wellness/` (check-in, progress), `network3d/`.
  - `layouts/AppLayout.tsx`: drawer, shell, `TabBar` in v4+, floating player.
  - `lib/`: catalogue data and pure helpers (sessions, journey, onboarding, signals, people, challenges, build, http, storage, monitoring, queryClient).
  - `chat/`: cockpit state and pure data.
  - `versions/`: design versions.
  - `demo/`: `/__demo` console, flags, annotations, click insights, site lock.
  - `api/`: typed fetchers.
  - Top-level `api/`: Vercel functions `config.ts`, `annotations.ts`, `clicks.ts`, with shared code in `api/_lib`. **Never put a non-route file directly in `api/`.**
- **Foundation rules (U048):**
  - Server state through TanStack Query.
  - HTTP through `requestJson` (timeout, abort, Zod-validated).
  - Storage through `lib/storage.ts` (`readJson`/`writeJson`/`readString`/`writeString`/`removeKey`; never throws; schema-validated).
  - Errors through `reportError`.
  - Pure data outside component files.
- **Offline (U049):**
  - The service worker precaches everything.
  - A new deploy waits for the user to tap **Reload** in the update toast. "I pushed and can't see it" is often this, or the deploy not being finished yet.
- **Routing guards:**
  - `RequireAuth`: a signed-out user who *types or reloads* a protected URL gets the **404 page** (with Sign in). In-app navigation goes to `/login`.
  - Sign-in deliberately **does not persist**, so every load starts signed out.
- **Portals:** sheets and modals must use `createPortal`, because `.u-page`
  animates with a transform (§12).

### Browser storage keys (all per browser; no accounts exist)

| Key | Holds |
| --- | --- |
| `aurelia.site.unlocked` | the site password the browser unlocked with |
| `aurelia.ui.version` | chosen design version (staging ids 1–5) |
| `aurelia.onboarding` | onboarding answers (goal, feeling, style, `wearable` in v5, `done`) |
| `aurelia.journey` | the five-chapter journey: goal, name, slug, href, `checkIns[{at,mood,note?}]`, `reminder`, `notes[]` (v5 journal) |
| `aurelia.demo.flags` | local feature-flag draft |
| `aurelia.demo.annotations`, `aurelia.demo.annotationsButton` | review pins (offline cache) and FAB position |
| `aurelia.insights.sid`, `aurelia.insights.clicks` | click-insights session id and local fallback |
| `aurelia.notifications.seen`, `aurelia.audio.muted` | small UI state |

---

## 6 · Design versions (v1–v5, and production's own two)

The project's way of shipping experiments without disturbing what works.

- **Files:**
  - `src/versions/versions.ts`: the list, the dialog text, the production mapping and `readVersion`/`storeVersion`.
  - `src/versions/useUiVersion.ts`: the hook.
  - `src/versions/StagingBar.tsx`: the 28px bar at the top, holding the picker.
  - `src/versions/VersionSwitcher.tsx`: the picker and its "what changes" dialog.
  - `src/styles/versions.css`: version-scoped CSS and the staging-bar offsets.
- **Mechanics:**
  - The chosen version is written to `<html data-ui-version="N">`; v1 has no attribute.
  - Versions are **cumulative**: code checks `useUiVersion() >= N`.
  - v2's CSS is scoped `:root[data-ui-version]` (any version above 1).
  - The v4 tab-bar CSS is scoped `:root:is([data-ui-version='4'],[data-ui-version='5'])`. **A v6 that keeps the tabs must add `'6'` there.**
- **Defaults (`DEFAULT_VERSION`):** staging opens on **v1**; production opens on
  `PRODUCTION_VERSION = 4`.
- **Production's own list (U055):**
  - `PRODUCTION_VERSIONS` in `versions.ts` maps production labels to staging ids: `{id:1, ui:4}`, `{id:2, ui:5}`.
  - Only the labels differ. `data-ui-version`, the stored value, `useUiVersion()`, click insights and pins all carry the **staging id**, so "prod v2" appears as `5` in data.
  - To offer something else on production, edit that array (the test `versions.test.ts` checks every `ui` exists and the default is offered).
  - Production pins ignore the version (`IS_PRODUCTION` in `DemoAnnotator`).
- **To add v6:**
  1. Append it to `UI_VERSIONS` with a `changes` dialog.
  2. Gate code with `useUiVersion() >= 6`.
  3. Widen the v4/v5 CSS selectors if the tabs stay.
  4. Run the pixel regression for v1–v5 (§11.4).
  5. Production gets it only on request, via `PRODUCTION_VERSIONS` and/or `PRODUCTION_VERSION`.

---

## 7 · Feature map by version, with files

### v1: the app as originally built from Figma

Consumer screens:
- Home with Ask, Quick Start, Live Sessions map and community.
- Chat/cockpit with the recommendation deck and the "+" sheet.
- Player with a details sheet, Session detail, Recreate, Explore, Sessions, Profile, Settings, Invite, Help.
- Credits/Upgrade, Notifications, Wellness (Progress) and Signal sources.
- Auth screens.

### v2 (U020+): motion, the floating player, and more

Page transitions, scroll reveals, draggable sheets, pull to refresh, the
floating mini player, the share sheet, the sheet filter, the tablet layout,
Wellness Analysis (U039–U041) and the player analysis drawer.

### v3 (U038): change summary, every build kept in the thread

The "+" sheet gets a summary, and each Apply keeps its version (v1.2, v1.3…)
in the conversation.

### v4 (U047, U050, U051): production default (= prod v1)

- **Onboarding** `/welcome` (`pages/OnboardingPage.tsx`, `lib/onboarding.ts`):
  - steps: Welcome → goal → feeling → style → editable summary;
  - Skip keeps answers;
  - Settings → Replay onboarding runs it again.
- **First-session fixes (U050, from the J039 simulation):**
  - a sentence typed on Home pre-fills onboarding and becomes the first brief;
  - every path opens the person's *own* thread;
  - the deck follows their goal;
  - the free limit counts only after the first build.
- **Journey** (`lib/journey.ts`, `components/wellness/ChapterCheckIn.tsx`, `NextChapterCard.tsx`):
  - five chapters;
  - the player asks "How do you feel now?" (1–5);
  - "Chapter 2 is ready tomorrow" with a calendar `.ics` reminder at a goal-based time;
  - signed-in Home leads with the next chapter.
- **Simplification D1–D7 (U051):**
  - four bottom tabs below `lg` (`components/ui/TabBar.tsx`): Create `/home`, Discover `/explore`, Progress `/wellness`, Me `/profile`;
  - the hamburger is hidden;
  - Library is `/sessions`;
  - coins appear only in Me, Invite and challenges;
  - Insights is folded into Session details;
  - one list of changes in the chat (the deck opens the "+" sheet).

### v5 (U053, J049): v4 + the three real interviews (= prod v2)

- **Progress in words** (`components/wellness/FeelingProgress.tsx`, `feelingSummary` in `lib/journey.ts`):
  - the person's own check-ins, with no percentages;
  - the date of the two-week report;
  - "See what's behind this" for detail;
  - the sample analysis cards are hidden;
  - `/wellness/analysis/*` redirects to `/wellness`.
- **No analytics on the player** (`PlayerPage.tsx`).
- **"Why?" on every suggested change** (`components/chat/AddSheet.tsx`, `basis` prop; `ChatPage.tsx` builds `basisLine` from goal, last check-in and wearable):
  - experiments say they are untested;
  - the experiments count is corrected in v5 only.
- **After a check-in** (`ChapterCheckIn.tsx`):
  - a wearable reading (labelled example data);
  - a journal line (`noteLastCheckIn`);
  - what the next chapter changes.
- **Wearable asked in onboarding:**
  - Apple Watch / Whoop / Oura Ring / Not now (`WEARABLES` in `lib/onboarding.ts`);
  - only that source is on (`connectionsForWearable` in `lib/signals.ts`; Whoop added as `V5_SOURCES`).
- **Journal** on Progress (`addJournalNote`).
- **Community:**
  - cards show `summary` instead of the "reduce stress by 43%" description (`SessionGridCard.tsx`);
  - tags have no "#" (`TagRow.tsx`);
  - the challenge has no podium or ranks (`ChallengeDetailPage.tsx`, "Made for this journey");
  - Publish has a privacy note (`PublishSheet.tsx`).
- **Visitor Home:** the headline "Sessions made for how you feel *today*." and no live map (`HomePage.tsx`).

### Every version (changes that were explicitly requested for all)

- **U043:** Session settings is full width below `lg`.
- **U056:** the chat composer is 75px tall (`ChatComposer.tsx`).
- **U056:** the Explore/Discover header is sticky (`ExplorePage.tsx`):
  - it is transparent at rest and frosted once content passes under it (IntersectionObserver sentinel);
  - a measured spacer keeps the hero at 92px (lg: 122px).

---

## 8 · Admin CMS

- `/admin` is under `AdminLayout` (`src/admin/`). It has 19 modules, each
  behind a flag `admin*` in `src/demo/modules.ts` and wrapped in `ModuleGuard`
  in `App.tsx`:
  - Dashboard; Users (+ detail); **Well-being outcomes**; Roles;
  - Sessions; Challenges; Moderation; AI monitoring; Cockpit rules;
  - Revenue; Pricing; Payments; Coins; Experiments; Notifications;
  - Compliance; Signal sources; Audit; Settings.
- **Experimentation → Feedback group · v1 and · v2 (U058, U060; staging only):** the 30-person, 8-week outcomes pilot. U059 hid it and U060 reopened it. v1 (`ExperimentationPage`) covers criteria, participants, measures and data quality. v2 (`ExperimentationV2Page`, `/admin/experimentation/v2`) covers Wins (clinical bands), This week (a task list) and Engagement (dose). Both are kept for review until O23 picks one. Rules are in `admin/data/study.ts`; the protocol PDF is in `docs/reviews/`. Outcome criteria are not judged before week 8. **Every admin module is described in `docs/guidelines/admin-guideline.html`.**
- **No authentication on `/admin`.** This is the P0 in `docs/PRD.md`.
- Data comes from seeded mock data (`admin/data/mock.ts`) through
  `AdminDataContext`. Edits live in memory only.
- **Well-being outcomes (U056, Eugene's request "how well have each user
  improved their well-being therapeutically"):**
  - `admin/data/outcomes.ts`: model, rules and seeded sample. `admin/pages/OutcomesPage.tsx`: the page. Plus a panel on `UserDetailPage`.
  - Proposed measure: **WHO-5** (0–100), at the start and then every two weeks.
  - **±10 points** = improved / declined; fewer than two scores = "too early".
  - A **latest score ≤ 28** is flagged "follow up" for a human.
  - Also shown: check-ins (first three vs last three) and resting heart rate where a wearable is connected.
  - Explicitly labelled self-reported, observational, not causal or clinical.
  - **The consumer app does not ask WHO-5 yet** (open item O21).

---

## 9 · How work is recorded

Four documents in `docs/`, plus patch files, updated **in the same push** as
the work.

| File | One entry per | Format notes |
| --- | --- | --- |
| `WORK-JOURNAL.md` | **every request** (questions included) | **Index** table row `\| J0NN \| date \| kind \| request \| U-ref or — \|`, then a `### J0NN — title` section appended at the **end** of the file. **Open items** table at the top (`\| O## \| … \|`). |
| `UPDATE-LOG.md` | every code change | **Index** row `\| U0NN \| \`sha\` \| date \| summary \| [patch](patches/U0NN-sha.patch) \|`, then a `### U0NN — title` section inserted **right after `## Entries`** (newest first). Fields: Commit, Patch, Request (verbatim), Interpretation, Changed, Verified, Revert. |
| `update-log/patches/U0NN-<sha>.patch` | every code change | `git format-patch -1 <code-commit> --stdout > …` |
| `CHANGE-LOG.md` | every change | Newest entry **at the top of the entries**. The entries sit inside the fenced block that starts under "## Entry format": an old quirk, so keep inserting there. Each ends with `Branches: …` saying which branches it reached. |

**Numbering as of this handoff:** last U = **U057**, last J = **J058**, last
O = **O21**. Before numbering, check the files for anything newer.

**Commit pattern used throughout:**

1. Commit the code alone (message body explains what and why), with the
   session's trailer.
2. Generate the patch from that commit. Write the U-, J- and CHANGE-LOG
   entries, referencing the code commit's short SHA.
3. Commit the docs (`Docs: U0NN log and patch, J0NN, change log`).
4. Push `web_app`, fast-forward and push `admin_cms`. Push `web_prod` only on
   request.

A docs-only request (a question, a report) gets just a J-entry; the U column
reads `—` or `docs only`.

**Journal entry style:** **Asked** (quote the request verbatim, in the
original language), **Answered/Done**, **Open items** affected. Never include
passwords.

---

## 10 · How work is shipped

```bash
# staging (every change)
npm run check && npm run build
git push origin web_app
git checkout admin_cms && git merge --ff-only web_app && git push origin admin_cms && git checkout web_app

# production (ONLY when the session owner asks)
git checkout web_prod && git pull --ff-only origin web_prod && git merge --ff-only web_app && git push origin web_prod && git checkout web_app
```

- `package.json` `version` (0.1.0) is the human-maintained release name. It
  has not been bumped and nobody asked. The short SHA is the truth.
- **Check CI** for the pushed SHA:
  `gh api "repos/sandmanz26/aureliamobile/actions/runs?head_sha=<sha>" --jq '.workflow_runs[] | [.head_branch,.conclusion]'`.
  In this environment, wait with an until-loop, not a bare `sleep`.
- **Check the deploy** via commit statuses (§3). `/__demo` on each site shows
  the commit it was built from.
- If the session owner says "I can't see it", check in this order: the deploy
  status, the commit in `/__demo`, then the Reload toast.
- When production moves, log it in the U/J entries and in CHANGE-LOG
  (`Branches: … web_prod (fast-forwarded from <old>)`), and update §4 here.

---

## 11 · How to verify

Visual claims need the real app in a browser. Recipes that work in the cloud
container:

### 11.1 Playwright

Chromium and Playwright are preinstalled. **Do not** run `playwright
install`.

```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
```

Serve a build with `npx vite preview --outDir <dir> --port <p> --strictPort`.
Build in staging or production mode explicitly:

```bash
VERCEL_ENV=preview    VERCEL_GIT_COMMIT_REF=web_app  npx vite build --outDir /tmp/…/stg
VERCEL_ENV=production VERCEL_GIT_COMMIT_REF=web_prod npx vite build --outDir /tmp/…/prod
```

### 11.2 Getting past the lock, picking a version, signing in

```js
await page.addInitScript(() => {
  localStorage.setItem('aurelia.site.unlocked', '<site password for this build>') // see src/demo/siteLock.ts
  localStorage.setItem('aurelia.ui.version', '5')
  localStorage.setItem('aurelia.demo.flags', JSON.stringify({ clickInsights: false, annotations: false }))
})
await page.goto(url + '/home')
// In-app navigation (a typed/reloaded protected URL shows the 404 by design):
const go = (u) => page.evaluate((u) => { history.pushState({ usr: null, key: Math.random().toString(36).slice(2), idx: 1 }, '', u); dispatchEvent(new PopStateEvent('popstate')) }, u)
await go('/login'); await page.getByRole('button', { name: /continue with google/i }).click()
await go('/explore')
```

To exercise the first-run flow end to end at 402×874:

1. On Home, type in **Ask Aurelia**, press Enter, then **Continue with Google**.
2. **Let's begin**. In v5, pick a wearable radio.
3. **Build my first session**.
   - The recommendation deck "Open 3 recommended changes" exists for about 2s while it builds.
   - Click it then to see the "Aurelia suggests" sheet.
4. Play the session (aria-label "Play session").
5. Drag up the sheet grabber `[data-sheet-grabber]`, tap a mood radio ("Pleasant"), and type in `#checkin-note`.

Screenshots: clip `y: 28` to drop the staging bar. Use `deviceScaleFactor: 2`
for documents.

### 11.3 Admin

`/admin/...` needs only the lock. No sign-in.

### 11.4 Proving earlier versions are unchanged (pixel regression)

1. Make a worktree of the base commit: `git worktree add <scratch>/before HEAD`.
2. Symlink `node_modules` into it and build both trees in staging mode. Serve
   them on two ports.
3. For each version, route and width (402 and 1280), screenshot both after
   disabling animations (`*{animation:none!important;transition:none!important;caret-color:transparent!important}`)
   and aborting Unsplash requests. Compare the images.
4. Earlier runs covered v2/v3/v4 × 25 routes × 2 widths (150 pairs), all
   identical.
5. Text anti-aliasing can differ when an element gets its own layer (e.g. a
   sticky header). Confirm by eye that positions and colours match.
6. Remove the worktree afterwards (`git worktree remove --force …`).

### 11.5 Reports and PDFs

- Write the HTML in `docs/reviews/` (owner-facing) or `docs/user-updates/`
  (user-facing), with images in a sibling folder.
- Render with Playwright `page.pdf({ format: 'A4', printBackground: true, … })`
  after injecting the local font
  (`@font-face{font-family:'Mulish';src:url('file:///…/public/fonts/mulish-variable.woff2')}`)
  and awaiting `document.fonts.ready`. Google Fonts is blocked in the
  container.
- Preview pages with `python3 -c "import pymupdf …"` (`pdftoppm` is not
  installed).
- Marking screenshots: record each element's `boundingBox()` at capture time
  (subtract the 28px clip; ×2 for the scale). Draw orange
  (`#E8770F`) rounded boxes with numbered badges using PIL. Never guess
  coordinates.
- Owner reports are also published as **private** claude.ai artifacts (the
  Artifact tool; images through its `files` map). Send PDFs with the send-file
  tool (`display: render`); the session owner once could not download one
  otherwise.

---

## 12 · Traps this project has actually hit

- **Wrong branch in a fresh container:** it looks like the repo is empty (§3).
- **`versions.css` moves every `.lg:top-0` under the staging bar** (meant for
  sticky sidebars). For an absolutely positioned layer that must sit at 0 on
  `lg`, use `lg:top-[0px]` (U056).
- **A sticky element only sticks inside its parent.** Wrapped in a short band,
  it scrolls away. Paint the band behind instead (U056, ExplorePage).
- **The menu button is hidden on `lg` and in v4+**, so header heights differ
  by version. Don't hard-code spacers; measure (U056).
- **`.u-tap` sets `position: relative` in a later layer** and beats
  `absolute` on the same element. Put positioning on a wrapper.
- **`.u-page` has a transform**, so `position: fixed` inside a page is
  relative to the page. Overlays must use `createPortal`.
- **Grid and flex children need `min-w-0`** or wide content overflows.
- **One rule per gap:** a gap set by both a parent `pb-*` and a child `mt-*`
  produces numbers that appear nowhere in the source.
- **The radius scale is closed.** `rounded-10` renders square, silently.
- **Rules of hooks:** hoist `useUiVersion()` to the top of the component
  (`const v5 = useUiVersion() >= 5`). Never call it inside a condition.
- **Typecheck with `npm run typecheck`** (`tsc -b`).
- **`vercel.json` accepts no comments**; it failed a build once.
- **Shared admin `BarChart`:** negative values used to draw a full bar. Now
  clamped (U056).
- **String joins in UI copy:** a "replace the last comma with *and*" trick
  matched a comma inside a quoted label (U057). Join arrays instead.
- **Click insights and pins store staging version ids**, even on production.
- **Shell in this environment:**
  - `pkill -f <pattern>` can kill the calling shell when the pattern matches its own command line.
  - `rm -rf $VAR/*` is blocked by a safety check; use a literal path or `"${VAR:?}"`.
  - A bare `sleep` is blocked; use an until-loop.
- **Unsplash covers fail offline.** Flat gradients mean no network, not a bug.
- **Simulated vs real research:** the six-persona simulation was wrong about
  two things the real users corrected: scores do not motivate everyone, and
  wearables are wanted with consent. Weight real interviews above the model.

---

## 13 · Research, reports and deliverables

All in the repository unless noted.

| Date | Document | What it is |
| --- | --- | --- |
| 18 Oct | `docs/reviews/Aurelia-Logic-Review-2026-10-18.pdf` | Product logic review; 15 decisions with defaults (O1) |
| 25 Oct | `docs/reviews/Aurelia-Simplification-Plan-2026-10-25.pdf` | J038: audit plus D1–D7 (built in U051) |
| 25 Oct | `docs/reviews/Aurelia-Retention-Simulation-2026-10-25.pdf` | J039: six simulated personas on v4, questionnaire, D1/D7/D30 model |
| 27 Oct | `docs/reviews/Aurelia-Owner-Report-2026-10-27.pdf` (+ HTML, 14 images) | J047–J048: before / suggestion / now / impact; labelled AI analysis. Private artifact: https://claude.ai/artifact/VTjHzkzYfBXnGbZFKcDTJ5 |
| 27 Oct | `docs/reviews/Aurelia-v5-Proposal-2026-10-27.pdf` (+ HTML, 16 images) | J049: interviews vs simulation, v4 → v5 pairs, predicted impact. Private artifact: https://claude.ai/artifact/PXDGCwz7BXzv5ASr67bS84 |
| 30 Oct | `docs/user-updates/Aurelia-Whats-New-v5.pdf` (+ HTML, 9 marked images) | J058: **for end users**; eight changes, how to switch to v2 |
| 11 Nov | `docs/guidelines/admin-guideline.html` (+ 25 screenshots) | J064: interactive guide to every admin module (purpose, actions, rules, permissions, environment, backend) |
| 10 Nov | `docs/reviews/Aurelia-Feedback-Group-Study-2026-11-10.pdf` (+ HTML, 6 images) | J062: protocol for the 30-person, 8-week therapeutic-outcomes pilot, and the admin Experimentation section (U058) |
| 10 Nov | `docs/api/API-CONTRACT.md` + `docs/api/openapi.yaml` | J061: **API contract plan** for production (prod v1/v2): conventions, data model, every consumer and admin endpoint, the AI system (routes, models, safety, evals), phasing and decisions |
| — | `docs/PRD.md`, `FOR-*.md`, `DESIGN-SYSTEM-HISTORY.md` | Requirements and reader-specific guides. `FOR-AI-AGENT.md` dates from 20 Sep; **this file supersedes it for current state.** |

### The retention model, in numbers (all **Predicted**, not measured)

Columns: activation, then the share of new users active on day 1, day 7 and day 30.

| State | Activation | D1 | D7 | D30 |
| --- | --- | --- | --- | --- |
| Before the work (v1/v2 era) | 45% | 12% | 3.8% | 1.5% |
| v4 as built (J046) | 54.3% | 20.8% | 8.3% | 4.1% |
| v4 recalibrated with the interviews | 54.3% | 20.7% | 8.1% | 3.9% |
| **v5** | 57.1% | 24.0% | **11.4%** (9.6–13.6) | **6.9%** (5.2–9.3) |

Largest single v5 levers at D7, in percentage points: wearable up front +0.6;
progress in words +0.6; "Why?" +0.5; next-chapter plan +0.4; journal +0.3;
landing +0.2; community without ranks +0.1.

Benchmark band used for wellness apps: D1 20–27%, D7 8–13%, D30 3–8%. The
J039 model and persona scripts are archived in
`docs/reviews/retention-sim-2026-10-25/simulation-scripts.txt`. The v5
recalibration is described in Appendix B.9. **Every research result in full is
in Appendix B.**

**What the three interviews said (J049):**
- **Confirmed:** invented numbers are distrusted; minimal input with Aurelia deciding; one list with toggles.
- **Corrected:** scores make some people anxious (a report every few weeks, detail on demand); wearables are wanted, with consent.
- **Missed by the simulation:**
  - the "why" behind suggestions;
  - no competitive challenges (stories, friends, local groups instead);
  - the landing "space" plus map read as co-working;
  - a journal;
  - voice quality;
  - the "#" on tags;
  - sharing privacy and incentive.
- They most likely tested a v2 build: they mention the sample "7% REM sleep" conversation.

---

## 14 · Open decisions and known gaps

The authoritative list is the **Open items** table at the top of
`docs/WORK-JOURNAL.md` (O1–O21). The ones most likely to come up next:

| # | Decision / gap | Notes |
| --- | --- | --- |
| **O19** | v5: make it production's default? | Built, on prod as v2 only. Real wearable data, voice choice, friends/groups, push and a share reward need a backend or assets. |
| **O20** | Clean up the production version bar | Temporary per the owner. It takes 28px for every visitor. Options: behind a flag or URL parameter, or remove once a default is chosen. |
| **O21** | Well-being outcomes | Confirm WHO-5 and when to ask it; backend; Compliance wording; who owns follow-ups at ≤ 28; prod promotion. |
| O17 / D2 | Persist sign-in | Needed before any real retention number. The journal and check-ins are per browser until then. |
| O18 | S1–S7 second simplification | Sent to users for feedback (J044). |
| O16 | D7 Figma pass | The new screens follow drafts, not a designer's pass. |
| O7 | Flutter parity | `mobile_app` is about a month behind. |
| O14 | Production hardening | Error reporting service, E2E suite, `vercel.json` blocks the microphone (`Permissions-Policy`), bundle trimming. |
| O1 | 15 product decisions | Defaults proposed in the logic review. |

### Known bugs and gaps

- `/admin` has no authentication (P0).
- v4 (and prod v1) counts goal-deck items as "experiments" in the change-sheet
  summary. It was fixed in v5 only, so v4's pixels stay as shipped.
- Production v2 still shows the pre-U057 "Why?" sentence until production is
  promoted.
- `storybook` has no stories for the components added since 27 Sep (§4).
- Real AI replies after the first message are demo text. The reminder is a
  calendar `.ics` file, not a push notification.

---

## 15 · Tools and connectors

What a Claude session in this project has had available:

- **GitHub MCP** (`mcp__github__*`) and `gh api` through the session proxy,
  scoped to `sandmanz26/aureliamobile`. Use them for CI runs, statuses and
  files on other branches.
- **Figma Console MCP** (`mcp__FigmaConsole__*`): read variables, components
  and images. It was used for the token audit and Figma checks.
- **Higgsfield** (custom connector `https://mcp.higgsfield.ai/mcp`, connected
  at J051). It is **read-only**: workspaces, models, credits, past
  generations. It cannot generate media. `*.higgsfield.ai` is blocked from
  the container network.
- **Artifact tool:** private claude.ai pages for reports (§13).
- **Network:** the container cannot reach Google Fonts or most third-party
  hosts. Use the local Mulish font file.

---

## 16 · Glossary

| Term | Meaning |
| --- | --- |
| **Cockpit** | The chat screen where a session is built and changed (`ChatPage`, `components/chat/`) |
| **Deck** | The fanned recommendation cards in the chat. In v4+ it opens the "+" sheet. |
| **"+" sheet / AddSheet** | The one list of changes; v5 adds "Why?" |
| **Chapter / journey** | v4+: the first five sessions of a goal, one per day, each followed by a check-in |
| **Check-in** | "How do you feel now?", 1–5 (Very unpleasant … Very pleasant) |
| **Signal sources** | Wearables and other data Aurelia may read (`lib/signals.ts`) |
| **Staging bar** | The 28px top bar with the build badge and version picker |
| **prod v1 / prod v2** | Production's own labels for staging v4 / v5 (U055) |
| **U / J / O** | Update-log entry (code) / work-journal entry (every request) / open item |
| **D1–D7** | Eugene's simplification decisions (J038), built in U051. In the model, D1/D7/D30 instead mean day-1/7/30 retention. Context tells which. |
| **S1–S7** | The second simplification proposal (J043), not built |
| **R1–R10** | Retention-simulation recommendations (J039) |
| **V1–V7** | v5 levers in the v5 proposal |
| **WHO-5** | The five-item WHO well-being index, 0–100. Proposed outcome measure (U056). |

---

# Appendix A · The rulebook: every rule of the game, with its source

§2 is the short version. This is the complete set: every rule that governs how
work is done here, where it came from, and why. When two rules seem to
conflict, the **session owner's explicit words in the current request win**,
then this list, then `CLAUDE.md`'s conventions, then your own judgement.
Record any such conflict in the journal.

### A.1 Working with the session owner

| # | Rule | Source |
| --- | --- | --- |
| A1.1 | Reply in **Indonesian**. Write deliverables meant for others (reports, PDFs, user updates, WhatsApp texts) in **English**, in plain language. | Session practice; J048 ("buatkan dalam bahasa inggris") |
| A1.2 | Think and answer as a **senior PM / product designer**. Flag what is missing, not only what was asked. | J011 (standing instruction) |
| A1.3 | When a request is abstract or incomplete, **do not block on questions**. Choose the most reasonable interpretation, act, and state the assumption, in the reply and in the U-entry's **Interpretation**. Ask only when the answer would change what you build and no sensible default exists. | Practice since J023; e.g. U055's prod v1/v2 mapping |
| A1.4 | Read forwarded screenshots closely. The red markings are the request, and Eugene's WhatsApp lines are the brief. | J030, J054 |
| A1.5 | Give a short status in chat and put the detail in the logs. Offer the decisions that remain as a short numbered list. | Practice |
| A1.6 | Send files with the send-file tool (`display: render` for PDFs). Also give the GitHub link to the file on `web_app`. | J040 (the PDF would not open), the owner report |
| A1.7 | "Try again" with no context after a session restart means: re-check the state and restate the result, then ask what was meant. | J033 |

### A.2 Recording everything

| # | Rule | Source |
| --- | --- | --- |
| A2.1 | **Every request gets a J-entry**, questions included. "Setiap hal kamu harus catat dalam sebuah md, tidak boleh terlewatkan." | J021, 2026-10-20 |
| A2.2 | Every code change gets a **U-entry**, a **patch file** and a **CHANGE-LOG** entry, in the same push as the code. | `CLAUDE.md` · Update log |
| A2.3 | Write down what was **answered or proposed**, not only what was done. The reasoning is what gets lost. | Journal rule 3 |
| A2.4 | Anything waiting on a decision goes into **Open items** and stays until decided. Record the decision in the entry that made it. | Journal rule 4 |
| A2.5 | **No secrets** anywhere in the repo: passwords, Figma pairing codes (they expire in 5 minutes), tokens. Log that a code was issued, never the code itself. | Journal rule 5; J016/J017/J022/J024/J045 |
| A2.6 | Log ambiguous asks with the verbatim request and the interpretation, so a single update can be reverted on its own (`git revert --no-commit <sha> && git checkout HEAD -- docs/`). | `CLAUDE.md` · Update log |
| A2.7 | A design-token change is also logged in `docs/DESIGN-SYSTEM-HISTORY.md`. | `CLAUDE.md` · tokens |
| A2.8 | Update `PRD.md` / `FOR-*.md` in the same commit when behaviour they describe changes. Update `HANDOFF.md` §4 whenever production moves or the state changes materially. | `CLAUDE.md` · other documents; this file |

### A.3 Branches and releases

| # | Rule | Source |
| --- | --- | --- |
| A3.1 | Work happens on `web_app`. **`admin_cms` is fast-forwarded to it after every push.** A divergence is a mistake. | `CLAUDE.md` |
| A3.2 | **Production (`web_prod`) moves only when the session owner asks**, by `--ff-only`. Never because work looks finished. Never commit on it. If ff fails, stop and report. | `CLAUDE.md` (standing instruction from the product owner) |
| A3.3 | Production's design version and offered versions (`PRODUCTION_VERSION`, `PRODUCTION_VERSIONS`) change only on request. | U020, U052, U054, U055 |
| A3.4 | Never promote a red CI run. Check CI for the pushed SHA after every push. | `CLAUDE.md` · Running it |
| A3.5 | `package.json` `version` is bumped only when someone names a release. The SHA is the truth. | `CLAUDE.md` |
| A3.6 | No pull requests unless asked; push directly. Commit messages end with the session's attribution trailer, and **no model identifier** goes in commits, code or docs. | Session environment rules |
| A3.7 | A new or changed shared component should get a story on `storybook` soon after it lands. That branch is currently behind (§4). | `CLAUDE.md` |
| A3.8 | The web app is the reference; Flutter follows. A change to a shared shape (type scale, 20px gutter, brand vectors) must be carried to `mobile_app`, and logged as a gap if it is not. | `CLAUDE.md`; O7 |

### A.4 Design and layout

| # | Rule | Source |
| --- | --- | --- |
| A4.1 | **The mobile layout (below `lg:`, 402px) is frozen** unless the user explicitly asks for a mobile change. Desktop work goes in `lg:` utilities and is checked at 402px. | `CLAUDE.md` (standing rule) |
| A4.2 | **New ideas go into a new design version first. Never dirty an earlier version** ("jangan sampai mengotori v2"). Change several or all versions only when the request says so (e.g. U043, U056 "untuk semua versi"). | J042; `CLAUDE.md` · Design versions |
| A4.3 | "No visible change" is proved with **pixel-identical screenshots**, before vs after, for every affected version and width. | J035, J042, J049, U056 |
| A4.4 | Figma variables are the source of truth. `tokens.css` is generated and never edited by hand. `radius/20` and `radius/48` stay raw values, with no invented tokens. | `CLAUDE.md` · tokens |
| A4.5 | Read specs from the Figma file itself (Figma bridge), not from screenshots. Where Figma contradicts itself, build the consistent version and **flag the Figma problem** to the owner. | J019, J023, J026 |
| A4.6 | Use Lucide icons, Mulish, the gold/espresso palette, Unsplash covers and light only. The `design-taste-frontend` skill's Aurelia overrides win over its upstream rules. | `CLAUDE.md` · conventions |
| A4.7 | Never run Prettier. | `CLAUDE.md` |

### A.5 Product principles that came out of the research (treat as rules)

| # | Principle | Source |
| --- | --- | --- |
| A5.1 | **Never show a person numbers that are not theirs, or that nobody measured.** No invented progress, no "+3% since yesterday" before a first listen, no numeric health claims on cards. | Logic review H2 / decision 13; J039 F4; v5 interviews |
| A5.2 | **The first session must be theirs:** it uses their words, follows their goal, opens in their own conversation, and starts with no paywall. | J039 R1–R3, U050 |
| A5.3 | **The return loop:** it heard me → a promise (Chapter 2) → a cue (reminder) → proof from their own check-ins → a next goal. | J039 §1 |
| A5.4 | **Explain, don't score.** Progress is told in words; the detail and its basis are available on demand; every suggestion can say why. | J049 / v5 |
| A5.5 | **Ask before using data.** Data sources are off for a new account; a wearable is asked for once, with what it would read. | J039 F8/R9, U050, v5 |
| A5.6 | **Community without competition:** stories and shared journeys, no rankings; say what is shared and what stays private. | J049 / v5 |
| A5.7 | **Simplify what people see, not what the product can do:** show when needed, one main path, smart defaults, features behind flags, merge similar screens. | J013, J038 |
| A5.8 | Simplification alone barely moves retention. Relevance and continuity come first. | J039 (simplification alone: D7 3.8 → 4.0%) |
| A5.9 | **Real users outrank the simulation.** Read the model's ranking, not its decimals. | J040, J049 |
| A5.10 | Mental-health adjacency: a well-being concern is **flagged for a human**, never acted on automatically by Aurelia. Outcome figures are observational, not causal or clinical. | Logic review H1; U056 |
| A5.11 | Click insights store labels and positions, **never field values**. Production tracking needs a consent decision. | `CLAUDE.md`; logic review G4; O1 #15 |

### A.6 Engineering

| # | Rule | Source |
| --- | --- | --- |
| A6.1 | Use the U048 foundation: TanStack Query for server state, `requestJson` for HTTP, `lib/storage` for storage, `reportError` for errors, pure data outside component files. | `CLAUDE.md` · foundation |
| A6.2 | `npm run check` must pass (typecheck with `tsc -b`, oxlint with `--deny-warnings`, vitest). Add tests for new pure logic. | `CLAUDE.md` |
| A6.3 | Never put a non-route file directly in `api/` (Vercel makes it an endpoint). `vercel.json` takes no comments. | `CLAUDE.md` |
| A6.4 | Sheets and modals go through `createPortal`. | `CLAUDE.md` |
| A6.5 | `/__demo` stays outside the password and **must never be linked from the app**. The site lock defaults on, and is a courtesy, not security. | `CLAUDE.md` |
| A6.6 | Sign-in deliberately does not persist (until decision D2). Don't "fix" it without the decision. | `CLAUDE.md`; J039 D2 |
| A6.7 | Behaviour that looks arbitrary usually has a reason in `docs/PRD.md`. Read it before changing it. For example, the sign-in ask lands on send, and the password-reset confirmation never reveals whether an address exists. | `CLAUDE.md` |

### A.7 Reports and deliverables

| # | Rule | Source |
| --- | --- | --- |
| A7.1 | Reports for the owner follow **before → suggestion → now → impact**, with screenshots in pairs. | J047 |
| A7.2 | Every figure is tagged **Measured** (happened on the real app) or **Predicted** (model). Ranges are stated. | J047 |
| A7.3 | AI-produced analysis carries the label **"AI analysis · Based on Claude self-analysis and deep research"** and says how Claude did it (self-analysis, simulated research, deep research, build and verify). | J048 (Eugene wanted an AI analysis) |
| A7.4 | Each research document states what it **is not** (e.g. "a simulation ranks fixes and gives an order of magnitude; a real test replaces it"). | J039, J040 |
| A7.5 | User-facing material is warm, short and English, with the changes **marked in orange on real screenshots** (boxes drawn from measured element positions). Sample data is labelled as examples. | J058 |
| A7.6 | WhatsApp texts use single-asterisk bold and plain bullets, delivered in a copyable block. | J057 |
| A7.7 | Every report has an HTML source in the repo next to its PDF, plus its images. Owner reports are also a private claude.ai artifact. | J038–J058 |

---

# Appendix B · Research compendium: every result

Everything that was researched, measured or modelled, in order. The full
documents are in `docs/reviews/` and `docs/user-updates/` (§13). This appendix
holds enough detail to act on without opening them.

## B.1 Product logic review (18 Oct, J012): 43 findings, 15 decisions

Build reviewed: `7328ab6`, design v2.
- **Method:** code reading; the app driven at 402/540/1280px; cross-checked against the PRD and FOR-PRODUCT.
- **Severity:** 6 critical, 16 high, 14 medium, 4 low, 4 fixed in U037.
- **Kinds of finding:** *Broken* (the build contradicts itself), *Missing rule* (the UI implies an undecided rule), *Contradiction* (two decisions disagree).

**The five to decide first:**
1. What the free plan limits (A1, A2): the pause never lifts, and "new sessions are free" makes it unlimited.
2. One version model (B1–B3).
3. Recreate must fork the session on screen (C1).
4. What a lineage is made of (C3, C6).
5. What wins a challenge (F2).

**All findings** (ID · title · severity/kind):

| Area | Findings |
| --- | --- |
| A · Free plan and limits | A1 "paused until" never honoured (Critical, Broken) · A2 "new session is always free" makes the limit unlimited (Critical, Contradiction) · A3 what counts as a "send" is accidental (High, Missing rule) · A4 Upgrade has no defined benefit (High, Missing rule) |
| B · Versions and publishing | B1 two version systems (High, Broken) · B2 no numbering scheme (High, Missing) · B3 Publish while building (High, Broken) · B4 live vs current undefined (Medium) · B5 any cut playable by URL (Medium) · B6 what "published on" means (Medium) · B7 unpublish consequences (Medium) |
| C · Recreate and lineage | C1 player Recreate forks the wrong session (Critical, Broken) · C2 lineage steps are names, not sessions (High) · C3 "Recreated 9.8k" has no data (High) · C4 which version a fork uses (Medium) · C5 self-recreation and credit loops (Medium) · C6 coin sharing through lineage (High) |
| D · Cockpit | D1 only one conversation exists (High, Broken) · D2 hand-offs land in whatever thread is open (High, Broken) · D3 a build only progresses while watched (Medium, Broken) · D4 recommendations ignore the request; scores add up (Medium) · D5 "arrive applied" vs free choice (Medium, Contradiction) · D6 no failure states in the core loop (High) · D7 New Session stops what is playing (Low, Contradiction) |
| E · Playback | E1 what a "play" is (Medium) · E2 floating player lifecycle (Medium) · E3 every session is the same 10-second loop (Low, known) |
| F · Coins and challenges | F1 three currencies, no rules (High) · F2 what wins a challenge (High, Contradiction) · F3 how a session enters a challenge (Medium) |
| G · Accounts, data, trust | G1 open admin and open write endpoints (Critical, known) · G2 "is this mine?" decided by display name (High, Broken) · G3 session lifetime and sign-in (High) · G4 click insights need consent (Medium) |
| H · Claims and safety | H1 no safety path in a mental-health-adjacent chat (Critical) · H2 health outcomes shown as facts (Critical) · H3 publishing has no review (High) · H4 a switched-off signal (Medium) |
| I · Process | I1 staging opens on a different app than production (Low) · I2 web and mobile drift (Low) |
| Fixed in U037 | equal-height recommendation cards · lineage See All works and counts agree · the mini player can be closed · Details show publishing state and the creator's version history |

**The 15 decisions with recommended defaults** (open item O1; none formally
accepted yet):

| # | Question | Recommended default |
| --- | --- | --- |
| 1 | What the free plan limits | Builds per account per day (e.g. 5); conversation unlimited; resets at local midnight |
| 2 | What Premium adds | More builds per day, longer sessions, all voices, analytics |
| 3 | Version numbering | v1.0 first build, +0.1 per build, per session; a fork is a new session at v1.0 |
| 4 | Live vs current | Live changes only on (Re)publish; no publishing while building; non-live cuts are creator-only |
| 5 | Unpublish consequences | Recreations stay and keep credit; links say "no longer available"; earned coins stay |
| 6 | Fork source | Always the live version; record parent and version; no automatic updates |
| 7 | Lineage membership | Every step is a real session; private or deleted steps show "Private session" with credit kept |
| 8 | Lineage payouts | 70 / 20 / 10, at most 3 generations; no payout to yourself from your own chain |
| 9 | Conversation model | One conversation per session, listed under "Latest"; hand-offs open the right one |
| 10 | What a play is | ≥ 60 s or 25% of the session; once per listener per day for rankings |
| 11 | Challenge winners | Participants: personal streak and points. Creators: a board of challenge sessions ranked by qualified plays |
| 12 | One currency | Coins only, with a written earn/spend table; rename "pts" |
| 13 | Safety and claims | Crisis policy; no numeric health claims on cards until measured; clinical and legal review |
| 14 | Identity and lifetime | User ids; a 30-day rolling session; delete account keeps lineage credit as "Former member" |
| 15 | Analytics consent | A consent notice before click insights runs on production |

**Proposed session lifecycle:** Draft → Building vX (publish disabled) →
Ready vX → Published (live = vX) ⇄ Unpublished (forks keep credit). Editing a
live session builds vX+0.1 while live stays vX; Republish moves live; revert
moves current to an older cut.

## B.2 Beta simplification thinking (J013–J015)

- **Why Eugene raised the backend (J014):** today features cost nothing
  because everything is mock. With a backend, every visible feature needs
  backend work, a decided rule and user support, and too many features blur
  beta feedback. Simplification is about **backend scope and feedback
  quality**.
- **Proposed beta (J015, O2):**
  - **Keep:** Home Ask + feeling chips, the cockpit, the player + mini player, own Sessions, auth/settings/sign-out; Upgrade only once pricing exists.
  - **Merge:**
    - the deck into "applied by default + Change";
    - Quick Start into Ask + chips;
    - Progress + Details;
    - version history into a one-step undo.
  - **Hide behind flags:**
    - Publish, Recreate + lineage;
    - coins, credits and the invite reward;
    - challenges and the leaderboard;
    - Explore shelves, other people's profiles, Live Sessions;
    - Wellness scores and claims;
    - Notifications, Session settings, the promo banner, the 3D network.
  - **Effect:** the backend shrinks to accounts, conversations, builds, audio, simple history and limits, and the open decisions go from 15 to about 6.

## B.3 Simplification plan (25 Oct, J038) → built as D1–D7 in v4 (U051)

- **Method:** 23 v4 screens at 402px. Every element was counted and marked
  keep / merge / remove. The drafts are the live app edited in the browser.
- **Findings:**
  - 7 ways to start creating on Home.
  - 9 sections on signed-in Home, including the sign-up pitch.
  - Progress appears on 6 screens under 4 names.
  - The navigation is hidden in a drawer; coins sit in about 10 headers.
  - The chat has 3 ways to pick changes from 2 lists.
  - "Settings" titles 2 different screens; there are 3 session lists.
  - Edit/delete icons appear on others' sessions (a bug).
  - Notification filters duplicate the date headings.
- **Proposal:** four tabs matching Eugene's four core features. He named them as:
  - community AI generations incl. profiles → Discover;
  - the chat that builds chapters → Create;
  - analytics → Progress;
  - the ecosystem of third-party data sources → under Progress.
  - Me holds the account.
- **Decisions and what happened:**
  - **D1** four bottom tabs;
  - **D2** hide marketing on signed-in Home;
  - **D3** Data sources under Progress;
  - **D4** coins only in Me;
  - **D5** retire Insights (redirects to Session details / Analysis);
  - **D6** one list of changes in the chat (settles O12);
  - **D7** a Figma pass.
  - D1–D6 were approved and built in v4 (U051), with v2/v3 pixel-identical (88 pairs). **D7 is still open (O16).**
- **Not to be confused** with J039's D1–D5 (B.4) or day-1/7/30 retention.

## B.4 First-time-user retention simulation (25 Oct, J039)

**The brief (Eugene):**
- Give Claude the first-time-user retention metric.
- Simulate personas with different wellness needs on the current version, with a questionnaire sequenced like a real test.
- Answer two questions: "can a user have a simple flow to solve their wellness goal?" and "why will they return to build more and reach other goals?"
- Give the probability of return for each suggestion.

**Setup:**
- Build: staging v4 at `17053fa`, 402px, driven by Playwright.
- Each persona started from a fresh, signed-out browser and came in through a **different door**: typed on Home, a feeling chip, Quick Start Play, Sign in first, Create an account, or skipping onboarding.
- Retention = came back **and played or built**, as a share of all new users.
- Benchmarks (Health & Fitness apps, vendor roundups): D1 20–27%, D7 8–13%, D30 3–8%. No meditation-specific source was found. Aurelia, as a web app without push, starts below that band.

**The questionnaire (asked in order, in role, from what was on screen):**
- **A · Screener:** need, what they tried and why they stopped, time of day, motivation 1–5.
- **B · First look:** a 5-second test on Home (what it does, first tap, clarity 1–5).
- **C · The task:** "Get help with your need." Taps and waiting time were measured; Single Ease Question 1–7; was anything asked twice?
- **D · Onboarding:** relevance; understood you 1–5.
- **E · First result:** made for you 1–5; trust in the progress screen 1–5.
- **F · Value:** the Sean Ellis question (very / somewhat / not disappointed).
- **G · Return intent:** open tomorrow 0–100; what would bring you back; use it for another goal 0–100.
- **H · Diary:** simulated day 1 / 7 / 30, current build vs fixed build.

**Personas** (panel share; profile; door; key moments; scores):

| Persona | Share | Who | Door → taps to player | What happened | Ease · Made for me · Trust · Back tomorrow |
| --- | --- | --- | --- | --- | --- |
| **Maya**, 29 · sleep, racing mind | 25% | Designer in Jakarta; quit Calm after 2 weeks | Typed on Home → 14 taps | Asked her goal again; her sentence dropped; "Increase yellow" for sleep; "+3% since yesterday" before playing | 5/7 · 3/5 · 2/5 · 45 |
| **Raka**, 35 · work stress, skeptic | 20% | Founder, Apple Watch, distrusts "frequencies" | Sign in first → 14 | Signals on without consent; demo thread with a message he never wrote; "no spiritual stuff" → 432 Hz; invented 35% chart | 3/7 · 1/5 · 1/5 · 10 |
| **Sari**, 42 · anxiety, 5 minutes | 20% | Part-time working mother | Anxious chip → 13 | Off-topic reply; "Sleep meditation v1.3"; edit limit after 1 message | 4/7 · 2/5 · 2/5 · 30 |
| **Leo**, 22 · exam focus | 15% | Student, ~30 s patience | Quick Start Play → 12, **never heard audio** | Play → sign-in wall → onboarding → sleep chat | 2/7 · 1/5 · 2/5 · 15 |
| **Dewi**, 51 · experienced meditator | 10% | 3 years on Headspace, likely to pay | Skip onboarding → 6 | Others' sessions listed as hers; body-scan request → sleep meditation; edit limit | 5/7 · 2/5 · 2/5 · 35 |
| **Tom**, 38 · burnout, therapist referral | 10% | Cautious with data, follows instructions | Create account → 15 | Answered as if he asked about focus; "mostly silence" ignored; Conversation History on | 3/7 · 2/5 · 1/5 · 20 |

Means across the six:
- clarity 3.5/5, ease 3.7/7, understood 2.0/5, made for me 1.8/5, trust 1.7/5;
- "very disappointed" 0 of 6 (the product–market-fit bar is 40%);
- back tomorrow 26/100; second goal 18/100.

**Findings:**

| # | Finding | Hit | Fix |
| --- | --- | --- | --- |
| F1 | 5 of 6 doors land in the demo conversation (fake sleep score, a user line they never wrote) | 5/6 | R2 |
| F2 | Replies and builds ignore the goal; every build is "Sleep meditation v1.3" with yellow + less movement + 432 Hz | 6/6 | R3 |
| F3 | "Edits paused" after the first message | 3/6 | R2 |
| F4 | "Great Progress! +3% since yesterday" before the first listen | all who reached the player | R5 |
| F5 | Their words are asked for twice, then dropped | 3/6 | R1 |
| F6 | Quick Start Play plays nothing | Leo | R4 |
| F7 | Nothing asks them back; Home after session one = marketing page; notifications are invented | 6/6 | R6, R7 |
| F8 | Others' things shown as theirs; Connect sources on for a new account | 3/6 | R9 |
| F9 | Sign-in and sessions do not persist, so the build cannot measure retention | all, on day 1 | P0 / D2 |

**The answers:**
- **A simple flow?** A short one, yes: 6–15 taps, under a minute of waiting.
  One that solves the goal, no: relevance and continuity fail, not the step
  count.
- **Why return?** Today nothing asks them back. The loop needed is heard me →
  promise → cue → proof → next goal (A5.3).

**Recommendations R1–R10** (effort; contribution in percentage points of all
new users as Shapley values, D1 / D7 / D30):

| R | Change | Fixes | Effort | D1 | D7 | D30 |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | One first message, in their words (onboarding pre-filled from what they typed; one Build button) | F5 | S | +1.0 | +0.4 | +0.2 |
| R2 | A fresh first thread; free limit only after the first session | F1, F3 | S | +1.8 | +0.7 | +0.4 |
| R3 | Build from the goal (reply, changes and title follow goal, length, voice, sound; respect "no …") | F2 | M | +1.9 | +0.9 | +0.4 |
| R4 | A Play that plays (preview before sign-in) | F6 | S | +0.9 | +0.3 | +0.1 |
| R5 | Honest day 0 + one-tap check-in ("How do you feel now?") | F4 | S | +1.3 | +0.8 | +0.5 |
| R6 | Chapter 2 reminder ("ready tomorrow — remind me at 22:30?") | F7 | M | +2.0 | +1.4 | +0.8 |
| R7 | Personal Home on return (tonight's chapter, what changed and why, a 5-night track) | F7 | M | +1.1 | +0.7 | +0.4 |
| R8 | Real progress from their own check-ins (and a wearable if connected) | F4 | M | +0.3 | +0.6 | +0.6 |
| R9 | Only their own things (empty states; Connect off) | F8 | S | +0.7 | +0.3 | +0.2 |
| R10 | Invite a second goal after three good chapters | — | S | +0.0 | +0.1 | +0.3 |
| | **All ten** | | | **+11.0** | **+6.2** | **+3.8** |

R6 is the strongest single fix but pays off only on top of R2, R3 and R5.
R1+R2+R3+R5+R6 alone gives D1 19%, D7 7.0%, D30 3.0%. Simplification adds
≈0.8 pt of D7 on top of the fixes and 0.2 pt without them.

**Predicted retention per persona (D1 · D7 · D30):**

| Persona | Current v4 | + 10 fixes | + fixes + simplification |
| --- | --- | --- | --- |
| Maya 25% | 18 · 6 · 2.3 | 30 · 13 · 7.1 | 32 · 14 · 7.9 |
| Raka 20% | 7 · 2 · 0.6 | 16 · 6 · 2.8 | 17 · 6 · 3.1 |
| Sari 20% | 12 · 4 · 1.3 | 22 · 9 · 4.6 | 23 · 10 · 5.2 |
| Leo 15% | 7 · 2 · 0.4 | 17 · 5 · 1.7 | 18 · 6 · 2.0 |
| Dewi 10% | 16 · 6 · 3.1 | 29 · 15 · 10.5 | 30 · 16 · 11.6 |
| Tom 10% | 12 · 4 · 1.9 | 25 · 13 · 7.9 | 26 · 14 · 8.8 |
| **Weighted** | **12 · 3.8 · 1.5** (finish 45%) | **23 · 9.9 · 5.4** (finish 56%) | **24 · 10.7 · 6.0** (finish 57%) |

**Model:**
- Per-persona stage probabilities (finish first session; D1 | finished; D7 | D1; D30 | D7):
  - Maya 60/30/32/40;
  - Raka 38/18/25/35;
  - Sari 45/26/30/38;
  - Leo 25/28/22/25;
  - Dewi 52/30/40/50;
  - Tom 45/26/36/46.
- Each fix multiplies the stages it affects.
- Combined lift = 1 + 0.45 × (product of multipliers − 1); the range uses 0.25–0.65.
- Stages are capped at 90%.
- Shapley values over all 210 orderings of the fixes.
- All scenarios assume persistence (D2).
- The scripts are archived in the repo:
  `docs/reviews/retention-sim-2026-10-25/simulation-scripts.txt`.

**Decisions proposed by J039, and their outcome:**
- **D1:** R1, R2, R3, R5, R6 first. *Done in v4, U050.*
- **D2:** persist sign-in and sessions for a test build. ***Still open.***
- **D3:** a calendar `.ics` reminder now, web push later. *Done.*
- **D4:** Quick Start plays before sign-in. *Done.*
- **D5:** the free limit counts after the first session. *Done.*

**The real test that replaces the simulation (not yet run):**
- 8–12 first-time people, two per need, who have never seen Aurelia.
- A 30-minute moderated session 1 with stages A–G, on their own phone, recorded with think-aloud.
- Then days 1–30 unmoderated, with three new events: `session_played`, `checkin_answered`, `returned`, plus an anonymous per-browser id.
- A one-question diary on days 1, 7 and 30.
- **Pass line:** D1 ≥ 25%, D7 ≥ 10%, D30 ≥ 5%, and ≥ 40% "very disappointed".

## B.5 Validity of the simulation (J040)

- **Valid:** findings F1–F9 and the tap counts. They were observed on the real
  build. How many people hit each one depends on the doors chosen.
- **Low validity:** the persona answers and the retention numbers. They were
  authored by Claude, anchored to vendor benchmarks, with ranges that are not
  confidence intervals, in a circular setup. **Use the ranking, not the
  decimals; run the real test.**

## B.6 Measured after U050 (re-run of the personas on the fixed v4)

| Persona | Before | After U050 |
| --- | --- | --- |
| Maya | 14 taps; her words lost; invented progress | **5 taps**; "Sleep better" built from her words; check-in and reminder |
| Sari | 13 taps; off-topic reply; paywall on message one | **6 taps**; "Feel calmer"; no paywall |
| Tom | 15 taps; answered as if about focus | **6 taps**; "Regulate my body" |
| Raka | Demo thread; watch and calendar "connected" | His own thread; nothing connected until he chooses |
| Dewi | Body-scan request → "Sleep meditation v1.3" | A body-scan session for her goal |
| Leo | Play → sign-in wall; never heard sound | Play plays straight away |

Headline (**Measured**):
- taps from typing to hearing 14 → 5;
- landed in someone else's conversation 5/6 → 0/6;
- first session built for the user's goal 0/6 → 5/5 (the sixth hears a preview).

## B.7 Second simplification audit (J043) → S1–S7 (open, O18)

- **Counts on v4 (21 screens):**
  - Create had 92 controls (26 cards × 3 actions + 6 chips); "Recent" showed others' sessions.
  - Discover had 149 controls, 2,613px and 7 sections (three shelves from the same catalogue, a hero next to the map).
  - Session details had 5 Recreate controls, 4 of them forking *other* sessions.
  - Progress showed a mock "Ocean Meditation · Great Progress 60%", contradicting the honest journey on Create.
  - Credits and Invite duplicate the referral block; Upgrade is a third page; Settings has "Credit Redemption".
  - Edit session's Add/Remove is a second way to change a session.
- **Proposals:**
  - **S1** Progress leads with the person's own journey (a truth issue).
  - **S2** card actions 3 → 2.
  - **S3** Discover shelves 3 → 1 with chips; drop the hero.
  - **S4** Create without category chips; Recent = own conversations.
  - **S5** Credits & plan absorbs Invite, Upgrade and Credit Redemption.
  - **S6** one Recreate on Session details; versions only on your own.
  - **S7** Edit session keeps rename + script; changes go through the chat.
- **Estimated effect:** Create 92 → ~25 controls; Discover 149 → ~70.
- **Status:** sent to users for feedback (J044). S1's intent was later
  delivered differently in v5 (progress in words).

## B.8 Production v4 re-scored against J039 (J046)

- **Status of each recommendation in v4:**
  - Done: R1, R2, R5, R7.
  - Partly done:
    - R3: the first build follows the goal; later replies are keyword rules.
    - R4: visitors only.
    - R6: a calendar file, not push.
    - R8: Progress is still demo data.
    - R9: notifications are still invented.
    - R10: a prompt after five chapters only.
- **Re-scored (weighted by how much is built), Predicted:**
  - v4 production: finish 54.3%, D1 20.8%, D7 8.3%, D30 4.1%.
  - Adding S1 alone: D7 8.8%.
- U051 came from the simplification plan, not the retention report.

## B.9 Three real user interviews (J049) → v5

- **Ishmeet:**
  - numbers about feelings would cause anxiety;
  - wants minimal input and Aurelia to decide;
  - the "#" on tags looks odd.
- **Olivia:**
  - the sample figures looked "unserious";
  - prefers a report every few weeks;
  - wants to know why a change is suggested;
  - cares about voice quality;
  - read the landing "space" and the map as co-working;
  - prefers stories to competitions;
  - shares only if it is clear what others see, and wants a reason (incentive) to share.
- **Bryan:**
  - "how is this calculated?";
  - detail on demand;
  - liked one list with toggles;
  - would keep a journal;
  - wants friends and local groups, not strangers on a leaderboard.
- **All three** wear a watch or ring and expect Aurelia to use it, with
  consent. They probably tested a v2 build (they mention the "7% REM sleep"
  sample).

**Calibration of the simulation:**
- **Confirmed:** invented numbers erode trust; little input; one list.
- **Corrected:**
  - progress scores do *not* reliably motivate, so R8's weight was halved;
  - wearables are *wanted with consent*, so the wearable lever is positive.
- **Missed:**
  - the why behind suggestions;
  - no competition (stories, friends, groups);
  - the landing page;
  - a journal;
  - voice;
  - the "#";
  - share privacy and incentive.

**v5 levers (V1–V7) and the predicted effect of each on its own** (D1 / D7 / D30 pt):

| Lever | D1 | D7 | D30 |
| --- | --- | --- | --- |
| V4 wearable asked for up front | +0.8 | +0.6 | +0.5 |
| V1 progress in words, report every two weeks | +0.3 | +0.6 | +0.6 |
| V2 a "Why?" on every suggestion | +0.9 | +0.5 | +0.2 |
| V3 Aurelia plans the next chapter | +0.4 | +0.4 | +0.3 |
| V5 journal | +0.2 | +0.3 | +0.3 |
| V7 clear landing for visitors | +0.4 | +0.2 | +0.1 |
| V6 community of stories, no contest | 0 | +0.1 | +0.1 |

**Totals, Predicted:**
- v4 recalibrated: 54.3 / 20.7 / 8.1 / 3.9%.
- **v5: 57.1 / 24.0 / 11.4 / 6.9%**. D7 range 9.6–13.6%; D30 range 5.2–9.3%.
- Same method as B.4: J039 base rates, recalibrated multipliers, damping 0.45, Shapley contributions.
- The v5 calibration script lived in a session scratch area that no longer
  exists. Re-derive it from `simulation-scripts.txt` with the changes above if
  needed.

**Measured in v5:** invented numbers a new user sees went from 5 screens
(Progress, player, analysis, cards, challenge) to 0. Suggestions that explain
themselves went from 0 to all.

**Proposed but not built** (need a backend or assets): real wearable data,
voice choice with previews, friends and local groups, a share reward, the
two-week report sent as push or email, persistence.

## B.10 Well-being outcomes proposal (U056, for Eugene)

The question: "how well has each user improved their well-being
therapeutically?"

- **Measure:** WHO-5, a five-item well-being index, 0–100, widely used in
  research and primary care. Asked at the start and every two weeks (the v5
  report rhythm).
- **Thresholds:**
  - a change of **≥10 points** is meaningful (improved / declined);
  - fewer than two scores = too early;
  - **≤28** = a cue for a human follow-up.
- Shown alongside the after-session check-ins (1–5) and the resting heart
  rate from a wearable.
- **Framed as** self-reported and observational: how people changed while
  using Aurelia, not proof Aurelia caused it, and not a diagnosis. Claims need
  Compliance wording.
- **Sample run:** 25 of 37 members measured; 13 improved (52%), 11 steady,
  1 declined; average +10.7; 2 flagged. These are sample data only.

## B.11 User-facing summary of v5 (J055–J058)

The eight messages that were sent to users:
1. Progress in words, not scores.
2. No more made-up numbers.
3. A "Why?" on every suggestion.
4. Aurelia plans the next chapter.
5. Wearable asked up front.
6. Optional journal.
7. Community without competition.
8. A clearer home page.

They are in `docs/user-updates/Aurelia-Whats-New-v5.pdf`, with the WhatsApp
text in J057.
