import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { JourneyCard } from '../components/journeys/JourneyCard'
import { STORIES } from '../lib/journeys'

/** Personal journeys → See All (U066): every story, two to a row. */
export function JourneysPage() {
  const navigate = useNavigate()
  return (
    <div className="u-page mx-auto w-full max-w-[402px] px-20 pb-40 pt-16 lg:max-w-[960px] lg:px-24">
      <PageMeta title="Personal journeys" />
      <div className="flex items-center gap-12">
        <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="u-press flex size-44 items-center justify-center rounded-12 bg-surface-default text-icon-strong shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-style-title text-text-primary">Personal Journeys</h1>
      </div>
      <p className="text-style-body-small mt-16 text-text-secondary">How people used Aurelia for a problem of their own, in their words.</p>
      <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <JourneyCard key={s.slug} story={s} className="w-full!" />
        ))}
      </div>
    </div>
  )
}
