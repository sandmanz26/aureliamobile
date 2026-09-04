import { Sparkles } from 'lucide-react'
import { useDrawer } from '../layouts/DrawerContext'
import { Menu } from 'lucide-react'

// Modules that exist in the Figma product map but have no screen built yet.
// Shown when the presenter switches one on in /__demo.
export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  const { openDrawer } = useDrawer()

  return (
    <div className="flex min-h-[80vh] flex-col">
      <div className="flex items-center px-20 py-16 lg:px-24">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openDrawer}
          className="flex size-44 items-center justify-center rounded-full text-icon-strong lg:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-16 px-24 text-center">
        <span
          className="flex size-64 items-center justify-center rounded-full text-text-inverse"
          style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
        >
          <Sparkles size={24} />
        </span>
        <div className="flex flex-col gap-8">
          <h1 className="text-style-title text-text-primary">{title}</h1>
          <p className="text-style-body-small max-w-[320px] text-text-secondary">{description}</p>
          <p className="text-style-caption mt-8 text-text-secondary">Designed in Figma — screen not built yet.</p>
        </div>
      </div>
    </div>
  )
}
