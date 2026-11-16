// Pure data for /designsystem: reads the Figma variables snapshot
// (design-tokens/figma-export.json) into what the page lists. Kept out of the
// component so it can be tested, and so the counts on the page are computed
// from the file rather than typed in.

type Json = string | number | { [k: string]: Json }

export interface Ramp {
  name: string
  /** The role name the Primitives collection gives the same ramp. */
  alias: string
  steps: [string, string][]
}

export interface TextStyle {
  name: string
  label: string
  size: number
  lineHeight: number
  weight: string
  weightValue: number
}

export interface Tokens {
  total: number
  collections: { name: string; count: number }[]
  semantic: { name: string; hex: string }[]
  ramps: Ramp[]
  textStyles: TextStyle[]
  tracking: Record<string, number>
  spacing: [string, number][]
  radius: [string, number][]
  size: [string, number][]
  padding: Record<string, number>
}

const ALIAS: Record<string, string> = { gold: 'primary', espresso: 'neutral', red: 'danger', amber: 'warning', blue: 'info', green: 'success' }

function leaves(node: Json): number {
  if (typeof node !== 'object') return 1
  return Object.values(node).reduce<number>((n, v) => n + leaves(v), 0)
}

function flatten(node: Json, prefix = ''): { name: string; hex: string }[] {
  if (typeof node !== 'object') return [{ name: prefix, hex: String(node) }]
  return Object.entries(node).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}/${k}` : k))
}

const byNumber = (a: [string, number], b: [string, number]) => a[1] - b[1]

function label(name: string) {
  return name
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export function parseExport(raw: string): Tokens {
  const file = JSON.parse(raw) as { collections: Record<string, Record<string, Json>> }
  const c = file.collections
  const typography = c['Aurelia Typography'] as Record<string, Json>
  const numbers = c['Aurelia Numbers'] as Record<string, Record<string, number>>
  const weights = typography['font-weight'] as Record<string, number>
  const scale = typography.scale as Record<string, { fontSize: number; lineHeight: number }>
  const styles = typography.textStyles as Record<string, { size: string; weight: string }>

  const collections = Object.entries(c).map(([name, body]) => {
    // Text styles are Figma styles, not variables: they are not counted.
    const { textStyles: _styles, ...vars } = body as Record<string, Json>
    void _styles
    return { name, count: leaves(vars) }
  })

  const brand = c['Aurelia Brand'] as Record<string, Json>
  const ramps: Ramp[] = Object.entries(brand)
    .filter(([, v]) => typeof v === 'object')
    .map(([name, v]) => ({ name, alias: ALIAS[name] ?? name, steps: Object.entries(v as Record<string, string>) }))

  return {
    total: collections.reduce((n, x) => n + x.count, 0),
    collections,
    semantic: flatten(c['Aurelia Semantic'] as Json),
    ramps,
    textStyles: Object.entries(styles).map(([name, s]) => ({
      name,
      label: label(name),
      size: scale[s.size].fontSize,
      lineHeight: scale[s.size].lineHeight,
      weight: s.weight,
      weightValue: weights[s.weight],
    })),
    tracking: typography['letter-spacing'] as Record<string, number>,
    spacing: Object.entries(numbers.spacing).sort(byNumber),
    radius: Object.entries(numbers.radius)
      .map(([k, v]): [string, number] => [k, k === 'full' ? 9999 : v])
      .sort(byNumber),
    size: Object.entries(numbers.size).sort(byNumber),
    padding: numbers.padding,
  }
}

/** One line on what each semantic colour is for, so a swatch says where it goes. */
const USAGE: Record<string, string> = {
  'background/default': 'Page background',
  'background/elevated': 'Hover and raised areas',
  'surface/default': 'Cards and sheets',
  'surface/sunken': 'Inset areas',
  'border/default': 'Inputs and outlines',
  'border/subtle': 'Dividers',
  'text/primary': 'Body and headings',
  'text/secondary': 'Supporting text',
  'text/inverse': 'On dark',
  'text/on-brand': 'On gold',
  'text/strong': 'Maximum contrast',
  'text/brand': 'Highlights, links',
  'brand/default': 'Gold fills',
  'brand/emphasis': 'Gold accents',
  'feedback/success': 'Success',
  'feedback/warning': 'Warning',
  'feedback/error': 'Error',
  'feedback/info': 'Information',
}

export function semanticUsage(name: string): string | undefined {
  if (name.startsWith('button/')) return 'Button'
  if (name.startsWith('icon/')) return 'Icons'
  if (name.startsWith('interactive/')) return 'Interactive'
  return USAGE[name]
}

/** From docs/DESIGN-SYSTEM-HISTORY.md, "Open — no variable exists". */
export const gaps = [
  { hex: '#FF881B', where: 'New session gradient, glow ellipses, card washes: the brand orange', nearest: 'None' },
  { hex: '#FFE682', where: 'The other end of every brand gradient', nearest: 'gold/200 #FFE58A' },
  { hex: '#331B04', where: 'Text and chips on the Insight frames', nearest: 'text/primary #3C2405' },
  { hex: '#525252', where: 'Secondary body copy on Insights', nearest: 'text/secondary #7B7B7B' },
  { hex: '#D6D6D6', where: 'Tab borders, the Objective sheet input', nearest: 'border/subtle #E4E1DC' },
  { hex: '#FFF1DB', where: 'Sparkle badge, the Published pill', nearest: 'gold/100 #FFF3C4' },
  { hex: '#ECFBED', where: 'Trend pill on a session card', nearest: 'success/50 #F0FDF4' },
  { hex: '#F0F0F0', where: 'Rules between Credits rows', nearest: 'border/subtle #E4E1DC' },
]
