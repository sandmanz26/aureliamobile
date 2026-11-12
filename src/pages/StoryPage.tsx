import { ArrowLeft, ChevronRight, Clock, Play, Share2, Shuffle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { CoverImage } from '../components/ui/CoverImage'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { findStory, storyDate, type StoryBlock } from '../lib/journeys'
import { findPerson, personSlug, profilePath } from '../lib/people'
import { findSession } from '../lib/sessions'

/**
 * A personal journey (U066, Figma Session Detail 16906:8333): the photo full
 * bleed with back and share, then a sheet with the author, the story's title,
 * date and read time, the story in sections, a pull quote, the session it is
 * about, a photo carousel, and "Try the Session" fixed at the bottom.
 */
export function StoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const story = findStory(slug)
  if (!story) return <Navigate to="/explore" replace />
  const session = findSession(story.session)
  // The author links to their profile only where one exists in the catalogue.
  const profile = findPerson(personSlug(story.author)) ? profilePath(story.author) : null

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: story!.title, url })
      else await navigator.clipboard?.writeText(url)
    } catch {
      // Cancelled, or no permission: nothing to do.
    }
  }

  return (
    <div className="u-page relative pb-[120px]">
      <PageMeta title={story.title} />
      <div className="relative -mt-[30px] h-[378px] w-full overflow-hidden lg:mx-auto lg:mt-0 lg:h-[360px] lg:max-w-[960px] lg:rounded-24" style={{ background: story.gradient }}>
        <img src={story.photo} alt="" className="absolute inset-0 size-full object-cover" />
        <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="u-press absolute left-20 top-16 flex size-44 items-center justify-center rounded-12 bg-surface-default text-icon-strong shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <button type="button" aria-label="Share" onClick={share} className="u-press absolute right-20 top-16 flex size-44 items-center justify-center rounded-12 bg-surface-default text-icon-strong">
          <Share2 size={20} />
        </button>
      </div>

      <article className="relative -mt-32 rounded-t-32 bg-background-default lg:mx-auto lg:mt-0 lg:max-w-[960px] lg:rounded-none">
        <div className="mx-auto w-full max-w-[402px] px-20 pt-24 lg:max-w-[720px]">
          {profile ? (
            <Link to={profile} className="u-press flex items-center gap-8">
              <img src={story.avatar} alt="" className="size-24 rounded-full object-cover" />
              <span className="text-style-body text-text-primary">{story.author}</span>
              <ChevronRight size={12} className="text-icon-strong" />
            </Link>
          ) : (
            <p className="flex items-center gap-8">
              <img src={story.avatar} alt="" className="size-24 rounded-full object-cover" />
              <span className="text-style-body text-text-primary">{story.author}</span>
              <ChevronRight size={12} className="text-icon-strong" aria-hidden="true" />
            </p>
          )}
          <h1 className="text-style-title-large-regular mt-16 text-text-primary">{story.title}</h1>
          <p className="text-style-caption mt-12 flex items-center gap-8 text-text-secondary">
            <span>{storyDate(story.date)}</span>
            <span aria-hidden="true">•</span>
            <Clock size={12} aria-hidden="true" />
            <span>{story.minutes} mins read</span>
          </p>

          <div className="mt-24 flex flex-col gap-20">
            {story.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </div>
      </article>

      {session &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-30 bg-background-default px-20 pb-20 pt-12 lg:left-[260px] lg:px-24 [:root[data-tabbar]_&]:bottom-[calc(64px+env(safe-area-inset-bottom))] lg:[:root[data-tabbar]_&]:bottom-0">
            <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
              <Link to={`/play/${session.slug}`} className="u-press text-style-body flex h-56 w-full items-center justify-center gap-8 rounded-16 bg-[#331B04] text-text-inverse">
                Try the Session
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function Paragraphs({ text }: { text: string[] }) {
  return (
    <>
      {text.map((t, i) => (
        <p key={i} className="text-style-body-small font-light! text-text-primary">
          {t}
        </p>
      ))}
    </>
  )
}

function Block({ block }: { block: StoryBlock }) {
  switch (block.kind) {
    case 'p':
      return <Paragraphs text={[block.text]} />
    case 'section':
      return (
        <section className="flex flex-col gap-16">
          <h2 className="text-style-body-small font-medium! text-text-primary">{block.title}</h2>
          <Paragraphs text={block.text} />
        </section>
      )
    case 'quote':
      return (
        <blockquote
          className="text-style-body my-8 border-l-2 border-[#FF881B] px-20 py-16 text-text-primary"
          style={{ background: 'linear-gradient(90deg, #FFF1DB, rgba(255, 241, 219, 0))' }}
        >
          {block.text}
        </blockquote>
      )
    case 'session':
      return <SessionEmbed lead={block.lead} slug={block.slug} />
    case 'gallery':
      return <Gallery photos={block.photos} />
  }
}

/** The session the story is about (Figma 16906:8412): 160 high, the cover under a scrim, play, title, author, plays and recreates. */
function SessionEmbed({ lead, slug }: { lead: string; slug: string }) {
  const session = findSession(slug)
  if (!session) return null
  return (
    <section className="flex flex-col gap-20">
      <p className="text-style-body-small font-medium! text-text-primary">{lead}</p>
      <Link to={`/session/${session.slug}`} className="u-press relative flex h-[160px] flex-col justify-between overflow-hidden rounded-16 p-16 text-text-inverse">
        <CoverImage photo={session.photo} gradient={session.gradient} width={724} height={320} />
        <span className="relative flex size-32 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <Play size={14} fill="currentColor" />
        </span>
        <span className="relative flex flex-col gap-8">
          <span className="text-style-body">{session.title}</span>
          <span className="text-style-caption flex items-center gap-8">
            <PhotoCircle photo={session.authorPhoto} size={18} gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))" />
            <span className="min-w-0 flex-1 truncate">{session.author}</span>
            <span className="flex items-center gap-4"><Play size={11} />{session.plays}</span>
            <span aria-hidden="true" className="opacity-60">|</span>
            <span className="flex items-center gap-4"><Shuffle size={11} />{session.recreated}</span>
          </span>
        </span>
      </Link>
    </section>
  )
}

/** Three photos, the middle one centred with the others peeking (Figma 16906:8438), and dots. */
function Gallery({ photos }: { photos: string[] }) {
  const rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  // Figma opens on the middle photo, with one peeking on each side.
  useEffect(() => {
    const el = rail.current
    const mid = el?.children[Math.floor(photos.length / 2)] as HTMLElement | undefined
    if (el && mid) el.scrollLeft = mid.offsetLeft - (el.clientWidth - mid.offsetWidth) / 2
  }, [photos.length])
  return (
    <div className="flex flex-col items-center gap-16">
      <div
        ref={rail}
        onScroll={(e) => {
          const el = e.currentTarget
          const card = el.firstElementChild as HTMLElement | null
          if (card) setIndex(Math.round(el.scrollLeft / (card.offsetWidth + 16)))
        }}
        className="-mx-20 flex w-[calc(100%+40px)] snap-x snap-mandatory gap-16 overflow-x-auto px-[calc((100%-280px)/2+20px)] pb-2 [scrollbar-width:none]"
      >
        {photos.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="h-[240px] w-[280px] shrink-0 snap-center rounded-16 object-cover" />
        ))}
      </div>
      <div className="flex items-center gap-6" aria-hidden="true">
        {photos.map((_, i) => (
          <span key={i} className={`h-8 rounded-full transition-all ${i === index ? 'w-16' : 'w-8 bg-[#331B04]/20'}`} style={i === index ? { background: 'linear-gradient(90deg, #FF881B, #FFE682)' } : undefined} />
        ))}
      </div>
    </div>
  )
}
