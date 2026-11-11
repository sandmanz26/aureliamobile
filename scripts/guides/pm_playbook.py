"""Builds the feedback-group playbook for the project manager (U062, J066).

    python3 scripts/guides/pm_playbook.py

One source, three outputs:
  docs/reviews/feedback-group-playbook-2026-11-11.html   standalone page; printed to the PDF beside it
  src/guides/content/pm-playbook.html                    the body only, shown in the app at /guide/playbook
  src/guides/content/pm-playbook.css                     its styles, scoped for the app
The milestones and their gates must match `milestones()` in src/admin/data/study.ts,
which computes them in admin → Experimentation → Version 2 → Milestones.
"""
import html, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs/reviews/feedback-group-playbook-2026-11-11.html')
FRAG = os.path.join(ROOT, 'src/guides/content/pm-playbook.html')
FRAG_CSS = os.path.join(ROOT, 'src/guides/content/pm-playbook.css')
E = html.escape
PROTOCOL = os.path.join(ROOT, 'docs/reviews/feedback-group-study-2026-11-10.html')
PROTO_IMG_DIR = 'feedback-group-study-2026-11-10/'


def protocol(img_base):
    """The J062 study protocol, carried whole as the playbook's appendix.

    Read from its own HTML so the two never disagree: sections renumbered
    P1–P11, image paths pointed at `img_base`, and the one sentence that
    predates the second version and production updated."""
    src = open(PROTOCOL).read()
    start = src.index('<section class="kpis"')
    end = src.index('<p class="small" style="margin-top:40px">AI analysis by Claude')
    body = src[start:end]
    body = re.sub(r'<h2>(\d+)\. ', lambda m: f'<h2 id="p{m.group(1)}">P{m.group(1)}. ', body)
    body = body.replace(f'src="{PROTO_IMG_DIR}', f'src="{img_base}')
    body = body.replace('New in admin on staging: <b>Experimentation → Feedback group study</b>. It has four views and a page per participant.',
                        'In admin: <b>Experimentation → Feedback group · v1</b> (these four views and a page per participant). Since 11 November there is also <b>· v2</b> (Milestones, Wins, This week, Engagement) and a coaching log on each participant page; see section 8.')
    body = body.replace('(section 9)', '(section P10)').replace('items in section 10', 'items in section P10').replace('(section 5)', '(section P5)').replace('from section 5', 'from section P5')
    return f'''
<h2 id="protocol" class="pb-appendix">Appendix · The study protocol</h2>
<p>The protocol of 10 November, in full: why the study, its design, the measures, the pass lines, how results are read, safety, and what must be built before week 0. The playbook above says how to run it; this says what it is. Sections are numbered P1 to P11.</p>
<div class="pb-proto">{body}</div>
'''


COHORTS = [
    ('Bad sleep → good sleep', 'Sleep better', 'Insomnia Severity Index (ISI), 0–28', '7 or less: no insomnia', '6 points lower', 6),
    ('Anxious → calm', 'Feel calmer', 'GAD-7, 0–21', '4 or less: minimal', '4 points lower', 6),
    ('Mental fog → clarity', 'Clear my mind', 'PROMIS Cognitive Function (T-score)', '45 or more: within normal', '5 points higher', 5),
    ('Low energy → energy', 'More energy', 'PROMIS Fatigue (T-score)', '54 or less: within normal', '5 points lower', 5),
    ('Distracted → focused', 'Focus', 'PROMIS Cognitive Function (T-score)', '45 or more: within normal', '5 points higher', 4),
    ('Stressed body → regulated', 'Regulate my body', 'Perceived Stress Scale (PSS-10), 0–40', '13 or less: low stress', '4 points lower', 4),
]

# (id, name, weeks, from, to, goal, you, product, gates, admin path, if the gate fails)
MILESTONES = [
    ('M0', 'Set up and recruit', 'Three weeks before week 0', -3, -1,
     'Thirty people across six issues, consented and screened, with the study tools ready.',
     ['Recruit 4–6 people per issue (table in section 3), from outside the team and outside anyone\'s friends.',
      'Screen with PHQ-9 and the exclusion list; anyone excluded is offered support resources, not dropped silently.',
      'Take informed consent; give each person a pseudonymous id (P01–P30) and keep the name key outside every tool.',
      'Book every baseline call and agree each person\'s daily time (for sleep, the evening).'],
     ['Accounts that stay signed in, study enrolment, the questionnaire screens and the safety alert (protocol section 10).',
      'A clinical advisor and an ethics review confirm the measures and the safety process.'],
     ['30 enrolled, every cohort filled', 'Ethics review and clinical advisor: confirmed by a person'],
     '/admin/experimentation/v2', 'Do not start with fewer than 24. Extend recruitment a week rather than start a cohort with one person.'),
    ('M1', 'Baseline and first session', 'Week 0', 0, 0,
     'Everyone measured before they start, and playing within two days.',
     ['Collect WHO-5, the cohort measure and PHQ-9 before the first session. A baseline after use is not a baseline.',
      'Interview 1 (30 minutes): what the problem is like, what they have tried, what "solved" would mean to them, in their words.',
      'Sit with each person (call or in person) for their first session: onboarding, the first sentence, the first play.',
      'Write their goal sentence in the coaching log: it is what you will measure the next eight weeks against.'],
     ['Watches the first sessions for blockers and fixes the ones that stop people playing.'],
     ['Baseline WHO-5 and cohort measure: 100%', 'Played a first session in week 1: 90% or more'],
     '/admin/experimentation', 'Anyone without a baseline does not count for outcomes. Collect it before they play again.'),
    ('M2', 'Build the habit', 'Weeks 1–2', 1, 2,
     'A daily rhythm: three or more sessions a week, a check-in after each.',
     ['One short message a day at each person\'s agreed time (templates in section 6). Ask, do not lecture.',
      'Anyone under two sessions in a week gets a call: what got in the way, and one small change (shorter, earlier, a different voice).',
      'Log every contact in the participant\'s coaching log, the same day.',
      'Collect WHO-5 at the end of week 2.'],
     ['A weekly 30-minute review with you: the top three blockers, ranked by how many people they hit.'],
     ['3+ sessions in both weeks 1 and 2: 70% or more', 'WHO-5 week 2 answered: 85% or more'],
     '/admin/experimentation/v2', 'Below 70% the study measures who had time, not whether Aurelia helps. Fix the blocker before week 3, even if it is not in the app.'),
    ('M3', 'Midpoint read, first iteration', 'Weeks 3–4', 3, 4,
     'Read what is and is not working, and ship one change for the second half.',
     ['Week 4: WHO-5, cohort measure, PHQ-9 and interview 2 with everyone.',
      'Bring the top three findings to the product team, each with the participants it affects and their own words.',
      'When the change ships, explain it to participants in one message: what changed and why.'],
     ['Ships one change, as a new design version on staging first, by the start of week 5.',
      'Does not change the questionnaires or the timing: the measures must stay comparable.'],
     ['Still enrolled: 85% or more', 'Due questionnaires collected: 85% or more', 'Iteration shipped to the group: confirmed by the product team'],
     '/admin/experimentation/v2', 'Interim outcome figures are shown but not judged. A disappointing week 4 is information for the iteration, not a verdict.'),
    ('M4', 'Second half, second iteration', 'Weeks 5–7', 5, 7,
     'Measure whether the change helped, and make one more adjustment if needed.',
     ['Keep the daily rhythm. People who are winning need less; people who are stuck need a call a week.',
      'Collect WHO-5 at week 6.',
      'Follow up every safety alert the same day, and write down what you did.'],
     ['Compares weeks 5–7 with weeks 1–4 for the people the change was for.',
      'A second change only if the first did not help, again on staging first.'],
     ['Adherent people (3+ sessions in 60% of weeks): 60% or more', 'Every safety alert followed up the same day: confirmed by the study lead'],
     '/admin/experimentation/v2', 'If adherence falls in the second half, ask why in a call before changing anything else.'),
    ('M5', 'Final read and decision', 'Weeks 8–9', 8, 9,
     'The pass lines decide: go, iterate or pivot.',
     ['Week 8: WHO-5, cohort measure, PHQ-9, the value question and interview 3.',
      'Write one story per cohort: where the person started, what changed, in their words, with their consent.',
      'Present the result in week 9 against the pass lines set before week 0.'],
     ['Prepares the decision: what scales, what changes, what stops.'],
     ['Well-being improves: 50% gain 10+ WHO-5 points', 'Their own issue improves: 40% reach the meaningful change',
      'People stay: 70% still enrolled', 'Data to judge: 85% collected', 'Would miss it: 40% "very disappointed"'],
     '/admin/experimentation', 'The lines were fixed before week 0. Moving them after reading the data turns the study into a story.'),
]

DAY = [
    ('08:30', 'Open This week', 'Calls first, then anyone not reached for two days, then missed questionnaires.', '/admin/experimentation/v2'),
    ('09:00–11:00', 'Calls and follow-ups', 'Safety alerts the same day, always first. Then anyone stuck.', None),
    ('Each person\'s time', 'One message', 'Short, a question, about their own goal. Template below.', None),
    ('Same day', 'Log it', 'Coaching log on their page: what they said, how they feel 1–5, the next step.', '/admin/experimentation/P01'),
    ('16:30', 'Five-minute look', 'Wins and Engagement: who moved, who went quiet.', '/admin/experimentation/v2'),
]

WEEK = [
    ('Monday', 'Milestones tab: which gate is next, and is it on track?'),
    ('Wednesday', 'Call everyone under two sessions last week.'),
    ('Friday', '30 minutes with the product team: the top three findings, with who they affect.'),
    ('Every other week', 'WHO-5 goes out; chase it within 48 hours.'),
]

MESSAGES = [
    ('Bad sleep', '"Morning! How did last night go: roughly how long to fall asleep, and did you wake up?"'),
    ('Anxious', '"How is your day feeling, 1 to 5? Did the session before your meeting help, or not really?"'),
    ('Mental fog', '"Did you get a clear hour today? What did you play before it?"'),
    ('Low energy', '"How was your energy this afternoon compared with yesterday?"'),
    ('Distracted', '"How long did your longest focused stretch last today?"'),
    ('Stressed body', '"Where do you feel it today? Did the breathing chapter change anything?"'),
]

LADDER = [
    ('Missed a day', 'Your usual message; no comment on the miss.'),
    ('Not reached for 2 days', 'They appear in This week. A second message, then a short call.'),
    ('Under 2 sessions in a week', 'A call: what got in the way, and one small change.'),
    ('Two questionnaires missed', 'A call, and offer to fill it in together.'),
    ('Any sign of crisis or harm', 'Stop coaching. Crisis resources now, and the study lead the same day. Never handle it alone.'),
]

LOOP = [
    ('Hear', 'Coaching log, interviews, check-ins.'),
    ('Rank', 'How many people it hits × how much it stops them.'),
    ('Change', 'One change, as a new version on staging first.'),
    ('Explain', 'Tell participants what changed and why.'),
    ('Measure', 'Same measures, before and after the change.'),
]

ADMIN = [
    ('Where are we, and is the next gate on track?', 'Version 2 → Milestones', '/admin/experimentation/v2'),
    ('What do I do today?', 'Version 2 → This week', '/admin/experimentation/v2'),
    ('Who has solved their issue?', 'Version 2 → Wins', '/admin/experimentation/v2'),
    ('Is use going with change?', 'Version 2 → Engagement', '/admin/experimentation/v2'),
    ('How is this one person doing?', 'Participant page: measures, sessions, coaching log', '/admin/experimentation/P01'),
    ('Are the pass lines on track?', 'Version 1 → Overview', '/admin/experimentation'),
    ('Is any data missing?', 'Version 1 → Data & safety', '/admin/experimentation'),
    ('What exactly do we collect, and when?', 'Version 1 → What we collect', '/admin/experimentation'),
]

DECISION = [
    ('Go', 'Most pass lines met, including "their own issue improves" and "would miss it".',
     'Plan a controlled trial and open a wider beta for the cohorts that won.'),
    ('Iterate', 'People use it and stay, but outcomes are short of the lines.',
     'A second eight-week cycle on the same design, with the changes the data points to.'),
    ('Pivot', 'People do not use it even with daily guidance, or would not miss it.',
     'Stop and rethink the core loop before more building.'),
]


def li(xs):
    return ''.join(f'<li>{E(x)}</li>' for x in xs)


def link(base, path, label):
    return f'<a class="pb-admin" href="{base}{path}">{E(label)} →</a>'


def body(base, proto_img, net):
    weeks = list(range(-3, 10))
    head = ''.join(f'<span class="pb-wk{" pb-wk0" if w == 0 else ""}">{"W" + str(w) if w >= 0 else str(w)}</span>' for w in weeks)
    bars = ''.join(
        f'<a href="#{m[0].lower()}" class="pb-bar pb-{m[0].lower()}" style="grid-column:{m[3] + 4} / {m[4] + 5}"><b>{m[0]}</b> {E(m[1])}</a>'
        for m in MILESTONES)
    cohorts = ''.join(f'<tr><td><b>{E(c[0])}</b></td><td>{E(c[1])}</td><td>{E(c[2])}</td><td>{E(c[3])}</td><td>{E(c[4])}</td><td class="num">{c[5]}</td></tr>' for c in COHORTS)
    ms = ''.join(f'''
<section class="pb-ms" id="{m[0].lower()}">
  <header><span class="pb-ms-id">{m[0]}</span><div><h3>{E(m[1])}</h3><p class="pb-when">{E(m[2])}</p></div></header>
  <p class="pb-goal">{E(m[5])}</p>
  <div class="pb-ms-cols">
    <div><h4>You</h4><ul>{li(m[6])}</ul></div>
    <div><h4>The product team</h4><ul>{li(m[7])}</ul></div>
  </div>
  <div class="pb-gate"><h4>Gate: passed when</h4><ul>{li(m[8])}</ul><p class="pb-fail"><b>If it is not:</b> {E(m[10])}</p>{link(base, m[9], 'See it in admin')}</div>
</section>''' for m in MILESTONES)
    day = ''.join(f'<li><span class="pb-time">{E(t)}</span><div><b>{E(a)}</b><p>{E(d)}</p>{link(base, p, "Open") if p else ""}</div></li>' for t, a, d, p in DAY)
    week = ''.join(f'<li><b>{E(d)}</b> {E(t)}</li>' for d, t in WEEK)
    msgs = ''.join(f'<li><b>{E(c)}</b><span>{E(m)}</span></li>' for c, m in MESSAGES)
    ladder = ''.join(f'<li><b>{E(s)}</b><span>{E(a)}</span></li>' for s, a in LADDER)
    loop = ''.join(f'<li><b>{E(s)}</b><span>{E(d)}</span></li>' for s, d in LOOP)
    admin = ''.join(f'<tr><td>{E(q)}</td><td><b>{E(w)}</b></td><td>{link(base, p, "Open")}</td></tr>' for q, w, p in ADMIN)
    decision = ''.join(f'<div class="pb-dec pb-dec-{d.lower()}"><b>{E(d)}</b><p>{E(w)}</p><p class="pb-then">{E(t)}</p></div>' for d, w, t in DECISION)

    return f'''
<header class="pb-cover" id="playbook">
  <div class="pb-glow" aria-hidden="true"></div>
  <img class="pb-net" src="{net}" alt="" aria-hidden="true">
  <div class="pb-brandrow">{brand.logo(30)}<span class="pb-doclabel">Feedback group playbook</span></div>
  <p class="eyebrow">Feedback group fg-2026-01 · for the project manager · 11 November 2026</p>
  <h1>Eight weeks to find out whether Aurelia <span class="pb-grad">gets people better</span></h1>
  <p class="lede">For the project manager who will recruit up to 30 people with different wellness problems and guide them every day, using Aurelia, from the problem to the healthy range. What each milestone is for, what you do, how you know it is passed, and where the admin shows it.</p>
  <div class="pb-journey" aria-label="Example: a sleep participant moving from moderate insomnia to no insomnia">
    <div class="pb-scale"><span class="pb-z pb-z1">No insomnia</span><span class="pb-z pb-z2">Subthreshold</span><span class="pb-z pb-z3">Moderate</span><span class="pb-z pb-z4">Severe</span></div>
    <div class="pb-track"><span class="pb-dot pb-start" style="left:62%">Week 0 · ISI 17</span><span class="pb-dot pb-end" style="left:18%">Week 8 · ISI 6</span></div>
    <p class="pb-caption">A win: “bad sleep → good sleep” means moving into the healthy band of their own questionnaire, not only a better score. Illustration, not data.</p>
  </div>
  <div class="status"><span class="chip">30 people · six issues</span><span class="chip">8 weeks + 3 to prepare</span><span class="chip">Source of truth: admin → Experimentation</span><span class="chip warn">AI analysis · Based on Claude self-analysis and deep research</span></div>
</header>

<h2 id="why">1. Why this matters</h2>
<p>This is the product-market-fit test for Aurelia. Everything built so far rests on one promise: that a person with a common wellness problem can describe it in a sentence and get better with sessions made for them. Until real people with real problems get better, that promise is a design. In eight weeks we will know whether it holds, for whom, and what has to change.</p>
<div class="grid2">
  <div class="card"><h3>People solve their issue</h3><p>They move from the problem range into the healthy range of their own questionnaire. That is a win, and it is what the study is for.</p></div>
  <div class="card"><h3>They keep using it</h3><p>Three or more sessions a week without being pushed harder each week. An effect without use is noise; use without effect is a finding.</p></div>
  <div class="card"><h3>They would miss it</h3><p>At least 40% would be “very disappointed” to lose Aurelia: the usual product-market-fit bar.</p></div>
</div>
<p class="note"><b>The hypothesis.</b> People with a common wellness problem who use Aurelia three or more times a week, with light daily guidance, move from the problem range into the healthy range of their own issue within eight weeks, and would be very disappointed to lose it. <b>What would disprove it:</b> people do not use it even with your guidance, or they use it and do not change, or they change and would not miss it.</p>

<h2 id="you">2. Your role</h2>
<div class="grid2">
  <div class="card"><h3>You are the guide, Aurelia does the work</h3><p>Your job is to keep people playing, listening and honest about how they feel. The sessions, the chapters and the changes come from Aurelia. When you are tempted to give advice, ask a question instead and pass what you heard to the product team.</p></div>
  <div class="card"><h3>You are the study's memory</h3><p>Every contact goes in the coaching log the same day. If it is not in the admin, it did not happen, and nobody can learn from it.</p></div>
  <div class="card"><h3>You are not a clinician</h3><p>You never interpret a score to a participant, never suggest stopping a treatment, and never handle a crisis alone. Safety goes to the study lead the same day.</p></div>
</div>

<h2 id="cohorts">3. Six issues, and what a win means for each</h2>
<p>Each person joins one cohort: the goal they choose in Aurelia's onboarding, and one validated questionnaire for it. Recruit to these numbers.</p>
<div class="table-wrap"><table><thead><tr><th>Cohort</th><th>App goal</th><th>Their questionnaire</th><th>Healthy band (a win)</th><th>Meaningful change</th><th>People</th></tr></thead><tbody>{cohorts}</tbody></table></div>
<p class="small">Everyone also answers WHO-5 (well-being, 0–100) every two weeks: a gain of 10 points is meaningful, and 28 or below is a cue for a person to follow up. A clinical advisor confirms the thresholds before week 0.</p>

<h2 id="timeline">4. The eleven weeks at a glance</h2>
<div class="pb-tl" role="img" aria-label="Timeline: M0 weeks minus 3 to minus 1, M1 week 0, M2 weeks 1 to 2, M3 weeks 3 to 4, M4 weeks 5 to 7, M5 weeks 8 to 9">
  <div class="pb-tl-head">{head}</div>
  <div class="pb-tl-bars">{bars}</div>
</div>
<p class="small">Questionnaires: WHO-5 at weeks 0, 2, 4, 6 and 8; the cohort measure and PHQ-9 at weeks 0, 4 and 8; interviews at weeks 0, 4 and 8. A check-in after every session.</p>

<h2 id="milestones">5. The six milestones</h2>
<p>Each milestone has a gate: the lines that say it is passed. The admin computes the same gates in <b>Version 2 → Milestones</b>, so you never have to work them out by hand.</p>
{ms}

<h2 id="rhythm">6. Your day and your week</h2>
<div class="pb-two">
  <div><h3>A day</h3><ol class="pb-day">{day}</ol></div>
  <div><h3>A week</h3><ul class="pb-week">{week}</ul>
    <h3 style="margin-top:20px">The daily message, by issue</h3><ul class="pb-msgs">{msgs}</ul>
    <p class="small">One question, about their own goal, at the time they chose. Never “did you do your session?”.</p></div>
</div>
<div class="pb-keep"><h3 style="margin-top:28px">When someone goes quiet</h3>
<ol class="pb-ladder">{ladder}</ol></div>

<h2 id="iterate">7. Testing and iterating with the product team</h2>
<p>The study is not only a measurement; it is how the product gets better while people use it. One loop, every week, and one significant change per half so its effect can be read.</p>
<ol class="pb-loop">{loop}</ol>
<div class="grid2">
  <div class="card"><h3>Rules for a change</h3><ul><li>At most one significant change in each half (M3, then M4 if needed).</li><li>Staging first, as a new design version, then the group.</li><li>The questionnaires and their timing never change.</li><li>Every change is written down with the date it reached the group.</li></ul></div>
  <div class="card"><h3>What a good finding looks like</h3><p>“Four of six in the sleep cohort stop the session halfway because the voice is too fast (P02, P04, P05, P06; coaching log 3–5 Nov).” Who, how many, their words, where it is written.</p></div>
</div>

<h2 id="admin">8. The admin is the source of truth</h2>
<p>Everything you need to run and judge the study is in <b>admin → Experimentation</b>. If a question is not answered there, tell the product team; that is a gap in the tool, not something to keep in a spreadsheet.</p>
<div class="table-wrap"><table><thead><tr><th>Your question</th><th>Where</th><th></th></tr></thead><tbody>{admin}</tbody></table></div>
<p class="note"><b>Today the admin shows sample data</b>, generated by the same rules the real data will use. The coaching log saves in your browser until the backend exists. Both are listed in the protocol as things to build before week 0.</p>

<h2 id="safety">9. Rules that never bend</h2>
<div class="grid2">
  <div class="card"><h3>Privacy</h3><ul><li>Pseudonymous ids (P01–P30) everywhere; names stay outside every tool.</li><li>No names or contact details in the coaching log.</li><li>Journal and wearable data only with their own consent.</li></ul></div>
  <div class="card"><h3>Safety</h3><ul><li>PHQ-9 item 9 above zero, WHO-5 of 28 or below, or any report of harm: the study lead calls the same day.</li><li>Crisis resources first, always.</li><li>Aurelia is not a treatment and never replaces one.</li></ul></div>
  <div class="card"><h3>Honesty</h3><ul><li>Pass lines are fixed before week 0.</li><li>People who leave stay in the count.</li><li>No claim that Aurelia caused a change: there is no control group.</li></ul></div>
</div>

<h2 id="decision">10. The decision at week 9</h2>
<div class="pb-decs">{decision}</div>

<h2 id="before">11. Before week 0</h2>
<div class="table-wrap"><table><thead><tr><th>Ready?</th><th>What</th><th>Who</th></tr></thead><tbody>
<tr><td>☐</td><td>Design, pass lines and this playbook approved</td><td>Product owner, Eugene</td></tr>
<tr><td>☐</td><td>Clinical advisor and ethics review; questionnaire licences (ISI, PSS-10)</td><td>Product owner</td></tr>
<tr><td>☐</td><td>Accounts that stay signed in; study enrolment and consent in the app</td><td>Product team</td></tr>
<tr><td>☐</td><td>Questionnaire screens with reminders; the safety alert to the study lead</td><td>Product team</td></tr>
<tr><td>☐</td><td>The admin on real data, including the coaching log</td><td>Product team</td></tr>
<tr><td>☐</td><td>30 people recruited, screened and consented; baseline calls booked</td><td>You</td></tr>
</tbody></table></div>

{protocol(proto_img)}

<div class="pb-close">{brand.mark(36)}<p><b>Aurelia</b> · sessions made for how you feel today</p></div>
<p class="pb-foot">The appendix is the study protocol (<code>docs/reviews/Aurelia-Feedback-Group-Study-2026-11-10.pdf</code>), read from its HTML. The milestones are computed in admin by <code>src/admin/data/study.ts</code>; this document is generated by <code>scripts/guides/pm_playbook.py</code>. AI analysis by Claude, based on its own analysis of the app and deep research.</p>
'''


# Styles shared by the standalone page and the app. `S` is the scope prefix.
def pb_css(S):
    return f'''
{S}.pb-cover {{ position: relative; padding-top: 4px; }}
{S}.pb-cover > *:not(.pb-glow):not(.pb-net) {{ position: relative; }}
{S}.pb-glow {{ position: absolute; top: -90px; right: -40px; width: 300px; height: 300px; border-radius: 50%; background: #FFE682; opacity: 0.55; filter: blur(80px); pointer-events: none; }}
{S}.pb-net {{ position: absolute; top: 18px; right: 0; width: 230px; height: auto; opacity: 0.95; pointer-events: none; }}
{S}.pb-brandrow {{ display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }}
{S}.pb-doclabel {{ font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pb-muted); padding-left: 12px; border-left: 1px solid var(--pb-line); }}
{S}.pb-cover h1 {{ margin-top: 8px; max-width: 16ch; }}
{S}.pb-grad {{ background: linear-gradient(95deg, #F2801A, #FCA22B); -webkit-background-clip: text; background-clip: text; color: transparent; }}
{S}h2 {{ border-top: 3px solid transparent; border-image: linear-gradient(90deg, #FF8514, #FFE270 60%, transparent) 1; }}
{S}.pb-close {{ display: flex; align-items: center; gap: 12px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--pb-line); }}
{S}.pb-close p {{ margin: 0; font-size: 14px; color: var(--pb-muted); }}
{S}.pb-close b {{ color: var(--pb-ink); }}
{S}.pb-journey {{ margin-top: 22px; background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 16px; padding: 16px 18px 12px; }}
{S}.pb-scale {{ display: grid; grid-template-columns: 7fr 7fr 7fr 7fr; border-radius: 999px; overflow: hidden; font-size: 11px; font-weight: 700; text-align: center; }}
{S}.pb-z {{ padding: 6px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
{S}.pb-z1 {{ background: var(--pb-good-soft); color: var(--pb-good); }}
{S}.pb-z2 {{ background: var(--pb-accent-soft); color: var(--pb-accent); }}
{S}.pb-z3 {{ background: var(--pb-warn-soft); color: var(--pb-warn); }}
{S}.pb-z4 {{ background: var(--pb-bad-soft); color: var(--pb-bad); }}
{S}.pb-track {{ position: relative; height: 46px; margin-top: 4px; }}
{S}.pb-track::before {{ content: ""; position: absolute; left: 20%; right: 38%; top: 13px; border-top: 2px dashed var(--pb-accent); }}
{S}.pb-dot {{ position: absolute; top: 4px; transform: translateX(-50%); font-size: 11.5px; font-weight: 700; white-space: nowrap; padding: 2px 8px; border-radius: 999px; }}
{S}.pb-start {{ background: var(--pb-surface); border: 1px solid var(--pb-warn); color: var(--pb-warn); }}
{S}.pb-end {{ background: var(--pb-good); color: #fff; }}
{S}.pb-caption {{ font-size: 12.5px; color: var(--pb-muted); margin: 0; }}
{S}.pb-tl {{ margin-top: 14px; overflow-x: auto; background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 14px; padding: 12px; }}
{S}.pb-tl-head, {S}.pb-tl-bars {{ display: grid; grid-template-columns: repeat(13, minmax(44px, 1fr)); gap: 4px; min-width: 620px; }}
{S}.pb-wk {{ font-size: 11px; color: var(--pb-muted); text-align: center; font-variant-numeric: tabular-nums; }}
{S}.pb-wk0 {{ color: var(--pb-ink); font-weight: 800; }}
{S}.pb-tl-bars {{ margin-top: 8px; grid-auto-rows: 34px; }}
{S}.pb-bar {{ display: flex; align-items: center; gap: 6px; padding: 0 10px; border-radius: 8px; font-size: 12px; text-decoration: none; color: var(--pb-ink); background: var(--pb-accent-soft); white-space: nowrap; overflow: visible; }}
{S}.pb-bar b {{ color: var(--pb-accent); }}
{S}.pb-m0 {{ grid-row: 1; background: var(--pb-band); }}
{S}.pb-m1 {{ grid-row: 2; }}
{S}.pb-m2 {{ grid-row: 3; }}
{S}.pb-m3 {{ grid-row: 4; background: var(--pb-warn-soft); }}
{S}.pb-m4 {{ grid-row: 5; }}
{S}.pb-m5 {{ grid-row: 6; background: var(--pb-good-soft); }}
{S}.pb-ms {{ margin-top: 18px; background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 16px; padding: 18px 20px; break-inside: avoid; }}
{S}.pb-ms > header {{ display: flex; gap: 14px; align-items: center; }}
{S}.pb-ms-id {{ display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: {brand.GRADIENT}; color: #2A1704; font-weight: 800; font-size: 15px; flex-shrink: 0; }}
{S}.pb-ms h3 {{ margin: 0; font-size: 19px; }}
{S}.pb-when {{ margin: 0; font-size: 13px; color: var(--pb-muted); }}
{S}.pb-goal {{ margin: 12px 0 0; font-size: 16px; font-weight: 600; }}
{S}.pb-ms-cols {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 12px; font-size: 14px; }}
{S}.pb-ms ul {{ margin: 6px 0 0; padding-left: 18px; }}
{S}.pb-ms li {{ margin: 4px 0; }}
{S}.pb-gate {{ margin-top: 14px; background: var(--pb-bg); border: 1px dashed var(--pb-line); border-radius: 12px; padding: 12px 14px; font-size: 14px; }}
{S}.pb-gate ul {{ list-style: none; padding: 0; }}
{S}.pb-gate li::before {{ content: "☐ "; color: var(--pb-accent); }}
{S}.pb-fail {{ margin: 8px 0 0; font-size: 13px; color: var(--pb-muted); max-width: none; }}
{S}.pb-admin {{ display: inline-block; margin-top: 8px; font-size: 13px; font-weight: 700; color: var(--pb-accent); text-decoration: none; }}
{S}.pb-admin:hover {{ text-decoration: underline; }}
{S}.pb-two {{ display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; margin-top: 12px; }}
{S}.pb-day {{ list-style: none; padding: 0; margin: 8px 0 0; border-left: 2px solid var(--pb-line); }}
{S}.pb-day li {{ display: grid; grid-template-columns: 112px 1fr; gap: 10px; padding: 8px 0 8px 14px; position: relative; font-size: 14px; }}
{S}.pb-day li::before {{ content: ""; position: absolute; left: -6px; top: 14px; width: 10px; height: 10px; border-radius: 50%; background: var(--pb-accent); }}
{S}.pb-day p {{ margin: 2px 0 0; color: var(--pb-muted); }}
{S}.pb-time {{ font-size: 12.5px; font-weight: 700; color: var(--pb-muted); font-variant-numeric: tabular-nums; }}
{S}.pb-week, {S}.pb-msgs {{ list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }}
{S}.pb-week b {{ display: inline-block; min-width: 92px; }}
{S}.pb-msgs li {{ display: grid; grid-template-columns: 96px 1fr; gap: 8px; }}
{S}.pb-msgs span {{ font-style: italic; color: var(--pb-ink); }}
{S}.pb-ladder {{ list-style: none; padding: 0; margin: 10px 0 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }}
{S}.pb-ladder li {{ display: flex; flex-direction: column; gap: 4px; padding: 12px; border-radius: 12px; background: var(--pb-surface); border: 1px solid var(--pb-line); font-size: 13px; }}
{S}.pb-ladder li:nth-child(4) {{ border-color: var(--pb-warn); }}
{S}.pb-ladder li:last-child {{ background: var(--pb-bad-soft); border-color: var(--pb-bad); }}
{S}.pb-ladder b {{ font-size: 13.5px; }}
{S}.pb-loop {{ list-style: none; padding: 0; margin: 14px 0 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; counter-reset: loop; }}
{S}.pb-loop li {{ position: relative; padding: 12px; border-radius: 12px; background: var(--pb-side); color: #f3e9de; font-size: 13px; display: flex; flex-direction: column; gap: 4px; counter-increment: loop; }}
{S}.pb-loop li b::before {{ content: counter(loop) " · "; color: #ffb46b; }}
{S}.pb-loop li span {{ color: #cdbca9; }}
{S}.pb-decs {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }}
{S}.pb-dec {{ border-radius: 14px; padding: 16px; border: 1px solid var(--pb-line); background: var(--pb-surface); }}
{S}.pb-dec b {{ font-size: 18px; }}
{S}.pb-dec p {{ margin: 6px 0 0; font-size: 14px; }}
{S}.pb-dec-go {{ border-top: 4px solid var(--pb-good); }}
{S}.pb-dec-iterate {{ border-top: 4px solid var(--pb-accent); }}
{S}.pb-dec-pivot {{ border-top: 4px solid var(--pb-bad); }}
{S}.pb-then {{ color: var(--pb-muted); }}
{S}.pb-foot {{ margin-top: 40px; font-size: 12.5px; color: var(--pb-muted); max-width: none; }}
{S}.small {{ font-size: 13px; color: var(--pb-muted); }}
{S}.pb-appendix {{ border-top-width: 6px; }}
{S}.pb-proto .kpis {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 18px; }}
{S}.pb-proto .kpi {{ background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 6px; min-width: 0; break-inside: avoid; }}
{S}.pb-proto .kpi .label {{ font-size: 13px; color: var(--pb-muted); line-height: 1.35; }}
{S}.pb-proto .kpi .to {{ font-size: 28px; font-weight: 800; }}
{S}.pb-proto .kpi .note {{ background: none; padding: 0; margin: 0; font-size: 12px; color: var(--pb-muted); }}
{S}.pb-proto .tag {{ display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }}
{S}.pb-proto .tag.done {{ background: var(--pb-good-soft); color: var(--pb-good); }}
{S}.pb-proto .tag.part {{ background: var(--pb-accent-soft); color: var(--pb-accent); }}
{S}.pb-proto .tag.todo {{ background: var(--pb-bad-soft); color: var(--pb-bad); }}
{S}.pb-proto .tag.design {{ background: var(--pb-band); color: var(--pb-ink); }}
{S}.pb-proto .answer {{ background: var(--pb-accent-soft); border-radius: 16px; padding: 16px 18px; margin-top: 18px; }}
{S}.pb-proto .answer p {{ max-width: none; }}
{S}.pb-proto td.num {{ font-variant-numeric: tabular-nums; white-space: nowrap; }}
{S}.pb-proto .timeline {{ display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 6px; margin-top: 16px; }}
{S}.pb-proto .timeline div {{ background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 10px; padding: 8px; font-size: 11px; line-height: 1.35; min-width: 0; }}
{S}.pb-proto .timeline b {{ display: block; font-size: 12px; color: var(--pb-accent); }}
{S}.pb-proto .timeline .key {{ border-color: var(--pb-accent); background: var(--pb-accent-soft); }}
{S}.pb-proto figure.wide {{ margin: 18px 0 0; break-inside: avoid; }}
{S}.pb-proto figure.wide img {{ width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid var(--pb-line); }}
{S}.pb-proto figure.wide figcaption {{ font-size: 13px; color: var(--pb-muted); margin-top: 8px; }}
{S}.pb-proto .pair {{ display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: 18px; align-items: start; margin-top: 18px; break-inside: avoid; }}
{S}.pb-proto .pair img {{ width: 100%; border-radius: 12px; border: 1px solid var(--pb-line); display: block; }}
{S}.pb-proto .next {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 16px; }}
{S}.pb-proto .next div {{ background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 14px; padding: 14px 16px; font-size: 14px; }}
{S}.pb-proto .next b {{ display: block; margin-bottom: 4px; font-size: 15px; }}
{S}.pb-proto .stack {{ display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }}
{S}.pb-proto ul.plain {{ margin: 10px 0 0; padding-left: 20px; }}
{S}.pb-proto ul.plain li {{ margin: 6px 0; }}
@media (max-width: 760px) {{
  {S}.pb-ms-cols, {S}.pb-two {{ grid-template-columns: 1fr; }}
  {S}.pb-ladder, {S}.pb-loop, {S}.pb-decs {{ grid-template-columns: 1fr; }}
  {S}.pb-day li {{ grid-template-columns: 1fr; gap: 2px; }}
  {S}.pb-scale {{ font-size: 9.5px; }}
  {S}.pb-net {{ position: static; display: block; width: 180px; margin: 0 0 12px auto; }}
  {S}.pb-proto .timeline {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }}
  {S}.pb-proto .pair {{ grid-template-columns: 1fr; }}
}}
'''


STANDALONE = '''<title>Feedback Group Playbook</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap">
<style>
/* Layout: one reading column, the protocol's palette; the timeline and milestone cards carry the plan. */
:root {
  --pb-bg: #FFFDF9; --pb-surface: #FFFFFF; --pb-ink: #2A1704; --pb-muted: #6F5E4D; --pb-line: #EADFD2;
  --pb-accent: #C25E0A; --pb-accent-soft: #FFF1DB; --pb-good: #1F7A4D; --pb-good-soft: #E7F5EC;
  --pb-warn: #A45A00; --pb-warn-soft: #FDEBCB; --pb-bad: #B4380C; --pb-bad-soft: #FDEDE6; --pb-band: #F3E9DC; --pb-side: #2A1704;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --pb-bg: #17110B; --pb-surface: #211910; --pb-ink: #F6EDE3; --pb-muted: #BBA894; --pb-line: #3A2E22;
  --pb-accent: #FF9A3D; --pb-accent-soft: #3A2712; --pb-good: #6FD39A; --pb-good-soft: #15301F;
  --pb-warn: #FFC266; --pb-warn-soft: #3A2A10; --pb-bad: #FF8A5C; --pb-bad-soft: #3A1C12; --pb-band: #2A2017; --pb-side: #0E0904; color-scheme: dark; } }
:root[data-theme="dark"] {
  --pb-bg: #17110B; --pb-surface: #211910; --pb-ink: #F6EDE3; --pb-muted: #BBA894; --pb-line: #3A2E22;
  --pb-accent: #FF9A3D; --pb-accent-soft: #3A2712; --pb-good: #6FD39A; --pb-good-soft: #15301F;
  --pb-warn: #FFC266; --pb-warn-soft: #3A2A10; --pb-bad: #FF8A5C; --pb-bad-soft: #3A1C12; --pb-band: #2A2017; --pb-side: #0E0904; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--pb-bg); color: var(--pb-ink); font: 16px/1.6 'Mulish', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
.wrap { max-width: 900px; margin: 0 auto; padding-block: 40px 72px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { text-wrap: balance; line-height: 1.2; }
h1 { font-size: clamp(30px, 5vw, 42px); font-weight: 800; letter-spacing: -0.01em; margin: 8px 0 0; }
h2 { font-size: 24px; font-weight: 800; margin: 56px 0 8px; padding-top: 20px; border-top: 2px solid var(--pb-ink); }
h3 { font-size: 17px; font-weight: 800; margin: 0 0 4px; }
h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--pb-muted); margin: 0; }
p { max-width: 68ch; margin: 10px 0 0; }
a { color: inherit; }
code { font-size: 0.86em; background: var(--pb-accent-soft); padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }
.eyebrow { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--pb-accent); }
.lede { font-size: 18px; color: var(--pb-muted); }
.status { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: var(--pb-surface); border: 1px solid var(--pb-line); }
.chip.warn { background: var(--pb-ink); color: var(--pb-bg); border-color: transparent; }
.chip.warn::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #E8770F; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 14px; }
.card { background: var(--pb-surface); border: 1px solid var(--pb-line); border-radius: 14px; padding: 16px 18px; break-inside: avoid; }
.card p { margin-top: 4px; font-size: 14.5px; }
.card ul { margin: 6px 0 0; padding-left: 18px; font-size: 14.5px; }
.note { background: var(--pb-accent-soft); border-radius: 14px; padding: 14px 18px; margin-top: 16px; max-width: none; }
.table-wrap { overflow-x: auto; margin-top: 14px; border: 1px solid var(--pb-line); border-radius: 14px; background: var(--pb-surface); }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pb-muted); padding: 10px 12px; border-bottom: 1px solid var(--pb-line); }
td { padding: 10px 12px; border-bottom: 1px solid var(--pb-line); vertical-align: top; }
tr:last-child td { border-bottom: 0; }
td.num { font-variant-numeric: tabular-nums; }
@page { size: A4; margin: 14mm 12mm; }
@media print {
  body { font-size: 13.5px; }
  .wrap { padding: 0; max-width: none; }
  h2 { break-after: avoid; }
  #milestones, #protocol { break-before: page; }
  .pb-proto figure.wide img { max-height: 218mm; width: auto; max-width: 100%; margin: 0 auto; }
  .pb-ms, .card, .pb-tl, .pb-journey, tr, .pb-ladder, .pb-loop, .pb-decs, .pb-keep { break-inside: avoid; }
  .pb-ms { padding: 12px 14px; margin-top: 10px; }
  .pb-ms-cols, .pb-gate { font-size: 12.5px; }
  .pb-ms li { margin: 2px 0; }
  .pb-goal { font-size: 14px; margin-top: 8px; }
}
''' + pb_css('') + '''
</style>
<main class="wrap">
''' + body('https://aureliaprod.vercel.app', PROTO_IMG_DIR, brand.network_uri()) + '''
</main>
'''

open(OUT, 'w').write(STANDALONE)
open(FRAG, 'w').write('<!-- GENERATED by scripts/guides/pm_playbook.py — do not edit. -->\n' + '<div class="pb">' + body('', '/guides/study/', '/guides/brand/aurelia-network.png') + '</div>')
open(FRAG_CSS, 'w').write('/* GENERATED by scripts/guides/pm_playbook.py — do not edit. */\n'
    '.gd { --pb-bg: var(--gd-bg); --pb-surface: var(--gd-surface); --pb-ink: var(--gd-ink); --pb-muted: var(--gd-muted); --pb-line: var(--gd-line);'
    ' --pb-accent: #C25E0A; --pb-accent-soft: var(--gd-accent-soft); --pb-good: var(--gd-ok); --pb-good-soft: var(--gd-ok-soft);'
    ' --pb-warn: #A45A00; --pb-warn-soft: #FDEBCB; --pb-bad: #B4380C; --pb-bad-soft: #FDEDE6; --pb-band: #F3E9DC; --pb-side: var(--gd-side); }\n'
    + pb_css('.gd-doc .pb ') + '.gd-doc .pb .pb-ms { scroll-margin-top: calc(var(--staging-bar, 0px) + var(--gd-top-h) + 16px); }\n')
print('written', len(STANDALONE))

# One file to send (WhatsApp, email): the standalone page with the screenshots
# embedded, wrapped in a full document so it opens straight from disk.
import base64
SHARE = os.path.join(ROOT, 'docs/share/Aurelia-Feedback-Group-Playbook.html')
def _inline(m):
    with open(os.path.join(ROOT, 'docs/reviews', m.group(1)), 'rb') as f:
        return 'src="data:image/jpeg;base64,' + base64.b64encode(f.read()).decode() + '"'
shared = re.sub(r'src="(' + PROTO_IMG_DIR + r'[^"]+\.jpg)"', _inline, STANDALONE)
shared = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
          + shared.replace('\n<main class="wrap">', '\n</head>\n<body>\n<main class="wrap">', 1) + '\n</body>\n</html>\n')
os.makedirs(os.path.dirname(SHARE), exist_ok=True)
open(SHARE, 'w').write(shared)
