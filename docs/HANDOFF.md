# Aurelia — handoff

The complete picture for whoever (human or model) picks this project up next:
the context, the people and how they work, the state of every branch and
environment, how the code is put together, how work is recorded and shipped,
how to verify it honestly, and what is still open.

> **Status:** written 1 Nov 2026 against `web_app` @ `e5c3dcf` (U057 / J058).
> Production (`web_prod`) is at `bc028a6` (U055). If the branch heads have
> moved, trust `git log` and the logs (§9) over this snapshot.

**Read order for a cold start:** §1 → §2 → §3 → §4, then `CLAUDE.md` (the
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
model was built in a scratch area that no longer exists; its method is
described in the retention report.

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
