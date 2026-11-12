"""Builds the admin guideline from the module data below.

    python3 scripts/guides/admin_guideline.py

writes two files from one source:
  docs/guidelines/admin-guideline.html     standalone page (images beside it), also published as an artifact
  src/guides/content/admin-guideline.html  the body only, rendered in the app at /guide/admin (images in public/guides/admin/)
Edit the data here, never the outputs.
"""
import html, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs/guidelines/admin-guideline.html')
FRAG = os.path.join(ROOT, 'src/guides/content/admin-guideline.html')
IMG = 'admin-guideline/'
E = html.escape

ROLES = [
    ("Super Admin", "Unrestricted access, including roles and platform settings.", "all"),
    ("Operations", "Day-to-day user and content operations. No AI config or role changes.", "users.read users.write users.suspend sessions.read sessions.write moderation.review moderation.action coins.read ai.read audit.read"),
    ("Moderator", "Reviews reported sessions and community content only.", "users.read sessions.read moderation.review moderation.action"),
    ("AI Engineer", "Owns model configuration, prompts and spend limits.", "ai.read ai.config ai.budget sessions.read audit.read"),
    ("Analyst", "Read-only across the platform for reporting.", "users.read sessions.read ai.read coins.read audit.read"),
]
PERMS = [
    ("Users", [("users.read", "View users"), ("users.write", "Edit users"), ("users.suspend", "Suspend / ban users")]),
    ("Content", [("sessions.read", "View sessions"), ("sessions.write", "Edit / unpublish sessions"), ("moderation.review", "Review reports"), ("moderation.action", "Take down content")]),
    ("AI", [("ai.read", "View AI monitoring"), ("ai.config", "Change model / prompt config"), ("ai.budget", "Set spend limits")]),
    ("Economy", [("coins.read", "View coin ledger"), ("coins.adjust", "Grant / revoke coins")]),
    ("Platform", [("roles.manage", "Manage roles"), ("audit.read", "View audit log"), ("settings.write", "Change app settings")]),
]

# (group, id, title, route, prod, staging, perms, purpose, see[], do[], rules[], api, shots[(file, caption)])
M = [
 ("Overview", "dashboard", "Dashboard", "/admin", True, True, "Any staff role (no permission of its own)",
  "Platform health at a glance. It is the page to open first each morning: every figure links through to the module that owns it.",
  ["Six headline cards: users, published sessions, AI spend over 30 days, open reports, staff accounts, audit entries.",
   "AI request volume over time.", "Most played sessions in the published catalogue, by lifetime plays.",
   "Needs attention: items from other modules that are waiting on someone.", "Recent admin activity from the audit log."],
  ["Click a card or a row to go to the module that owns it."],
  ["Figures are read-only here; changes happen in the owning module."],
  "Read model over the other modules; no endpoint of its own.",
  [("dashboard", "Dashboard")]),
 ("People", "users", "Users", "/admin/users", True, True, "users.read · users.write (role) · users.suspend",
  "Every account on the platform, consumers and staff. Role changes and suspensions take effect immediately.",
  ["Cards: total users (30-day change), active, paid plans with conversion, staff accounts.",
   "A table with name and email, role, status (active / suspended / pending), plan, country, sessions, coins, joined and last active."],
  ["Search by name or email; filter by status, plan, role and country; sort any column; export CSV.",
   "Change a user's role from the dropdown in their row.", "Suspend or reactivate a user.",
   "Invite user: name, email and role, then Send invite.", "Open a user to see their detail page."],
  ["Staff roles are the same accounts with a non-member role. The Roles page defines what each role can do.",
   "There is no admin login yet, so today anyone with the address can make these changes (P0 gap)."],
  "GET/PATCH /admin/users, POST /admin/users/invite (API contract §7).",
  [("users", "Users")]),
 ("People", "user-detail", "User detail", "/admin/users/:id", True, True, "users.read",
  "One account's own history, filtered by user id (never by name): what they made, earned and did.",
  ["Header with role and status; cards for plan, coins, sessions created and last active.",
   "Well-being outcome panel on staging: WHO-5, check-ins and resting heart rate for this user.",
   "Sessions created, coin activity (earnings, spends, grants with balance after), and audit history (actions by and about this account)."],
  ["Go back to Users; open a session."],
  ["The outcome panel uses the same sample data as Well-being outcomes, so the two never disagree."],
  "GET /admin/users/{id}.",
  [("users_usr_rs", "User detail")]),
 ("People", "outcomes", "Well-being outcomes", "/admin/outcomes", True, True, "Not defined yet (proposed: users.read + a health-data permission)",
  "How much each member's well-being has changed since they started: is Aurelia actually improving people's well-being?",
  ["Cards: measured users (2+ WHO-5 scores), improved (+10 points or more), average change, follow-ups (latest WHO-5 at 28 or below).",
   "Where people are (improved / steady / declined / too early) and average change by goal.",
   "Every user: WHO-5 start and latest, change, check-ins first vs last, resting heart rate, outcome and follow-up flags.", "How to read this."],
  ["Search, filter by outcome, goal or follow-up, sort, export CSV, open a user."],
  ["WHO-5 changes of 10 points count as meaningful; 28 or below is a cue for a person to follow up, never Aurelia on its own.",
   "Self-reported and observational: it is not proof Aurelia caused the change, and it is not a diagnosis.",
   "The app does not ask WHO-5 yet; this runs on sample data."],
  "Later: GET /admin/outcomes (needs WHO-5 in the app and Compliance wording).",
  [("outcomes", "Well-being outcomes")]),
 ("People", "roles", "Roles & permissions", "/admin/roles", True, True, "roles.manage",
  "What each staff role can do. Super Admin is fixed at full access; the others are edited here and apply at the next sign-in.",
  ["A permission matrix: five roles against 15 permissions in five groups (see the Roles section of this guide)."],
  ["Tick or untick a permission for a role; discard unsaved changes."],
  ["Super Admin cannot be reduced, so nobody can lock everyone out."],
  "Part of the admin API RBAC (§7).",
  [("roles", "Roles & permissions")]),
 ("Experimentation", "study-v1", "Feedback group · version 1", "/admin/experimentation", True, True, "Not defined yet (proposed: research lead role)",
  "The 30-person, 8-week study of therapeutic outcomes, from the researcher's side: are we on track against the pass lines we set, and is the data good enough to judge?",
  ["A timeline of the eight weeks and what is collected when.", "Cards: enrolled, active, WHO-5 +10 so far, data collected, follow-ups.",
   "Success criteria with pass lines and status. Outcome lines read 'not yet' until week 8.",
   "Well-being by cohort over time, a cohort table, and what the study can and cannot show.",
   "Tabs: Participants (pseudonymous, filterable, CSV), What we collect (every measure, when, source, whether the app can collect it today), Data & safety (follow-ups, completeness, missing questionnaires)."],
  ["Switch between Version 1 and Version 2 at the top right.", "Filter and export participants; open a participant."],
  ["Participants are P01–P30 only; names and contact details stay with the research team.",
   "The study cannot prove Aurelia caused a change: there is no control group.", "Sample data until the study runs on the backend."],
  "GET /admin/studies/{id}, …/participants, …/quality (API contract §5.12).",
  [("experimentation", "Version 1 overview")]),
 ("Experimentation", "study-v2", "Feedback group · version 2", "/admin/experimentation/v2", True, True, "Not defined yet (proposed: research lead role)",
  "The same study, read as wins (did people solve their issue?) and as the study team's week. Built for review beside version 1.",
  ["What is different from version 1 (expandable).",
   "Milestones (first tab): the six steps of the two months from the PM playbook, each with its gate computed from the data: passed, below the line, not yet, or to confirm by a person.",
   "Wins: won (moved into the healthy band of their questionnaire), improving, steady, worse, started healthy. Per cohort: start-vs-now severity bands and every participant's status.",
   "This week: a checklist of calls, anyone not reached for two days (from the coaching log), missed questionnaires, what is due, low use and interviews.",
   "Engagement: every participant's sessions per week as a heat strip, and WHO-5 change by how much people used it."],
  ["Tick tasks as done (kept on the page only until the backend exists); show answered questionnaires.", "Open any participant."],
  ["A win needs a meaningful change and arriving in the healthy band; 'started healthy' is shown apart because they had little to win.",
   "Use and change moving together is an association, not proof."],
  "Same endpoints as version 1.",
  [("experimentation_v2", "Version 2: Wins"), ("v2-week", "Version 2: This week"), ("v2-engagement", "Version 2: Engagement")]),
 ("Experimentation", "participant", "Study participant", "/admin/experimentation/:id", True, True, "Not defined yet",
  "One participant's study record.",
  ["Cohort, status and follow-up flags; WHO-5, their own measure, adherence and mood lift per session.",
   "WHO-5 over time, sessions played per week, and every questionnaire as done, missed or due.",
   "Coaching log: every contact by the project manager, with how they feel (1–5), what happened, the next step and whether the study lead is needed; last contact in the header."],
  ["Add a coaching-log entry; delete your own entry after a confirmation.", "Go back to the study."],
  ["No name or contact details, by design.", "The log is saved in this browser until the backend exists; sample entries are marked."], "GET /admin/studies/{id}/participants/{pid}.",
  [("experimentation_P01", "Participant P01")]),
 ("Content", "sessions", "Sessions", "/admin/sessions", True, True, "sessions.read · sessions.write",
  "Every generated session on the platform. Unpublishing removes it from Explore and the community feed but keeps it in the author's library.",
  ["Cards: total sessions, published, total plays, average mood change.", "A table of sessions with type, length, author, plays and status."],
  ["Search, filter, sort, export CSV.", "Edit a session: title, type, length, status.", "Publish or unpublish from the row."],
  ["Plays and mood change are sample data today."],
  "GET/PATCH /admin/sessions, POST …/takedown.",
  [("sessions", "Sessions")]),
 ("Content", "challenges", "Challenges", "/admin/challenges", True, True, "Not defined yet (proposed: sessions.write)",
  "The community's time-boxed programmes: pacing, rewards and copy. Leaderboards and entries come from real play and are not editable here.",
  ["Cards: challenges, active now, total joined, reward pool.", "A table of challenges with their pacing and reward."],
  ["New challenge or edit: title, summary, cover photo, a fallback gradient, total days, ends in, minutes per day, completion points.",
   "Delete with a confirmation step."],
  ["Production v2 (staging v5) shows challenges without ranks; the admin manages the challenge itself either way."],
  "CRUD /admin/challenges.",
  [("challenges", "Challenges")]),
 ("Content", "moderation", "Moderation", "/admin/moderation", True, True, "moderation.review · moderation.action",
  "Reported sessions and community content. Self-harm and crisis reports go to the on-call reviewer whatever their place in the queue.",
  ["Cards: open reports, critical, SLA breached, resolved in 30 days.", "Reports with session, reason, severity, reporter, age, SLA and status."],
  ["Search, filter, sort, export CSV."],
  ["Safety items from the app (a flagged message, a PHQ-9 risk answer) will land here once the backend exists."],
  "GET /admin/moderation/queue, POST …/resolve.",
  [("moderation", "Moderation")]),
 ("Intelligence", "ai", "AI monitoring", "/admin/ai", True, True, "ai.read",
  "Cost, latency, reliability, output quality and safety for every model call. Quality scores come from an LLM-as-judge rubric on a sampled slice of traffic.",
  ["Cards: requests, p95 latency, error rate, refusal rate, average judge score.",
   "Daily spend by model, latency percentiles, a model breakdown (requests, tokens, cost, p50/p95, errors).",
   "Output quality, safety and guardrails, and request traces."],
  ["Change the time window; read traces."],
  ["Figures are sample data. In the API contract each AI route (cockpit reply, proposals, build, safety…) reports here."],
  "GET /admin/ai/metrics, /admin/ai/traces/{id}.",
  [("ai", "AI monitoring")]),
 ("Intelligence", "cockpit-rules", "Cockpit rules", "/admin/cockpit-rules", True, True, "ai.config",
  "The reply engine behind every chat today: a keyword matcher, not a model. The first rule whose pattern matches wins.",
  ["Cards: rules, how many propose a brief, how many produce a new cut, the fallback.", "Every rule with its trigger pattern, reply text and prompts."],
  ["Edit a rule: trigger pattern, reply text, prompts offered instead of an answer.", "Edit the fallback reply."],
  ["Order is priority: specific rules before general ones.",
   "When real AI arrives, this page becomes AI policies: a versioned prompt, model and effort per AI route, with draft and publish."],
  "GET/PUT /admin/ai/policies/{route}.",
  [("cockpit-rules", "Cockpit rules")]),
 ("Revenue", "revenue", "Revenue", "/admin/revenue", True, True, "Not defined yet (proposed: finance role)",
  "Recurring revenue movement, retention and unit economics. MRR is split into new, expansion, contraction and churn so growth and decay are never netted into one number.",
  ["Cards: MRR, ARR run-rate, net revenue retention, gross MRR churn, ARPU, estimated LTV.", "MRR over time, cohort retention, revenue by plan."],
  ["Read and hover the charts."], ["Sample data; pricing is still to be decided with the client."], "Read models from the payment provider.",
  [("revenue", "Revenue")]),
 ("Revenue", "pricing", "Pricing", "/admin/pricing", True, True, "Not defined yet (proposed: settings.write)",
  "The plan catalogue, what each tier entitles a user to, regional prices and coin packs.",
  ["Cards: subscription MRR, paid subscribers, paid conversion, coin pack revenue.", "Entitlement matrix, regional pricing, coin packs."],
  ["Read the matrix and price points."], ["The real free-plan limit and Plus/Pro contents are an open decision (API contract §11)."], "GET /plans; admin edits later.",
  [("pricing", "Pricing")]),
 ("Revenue", "payments", "Payments", "/admin/payments", True, True, "Not defined yet (proposed: finance role)",
  "Every charge, refund and dispute, plus the dunning queue that recovers failed cards before they become churn.",
  ["Cards: gross, net, processing fees, payment success, refunded, disputes.", "Dunning queue (customer, amount, failure, grace ends) and all transactions."],
  ["Search, filter, sort and export both tables."], ["Sample data until a payment provider is chosen."], "Payment provider webhooks.",
  [("payments", "Payments")]),
 ("Revenue", "coins", "Coins & rewards", "/admin/coins", True, True, "coins.read · coins.adjust",
  "The in-app economy ledger. Manual grants need the coins.adjust permission and are always audited.",
  ["Cards: coins circulating, earned and spent in 30 days, redemption rate.", "The ledger of earnings, spends and grants."],
  ["Search, filter and export the ledger."], ["One currency (coins) is the recommended rule."], "POST /admin/coins/grant.",
  [("coins", "Coins & rewards")]),
 ("Growth", "experiments", "Experiments (A/B)", "/admin/experiments", True, True, "Not defined yet",
  "A/B tests across onboarding, the cockpit, paywall and notifications. This is product A/B testing, not the feedback-group study.",
  ["Cards: running, conclusive at 95%, users exposed, shipped this quarter.", "Each test's hypothesis, surface, metric, lift, significance and start date."],
  ["Search, filter by status and surface, export CSV."], ["A test that has run long at low confidence is a null result and should be stopped."], "GET/PUT /admin/experiments.",
  [("experiments", "Experiments")]),
 ("Growth", "notifications", "Notifications", "/admin/notifications", True, True, "Not defined yet",
  "Push, email and in-app campaigns. Marketing sends need the notification consent; transactional sends (payment failures, security) do not.",
  ["Cards: delivered in 30 days, open rate, conversion, push opt-in.", "Campaigns with channel, audience, consent, delivered, open and conversion rates."],
  ["Search, filter and export campaigns."], ["Push needs a sender on the backend; reminders are calendar files for now."], "POST /admin/notifications/broadcast.",
  [("notifications", "Notifications")]),
 ("Platform", "compliance", "Compliance & privacy", "/admin/compliance", True, True, "Not defined yet (proposed: compliance officer)",
  "Aurelia processes mood, sleep and voice data, which is special-category data under GDPR Art. 9. Each purpose is consented separately, and subject requests carry a statutory clock.",
  ["Cards: open requests, overdue, deletion requests, special-category opt-in.", "Data subject requests with the right, regime, owner and statutory due date; the consent ledger; the retention schedule."],
  ["Search, filter and export requests."], ["Overdue requests are a legal risk, not a backlog item."], "GET /admin/compliance/requests.",
  [("compliance", "Compliance & privacy")]),
 ("Platform", "signal-sources", "Signal sources", "/admin/signal-sources", True, True, "Not defined yet (proposed: settings.write)",
  "The integrations Progress (My Wellness) can read, consent-gated per source. The 'Reads' text is the exact text a member agrees to.",
  ["Cards: sources, on by default.", "Each source with its group, icon and what Aurelia reads."],
  ["Add a source, edit it (name, group, icon, what it reads) or remove it with a confirmation."],
  ["Changing the Reads text changes a consent record: a new version should ask users again."],
  "CRUD /admin/signal-sources.",
  [("signal-sources", "Signal sources")]),
 ("Platform", "audit", "Audit log", "/admin/audit", True, True, "audit.read",
  "The immutable history of every privileged action. Entries are append-only and cannot be edited or deleted here.",
  ["Cards: entries in 30 days, last 48 hours, denied attempts, distinct actors.", "Every entry with actor, action, target, result and time."],
  ["Search, filter and export for long-term retention."], ["Every admin change on the backend will write here."], "GET /admin/audit.",
  [("audit", "Audit log")]),
 ("Platform", "platform-settings", "Settings", "/admin/settings", True, True, "settings.write · ai.config · ai.budget",
  "Platform configuration. Model and budget changes are written to the audit log.",
  ["AI configuration: the primary generation model, the monthly spend ceiling and the current list price.",
   "Feature flags: community publishing, voice input, challenges, wearable sync, session settings."],
  ["Pick the model; set the ceiling; switch flags."],
  ["These switches are a design of the real control. The demo's own flags live in the separate /__demo console, which is not linked from the app."],
  "GET/PUT config and AI policies.",
  [("settings", "Settings")]),
]

GROUPS = ["Overview", "People", "Experimentation", "Content", "Intelligence", "Revenue", "Growth", "Platform"]

def chips(m):
    out = []
    out.append('<span class="chip ok">Staging</span>')
    out.append('<span class="chip ok">Production</span>' if m[4] else '<span class="chip no">Not in production yet</span>')
    return "".join(out)

def li(xs):
    return "".join(f"<li>{E(x)}</li>" for x in xs)

def module(m):
    g, mid, title, route, prod, stg, perms, purpose, see, do, rules, api, shots = m
    shots_html = "".join(
        f'<button class="shot" type="button" data-full="{IMG}{f}.jpg" data-cap="{E(c)}" aria-label="Enlarge screenshot: {E(c)}">'
        f'<img src="{IMG}{f}.jpg" alt="{E(c)}" loading="lazy"><span>{E(c)}</span></button>'
        for f, c in shots)
    return f'''
<section class="mod" id="{mid}" data-group="{E(g)}">
  <header class="mod-head">
    <p class="eyebrow">{E(g)}</p>
    <h3>{E(title)}</h3>
    <p class="route"><code>{E(route)}</code> {chips(m)}</p>
  </header>
  <p class="purpose">{E(purpose)}</p>
  <div class="mod-body">
    <div class="cols">
      <div><h4>What you see</h4><ul>{li(see)}</ul></div>
      <div><h4>What you can do</h4><ul>{li(do)}</ul></div>
      <div><h4>Rules to know</h4><ul>{li(rules)}</ul></div>
      <dl class="facts"><dt>Permission</dt><dd>{E(perms)}</dd><dt>Backend (API contract)</dt><dd>{E(api)}</dd></dl>
    </div>
    <div class="shots">{shots_html}</div>
  </div>
</section>'''

toc = []
for g in GROUPS:
    items = "".join(f'<li><a href="#{m[1]}">{E(m[2])}</a></li>' for m in M if m[0] == g)
    toc.append(f'<li class="tg"><span>{E(g)}</span><ul>{items}</ul></li>')

body_mods = []
for g in GROUPS:
    body_mods.append(f'<h2 class="group" id="g-{g.lower()}">{E(g)}</h2>')
    body_mods += [module(m) for m in M if m[0] == g]

perm_ids = [p for _, ps in PERMS for p in ps]
matrix_head = "".join(f'<th scope="col" title="{E(lbl)}"><span>{E(pid)}</span></th>' for pid, lbl in perm_ids)
matrix_rows = ""
for name, desc, ps in ROLES:
    have = set(x for x, _ in perm_ids) if ps == "all" else set(ps.split())
    cells = "".join(f'<td class="{"y" if pid in have else "n"}" aria-label="{"yes" if pid in have else "no"}">{"●" if pid in have else "·"}</td>' for pid, _ in perm_ids)
    matrix_rows += f'<tr><th scope="row"><b>{E(name)}</b><small>{E(desc)}</small></th>{cells}</tr>'
perm_legend = "".join(f'<li><b>{E(g)}</b>: ' + ", ".join(f"<code>{E(p)}</code> {E(l)}" for p, l in ps) + "</li>" for g, ps in PERMS)

page = f'''<title>Aurelia Admin Guideline</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: the admin's own espresso sidebar as a sticky table of contents; chapters per nav group; each module = text columns + screenshot strip. */
:root {{
  --bg: #F7F4EF; --surface: #FFFFFF; --ink: #24150A; --ink2: #5A4A3C; --muted: #8A7A6B; --line: #E7DED3;
  --side: #1B1006; --side-ink: #F3E9DE; --side-muted: #A8957F; --accent: #E8770F; --accent-soft: #FFF0DC;
  --ok: #1F7A4D; --ok-soft: #E4F3EA; --no: #9A4A12; --no-soft: #FBEADB;
  --font: 'Mulish', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #120C07; --surface: #1C140D; --ink: #F3E9DE; --ink2: #CDBCA9; --muted: #9C8A77; --line: #33271C;
  --side: #0B0704; --side-ink: #F3E9DE; --side-muted: #8E7C69; --accent: #FF9A3D; --accent-soft: #3A2712;
  --ok: #6FD39A; --ok-soft: #15301F; --no: #FFB27A; --no-soft: #3A2414; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #120C07; --surface: #1C140D; --ink: #F3E9DE; --ink2: #CDBCA9; --muted: #9C8A77; --line: #33271C;
  --side: #0B0704; --side-ink: #F3E9DE; --side-muted: #8E7C69; --accent: #FF9A3D; --accent-soft: #3A2712;
  --ok: #6FD39A; --ok-soft: #15301F; --no: #FFB27A; --no-soft: #3A2414; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.6 var(--font); }}
a {{ color: inherit; }}
code {{ font-family: var(--mono); font-size: 12.5px; background: var(--accent-soft); padding: 1px 5px; border-radius: 4px; }}
.layout {{ display: grid; grid-template-columns: 264px minmax(0, 1fr); min-height: 100vh; }}
nav.toc {{ position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto; background: var(--side); color: var(--side-ink); padding: 20px 14px 40px; }}
.brand {{ display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; padding: 0 6px 14px; }}
.brand span {{ font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--side-muted); padding-left: 10px; border-left: 1px solid #3A2A1B; }}
main {{ position: relative; overflow: hidden; }}
main::before {{ content: ""; position: absolute; top: -120px; right: -60px; width: 320px; height: 320px; border-radius: 50%; background: #FFE682; opacity: 0.45; filter: blur(90px); pointer-events: none; }}
.inner {{ position: relative; }}
h2.group {{ border-top: 3px solid transparent !important; border-image: linear-gradient(90deg, #FF8514, #FFE270 60%, transparent) 1; }}
nav.toc input {{ width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #3A2A1B; background: #26180C; color: var(--side-ink); font: inherit; font-size: 13px; }}
nav.toc input::placeholder {{ color: var(--side-muted); }}
nav.toc ul {{ list-style: none; margin: 0; padding: 0; }}
nav.toc > ul {{ margin-top: 14px; }}
.toc .tg > span {{ display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--side-muted); padding: 12px 8px 4px; }}
.toc a {{ display: block; text-decoration: none; font-size: 13.5px; padding: 6px 8px; border-radius: 7px; color: var(--side-ink); }}
.toc a:hover, .toc a:focus-visible {{ background: #2C1D10; outline: none; }}
.toc a.active {{ background: #3A2614; box-shadow: inset 3px 0 0 #FF881B; }}
.toc .lead a {{ font-weight: 600; }}
main {{ min-width: 0; padding-block: 36px 80px; padding-left: max(28px, env(safe-area-inset-left, 0px)); padding-right: max(28px, env(safe-area-inset-right, 0px)); }}
.inner {{ max-width: 1080px; margin: 0 auto; }}
.eyebrow {{ margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }}
h1 {{ font-size: clamp(30px, 4.4vw, 42px); line-height: 1.12; margin: 8px 0 10px; font-weight: 800; text-wrap: balance; letter-spacing: -.01em; }}
h2 {{ font-size: 24px; margin: 52px 0 6px; font-weight: 800; text-wrap: balance; }}
h2.group {{ padding-top: 18px; border-top: 2px solid var(--ink); }}
h3 {{ font-size: 20px; margin: 4px 0 2px; font-weight: 800; }}
h4 {{ font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin: 0 0 6px; }}
p {{ max-width: 70ch; }}
.lede {{ font-size: 17px; color: var(--ink2); margin: 0; }}
.status {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }}
.chip {{ display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--ink2); white-space: nowrap; }}
.chip.ok {{ background: var(--ok-soft); color: var(--ok); border-color: transparent; }}
.chip.no {{ background: var(--no-soft); color: var(--no); border-color: transparent; }}
.chip.warn::before {{ content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }}
.grid2 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 16px; }}
.card {{ background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; min-width: 0; }}
.card h3 {{ font-size: 16px; }}
.card ul, .mod ul {{ margin: 6px 0 0; padding-left: 18px; }}
.card li, .mod li {{ margin: 4px 0; }}
.navmap {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 14px; }}
.navmap div {{ background: var(--side); color: var(--side-ink); border-radius: 12px; padding: 12px 14px; }}
.navmap b {{ display: block; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--side-muted); margin-bottom: 4px; }}
.navmap a {{ display: block; font-size: 13.5px; text-decoration: none; padding: 2px 0; }}
.navmap a:hover {{ color: #FFB46B; }}
.table-wrap {{ overflow-x: auto; margin-top: 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }}
table {{ border-collapse: collapse; width: 100%; font-size: 13.5px; }}
th, td {{ padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }}
tr:last-child th, tr:last-child td {{ border-bottom: 0; }}
thead th {{ font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }}
.matrix th span {{ writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--mono); font-size: 11px; text-transform: none; letter-spacing: 0; white-space: nowrap; }}
.matrix td {{ text-align: center; font-size: 15px; }}
.matrix td.y {{ color: var(--ok); }}
.matrix td.n {{ color: var(--line); }}
.matrix th[scope=row] {{ min-width: 220px; }}
.matrix small {{ display: block; color: var(--muted); font-weight: 400; font-size: 12px; }}
.mod {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 20px 22px; margin-top: 16px; scroll-margin-top: 16px; }}
.mod-head {{ display: flex; flex-direction: column; gap: 2px; }}
.route {{ margin: 6px 0 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }}
.purpose {{ margin: 12px 0 0; font-size: 15.5px; }}
.mod-body {{ display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 22px; margin-top: 14px; align-items: start; }}
.cols {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 22px; font-size: 14px; }}
.facts {{ margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 13px; background: var(--bg); border-radius: 10px; padding: 10px 12px; align-self: start; }}
.facts dt {{ color: var(--muted); font-weight: 700; }}
.facts dd {{ margin: 0; }}
.shots {{ display: flex; flex-direction: column; gap: 10px; }}
.shot {{ all: unset; cursor: zoom-in; display: block; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--bg); }}
.shot img {{ display: block; width: 100%; height: 190px; object-fit: cover; object-position: top left; }}
.shot span {{ display: block; font-size: 12px; color: var(--muted); padding: 6px 10px; border-top: 1px solid var(--line); }}
.shot:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
dialog {{ border: 0; padding: 0; max-width: min(1200px, 96vw); max-height: 92vh; border-radius: 12px; background: var(--surface); color: var(--ink); }}
dialog::backdrop {{ background: rgba(20, 12, 5, .72); }}
dialog .dhead {{ display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--surface); }}
dialog button {{ font: inherit; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer; }}
dialog img {{ display: block; width: 100%; height: auto; }}
.empty {{ display: none; margin-top: 16px; color: var(--muted); }}
.note {{ background: var(--accent-soft); border-radius: 14px; padding: 14px 18px; margin-top: 16px; }}
.mtoc {{ display: none; }}
@media (max-width: 960px) {{
  .layout {{ grid-template-columns: 1fr; }}
  nav.toc {{ display: none; }}
  .mtoc {{ display: block; background: var(--side); color: var(--side-ink); border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; }}
  .mtoc summary {{ cursor: pointer; font-weight: 700; }}
  .mtoc input {{ width: 100%; margin-top: 10px; padding: 8px 10px; border-radius: 8px; border: 1px solid #3A2A1B; background: #26180C; color: var(--side-ink); font: inherit; }}
  .mtoc a {{ display: block; padding: 4px 0; text-decoration: none; font-size: 14px; }}
  .mtoc .tg > span {{ display: block; margin-top: 8px; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--side-muted); }}
  .mtoc ul {{ list-style: none; padding: 0; margin: 0; }}
  main {{ padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 60px; }}
  .mod-body {{ grid-template-columns: 1fr; }}
}}
@media (max-width: 560px) {{ .cols {{ grid-template-columns: 1fr; }} .mod {{ padding: 16px; }} }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>

<div class="layout">
  <nav class="toc" aria-label="Guideline contents">
    <div class="brand">{brand.logo(26)}<span>Admin guideline</span></div>
    <label class="sr" for="q" style="position:absolute;left:-9999px">Search modules</label>
    <input id="q" type="search" placeholder="Search modules, e.g. coins, WHO-5" autocomplete="off">
    <ul>
      <li class="tg lead"><span>Guide</span><ul>
        <li><a href="#start">Getting started</a></li><li><a href="#map">Navigation map</a></li>
        <li><a href="#patterns">How the screens work</a></li><li><a href="#roles">Roles and permissions</a></li>
        <li><a href="#environments">Staging and production</a></li></ul></li>
      {"".join(toc)}
      <li class="tg lead"><span>Reference</span><ul><li><a href="#gaps">Known gaps and roadmap</a></li><li><a href="#glossary">Glossary</a></li></ul></li>
    </ul>
  </nav>

  <main>
   <div class="inner">
    <details class="mtoc"><summary>Contents and search</summary>
      <input id="q2" type="search" placeholder="Search modules" autocomplete="off" aria-label="Search modules">
      <ul><li class="tg"><span>Guide</span><ul><li><a href="#start">Getting started</a></li><li><a href="#map">Navigation map</a></li><li><a href="#patterns">How the screens work</a></li><li><a href="#roles">Roles and permissions</a></li><li><a href="#environments">Staging and production</a></li></ul></li>{"".join(toc)}<li class="tg"><span>Reference</span><ul><li><a href="#gaps">Known gaps and roadmap</a></li><li><a href="#glossary">Glossary</a></li></ul></li></ul>
    </details>

    <header id="start">
      <p class="eyebrow">Aurelia · admin site · guideline · 11 November 2026</p>
      <h1>The Aurelia admin, module by module</h1>
      <p class="lede">What every part of the admin is for, what you see on it, what you can do, the rules behind it, who is allowed, and what the real backend will replace. Written for the people who will run Aurelia day to day.</p>
      <div class="status">
        <span class="chip">23 screens · 21 modules in 8 groups</span>
        <span class="chip warn">All figures are sample data</span>
        <span class="chip warn">No admin login yet</span>
        <span class="chip">Same admin on staging and production</span>
      </div>
    </header>

    <h2 id="getting">Getting started</h2>
    <div class="grid2">
      <div class="card"><h3>Where it is</h3><ul>
        <li>Production: <code>aureliaprod.vercel.app/admin</code></li>
        <li>Staging: the staging site's <code>/admin</code>. New modules land here first.</li>
        <li>The admin is part of the same app as the consumer site, not a separate system. Each site has its own copy.</li></ul></div>
      <div class="card"><h3>How to get in</h3><ul>
        <li>Enter the site password once, as for the consumer app. Ask the product owner; it is not written in any document.</li>
        <li>There is no admin login yet. Anyone with the address and the password can open it (known gap P0).</li>
        <li>The admin is built for desktop. It works on a phone, with wide tables scrolling sideways.</li></ul></div>
      <div class="card"><h3>What the data is</h3><ul>
        <li>Every number is generated sample data, made to look realistic, until the backend exists.</li>
        <li>Edits (roles, suspensions, challenges, rules) apply in your browser for this visit only.</li>
        <li>The top bar says <i>Environment: staging · Data is mock</i> so this is never a surprise.</li></ul></div>
    </div>

    <h2 id="map">Navigation map</h2>
    <p>The sidebar groups modules by the job they belong to. Click any name to jump to its chapter.</p>
    <div class="navmap">
      {"".join(f'<div><b>{E(g)}</b>' + "".join(f'<a href="#{m[1]}">{E(m[2])}</a>' for m in M if m[0] == g and m[1] not in ("user-detail", "participant")) + "</div>" for g in GROUPS)}
    </div>

    <h2 id="patterns">How the screens work</h2>
    <div class="grid2">
      <div class="card"><h3>Page anatomy</h3><ul>
        <li><b>Header</b>: the module's name and one sentence on what it is for.</li>
        <li><b>Headline cards</b>: four to six figures, with a change against the previous period where it matters (green good, red bad; for costs and errors a rise is red).</li>
        <li><b>Panels</b>: charts and tables, each with a line saying what it shows.</li></ul></div>
      <div class="card"><h3>Tables</h3><ul>
        <li>Search box, filters, sortable columns, paging and <b>Export CSV</b> on every data table.</li>
        <li>Wide tables scroll inside their panel; the page itself never scrolls sideways.</li>
        <li>Rows with a name open that person or session.</li></ul></div>
      <div class="card"><h3>Status colours</h3><ul>
        <li><span class="chip ok">good</span> active, published, on track</li>
        <li><span class="chip no">attention</span> suspended, critical, overdue, at risk</li>
        <li>Colour never carries meaning alone: every badge has its word.</li></ul></div>
      <div class="card"><h3>Changes and safety</h3><ul>
        <li>Destructive actions (delete, remove) always ask for confirmation first.</li>
        <li>Privileged changes are meant to be written to the Audit log.</li>
        <li>Health-related flags go to a person; nothing is acted on automatically.</li></ul></div>
    </div>

    <h2 id="roles">Roles and permissions</h2>
    <p>Five staff roles. Super Admin always has everything; the others are edited on the Roles page. The matrix below is the current default. It takes effect once admin login exists.</p>
    <div class="table-wrap"><table class="matrix"><thead><tr><th scope="col">Role</th>{matrix_head}</tr></thead><tbody>{matrix_rows}</tbody></table></div>
    <ul class="plain" style="margin-top:10px;font-size:13.5px">{perm_legend}</ul>
    <p class="note">Several modules (revenue, payments, pricing, compliance, notifications, the study) have no permission of their own yet. Each chapter proposes one. Adding them is part of building admin login.</p>

    <h2 id="environments">Staging and production</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Question</th><th>Staging</th><th>Production</th></tr></thead>
      <tbody>
        <tr><td>What it is</td><td>Where every change lands first; shared for review</td><td>What end users and the client see; moves only on request</td></tr>
        <tr><td>Admin version</td><td colspan="2">All 21 modules on both since 11 November 2026, including Well-being outcomes and both Experimentation versions. New modules reach staging first.</td></tr>
        <tr><td>Data</td><td colspan="2">Sample data in both, generated separately; nothing is shared between them</td></tr>
        <tr><td>Feature flags</td><td colspan="2">Each site has its own flag set (switched in the /__demo console, which is deliberately not linked from the app)</td></tr>
      </tbody></table></div>

    {"".join(body_mods)}
    <p class="empty" id="empty">No module matches that search.</p>

    <h2 id="gaps" class="group">Known gaps and roadmap</h2>
    <div class="grid2">
      <div class="card"><h3>Gaps today</h3><ul>
        <li><b>No admin login</b> (P0): every module is reachable by address. Fixed by SSO with staff roles.</li>
        <li><b>Sample data everywhere</b>: nothing is read from a database yet.</li>
        <li><b>Edits do not persist</b> beyond the visit.</li>
        <li><b>The study</b> needs questionnaires in the app before week 0.</li></ul></div>
      <div class="card"><h3>What the backend adds (API contract)</h3><ul>
        <li>P0: accounts, persistence, admin login and the audit log.</li>
        <li>P1: AI monitoring and AI policies fed by real model calls.</li>
        <li>P3: payments, coins and challenges on real data.</li>
        <li>P4: every admin module on real data, plus the outcomes module once WHO-5 is in the app.</li></ul></div>
    </div>

    <h2 id="glossary">Glossary</h2>
    <div class="table-wrap"><table><tbody>
      <tr><th>WHO-5</th><td>A five-question well-being index from 0 to 100. A change of 10 points is meaningful; 28 or below is a cue for a person to follow up.</td></tr>
      <tr><th>Cohort measure</th><td>The validated questionnaire for a participant's own issue: ISI (sleep), GAD-7 (anxiety), PROMIS Cognitive Function (fog, focus), PROMIS Fatigue (energy), PSS-10 (stress).</td></tr>
      <tr><th>Win</th><td>In the study's version 2: moving from the problem range into the healthy band of the cohort measure.</td></tr>
      <tr><th>Adherence</th><td>The share of weeks with three or more sessions played.</td></tr>
      <tr><th>Cut / version</th><td>A built version of a session (v1.0, v1.1 …). Live is what listeners get; current is what the owner edits.</td></tr>
      <tr><th>MRR / NRR / ARPU / LTV</th><td>Monthly recurring revenue; net revenue retention; average revenue per user; lifetime value.</td></tr>
      <tr><th>Dunning</th><td>Retrying failed card payments before a subscription lapses.</td></tr>
      <tr><th>DSAR</th><td>A data subject request under GDPR (access, deletion, correction), with a statutory deadline.</td></tr>
      <tr><th>LLM-as-judge</th><td>A model scoring a sample of AI outputs against a rubric, shown in AI monitoring.</td></tr>
      <tr><th>Sample data</th><td>Realistic generated figures used until the backend exists. Never quote them as results.</td></tr>
    </tbody></table></div>
    <p style="margin-top:36px;color:var(--muted);font-size:13px">Prepared by Claude for the Aurelia team from the admin as of 11 November 2026. Source in the repository: <code>docs/guidelines/admin-guideline.html</code>. The backend plan is <code>docs/api/API-CONTRACT.md</code>.</p>
   </div>
  </main>
</div>

<dialog id="viewer" aria-label="Screenshot">
  <div class="dhead"><span id="vcap"></span><button type="button" id="vclose">Close</button></div>
  <img id="vimg" alt="">
</dialog>

<script>
(function () {{
  var viewer = document.getElementById('viewer'), vimg = document.getElementById('vimg'), vcap = document.getElementById('vcap');
  document.querySelectorAll('.shot').forEach(function (b) {{
    b.addEventListener('click', function () {{
      vimg.src = b.getAttribute('data-full'); vimg.alt = b.getAttribute('data-cap'); vcap.textContent = b.getAttribute('data-cap');
      if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
    }});
  }});
  document.getElementById('vclose').addEventListener('click', function () {{ viewer.close(); }});
  viewer.addEventListener('click', function (e) {{ if (e.target === viewer) viewer.close(); }});

  var mods = Array.prototype.slice.call(document.querySelectorAll('.mod'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('h2.group'));
  function filter(q) {{
    q = q.trim().toLowerCase(); var shown = 0;
    mods.forEach(function (m) {{ var hit = !q || m.textContent.toLowerCase().indexOf(q) !== -1; m.hidden = !hit; if (hit) shown++; }});
    groups.forEach(function (g) {{
      if (g.id === 'gaps') return;
      var name = g.textContent, any = mods.some(function (m) {{ return !m.hidden && m.getAttribute('data-group') === name; }});
      g.hidden = !!q && !any;
    }});
    document.getElementById('empty').style.display = shown ? 'none' : 'block';
    document.querySelectorAll('.toc a, .mtoc a').forEach(function (a) {{
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (t && t.classList.contains('mod')) a.parentElement.hidden = t.hidden;
    }});
  }}
  ['q', 'q2'].forEach(function (id) {{ var el = document.getElementById(id); if (el) el.addEventListener('input', function () {{ filter(el.value); }}); }});

  var links = {{}};
  document.querySelectorAll('.toc a').forEach(function (a) {{ links[a.getAttribute('href').slice(1)] = a; }});
  if ('IntersectionObserver' in window) {{
    var io = new IntersectionObserver(function (es) {{
      es.forEach(function (e) {{
        if (e.isIntersecting && links[e.target.id]) {{
          Object.keys(links).forEach(function (k) {{ links[k].classList.remove('active'); }});
          links[e.target.id].classList.add('active');
        }}
      }});
    }}, {{ rootMargin: '-20% 0px -70% 0px' }});
    document.querySelectorAll('.mod, #start, #map, #patterns, #roles, #environments, #gaps, #glossary').forEach(function (s) {{ io.observe(s); }});
  }}
}})();
</script>
'''
open(OUT, 'w').write(page)

# The app renders the body only: its own shell draws the contents list, search and viewer.
frag_page = page.replace('admin-guideline/', '/guides/admin/')
start = frag_page.index('<header id="start">')
end = frag_page.index('   </div>\n  </main>')
frag = frag_page[start:end].replace('Source in the repository: <code>docs/guidelines/admin-guideline.html</code>', 'Source in the repository: <code>scripts/guides/admin_guideline.py</code>')
open(FRAG, 'w').write('<!-- GENERATED by scripts/guides/admin_guideline.py — do not edit. -->\n' + frag)
print('modules', len(M), 'bytes', len(page))
