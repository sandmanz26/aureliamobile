"""Generates the two newer versions of the feedback-group playbook for /guide.

v1 is the original (scripts/guides/pm_playbook.py). These are the same goal,
the same milestones and the same numbers, told two other ways:

  v2  Mission guide  full length, plain words, written as a mission for the PM
  v3  Quick start    one page, the essentials only

Every figure here must match v1 and src/admin/data/study.ts. Run from the
repo root:

    python3 scripts/guides/pm_playbook_versions.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTENT = os.path.join(ROOT, 'src/guides/content')
EXP = '/admin/experimentation'
V2 = '/admin/experimentation/v2'


def cover(label, eyebrow, title, grad, lede):
    return f"""<header class="pb-cover pbv-cover">
  <div class="pb-glow" aria-hidden="true"></div>
  <img class="pb-net" src="/guides/brand/aurelia-network.png" alt="" aria-hidden="true">
  <div class="pb-brandrow">{brand.logo(30)}<span class="pb-doclabel">{label}</span></div>
  <p class="pbv-eyebrow">{eyebrow}</p>
  <h1>{title} <span class="pb-grad">{grad}</span></h1>
  <p class="pbv-lede">{lede}</p>
</header>"""


TEAMS = [
    ('Bad sleep → good sleep', 'Sleep better', 'Insomnia Severity Index (ISI), 0–28', '7 or less', '6 points lower', 6),
    ('Anxious → calm', 'Feel calmer', 'GAD-7, 0–21', '4 or less', '4 points lower', 6),
    ('Mental fog → clarity', 'Clear my mind', 'PROMIS Cognitive Function', '45 or more', '5 points higher', 5),
    ('Low energy → energy', 'More energy', 'PROMIS Fatigue', '54 or less', '5 points lower', 5),
    ('Distracted → focused', 'Focus', 'PROMIS Cognitive Function', '45 or more', '5 points higher', 4),
    ('Stressed body → regulated', 'Regulate my body', 'Perceived Stress Scale (PSS-10), 0–40', '13 or less', '4 points lower', 4),
]

LEVELS = [
    ('M0', 'Gather the team', 'Three weeks before week 0',
     'Find 30 people with six different problems, get their consent, and get the tools ready.',
     ['Find 4–6 people for each of the six problems, from outside the team and outside anyone’s friends.',
      'Check each person with a short mood questionnaire (PHQ-9) and the exclusion list in the study protocol. Anyone who can’t join gets pointed to support, never just dropped.',
      'Take their consent and give each one a code name (P01–P30). Real names stay outside every tool.',
      'Book every first call, and agree each person’s daily time (for sleep: the evening).'],
     ['30 people signed up, every group filled', 'Ethics review and clinical advisor have said yes'],
     'Don’t start with fewer than 24. Recruit one more week rather than start a group with one person.'),
    ('M1', 'Day one', 'Week 0',
     'Measure everyone before they start, and get them listening within two days.',
     ['Collect WHO-5, their problem questionnaire and PHQ-9 before the first session. A “before” taken after is not a before.',
      'First interview (30 minutes): what the problem feels like, what they’ve tried, what “solved” would mean to them.',
      'Sit with each person for their first session: onboarding, their first sentence, the first play.',
      'Write their goal sentence in the coaching log. It’s what you’ll cheer them towards for eight weeks.'],
     ['Everyone has a “before” score (100%)', '9 in 10 played a first session in week 1'],
     'Anyone without a “before” score doesn’t count for results. Get it before they play again.'),
    ('M2', 'Build the habit', 'Weeks 1–2',
     'A daily rhythm: three or more sessions a week, a quick check-in after each.',
     ['One short message a day, at each person’s time. Ask, don’t lecture.',
      'Fewer than two sessions in a week? Call them: what got in the way, and one small change (shorter, earlier, another voice).',
      'Write every contact in their coaching log, the same day.',
      'Send WHO-5 at the end of week 2.'],
     ['7 in 10 did 3+ sessions in both weeks', 'WHO-5 answered by 85% or more'],
     'Below 7 in 10, we’re measuring who had time, not whether Aurelia helps. Fix what’s in the way before week 3.'),
    ('M3', 'Halfway check', 'Weeks 3–4',
     'See what’s working, and make one improvement for the second half.',
     ['Week 4: WHO-5, their problem questionnaire, PHQ-9 and the second interview, with everyone.',
      'Bring the three biggest findings to the product team, each with who it affects and their own words.',
      'When the change ships, tell everyone in one message: what changed and why.'],
     ['85% still in', '85% of due questionnaires collected', 'The improvement has reached the group'],
     'A disappointing week 4 isn’t a verdict. It’s exactly what the improvement is for.'),
    ('M4', 'The second half', 'Weeks 5–7',
     'Check whether the improvement helped, and adjust once more if it didn’t.',
     ['Keep the daily rhythm. People who are winning need less; people who are stuck need a call a week.',
      'Send WHO-5 at week 6.',
      'Follow up every safety alert the same day (the admin flags it for you), and write down what you did.'],
     ['6 in 10 stay regular (3+ sessions in 60% of weeks)', 'Every safety alert handled the same day'],
     'If people drift off in the second half, ask them why on a call before changing anything else.'),
    ('M5', 'The finish line', 'Weeks 8–9',
     'The final read, and the big decision: go, try again, or rethink.',
     ['Week 8: WHO-5, their problem questionnaire, PHQ-9, “would you miss it?” and the third interview.',
      'Write one story per group: where the person started and what changed, in their words, with their consent.',
      'Present the result in week 9 against the finish lines set before week 0.'],
     ['Half gain 10+ WHO-5 points', '4 in 10 reach a real improvement in their own problem', '7 in 10 still in',
      '85% of data collected', '4 in 10 would be “very disappointed” to lose Aurelia'],
     'The finish lines were set before week 0. Moving them after seeing the data turns a study into a story.'),
]

MESSAGES = [
    ('Bad sleep', 'Morning! How did last night go: roughly how long to fall asleep, and did you wake up?'),
    ('Anxious', 'How is your day feeling, 1 to 5? Did the session before your meeting help, or not really?'),
    ('Mental fog', 'Did you get a clear hour today? What did you play before it?'),
    ('Low energy', 'How was your energy this afternoon compared with yesterday?'),
    ('Distracted', 'How long did your longest focused stretch last today?'),
    ('Stressed body', 'Where do you feel it today? Did the breathing chapter change anything?'),
]


def li(xs):
    return ''.join(f'<li>{x}</li>' for x in xs)


def levels_v2():
    out = []
    for i, (m, name, when, quest, moves, gate, stuck) in enumerate(LEVELS):
        out.append(f"""<section class="pbv-level">
  <div class="pbv-level-head"><span class="pbv-badge">Level {i}</span><div><h3>{name}</h3><p class="pbv-when">{when} · milestone {m}</p></div></div>
  <p class="pbv-quest">{quest}</p>
  <div class="pbv-level-grid">
    <div><b>Your moves</b><ul>{li(moves)}</ul></div>
    <div class="pbv-made"><b>You’ve made it when</b><ul class="pbv-ticks">{li(gate)}</ul></div>
  </div>
  <p class="pbv-stuck"><b>Stuck?</b> {stuck}</p>
</section>""")
    return '\n'.join(out)


V2_HTML = f"""<!-- GENERATED by scripts/guides/pm_playbook_versions.py — do not edit. -->
<div class="pb pbv">
{cover('Mission guide', 'Feedback group · playbook version 2', 'Your mission: help 30 people', 'win back a healthier life', 'For eight weeks you’ll guide 30 people, each with a real problem like bad sleep or anxiety, as they use Aurelia. If they get better, and would miss it, Aurelia works. This guide is everything you need, in plain words.')}

<h2>New here? Start with these three things</h2>
<div class="pbv-start">
  <div><b>1. What Aurelia is</b><span>An app where a person types one sentence about how they feel (“I can’t switch off at night”) and gets a personal audio session made for it, in about a minute. They listen, tap how they feel afterwards, and the next session (a “chapter”) adapts. That’s all a participant does.</span></div>
  <div><b>2. What this study is</b><span>30 real people with six common problems use Aurelia for eight weeks. You check in with them every day. At the end we know whether Aurelia actually helps.</span></div>
  <div><b>3. Try it yourself first</b><span>Before you talk to anyone, use Aurelia for three days with a problem of your own. You can’t guide people through something you haven’t felt.</span></div>
</div>

<h3>Who’s who</h3>
<table><thead><tr><th>Person</th><th>What they do</th><th>Go to them when</th></tr></thead><tbody>
<tr><td><b>You (project manager)</b></td><td>Recruit, check in daily, write everything down</td><td>–</td></tr>
<tr><td><b>Study lead</b></td><td>Owns safety and the study’s rules</td><td>Anyone might be at risk, or you’re unsure if something is allowed. <b>Same day, always.</b></td></tr>
<tr><td><b>Product team</b></td><td>Builds and changes the Aurelia app and the admin</td><td>Something in the app blocks people, or you spot a pattern</td></tr>
<tr><td><b>Clinical advisor</b></td><td>A health professional who checks the questionnaires and the safety process</td><td>Through the study lead, not directly</td></tr>
<tr><td><b>Product owner</b></td><td>Approves the plan and makes the final call in week 9</td><td>Approvals before week 0, and the week 9 result</td></tr>
</tbody></table>
<p class="pbv-small">Names and contact details for each role are confirmed before week 0 (see “Ready for week 0?”).</p>

<h2>The mission in one minute</h2>
<div class="pbv-wins">
  <div><span class="pbv-num">1</span><b>They get better</b><span>They move into the healthy range of their own questionnaire. That’s the win we’re here for.</span></div>
  <div><span class="pbv-num">2</span><b>They keep coming back</b><span>Three or more sessions a week, without being pushed harder each week.</span></div>
  <div><span class="pbv-num">3</span><b>They’d miss it</b><span>At least 4 in 10 would be “very disappointed” to lose Aurelia.</span></div>
</div>
<p class="pbv-believe"><b>What we believe:</b> people with a common wellness problem who use Aurelia three times a week, with a little daily support from you, reach the healthy range of their problem within eight weeks, and would hate to lose it.</p>
<p class="pbv-believe pbv-soft"><b>How we’d know we’re wrong (and that’s useful too):</b> people don’t use it even with your support; or they use it and don’t change; or they change but wouldn’t miss it.</p>

<h2>Your role</h2>
<div class="pbv-roles">
  <div><b>🧭 The guide</b><span>Aurelia makes the sessions and the chapters. You keep people listening and honest about how they feel. Tempted to give advice? Ask a question instead, and pass on what you hear.</span></div>
  <div><b>📓 The keeper of the story</b><span>Every contact goes in the coaching log the same day. If it isn’t in the admin, nobody can learn from it.</span></div>
  <div><b>🛟 Not the doctor</b><span>Never explain a score to a participant, never suggest stopping a treatment, never handle a crisis alone. Safety goes to the study lead the same day.</span></div>
</div>

<h2>The six teams</h2>
<p>Each person joins one team: the goal they pick in Aurelia’s onboarding, and one short questionnaire that measures it. Recruit to these numbers.</p>
<table>
<thead><tr><th>Team</th><th>Goal in the app</th><th>Measured with</th><th>Finish line (healthy)</th><th>A real step forward</th><th>People</th></tr></thead>
<tbody>{''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td><td>{f}</td></tr>' for a, b, c, d, e, f in TEAMS)}</tbody>
</table>
<p class="pbv-small">Everyone also answers WHO-5 (well-being, 0–100) every two weeks. A gain of 10 points is a real step; 28 or below means a person follows up with them. A clinical advisor confirms these lines before week 0.</p>
<div class="pbv-example-card">
  <b>How to read the table: Maya, in the sleep team</b> <span class="pbv-small">(an example, not a real person)</span>
  <ol>
    <li><b>Week 0:</b> her sleep questionnaire (ISI) scores <b>18</b>. That’s moderate insomnia.</li>
    <li><b>Week 4:</b> she scores <b>12</b>. That’s 6 points lower: a <b>real step forward</b>. Tell the product team what’s working.</li>
    <li><b>Week 8:</b> she scores <b>6</b>. That’s 7 or less: she’s crossed the <b>finish line</b>. That’s a win.</li>
  </ol>
  <span class="pbv-small">You never have to calculate this yourself: the admin does it. And you never tell Maya her score means anything; that’s for the study, not for her.</span>
</div>
<h3>What the questionnaires are, in plain words</h3>
<table><thead><tr><th>Name</th><th>What it asks about</th><th>Who answers it</th></tr></thead><tbody>
<tr><td><b>WHO-5</b></td><td>Overall well-being: five short questions about the last two weeks</td><td>Everyone, every two weeks</td></tr>
<tr><td><b>PHQ-9</b></td><td>Low mood. Its last question asks about thoughts of self-harm, which is why it matters for safety</td><td>Everyone, weeks 0, 4 and 8</td></tr>
<tr><td><b>ISI</b></td><td>How bad sleep problems are</td><td>Sleep team</td></tr>
<tr><td><b>GAD-7</b></td><td>How often anxiety shows up</td><td>Anxious team</td></tr>
<tr><td><b>PROMIS</b></td><td>Thinking clearly and focus (Cognitive Function), or tiredness (Fatigue)</td><td>Fog, focus and energy teams</td></tr>
<tr><td><b>PSS-10</b></td><td>How stressed life has felt</td><td>Stressed body team</td></tr>
</tbody></table>
<p class="pbv-small">People fill them in inside the app; you only chase the ones that are late.</p>

<h2>The journey: six levels in eleven weeks</h2>
<div class="pbv-road">
  <span>−3 to −1<br><b>Gather</b></span><span>W0<br><b>Day one</b></span><span>W1–2<br><b>Habit</b></span><span>W3–4<br><b>Halfway</b></span><span>W5–7<br><b>Second half</b></span><span>W8–9<br><b>Finish</b></span>
</div>
<p class="pbv-small">Questionnaires: WHO-5 at weeks 0, 2, 4, 6 and 8; their problem questionnaire and PHQ-9 at weeks 0, 4 and 8; interviews at weeks 0, 4 and 8; a quick check-in after every session. The admin works out every “made it” line for you in <a href="{V2}">Experimentation → Milestones</a>.</p>
{levels_v2()}

<h2>A day in your shoes</h2>
<div class="pbv-day">
  <div><b>08:30</b><span>Open <a href="{V2}">This week</a>: calls first, then anyone you haven’t reached in two days, then missing questionnaires.</span></div>
  <div><b>09:00–11:00</b><span>Calls and follow-ups. Safety alerts always come first.</span></div>
  <div><b>Their time</b><span>One short message about their own goal (below).</span></div>
  <div><b>Same day</b><span>Log it on their page: what they said, how they feel (1–5), the next step.</span></div>
  <div><b>16:30</b><span>Five-minute look at Wins and Engagement: who moved, who went quiet.</span></div>
</div>
<h3>Your week</h3>
<ul class="pbv-ticks">
  <li><b>Monday:</b> which level is next, and is it on track?</li>
  <li><b>Wednesday:</b> call everyone who did fewer than two sessions last week.</li>
  <li><b>Friday:</b> 30 minutes with the product team, the three biggest findings and who they affect.</li>
  <li><b>Every other week:</b> WHO-5 goes out; chase it within 48 hours.</li>
</ul>
<h3>The daily message</h3>
<div class="pbv-msgs">{''.join(f'<div><b>{t}</b><span>“{m}”</span></div>' for t, m in MESSAGES)}</div>
<p class="pbv-small">One question, about their own goal, at the time they chose, on the channel you agreed with them (WhatsApp, SMS or email; it’s decided before week 0). Never “did you do your session?”.</p>
<h3>What to say when…</h3>
<table><thead><tr><th>They say</th><th>You say</th></tr></thead><tbody>
<tr><td>“Should I stop my sleeping pills / therapy?”</td><td>“That’s one for your doctor. Aurelia isn’t a treatment and doesn’t replace one.”</td></tr>
<tr><td>“Is my score good?”</td><td>“The scores are for the study, so I can’t read them for you. How do <i>you</i> feel it’s going?”</td></tr>
<tr><td>“The app keeps doing something annoying.”</td><td>“Thank you, that’s exactly what we need to hear.” Then log it and pass it to the product team on Friday.</td></tr>
<tr><td>“I don’t have time this week.”</td><td>“What if you tried a shorter one, at a different time?” One small change, no pressure.</td></tr>
<tr><td>Anything that worries you about their safety</td><td>Stop coaching. Share crisis resources now. Tell the study lead the same day.</td></tr>
</tbody></table>
<h3>When someone drifts away</h3>
<table><thead><tr><th>What happens</th><th>What you do</th></tr></thead><tbody>
<tr><td>Missed a day</td><td>Your usual message. No comment on the miss.</td></tr>
<tr><td>Not reached for 2 days</td><td>A second message, then a short call.</td></tr>
<tr><td>Fewer than 2 sessions in a week</td><td>A call: what got in the way, and one small change.</td></tr>
<tr><td>Two questionnaires missed</td><td>A call, and offer to fill it in together.</td></tr>
<tr><td><b>Any sign of crisis or harm</b></td><td><b>Stop coaching. Crisis resources now, and the study lead the same day. Never alone.</b></td></tr>
</tbody></table>

<h2>Making Aurelia better, together</h2>
<p>The study isn’t only a test. It’s how Aurelia gets better while people use it. One loop, every week:</p>
<div class="pbv-loop"><span><b>Listen</b> coaching log, interviews, check-ins</span><span><b>Pick</b> how many it hits × how much it stops them</span><span><b>Change</b> one change, on staging first</span><span><b>Tell</b> participants what changed and why</span><span><b>Check</b> same measures, before and after</span></div>
<ul class="pbv-ticks">
  <li>At most one big change in each half (halfway, then once more if needed).</li>
  <li>The questionnaires and their timing never change.</li>
  <li>Every change is written down with the date it reached the group.</li>
</ul>
<p class="pbv-example"><b>A great finding sounds like:</b> “Four of six in the sleep team stop the session halfway because the voice is too fast (P02, P04, P05, P06; coaching log 3–5 Nov).” Who, how many, their words, where it’s written.</p>

<h2>Your dashboard</h2>
<p>Everything lives in <a href="{EXP}">admin → Experimentation</a>. If a question isn’t answered there, tell the product team: that’s a gap in the tool, not a reason for a spreadsheet.</p>
<table><thead><tr><th>Your question</th><th>Where</th></tr></thead><tbody>
<tr><td>Which level are we on, and is it on track?</td><td><a href="{V2}">Milestones</a></td></tr>
<tr><td>What do I do today?</td><td><a href="{V2}">This week</a></td></tr>
<tr><td>Who has won?</td><td><a href="{V2}">Wins</a></td></tr>
<tr><td>Is using it going with getting better?</td><td><a href="{V2}">Engagement</a></td></tr>
<tr><td>How is this one person doing?</td><td><a href="{EXP}/P01">Their page</a>: measures, sessions, coaching log</td></tr>
<tr><td>Is any data missing?</td><td><a href="{EXP}">Data &amp; safety</a></td></tr>
</tbody></table>
<p class="pbv-small">Today the admin shows sample data made by the same rules the real data will use, and the coaching log saves in your browser until the backend exists.</p>
<h3>Words you’ll hear</h3>
<dl class="pbv-gloss">
  <dt>Admin</dt><dd>The team’s website for running Aurelia. The study lives in its Experimentation section.</dd>
  <dt>Coaching log</dt><dd>Your notes on each person, on their page in the admin.</dd>
  <dt>Check-in</dt><dd>The quick “how do you feel now?” a person taps after each session.</dd>
  <dt>Code name</dt><dd>P01–P30, used instead of real names everywhere.</dd>
  <dt>Staging</dt><dd>The test copy of Aurelia where the product team tries a change before real participants see it.</dd>
  <dt>Finish line</dt><dd>The healthy range of someone’s questionnaire, and the pass lines for week 9. Both are fixed before week 0 and never moved.</dd>
  <dt>Regular</dt><dd>Three or more sessions in at least 6 of every 10 weeks.</dd>
</dl>

<h2>The promises we always keep</h2>
<div class="pbv-promises">
  <div><b>Privacy</b><ul>{li(['Code names (P01–P30) everywhere; real names stay outside every tool.', 'No names or contact details in the coaching log.', 'Journal and wearable data only with their own consent.'])}</ul></div>
  <div><b>Safety</b><ul>{li(['If someone answers anything other than “not at all” to the self-harm question in PHQ-9, scores 28 or less on WHO-5, or tells you about any harm: the study lead calls them the same day.', 'Crisis resources first, always.', 'Aurelia is not a treatment and never replaces one.'])}</ul></div>
  <div><b>Honesty</b><ul>{li(['Finish lines are fixed before week 0.', 'People who leave stay in the count.', 'We never claim Aurelia caused a change: there is no control group.'])}</ul></div>
</div>

<h2>Week 9: the big moment</h2>
<div class="pbv-decide">
  <div class="go"><b>Go 🚀</b><span>Most finish lines met, including “their own problem improves” and “would miss it”. Plan a proper trial and open a wider beta for the teams that won.</span></div>
  <div class="again"><b>Try again 🔁</b><span>People use it and stay, but results fall short. Another eight weeks on the same design, with the changes the data points to.</span></div>
  <div class="rethink"><b>Rethink 🧭</b><span>People don’t use it even with daily support, or wouldn’t miss it. Stop and rethink the core before building more.</span></div>
</div>

<h2>Your first week on the job</h2>
<ol class="pbv-three">
  <li><b>Day 1:</b> use Aurelia yourself, with a real problem of your own. Keep going all week.</li>
  <li><b>Day 1:</b> open <a href="/admin/experimentation">admin → Experimentation</a> and click through every tab with the sample data.</li>
  <li><b>Day 2:</b> meet the study lead: safety process, crisis resources, how to reach them fast.</li>
  <li><b>Day 3:</b> read Version 1 of this playbook once, including the protocol appendix. You don’t need to remember it, just know where things are.</li>
  <li><b>Day 4:</b> agree with the product owner where to find participants, and the channel for daily messages.</li>
  <li><b>Day 5:</b> walk through the checklist below and mark what’s missing.</li>
</ol>

<h2>Ready for week 0?</h2>
<ul class="pbv-check">
  <li>The plan, the finish lines and this playbook approved <em>Product and business owners</em></li>
  <li>Clinical advisor, ethics review, questionnaire licences (ISI, PSS-10) <em>Product owner</em></li>
  <li>Accounts that stay signed in; study sign-up and consent in the app <em>Product team</em></li>
  <li>Questionnaire screens with reminders; the safety alert to the study lead <em>Product team</em></li>
  <li>The admin on real data, including the coaching log <em>Product team</em></li>
  <li>Names and contacts for the study lead, product team and clinical advisor; the daily-message channel <em>Product owner</em></li>
  <li>30 people recruited, checked and consented; first calls booked <em>You</em></li>
</ul>

<div class="pbv-send">
  <b>Thirty people. Eight weeks. One question: does Aurelia help?</b>
  <span>You’re the person who finds out. Go win it for them.</span>
</div>
<p class="pbv-small">The full study protocol (measures, data, safety, analysis) is the appendix of <b>Version 1</b> of this playbook.</p>
</div>
"""


V3_HTML = f"""<!-- GENERATED by scripts/guides/pm_playbook_versions.py — do not edit. -->
<div class="pb pbv pbv-short">
{cover('Quick start', 'Feedback group · playbook version 3', 'The playbook', 'on one page', 'Eight weeks. 30 people. Six common problems. Your job: help them get better with Aurelia, and find out if it works. The detail is in versions 1 and 2.')}

<p class="pbv-oneline"><b>Aurelia in one line:</b> a person types how they feel, gets a personal audio session in about a minute, listens, and taps how they feel after. Each next session adapts.</p>

<h2>The goal</h2>
<div class="pbv-wins">
  <div><span class="pbv-num">1</span><b>They get better</b><span>Into the healthy range of their own questionnaire. Example: a sleep score from 18 to 7 or less.</span></div>
  <div><span class="pbv-num">2</span><b>They keep using it</b><span>3+ sessions a week.</span></div>
  <div><span class="pbv-num">3</span><b>They’d miss it</b><span>4 in 10 “very disappointed” without it.</span></div>
</div>

<h2>Your three jobs</h2>
<ol class="pbv-three">
  <li><b>Keep them listening.</b> One friendly question a day about their own goal.</li>
  <li><b>Write it down.</b> Every contact in the coaching log, the same day.</li>
  <li><b>Keep them safe.</b> Any sign of crisis: crisis resources now, the study lead (who owns safety) the same day. Never alone.</li>
</ol>
<p class="pbv-small">Not your job: giving health advice, reading scores to people, or changing the app. Pass app problems to the product team.</p>

<h2>Six checkpoints</h2>
<table><thead><tr><th>When</th><th>Checkpoint</th><th>You’ve made it when</th></tr></thead><tbody>
<tr><td>Weeks −3 to −1</td><td><b>Gather the team</b></td><td>30 people consented, all six groups filled</td></tr>
<tr><td>Week 0</td><td><b>Day one</b></td><td>Everyone measured first; 9 in 10 play in week 1</td></tr>
<tr><td>Weeks 1–2</td><td><b>Build the habit</b></td><td>7 in 10 do 3+ sessions a week</td></tr>
<tr><td>Weeks 3–4</td><td><b>Halfway check</b></td><td>85% still in; one improvement shipped</td></tr>
<tr><td>Weeks 5–7</td><td><b>Second half</b></td><td>6 in 10 still use it most weeks; every safety alert same day</td></tr>
<tr><td>Weeks 8–9</td><td><b>Finish line</b></td><td>You present the results; the product owner decides: go, try again or rethink</td></tr>
</tbody></table>

<h2>Your day</h2>
<ul class="pbv-ticks">
  <li><b>Morning:</b> open <a href="{V2}">This week</a> in the admin (the team’s website). Safety alerts first, then calls.</li>
  <li><b>Their time:</b> one short message. Never “did you do your session?”.</li>
  <li><b>Fewer than 2 sessions in a week:</b> a call, and one small change.</li>
  <li><b>Same day:</b> write what they said and how they feel (1–5) in their coaching log, on their page in the admin.</li>
  <li><b>Friday:</b> the three biggest findings to the product team.</li>
</ul>

<h2>Start here</h2>
<ol class="pbv-three">
  <li>Use Aurelia yourself for three days.</li>
  <li>Click through admin → Experimentation with the sample data.</li>
  <li>Meet the study lead about safety, then read version 2 of this playbook.</li>
</ol>

<h2>Always</h2>
<div class="pbv-always">
  <span>Code names only (P01–P30)</span><span>Crisis resources first</span><span>Aurelia is not a treatment</span><span>Finish lines never move</span><span>People who leave still count</span>
</div>

<div class="pbv-send">
  <b>Help 30 people feel better, and learn what makes Aurelia work.</b>
  <span>Everything you need is in <a href="{EXP}">admin → Experimentation</a>.</span>
</div>
</div>
"""

CSS = """/* GENERATED by scripts/guides/pm_playbook_versions.py — do not edit. */
.gd-doc .pbv .pbv-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #C25E0A; margin: 0 0 6px; }
.gd-doc .pbv .pbv-cover h1 { max-width: 15ch; }
.gd-doc .pbv .pbv-lede { font-size: 17px; color: var(--gd-muted); max-width: 56ch; }
.gd-doc .pbv .pbv-small { font-size: 14px; color: var(--gd-muted); }
.gd-doc .pbv a { color: #C25E0A; text-decoration: underline; text-underline-offset: 2px; }
.gd-doc .pbv .pbv-wins, .gd-doc .pbv .pbv-roles, .gd-doc .pbv .pbv-promises, .gd-doc .pbv .pbv-decide, .gd-doc .pbv .pbv-msgs { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 14px 0; }
.gd-doc .pbv .pbv-wins > div, .gd-doc .pbv .pbv-roles > div, .gd-doc .pbv .pbv-promises > div, .gd-doc .pbv .pbv-decide > div, .gd-doc .pbv .pbv-msgs > div { background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 14px; padding: 14px 16px; display: grid; align-content: start; gap: 4px; }
.gd-doc .pbv .pbv-wins span:not(.pbv-num), .gd-doc .pbv .pbv-roles span, .gd-doc .pbv .pbv-decide span, .gd-doc .pbv .pbv-msgs span { font-size: 15px; color: var(--gd-muted); }
.gd-doc .pbv .pbv-num { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-weight: 600; color: #fff; background: linear-gradient(135deg, #FF8514, #FFB347); margin-bottom: 4px; }
.gd-doc .pbv .pbv-believe { background: var(--gd-accent-soft); border-radius: 12px; padding: 12px 16px; }
.gd-doc .pbv .pbv-soft { background: var(--gd-surface); border: 1px solid var(--gd-line); }
.gd-doc .pbv .pbv-road { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin: 14px 0 6px; }
.gd-doc .pbv .pbv-road span { text-align: center; font-size: 12px; color: var(--gd-muted); padding: 8px 4px; border-radius: 10px; background: var(--gd-accent-soft); }
.gd-doc .pbv .pbv-road b { color: var(--gd-ink); font-size: 13.5px; }
.gd-doc .pbv .pbv-level { border: 1px solid var(--gd-line); border-radius: 16px; background: var(--gd-surface); padding: 16px 18px; margin: 14px 0; }
.gd-doc .pbv .pbv-level-head { display: flex; gap: 12px; align-items: center; }
.gd-doc .pbv .pbv-level-head h3 { margin: 0; }
.gd-doc .pbv .pbv-badge { flex: none; font-size: 12px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #FF8514, #FFB347); border-radius: 999px; padding: 4px 10px; }
.gd-doc .pbv .pbv-when { margin: 0; font-size: 13.5px; color: var(--gd-muted); }
.gd-doc .pbv .pbv-quest { font-size: 16px; margin: 10px 0; }
.gd-doc .pbv .pbv-level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.gd-doc .pbv .pbv-level-grid ul { margin: 6px 0 0; padding-left: 18px; font-size: 15px; }
.gd-doc .pbv .pbv-made { background: var(--gd-ok-soft); border-radius: 12px; padding: 10px 12px; }
.gd-doc .pbv .pbv-made > b { color: var(--gd-ok); }
.gd-doc .pbv .pbv-ticks { list-style: none; padding-left: 0; }
.gd-doc .pbv .pbv-ticks li { position: relative; padding-left: 24px; margin: 6px 0; }
.gd-doc .pbv .pbv-ticks li::before { content: "✓"; position: absolute; left: 2px; color: var(--gd-ok); font-weight: 600; }
.gd-doc .pbv .pbv-stuck { font-size: 15px; color: var(--gd-muted); margin: 10px 0 0; }
.gd-doc .pbv .pbv-day { display: grid; gap: 8px; margin: 12px 0; }
.gd-doc .pbv .pbv-day > div { display: grid; grid-template-columns: 110px 1fr; gap: 12px; align-items: baseline; padding: 8px 0; border-bottom: 1px dashed var(--gd-line); }
.gd-doc .pbv .pbv-day b { color: #C25E0A; font-variant-numeric: tabular-nums; }
.gd-doc .pbv .pbv-loop { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.gd-doc .pbv .pbv-loop span { flex: 1 1 150px; background: var(--gd-accent-soft); border-radius: 12px; padding: 10px 12px; font-size: 14px; color: var(--gd-muted); }
.gd-doc .pbv .pbv-loop b { display: block; color: var(--gd-ink); font-size: 15px; }
.gd-doc .pbv .pbv-example { border-left: 3px solid #F1C46A; padding: 8px 14px; background: var(--gd-surface); border-radius: 8px; }
.gd-doc .pbv .pbv-promises ul { margin: 6px 0 0; padding-left: 18px; font-size: 15px; }
.gd-doc .pbv .pbv-decide .go { background: var(--gd-ok-soft); }
.gd-doc .pbv .pbv-decide .again { background: #FDEBCB; }
.gd-doc .pbv .pbv-decide .rethink { background: #FDEDE6; }
.gd-doc .pbv .pbv-check { list-style: none; padding: 0; }
.gd-doc .pbv .pbv-check li { padding: 8px 0 8px 30px; position: relative; border-bottom: 1px solid var(--gd-line); }
.gd-doc .pbv .pbv-check li::before { content: ""; position: absolute; left: 2px; top: 11px; width: 16px; height: 16px; border: 2px solid #F1C46A; border-radius: 4px; }
.gd-doc .pbv .pbv-check em { display: block; font-style: normal; font-size: 13.5px; color: var(--gd-muted); }
.gd-doc .pbv .pbv-send { margin: 40px 0 16px; padding: 22px 22px; border-radius: 18px; background: linear-gradient(135deg, #FF8514 0%, #FFB347 55%, #FFE270 100%); color: #3C2405; display: grid; gap: 6px; }
.gd-doc .pbv .pbv-send b { font-size: 20px; line-height: 1.3; }
.gd-doc .pbv .pbv-send a { color: #3C2405; }
.gd-doc .pbv .pbv-three { padding-left: 20px; }
.gd-doc .pbv .pbv-three li { margin: 8px 0; }
.gd-doc .pbv .pbv-start { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 14px 0; }
.gd-doc .pbv .pbv-start > div { background: var(--gd-accent-soft); border-radius: 14px; padding: 14px 16px; display: grid; align-content: start; gap: 4px; }
.gd-doc .pbv .pbv-start span { font-size: 15px; color: var(--gd-ink); }
.gd-doc .pbv .pbv-example-card { background: var(--gd-surface); border: 1px dashed #F1C46A; border-radius: 14px; padding: 14px 16px; margin: 14px 0; }
.gd-doc .pbv .pbv-example-card ol { margin: 8px 0; padding-left: 20px; }
.gd-doc .pbv .pbv-example-card li { margin: 4px 0; }
.gd-doc .pbv .pbv-gloss { display: grid; grid-template-columns: 130px 1fr; gap: 6px 14px; margin: 10px 0; font-size: 15px; }
.gd-doc .pbv .pbv-gloss dt { font-weight: 600; }
.gd-doc .pbv .pbv-gloss dd { margin: 0; color: var(--gd-muted); }
.gd-doc .pbv .pbv-oneline { background: var(--gd-accent-soft); border-radius: 12px; padding: 12px 16px; }
.gd-doc .pbv .pbv-always { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.gd-doc .pbv .pbv-always span { background: var(--gd-ok-soft); color: var(--gd-ok); font-weight: 600; font-size: 14px; border-radius: 999px; padding: 6px 12px; }
@media (max-width: 640px) {
  .gd-doc .pbv .pbv-road { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gd-doc .pbv .pbv-day > div { grid-template-columns: 1fr; gap: 2px; }
  .gd-doc .pbv .pbv-gloss { grid-template-columns: 1fr; gap: 2px; }
  .gd-doc .pbv .pbv-gloss dd { margin-bottom: 8px; }
}
"""

for name, text in (('pm-playbook-v2.html', V2_HTML), ('pm-playbook-v3.html', V3_HTML), ('pm-playbook-versions.css', CSS)):
    with open(os.path.join(CONTENT, name), 'w') as f:
        f.write(text)
print('wrote v2, v3 and css')
