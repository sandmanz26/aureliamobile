"""Generates /guide's Research document: the Insight Timer deep research,
rewritten for reading (src/guides/content/research-insight-timer.html and
research.css, scoped under `.gd-doc .rs`).

The facts come from docs/research/reports/Insight Timer deep research.md and
its notes; this file only arranges them. Run from the repo root:

    python3 scripts/guides/research_insight_timer.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_HTML = os.path.join(ROOT, 'src/guides/content/research-insight-timer.html')
OUT_CSS = os.path.join(ROOT, 'src/guides/content/research.css')


def a(href, text):
    return f'<a href="{href}" target="_blank" rel="noopener">{text}</a>'


S = {
    'about': 'https://insighttimer.com/about',
    'tc': 'https://techcrunch.com/2024/02/21/in-a-reversal-apple-is-now-demanding-30-of-the-donations-to-meditation-app-insight-timers-teachers/',
    'pod': 'https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing',
    'gnw': 'https://finance.yahoo.com/news/insight-timer-launches-resolution-intention-133700660.html',
    'pitch': 'https://pitchbook.com/profiles/company/222040-18',
    'store': 'https://apps.apple.com/us/app/insight-timer-meditation-app/id337472899',
    'reviews': 'https://apps.apple.com/us/app/id337472899?see-all=reviews',
    'mp': 'https://insight-timer.freshdesk.com/support/solutions/articles/67000664702-what-is-memberplus-',
    'courses': 'https://insight-timer.freshdesk.com/support/solutions/articles/67000664709-what-are-courses-and-how-do-they-work-',
    'live': 'https://insight-timer.freshdesk.com/support/solutions/articles/67000754308-what-are-live-events-',
    'income': 'https://insight-timer.freshdesk.com/support/solutions/articles/67000737721-teacher-income-faq-august-2024',
    'aipolicy': 'https://insight-timer.freshdesk.com/support/solutions/articles/67000723124-can-teachers-use-artificial-intelligence-ai-on-their-insight-timer-offerings-',
    'aisafety': 'https://insighttimer.com/ai-safety',
    'science': 'https://insighttimer.com/science',
    'hub': 'https://www.globenewswire.com/news-release/2025/10/08/3163166/0/en/Insight-Timer-Launches-Free-Therapist-Hub-to-Support-Mental-Health-Professionals.html',
    'aca': 'https://www.newswise.com/articles/american-counseling-association-adds-insight-timer-to-prestigious-strategic-partner-network',
    'india': 'https://theprint.in/ani-press-releases/worlds-largest-free-wellness-app-insight-timer-launches-in-india/2875253/',
    'mwm': 'https://mwm.ai/articles/app-updates/insight-timer-v20-17-0-buries-saved-meditations-in-bloated-redesign-may-2026',
    'tp': 'https://uk.trustpilot.com/review/www.insighttimer.com',
    'calm': 'https://www.businessofapps.com/data/calm-statistics/',
    'hs': 'https://www.bloomberg.com/news/articles/2026-09-16/headspace-meditation-app-being-acquired-by-ai-startup-sword-for-300-million',
    'woebot': 'https://www.statnews.com/2025/07/02/woebot-therapy-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/',
    'koetsier': 'https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/',
    'art50': 'https://artificialintelligenceact.eu/transparency-rules-article-50/',
    'states': 'https://qz.com/state-laws-restricting-ai-mental-health-care-guide-072826',
}


def free(t='Free'):
    return f'<span class="rs-tag rs-free">{t}</span>'


def paid(t='MemberPlus'):
    return f'<span class="rs-tag rs-paid">{t}</span>'


FEATURES = [
    ('Listening', [
        ('Library', '300,000+ guided meditations, sleep tracks, music, talks and breathwork from about 20,000–30,000 teachers, in about 50 languages. Roughly 900+ new free meditations a week.', free()),
        ('Premium tracks and video', 'Studio-quality audio and video-guided practices.', paid()),
        ('The timer', 'The original silent timer with bells and intervals. Works offline. Long ambient timer sounds are paid.', free('Free · sounds paid')),
        ('Player controls', 'Rewind, fast-forward, repeat, resume where you left off.', paid('MemberPlus (was free)')),
        ('Saving', 'Bookmarks, playlists, recently played. Custom folders and offline downloads are paid.', free('Free · offline paid')),
    ]),
    ('Programmes', [
        ('Courses', 'Multi-day teacher-led paths with a classroom where the teacher answers by audio. Moved from one-off purchases into the subscription.', paid()),
        ('Challenges', 'Daily challenges, e.g. a 31-day intention challenge in January 2026. The archive of past challenges is paid.', free('Current free · archive paid')),
        ('Live events', 'Live video meditation, yoga, talks and breathwork, every hour, under “What’s On”. Mostly free with donations; some paid tickets ($3.49).', free('Mostly free')),
    ]),
    ('Habit and community', [
        ('Progress', 'Stats, day counts, milestones, a journal and daily check-ins. Advanced journal and custom milestones are paid.', free('Basic free')),
        ('Intentions and AI', 'A yearly resolution pinned to Home, daily intentions, an AI “digital librarian” that matches tracks to the intention (Jan 2026), and Reflect, an AI that asks reflective questions.', free()),
        ('Community', 'Groups, “meditating with you”, profiles, friends. Social features can be switched off.', free()),
    ]),
    ('Science and care', [
        ('Map of Healing', 'A public map linking practices → mechanisms → body changes → benefits → people.', free()),
        ('Therapist Hub', 'Therapists build collections for clients and list themselves in a directory (Oct 2025). 125,000 therapists claimed.', free()),
        ('Help Now', 'A page of crisis lines by country, linked from every page.', free()),
        ('Retreats', 'Book in-person or virtual retreats run by teachers. Insight Timer keeps about 10%.', paid('Paid per booking')),
    ]),
]


def features_html():
    out = []
    for group, rows in FEATURES:
        items = ''.join(f'<tr><td><b>{n}</b></td><td>{d}</td><td>{t}</td></tr>' for n, d, t in rows)
        out.append(f'<h3>{group}</h3><div class="rs-table"><table><thead><tr><th>Feature</th><th>What it does</th><th>Free or paid</th></tr></thead><tbody>{items}</tbody></table></div>')
    return '\n'.join(out)


TREND = [('2022', 9), ('2023', 12), ('2024', 13), ('2025', 23), ('2026', 18)]


def trend_html():
    mx = 25
    bars = ''.join(
        f'<div class="rs-col"><span class="rs-colv">{v}%</span><span class="rs-colbar" style="height:{v / mx * 100:.0f}%"></span><span class="rs-coly">{y}</span></div>'
        for y, v in TREND)
    return f'<figure class="rs-trend" aria-label="Share of 1 and 2 star App Store reviews by year">{bars}</figure><p class="rs-cap">Share of 1–2 star reviews in 2,000 recent App Store reviews (US, UK, Canada, Australia). Source: Aurelia’s replica study, 13 Nov 2026.</p>'


HTML = f"""<!-- GENERATED by scripts/guides/research_insight_timer.py — do not edit. -->
<div class="rs">
<header class="rs-cover" id="research">
  <div class="rs-glow" aria-hidden="true"></div>
  <img class="rs-net" src="/guides/brand/aurelia-network.png" alt="" aria-hidden="true">
  <div class="rs-brandrow">{brand.logo(28)}<span class="rs-doclabel">Research</span></div>
  <p class="rs-eyebrow">Competitor deep research · 15 November 2026</p>
  <h1>Insight Timer, <span class="rs-grad">and what it means for Aurelia</span></h1>
  <p class="rs-lede">The world’s biggest free meditation app, explained in plain words: what it offers, how it makes money, why people stay, what went wrong, and where Aurelia can win.</p>
</header>

<h2>The short version</h2>
<div class="rs-five">
  <div><b>Same need, opposite answer.</b><span>Both apps help people find a practice that fits how they feel. Insight Timer answers with 300,000 human recordings. Aurelia answers by making one session for you, now.</span></div>
  <div><b>They chose “No AI”, on purpose.</b><span>AI may recommend in their app but may never speak. That leaves the “made for this moment” lane open to us, and makes trust in AI our biggest hurdle.</span></div>
  <div><b>Their users punish friction.</b><span>Questions before listening, streak pop-ups and a paywall on rewind doubled their angry reviews. We must not copy any of it.</span></div>
  <div><b>They already tell a science story.</b><span>Their “Map of Healing” looks like our graph. Our edge is proof for one person, not a bigger map.</span></div>
  <div><b>What Aurelia can own:</b><span>“a session built for this moment that proves, on you, that it helped.” Not “free”, “human” or “science-backed”: those words are theirs.</span></div>
</div>

<h2>Insight Timer at a glance</h2>
<div class="rs-stats">
  <div><b>300k+</b><span>free tracks</span></div>
  <div><b>20–30k</b><span>teachers</span></div>
  <div><b>~3M</b><span>monthly active users (2024)</span></div>
  <div><b>~350k</b><span>paying subscribers (2025, CEO’s estimate)</span></div>
  <div><b>$59.99</b><span>a year, or $9.99 a month</span></div>
  <div><b>~80</b><span>staff (2025), profitable</span></div>
</div>
<p class="rs-note">The “30–35 million members” headline counts everyone who ever signed up; about 3 million use it in a month. Sources: {a(S['tc'], 'TechCrunch')}, {a(S['pod'], 'CEO interview, 2025')}, {a(S['about'], 'About page')}, {a(S['mp'], 'Help centre')}.</p>

<h2>1. Who they are</h2>
<ol class="rs-time">
  <li><b>2009</b>A simple meditation timer with bells, built in Australia.</li>
  <li><b>2010s</b>Christopher and Nicho Plowman buy it and open it to teachers. Christopher Plowman is still CEO in 2026.</li>
  <li><b>2020</b>Series A of about $27.4M ({a(S['pitch'], 'PitchBook')}). About 120 staff, losing about $1M a month.</li>
  <li><b>2024</b>Apple takes 30% of teacher tips. Teacher share cut from 50% to 40%. Profitable by 2025 with about 80 staff.</li>
  <li><b>2025–26</b>Therapist Hub, AI intention recommender, India launch, a partnership with the American Counseling Association ({a(S['aca'], 'Newswise')}).</li>
</ol>
<p class="rs-note">An earlier brief said “Series A 2021 led by TCV”. No source supports it; treat it as a mistake.</p>

<h2>2. Every feature, and what is free</h2>
<p>A free library, wrapped in a growing paid layer called <b>MemberPlus</b>. Two changes stand out: <b>rewind and resume are now paid</b>, and <b>courses moved into the subscription</b>. Not confirmed, so left out: Apple Health, heart-rate (HRV) or wearable links, widgets.</p>
{features_html()}
<p class="rs-note">Sources: {a(S['mp'], 'What is MemberPlus?')}, {a(S['courses'], 'Courses')}, {a(S['live'], 'Live events')}, {a(S['gnw'], 'Jan 2026 launch')}, {a(S['hub'], 'Therapist Hub')}, {a(S['store'], 'App Store')}.</p>

<h2>3. How they make money</h2>
<div class="rs-flow">
  <div><b>Free library</b><span>brings people in</span></div><i aria-hidden="true">→</i>
  <div><b>One subscription</b><span>MemberPlus pays the bills</span></div><i aria-hidden="true">→</i>
  <div><b>Teachers</b><span>get about 40% of it</span></div>
</div>
<p>Small extras: retreats (about 10% of each booking), teacher donations, some paid live tickets. Since 2024 four pressures pushed them to charge harder:</p>
<ul class="rs-list">
  <li><b>Apple</b> took 30% of the roughly $100k a month listeners tipped teachers ({a(S['tc'], 'TechCrunch')}).</li>
  <li><b>Profit:</b> the teacher share went from 50% to 40%, and 25–30% of teacher pay now rewards listeners who come back the next day ({a(S['income'], 'Teacher income FAQ')}).</li>
  <li><b>Pricing:</b> most new users now see a paywall during onboarding. In one market a 30% price cut raised revenue about 50% ({a(S['pod'], 'CEO interview')}).</li>
  <li><b>New lines:</b> retreats, and clinicians through the free Therapist Hub and the counsellors’ association.</li>
</ul>

<h2>4. The problems they solve, and for whom</h2>
<div class="rs-who">
  <div><b>Newer users</b><span>Stress, anxiety, sleep. They want a free track that suits their mood tonight.</span></div>
  <div><b>Long-time meditators</b><span>A self-led or spiritual practice. They want the timer, their teachers and their bookmarks.</span></div>
  <div><b>Teachers</b><span>A living from teaching, to an audience of millions.</span></div>
  <div><b>Since 2026: goal-setters</b><span>“Turn a resolution into a daily practice”, with intentions and AI recommendations.</span></div>
</div>
<p>The two user groups want different things. Almost every recent change aimed at newer users (questions, intentions, paywalls) added friction for the long-time meditators, and they write most of the reviews.</p>

<h2>5. Why people stay</h2>
<div class="rs-loop">
  <span>Open the app</span><i aria-hidden="true">→</i><span>Play a free track or the timer</span><i aria-hidden="true">→</i><span>Day count grows</span><i aria-hidden="true">→</i><span>Follow teachers, join groups or lives</span><i aria-hidden="true">→</i><span>Come back tomorrow</span>
</div>
<p>In 1,430 five-star reviews, the top reasons were <b>variety: something for every mood (310)</b>, <b>it’s free (308)</b> and <b>it became a daily habit (283)</b>, then teachers people feel they know (175), sleep (157) and the plain timer (130) ({a(S['reviews'], 'App Store')}).</p>
<p>The unusual part: <b>they pay teachers for retention</b>. A quarter of teacher income depends on listeners returning the next day. That makes “come back tomorrow” the goal of the whole platform, and probably explains the growing number of reminders and streak pop-ups (our inference; the company does not say so).</p>

<h2>6. Their view of AI</h2>
<div class="rs-split">
  <div class="rs-no"><b>AI may not speak</b><ul><li>Tagline: “Free. No Ads. No AI.”</li><li>Teachers may not publish AI voices, voice clones, AI-written scripts or AI-only music ({a(S['aipolicy'], 'policy')}).</li><li>Sold to clinicians as “every recording made by a real practitioner”.</li></ul></div>
  <div class="rs-yes"><b>AI may choose</b><ul><li>An AI “digital librarian” picks tracks for your intention (Jan 2026).</li><li>Reflect, an AI that asks reflective questions, with crisis lines and deletable chats ({a(S['aisafety'], 'AI safety')}).</li><li>AI to spot community spam.</li></ul></div>
</div>
<h3>The Map of Healing looks like our graph</h3>
<p>Their {a(S['science'], 'science page')} stacks three maps (the person, the practice, the science) and links practices to mechanisms, body changes, benefits and the people they help. It is the closest thing on the market to Aurelia’s Wellness State Graph. The differences are what matter:</p>
<div class="rs-table"><table><thead><tr><th></th><th>Map of Healing</th><th>Aurelia’s graph</th></tr></thead><tbody>
<tr><td><b>What a link means</b></td><td>How often research mentions a connection, “never a claim of evidence strength”</td><td>A weighted cause-and-effect link</td></tr>
<tr><td><b>What it leads to</b></td><td>An existing human recording</td><td>Building blocks assembled into a new session</td></tr>
<tr><td><b>Learns from you</b></td><td>No public sign of it</td><td>Yes: each chapter’s check-in updates what helps this person</td></tr>
</tbody></table></div>

<h2>7. What went wrong for their users</h2>
<p>The store rating still says 4.9. Recent reviews say otherwise.</p>
{trend_html()}
<p>The biggest complaints in 2026’s 168 one- and two-star reviews:</p>
<div class="rs-bars">
  <div><span>Questions and pop-ups before you can listen</span><i style="--w:100%"></i><b>65</b></div>
  <div><span>Paywall on things that were free (rewind, replays)</span><i style="--w:77%"></i><b>50</b></div>
  <div><span>Can’t find things (search, history, courses)</span><i style="--w:55%"></i><b>36</b></div>
  <div><span>Streaks, milestones, “commit to 14 days”</span><i style="--w:42%"></i><b>27</b></div>
  <div><span>Video and a social-media feel</span><i style="--w:20%"></i><b>13</b></div>
</div>
<blockquote class="rs-quote">“Logging on requires me to answer 1 million questions about my goals and interests. It wants to set up targets and competitions and reminders. I just want to freaking meditate.”<span>1-star App Store review, Nov 2026</span></blockquote>
<div class="rs-table"><table><thead><tr><th>When</th><th>What changed</th><th>Reaction</th></tr></thead><tbody>
<tr><td>Feb 2024</td><td>Apple takes 30% of tips</td><td>Teachers lose most of about $100k a month</td></tr>
<tr><td>Mid 2024</td><td>Teacher share 50% → 40%; pay tied to next-day return</td><td>Some teachers report income down by up to half</td></tr>
<tr><td>2024–25</td><td>Timer off Home; rewind paywalled; onboarding paywall</td><td>“They have removed free content drastically” ({a(S['tp'], 'Trustpilot')})</td></tr>
<tr><td>Jan 2026</td><td>AI recommender and Reflect</td><td>“Experience is being ruined by AI”</td></tr>
<tr><td>May 2026</td><td>Redesign hides bookmarks</td><td>That version’s rating fell from 4.23 to 3.14 ({a(S['mwm'], 'MWM')})</td></tr>
<tr><td>Sep 2026</td><td>More pop-ups</td><td>“Cannot access the app without 10 popups each time”</td></tr>
</tbody></table></div>
<p><b>No public response or reversal was found for any of these.</b> Release notes call changes “UI improvements requested by our growing community”.</p>

<h2>8. Where they sit in the market</h2>
<div class="rs-table"><table><thead><tr><th>App</th><th>2026 position</th><th>Why it matters to us</th></tr></thead><tbody>
<tr><td><b>Calm</b></td><td>Est. $210M revenue in 2025, down 24%; about 3.5M subscribers ({a(S['calm'], 'Business of Apps')})</td><td>Big audience; could add generated sessions</td></tr>
<tr><td><b>Headspace</b></td><td>Sold to Sword Health for up to $300M after a $3B peak; Ebb AI companion ({a(S['hs'], 'Bloomberg')})</td><td>AI mental health moving to clinics and employers</td></tr>
<tr><td><b>Insight Timer</b></td><td>About a tenth of Calm’s revenue; biggest free audience; profitable</td><td>Owns “free”, “human” and “science”</td></tr>
<tr><td><b>Medito</b></td><td>Free, nonprofit, no sign-up</td><td>Where paywall-haters go</td></tr>
<tr><td><b>Endel, Rosebud</b></td><td>AI soundscapes; AI journaling ($6M seed)</td><td>Generate sound or text, not guided sessions</td></tr>
<tr><td><b>Woebot</b></td><td>Consumer app closed June 2025 ({a(S['woebot'], 'STAT')})</td><td>A warning about medical claims</td></tr>
</tbody></table></div>
<p>Nobody well funded makes <b>a new session from one sentence, refined with modular changes, inside an adaptive journey</b>. That is still open.</p>

<h2>9. Insight Timer and Aurelia, side by side</h2>
<div class="rs-table"><table class="rs-vs"><thead><tr><th></th><th>Insight Timer</th><th>Aurelia</th></tr></thead><tbody>
<tr><td><b>Promise</b></td><td>The right human track for you, from 300,000</td><td>A session made for how you feel, in about a minute</td></tr>
<tr><td><b>Personalisation</b></td><td>AI picks, humans speak</td><td>AI builds the session; you change it with “Lego” pieces</td></tr>
<tr><td><b>Science</b></td><td>Map of Healing, counts only</td><td>Wellness State Graph, learns from your results</td></tr>
<tr><td><b>Structure</b></td><td>Paid courses, 31-day challenges, streaks</td><td>Five-chapter journey, progress in words</td></tr>
<tr><td><b>Daily ritual</b></td><td>Intentions, check-ins, day counts</td><td>Daily check-in, “How do you feel now?” <em>(same risk: asking too often)</em></td></tr>
<tr><td><b>Price</b></td><td>Free core; $9.99/month or $59.99/year</td><td>Planned $10/month or $100/year <em>(annual is 67% higher)</em></td></tr>
<tr><td><b>Trust</b></td><td>“No AI”, therapists, counsellors’ association</td><td>AI is the product; a “Why?” on every change</td></tr>
<tr><td><b>Safety</b></td><td>Help Now page; Reflect lists crisis lines</td><td><b>No crisis link in the app yet</b></td></tr>
</tbody></table></div>

<h2>10. Threats and opportunities</h2>
<div class="rs-split">
  <div class="rs-no"><b>Threats</b><ol>
    <li><b>“No AI” framing.</b> Any AI voice will meet “AI slop” objections. In our simulated panel, AI sceptics would not even try it.</li>
    <li><b>Their science story.</b> If they add per-person feedback to the Map, they get our story on top of a huge free library.</li>
    <li><b>Price anchor.</b> $59.99 a year sets what this market pays; our $100 is well above it.</li>
    <li><b>Fast copies.</b> Calm or Headspace could bolt “describe how you feel” onto their library.</li>
    <li><b>Rules.</b> Crisis handling for free-text feelings (California SB 243), no therapy claims (Illinois, Nevada), AI disclosure in the EU from Aug 2026 ({a(S['states'], 'Quartz')}, {a(S['art50'], 'AI Act Art. 50')}).</li>
  </ol></div>
  <div class="rs-yes"><b>Opportunities</b><ol>
    <li><b>The moment itself.</b> They will never make a session for your sentence tonight. “Something for every mood” is what their fans love most.</li>
    <li><b>Ask less.</b> Our onboarding is skippable and once-only. Keep the daily check-in to once a day, never before the first session.</li>
    <li><b>Proof for one person.</b> “This change helped you on 4 of 5 nights” beats a map of research mentions.</li>
    <li><b>A fair paywall.</b> Never charge for rewind, resume or replaying your own sessions.</li>
    <li><b>Their working channels.</b> Therapists sharing a session by link, and topic words (Sleep, Overthinking, Burnout) as one-tap starts.</li>
  </ol></div>
</div>

<h2>11. What we do next</h2>
<div class="rs-next">
  <div><span class="rs-tag rs-free">Before real users</span><ul><li>A visible “Need help now?” crisis link.</li><li>Daily check-in at most once a day, never on first sign-in.</li><li>Write down: rewind, resume and replay are never paid.</li><li>Say “made with AI” plainly, beside the “Why?”.</li></ul></div>
  <div><span class="rs-tag rs-paid">With the backend</span><ul><li>Make one real generated session for one group (racing mind at night).</li><li>Show each person their own before-and-after.</li><li>Test the price: $10 a month against a cheaper annual plan.</li></ul></div>
  <div><span class="rs-tag rs-later">Never</span><ul><li>Streak counters or milestone pop-ups.</li><li>Questions between someone’s first sentence and their first session.</li><li>Unannounced redesigns that hide saved things.</li></ul></div>
</div>

<h2>Sources and limits</h2>
<ul class="rs-list rs-small">
  <li>Public sources only, gathered 13–15 November 2026 by AI research agents; every claim in the full report is linked. Full report and notes: <code>docs/research/</code> in the repository.</li>
  <li>Builds on two internal studies: the Insight Timer replica study (2,000 App Store reviews, 13 Nov) and the founder test of our production versions (14 Nov). The founder test uses simulated people, so its numbers are an upper bound, not data.</li>
  <li>Reddit and Google Play reviews could not be read from the research environment.</li>
  <li>Most company figures are Insight Timer’s own claims or outside estimates, and are marked as such.</li>
</ul>
<div class="rs-close">{brand.mark(26)}<p><b>Aurelia · Research.</b> Insight Timer is a trademark of its owner; this is independent research from public sources.</p></div>
</div>
"""

CSS = """/* GENERATED by scripts/guides/research_insight_timer.py — do not edit. */
.gd-doc .rs { --rs-accent: #C25E0A; --rs-good: var(--gd-ok); --rs-good-soft: var(--gd-ok-soft); --rs-bad: #B4380C; --rs-bad-soft: #FDEDE6; --rs-warn: #A45A00; --rs-warn-soft: #FDEBCB; --rs-soft: var(--gd-accent-soft); }
.gd-doc .rs .rs-cover { position: relative; padding-top: 4px; }
.gd-doc .rs .rs-cover > *:not(.rs-glow):not(.rs-net) { position: relative; }
.gd-doc .rs .rs-glow { position: absolute; top: -90px; right: -40px; width: 300px; height: 300px; border-radius: 50%; background: #FFE682; opacity: .55; filter: blur(80px); pointer-events: none; }
.gd-doc .rs .rs-net { position: absolute; top: 18px; right: 0; width: 230px; height: auto; pointer-events: none; }
.gd-doc .rs .rs-brandrow { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.gd-doc .rs .rs-doclabel { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gd-muted); padding-left: 12px; border-left: 1px solid var(--gd-line); }
.gd-doc .rs .rs-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--rs-accent); margin: 0 0 6px; }
.gd-doc .rs .rs-cover h1 { margin-top: 0; max-width: 17ch; }
.gd-doc .rs .rs-grad { background: linear-gradient(95deg, #F2801A, #FCA22B); -webkit-background-clip: text; background-clip: text; color: transparent; }
.gd-doc .rs .rs-lede { font-size: 17px; color: var(--gd-muted); max-width: 58ch; }
.gd-doc .rs h2 { border-top: 3px solid transparent; border-image: linear-gradient(90deg, #FF8514, #FFE270 60%, transparent) 1; padding-top: 14px; }
.gd-doc .rs .rs-note, .gd-doc .rs .rs-cap { font-size: 13px; color: var(--gd-muted); }
.gd-doc .rs .rs-five { display: grid; gap: 10px; }
.gd-doc .rs .rs-five > div { background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 14px; padding: 12px 16px; display: grid; gap: 2px; }
.gd-doc .rs .rs-five > div:last-child { background: var(--rs-soft); border-color: #F1C46A; }
.gd-doc .rs .rs-five span, .gd-doc .rs .rs-who span, .gd-doc .rs .rs-flow span { font-size: 14px; color: var(--gd-muted); }
.gd-doc .rs .rs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.gd-doc .rs .rs-stats > div { background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 14px; padding: 12px 14px; }
.gd-doc .rs .rs-stats b { display: block; font-size: 24px; line-height: 1.2; font-variant-numeric: tabular-nums; }
.gd-doc .rs .rs-stats span { font-size: 13px; color: var(--gd-muted); }
.gd-doc .rs .rs-time { list-style: none; padding: 0; margin: 12px 0; border-left: 2px solid #F1C46A; }
.gd-doc .rs .rs-time li { position: relative; padding: 0 0 12px 18px; }
.gd-doc .rs .rs-time li::before { content: ""; position: absolute; left: -6px; top: 7px; width: 10px; height: 10px; border-radius: 50%; background: #FF8514; }
.gd-doc .rs .rs-time b { display: block; font-size: 13px; color: var(--rs-accent); }
.gd-doc .rs .rs-table { overflow-x: auto; border: 1px solid var(--gd-line); border-radius: 12px; background: var(--gd-surface); margin: 10px 0 16px; }
.gd-doc .rs .rs-table table { width: 100%; border-collapse: collapse; min-width: 560px; margin: 0; }
.gd-doc .rs .rs-table th, .gd-doc .rs .rs-table td { text-align: left; vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--gd-line); font-size: 14px; }
.gd-doc .rs .rs-table th { font-size: 11.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--gd-muted); }
.gd-doc .rs .rs-table tr:last-child td { border-bottom: 0; }
.gd-doc .rs .rs-table td em { color: var(--rs-warn); font-style: normal; font-size: 13px; }
.gd-doc .rs .rs-tag { display: inline-block; font-size: 11.5px; font-weight: 700; padding: 2px 9px; border-radius: 999px; white-space: nowrap; }
.gd-doc .rs .rs-free { background: var(--rs-good-soft); color: var(--rs-good); }
.gd-doc .rs .rs-paid { background: var(--rs-warn-soft); color: var(--rs-warn); }
.gd-doc .rs .rs-later { background: var(--rs-bad-soft); color: var(--rs-bad); }
.gd-doc .rs .rs-flow, .gd-doc .rs .rs-loop { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 12px 0; }
.gd-doc .rs .rs-flow > div { background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 12px; padding: 10px 14px; display: grid; }
.gd-doc .rs .rs-flow i, .gd-doc .rs .rs-loop i { font-style: normal; color: var(--rs-accent); font-weight: 700; }
.gd-doc .rs .rs-loop span { background: var(--rs-soft); border-radius: 999px; padding: 6px 12px; font-size: 14px; }
.gd-doc .rs .rs-list li { margin: 6px 0; }
.gd-doc .rs .rs-small { font-size: 14px; color: var(--gd-muted); }
.gd-doc .rs .rs-who, .gd-doc .rs .rs-next { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 12px 0; }
.gd-doc .rs .rs-who > div, .gd-doc .rs .rs-next > div { background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 14px; padding: 12px 14px; display: grid; align-content: start; gap: 4px; }
.gd-doc .rs .rs-next ul { margin: 6px 0 0; padding-left: 18px; font-size: 14px; }
.gd-doc .rs .rs-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin: 12px 0; }
.gd-doc .rs .rs-split > div { border-radius: 14px; padding: 12px 16px; border: 1px solid var(--gd-line); }
.gd-doc .rs .rs-split ul, .gd-doc .rs .rs-split ol { margin: 6px 0 0; padding-left: 18px; font-size: 14px; }
.gd-doc .rs .rs-split li { margin: 5px 0; }
.gd-doc .rs .rs-no { background: var(--rs-bad-soft); }
.gd-doc .rs .rs-no > b { color: var(--rs-bad); }
.gd-doc .rs .rs-yes { background: var(--rs-good-soft); }
.gd-doc .rs .rs-yes > b { color: var(--rs-good); }
.gd-doc .rs .rs-trend { display: flex; align-items: flex-end; gap: 14px; height: 170px; margin: 14px 0 4px; padding: 10px 12px 0; background: var(--gd-surface); border: 1px solid var(--gd-line); border-radius: 14px; }
.gd-doc .rs .rs-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 4px; }
.gd-doc .rs .rs-colbar { width: 100%; max-width: 54px; background: #D9776B; border-radius: 6px 6px 0 0; }
.gd-doc .rs .rs-colv { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.gd-doc .rs .rs-coly { font-size: 12px; color: var(--gd-muted); padding-bottom: 6px; }
.gd-doc .rs .rs-bars > div { display: grid; grid-template-columns: minmax(0, 1.4fr) 1fr 36px; align-items: center; gap: 10px; font-size: 14px; margin: 6px 0; }
.gd-doc .rs .rs-bars i { height: 10px; border-radius: 999px; background: linear-gradient(90deg, #D9776B var(--w), #F3EDE2 var(--w)); }
.gd-doc .rs .rs-bars b { text-align: right; font-variant-numeric: tabular-nums; }
.gd-doc .rs .rs-quote { margin: 14px 0; padding: 12px 16px; background: var(--rs-soft); border-left: 3px solid #F1C46A; border-radius: 8px; font-size: 15px; }
.gd-doc .rs .rs-quote span { display: block; margin-top: 6px; font-size: 12.5px; color: var(--gd-muted); }
.gd-doc .rs .rs-close { display: flex; align-items: center; gap: 12px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--gd-line); }
.gd-doc .rs .rs-close p { margin: 0; font-size: 14px; color: var(--gd-muted); }
.gd-doc .rs a { color: var(--rs-accent); text-decoration: underline; text-underline-offset: 2px; }
.gd-doc .rs .rs-table .table-wrap { border: 0; border-radius: 0; margin: 0; background: none; box-shadow: none; overflow: visible; }
@media (max-width: 640px) {
  .gd-doc .rs .rs-net { width: 150px; opacity: .6; }
  .gd-doc .rs .rs-bars > div { grid-template-columns: 1fr 36px; }
  .gd-doc .rs .rs-bars i { grid-column: 1 / -1; grid-row: 2; }
}
"""

open(OUT_HTML, 'w').write(HTML)
open(OUT_CSS, 'w').write(CSS)
print('wrote', OUT_HTML, len(HTML), OUT_CSS, len(CSS))
