import { ArrowLeft, ChevronRight, Play, Repeat2, Share2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import type { RecreateBrief } from '../chat/recreate'
import { briefFor, useRecreateTarget } from '../chat/recreate'
import { useFeatureFlags } from '../demo/FeatureFlags'
import type { AppliedStyle } from '../lib/sessionStyles'
import { APPLIED_STYLES } from '../lib/sessionStyles'
import type { SessionRecord } from '../lib/sessions'
import { profilePath } from '../lib/people'
import { findSession, lineageDate } from '../lib/sessions'

const ORBS = { yellow: orbIncreaseYellow, movement: orbLessMovement, hz432: orb432hz } as const

/** The summary, collapsed to three lines until asked to say the rest. */
function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-12">
      <p className={`text-style-body-small text-text-secondary ${open ? '' : 'line-clamp-3'}`}>{text}</p>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-style-label u-tap mt-4 text-brand-emphasis"
      >
        {open ? 'Read Less' : 'Read More'}
      </button>
    </div>
  )
}

/** Topic hashtags. Six shown, the rest folded into one "+N" chip rather than
 *  wrapping the row for a session with a long list. */
function TagRow({ tags }: { tags: string[] }) {
  const shown = tags.slice(0, 6)
  const overflow = tags.length - shown.length
  return (
    <div className="mt-14 flex flex-wrap gap-8">
      {shown.map((tag) => (
        <span key={tag} className="text-style-caption rounded-full bg-gold-100 px-10 py-4 text-warning-700">
          #{tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-style-caption rounded-full bg-gold-100 px-10 py-4 text-warning-700">+{overflow}</span>
      )}
    </div>
  )
}

/** One preset enhancement, offered as its own fork — Recreate hands the
 *  cockpit the same brief a blank Recreate would, plus this one change
 *  already stated, so the thread opens having said what should be different. */
function StylePresetCard({ style, session }: { style: AppliedStyle; session: SessionRecord }) {
  const navigate = useNavigate()
  const { isEnabled } = useFeatureFlags()

  function recreateWithStyle() {
    if (isEnabled('recreate.screen')) {
      navigate(`/recreate/${session.slug}`)
      return
    }
    const brief: RecreateBrief = { ...briefFor(session), changes: [style.name] }
    navigate('/chat', { state: { recreate: brief } })
  }

  return (
    <div className="flex w-[164px] shrink-0 flex-col rounded-16 border border-border-subtle bg-surface-default p-12">
      <img src={ORBS[style.orb]} alt="" className="size-48 shrink-0 rounded-full object-cover" />
      <h3 className="text-style-body-small mt-10 font-semibold text-text-primary">{style.name}</h3>
      <p className="text-style-caption mt-2 line-clamp-2 text-text-secondary">{style.reason}</p>
      <button
        type="button"
        onClick={recreateWithStyle}
        className="text-style-label u-press mt-10 flex h-32 w-full items-center justify-center gap-6 rounded-full border border-border-default text-text-primary"
      >
        <Repeat2 size={13} />
        Recreate
      </button>
    </div>
  )
}

/** A fork step — the same row Progress's own Lineage Tree draws (Figma
 *  "Highlight/Assessment", 16523:19712), so the two never read differently.
 *
 *  Opens the player, not this session's own detail page again — a step's
 *  own catalogue entry isn't modelled (only its title/author/note are), so
 *  the one thing every row can actually do is play the session whose
 *  lineage you are looking at (Figma 16698:8196). */
function LineageRow({
  step,
  index,
  last,
  session,
}: {
  step: SessionRecord['lineage'][number]
  index: number
  last: boolean
  session: SessionRecord
}) {
  return (
    <Fragment>
      <Link
        to={`/play/${session.slug}`}
        className={`u-press flex items-center gap-10 ${index === 0 ? 'pb-8' : last ? 'pt-8' : 'py-8'}`}
      >
        <PhotoCircle photo={last ? session.authorPhoto : 'avatar'} size={35} gradient={session.gradient} />
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="text-style-body-small truncate text-text-primary">{step.title}</span>
          <span className="text-style-caption truncate text-text-secondary">
            Created by {step.author}, {lineageDate(index)}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-icon-strong" />
      </Link>
      {!last && <span aria-hidden="true" className="h-px shrink-0 bg-border-subtle" />}
    </Fragment>
  )
}

export function SessionDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const session = findSession(slug)
  // Before the early return: a hook cannot sit behind one.
  const recreate = useRecreateTarget(session)

  // An unknown slug is a bad link, not an error state worth a screen.
  if (!session) return <Navigate to="/home" replace />

  return (
    <div className="min-h-[calc(100vh-54px)] bg-background-default pb-96 lg:min-h-screen">
      {/* Cover: the artwork alone. Back, Share and Play float on it rather
          than a separate header bar — there is nowhere else on this screen
          they need to be, and a header would cost 54px of a screen that is
          otherwise exactly one viewport. Full-bleed at the mobile width the
          frame was drawn at; the same aspect ratio stretched across a
          966px desktop content column would make the cover taller than the
          rest of the page, so it caps to a fixed height and the content
          column's own width there instead. */}
      <div className="relative aspect-[375/300] w-full overflow-hidden lg:mx-auto lg:aspect-auto lg:h-[320px] lg:max-w-[720px] lg:rounded-24">
        <CoverImage photo={session.photo} gradient={session.gradient} width={750} height={600} />
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="u-press absolute left-16 top-16 flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Share"
          className="u-press absolute right-16 top-16 flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong"
        >
          <Share2 size={18} />
        </button>
        <Link
          to={`/play/${session.slug}`}
          aria-label={`Play ${session.title}`}
          className="u-press absolute bottom-16 left-16 flex size-56 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-md"
        >
          <Play size={22} fill="currentColor" />
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[402px] px-20 lg:max-w-[720px]">
        <Link to={profilePath(session.author)} className="u-press mt-16 flex items-center gap-12">
          <PhotoCircle
            photo={session.authorPhoto}
            size={40}
            gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
          />
          <span className="text-style-body-small flex-1 font-medium text-text-primary">{session.author}</span>
          <ChevronRight size={18} className="text-icon-strong" />
        </Link>

        <h1 className="text-style-title-large mt-16 text-text-primary">{session.title}</h1>
        <Description text={session.summary} />
        <TagRow tags={session.tags} />

        <div className="mt-16 grid grid-cols-2 gap-12">
          <div className="rounded-16 border border-border-subtle p-14 text-center">
            <p className="text-style-title tabular-nums text-text-primary">{session.plays}</p>
            <p className="text-style-caption mt-2 text-text-secondary">Played</p>
          </div>
          <div className="rounded-16 border border-border-subtle p-14 text-center">
            <p className="text-style-title tabular-nums text-text-primary">{session.recreated}</p>
            <p className="text-style-caption mt-2 text-text-secondary">Recreated</p>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-style-body-small text-text-primary">Recreate your own version</h2>
          <div className="-mx-20 mt-12 flex gap-12 overflow-x-auto px-20 pb-4">
            {APPLIED_STYLES.map((style) => (
              <StylePresetCard key={style.id} style={style} session={session} />
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-style-body-small text-text-primary">Details</h2>
          {/* Figma "Highlight/Assessment" (16523:19712) — same card Progress
              draws its own Lineage Tree with. */}
          <div className="mt-12 flex flex-col gap-20 rounded-[20px] bg-surface-default p-20 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
            <h3 className="text-style-label text-text-primary">Lineage Tree</h3>
            <div className="flex flex-col gap-8">
              {session.lineage.map((step, index) => (
                <LineageRow
                  key={step.title}
                  step={step}
                  index={index}
                  last={index === session.lineage.length - 1}
                  session={session}
                />
              ))}
            </div>
            <button type="button" className="text-style-caption u-press w-fit text-text-secondary">
              See All ({session.lineage.length})
            </button>
          </div>
        </section>
      </div>

      {/* Portalled to the body: `.u-page` animates with a transform, which
          makes it the containing block for a `fixed` descendant, so an
          un-portalled bar would pin itself to the bottom of this scrollable
          page instead of the viewport (see Session settings' Apply changes
          button, and the sheets/modals this was first documented for). */}
      {createPortal(
        // left-0 alone centers this against the full window, sidebar
        // included — wrong once the 313px desktop sidebar is sitting beside
        // it rather than under it (see SessionSettingsPage's Apply changes
        // button, which needs the same offset).
        <div className="fixed inset-x-0 bottom-0 z-30 bg-background-default px-20 pb-20 pt-12 lg:left-[313px] lg:px-24">
          <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
            <Link
              to={recreate.to}
              state={recreate.state}
              className="u-press text-style-body flex h-52 w-full items-center justify-center gap-8 rounded-full bg-icon-strong font-semibold text-text-inverse"
            >
              <Repeat2 size={18} />
              Recreate
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
