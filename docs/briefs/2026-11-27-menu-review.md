# Admin menu review: is every item easy to understand?

Date: 2026-11-27 · Branch: `web_app` · Author: head of design pass (AI) · U142, J203
Builds on: `docs/briefs/2026-11-27-admin-ux-audit.md` (section 1, IA; section 5, phase 1).
Shipped behind `RELEASES.adminNav2` (`src/versions/releases.ts`): staging only, production keeps today's menu.

## How it was judged

"Understandable in 5 seconds" means: someone who owns the business, seeing only the label and its group,
can say what is on the page and whether they need it today. Partly = they can guess the topic but not the
purpose or whether it is real data. No = the label names an internal term or collides with another item.

## The table (every sidebar item, 32 before + 1 placeholder)

| # | Current name (group) | What it is for, in one sentence | 5 seconds? | Duplicate of? | Proposed name | Proposed group | Action |
|---|---|---|---|---|---|---|---|
| 1 | Dashboard (Overview) | Platform health of a live operation that does not exist yet (users, AI spend, moderation queue). | Partly: reads as "the real numbers", they are sample | - | Start here | Start here | Renamed; page leads with three cards (AI brain, Reports, Research) and labels the health figures sample; "Open reports" tile renamed "Open moderation reports" |
| 2 | Users (People) | Lists of end-user accounts. | Yes, but not that it is mock | - | Users | Operations — sample data | Regrouped |
| 3 | Well-being outcomes (People) | Outcome scores per user. | Partly: sounds like the product result, is sample | - | Well-being outcomes | Operations — sample data | Regrouped |
| 4 | Roles & permissions (People) | Staff roles. | Yes | - | Roles & permissions | Operations — sample data | Regrouped |
| 5 | User journey (Product lab) | When people reach for Aurelia and which moments have no screen. | Partly: "journey" is clear, the decision is not | Overlaps Combination report (reads it) | User journey | AI brain › Product | Regrouped; Summary tab answers "which moment next" |
| 6 | Personas (Product lab) | The made-up people every AI test runs on. | Partly: not obvious they are synthetic | - | Personas | AI brain › Product | Regrouped; Summary states "made-up" and risk flags |
| 7 | Business funnel (Product lab) | How many people get from first visit to paying, and the biggest leak. | Yes | Overlaps Combination report | Business funnel | AI brain › Business | Regrouped |
| 8 | Therapeutic map (Product lab) | First map of bad state → good state with the product/business triangle. | No: in-house term, unclear which map is current | Healing Map (older version of the same idea) | Therapeutic map · older version | AI brain › Wellness | Labelled older version; both pages link to each other |
| 9 | Healing Map (Product lab) | Which session building blocks help which bad state, and how sure we are. | Partly | Therapeutic map (newer) | Healing map | AI brain › Wellness | Renamed (sentence case), regrouped |
| 10 | StateFlips (Product lab) | The product itself: turning a bad state into a good one, with chance it works. | No: in-house term with no hint | - | StateFlips (tooltip: "The product: a bad state turned into a good one") | AI brain › Wellness | Regrouped, tooltip added, first in group |
| 11 | (none) | Brand function of the AI brain. | - | - | Brand guide (coming) | AI brain › Brand | Added as a non-link placeholder marked "coming" |
| 12 | Overview (Reports) | All reports and the sources → decisions loop. | Partly: "Overview" twice in the menu | Dashboard ("Overview" group) | All reports | Reports & decisions | Renamed |
| 13 | Buyer agent report (Reports) | Would simulated buyers pay, and at what price. | Partly: "agent" is jargon | Buyer agent results (off menu, item 19) | Buyer agent | Reports & decisions | "report" suffix dropped (the group says it) |
| 14 | UX feedback report (Reports) | What the feedback group says about the app. | Yes | Feedback group v1/v2 (old routes) | UX feedback | Reports & decisions | Suffix dropped |
| 15 | Combination report (Reports) | Journey, personas and buyers read together: the one funnel step to fix. | No: "Combination" says nothing | - | Combination (tooltip explains) | Reports & decisions | Suffix dropped, tooltip; Summary tab carries "This page is for…" |
| 16 | Cost report (Reports) | What a user and a StateFlip cost to serve. | Yes | - | Cost | Reports & decisions | Suffix dropped |
| 17 | B2B2C report (Reports) | Which partner channel to test first. | Partly: acronym | Wiki B2B2C research (source) | B2B2C channels | Reports & decisions | Renamed; Research group links the source |
| 18 | Report metrics (Reports) | Where each report number comes from and how it is worked out. | No: reads like another report | - | How numbers are made | Reports & decisions | Renamed, last in group |
| 19 | (off menu) Buyer agent results `/admin/buyer-agent` | Every buyer agent run in full. | No: unreachable from the menu | Buyer agent report (item 13) | Buyer agent runs · older version | Reports & decisions | Back on the menu, labelled older version; Summary links to the report |
| 20 | Sessions (Content) | Catalogue CMS. | Yes, mock | - | Sessions | Operations — sample data | Regrouped |
| 21 | Challenges (Content) | Challenge CMS. | Yes, mock | - | Challenges | Operations — sample data | Regrouped |
| 22 | Moderation (Content) | Report queue for user content. | Yes, mock; collides with "Reports" | - | Moderation | Operations — sample data | Regrouped |
| 23 | AI monitoring (Intelligence) | Model calls, spend and errors. | Yes, mock | - | AI monitoring | Operations — sample data | Regrouped (not AI brain: it is ops telemetry, all sample) |
| 24 | Cockpit rules (Intelligence) | Rules the chat cockpit follows. | Partly | - | Cockpit rules | Operations — sample data | Regrouped |
| 25 | Revenue (Revenue) | Revenue charts. | Yes, mock | - | Revenue | Operations — sample data | Regrouped |
| 26 | Pricing (Revenue) | Plans and prices. | Yes, mock | Cost report (different question) | Pricing | Operations — sample data | Regrouped |
| 27 | Payments (Revenue) | Transactions. | Yes, mock | - | Payments | Operations — sample data | Regrouped |
| 28 | Coins & rewards (Revenue) | Coin economy. | Yes, mock | - | Coins & rewards | Operations — sample data | Regrouped |
| 29 | Experiments (Growth) | A/B tests. | No: third word for testing beside Product lab and Feedback group | - | A/B experiments | Operations — sample data | Renamed, regrouped |
| 30 | Notifications (Growth) | Push and email campaigns. | Yes, mock | - | Notifications | Operations — sample data | Regrouped |
| 31 | Compliance (Platform) | Consent, data requests. | Yes, mock | - | Compliance | Operations — sample data | Regrouped |
| 32 | Signal sources (Platform) | Wearable and data integrations. | Partly | - | Signal sources | Operations — sample data | Regrouped |
| 33 | Audit log (Platform) | Staff actions. | Yes, mock | - | Audit log | Operations — sample data | Regrouped |
| 34 | Settings (Platform) | Admin settings. | Yes | - | Settings | Operations — sample data | Regrouped |
| 35 | Wiki (Platform) | The team wiki, outside the admin shell. | Partly: hidden under Platform, leaves the shell silently | - | Team wiki ↗ | Wiki | Own group, arrow-out icon |
| 36 | (none) | The research documents behind the reports. | - | - | Research overview ↗, B2B2C research ↗ | Research | Added as links to `/wiki/research`, `/wiki/b2b2c` |

Feedback group v1/v2 stay where they were (shown only if `RELEASES.reports` is off; v1 redirects to the UX feedback report).

**Count:** 34 existing items (33 sidebar + the off-menu Buyer agent results) reviewed. **13 renamed** (items 1, 8, 9, 12-19, 29, 35), **all 34 regrouped** into 6 groups (was 9), **3 duplicate pairs flagged** and kept with an "older version" label or a cross-link
(Therapeutic map ↔ Healing map, Buyer agent results ↔ Buyer agent report, Feedback group ↔ UX feedback), **3 added** (Brand placeholder, two Research links). No route removed.

## The new groups (in order)

| Group | One line (shown under the heading, and as tooltip) | Default |
|---|---|---|
| Start here | - (single link) | - |
| AI brain | What the AI knows: wellness, product, business, brand | Open |
| Reports & decisions | One report per decision, with its sources | Open |
| Research | The desk research behind the reports (wiki) | Open |
| Operations — sample data | CMS modules for a backend that does not exist yet; every figure is made up | Folded, quieter heading |
| Wiki | - (single link, leaves the shell) | - |

Icons on top-level only (Compass, BrainCircuit, FileChartColumn, BookOpen, Server, BookMarked). No item counts.
AI brain uses small frame labels (Wellness, Product, Business, Brand) instead of a third level.

## Summary | Detail on every lab and report page

`src/admin/components/PageTabs.tsx`: two tabs, Summary default, `?tab=detail` in the URL (Back works, links
share), `role=tablist`, arrow keys / Home / End. Summary = "This page is for…", the question, the answer, up to
three figures, next steps; reports reuse their existing `SummaryBlock`. Detail = everything that was on the page.
An `#anchor` into Detail opens it.

Applied to: User journey, Personas, StateFlips, Business funnel, Therapeutic map, Healing map, Buyer agent runs,
Buyer agent, UX feedback, Combination, Cost, B2B2C, Report metrics. Reports overview left as is (it is already
the summary of the reports).

## Phase 1 quick wins in the same change

- Design-version picker hidden on `/admin` (the staging bar shows environment and build only).
- One compact 40px header: "Group › Page" trail and a single "Data is mock" chip (was a 56px environment bar).
- Stat tiles: sentence-case labels at 13px (no uppercase tracking), matching the report tiles.
- 12px text floor across the admin shell (10-11px utilities raised).
- User journey and Business funnel tours no longer open by themselves; a "Tour" button opens them.
- The 14px "open details" glyph on report and StateFlip tiles now reads "Details" beside the icon.

## Not done here (phase 2-3 in the audit)

Merging the duplicate pages, a real "Today" page, one drawer component, a token chart palette, and trimming
the long report summaries (Buyer agent's Summary is still ~570 words).
