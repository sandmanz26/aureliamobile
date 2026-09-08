import {
  ArrowLeft,
  Bookmark,
  Coins,
  Menu,
  Play,
  Repeat2,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Accordion } from '../components/ui/Accordion'
import type { AccordionSection } from '../components/ui/Accordion'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { useDrawer } from '../layouts/DrawerContext'
import type { SessionRecord } from '../lib/sessions'
import { findSession, totalMinutes } from '../lib/sessions'

/** Label / value pair, the unit the detail sections are built from. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-16 py-6">
      <span className="text-style-body-small text-text-secondary">{label}</span>
      <span className="text-style-body-small text-right font-medium text-text-primary">{value}</span>
    </div>
  )
}

/** Horizontal share bar — used for mix levels and for "what people changed". */
function Meter({ value }: { value: number }) {
  return (
    <span className="block h-4 w-full overflow-hidden rounded-full bg-background-elevated">
      <span className="block h-full rounded-full bg-brand-emphasis" style={{ width: `${value}%` }} />
    </span>
  )
}

function buildSections(session: SessionRecord, isEnabled: (id: string) => boolean): AccordionSection[] {
  const sections: AccordionSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="flex flex-col gap-16">
          <p className="text-style-body-small text-text-primary">{session.summary}</p>
          <div className="rounded-12 bg-background-elevated p-14">
            <p className="text-style-caption uppercase tracking-[0.12em] text-text-secondary">Creator’s intent</p>
            <p className="text-style-body-small mt-6 text-text-primary">{session.intent}</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {session.outcome.map((item) => (
              <div key={item.label} className="rounded-12 border border-border-subtle p-12">
                <p className="text-style-title tabular-nums text-text-primary">{item.value}</p>
                <p className="text-style-label mt-2 text-text-primary">{item.label}</p>
                <p className="text-style-caption mt-4 text-text-secondary">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-style-caption text-text-secondary">
            Figures are self-reported by listeners and are not clinical measurements.
          </p>
        </div>
      ),
    },
    {
      id: 'structure',
      label: 'Session structure',
      meta: `${session.chapters.length} chapters · ${totalMinutes(session)} min`,
      content: (
        <ol className="flex flex-col">
          {session.chapters.map((chapter, index) => (
            <li key={chapter.label} className="flex gap-14 py-10">
              <span className="text-style-label mt-2 flex size-24 shrink-0 items-center justify-center rounded-full bg-background-elevated tabular-nums text-text-secondary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-12">
                  <p className="text-style-body-small font-medium text-text-primary">{chapter.label}</p>
                  <span className="text-style-caption shrink-0 tabular-nums text-text-secondary">
                    {chapter.minutes} min
                  </span>
                </div>
                <p className="text-style-caption mt-2 text-text-secondary">{chapter.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: 'layers',
      label: 'Sound layers',
      meta: `${session.layers.length} layers`,
      content: (
        <div className="flex flex-col gap-14">
          {session.layers.map((layer) => (
            <div key={layer.id} className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between gap-12">
                <p className="text-style-body-small font-medium text-text-primary">{layer.name}</p>
                <span className="text-style-caption tabular-nums text-text-secondary">{layer.level}%</span>
              </div>
              <Meter value={layer.level} />
              <p className="text-style-caption text-text-secondary">{layer.detail}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'personalization',
      label: 'Personalization',
      content: (
        <div className="flex flex-col divide-y divide-border-subtle">
          {session.personalization.map((item) => (
            <Row key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ),
    },
    {
      id: 'changes',
      label: 'What people changed',
      meta: `${session.recreated} recreations`,
      content: (
        <div className="flex flex-col gap-14">
          <p className="text-style-caption text-text-secondary">
            The edits made most often when someone forks this session. Start from any of them in Recreate.
          </p>
          {session.commonChanges.map((item) => (
            <div key={item.change} className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between gap-12">
                <p className="text-style-body-small text-text-primary">{item.change}</p>
                <span className="text-style-caption tabular-nums text-text-secondary">{item.share}</span>
              </div>
              <Meter value={Number.parseInt(item.share, 10)} />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'lineage',
      label: 'Lineage',
      meta: `${session.lineage.length} versions`,
      content: (
        <ol className="flex flex-col">
          {session.lineage.map((step, index) => (
            <li key={step.title} className="flex gap-14">
              {/* Spine: a dot per version, joined except after the last. */}
              <span className="flex flex-col items-center">
                <span
                  className={`mt-6 size-8 shrink-0 rounded-full ${
                    index === session.lineage.length - 1 ? 'bg-brand-emphasis' : 'bg-border-default'
                  }`}
                />
                {index < session.lineage.length - 1 && <span className="w-[1px] flex-1 bg-border-subtle" />}
              </span>
              <div className="min-w-0 flex-1 pb-16">
                <p className="text-style-body-small font-medium text-text-primary">{step.title}</p>
                <p className="text-style-caption mt-2 text-text-secondary">
                  {step.author} · {step.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: 'safety',
      label: 'Safety & licensing',
      content: (
        <ul className="flex flex-col gap-10">
          {session.safety.map((line) => (
            <li key={line} className="flex gap-10">
              <ShieldCheck size={14} className="mt-3 shrink-0 text-icon-secondary" />
              <span className="text-style-body-small text-text-secondary">{line}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  // Two sections are switchable in /__demo, so a walkthrough can leave the
  // community-lineage story out without hiding the rest of the page.
  return sections.filter((section) =>
    section.id === 'lineage' || section.id === 'changes'
      ? isEnabled(`sessionDetail.${section.id}`)
      : true,
  )
}

export function SessionDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const { isEnabled } = useFeatureFlags()
  const session = findSession(slug)

  // An unknown slug is a bad link, not an error state worth a screen.
  if (!session) return <Navigate to="/home" replace />

  const sections = buildSections(session, isEnabled)

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      <header className="flex h-54 shrink-0 items-center justify-between px-20">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex size-32 items-center justify-center rounded-full text-icon-default"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Save" className="flex size-32 items-center justify-center text-icon-default">
            <Bookmark size={18} />
          </button>
          <button type="button" aria-label="Share" className="flex size-32 items-center justify-center text-icon-default">
            <Share2 size={18} />
          </button>
          <button
            type="button"
            aria-label="Menu"
            onClick={openDrawer}
            className="flex size-32 items-center justify-center text-icon-default lg:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-20 pb-40">
        <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
          {/* Cover: the artwork, the title, and the one action the page exists for. */}
          <div className="relative flex aspect-[362/240] w-full flex-col justify-end overflow-hidden rounded-24 p-16 text-text-inverse">
            <CoverImage photo={session.photo} gradient={session.gradient} width={760} height={520} />
            <span className="text-style-caption relative w-fit rounded-full border border-white/50 px-10 py-4 uppercase tracking-[0.12em]">
              {session.category}
            </span>
            <h1 className="text-style-title-large relative mt-10">{session.title}</h1>
            <p className="text-style-body-small relative mt-4 opacity-90">
              {session.minutes} min · {session.plays} plays · {session.recreated} recreations
            </p>
          </div>

          <div className="mt-16 flex items-center gap-12">
            <PhotoCircle
              photo="avatar"
              size={40}
              gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
            />
            <div className="min-w-0 flex-1">
              <p className="text-style-body-small font-medium text-text-primary">{session.author}</p>
              <p className="text-style-caption truncate text-text-secondary">{session.authorRole}</p>
            </div>
            <button
              type="button"
              className="text-style-label h-32 rounded-full border border-border-default px-14 text-text-primary"
            >
              Follow
            </button>
          </div>

          <div className="mt-16 flex items-center gap-8">
            <button
              type="button"
              className="text-style-body u-press flex h-52 flex-1 items-center justify-center gap-8 rounded-full bg-button-primary-background font-semibold text-button-primary-foreground"
            >
              <Play size={18} fill="currentColor" />
              Play session
            </button>
            <Link
              to={`/recreate/${session.slug}`}
              className="text-style-body flex h-52 items-center justify-center gap-8 rounded-full border border-border-default px-20 font-semibold text-text-primary"
            >
              <Repeat2 size={18} />
              Recreate
            </Link>
          </div>

          <div className="text-style-caption mt-10 flex items-center gap-6 text-text-secondary">
            <Coins size={12} />
            Playing earns 5 coins · recreating credits {session.author} with 10
          </div>

          <div className="mt-24">
            <Accordion sections={sections} defaultOpen={['overview']} />
          </div>

          <Link
            to={`/recreate/${session.slug}`}
            className="mt-24 flex items-center gap-12 rounded-16 border border-border-subtle bg-surface-default p-16"
          >
            <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-brand-default text-icon-strong">
              <Sparkles size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-style-body-small block font-medium text-text-primary">Make it yours</span>
              <span className="text-style-caption block text-text-secondary">
                Fork this session and tune it in chat — {session.author} stays credited.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
