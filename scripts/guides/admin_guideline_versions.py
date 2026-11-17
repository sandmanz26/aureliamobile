"""Generates the two newer versions of the admin guideline for /wiki.

v1 is the original module-by-module reference (scripts/guides/admin_guideline.py).
These cover the same admin, told two other ways, for someone new:

  v2  Task guide   organised by what you want to do, in plain words
  v3  Quick start  one page: what it is, the daily check, the map, the rules

They reuse the playbook versions' components (`.pb .pbv`, styled by
pm-playbook-versions.css). Every route and rule here must match v1. Run from
the repo root:

    python3 scripts/guides/admin_guideline_versions.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTENT = os.path.join(ROOT, 'src/guides/content')


def a(path, text=None):
    return f'<a href="{path}">{text or path}</a>'


def cover(label, eyebrow, title, grad, lede):
    return f"""<header class="pb-cover pbv-cover">
  <div class="pb-glow" aria-hidden="true"></div>
  <img class="pb-net" src="/guides/brand/aurelia-network.png" alt="" aria-hidden="true">
  <div class="pb-brandrow">{brand.logo(30)}<span class="pb-doclabel">{label}</span></div>
  <p class="pbv-eyebrow">{eyebrow}</p>
  <h1>{title} <span class="pb-grad">{grad}</span></h1>
  <p class="pbv-lede">{lede}</p>
</header>"""


def li(xs):
    return ''.join(f'<li>{x}</li>' for x in xs)


# (group, [(task, where-path, where-label, steps, watch-out)])
TASKS = [
    ('People', [
        ('Find someone', '/admin/users', 'Users', ['Type a name or email in the search box.', 'Use the filters (status, plan, role, country) to narrow it down.', 'Click the row to open their page.'], 'Always find people by search or id, never by guessing from a name.'),
        ('See one person’s history', '/admin/users', 'Users → a person', ['Open the person from Users.', 'Read their sessions, coins and the actions taken on their account.'], 'Their well-being panel is sample data today.'),
        ('Change someone’s role, or suspend them', '/admin/users', 'Users', ['Find the person.', 'Pick a new role from the dropdown in their row, or press Suspend / Reactivate.'], 'It takes effect immediately. Only do it if your role allows it, and say why in your notes.'),
        ('Invite a new team member', '/admin/users', 'Users → Invite user', ['Press Invite user.', 'Enter name, email and role, then Send invite.'], 'Give the smallest role that does the job (see “Who can do what”).'),
        ('Check whether people feel better', '/admin/outcomes', 'Well-being outcomes', ['Read the cards: who improved, the average change, who needs a follow-up.', 'Filter “follow-up” to see who scored 28 or less.'], 'A follow-up is for a person to make, never the app. A change here is not proof Aurelia caused it.'),
    ]),
    ('The feedback group study', [
        ('Run the study day to day', '/admin/experimentation/v2', 'Feedback group · version 2 → This week', ['Open This week every morning.', 'Do the calls and follow-ups it lists, safety first.', 'Use the Milestones tab to see whether the next checkpoint is on track.'], 'The full routine is in the Feedback group playbook (version 2 is the easiest read).'),
        ('Write down a contact with a participant', '/admin/experimentation/P01', 'A participant’s page → Coaching log', ['Open the participant (P01–P30).', 'Add an entry: what they said, how they feel (1–5), the next step.'], 'Never write names or contact details. The log saves in your browser until the backend exists.'),
    ]),
    ('Content', [
        ('Take a session off Explore', '/admin/sessions', 'Sessions', ['Find the session.', 'Press Unpublish in its row.'], 'It disappears from Explore and the community feed but stays in the author’s own library.'),
        ('Create or change a challenge', '/admin/challenges', 'Challenges', ['Press New challenge, or Edit on a row.', 'Fill in title, summary, cover, days, minutes per day and points.'], 'Deleting asks you to confirm. The current design shows challenges without rankings.'),
        ('Handle a report', '/admin/moderation', 'Moderation', ['Sort by severity: critical first.', 'Open the report and decide.'], '<b>Self-harm or crisis reports go to the on-call reviewer straight away</b>, whatever their place in the queue.'),
    ]),
    ('AI', [
        ('Check that the AI is healthy', '/admin/ai', 'AI monitoring', ['Look at the cards: error rate, slow requests (p95), refusals, quality score.', 'Check daily spend by model.'], 'A rising error rate or spend is red. Tell the AI engineer.'),
        ('Change what the chat replies', '/admin/cockpit-rules', 'Cockpit rules', ['Find the rule whose trigger matches.', 'Edit its reply or the prompts it offers.'], 'Order matters: the first matching rule wins. This becomes “AI policies” when real AI arrives.'),
    ]),
    ('Money', [
        ('See how revenue is doing', '/admin/revenue', 'Revenue', ['Read monthly recurring revenue (MRR), churn and retention.'], 'All sample data; prices are not decided yet.'),
        ('Find failed payments', '/admin/payments', 'Payments → dunning queue', ['Read the list of failed cards and their grace dates.'], 'No payment provider is connected yet.'),
        ('Give or take coins', '/admin/coins', 'Coins & rewards', ['Find the entry in the ledger.'], 'Only with the coins.adjust permission. Every grant is written to the audit log.'),
    ]),
    ('Growth', [
        ('Check an A/B test', '/admin/experiments', 'Experiments (A/B)', ['Find the test; read its lift and confidence.'], 'This is product testing, not the feedback-group study. A test that has run long without confidence should be stopped.'),
        ('Check a message campaign', '/admin/notifications', 'Notifications', ['Read delivered, opened and converted for each campaign.'], 'Marketing messages need the person’s consent; payment or security messages do not.'),
    ]),
    ('Platform', [
        ('Answer a privacy request (see or delete my data)', '/admin/compliance', 'Compliance & privacy', ['Open the request; check its due date and owner.'], '<b>Overdue requests are a legal risk.</b> They come before anything else on this page.'),
        ('Change what a wearable reads', '/admin/signal-sources', 'Signal sources', ['Edit the source’s name, group or what it reads.'], 'The “Reads” text is what people agreed to. Changing it means asking them again.'),
        ('See who changed what', '/admin/audit', 'Audit log', ['Search by person, action or date.'], 'The log can’t be edited or deleted.'),
        ('Change a platform setting', '/admin/settings', 'Settings', ['Pick the AI model, set the monthly spend ceiling, or switch a feature on or off.'], 'These are written to the audit log. The demo’s own switches live elsewhere.'),
    ]),
]


def tasks_html():
    out = []
    for group, items in TASKS:
        cards = []
        for task, path, where, steps, watch in items:
            cards.append(f"""<section class="pbv-level">
  <div class="pbv-level-head"><div><h4 class="pbv-task">{task}</h4><p class="pbv-when">Where: {a(path, where)}</p></div></div>
  <div class="pbv-level-grid">
    <div><b>Steps</b><ol>{li(steps)}</ol></div>
    <div class="pbv-watch"><b>Watch out</b><p>{watch}</p></div>
  </div>
</section>""")
        out.append(f'<h3>{group}</h3>\n' + '\n'.join(cards))
    return '\n'.join(out)


V2_HTML = f"""<!-- GENERATED by scripts/guides/admin_guideline_versions.py — do not edit. -->
<div class="pb pbv">
{cover('Task guide', 'Admin guideline · version 2', 'Running Aurelia,', 'one task at a time', 'You don’t need to learn every screen. Find what you want to do, follow the steps, and mind the one thing to watch out for. Written for someone new to the team.')}

<h2>New here? Start with these three things</h2>
<div class="pbv-start">
  <div><b>1. What the admin is</b><span>The team’s website for running Aurelia: people, the study, content, AI, money and privacy. It’s part of the same app people use, at <code>/admin</code>.</span></div>
  <div><b>2. How to get in</b><span>Open <b>aureliaprod.vercel.app/admin</b> (production) or the staging site’s <code>/admin</code>. Enter the site password; ask the product owner, it is never written down.</span></div>
  <div><b>3. Nothing is real yet</b><span>Every number is realistic sample data, and your edits only last for this visit. Explore freely, but never quote a figure as a result.</span></div>
</div>
<div class="pbv-believe pbv-soft"><b>Good to know:</b> there is no admin login yet, so anyone with the address and password can open it (the top known gap). Staging is the test copy where new things land first; production is what the client sees. Both have sample data.</div>

<h2>Your first 15 minutes</h2>
<ol class="pbv-three">
  <li>Open {a('/admin', 'the Dashboard')} and click one card: every figure takes you to the page that owns it.</li>
  <li>Open {a('/admin/users', 'Users')}, search for any name, and open that person.</li>
  <li>Open {a('/admin/moderation', 'Moderation')} and sort by severity.</li>
  <li>Open {a('/admin/experimentation/v2', 'Feedback group · version 2')} and look at the Milestones tab.</li>
  <li>Skim the sidebar once. It’s grouped by job: Overview, People, Experimentation, Content, Intelligence, Revenue, Growth, Platform.</li>
</ol>

<h2>Who can do what</h2>
<p>Five team roles. Give each person the smallest one that does their job. Roles take effect once admin login exists.</p>
<table><thead><tr><th>Role</th><th>Can</th><th>Can’t</th></tr></thead><tbody>
<tr><td><b>Super Admin</b></td><td>Everything, including roles and settings</td><td>Be reduced, so nobody can lock everyone out</td></tr>
<tr><td><b>Operations</b></td><td>Day-to-day work on people and content; read AI monitoring</td><td>Change AI settings or roles, adjust coins</td></tr>
<tr><td><b>Moderator</b></td><td>Review and act on reports</td><td>Edit people, AI or money</td></tr>
<tr><td><b>AI Engineer</b></td><td>Models, prompts, spend limits</td><td>Edit people or content</td></tr>
<tr><td><b>Analyst</b></td><td>Read almost everything for reporting</td><td>Change anything</td></tr>
</tbody></table>
<p class="pbv-small">Full permission matrix: version 1 of this guide, “Roles and permissions”, or {a('/admin/roles', 'Roles & permissions')}.</p>

<h2>Every morning (10 minutes)</h2>
<div class="pbv-day">
  <div><b>1 · Dashboard</b><span>“Needs attention”: what is waiting on someone. {a('/admin', 'Open')}</span></div>
  <div><b>2 · Moderation</b><span>Anything critical, and any self-harm or crisis report, first. {a('/admin/moderation', 'Open')}</span></div>
  <div><b>3 · Compliance</b><span>Any privacy request close to its deadline. {a('/admin/compliance', 'Open')}</span></div>
  <div><b>4 · AI monitoring</b><span>Errors or spend going up. {a('/admin/ai', 'Open')}</span></div>
  <div><b>5 · Study</b><span>If the study is running: This week. {a('/admin/experimentation/v2', 'Open')}</span></div>
</div>

<h2>I want to…</h2>
<p>Find your task, follow the steps. If it isn’t here, version 1 of this guide describes every screen in full.</p>
{tasks_html()}

<h2>Rules that always apply</h2>
<div class="pbv-promises">
  <div><b>Safety</b><ul>{li(['Anything about health or harm goes to a person, the same day. Nothing is acted on automatically.', 'Self-harm and crisis reports skip the queue.'])}</ul></div>
  <div><b>Care</b><ul>{li(['Deleting or removing always asks you to confirm. Read it.', 'Important changes are written to the audit log.', 'Changing consent text means asking people again.'])}</ul></div>
  <div><b>Honesty</b><ul>{li(['Sample data is never quoted as a result.', 'Overdue privacy requests are a legal risk, not a to-do.', 'Find people by id or search, never by guessing.'])}</ul></div>
</div>

<h2>Words you’ll see</h2>
<dl class="pbv-gloss">
  <dt>Sample data</dt><dd>Realistic, generated numbers used until the backend exists.</dd>
  <dt>Staging / production</dt><dd>The test copy of the site, and the real one the client sees.</dd>
  <dt>WHO-5</dt><dd>A five-question well-being score from 0 to 100. +10 is a real change; 28 or less means a person follows up.</dd>
  <dt>P01–P30</dt><dd>Code names for study participants. Real names never appear in the admin.</dd>
  <dt>Coaching log</dt><dd>The project manager’s notes on each participant.</dd>
  <dt>Cut / version</dt><dd>One built version of a session (v1.0, v1.1…).</dd>
  <dt>MRR, churn</dt><dd>Monthly recurring revenue; the share of paying people who stop.</dd>
  <dt>Dunning</dt><dd>Retrying a failed card payment before a subscription ends.</dd>
  <dt>Privacy request (DSAR)</dt><dd>Someone asking to see, fix or delete their data. It has a legal deadline.</dd>
  <dt>LLM-as-judge</dt><dd>An AI that scores a sample of the AI’s answers against a checklist.</dd>
</dl>

<h2>What’s coming</h2>
<ul class="pbv-ticks">
  <li><b>First:</b> real accounts, saved data, an admin login and the audit log.</li>
  <li><b>Then:</b> AI monitoring and AI policies on real model calls.</li>
  <li><b>Later:</b> payments, coins and challenges on real data, and every page on the database.</li>
</ul>

<div class="pbv-send">
  <b>Start with the Dashboard, keep safety first, and ask before you change anything you can’t undo.</b>
  <span>Every screen in full detail is in <b>version 1</b> of this guide.</span>
</div>
</div>
"""

MAP = [
    ('Overview', '/admin', 'Dashboard: what needs attention today'),
    ('People', '/admin/users', 'Users, how people are feeling, team roles'),
    ('Experimentation', '/admin/experimentation/v2', 'The 30-person feedback group study'),
    ('Content', '/admin/sessions', 'Sessions, challenges, reports'),
    ('Intelligence', '/admin/ai', 'AI health, cost and chat rules'),
    ('Revenue', '/admin/revenue', 'Revenue, prices, payments, coins'),
    ('Growth', '/admin/experiments', 'A/B tests and message campaigns'),
    ('Platform', '/admin/compliance', 'Privacy, wearables, audit log, settings'),
]

V3_HTML = f"""<!-- GENERATED by scripts/guides/admin_guideline_versions.py — do not edit. -->
<div class="pb pbv pbv-short">
{cover('Quick start', 'Admin guideline · version 3', 'The admin', 'on one page', 'Where it is, the 10-minute morning check, the map, and the rules that always apply. Steps for each task are in version 2.')}

<p class="pbv-oneline"><b>The admin in one line:</b> the team’s website for running Aurelia, at <b>aureliaprod.vercel.app/admin</b>. Same site password as the app (ask the product owner).</p>

<h2>Three things to know</h2>
<div class="pbv-wins">
  <div><span class="pbv-num">1</span><b>It’s sample data</b><span>Realistic, but invented. Never quote a number.</span></div>
  <div><span class="pbv-num">2</span><b>Edits don’t save</b><span>They last for this visit only, until the backend exists.</span></div>
  <div><span class="pbv-num">3</span><b>No login yet</b><span>Anyone with the address and password can open it.</span></div>
</div>

<h2>Every morning</h2>
<ol class="pbv-three">
  <li>{a('/admin', 'Dashboard')}: what needs attention.</li>
  <li>{a('/admin/moderation', 'Moderation')}: critical and crisis reports first.</li>
  <li>{a('/admin/compliance', 'Compliance')}: privacy requests near their deadline.</li>
  <li>{a('/admin/ai', 'AI monitoring')}: errors or spend going up.</li>
</ol>

<h2>The map</h2>
<table><thead><tr><th>Group</th><th>What it’s for</th></tr></thead><tbody>
{''.join(f'<tr><td><b>{a(p, g)}</b></td><td>{d}</td></tr>' for g, p, d in MAP)}
</tbody></table>

<h2>Always</h2>
<div class="pbv-always">
  <span>Health or harm → a person, same day</span><span>Read every confirm</span><span>Smallest role that works</span><span>Consent text change → ask again</span><span>Never quote sample data</span>
</div>

<div class="pbv-send">
  <b>Not sure? Don’t change it. Ask first.</b>
  <span>Task steps: version 2. Every screen in detail: version 1.</span>
</div>
</div>
"""

CSS = """/* GENERATED by scripts/guides/admin_guideline_versions.py — do not edit. */
.gd-doc .pbv h4.pbv-task { margin: 0; font-size: 17px; font-weight: 600; text-transform: none; letter-spacing: 0; color: var(--gd-ink); }
.gd-doc .pbv .pbv-watch { background: #FDEBCB; border-radius: 12px; padding: 10px 12px; }
.gd-doc .pbv .pbv-watch > b { color: #A45A00; }
.gd-doc .pbv .pbv-watch p { margin: 4px 0 0; font-size: 15px; }
.gd-doc .pbv .pbv-level-grid ol { margin: 6px 0 0; padding-left: 20px; font-size: 15px; }
"""

for name, text in (('admin-guideline-v2.html', V2_HTML), ('admin-guideline-v3.html', V3_HTML), ('admin-guideline-versions.css', CSS)):
    with open(os.path.join(CONTENT, name), 'w') as f:
        f.write(text)
print('wrote admin v2, v3 and css')
