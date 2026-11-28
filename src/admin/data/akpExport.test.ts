import { describe, expect, it } from 'vitest'
import { chapterKit } from './akpAssembly'
import { AKP_COLUMNS, akpLinksCsv, akpRecord, akpsCsv } from './akpExport'
import { CHAPTER_FAMILIES, FAMILIES, FAMILY, baseAkps } from './akps'
import { stateFlips } from './stateFlips'

// Node globals without @types/node in the app's tsconfig: only this test touches the file system.
declare const process: { env: Record<string, string | undefined> }
type Fs = { writeFileSync: (path: string, data: string) => void }

describe('AKP export (U150)', () => {
  const as = baseAkps()

  it('writes one CSV row per AKP and one per link, quoting commas and quotes', () => {
    const rows = akpsCsv(as).trim().split('\r\n')
    expect(rows[0]).toBe(AKP_COLUMNS.join(','))
    expect(akpsCsv([{ ...as[0], name: 'a, "b"' }])).toContain('"a, ""b"""')
    const links = as.reduce((t, a) => t + a.links.length, 0)
    expect(akpLinksCsv(as).trim().split('\r\n')).toHaveLength(links + 1)
    expect(Object.keys(akpRecord(as[0]))).toEqual([...AKP_COLUMNS])
  })

  // AKP_EXPORT=1 npx vitest run src/admin/data/akpExport.test.ts, then python3 -I scripts/akp/export.py (docs/akp/README.md).
  it.runIf(process.env.AKP_EXPORT)('dumps the generated catalogue for scripts/akp/export.py', async () => {
    const { writeFileSync } = (await import(/* @vite-ignore */ ['node', 'fs'].join(':'))) as Fs
    const fs = stateFlips()
    const dump = {
      generated: 'src/admin/data/akpExport.test.ts (AKP_EXPORT=1), U150',
      families: FAMILIES.map((f) => ({ id: f, ...FAMILY[f] })),
      chapterFamilies: CHAPTER_FAMILIES,
      akps: as.map(akpRecord),
      stateflips: fs.map((f) => ({ id: f.id, dimension: f.dimension, title: f.title, kit: Object.fromEntries(CHAPTER_FAMILIES.map((x) => [x, chapterKit(f.id).pieces[x]?.id ?? ''])) })),
    }
    writeFileSync('docs/akp/akps.json', JSON.stringify(dump, null, 1) + '\n')
  })
})
