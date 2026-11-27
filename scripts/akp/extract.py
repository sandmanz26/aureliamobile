"""Extract the rows the AKP catalogue and the 125 StateFlips draw on (U141, J203).

Reads the business owner's workbooks in docs/briefs/ (stdlib only: an .xlsx is a
zip of XML) and writes src/admin/data/generated/akpSource.ts, which
src/admin/data/stateFlips.ts and akps.ts build from. Run from the repo root:

    python3 -I scripts/akp/extract.py

Nothing is invented here: every row keeps the sheet's own ID (or, where the
sheet has none, its VES id + evolutionary frame). Excel stored some frames
("1-3") as dates; they are turned back into "month-day" as the sheet means them.
"""
import datetime
import html
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BRIEFS = os.path.join(ROOT, 'docs', 'briefs')
OUT = os.path.join(ROOT, 'src', 'admin', 'data', 'generated', 'akpSource.ts')


def load(name):
    z = zipfile.ZipFile(os.path.join(BRIEFS, name))
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss = [html.unescape(re.sub('<[^>]+>', '', s)) for s in re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode(), re.S)]
    wb = z.read('xl/workbook.xml').decode()
    rels = z.read('xl/_rels/workbook.xml.rels').decode()
    out = {}
    for sheet, rid in re.findall(r'<sheet [^>]*name="([^"]*)"[^>]*r:id="([^"]*)"', wb):
        tgt = re.search(r'Id="%s"[^>]*Target="([^"]*)"' % rid, rels) or re.search(r'Target="([^"]*)"[^>]*Id="%s"' % rid, rels)
        x = z.read('xl/' + tgt.group(1).lstrip('/').replace('xl/', '')).decode()
        rows = []
        for row in re.findall(r'<row[^>]*>(.*?)</row>', x, re.S):
            r = {}
            for a, v in re.findall(r'<c ([^>]*?)(?:/>|>(.*?)</c>)', row, re.S):
                col = re.search(r'r="([A-Z]+)', a).group(1)
                m = re.search(r'<v>(.*?)</v>', v or '', re.S) or re.search(r'<t[^>]*>(.*?)</t>', v or '', re.S)
                if m:
                    r[col] = html.unescape(ss[int(m.group(1))] if 't="s"' in a else m.group(1)).strip()
            if r:
                rows.append(r)
        out[html.unescape(sheet).strip()] = rows
    return out


def frame(v):
    """'0-1' stays; an Excel date serial (45292 = 1 Jan) becomes '1-1'; '2.0' becomes '2'."""
    try:
        n = float(v)
    except ValueError:
        return v
    if n > 40000:
        d = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(n))
        return f'{d.month}-{d.day}'
    return str(int(n)) if n == int(n) else v


def clean(s, n=220):
    s = re.sub(r'\s+', ' ', (s or '').replace('"', '').replace('“', '').replace('”', '')).strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + '…'


def unique_ids(rows, key='id'):
    seen = {}
    for r in rows:
        base = r[key]
        seen[base] = seen.get(base, 0) + 1
        if seen[base] > 1:
            r[key] = f'{base}#{seen[base]}'
    return rows


def concepts(rows):
    out = []
    for r in rows:
        if not re.match(r'^[A-Z]{1,2}\d?$', r.get('A', '')) or not r.get('C') or r.get('A') == 'VESID':
            continue
        out.append({'id': f"{r['A']} {frame(r.get('B', ''))}", 'ves': r['A'], 'frame': frame(r.get('B', '')), 'name': clean(r['C'], 80),
                    'objective': clean(r.get('D', ''), 160), 'obstacle': clean(r.get('H', ''), 40), 'wellness': clean(r.get('I', ''), 40)})
    return unique_ids(out)


def main():
    dojo = load('2026-11-26-dojo-objective-learning.xlsx')
    deek = load('2026-11-27-deeksha-objective-learning.xlsx')
    grand = load('2026-11-27-grand-4-layers-akp-master-knowledge.xlsx')
    ident = load('2026-11-27-wellness-identity-akp-first-view.xlsx')
    prod = load('2026-11-27-uiux-product-akps.xlsx')
    bar = load('2026-11-27-bar-elements-operating-model.xlsx')
    src = {'_generated_by': 'scripts/akp/extract.py', '_from': 'docs/briefs/*.xlsx'}

    # Deeksha: 12 pillars (P1-P4 and S1-S11) and the universal needs UN001…
    pillars = []
    for r in deek['12P']:
        if re.match(r'^P\d$', r.get('A', '')) and not r.get('B'):
            pillars.append({'id': r['A'], 'name': r.get('C', ''), 'issues': r.get('F', '')})
        elif re.match(r'^S\d+$', r.get('B', '')):
            pillars.append({'id': r['B'], 'parent': r.get('A', ''), 'name': r.get('C', ''), 'issues': r.get('F', '')})
    src['pillars'] = pillars
    un, p1 = [], ''
    for r in deek['UN']:
        if not re.match(r'^UN\d+$', r.get('C', '')):
            continue
        p1 = r.get('A') or p1
        un.append({'id': r['C'], 'pillar1': p1, 'pillar2': r.get('B', ''), 'obstacle': clean(r.get('E', ''), 120), 'obstacleKw': clean(r.get('F', ''), 30),
                   'wellnessKw': clean(r.get('G', ''), 30), 'headline': clean(r.get('H', ''), 80)})
    # Pillar 2 is only written on the first row of each block.
    last = ''
    for u in un:
        last = u['pillar2'] = u['pillar2'] or last
    src['un'] = unique_ids(un)

    # DOJO: VES, concepts, duals, skills / moods / states / habits.
    src['vesC'] = [{'id': r['A'], 'name': r.get('B', '')} for r in dojo['VES_C'] if re.match(r'^C\d$', r.get('A', ''))][:7]
    src['vesM'] = [{'id': r['A'], 'name': clean(r.get('B', ''), 40)} for r in dojo['VES_M'] if re.match(r'^M\d+$', r.get('A', ''))]
    src['dojoC'] = concepts(dojo['DOJO_C'])
    src['dojoM'] = concepts(dojo['DOJO_M'])
    duals = []
    for r in dojo['DOJO_C_Duals']:
        if not re.match(r'^DI\d+$', r.get('C', '')):
            continue
        duals.append({'id': r['C'], 'ves': r.get('A', ''), 'frame': frame(r.get('B', '')), 'name': clean(r.get('D', ''), 70),
                      'emoIssue': clean(r.get('E', ''), 40), 'emoWell': clean(r.get('G', ''), 40), 'mentIssue': clean(r.get('I', ''), 40),
                      'mentWell': clean(r.get('K', ''), 40), 'physIssue': clean(r.get('M', ''), 40), 'physWell': clean(r.get('O', ''), 40)})
    # The sheet's VES id is only written on some rows; carry it down.
    last = ''
    for d in duals:
        last = d['ves'] = d['ves'] or last
    src['duals'] = unique_ids(duals)
    tables = {'Skill ID': 'skills', 'Mood ID': 'moods', 'State ID': 'states', 'Habit ID': 'habits'}
    cur, db = None, {v: {} for v in tables.values()}
    for r in dojo['DB-skills']:
        if r.get('A') in tables:
            cur = tables[r['A']]
            continue
        if cur and re.match(r'^[A-Z]+\d+$', r.get('A', '')):
            if cur in ('skills', 'habits'):
                db[cur].setdefault(r['A'], {'id': r['A'], 'name': clean(r.get('B', ''), 60), 'role': clean(r.get('C', ''), 160)})
            else:
                db[cur].setdefault(r['A'], {'id': r['A'], 'parent': r.get('B', ''), 'name': clean(r.get('C', ''), 60), 'role': clean(r.get('E', ''), 160)})
    for k, v in db.items():
        src[k] = list(v.values())

    # Grand 4 layers: layer × modality, with the example instances the sheet names.
    g, mod, hier = [], '', ''
    for r in grand['Sheet1']:
        a = r.get('A', '')
        if a == 'Layer' or 'Grand Total' in a:
            break  # the summary table under the four modalities
        if a == 'Modality':
            continue
        if a in ('Script', 'Music', 'Image', 'Video'):
            mod = a
        b = r.get('B', '')
        if b and not re.match(r'^[\d.,~ ]+$', b):
            hier = b
        c = r.get('C', '')
        if not mod or not c or c in ('Subtotal', 'Layer'):
            continue
        g.append({'modality': mod, 'hierarchy': hier, 'layer': clean(c, 60), 'types': r.get('D', ''), 'examples': clean(r.get('E', ''), 120), 'role': clean(r.get('F', ''), 120)})
    src['grand4'] = g

    # Wellness identity: Grand 12 and Light (grouped under their parent rows).
    src['identityGrand'] = [{'name': r['A'], 'types': r.get('B', ''), 'role': clean(r.get('D', ''), 160), 'downstream': clean(r.get('F', ''), 120)}
                            for r in ident['Grand'] if r.get('A') and r.get('A') != 'Dimension']
    light, parent = [], ''
    for r in ident['Light']:
        if not r.get('A') or r['A'] == 'Dimension':
            continue
        try:
            t = float(r.get('B', '0'))
        except ValueError:
            t = 0
        if t >= 15:
            parent = r['A']
            light.append({'name': r['A'], 'parent': '', 'role': clean(r.get('D', ''), 160)})
        else:
            light.append({'name': r['A'], 'parent': parent, 'role': clean(r.get('D', ''), 160)})
    src['identityLight'] = light

    # Product AKPs: the 13 dimension sheets, each row keeps its own ID (UO1, UM2…).
    dims = {r['A'].split('. ', 1)[1]: r for r in prod['Grand'] if re.match(r'^\d+\. ', r.get('A', ''))}
    sheet_dim = {'Outcome': 'UX Outcomes', 'UX mechanics': 'UX Mechanisms', 'Interaction mechanics': 'Interaction Mechanics', 'User states': 'Cognitive User States',
                 'Usage skills': 'Product Usage Skills', 'Navi methods': 'Navigation Methods', 'Interaction techs': 'Interaction Techniques', 'Flow frameworks': 'Flow Frameworks',
                 'Archetypes': 'System Archetypes', 'UI styles & tones': 'UI Styles & Tones', 'Session context': 'Session Contexts', 'Platforms': 'Platform Environments',
                 'dynamic parameters': 'Dynamic Parameters'}
    products = []
    for sheet, dim in sheet_dim.items():
        hdr = prod[sheet][0]
        for r in prod[sheet]:
            if not re.match(r'^[A-Z]{2}\d+$', r.get('A', '')):
                continue
            up = r.get('D', '') if 'Upstream' in hdr.get('D', '') else ''
            products.append({'id': r['A'], 'name': clean(r.get('B', ''), 60), 'dimension': dim, 'role': clean(r.get('C', ''), 140), 'upstream': clean(up, 60),
                             'dimRole': clean(dims.get(dim, {}).get('C', ''), 80)})
    src['product'] = unique_ids(products)

    # BAR elements operating model: bars, elements, script frameworks.
    src['bars'] = unique_ids([{'id': r['A'], 'name': clean(r.get('D', ''), 60), 'segment': r.get('B', ''), 'phase': r.get('C', ''), 'role': clean(r.get('E', ''), 140)}
                              for r in bar['BARS'] if re.match(r'^[A-Z]{2}\d{3}$', r.get('A', ''))])
    src['elements'] = unique_ids([{'id': f"{r['A']} {r['B']}", 'bar': r['A'], 'name': clean(r.get('C', ''), 60), 'section': r.get('D', ''), 'role': clean(r.get('H', ''), 140)}
                                  for r in bar['ELEMENTS'] if re.match(r'^[A-Z]{2}\d{3}$', r.get('A', '')) and r.get('B')])
    src['frameworks'] = [{'id': r['A'], 'name': clean(r.get('B', ''), 60), 'focus': clean(r.get('C', ''), 60), 'role': clean(r.get('E', ''), 140)}
                         for r in bar['Frameworks KB ( improve Element'] if re.match(r'^F\d+$', r.get('A', ''))]

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// GENERATED by scripts/akp/extract.py from docs/briefs/*.xlsx (U141, J203). Do not edit by hand: re-run the script.\n')
        f.write('export const AKP_SOURCE = ')
        json.dump(src, f, ensure_ascii=False, indent=0)
        f.write('\n')
    print({k: len(v) for k, v in src.items() if isinstance(v, list)}, file=sys.stderr)


if __name__ == '__main__':
    main()
