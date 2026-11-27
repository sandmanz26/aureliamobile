# Admin UX audit: workflow, UI, UX, and a "modern, tidy, clean" direction

Date: 2026-11-27 · Branch: `web_app` (preview build, staging env, design v1) · Author: head of design / UX lead pass (AI)
Scope: `/admin` (34 routes) and `/wiki` as the admin's companion. No code changed.

Evidence: screenshots in `/tmp/claude-0/-home-user-aureliamobile/92e8d9f8-4c35-5451-b5fe-5fd68304e711/scratchpad/audit/`
(`d-<name>.png` at 1440x900, `m-<name>.png` at 402x874, `info.json` = page height and word count per route).
Scratchpad is temporary: re-run `scratchpad/shoot.mjs` against a preview build to regenerate.

## 0. Measurements (from `info.json`)

| Route | Page height @1440 | Words | Screens tall |
|---|---|---|---|
| `/admin` Dashboard | 1,078 | 238 | 1.2 |
| `/admin/reports` Overview | 1,508 | 640 | 1.7 |
| `/admin/reports/ux-feedback` | 2,358 | 812 | 2.6 |
| `/admin/reports/cost` | 1,959 | 880 | 2.2 |
| `/admin/reports/buyer-agent` | 4,257 | 1,810 | 4.7 |
| `/admin/reports/metrics` | 5,279 | 2,102 | 5.9 |
| `/admin/reports/b2b2c` | 5,651 | 2,212 | 6.3 |
| `/admin/buyer-agent` (off menu) | 6,379 | 2,681 | 7.1 |
| `/admin/personas` | 5,387 | 1,897 | 6.0 |
| `/admin/user-journey` | 3,169 | 834 | 3.5 |
| `/wiki/admin` | 18,755 | 3,929 | 20.8 |
| `/wiki/design-system` | 29,441 | 4,894 | 32.7 |
| Operational modules (Users, Sessions, Coins, Audit, Settings...) | 900-1,300 | 170-430 | ~1-1.4 |

Pattern: the operational modules (built first, from a generic CMS template) are short and tidy; the
thinking modules (Reports, Product lab) that the owners actually use daily are 2-7 screens of prose.
No horizontal overflow at 402 on any sampled route (`scrollWidth` = 402).

---

## 1. Workflow and information architecture

### What the owners actually do (from `docs/AI-KNOWLEDGE.md`, J194-J199)
The business owner and product owner think in: the **AI brain** (5 functions: Wellness, Product,
Business, Brand, Analysis), **StateFlips** (the product: bad-to-good state changes, 125 to start),
**reports** that answer one decision each, and **research** (wiki B2B2C, personas, buyer agent).
Their loop is: sources -> reports/tests -> decisions -> new version (the Reports overview says this itself,
`d-reports.png`).

### What the sidebar shows (`src/admin/AdminLayout.tsx` NAV, lines 40-141)
Overview · People (3) · Product lab (5) · Reports (7) · Content (3) · Intelligence (2) · Revenue (4) ·
Growth (2) · Platform (5, incl. Wiki). 9 groups, 32 items.

### Findings
1. **The sidebar is organised like a generic SaaS CMS, not like the owners' mental model.**
   Six of nine groups (People, Content, Intelligence, Revenue, Growth, Platform) are mock CRUD modules for
   a backend that does not exist (users, payments, coins, moderation, notifications). The two groups the
   owners use (Product lab, Reports) sit between them with equal weight. Nothing in the nav says
   "AI brain", "StateFlips" or "Research". Evidence: `d-dashboard.png` sidebar.
2. **"Where do I start" is unanswered.** `/admin` Dashboard (`d-dashboard.png`) shows platform health
   (users 68, AI spend $8,911, open reports 19 = moderation reports, not the Reports module) - figures for
   a live operation that does not exist. The real starting point - the decisions waiting on the owners -
   lives on `/admin/reports` and in each report's "What to do next". Naming collision: "Open reports" on
   the dashboard (moderation) vs "Reports" (decision reports).
3. **Duplicates and near-duplicates.**
   - `/admin/buyer-agent` (Buyer agent results, 7.1 screens, off menu since U123) vs
     `/admin/reports/buyer-agent` (4.7 screens). Two pages on one study.
   - Feedback group v1 / v2 (`ExperimentationPage.tsx`, `ExperimentationV2Page.tsx`) vs UX feedback report;
     v1 route redirects, v2 still in code.
   - Therapeutic map vs Healing Map (`pages/lab/`): both map states to building blocks; the healing map
     is the newer, learning version. Users must guess which is current.
   - "Experiments" (Growth) vs "Feedback group" vs "Product lab": three words for testing.
   - Report metrics (Reports) is a meta page about trusting reports, not a report.
4. **Product lab vs Reports vs Wiki do not connect as a flow.** Reports link into each other via
   side panels, but Product lab pages (personas, journey, funnel, maps) do not say which report consumes
   them, and the wiki is the last item under "Platform" next to Audit log. The wiki's Research/B2B2C
   documents are the source of the B2B2C report but live in another shell with another sidebar.
5. **Naming.** Mixed case ("Healing Map" vs "Therapeutic map"); "Report" suffix repeated 6 times inside
   a group already called Reports; "Intelligence" holds AI monitoring + Cockpit rules (both really
   "AI brain"); "Platform" mixes compliance, data sources, audit, settings and the wiki.
6. **Depth is fine (2 levels), but the menu is long** (32 items; search box added in U123 compensates
   for IA rather than fixing it). Counts beside collapsed groups (3, 5, 7...) are noise.

### Proposed IA (same routes, new grouping and labels; mock modules demoted, not deleted)
```
Today                (new home: decisions waiting, last changes, what's real vs sample)
AI brain             Wellness · Product · Business · Brand · Analysis   (placeholders until J199 lands)
  StateFlips         (library + healing map: the product itself)
Decisions            Overview · Buyer · UX feedback · Journey (Combination) · Cost · Channels (B2B2C)
Research             Personas · User journey · Business funnel · Wiki research ↗
Operations  (folded, labelled "Sample data")  People · Content · Revenue · Growth · AI monitoring · Platform
Wiki ↗  · Trust (Report metrics) in the footer of Decisions
```
- Merge Therapeutic map into Healing Map (keep route, redirect).
- Retire `/admin/buyer-agent` into the report's evidence tab; drop Feedback group v2 from the codebase.
- Move the platform-health dashboard to Operations → Overview.

---

## 2. UI

Component inventory: `src/admin/components/ui.tsx` exports `Badge`, `StatusBadge`, `StatCard`, `Panel`,
`PageHeader`, `Button`, `FormField`, `Legend`. Beside them: `Drawer.tsx`, `SidePanel.tsx`, `Modal.tsx`,
`DataTable.tsx`, `Charts.tsx`, `GuideTour.tsx`, and in reports a second kit: `ReportParts.tsx`,
`ReportSummary.tsx`, `DetailDrawer.tsx`, `SummaryCharts.tsx`, `reportColors.ts`.

### Findings
1. **Two design languages.** Ops modules use `StatCard` with UPPERCASE tracked labels
   (`d-dashboard.png`); reports and lab use sentence-case labels with a pill tag (`d-r-ux.png`,
   `d-personas.png`). The UX feedback report shows both on one page (summary tiles sentence case, the
   "Milestones" tab tiles UPPERCASE). 
2. **Three drawer implementations** (`Drawer.tsx`, `SidePanel.tsx`, `reports/DetailDrawer.tsx`) plus
   `Modal.tsx` and `GuideTour.tsx` overlay (`d-user-journey.png` opens with a 9-step tour over the page).
3. **Type scale is ad hoc.** Counts in `src/admin`: `text-12` x376, `text-11` x238, `text-13` x156,
   `text-10` x26, then 15/14/24/19/18/16. 11px and 10px are the workhorses - too small for a reading
   surface and outside the Figma scale's intent. Headline values swing from 22px (`StatCard`) to ~26px
   wrapping paragraphs used as "values" (`d-r-b2b2c.png`: "Top 3 features" tile renders a 7-line
   sentence at stat size; "Second half, second iteration" in `d-r-ux.png`).
4. **Card-in-card nesting.** Report summary = bordered panel > GOAL callout > bordered tiles > bordered
   list > bordered evidence table (`d-r-b2b2c.png`, `d-r-ux.png`). Four border levels on one screen
   read as clutter; every element is a box.
5. **Colour.** Chart blue `#2a6fdb`-ish and orange (personas pyramid) and traffic-light green/amber/red
   (wellness bar) are not Aurelia tokens; the brand gold appears only in the Staging chip. Badge tones
   (Estimate peach, Assumption pink, Simulated blue, Measured green, Sample grey) are five hues for one
   concept (confidence). The espresso sidebar is strong and on-brand; the content area is neutral
   grey-white with no brand accent, so the two halves feel like different products.
6. **Header stack wastes the fold.** Staging bar (28px) + "Environment: Staging · Data is mock" bar
   (56px) + page title + description + divider = ~180px before content, and "Data is mock" is repeated
   by every report's "Not measured" / "Sample" pills.
7. **Tables and lists** (`DataTable.tsx`) are clean, but ops pages render JSON-ish action ids in mono
   (`role.permission_update` in `d-dashboard.png`) - developer language in an owner UI.
8. **Sidebar**: good contrast, good active state; but group counts, a footer that repeats the build badge
   already in the top bar, and the `/` hint chip add noise. Product lab items are not iconised so the
   nested list is a wall of same-weight text.
9. **Wiki** (`d-wiki-admin.png`) is warmer and more modern than the admin (gradient, Mulish display,
   orange accents) - the companion looks newer than the product it documents. Different sidebar width
   (280 vs 232), different active style (orange tint vs espresso fill), different search.

---

## 3. UX

1. **Summary-first is achieved on Reports, not elsewhere.** Every report opens with GOAL → question →
   one-sentence answer → 4 tiles → What to do next → How sure are we (`d-r-ux.png`, `d-r-b2b2c.png`).
   That is the right pattern. But the answer sentence is 2-3 lines of 20px text, the tiles repeat it,
   and then the page continues for 3-5 more screens. Product lab pages (Personas, Journey, Funnel) have
   no answer block at all - they open on a methodology paragraph.
2. **Text-heavy.** 1,800-2,700 words on single admin pages; `/wiki/admin` 3,929 words (21 screens).
   Descriptions under H1 run to three lines (`d-personas.png`, `d-user-journey.png`).
3. **Jargon and in-house terms** surface without definition at first use: AKP, StateFlip (absent from
   UI), "Combination report", "B2B2C", "gates", "Simulated people" (dotted-underline `Term.tsx`
   tooltips help on reports only).
4. **Interaction patterns diverge**: segmented control (Personas sets), underline tabs (UX report),
   pill filters (Healing map, Journey), checkbox filters, side panels opened by a tiny icon button
   (the `⧉` glyph on every tile in `d-reports.png`) - the click target is 14px and its meaning is unclear.
5. **Version switchers stack**: StagingBar Design v1-v5 (consumer app design versions, irrelevant on
   /admin), Personas "Set v4/v2/v1", wiki "v1 Original / v2 Task guide / v3 Quick start". Three version
   concepts on screen, only one relevant to the admin.
6. **Uninvited tours**: User journey opens a modal tour on first visit (`d-user-journey.png`), dimming
   the page the owner came to read. Prefer an inline "New here? 60-second tour" link.
7. **Loading/feedback**: lazy routes use `Suspense` with no skeleton; edits "apply in your browser for this
   visit" (wiki) but the UI gives no saved/unsaved indication on most ops pages.
8. **402 behaviour** (`m-dashboard.png`, `m-reports.png`, `m-r-ux.png`, `m-user-journey.png`,
   `m-revenue.png`, `m-wiki-admin.png`): no overflow; hamburger drawer; stat tiles go 2-up. Acceptable
   for a desktop tool. Charts compress to unreadable 9px axes; the header stack takes ~25% of the
   viewport. Admin is outside the consumer frozen-mobile rule, but keep it non-breaking.
9. **Accessibility basics**: 10-11px text in grey on white (`text-adm-muted`) is below comfortable
   reading and near the 4.5:1 limit; colour-only status in charts and wellness bars; icon-only buttons
   (side-panel glyph) need visible labels or tooltips; menu search has an aria-label (good); focus rings
   present on buttons (good).

---

## 4. Direction: "modern, tidy, clean" within Aurelia tokens

Constraints kept: Figma tokens only (`src/styles/tokens.css`, generated), Mulish for brand/display,
Source Sans 3 as the admin reading face, Lucide only, light-only, `--spacing: 1px`, closed radius scale.
The design-taste skill's overrides say `/admin` is product UI - so this is calm product design, not a
landing-page treatment.

### Principles
1. **Decision first.** Every page answers "what do I decide here?" in one line above the fold.
2. **One box per idea.** Sections are separated by space and a heading, not by borders; cards only for
   things you can click or compare.
3. **Real vs sample is one system.** One confidence badge with three states (Measured / Simulated /
   Assumed) and one page-level banner, instead of per-tile pills.
4. **Fewer words, linked depth.** Max ~60 words above the fold; long reasoning moves into a single drawer
   or the wiki.
5. **Brand in the accents.** Espresso shell, gold for focus/active and primary actions, neutral content.

### Type and spacing (px, from the Figma scale)
| Role | Face | Size / line | Weight |
|---|---|---|---|
| Page title | Mulish | 28/36 | 700 |
| Section title | Mulish | 18/24 | 700 |
| Stat value | Mulish | 28/32, tabular | 700 |
| Body | Source Sans 3 | 15/22 | 400 |
| Meta / label | Source Sans 3 | 13/18 | 500, sentence case |
| Floor | - | 12px minimum, no 10/11 | - |

Spacing: page gutter 32 (lg) / 16 (402); section gap 40; card padding 20; grid gap 16. Radius: 12 for
cards, 8 for controls, full for badges. Elevation: border `border-adm-line` only, no shadows except
drawers/popovers.

### Component system (one file each under `src/admin/components/`)
- **PageHeader**: breadcrumb (group), title, one-line purpose, right-aligned primary action + overflow.
  Absorbs the "Environment · Data is mock" bar as a single confidence chip.
- **DecisionSummary**: the report pattern generalised: question, answer (max 2 lines, 18px), 3 stat tiles,
  next steps. Used by reports AND lab pages.
- **Section**: heading + optional description + content, no border.
- **StatTile**: label (13 sentence case), value (28), delta or context (13), optional confidence badge.
  Values must be numbers or a 3-word phrase; longer text becomes a list item.
- **Card**: clickable only; whole card is the target, chevron/arrow affordance, no inner borders.
- **Table**: sticky header, 44px rows, zebra-free, right-aligned numbers, human action labels.
- **Badge**: tones mapped to tokens: neutral, positive, warning, critical, brand; `ConfidenceBadge`
  built on it.
- **Drawer**: one implementation (merge `Drawer`, `SidePanel`, `DetailDrawer`), 480px, portal-rendered,
  Esc/close, deep-linkable `?detail=`.
- **ChartFrame**: title, one-line takeaway, chart, source + confidence footer; series colours from a
  token-derived palette (espresso, gold, two neutrals, one accent) with direct labels instead of legends.
- **Tabs**: one underline tab style; segmented control only for 2-3 mutually exclusive views.

### Sidebar redesign
- Groups per the IA in §1; icons on groups only (as now), no counts, no footer build badge (top bar has it).
- "Operations (sample data)" folded by default, visually quieter (60% opacity label).
- Pinned "Today" at top; Wiki as an external-style link at the bottom with ↗.
- Same width and active style as the wiki sidebar so the two shells feel like one product
  (pick 248px, gold left rule + espresso-10 fill for active).
- Hide the consumer Design v1-v5 picker on `/admin` and `/wiki`.

### Before → after per page
| Page | Before | After |
|---|---|---|
| Dashboard `/admin` | Platform health of a mock operation (`d-dashboard.png`) | **Today**: decisions waiting (from each report's next steps), last changes, data-reality summary; old dashboard to Operations |
| Reports overview | Explainer paragraph + 6 equal cards + iteration map | One-line loop, a table of reports with status / last updated / confidence / next decision; iteration map in a drawer |
| Buyer agent report | 4.7 screens + separate 7-screen results page | DecisionSummary + tabs (Evidence, Personas, Price); results page merged |
| UX feedback report | Summary + 2 tile styles + tabs | DecisionSummary; tabs keep; milestone tiles to StatTile |
| Combination / Cost | Long sections | DecisionSummary + one ChartFrame each + detail drawer |
| B2B2C report | 6.3 screens, 7-line tile values | Answer + ranked channel table; features list; research in wiki link |
| Report metrics | 5.9 screens in Reports | "Trust" page under Decisions footer; formula table only |
| Personas | Methodology prose, 4 charts | Summary ("1,000 made-up people, 15 countries, 25 risk flags"), filters, table; charts in a Distribution tab |
| User journey | Auto tour modal + 4-column board | Inline tour link; board unchanged; DecisionSummary "biggest gap" |
| Business funnel | Long page | Funnel ChartFrame + biggest drop-off answer |
| Therapeutic / Healing map | Two maps | One Healing Map under StateFlips; legend chips as tokens |
| Ops modules | Tidy but UPPERCASE stats, mono action ids | StatTile, human labels, "Sample data" chip in header |
| Wiki `/wiki/admin` | 21 screens, different chrome | Default to v3 Quick start; shared sidebar style; "Open in admin" links per module |

---

## 5. Implementation plan

### Phase 1 - quick wins (about 8-10 h)
| Change | Files | Impact |
|---|---|---|
| Regroup and rename NAV, drop counts, Title-case consistency, hide off-IA duplicates | `src/admin/AdminLayout.tsx` | Owners find their work in 1 click |
| Hide StagingBar design picker on `/admin` and `/wiki` | `src/components/.../StagingBar`, `src/versions/versions.css` | Removes an irrelevant control |
| Merge env bar into PageHeader chip; cut header to ~110px | `AdminLayout.tsx`, `components/ui.tsx` (`PageHeader`) | +70px above the fold |
| StatCard: sentence-case labels, 12px floor, value length lint | `components/ui.tsx` | One stat style everywhere |
| Tour opens from a link, not automatically | `components/GuideTour.tsx`, `pages/UserJourneyPage.tsx` | No blocking modal |
| Label the side-panel icon ("Details") | `pages/reports/ReportParts.tsx` | Discoverability |
Behind `RELEASES` (`src/versions/releases.ts`), staging first, per CLAUDE.md.

### Phase 2 - medium (about 20-28 h)
- One `Drawer` (merge three), `Section`, `Card`, `ConfidenceBadge`, `ChartFrame` in `src/admin/components/`; migrate reports and lab (`pages/reports/*`, `pages/lab/*`, `PersonasPage.tsx`, `BusinessFunnelPage.tsx`).
- Generalise `ReportSummary.tsx` into `DecisionSummary` and add it to Personas, Journey, Funnel, Healing Map.
- Token-derived chart palette replacing raw hex in `Charts.tsx`, `SummaryCharts.tsx`, `reportColors.ts`.
- Remove card-in-card borders in report pages; type scale per §4.
- Wiki: shared sidebar style, default v3, "Open in admin" links (`src/guides/GuidePage.tsx`, `guides.css`).

### Phase 3 - large (about 30-45 h)
- **Today** page (new `pages/TodayPage.tsx`) aggregating next steps from `reports/detailItems.ts` and lab data; move Dashboard to Operations.
- **AI brain + StateFlips** section scaffolding (5 function pages, StateFlip library) once J199/J195 data shapes are agreed; Healing Map absorbs Therapeutic map.
- Merge `/admin/buyer-agent` into the report; delete Feedback group v2; redirects in `src/App.tsx`.
- Trim Buyer, B2B2C, Metrics pages to ≤2.5 screens by moving reasoning into drawers/wiki.
- Storybook stories for the new admin components (`storybook` branch), and `docs/DESIGN-SYSTEM-HISTORY.md` entry if any token use changes.

### What must stay
- Consumer mobile below `lg:` is frozen: none of this touches `src/pages`, `src/components/ui` mobile styles or `versions.css` rules below `lg`. The admin is a separate shell (`adm-root`), but re-run the 402 pass (`m-*.png`) after each phase: no horizontal scroll, drawer nav works.
- Tokens are generated: no edits to `tokens.css`; no new font, no dark mode, Lucide only, radius scale closed.
- Routes keep working (redirect, never 404); `/__demo` flags (`adminX`) keep gating modules.
- The report's summary-first structure and the honest Measured / Simulated / Assumed labelling: keep, simplify.
- Production moves only on request; new admin work behind `RELEASES`.
