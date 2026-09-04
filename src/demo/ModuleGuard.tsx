import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFeatureFlags } from './FeatureFlags'

// Wraps a route so a module turned off in /__demo cannot be reached even by
// typing its URL — the nav item is already unclickable, this closes the
// back door.
export function ModuleGuard({ module, children }: { module: string; children: ReactNode }) {
  const { isEnabled } = useFeatureFlags()

  if (isEnabled(module)) return <>{children}</>

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-16 px-24 text-center">
      <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-icon-default">
        <Lock size={24} />
      </span>
      <div className="flex flex-col gap-8">
        <h1 className="text-style-title text-text-primary">Not part of this walkthrough</h1>
        <p className="text-style-body-small max-w-[320px] text-text-secondary">
          This module is outside the scope being demonstrated today.
        </p>
      </div>
    </div>
  )
}
