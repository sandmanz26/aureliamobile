# The AKP catalogue, as files (v2)

U150, J208, 28 Nov 2026. 3,106 atomic knowledge points (AKPs), all **draft**. These files are the generated catalogue, before any edit made in the admin; the admin's **Download catalogue (xlsx/csv)** box on StateFlips → AKP catalogue gives the same workbook, and CSVs with the edits applied.

| File | What it is |
| --- | --- |
| `akp-v2.xlsx` | The workbook. Sheets: **AKPs** (one row per AKP), **Links** (one row per typed link), **Summary** (counts per function, family and layer), **StateFlips x AKPs** (per StateFlip: strategy AKPs per family, whether a chapter can be assembled, and the chapter kit) |
| `akps.csv` | The AKPs sheet as CSV (UTF-8 with BOM, so Excel shows accents) |
| `akp-links.csv` | The Links sheet as CSV |
| `akps.json` | Everything above as JSON, plus the family table; the input of the export script |
| `AKP-ROAST.md` | What was weak in v1, what v2 fixed, and what is still weak (scored against his needs) |
| `BUYER-TEST-9.md` | Buyer agent test 9: the first chapter, assembled from AKPs, shown in the offer |

## Columns of the AKPs sheet

| Column | Meaning |
| --- | --- |
| `id` | Stable ID. The prefix is the family: WG goal, ID identity, WS script, WN voice, WM music, WI image, WV video, PR product, BZ business, BR brand, AN analysis. Product AKPs keep the UI/UX sheet's own IDs (UO2, SC1…); v2 continues them (UO9…) |
| `name` | Plain name; unique across the catalogue (normalised: case and punctuation ignored) |
| `function` | One of his five functions: wellness, product, business, brand, analysis; plus identity (the persona mindspace, not a prototype function) |
| `family` | goal, identity, script, voice, music, image, video, product, business, brand, analysis |
| `kind` | goal (what to reach), strategy (how: levers and tactics), measure (how an effect is read) |
| `layer` | The layer inside the family: a Grand 4 layers layer (e.g. Musical Techniques), a product dimension, a ReadMe marketing type, a funnel stage… |
| `modality` | Script, Voice, Music, Image or Video for chapter pieces; empty otherwise |
| `definition` | What it is, in plain words |
| `used_for` / `helps` | What it is used for, and who or what it helps (v2 rows; v1 rows show a generated line in the admin) |
| `causal_role` | How it moves the person or the business |
| `signal` | How its effect would be measured (v2 rows) |
| `stateflips` | The StateFlips (SF-…) it serves, space-separated |
| `links` | Typed links `type:target`, space-separated: drives, step-of, feeds, fed-by, part-of, supports, mirrors, measures |
| `source` | `from <workbook / tab / row>` when it comes from his sheets; `drafted by us — to review` (with what it is an instance of) otherwise. Brand rows say "pending his marketing AKP sheet" |
| `status` | draft for all; an admin can mark reviewed or approved |

## Rebuilding the files

```bash
python3 -I scripts/akp/extract.py                                   # workbooks -> src/admin/data/generated/akpSource.ts
AKP_EXPORT=1 npx vitest run src/admin/data/akpExport.test.ts         # catalogue -> docs/akp/akps.json
python3 -I scripts/akp/export.py                                    # json -> csv, xlsx (also public/akp/akp-v2.xlsx)
```

IDs are fixed by position in the lists in `scripts/akp/extract.py`: add to the end of a list, never reorder or delete (retire an AKP in the admin instead).
