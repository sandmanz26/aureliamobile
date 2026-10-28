import { useEffect } from 'react'
import { BUILD, BUILD_VERSION } from '../lib/build'
import { IS_PRODUCTION } from './versions'
import { VersionSwitcher } from './VersionSwitcher'

/**
 * A thin bar fixed to the very top of every page, carrying the design-version
 * picker. Staging only until U054; production has it too now (on request),
 * with a quiet grey chip instead of the brand one, as BuildBadge does.
 *
 * It takes real space rather than covering the app: `data-staging-bar` on
 * <html> turns on `--staging-bar` in versions.css, which pushes the body down
 * and shortens the viewport-height layouts by the same amount.
 */
export function StagingBar() {
  useEffect(() => {
    document.documentElement.setAttribute('data-staging-bar', '')
    return () => document.documentElement.removeAttribute('data-staging-bar')
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex h-28 items-center justify-between gap-12 bg-[#1B1006] px-12 text-white">
      <p className="text-style-caption flex min-w-0 items-center gap-8">
        <span className={`rounded-full px-6 py-1 leading-none ${IS_PRODUCTION ? 'bg-white/15 text-white' : 'bg-brand-default text-text-strong'}`}>{BUILD.label}</span>
        <span className="truncate font-mono text-white/55">{BUILD_VERSION}</span>
      </p>
      <div className="flex shrink-0 items-center gap-6">
        <span className="text-style-caption text-white/55">Design</span>
        <VersionSwitcher dark />
      </div>
    </div>
  )
}
