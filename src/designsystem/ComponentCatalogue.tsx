import { Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { FilterChips, type FilterId } from '../components/chat/FilterChips'
import { EmptyThread } from '../components/chat/EmptyThread'
import { GeneratingShape } from '../components/chat/GeneratingShape'
import { RotatingStatus } from '../components/chat/RotatingStatus'
import { VoiceMessage } from '../components/chat/VoiceMessage'
import { WeekStrip } from '../components/daily/WeekStrip'
import { JourneyCard } from '../components/journeys/JourneyCard'
import { Accordion } from '../components/ui/Accordion'
import { ChartIncreaseIcon, NoteIcon, PlayIcon, PlaylistIcon, UserIcon } from '../components/ui/AureliaIcons'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { BuildBadge } from '../components/ui/BuildBadge'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { CoinMark, CoinPill } from '../components/ui/CoinPill'
import { CountUp } from '../components/ui/CountUp'
import { CoverImage } from '../components/ui/CoverImage'
import { FeatureCard } from '../components/ui/FeatureCard'
import { FlipWord } from '../components/ui/FlipWord'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { SessionGridCard } from '../components/ui/SessionGridCard'
import { ShareSheet } from '../components/ui/ShareSheet'
import { Skeleton } from '../components/ui/Skeleton'
import { TagRow } from '../components/ui/TagRow'
import { TextField } from '../components/ui/TextField'
import { AlignmentGauge } from '../components/wellness/AlignmentGauge'
import { AlignmentPanel } from '../components/wellness/AlignmentPanel'
import { ProgressRing } from '../components/wellness/ProgressRing'
import { dayKey, weekOf } from '../lib/dailyCheckIn'
import { STORIES } from '../lib/journeys'
import { SESSIONS } from '../lib/sessions'
import { CATALOGUE, PATTERNS, type CatalogueEntry } from './catalogue'
import { extractProps } from './props'

// Every component's own source, so its props are read rather than restated.
const SOURCES = import.meta.glob(['../components/**/*.tsx', '!../components/**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const GRADIENT = 'linear-gradient(135deg, #FF881B, #FFE682)'

function useDemos(): Record<string, ReactNode> {
  const [chip, setChip] = useState('Sleep')
  const [segment, setSegment] = useState('Week')
  const [filter, setFilter] = useState<FilterId>('all')
  const [share, setShare] = useState(false)
  const [today] = useState(() => new Date())
  const [day, setDay] = useState(() => dayKey(today))
  return {
    'ui/Button.tsx': (
      <div className="flex flex-wrap gap-8">
        <Button>Create a session</Button>
        <Button variant="secondary">Review changes</Button>
        <Button variant="ghost">Skip</Button>
        <Button disabled>Disabled</Button>
        <Button icon={<Sparkles size={16} />}>With icon</Button>
      </div>
    ),
    'ui/Chip.tsx': (
      <div className="flex flex-wrap gap-8">
        {['Sleep', 'Calm', 'Focus', 'Energy'].map((c) => (
          <Chip key={c} label={c} active={chip === c} onClick={() => setChip(c)} />
        ))}
      </div>
    ),
    'ui/SegmentedControl.tsx': <SegmentedControl options={['Day', 'Week', 'Month']} value={segment} onChange={setSegment} />,
    'chat/FilterChips.tsx': <FilterChips filter={filter} onChange={setFilter} count={(id) => (id === 'selected' ? 2 : 3)} />,
    'ui/CoinPill.tsx': (
      <div className="flex items-center gap-16">
        <CoinPill points="1,323" always />
        <CoinMark size={28} />
      </div>
    ),
    'ui/TextField.tsx': <TextField placeholder="How are you feeling today?" aria-label="Example text field" />,
    'ui/FeatureCard.tsx': <FeatureCard icon={<Sparkles size={20} />} title="Made for how you feel" description="One sentence in, a session out, in about a minute." />,
    'ui/SessionGridCard.tsx': (
      <div className="w-[180px]">
        <SessionGridCard session={SESSIONS[0]} />
      </div>
    ),
    'journeys/JourneyCard.tsx': <JourneyCard story={STORIES[0]} />,
    'ui/CoverImage.tsx': (
      <div className="relative h-120 w-full max-w-[280px] overflow-hidden rounded-16">
        <CoverImage photo="breathwork" gradient={GRADIENT} />
      </div>
    ),
    'ui/PhotoCircle.tsx': (
      <div className="flex gap-12">
        <PhotoCircle photo="affirmations" size={56} gradient={GRADIENT} />
        <PhotoCircle photo="breathwork" size={40} gradient={GRADIENT} />
      </div>
    ),
    'ui/TagRow.tsx': <TagRow tags={['Breathwork', 'Sleep', 'Longer exhale', 'Nature', 'Evening', 'Calm']} max={4} />,
    'ui/Accordion.tsx': (
      <Accordion
        sections={[
          { id: 'a', label: 'What is a chapter?', content: <p className="text-style-body-small text-text-secondary">One session in a five-chapter journey.</p> },
          { id: 'b', label: 'Why a change?', content: <p className="text-style-body-small text-text-secondary">Every suggestion carries a Why.</p> },
        ]}
        defaultOpen={['a']}
      />
    ),
    'ui/ShareSheet.tsx': (
      <>
        <Button variant="secondary" onClick={() => setShare(true)}>
          Open the share sheet
        </Button>
        {share && <ShareSheet title="Sleep meditation" url="https://example.com/s/sleep" onClose={() => setShare(false)} />}
      </>
    ),
    'chat/EmptyThread.tsx': (
      <div className="relative h-[260px] overflow-hidden rounded-16 bg-background-default">
        <EmptyThread name="Adam" />
      </div>
    ),
    'chat/RotatingStatus.tsx': <RotatingStatus />,
    'chat/GeneratingShape.tsx': <GeneratingShape size={40} />,
    'chat/VoiceMessage.tsx': <VoiceMessage durationMs={14000} transcript="I can’t switch off at night, my mind keeps racing." />,
    'daily/WeekStrip.tsx': <WeekStrip days={weekOf(today)} selected={day} onSelect={setDay} />,
    'wellness/ProgressRing.tsx': (
      <ProgressRing value={62} size={96} stroke={8} track="#F2F1EF">
        <span className="text-style-title">62</span>
      </ProgressRing>
    ),
    'wellness/AlignmentGauge.tsx': (
      <div className="max-w-[240px]">
        <AlignmentGauge score={72} />
      </div>
    ),
    'wellness/AlignmentPanel.tsx': <AlignmentPanel score={64} previousState={['Restless', 'Wired']} currentState={['Settled', 'Sleepy']} />,
    'ui/Skeleton.tsx': (
      <div className="space-y-8">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-80 w-full rounded-16" />
      </div>
    ),
    'ui/CountUp.tsx': (
      <p className="text-style-title-large">
        <CountUp value={1323} />
      </p>
    ),
    'ui/FlipWord.tsx': (
      <p className="text-style-title">
        Trusted <FlipWord words={['Creators', 'Guides', 'Storytellers']} />
      </p>
    ),
    'ui/AureliaLogo.tsx': (
      <div className="flex flex-wrap items-center gap-16">
        <AureliaLogo iconSize={28} />
        <AureliaLogo iconSize={28} markOnly />
        <span className="rounded-12 bg-espresso-900 p-8">
          <AureliaLogo iconSize={24} inverse />
        </span>
      </div>
    ),
    'ui/AureliaIcons.tsx': (
      <div className="flex gap-16 text-icon-default">
        <PlayIcon size={24} />
        <PlaylistIcon size={24} />
        <NoteIcon size={24} />
        <UserIcon size={24} />
        <ChartIncreaseIcon size={24} />
      </div>
    ),
    'ui/BuildBadge.tsx': <BuildBadge />,
  }
}

function PropsTable({ entry }: { entry: CatalogueEntry }) {
  const parsed = extractProps(SOURCES[`../components/${entry.file}`] ?? '')
  const withProps = parsed.filter((c) => c.props.length || c.extendsFrom)
  if (!withProps.length) return <p className="text-style-caption text-text-secondary">No props.</p>
  return (
    <div className="space-y-12">
      {withProps.map((c) => (
        <div key={c.component} className="min-w-0">
          {withProps.length > 1 && <p className="text-style-label mb-4">{c.component}</p>}
          <div className="overflow-x-auto rounded-12 border border-border-subtle">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="text-style-caption border-b border-border-subtle text-text-secondary uppercase tracking-wide">
                  <th className="px-10 py-6">Prop</th>
                  <th className="px-10 py-6">Type</th>
                  <th className="px-10 py-6">Default</th>
                  <th className="px-10 py-6">Notes</th>
                </tr>
              </thead>
              <tbody>
                {c.props.map((p) => (
                  <tr key={p.name} className="text-style-label-regular border-b border-border-subtle align-top last:border-b-0">
                    <td className="px-10 py-6 font-semibold">
                      <code>
                        {p.name}
                        {p.optional ? '?' : ''}
                      </code>
                    </td>
                    <td className="max-w-[220px] px-10 py-6 break-words text-text-secondary">
                      <code>{p.type}</code>
                    </td>
                    <td className="px-10 py-6 text-text-secondary">
                      <code>{p.defaultValue ?? '–'}</code>
                    </td>
                    <td className="max-w-[260px] px-10 py-6 text-text-secondary">{p.doc ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.extendsFrom && <p className="text-style-caption mt-4 text-text-secondary">Also takes every attribute of <code>{c.extendsFrom}</code>.</p>}
        </div>
      ))}
    </div>
  )
}

function EntryCard({ entry, demo }: { entry: CatalogueEntry; demo?: ReactNode }) {
  return (
    <article id={`c-${entry.name.split(' ')[0].toLowerCase()}`} className="min-w-0 rounded-16 border border-border-subtle bg-surface-default p-16">
      <div className="flex flex-wrap items-baseline justify-between gap-8">
        <h4 className="text-style-title text-text-primary">{entry.name}</h4>
        <code className="text-style-caption text-text-secondary">src/components/{entry.file}</code>
      </div>
      <p className="text-style-body-small mt-6 text-text-primary">{entry.purpose}</p>
      <dl className="text-style-label-regular mt-12 grid gap-x-16 gap-y-6 sm:grid-cols-[110px_minmax(0,1fr)]">
        <dt className="text-text-secondary">Use when</dt>
        <dd>{entry.useWhen}</dd>
        <dt className="text-text-secondary">Where</dt>
        <dd>{entry.where}</dd>
        {entry.figma && (
          <>
            <dt className="text-text-secondary">Figma</dt>
            <dd>{entry.figma}</dd>
          </>
        )}
        {entry.states.length > 0 && (
          <>
            <dt className="text-text-secondary">States</dt>
            <dd className="flex flex-wrap gap-6">
              {entry.states.map((s) => (
                <span key={s} className="rounded-full bg-background-elevated px-8 py-2 text-[11px] leading-[16px]">
                  {s}
                </span>
              ))}
            </dd>
          </>
        )}
      </dl>
      {demo ? (
        <div className="mt-16 rounded-12 border border-dashed border-border-default bg-background-default p-16">{demo}</div>
      ) : (
        <p className="text-style-caption mt-16 text-text-secondary">Shown in context only: it needs app state to render. See it on: {entry.where}.</p>
      )}
      <details className="mt-12">
        <summary className="text-style-label cursor-pointer text-text-brand">Props (read from the source)</summary>
        <div className="mt-8">
          <PropsTable entry={entry} />
        </div>
      </details>
    </article>
  )
}

export function ComponentCatalogue() {
  const demos = useDemos()
  return (
    <div className="space-y-40">
      <div className="flex flex-wrap gap-8">
        {PATTERNS.map((p) => (
          <a key={p.id} href={`#p-${p.id}`} className="text-style-label rounded-full border border-border-default bg-surface-default px-10 py-4 hover:bg-background-elevated">
            {p.name} · {CATALOGUE.filter((c) => c.pattern === p.id).length}
          </a>
        ))}
      </div>
      {PATTERNS.map((p) => {
        const entries = CATALOGUE.filter((c) => c.pattern === p.id)
        return (
          <div key={p.id} id={`p-${p.id}`} className="scroll-mt-[calc(var(--staging-bar,0px)+72px)]">
            <h3 className="text-style-title-large-regular text-text-primary">{p.name}</h3>
            <p className="text-style-body-small mt-4 max-w-[640px] text-text-secondary">{p.guidance}</p>
            <ul className="text-style-body-small mt-8 max-w-[680px] list-disc space-y-2 pl-20 text-text-primary">
              {p.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="mt-16 grid gap-16">
              {entries.map((e) => (
                <EntryCard key={e.file} entry={e} demo={demos[e.file]} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
