import { useEffect } from 'react'
import { Bell, Heart, Moon, Play, Search, Sparkles, Wind } from 'lucide-react'
import figmaExport from '../../design-tokens/figma-export.json?raw'
import networkArt from '../assets/aurelia-network.png'
import { ChartIncreaseIcon, NoteIcon, NotificationIcon, PlayIcon, PlaylistIcon, UserIcon } from '../components/ui/AureliaIcons'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { BUILD } from '../lib/build'
import { CARD_SHADOW } from '../lib/shadows'
import { CATALOGUE } from './catalogue'
import { ComponentCatalogue } from './ComponentCatalogue'
import { gaps, parseExport, semanticUsage, type Ramp } from './tokens'

/**
 * The design system, shown as a tab of the wiki (/wiki/design-system; the
 * old /designsystem address redirects there). Everything on it is read from the source:
 * colours, numbers and type from design-tokens/figma-export.json (the Figma
 * snapshot), the type classes from tokens.css, and the components are the
 * app's own, rendered live. Nothing is restated by hand, so it cannot drift.
 */
const T = parseExport(figmaExport)


function Section({ id, title, lede, children }: { id: string; title: string; lede: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--staging-bar,0px)+72px)] border-t border-border-subtle pt-40 pb-24">
      <h2 className="text-style-title-large text-text-primary">{title}</h2>
      <p className="text-style-body-small mt-8 max-w-[640px] text-text-secondary">{lede}</p>
      <div className="mt-24">{children}</div>
    </section>
  )
}

function Swatch({ hex, name, sub }: { hex: string; name: string; sub?: string }) {
  const light = isLight(hex)
  return (
    <div className="min-w-0 overflow-hidden rounded-12 border border-border-subtle bg-surface-default">
      <div className="flex h-56 items-end p-8" style={{ background: hex }}>
        <span className={`text-style-label ${light ? 'text-text-primary' : 'text-text-inverse'}`}>{hex}</span>
      </div>
      <div className="p-8">
        <p className="text-style-label truncate text-text-primary">{name}</p>
        {sub && <p className="text-style-caption mt-2 text-text-secondary">{sub}</p>}
      </div>
    </div>
  )
}

function RampRow({ ramp }: { ramp: Ramp }) {
  return (
    <div className="min-w-0">
      <p className="text-style-label mb-8 text-text-primary">
        {ramp.name} <span className="text-text-secondary">· {ramp.alias}</span>
      </p>
      <div className="grid grid-cols-11 overflow-hidden rounded-8 border border-border-subtle">
        {ramp.steps.map(([step, hex]) => (
          <div key={step} className="h-48 min-w-0" style={{ background: hex }} title={`${ramp.name}/${step} ${hex}`}>
            <span className={`block px-2 pt-4 text-[9px] leading-[12px] ${isLight(hex) ? 'text-text-primary' : 'text-text-inverse'}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * The design system's content, rendered inside the wiki (/wiki/design-system)
 * since U083. The wiki shell supplies the top bar, contents and search; this
 * is only the body. It does not sit under `.gd-doc`, so the documents'
 * typography never touches the live components.
 */
export function DesignSystemContent({ onReady }: { onReady?: () => void }) {
  // Loaded lazily by the wiki, which waits for this to wire its contents list.
  useEffect(() => onReady?.(), [onReady])
  return (
    <div className="ds-embed min-w-0 pb-40 font-sans text-text-primary">
          <div className="relative overflow-hidden py-40">
            <img src={networkArt} alt="" aria-hidden="true" className="pointer-events-none absolute -top-16 right-0 hidden w-[220px] opacity-90 sm:block" />
            <p className="text-style-label uppercase tracking-wide text-text-brand">Aurelia · design system</p>
            <h1 className="text-style-headline mt-8 max-w-[560px] text-text-primary">The pieces every Aurelia screen is made of</h1>
            <p className="text-style-body mt-12 max-w-[600px] text-text-secondary">
              Read straight from the Figma file’s variables and the app’s own components. {T.total} variables in {T.collections.length} collections,
              16 text styles, and all {CATALOGUE.length} components the app ships, in 10 patterns. If a value here changes, it changed in Figma first.
            </p>
            <div className="mt-16 flex flex-wrap gap-8">
              {T.collections.map((c) => (
                <span key={c.name} className="text-style-label rounded-full border border-border-default bg-surface-default px-10 py-4">
                  {c.name} · {c.count}
                </span>
              ))}
            </div>
            <p className="text-style-caption mt-16 text-text-secondary">
              Source: Figma “Aurelia AI” (variables) → design-tokens/figma-export.json → src/styles/tokens.css. {BUILD.label} · {BUILD.commit}
            </p>
          </div>

          <Section id="principles" title="Principles" lede="The decisions behind the numbers. Each is recorded in CLAUDE.md or the design-system history, with its reason.">
            <ul className="grid gap-12 sm:grid-cols-2">
              {[
                ['One typeface: Mulish', 'Every text style binds family, weight, size and line height. Light weights are part of the system, not an afterthought.'],
                ['Light only', 'Warm white surfaces, espresso text and gold for emphasis. There is no dark theme.'],
                ['Every number is a pixel', 'Spacing utilities map 1:1 to pixels (p-16 is 16px). Read every number on this page as px.'],
                ['A closed radius scale', '0, 2, 4, 8, 12, 16, 24, 32 and full. Anything else is a raw value on purpose, never a new token.'],
                ['A 20px page gutter', 'Shared with the Flutter app, which follows this web app wherever the two differ.'],
                ['Calm by default', 'One card shadow, soft gradients, motion that respects “reduce motion”. Nothing sudden.'],
              ].map(([t, d]) => (
                <li key={t} className="rounded-16 border border-border-subtle bg-surface-default p-16">
                  <p className="text-style-body font-semibold text-text-primary">{t}</p>
                  <p className="text-style-body-small mt-4 text-text-secondary">{d}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="colour" title="Colour" lede="Three layers. Components bind only the semantic layer; the semantic layer points at primitives, and primitives are aliases of the brand ramps.">
            <h3 className="text-style-title mb-12">Semantic: what components use</h3>
            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-4">
              {T.semantic.map((s) => (
                <Swatch key={s.name} hex={s.hex} name={s.name} sub={semanticUsage(s.name)} />
              ))}
            </div>
            <h3 className="text-style-title mt-32 mb-12">Brand ramps (and their role names)</h3>
            <div className="grid gap-16">
              {T.ramps.map((r) => (
                <RampRow key={r.name} ramp={r} />
              ))}
            </div>
          </Section>

          <Section id="type" title="Typography" lede="Sixteen named text styles on one 12-step scale. Each line below is set in the class the app uses, so what you see is what ships.">
            <div className="overflow-hidden rounded-16 border border-border-subtle bg-surface-default">
              {T.textStyles.map((s) => (
                <div key={s.name} className="grid gap-8 border-b border-border-subtle p-16 last:border-b-0 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-baseline">
                  <div>
                    <p className="text-style-label text-text-primary">Aurelia/{s.label}</p>
                    <p className="text-style-caption mt-2 text-text-secondary">
                      {s.size}/{s.lineHeight} · {s.weight} {s.weightValue} · <code>text-style-{s.name}</code>
                    </p>
                  </div>
                  <p className={`text-style-${s.name} min-w-0 truncate text-text-primary`}>Sessions made for how you feel today</p>
                </div>
              ))}
            </div>
            <p className="text-style-caption mt-12 text-text-secondary">
              Letter spacing: tight {T.tracking.tight}px · normal {T.tracking.normal}px · wide {T.tracking.wide}px.
            </p>
          </Section>

          <Section id="numbers" title="Spacing, size and radius" lede="The Numbers collection. Spacing is the rhythm between things; size is for icons and avatars; radius is the closed corner scale.">
            <h3 className="text-style-title mb-12">Spacing</h3>
            <div className="space-y-6 rounded-16 border border-border-subtle bg-surface-default p-16">
              {T.spacing.map(([k, v]) => (
                <div key={k} className="flex items-center gap-12">
                  <span className="text-style-label w-40 text-right text-text-secondary tabular-nums">{k}</span>
                  <span className="h-12 rounded-2 bg-gold-400" style={{ width: v }} />
                  <span className="text-style-caption text-text-secondary">{v}px</span>
                </div>
              ))}
            </div>
            <p className="text-style-caption mt-8 text-text-secondary">
              Named aliases: padding and margin xs {T.padding.xs} · sm {T.padding.sm} · md {T.padding.md} · lg {T.padding.lg} · xl {T.padding.xl}.
            </p>
            <h3 className="text-style-title mt-32 mb-12">Radius</h3>
            <div className="flex flex-wrap gap-16">
              {T.radius.map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="size-64 border-2 border-espresso-900 bg-gold-100" style={{ borderRadius: v }} />
                  <p className="text-style-label mt-6">{k}</p>
                  <p className="text-style-caption text-text-secondary">{k === 'full' ? 'pill' : `${v}px`}</p>
                </div>
              ))}
            </div>
            <h3 className="text-style-title mt-32 mb-12">Size</h3>
            <div className="flex flex-wrap items-end gap-16">
              {T.size.map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="rounded-8 bg-espresso-200" style={{ width: v, height: v }} />
                  <p className="text-style-caption mt-6 text-text-secondary">{k}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="effects" title="Shadow and gradient" lede="Effects are not synced from Figma yet, so these are the single places in code that spell them out.">
            <div className="grid gap-16 sm:grid-cols-3">
              <div className={`rounded-16 bg-surface-default p-20 ${CARD_SHADOW}`}>
                <p className="text-style-body font-semibold">Card shadow</p>
                <p className="text-style-caption mt-4 text-text-secondary">0 5px 24px 4px · black 5% (Figma effect 16520:822)</p>
              </div>
              <div className="rounded-16 p-20 text-text-on-brand" style={{ background: 'linear-gradient(135deg, #FF8514, #FFE270)' }}>
                <p className="text-style-body font-semibold">Brand gradient (Figma)</p>
                <p className="text-style-caption mt-4">#FF8514 → #FFE270, paint style 16658:17634</p>
              </div>
              <div className="rounded-16 p-20 text-text-on-brand" style={{ background: 'linear-gradient(135deg, #FF881B, #FFE682)' }}>
                <p className="text-style-body font-semibold">Brand gradient (code)</p>
                <p className="text-style-caption mt-4">#FF881B → #FFE682, used in 13 places. Which is right is undecided.</p>
              </div>
            </div>
          </Section>

          <Section id="brand" title="Brand" lede="The real exported artwork, never redrawn: the logo lockup, the mark, and the network figure that closes Home.">
            <div className="grid gap-16 sm:grid-cols-3">
              <div className="flex h-140 items-center justify-center rounded-16 border border-border-subtle bg-surface-default">
                <AureliaLogo iconSize={40} />
              </div>
              <div className="flex h-140 items-center justify-center rounded-16 bg-espresso-900">
                <AureliaLogo iconSize={40} inverse />
              </div>
              <div className="flex h-140 items-center justify-center rounded-16 border border-border-subtle bg-surface-default">
                <AureliaLogo iconSize={56} markOnly />
              </div>
            </div>
            <div className="mt-16 flex justify-center rounded-16 border border-border-subtle bg-surface-default p-16">
              <img src={networkArt} alt="Aurelia network artwork" className="h-auto max-h-[220px] w-auto max-w-full" />
            </div>
          </Section>

          <Section id="icons" title="Icons" lede="Lucide for the general set, plus Aurelia’s own exported icons where the design has one. Icons take icon/* colours, never text colours.">
            <div className="grid grid-cols-4 gap-12 sm:grid-cols-7">
              {[
                ['Search', <Search key="a" size={24} />],
                ['Bell', <Bell key="b" size={24} />],
                ['Play', <Play key="c" size={24} />],
                ['Moon', <Moon key="d" size={24} />],
                ['Wind', <Wind key="e" size={24} />],
                ['Heart', <Heart key="f" size={24} />],
                ['Sparkles', <Sparkles key="g" size={24} />],
                ['Aurelia play', <PlayIcon key="h" size={24} />],
                ['Playlist', <PlaylistIcon key="i" size={24} />],
                ['Note', <NoteIcon key="j" size={24} />],
                ['User', <UserIcon key="k" size={24} />],
                ['Notification', <NotificationIcon key="l" size={24} />],
                ['Chart', <ChartIncreaseIcon key="m" size={24} />],
              ].map(([label, icon]) => (
                <div key={label as string} className="flex flex-col items-center gap-6 rounded-12 border border-border-subtle bg-surface-default p-12 text-icon-default">
                  {icon}
                  <span className="text-style-caption text-center text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="components"
            title="Components and patterns"
            lede={`Every one of the ${CATALOGUE.length} components in src/components, grouped by the pattern it belongs to. Each card says what it is for, when to use it, where it appears and its states, with its props read from its own source. Components that need app state to draw are listed with where to see them.`}
          >
            <ComponentCatalogue />
          </Section>

          <Section id="gaps" title="Open gaps" lede="Colours the design uses that have no variable yet, reported and not invented. Each needs a design decision, then a variable in Figma, then a re-export.">
            <div className="overflow-x-auto rounded-16 border border-border-subtle bg-surface-default">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="text-style-label border-b border-border-subtle text-text-secondary">
                    <th className="p-12">Colour</th>
                    <th className="p-12">Where</th>
                    <th className="p-12">Nearest token</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g) => (
                    <tr key={g.hex} className="text-style-body-small border-b border-border-subtle last:border-b-0">
                      <td className="p-12">
                        <span className="mr-8 inline-block size-16 rounded-4 border border-border-subtle align-middle" style={{ background: g.hex }} />
                        <code>{g.hex}</code>
                      </td>
                      <td className="p-12 text-text-secondary">{g.where}</td>
                      <td className="p-12 text-text-secondary">{g.nearest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-style-caption mt-12 text-text-secondary">
              Also open: strokes are not bound to variables yet (0 of 76 in the audited section), and radius 20, 36, 48 and 60 are raw values in Figma too, by
              design. Every change is logged in docs/DESIGN-SYSTEM-HISTORY.md.
            </p>
          </Section>
    </div>
  )
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}
