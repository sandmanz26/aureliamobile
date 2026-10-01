import { Link } from 'react-router-dom'
import { unsplash } from '../../lib/photos'

// Unlisted layout probe (/__about — not linked from anywhere in the app,
// same as /__demo). Deliberately not Aurelia: a wellness studio's own
// About page can't tell you whether an About/Gallery *pattern* reads well,
// because every piece of real copy and every photo is already doing work
// you'd have to mentally subtract. A business with nothing to do with this
// product — invented, dummy data throughout — isolates the layout from the
// content. Styled with the app's own tokens so what's being judged is the
// structure, not a second design system.

const STATS = [
  { value: '14', label: 'Years' },
  { value: '120+', label: 'Projects' },
  { value: '18', label: 'People' },
  { value: '6', label: 'Cities' },
]

const TEAM = [
  { name: 'Mara Lindqvist', role: 'Principal Architect', photo: '1544005313-94ddf0286df2' },
  { name: 'Theo Bracken', role: 'Design Director', photo: '1531427186611-ecfd6d936c79' },
  { name: 'Priya Nandakumar', role: 'Interiors Lead', photo: '1438761681033-6461ffad8d80' },
  { name: 'Owen Castellano', role: 'Project Director', photo: '1519345182560-3f2917c472ef' },
]

const VALUES = [
  {
    title: 'Honest materials',
    body: 'Timber reads as timber, concrete as concrete. Nothing is dressed up to look like something it isn’t.',
  },
  {
    title: 'Light first',
    body: 'Every plan starts with where the sun is at 8am and 6pm, not where the walls look best on paper.',
  },
  {
    title: 'Built to last',
    body: 'We detail for the repair in twenty years, not just the photograph on day one.',
  },
]

export function AboutLayoutPage() {
  return (
    <div className="min-h-screen bg-background-default">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-20 py-24 lg:px-0">
        <span className="text-style-title text-text-primary">Fathom Studio</span>
        <Link to="/__about/gallery" className="text-style-body-small font-medium text-text-brand">
          Gallery
        </Link>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto max-w-[1100px] px-20 pt-16 lg:px-0">
        <h1 className="text-style-display max-w-[720px] text-text-primary">
          We design spaces people don’t want to leave.
        </h1>
        <p className="text-style-body-large mt-16 max-w-[560px] text-text-secondary">
          Fathom is a twelve-person architecture and interiors studio working on homes, workplaces and the occasional
          small civic building — always on sites we’ve walked before we’ve drawn a single wall.
        </p>
      </section>

      <div className="mx-auto mt-32 max-w-[1100px] px-20 lg:px-0">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-24">
          <img
            src={unsplash('1600585154340-be6161a56a0c', 1600, 900)}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* ----------------------------------------------------------- stats */}
      <section className="mx-auto mt-48 grid max-w-[1100px] grid-cols-2 gap-24 px-20 lg:grid-cols-4 lg:px-0">
        {STATS.map((stat) => (
          <div key={stat.label} className="border-l border-border-subtle pl-16">
            <p className="text-style-headline text-text-primary">{stat.value}</p>
            <p className="text-style-body-small text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------ team */}
      <section className="mx-auto mt-64 max-w-[1100px] px-20 lg:px-0">
        <h2 className="text-style-title-large text-text-primary">The people</h2>
        <div className="mt-24 grid grid-cols-2 gap-24 lg:grid-cols-4">
          {TEAM.map((person) => (
            <div key={person.name}>
              <div className="aspect-square w-full overflow-hidden rounded-16">
                <img
                  src={unsplash(person.photo, 400, 400)}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-style-body-small mt-12 font-medium text-text-primary">{person.name}</p>
              <p className="text-style-caption text-text-secondary">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- values */}
      <section className="mx-auto mt-64 max-w-[1100px] px-20 lg:px-0">
        <h2 className="text-style-title-large text-text-primary">How we work</h2>
        <div className="mt-24 grid grid-cols-1 gap-20 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-16 border border-border-subtle p-20">
              <h3 className="text-style-body font-semibold text-text-primary">{value.title}</h3>
              <p className="text-style-body-small mt-8 text-text-secondary">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------cta */}
      <section className="mx-auto mt-64 flex max-w-[1100px] flex-col items-center gap-16 px-20 pb-64 text-center lg:px-0">
        <h2 className="text-style-title-large text-text-primary">Recent work</h2>
        <p className="text-style-body text-text-secondary">Nine projects, picked for how differently each one started.</p>
        <Link
          to="/__about/gallery"
          className="u-press flex h-52 items-center justify-center rounded-full bg-icon-strong px-32 text-style-body font-medium text-text-inverse"
        >
          See the gallery
        </Link>
      </section>

      <footer className="border-t border-border-subtle py-24 text-center">
        <p className="text-style-caption text-text-secondary">Fathom Studio — dummy content, layout check only.</p>
      </footer>
    </div>
  )
}
