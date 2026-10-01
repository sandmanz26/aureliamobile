import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { unsplash } from '../../lib/photos'

// Unlisted layout probe (/__about/gallery — reached from /__about, not
// linked anywhere else). Same reasoning as AboutLayoutPage: a photo grid
// for a business that has nothing to do with this product, so the grid
// itself — density, caption placement, aspect ratio — is what's on trial.

const PROJECTS = [
  { title: 'Birchwood House', tag: 'Residential · Portland', photo: '1600566753190-17f0baa2a6c3' },
  { title: 'Alder & Vine', tag: 'Hospitality · Austin', photo: '1600210492493-0946911123ea' },
  { title: 'Northbank Office', tag: 'Commercial · Seattle', photo: '1497366216548-37526070297c' },
  { title: 'Quiet Hollow Cabin', tag: 'Residential · Asheville', photo: '1449844908441-8829872d2607' },
  { title: 'The Cooper Loft', tag: 'Residential · Chicago', photo: '1600047509807-ba8f99d2cdde' },
  { title: 'Meridian Studio', tag: 'Workspace · Denver', photo: '1524758631624-e2822e304c36' },
  { title: 'Glasswood Pavilion', tag: 'Cultural · Minneapolis', photo: '1487958449943-2429e8be8625' },
  { title: 'Harbor House', tag: 'Residential · Portland, ME', photo: '1507089947368-19c1da9775ae' },
  { title: 'Stonegate Library', tag: 'Civic · Boulder', photo: '1521737604893-d14cc237f11d' },
]

export function GalleryLayoutPage() {
  return (
    <div className="min-h-screen bg-background-default">
      <header className="mx-auto flex max-w-[1100px] items-center gap-16 px-20 py-24 lg:px-0">
        <Link
          to="/__about"
          aria-label="Back to About"
          className="u-press flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="text-style-title text-text-primary">Fathom Studio</span>
        <span className="text-style-body-small text-text-secondary">Gallery</span>
      </header>

      <section className="mx-auto max-w-[1100px] px-20 pt-8 lg:px-0">
        <h1 className="text-style-headline text-text-primary">Recent work</h1>
        <p className="text-style-body mt-8 max-w-[520px] text-text-secondary">
          Nine projects, picked for how differently each one started — a renovation, a teardown, a single room.
        </p>
      </section>

      <section className="mx-auto mt-32 grid max-w-[1100px] grid-cols-1 gap-20 px-20 pb-64 sm:grid-cols-2 lg:grid-cols-3 lg:px-0">
        {PROJECTS.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-16 border border-border-subtle">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={unsplash(project.photo, 600, 450)}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-16">
              <h2 className="text-style-body font-semibold text-text-primary">{project.title}</h2>
              <p className="text-style-caption mt-4 text-text-secondary">{project.tag}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="border-t border-border-subtle py-24 text-center">
        <p className="text-style-caption text-text-secondary">Fathom Studio — dummy content, layout check only.</p>
      </footer>
    </div>
  )
}
