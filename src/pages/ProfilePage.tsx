import { Bookmark, Repeat2, Share2 } from 'lucide-react'

interface SessionCard {
  title: string
  description: string
  plays: string
  recreated: string
  gradient: string
}

const cards: SessionCard[] = [
  {
    title: 'Dolphins frequency',
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-blue-800), var(--color-blue-400))',
  },
  {
    title: 'Soft Reset',
    description: 'This helped Adam feel more relaxed, with 91% less tension.',
    plays: '18.5k',
    recreated: '1.5k',
    gradient: 'linear-gradient(160deg, var(--color-amber-300), var(--color-red-200))',
  },
  {
    title: 'Deep Space',
    description: 'This helped Adam quiet thoughts by 38% in less than a week.',
    plays: '12.1k',
    recreated: '980',
    gradient: 'linear-gradient(160deg, var(--color-neutral-950), var(--color-neutral-700))',
  },
  {
    title: 'Clear Skies',
    description: 'This helped Adam boost focus by 46% in less than a week.',
    plays: '9.8k',
    recreated: '640',
    gradient: 'linear-gradient(160deg, var(--color-blue-200), var(--color-neutral-100))',
  },
]

const stats = [
  { label: 'Posts', value: '6' },
  { label: 'Played', value: '18,513' },
  { label: 'Recreated', value: '1,528' },
]

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-[720px] px-24 py-24">
      <header className="flex items-center justify-between">
        <h1 className="text-style-title-large text-text-primary">Profile</h1>
        <div className="flex items-center gap-12">
          <div className="flex h-44 items-center gap-8 rounded-full bg-surface-default px-16 shadow-sm">
            <span className="size-16 rounded-full bg-brand-default" />
            <span className="text-style-label">1,323</span>
          </div>
          <button
            type="button"
            aria-label="Share profile"
            className="flex size-44 items-center justify-center rounded-full bg-surface-default text-icon-default shadow-sm"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <div className="mt-24 flex flex-col items-center gap-16">
        <div className="size-96 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 p-2">
          <div className="size-full rounded-full bg-surface-default" />
        </div>
        <div className="text-center">
          <p className="text-style-title text-text-strong">Adam Nilson</p>
          <p className="text-style-label">Dubai, UAE</p>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-3 divide-x divide-border-subtle rounded-16 bg-surface-default py-16">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-4">
            <p className="text-style-title text-text-strong">{stat.value}</p>
            <p className="text-style-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-2 gap-12">
        {cards.map((card) => (
          <article
            key={card.title}
            className="relative flex h-[230px] flex-col justify-between overflow-hidden rounded-16 p-12 text-text-inverse"
            style={{ background: card.gradient }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Save"
                className="flex size-32 items-center justify-center rounded-full bg-surface-default/90 text-icon-default"
              >
                <Bookmark size={16} />
              </button>
              <button
                type="button"
                className="flex h-32 items-center gap-4 rounded-full bg-surface-default/90 px-12 text-style-label text-text-primary"
              >
                <Repeat2 size={14} />
                Recreate
              </button>
            </div>
            <div>
              <p className="text-style-body-small font-semibold">{card.title}</p>
              <p className="mt-4 text-style-caption line-clamp-2 opacity-90">{card.description}</p>
              <div className="mt-8 flex items-center gap-12 text-style-caption opacity-90">
                <span>▶ {card.plays}</span>
                <span>⟳ {card.recreated}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
