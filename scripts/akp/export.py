"""Write the AKP catalogue files for the product owner (U150, J208).

Reads docs/akp/akps.json (written by `AKP_EXPORT=1 npx vitest run
src/admin/data/akpExport.test.ts`) and writes, stdlib only:

    docs/akp/akps.csv        one row per AKP
    docs/akp/akp-links.csv   one row per typed link
    docs/akp/akp-v2.xlsx     sheets AKPs, Links, Summary, StateFlips x AKPs
    public/akp/akp-v2.xlsx   the same workbook, served for the admin's download button

Run from the repo root: python3 -I scripts/akp/export.py [extra copy path]
An .xlsx is a zip of XML; this writes the minimum SpreadsheetML Excel,
Numbers and Google Sheets open (inline strings, one bold header style).
"""
import collections
import csv
import io
import json
import os
import shutil
import sys
import zipfile
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(ROOT, 'docs', 'akp')
COLS = ['id', 'name', 'function', 'family', 'kind', 'layer', 'modality', 'definition', 'used_for', 'helps', 'causal_role', 'signal', 'stateflips', 'links', 'source', 'status']


def col(n):
    s = ''
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def sheet_xml(rows, widths):
    out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
           '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
           '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
           '<cols>' + ''.join(f'<col min="{i}" max="{i}" width="{w}" customWidth="1"/>' for i, w in enumerate(widths, 1)) + '</cols>', '<sheetData>']
    for r, row in enumerate(rows, 1):
        cells = []
        for c, v in enumerate(row, 1):
            ref = f'{col(c)}{r}'
            style = ' s="1"' if r == 1 else ''
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                cells.append(f'<c r="{ref}"{style}><v>{v}</v></c>')
            else:
                text = escape(str(v or ''))
                cells.append(f'<c r="{ref}" t="inlineStr"{style}><is><t xml:space="preserve">{text}</t></is></c>')
        out.append(f'<row r="{r}">{"".join(cells)}</row>')
    out.append('</sheetData>')
    if rows:
        out.append(f'<autoFilter ref="A1:{col(len(rows[0]))}{len(rows)}"/>')
    out.append('</worksheet>')
    return '\n'.join(out)


def write_xlsx(path, sheets):
    names = [n for n, _, _ in sheets]
    ct = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
          '<Default Extension="xml" ContentType="application/xml"/>',
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>']
    ct += [f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(names) + 1)]
    ct.append('</Types>')
    rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
    wb = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
          + ''.join(f'<sheet name="{escape(n)}" sheetId="{i}" r:id="rId{i}"/>' for i, n in enumerate(names, 1)) + '</sheets></workbook>')
    wrels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
             + ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, len(names) + 1))
             + f'<Relationship Id="rId{len(names) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
    styles = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
              '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
              '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
              '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
              '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
              '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
              '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>')
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        # Fixed timestamps keep the file byte-identical when nothing changed.
        def put(name, data):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 28, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data)
        put('[Content_Types].xml', '\n'.join(ct))
        put('_rels/.rels', rels)
        put('xl/workbook.xml', wb)
        put('xl/_rels/workbook.xml.rels', wrels)
        put('xl/styles.xml', styles)
        for i, (_, rows, widths) in enumerate(sheets, 1):
            put(f'xl/worksheets/sheet{i}.xml', sheet_xml(rows, widths))


def write_csv(path, rows):
    buf = io.StringIO()
    csv.writer(buf, lineterminator='\r\n').writerows(rows)
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        f.write(buf.getvalue())


def main():
    with open(os.path.join(DOCS, 'akps.json'), encoding='utf-8') as f:
        d = json.load(f)
    akps = d['akps']
    name = {a['id']: a['name'] for a in akps}
    akp_rows = [COLS] + [[a[c] for c in COLS] for a in akps]
    link_rows = [['from', 'type', 'to', 'from_name', 'to_name']]
    for a in akps:
        for l in a['links'].split():
            t, _, to = l.partition(':')
            link_rows.append([a['id'], t, to, a['name'], name.get(to, '')])
    write_csv(os.path.join(DOCS, 'akps.csv'), akp_rows)
    write_csv(os.path.join(DOCS, 'akp-links.csv'), link_rows)

    # Summary: per function, per family, per layer.
    summary = [['view', 'group', 'akps', 'from workbooks', 'drafted by us', 'with a StateFlip', 'links out']]
    for view, key in [('function', lambda a: a['function']), ('family', lambda a: a['family']), ('layer', lambda a: f"{a['family']} · {a['layer']}")]:
        g = collections.OrderedDict()
        for a in akps:
            g.setdefault(key(a), []).append(a)
        for k, rows in sorted(g.items(), key=lambda kv: (-len(kv[1]), kv[0])):
            summary.append([view, k, len(rows), sum(r['source'].startswith('from ') for r in rows), sum(not r['source'].startswith('from ') for r in rows),
                            sum(bool(r['stateflips']) for r in rows), sum(len(r['links'].split()) for r in rows)])
    summary.append(['total', 'all', len(akps), sum(a['source'].startswith('from ') for a in akps), sum(not a['source'].startswith('from ') for a in akps),
                    sum(bool(a['stateflips']) for a in akps), len(link_rows) - 1])

    # StateFlips x AKPs: strategy AKPs per family serving each StateFlip, and the chapter kit.
    fams = [f['id'] for f in d['families'] if f['kind'] != 'goal']
    per = collections.defaultdict(collections.Counter)
    for a in akps:
        if a['kind'] == 'goal':
            continue
        for s in a['stateflips'].split():
            per[s][a['family']] += 1
    cov = [['stateflip', 'dimension', 'title'] + fams + ['total', 'chapter ready'] + [f'kit: {c}' for c in d['chapterFamilies']]]
    for s in d['stateflips']:
        c = per[s['id']]
        ready = all(s['kit'][x] for x in d['chapterFamilies'])
        cov.append([s['id'], s['dimension'], s['title']] + [c[f] for f in fams] + [sum(c.values()), 'yes' if ready else 'no'] + [s['kit'][x] for x in d['chapterFamilies']])

    out = os.path.join(DOCS, 'akp-v2.xlsx')
    write_xlsx(out, [
        ('AKPs', akp_rows, [14, 34, 11, 11, 9, 26, 9, 60, 30, 30, 40, 50, 30, 40, 50, 8]),
        ('Links', link_rows, [16, 10, 16, 34, 34]),
        ('Summary', summary, [10, 44, 8, 14, 14, 16, 10]),
        ('StateFlips x AKPs', cov, [11, 11, 44] + [9] * len(fams) + [7, 12] + [14] * len(d['chapterFamilies'])),
    ])
    pub = os.path.join(ROOT, 'public', 'akp')
    os.makedirs(pub, exist_ok=True)
    shutil.copyfile(out, os.path.join(pub, 'akp-v2.xlsx'))
    for extra in sys.argv[1:]:
        shutil.copyfile(out, extra)
    print(f'{len(akps)} AKPs, {len(link_rows) - 1} links, {len(cov) - 1} StateFlips -> {out}', file=sys.stderr)


if __name__ == '__main__':
    main()
