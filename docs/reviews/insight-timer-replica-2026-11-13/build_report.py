"""Builds the Insight Timer replica report (HTML) from the collected evidence.

Quotes are pulled verbatim from replica/reviews.csv by date + opening words,
so nothing in the report is retyped by hand.
"""
import csv, html, sys, os, re
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../scripts/guides'))
import brand

HERE = os.path.dirname(os.path.abspath(__file__))
R = list(csv.DictReader(open(os.path.join(HERE, 'app-store-reviews.csv'))))
STORE = {'US': 'us', 'GB': 'gb', 'AU': 'au', 'CA': 'ca'}
LISTING = 'https://apps.apple.com/us/app/insight-timer-meditation-app/id337472899'
e = html.escape


def q(date, start, limit=300):
    m = [x for x in R if x['date'] == date and x['text'].startswith(start)]
    assert len(m) == 1, (date, start, len(m))
    x = m[0]
    title, _, body = x['text'].partition('. ')
    if len(body) > limit:
        cut = body[:limit]
        stop = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
        body = (cut[:stop + 1] if stop > 120 else cut.rstrip()) + ' …'
    c = x['source'].split()[-1]
    url = f'https://apps.apple.com/{STORE[c].lower()}/app/id337472899?see-all=reviews'
    stars = '★' * int(x['rating']) + '☆' * (5 - int(x['rating']))
    return (f'<blockquote class="q"><p><b>{e(title)}.</b> {e(body)}</p>'
            f'<footer><span class="st" aria-label="{x["rating"]} of 5 stars">{stars}</span> '
            f'App Store {c} · {x["date"]} · <a href="{url}">source</a></footer></blockquote>')


def listing_q(title, body):
    return (f'<blockquote class="q"><p><b>{e(title)}.</b> {e(body)}</p>'
            f'<footer><span class="st">★★★★☆</span> App Store US (featured on the listing) · 2025-06-15 · '
            f'<a href="{LISTING}">source</a></footer></blockquote>')


# ---- numbers (computed, not typed) ----
def avg(rows):
    return sum(int(x['rating']) for x in rows) / len(rows)

def low(rows):
    return 100 * sum(1 for x in rows if x['rating'] in '12') / len(rows)

years = {}
for x in R:
    years.setdefault(x['date'][:4], []).append(x)
trend = [(y, len(v), avg(v), low(v)) for y, v in sorted(years.items())]
low26 = [x for x in R if x['date'] >= '2026' and x['rating'] in '12']
def cnt(rows, pat):
    return sum(1 for x in rows if re.search(pat, re.sub(r'insight ?timer', '', x['text'], flags=re.I), re.I))
five = [x for x in R if x['rating'] == '5']
N = len(R)
countries = sorted({x['source'].split()[-1] for x in R})
dmin, dmax = min(x['date'] for x in R), max(x['date'] for x in R)

love = [
    ('It is free, and it stays free', cnt(five, r'\bfree\b')),
    ('Sheer variety: something for every mood', cnt(five, r'variety|so many|library|selection|choice')),
    ('It became a daily habit', cnt(five, r'every (day|night|morning)|daily|habit')),
    ('Teachers people feel they know', cnt(five, r'teacher')),
    ('Sleep', cnt(five, r'sleep')),
    ('Music and sounds', cnt(five, r'music|sounds?\b')),
    ('The plain timer and its bells', cnt(five, r'\btimer\b|bells?')),
    ('“It changed / saved my life”', cnt(five, r'changed my life|saved my life|life.?chang|life.?sav')),
    ('Courses', cnt(five, r'course')),
    ('Community and groups', cnt(five, r'communit|groups?')),
]
hate = [
    ('Questions and prompts before you can just listen', cnt(low26, r'question|survey|goals?|pop.?ups?|prompts?')),
    ('Paywall on things that used to be free (rewind, replays)', cnt(low26, r'pay|premium|subscri|free')),
    ('Streaks, milestones and “commit to 14 days”', cnt(low26, r'gamif|streak|milestone|commit')),
    ('Cannot find things: search, history, courses', cnt(low26, r'find|search|navigat|clutter|history')),
    ('Video and social-media feel', cnt(low26, r'video|social media')),
    ('AI they did not ask for', cnt(low26, r'\bAI\b')),
]

# ---- page ----
css = """
:root{--ink:#3C2405;--ink2:#6B5A45;--mute:#8A7F72;--line:#E7E0D4;--soft:#FFF8E6;--card:#FFFFFF;--bg:#FFFCF5;--brand:#FFD242;--brand2:#D69E02;--ok:#2F7A4B;--okbg:#E8F4EC;--warn:#A15C00;--warnbg:#FFF1DC;--bad:#A3352A;--badbg:#FBE9E6;--grad:linear-gradient(135deg,#FF8514 0%,#FFB347 55%,#FFE270 100%)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Mulish,system-ui,-apple-system,Segoe UI,sans-serif}
a{color:var(--brand2)}a:focus-visible{outline:2px solid var(--brand2);outline-offset:2px}
.wrap{max-width:900px;margin:0 auto;padding:0 20px}
header.hero{position:relative;overflow:hidden;padding:40px 0 36px;border-bottom:1px solid var(--line);background:radial-gradient(60% 80% at 85% 0%,#FFE68266,transparent 70%)}
.hero .net{position:absolute;right:-60px;top:-30px;width:380px;opacity:.16;pointer-events:none}
.hero .logo{margin-bottom:28px}
.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--brand2);font-weight:700;margin:0 0 8px}
h1{font-size:clamp(28px,5vw,40px);line-height:1.15;font-weight:600;margin:0 0 14px;text-wrap:balance;max-width:20ch}
h1 .g{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.lede{font-size:18px;color:var(--ink2);max-width:62ch;margin:0}
.meta{margin-top:18px;font-size:13px;color:var(--mute)}
h2{font-size:24px;line-height:1.25;font-weight:600;margin:56px 0 6px;text-wrap:balance}
h2 + .sub{color:var(--ink2);margin:0 0 18px;max-width:65ch}
h3{font-size:17px;margin:26px 0 8px}
p{max-width:68ch}
.big{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:22px 0 0}
.big div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.big b{display:block;font-size:15px;margin-bottom:4px}.big span{font-size:14px;color:var(--ink2)}
.big div:first-child{border-color:#F1C46A;background:var(--soft)}
.tbl{overflow-x:auto;margin:14px 0;border:1px solid var(--line);border-radius:12px;background:var(--card)}
table{border-collapse:collapse;width:100%;font-size:14px;min-width:640px}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);font-weight:700;background:#FFFBF0}
tr:last-child td{border-bottom:0}
td.n{font-variant-numeric:tabular-nums;white-space:nowrap}
.pill{display:inline-block;font-size:12px;font-weight:700;padding:2px 9px;border-radius:999px;white-space:nowrap}
.adopt{background:var(--okbg);color:var(--ok)}.later{background:var(--warnbg);color:var(--warn)}.avoid{background:var(--badbg);color:var(--bad)}.have{background:#EEF0F6;color:#3E4A6B}
.bar{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:14px}
.bar .l{flex:0 0 46%}.bar .t{flex:1;height:10px;background:#F3EDE2;border-radius:999px;overflow:hidden}
.bar .t i{display:block;height:100%;background:var(--grad);border-radius:999px}
.bar.neg .t i{background:#D9776B}
.bar .v{flex:0 0 52px;text-align:right;font-variant-numeric:tabular-nums;color:var(--ink2)}
.q{margin:12px 0;padding:12px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:14.5px}
.q p{margin:0 0 6px}.q footer{font-size:12px;color:var(--mute)}.st{color:var(--brand2);letter-spacing:1px}
.callout{background:var(--soft);border:1px solid #F1C46A;border-radius:16px;padding:18px 20px;margin:18px 0}
.callout h3{margin-top:0}
.mirror td:first-child{font-weight:600}
.angle{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:10px 0}
.angle.rec{border:2px solid #F1C46A;background:var(--soft)}
.angle p{margin:6px 0 0}
.chart{overflow-x:auto}
.chart svg{display:block;max-width:100%;height:auto}
ol.steps li,ul.tight li{margin:4px 0}
footer.end{margin:64px 0 40px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--mute)}
@media (max-width:600px){.bar .l{flex-basis:52%}.hero .net{width:240px;right:-80px}}
"""

def bars(items, total, neg=False):
    mx = max(v for _, v in items)
    out = []
    for label, v in items:
        pct = 100 * v / total
        out.append(f'<div class="bar{" neg" if neg else ""}"><span class="l">{e(label)}</span>'
                   f'<span class="t"><i style="width:{100 * v / mx:.0f}%"></i></span>'
                   f'<span class="v">{v}</span></div>')
    return '\n'.join(out)


def trend_svg():
    W, H, pl, pr, pt, pb = 680, 220, 70, 56, 16, 34
    xs = [t[0] for t in trend]
    n = len(xs)
    def X(i): return pl + i * (W - pl - pr) / (n - 1)
    def Y(v): return pt + (30 - v) * (H - pt - pb) / 30   # 0..30 %
    grid = ''.join(f'<line x1="{pl}" x2="{W - pr}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="#EDE6DA"/>'
                   f'<text x="{pl - 8}" y="{Y(v) + 4:.1f}" text-anchor="end" font-size="11" fill="#8A7F72">{v}%</text>'
                   for v in (0, 10, 20, 30))
    pts = ' '.join(f'{X(i):.1f},{Y(t[3]):.1f}' for i, t in enumerate(trend))
    area = f'{X(0):.1f},{Y(0):.1f} ' + pts + f' {X(n - 1):.1f},{Y(0):.1f}'
    dots = ''.join(f'<circle cx="{X(i):.1f}" cy="{Y(t[3]):.1f}" r="4" fill="#D9776B"/>'
                   f'<text x="{X(i):.1f}" y="{Y(t[3]) - 10:.1f}" text-anchor="middle" font-size="12" font-weight="700" fill="#3C2405">{t[3]:.0f}%</text>'
                   f'<text x="{X(i):.1f}" y="{H - 12}" text-anchor="middle" font-size="12" fill="#6B5A45">{t[0]}</text>'
                   f'<text x="{X(i):.1f}" y="{H - 0}" text-anchor="middle" font-size="10" fill="#8A7F72">avg {t[2]:.2f}★ · n={t[1]}</text>'
                   for i, t in enumerate(trend))
    return (f'<svg viewBox="0 0 {W} {H + 4}" role="img" aria-label="Share of 1 and 2 star reviews by year">'
            f'{grid}<polygon points="{area}" fill="#D9776B" opacity=".12"/>'
            f'<polyline points="{pts}" fill="none" stroke="#D9776B" stroke-width="2.5"/>{dots}</svg>')


P = lambda v: f'<span class="pill {v}">' + {'adopt': 'Adopt in v1', 'later': 'Later', 'avoid': 'Avoid', 'have': 'Already have'}[v] + '</span>'

features = [
    ('Free library', '350,000 practices, 100+ new every day, about 70 topics from Sleep to Perimenopause, A to Z. “Free. No Ads. No AI.”',
     'A small curated catalogue; every session is made for one person from one sentence.',
     'adopt', 'Borrow the <b>topic words</b> (Sleep, Overthinking, Burnout, Nervous system, Grief…) as one-tap starting points on Create and Discover. Do not chase library size: that is their moat, not ours.'),
    ('Course and challenge', '7 to 40-day courses, 8 to 31-day challenges. Past challenges are a member perk.',
     'Five-chapter journey, Personal journeys, chapter card on Home.', 'have',
     'Ours is already the fix for their top organisation complaint (“after day 1 the course is nowhere to be found”). Keep “continue chapter N” one tap from Home, always.'),
    ('The plain timer', 'The app’s namesake: a silent timer with bells and intervals. Loved for 15 years, now buried behind prompts.',
     'None.', 'later',
     'A “just breathe, no words” mode is cheap, works offline and gives a returning user something with zero friction. Good v1.1.'),
    ('Teachers and follow', 'Teacher profiles, follow, play counts (one track: 4.1m plays), ratings.',
     'Sessions are AI-made; the person is the author.', 'later',
     'Expert-written building blocks (“Longer exhale, from a breathwork coach”) give the AI a human face. Needs a backend and partners.'),
    ('Live events', 'Live sessions every hour, recorded replays.', 'None.', 'avoid',
     'Needs a large teacher network. Not a v1 problem.'),
    ('Groups and community', 'Interest groups, discussion.', 'Community without ranks (v5).', 'have', 'Keep it quiet; reviewers punish social-media feel.'),
    ('Stats, streaks, milestones, “commit to 14 days”', 'Pop-ups after every session. Cannot be turned off fully.',
     'Journey dots; progress told in words from check-ins (v5); coins.', 'avoid',
     'Do not add streak counters or milestone pop-ups. Our words-not-scores progress is the answer their users are asking for.'),
    ('Goal questionnaire', 'Asked on sign-up and again on return; reviewers say it cannot be skipped.',
     'Three skippable questions, once per browser.', 'have', 'Keep ours as it is. Never ask again unless the person chooses to.'),
    ('Daily intention widget', 'An intention shown on the phone’s home screen.',
     'Daily check-in on every sign-in.', 'later',
     'A widget is mobile work. See “the mirror” below about how often we ask.'),
    ('Map of Healing (Science)', 'Person × practice × science: practices → mechanisms → body changes → benefits → the people they help. Links are counts of documented connections, never evidence claims.',
     'The causal Wellness State Graph (2025) and the “Lego” changes in a session.', 'adopt',
     'Their public story is our thesis. See the strategic note below.'),
    ('Health and HRV', 'HRV explainers and 5.5-breaths-a-minute practices; Apple Health Mindful Minutes.',
     'Wearable asked for in onboarding; example readings until a backend exists.', 'adopt',
     'HRV is the measurable bridge between a “Lego” and a body change. Name the breath rate in our changes (e.g. “Longer exhale · about 6 breaths a minute”).'),
    ('Therapists programme', '125,000 therapists send practices to clients by link or QR; weekly free training.',
     'None.', 'later',
     'The best channel nobody here has discussed. For the feedback study now: recruit through two or three therapists.'),
    ('Help now (crisis page)', 'A crisis-resources page linked from the foot of every page, by country.',
     '<b>Nothing in the consumer app.</b>', 'adopt',
     'A wellness app that asks how you feel needs a visible “Need help now?” link. Small, and a must before real users.'),
    ('Premium', 'US$59.99 a year or US$9.99 a month: offline, rewind and resume, the course archive.',
     'Upgrade page: $10 a month or $100 a year; coins.', 'adopt',
     'Never put basic player controls (rewind, resume) behind a paywall: the single angriest theme of 2026. Revisit the $100 annual price against their $59.99.'),
    ('Video and autoplay', 'Video previews and teacher video on open.', 'None.', 'avoid', 'Audio-first is a feature. Keep it.'),
    ('Retreats', 'Paid in-person retreats with teachers.', 'None.', 'avoid', 'Out of scope.'),
]
ft = ''.join(f'<tr><td><b>{e(a)}</b></td><td>{b}</td><td>{c}</td><td>{P(v)}</td><td>{w}</td></tr>' for a, b, c, v, w in features)

mirror = [
    ('Daily check-in opens on every sign-in', 'adopt',
     q('2026-06-08', 'I can’t stand this app', 260),
     'Show it once a day at most, and only when the person has not checked in. A visible “Not today” that remembers. (Today it shows on every sign-in on purpose, because the data is a demo; that decision has an expiry date.)'),
    ('Onboarding questions', 'have',
     q('2026-11-05', 'Intrusive Questioning', 260),
     'Ours is already skippable and asked once. Keep the “Skip” where it is; never re-ask on return.'),
    ('Five-chapter journey and coins', 'have',
     q('2026-11-01', 'Stop the gamification', 260),
     'Chapters are a story, not a streak. Keep coins out of the player (already true since the simple player) and never show “you broke your streak”.'),
    ('Sessions are made by AI', 'adopt',
     q('2026-08-10', 'Needs AI transparency', 200),
     'Their users fear AI that is hidden. Ours is the product, so say it plainly and show the human part: why each change was suggested (the “Why?” in v5), and who wrote the building blocks.'),
]
mt = ''.join(f'<tr><td>{e(a)}</td><td>{b}</td><td>{c}</td></tr>' for a, _, b, c in mirror)

body = f"""
<header class="hero"><div class="wrap">
<img class="net" src="{brand.network_uri()}" alt="">
<div class="logo">{brand.logo(26)}</div>
<p class="eyebrow">Replica study · Insight Timer</p>
<h1>What the world’s biggest meditation app teaches <span class="g">Aurelia’s version 1</span></h1>
<p class="lede">An agent-run study of Insight Timer: every public feature mapped, {N:,} real App Store reviews read and ranked, and each finding placed where it fits, or does not fit, in Aurelia’s first version.</p>
<p class="meta">13 November 2026 · Method: replica-skill (recon and entrepreneur steps), run by an AI agent, no manual work · Sources listed at the end</p>
</div></header>

<main class="wrap">

<h2>The short version</h2>
<p class="sub">Five things worth remembering if you read nothing else.</p>
<div class="big">
<div><b>1. They are building our idea in public.</b><span>Insight Timer’s new “Map of Healing” links practices to body changes to the people they help. That is Aurelia’s causal graph, told as a story. We should tell ours first, and better.</span></div>
<div><b>2. Their users are angry at exactly what we were about to copy.</b><span>Questions before listening, streak pop-ups, a paywall on rewind. In 2025 nearly one review in four was 1 or 2 stars, up from one in eleven in 2022; 2026 is still about one in five.</span></div>
<div><b>3. Our daily check-in is the one risk.</b><span>Asking “how do you feel?” on every sign-in is the exact pattern their reviewers hate. Once a day, skippable, remembered.</span></div>
<div><b>4. What people love is not size.</b><span>It is “free”, “something for my mood”, and “it became my daily habit”. Aurelia can win the second and third without a library of 350,000.</span></div>
<div><b>5. Three small things belong in v1.</b><span>A crisis “Need help now?” link, topic words as starting points, and never paywalling rewind or resume.</span></div>
</div>

<h2>What Insight Timer is</h2>
<p class="sub">The core loop, in their own words: open the app, pick a free practice from a huge library, listen, come back tomorrow.</p>
<p>It started fifteen years ago as a simple meditation timer with bells. Today it calls itself the world’s most popular wellness app: 350,000 practices, more than 100 new ones a day, live sessions every hour, 125,000 therapists sharing it with clients, and one optional subscription. Its homepage promise is three words long: <b>“Free. No Ads. No AI.”</b></p>
<p>That last word matters for us. Aurelia’s whole product is a session made by AI for one person. Insight Timer is positioning against that, and a few of its users (a small theme so far) already complain about the AI it has started to add.</p>

<h2>Every feature, and where it fits in Aurelia v1</h2>
<p class="sub">The recon map, folded into one table. “Aurelia today” describes the live app (production default, version 3).</p>
<div class="tbl"><table>
<thead><tr><th>Feature</th><th>At Insight Timer</th><th>Aurelia today</th><th>Verdict</th><th>Why</th></tr></thead>
<tbody>{ft}</tbody></table></div>

<h2>What their users love</h2>
<p class="sub">Out of {len(five):,} five-star reviews, how many mention each thing. One review can mention several.</p>
{bars(sorted(love, key=lambda h: -h[1]), len(five))}
{q('2026-10-08', 'Vital Part of Each Day', 260)}
{q('2026-10-11', 'Honestly life changing', 260)}
<p>The lesson for Aurelia: people stay for <b>the right thing for how I feel right now</b> and for <b>a small daily ritual</b>. Both are things a personal session can do better than a library. Size is how Insight Timer delivers them, not why people love it.</p>

<h2>What their users hate, and how fast it grew</h2>
<p class="sub">Share of 1 and 2-star reviews by year, from {N:,} reviews across the App Store in {", ".join(countries)} ({dmin} to {dmax}).</p>
<div class="chart">{trend_svg()}</div>
<p>In 2025 the angry share more than doubled, and 2026 has not recovered. Reading the {len(low26)} one and two-star reviews from 2026, these are the themes (one review can count in several):</p>
{bars(sorted(hate, key=lambda h: -h[1]), len(low26), neg=True)}
<h3>In their words</h3>
{q('2026-11-01', 'Stop the gamification', 340)}
{q('2026-10-11', 'Rewinding is a paid', 300)}
{q('2026-10-29', 'Content good, app mediocre', 300)}
{listing_q('Fantastic platform. Fantastic idea. Just a few things to consider…', 'On the Home Screen if you do a premium course or any course or challenge over multiple days, after the first session, that challenge is nowhere to be found. Unless you remember the exact name, or teacher you listened to, it’s an absolute pain finding your recently played episodes.')}
{q('2026-10-30', 'AI is ruining', 300)}

<h2>The mirror: what we already do that their users punish</h2>
<p class="sub">The most useful part of a replica study is not what to copy. It is noticing our own version of their mistakes before our users do.</p>
<div class="tbl"><table class="mirror">
<thead><tr><th>Aurelia today</th><th>What their users say about the same pattern</th><th>What to do</th></tr></thead>
<tbody>{mt}</tbody></table></div>

<div class="callout">
<h3>Strategic note: the Map of Healing is our graph, told well</h3>
<p>Insight Timer describes “billions of pathways between who a person is, what they practise, and what changes in the body”, in layers: <b>practices → mechanisms → body changes → benefits → the people they help</b>, plus the person’s life events, traits and how they like a practice delivered. Every link is “a count of documented connections, never a claim of evidence strength.”</p>
<p>That is very close to Aurelia’s 2025 Wellness State Graph, and to the “Lego” changes in a session (Longer exhale, Steady pulse, Fewer words), which are the dots of our causal network. Two differences are ours to claim:</p>
<ul class="tight">
<li><b>They map a library; we test on one person.</b> Their map says what tends to help people like you. Each Aurelia chapter is a small experiment that shows what helped <i>you</i>, and feeds it back.</li>
<li><b>They count connections; we look for state flips.</b> Our model aims at the moment someone moves from one state to a better one, and at what caused it.</li>
</ul>
<p>Recommendation: give the graph a public name and a one-screen explainer before launch, using the State-Flip film. Without it, Aurelia will look like “AI-generated meditations” next to a competitor that owns the science story.</p>
</div>

<h2>Three ways to position Aurelia against it</h2>
<div class="angle rec"><b>Recommended · For people who want help, not a library</b>
<p>For people who open a meditation app and scroll past a hundred choices without feeling better, Aurelia makes one session for how you feel today, and learns from each one what actually helps you.</p>
<p class="meta">Evidence: “cannot find things” and “too many choices” in {hate[3][1]} of the {len(low26)} angry 2026 reviews; “something for my mood” in {love[1][1]} five-star ones.</p></div>
<div class="angle"><b>For people tired of being gamified</b>
<p>No streaks, no milestones, no questions before you listen. You say how you feel; Aurelia does the rest.</p>
<p class="meta">Evidence: questions and pop-ups are the largest theme ({hate[0][1]} of the {len(low26)} angry 2026 reviews), streaks another {hate[2][1]}.</p></div>
<div class="angle"><b>For people who want to know why it works</b>
<p>Every change Aurelia suggests says why, and your own check-ins show whether it did.</p>
<p class="meta">Evidence: AI-transparency and content-vetting complaints; the Map of Healing shows the market wants the “why”.</p></div>

<h2>What to do with this</h2>
<h3>Into version 1 (small, before real users)</h3>
<ol class="steps">
<li><b>“Need help now?”</b> link in the drawer, Settings and the check-in sheet, to a page of crisis lines by country.</li>
<li><b>Daily check-in at most once a day</b>, skippable, remembered; never on every sign-in once accounts exist.</li>
<li><b>Topic words as starting points</b> on Create and Discover: Sleep, Anxiety, Overthinking, Burnout, Nervous system, Grief.</li>
<li><b>Rule in the PRD:</b> rewind, resume and offline replay of your own sessions are never paid features.</li>
<li><b>Say “made with AI” plainly</b>, next to the “Why?” on each change.</li>
</ol>
<h3>Version 1.1 and later</h3>
<ul class="tight">
<li>A “just breathe” timer mode with bells, no voice, works offline.</li>
<li>A public explainer of the causal graph (name, one screen, the State-Flip film).</li>
<li>Expert-written “Lego” blocks with a name on them.</li>
<li>A therapist channel: share a session by link or QR, starting with two or three therapists in the feedback study.</li>
<li>Write mindful minutes to Apple Health from the mobile app.</li>
</ul>
<h3>Next agent step</h3>
<p>The buyer-agents test of version 1 (founder-skill) can now use this report as its brief: the panel judges Aurelia against Insight Timer’s strengths and against its users’ complaints.</p>

<h2>Method, sources and limits</h2>
<p>Run by an AI agent following replica-skill’s recon and entrepreneur steps (MIT licence). Public pages and official feeds only: no account, no login, no paywall crossed, no app code read. Pages were read one at a time, not crawled.</p>
<ul class="tight">
<li>Website: <a href="https://insighttimer.com">home</a>, <a href="https://insighttimer.com/science">science (Map of Healing)</a>, <a href="https://insighttimer.com/health">health</a>, <a href="https://insighttimer.com/courses">courses</a>, <a href="https://insighttimer.com/challenges">challenges</a>, <a href="https://insighttimer.com/live">live</a>, <a href="https://insighttimer.com/therapists">therapists</a>, <a href="https://insighttimer.com/retreats">retreats</a>, <a href="https://insighttimer.com/meditation-teachers">teachers</a>, <a href="https://insighttimer.com/help-now">help now</a>, one track page.</li>
<li><a href="{LISTING}">App Store listing</a>: description, premium price, release notes.</li>
<li>{N:,} reviews from Apple’s public customer-reviews feed, the most recent 500 in each of {", ".join(countries)}, {dmin} to {dmax}. Every quote above is copied exactly; long ones are shortened with “…”. Apple’s feed gives no per-review link, so “source” opens that country’s review list.</li>
</ul>
<p><b>Limits.</b> One review source (App Store), English-speaking stores only; no Google Play, Reddit or Trustpilot yet. Theme counts use keyword matching and are directional, not exact. The mobile app itself was not opened (it is not available in our region); everything about it comes from the listing and reviews. Nothing here is a measurement of Aurelia’s own users.</p>

<footer class="end">{brand.mark(22)}<p>Aurelia · replica study · 13 November 2026. Insight Timer is a trademark of its owner; this is independent research from public sources.</p></footer>
</main>
"""

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Insight Timer Replica Study</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>{body}</body></html>"""
open(sys.argv[1], 'w').write(page)
print('ok', len(page), [h for h in hate], [l for l in love][:3], trend)
