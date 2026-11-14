"""Tallies the founder-consumer panel for Aurelia's three production versions.

Our own code, mirroring founder-consumer's panel.py tally and founder-pricing's
Van Westendorp method (the skills' own scripts were not run in this session).
Never writes an answer for a buyer: rows that are missing or broken are counted
as left out.

    python3 tally.py            # writes panel/results.json and prints a summary
"""
import collections, glob, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, 'panel')
cards = {c['id']: c for c in json.load(open(os.path.join(P, 'cards.json')))['cards']}
REASONS = {'price', 'habit', 'need', 'trust', 'quality', 'convenience', 'timing', 'values', 'other'}

answers, broken = {}, []
for f in sorted(glob.glob(os.path.join(P, 'answers-*.json'))):
    try:
        rows = json.load(open(f))
    except Exception as e:  # noqa: BLE001
        broken.append(f'{os.path.basename(f)}: {e}')
        continue
    for a in rows:
        ok = (a.get('id') in cards and isinstance(a.get('tries_free'), bool) and isinstance(a.get('pays'), bool)
              and a.get('reason_code') in REASONS and a.get('best_version') in (1, 2, 3)
              and all(isinstance(a.get(f'v{v}', {}).get('would_keep_using'), bool) for v in (1, 2, 3)))
        if ok:
            answers[a['id']] = a
        else:
            broken.append(a.get('id', '?'))
missing = sorted(set(cards) - set(answers))
A = [dict(answers[i], **{'card': cards[i]}) for i in sorted(answers)]
n = len(A)


def rate(rows, key):
    return sum(1 for r in rows if key(r)), len(rows)


def by(field):
    out = {}
    for name in sorted({r['card'][field] for r in A}):
        rows = [r for r in A if r['card'][field] == name]
        out[name] = {
            'n': len(rows),
            'tries': rate(rows, lambda r: r['tries_free'])[0],
            'pays': rate(rows, lambda r: r['pays'])[0],
            'keep': {v: rate(rows, lambda r, v=v: r[f'v{v}']['would_keep_using'])[0] for v in (1, 2, 3)},
            'best': dict(collections.Counter(r['best_version'] for r in rows)),
        }
    return out


# Van Westendorp: the four cumulative curves, intersections found on a price grid.
def vw():
    rows = [r for r in A if all(isinstance(r.get(k), (int, float)) for k in ('price_too_cheap', 'price_cheap', 'price_expensive', 'price_too_expensive'))]
    m = len(rows)
    grid = [x / 2 for x in range(0, 81)]  # $0 to $40 in 50c steps

    def share(p, k, below):
        return sum(1 for r in rows if (r[k] >= p if below else r[k] <= p)) / m
    tc = [share(p, 'price_too_cheap', True) for p in grid]
    ch = [share(p, 'price_cheap', True) for p in grid]
    ex = [share(p, 'price_expensive', False) for p in grid]
    te = [share(p, 'price_too_expensive', False) for p in grid]

    def cross(a, b):
        for i in range(1, len(grid)):
            if (a[i - 1] - b[i - 1]) * (a[i] - b[i]) <= 0 and a[i - 1] != b[i - 1]:
                return grid[i]
        return None
    pts = {
        'point_of_marginal_cheapness': cross(tc, ex),
        'optimal_price': cross(tc, te),
        'indifference_price': cross(ch, ex),
        'point_of_marginal_expensiveness': cross(ch, te),
    }
    med = lambda k: sorted(r[k] for r in rows)[m // 2]
    pts['medians'] = {k: med(k) for k in ('price_too_cheap', 'price_cheap', 'price_expensive', 'price_too_expensive')}
    pts['n'] = m
    pts['share_too_expensive_at_10'] = round(share(10, 'price_too_expensive', False), 2)
    pts['share_expensive_at_10'] = round(share(10, 'price_expensive', False), 2)
    return pts


res = {
    'n': n, 'missing': missing, 'broken': broken,
    'tries': rate(A, lambda r: r['tries_free'])[0],
    'pays': rate(A, lambda r: r['pays'])[0],
    'sessions_first_month_median_of_triers': (lambda s: s[len(s) // 2] if s else 0)(sorted(r['purchases_first_month'] for r in A if r['tries_free'])),
    'keep': {v: rate(A, lambda r, v=v: r[f'v{v}']['would_keep_using'])[0] for v in (1, 2, 3)},
    'best': dict(collections.Counter(r['best_version'] for r in A)),
    'worst': dict(collections.Counter(r.get('worst_version') for r in A)),
    'reasons_no_pay': dict(collections.Counter(r['reason_code'] for r in A if not r['pays']).most_common()),
    'by_segment': by('segment'),
    'by_behaviour': by('behaviour'),
    'price': vw(),
}
json.dump(res, open(os.path.join(P, 'results.json'), 'w'), indent=1)
print(json.dumps({k: res[k] for k in ('n', 'missing', 'broken', 'tries', 'pays', 'keep', 'best', 'worst', 'reasons_no_pay', 'price', 'sessions_first_month_median_of_triers')}, indent=1))
