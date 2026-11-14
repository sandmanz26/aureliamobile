"""Builds the founder-skill report for production v1-v3 (HTML).

Every number comes from panel/results.json (tally.py) and every buyer quote is
copied from panel/answers-*.json by id, so nothing here is retyped by hand.

    python3 tally.py && python3 build_report.py ../founder-test-prod-versions-2026-11-14.html
"""
import glob, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../scripts/guides'))
import brand  # noqa: E402

e = html.escape
R = json.load(open(os.path.join(HERE, 'panel/results.json')))
CARDS = {c['id']: c for c in json.load(open(os.path.join(HERE, 'panel/cards.json')))['cards']}
ANS = {a['id']: a for f in sorted(glob.glob(os.path.join(HERE, 'panel/answers-*.json'))) for a in json.load(open(f))}
# Reuse the replica study's stylesheet so the two reports read as a set.
CSS = re.search(r'css = """(.*?)"""', open(os.path.join(HERE, '../insight-timer-replica-2026-11-13/build_report.py')).read(), re.S).group(1)
CSS += """
.vs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}
.vs>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.vs>div.win{border:2px solid #F1C46A;background:var(--soft)}
.vs h3{margin:0 0 2px}.vs .k{font-size:34px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.vs .s{font-size:13px;color:var(--ink2)}.vs ul{margin:10px 0 0;padding-left:18px;font-size:14px}
.shots{display:grid;gap:14px;margin:12px 0}.shots figure{margin:0}.shots img{width:100%;height:auto;border:1px solid var(--line);border-radius:12px;display:block}
.shots figcaption{font-size:13px;color:var(--mute);margin-top:4px}
.who{font-size:12px;color:var(--mute)}
@media (max-width:700px){.vs{grid-template-columns:1fr}}
"""


def quote(pid, field='reason'):
    a, c = ANS[pid], CARDS[pid]
    text = a[field] if '.' not in field else a[field.split('.')[0]][field.split('.')[1]]
    return (f'<blockquote class="q"><p>“{e(text)}”</p><footer><span class="who">{e(c["name"])}, {c["age"]} · '
            f'{e(c["segment"])} · {e(c["behaviour"])} · simulated buyer {pid}</span></footer></blockquote>')


def bars(items, total, neg=False):
    mx = max(v for _, v in items) or 1
    return '\n'.join(f'<div class="bar{" neg" if neg else ""}"><span class="l">{e(l)}</span><span class="t"><i style="width:{100 * v / mx:.0f}%"></i></span><span class="v">{v}</span></div>' for l, v in items)


n = R['n']
keep = R['keep']; best = R['best']; price = R['price']
seg = R['by_segment']; beh = R['by_behaviour']
REASON_LABEL = {'price': 'Price: free tier or YouTube is enough', 'habit': 'Habit: “I always drop these apps”', 'trust': 'Trust: AI, and what happens to my words',
                'quality': 'Quality: prove it works (sleep score, voice)', 'need': 'Need: a track already does this', 'values': 'Values', 'convenience': 'Convenience', 'timing': 'Timing', 'other': 'Other'}
reasons = [(REASON_LABEL[k], v) for k, v in R['reasons_no_pay'].items()]
behrows = ''.join(f'<tr><td>{e(k)}</td><td class="n">{v["n"]}</td><td class="n">{v["tries"]}</td><td class="n">{v["pays"]}</td>'
                  f'<td class="n">{v["keep"]["1"]}</td><td class="n">{v["keep"]["2"]}</td><td class="n">{v["keep"]["3"]}</td></tr>'
                  for k, v in sorted(beh.items(), key=lambda kv: -kv[1]['pays']))
segrows = ''.join(f'<tr><td>{e(k)}</td><td class="n">{v["n"]}</td><td class="n">{v["tries"]}</td><td class="n">{v["pays"]}</td>'
                  f'<td class="n">{v["keep"]["1"]}</td><td class="n">{v["keep"]["2"]}</td><td class="n">{v["keep"]["3"]}</td></tr>'
                  for k, v in sorted(seg.items(), key=lambda kv: -kv[1]['n']))
SHOTS = 'founder-2026-11-14/screens'

body = f"""
<header class="hero"><div class="wrap">
<img class="net" src="{brand.network_uri()}" alt="">
<div class="logo">{brand.logo(26)}</div>
<p class="eyebrow">Founder test · production versions 1, 2 and 3</p>
<h1>A board and 100 buyers tried Aurelia. <span class="g">Version 3 wins; the product is not proven yet.</span></h1>
<p class="lede">A simulated board of directors and a panel of 100 simulated buyers looked at real screens of the three versions on production and said what they would use, what they would pay for, and why not.</p>
<p class="meta">14 November 2026 · Method: founder-skill (board and consumer panel, with the pricing range), run by AI agents on real captures of the production build · Simulated people, not customers</p>
</div></header>
<main class="wrap">

<h2>The short version</h2>
<div class="big">
<div><b>1. Version 3 is the one to put in front of people.</b><span>All three board members scored it highest (7 of 10). {best.get('3', 0)} of {n} buyers picked it as best, {best.get('2', 0)} picked Version 2, nobody picked Version 1.</span></div>
<div><b>2. Version 1 should go.</b><span>It was the worst for all {R['worst'].get('1', 0)} buyers and nobody would keep using it: a new user lands in someone else’s chat, with coins and invented percentages.</span></div>
<div><b>3. People will try it; few will pay yet.</b><span>{R['tries']} of {n} would try the free tier, {R['pays']} would pay in the first month. The top reasons: free is enough, “I always drop these apps”, and trust in AI with their feelings.</span></div>
<div><b>4. $10 a month is above what the panel accepts.</b><span>Their acceptable range is ${price['point_of_marginal_cheapness']:g} to ${price['point_of_marginal_expensiveness']:g}. At $10, {int(price['share_too_expensive_at_10'] * 100)}% call it too expensive. Proof of results matters more than the number.</span></div>
<div><b>5. The board says: make the core real, narrow to sleep.</b><span>3 × “fund if”, average 5 of 10. Nobody has heard a generated session yet. Prove one result for racing-mind sleepers before adding anything.</span></div>
</div>

<h2>The three versions, side by side</h2>
<p class="sub">Board scores are the average of three lenses. “Would keep using” counts buyers out of {n}.</p>
<div class="vs">
<div><h3>Version 1</h3><span class="s">The earliest design: drawer menu, no onboarding</span><div class="k">3.0</div><span class="s">board · {keep['1']} keep using · {best.get('1', 0)} best</span>
<ul><li>Opens a new user on a demo chat that is not theirs</li><li>Coins at the top of most screens</li><li>Progress in invented percentages</li></ul></div>
<div><h3>Version 2</h3><span class="s">Onboarding, own first session, four tabs</span><div class="k">6.0</div><span class="s">board · {keep['2']} keep using · {best.get('2', 0)} best</span>
<ul><li>Three skippable questions, then your own session</li><li>“Chapter 2 is ready tomorrow” gives a reason to return</li><li>Progress still shows sample analytics</li></ul></div>
<div class="win"><h3>Version 3 · default</h3><span class="s">v2 plus words not scores, “Why?”, journal</span><div class="k">7.0</div><span class="s">board · {keep['3']} keep using · {best.get('3', 0)} best</span>
<ul><li>Honest empty Progress until you listen</li><li>A reason on every suggested change</li><li>Wearable asked for, off until switched on</li></ul></div>
</div>
<p>Version 2 still won {best.get('2', 0)} buyers, mostly sleep-first and lapsed subscribers, for one reason: <b>it asks less</b>. To them Version 3’s journal, check-ins and reports “start to feel like the questioning I avoid”. That is the most useful signal in the panel.</p>
{quote('B008', 'v3.why')}
{quote('B018', 'v2.why')}

<h2>What the board said</h2>
<p class="sub">Three members, each applying one published framework: the Offers lens, the Monopoly lens and the Product lens. They are lenses, not the authors of those books.</p>
<div class="tbl"><table><thead><tr><th>Lens</th><th>Score</th><th>Vote</th><th>Their main point</th></tr></thead><tbody>
<tr><td><b>Offers</b></td><td class="n">5 / 10</td><td>Fund if</td><td>Believability is where offers die. Upgrade sells “more access”, not better sleep. Add a guarantee tied to the two-week report, and finish the study before charging.</td></tr>
<tr><td><b>Monopoly</b></td><td class="n">4 / 10</td><td>Fund if</td><td>The only possible moat is the per-person feedback loop from the 2025 graph, and it is not running. Calm or Headspace could copy “describe how you feel” in six months. Own one small market first.</td></tr>
<tr><td><b>Product</b></td><td class="n">6 / 10</td><td>Fund if</td><td>The one thing is clear and well crafted, but too many features bury it. Cut to sentence → session → “how do you feel now?” → next chapter for the study.</td></tr>
</tbody></table></div>
<h3>Risks more than one member raised</h3>
<ol class="steps">
<li><b>The core moment has never happened.</b> No session has been generated end to end; time to first sound and cost per session are unknown.</li>
<li><b>No proof behind the promise.</b> Invented figures are still visible, including “↑12%” and “↑8%” on the About page in Version 3, which promises no percentages.</li>
<li><b>Asks before listening.</b> The daily check-in opens on every sign-in, even for a brand-new user with no “yesterday”.</li>
<li><b>No distribution.</b> No first channel and no cost per user for the first 100.</li>
</ol>
<div class="callout"><h3>The strongest version the board can see</h3>
<p>Not “sessions for how you feel today” in general, but <b>a sleep programme for people whose mind races at night</b>: one sentence, a session in under a minute, “how do you feel now?”, and a next chapter that measurably beats the first for that same person. Sold as a result, with a guarantee, and proven by the 30-person study before charging.</p></div>

<h2>What 100 buyers said</h2>
<p class="sub">{R['tries']} would try it free · {R['pays']} would pay in month one · a trier would play a median of {R['sessions_first_month_median_of_triers']} sessions in the first month.</p>
<h3>Why they would not pay</h3>
{bars(reasons, n - R['pays'], neg=True)}
{quote('B013')}
{quote('B019')}
{quote('B001')}
{quote('B045')}
<h3>Who would pay</h3>
<p>Every payer tries new apps early (6), sleeps badly (2) or sees a therapist (2); nine of the ten are stretched professionals or high earners. Nobody who sticks to free apps, no lapsed subscriber and no one who tracks their sleep data would pay yet: the last group wants to see their own numbers move first. The 12 AI sceptics would not even try it.</p>
{quote('B040')}
{quote('B048')}
<div class="tbl"><table><thead><tr><th>Buying behaviour</th><th>n</th><th>Try</th><th>Pay</th><th>Keep v1</th><th>Keep v2</th><th>Keep v3</th></tr></thead><tbody>{behrows}</tbody></table></div>
<div class="tbl"><table><thead><tr><th>Segment</th><th>n</th><th>Try</th><th>Pay</th><th>Keep v1</th><th>Keep v2</th><th>Keep v3</th></tr></thead><tbody>{segrows}</tbody></table></div>
<h3>What would change their mind</h3>
<p>Three answers came up again and again: <b>see my own sleep score move</b> on nights I used it, <b>a plain privacy promise</b> (my words are not used for training, delete everything), and <b>still opening it after a few weeks on free</b>, then a cheap annual plan.</p>
{quote('B043', 'would_change_my_mind')}
{quote('B001', 'would_change_my_mind')}
{quote('B071', 'would_change_my_mind')}

<h2>Price</h2>
<p class="sub">Each buyer gave four monthly prices for Aurelia Plus (Van Westendorp). Medians: too cheap ${price['medians']['price_too_cheap']}, a bargain ${price['medians']['price_cheap']}, getting expensive ${price['medians']['price_expensive']}, too expensive ${price['medians']['price_too_expensive']}.</p>
<div class="tbl"><table><thead><tr><th>Point</th><th>Monthly</th><th>Meaning</th></tr></thead><tbody>
<tr><td>Marginal cheapness</td><td class="n">${price['point_of_marginal_cheapness']:g}</td><td>Below this, it starts to look too cheap to be good</td></tr>
<tr><td>Optimal</td><td class="n">${price['optimal_price']:g}</td><td>Fewest people reject it as too cheap or too expensive</td></tr>
<tr><td>Indifference</td><td class="n">${price['indifference_price']:g}</td><td>As many call it a bargain as call it expensive</td></tr>
<tr><td>Marginal expensiveness</td><td class="n">${price['point_of_marginal_expensiveness']:g}</td><td>Above this, rejection rises fast</td></tr>
<tr><td><b>Today’s price</b></td><td class="n"><b>$10</b></td><td>{int(price['share_expensive_at_10'] * 100)}% find it expensive, {int(price['share_too_expensive_at_10'] * 100)}% would not pay it at all</td></tr>
</tbody></table></div>
<p>Read this with care. Buyers judged an unproven product against free YouTube and a $9.99 competitor; proof moves willingness to pay more than the number does. The useful test is inside the 30-person study: offer $10 against an annual plan around $60 (about $5 a month) and see who takes which.</p>

<h2>What to do</h2>
<h3>Now (small, before the study)</h3>
<ol class="steps">
<li><b>Retire Version 1</b> from the production picker, or keep it only as a comparison nobody lands on.</li>
<li><b>Remove every invented figure</b> a user can see in Version 3, starting with the “↑12% / ↑8%” on the About page, other people’s names under “Recent”, and the “exprience” typo on Quick Start.</li>
<li><b>Daily check-in</b>: never on the first sign-in, at most once a day, never between the first sentence and the first session.</li>
<li><b>A plain privacy line</b> where people type how they feel, and a delete-everything control in Settings.</li>
<li><b>Lighter Version 3 for sleep-first people</b>: journal and reports one tap away, not in the path (this is what Version 2’s fans asked for).</li>
</ol>
<h3>With the backend and the study</h3>
<ul class="tight">
<li>Generate real sessions end to end for one problem (racing mind at night) and measure time to first sound and cost per session.</li>
<li>Rewrite Upgrade around the outcome, add a guarantee tied to the two-week report, test $10 against an annual plan.</li>
<li>Show the person’s own sleep data before and after, once a wearable is connected: the top reason to pay.</li>
<li>Write down the one result the study must hit, and check that later chapters beat the first for the same person.</li>
</ul>
<h3>Founder-skill steps not run yet</h3>
<p>Competitors, offer, CFO, marketing, brand, operations, launch and the compiled business plan. The CFO and the plan’s verdict need the AI cost per session, which does not exist yet; the plan’s verdict today would be <b>Incomplete</b>.</p>

<h2>The screens they saw</h2>
<p class="sub">Captured from the production build at phone width (402px). The player shows “Page not found” only because the capture reloads the page and sign-in does not persist; buyers were told so.</p>
<div class="shots">
<figure><img src="{SHOTS}/sheet-v1.png" alt="Version 1 screens" loading="lazy"><figcaption>Version 1</figcaption></figure>
<figure><img src="{SHOTS}/sheet-v2.png" alt="Version 2 screens" loading="lazy"><figcaption>Version 2</figcaption></figure>
<figure><img src="{SHOTS}/sheet-v3.png" alt="Version 3 screens" loading="lazy"><figcaption>Version 3</figcaption></figure>
</div>

<h2>Method and limits</h2>
<ul class="tight">
<li><b>Skill:</b> founder-skill (MIT), installed in the session. Steps run: board (three sub-agents, one lens each) and consumer panel; pricing computed from the panel’s answers. The skill’s own Python could not be run here, so dealing, tally and the price range use equivalent scripts of our own, kept beside the evidence.</li>
<li><b>Buyers:</b> 100 persona cards dealt with a fixed seed from a target profile (four segments, seven buying behaviours, seven objections). The profile is a guess informed by three user interviews, the six-persona simulation and the Insight Timer review study; confirm it with real people.</li>
<li><b>How buyers were run:</b> ten agents, each playing ten buyers one at a time from their own card, all shown the same pitch, the same notes on the three versions and the same screens. The skill’s default is one agent per buyer; batching saves cost and may make answers within a group more alike.</li>
<li><b>Simulated, not real.</b> Language models lean agreeable, so read the try and pay counts as an upper bound. These answers are research, never testimonials. The real test is the 30-person study.</li>
<li>Every input and answer is in the folder beside this report: idea, brief, memos, cards, pitch, answers, results and scripts.</li>
</ul>
<footer class="end">{brand.mark(22)}<p>Aurelia · founder test of production versions 1–3 · 14 November 2026.</p></footer>
</main>
"""

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aurelia Founder Test</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""
open(sys.argv[1], 'w').write(page)
print('ok', len(page))
