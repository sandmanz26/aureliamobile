import { describe, expect, it } from 'vitest'
import { CATALOGUE, PATTERNS } from './catalogue'
import { extractProps } from './props'

// The same glob the page uses, so the test sees exactly what the design system tab sees.
const SOURCES = import.meta.glob(['../components/**/*.tsx', '!../components/**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const source = (file: string) => SOURCES[`../components/${file}`]
const componentFiles = () => Object.keys(SOURCES).map((k) => k.replace('../components/', ''))

describe('component catalogue', () => {
  it('lists every component file, and nothing that does not exist', () => {
    const files = componentFiles().sort()
    const listed = CATALOGUE.map((c) => c.file).sort()
    expect(listed).toEqual(files)
  })

  it('puts every entry in a known pattern, and every pattern has entries', () => {
    const ids = new Set(PATTERNS.map((p) => p.id))
    expect(CATALOGUE.every((c) => ids.has(c.pattern))).toBe(true)
    for (const p of PATTERNS) expect(CATALOGUE.some((c) => c.pattern === p.id)).toBe(true)
  })
})

describe('extractProps', () => {
  it('reads an interface with an extends clause and defaults', () => {
    const [button] = extractProps(source('ui/Button.tsx'))
    expect(button.component).toBe('Button')
    expect(button.extendsFrom).toMatch(/ButtonHTMLAttributes/)
    expect(button.props.find((p) => p.name === 'variant')).toMatchObject({ optional: true, defaultValue: "'primary'" })
    expect(button.props.find((p) => p.name === 'children')).toMatchObject({ optional: false })
  })

  it('reads an inline type with docs', () => {
    const [ring] = extractProps(source('wellness/ProgressRing.tsx'))
    expect(ring.props.find((p) => p.name === 'value')).toMatchObject({ type: 'number', doc: '0–100' })
    expect(ring.props.find((p) => p.name === 'arc')).toMatchObject({ optional: true, defaultValue: "'gradient'" })
  })

  it('reads a simple inline type', () => {
    const [tags] = extractProps(source('ui/TagRow.tsx'))
    expect(tags.props.map((p) => p.name)).toEqual(['tags', 'max'])
  })

  it('reads `(props: Props)` and `type X = Y & { … }`', () => {
    const [sheet] = extractProps(source('chat/AddSheet.tsx'))
    expect(sheet.props.length).toBeGreaterThan(3)
    const [icon] = extractProps(source('ui/AureliaIcons.tsx'))
    expect(icon.extendsFrom).toMatch(/SVGProps/)
    expect(icon.props.find((p) => p.name === 'size')).toMatchObject({ optional: true, defaultValue: '20' })
  })
})
