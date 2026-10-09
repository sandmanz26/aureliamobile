import { useEffect } from 'react'
import { BUILD, BUILD_VERSION } from '../lib/build'
import { VERSIONS_ENABLED } from './versions'
import { VersionSwitcher } from './VersionSwitcher'

/**
 * A thin bar fixed to the very top of every page on staging, carrying the
 * design-version picker. Renders nothing on production.
 *
 * It takes real space rather than covering the app: `data-staging-bar` on
 * <html> turns on `--staging-bar` in versions.css, which pushes the body down
 * and shortens the viewport-height layouts by the same amount.
 */
export function StagingBar() {
  useEffect(() => {
    if (!VERSIONS_ENABLED) return
    document.documentElement.setAttribute('data-staging-bar', '')
    return () => document.documentElement.removeAttribute('data-staging-bar')
  }, [])

  if (!VERSIONS_ENABLED) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex h-28 items-center justify-between gap-12 bg-[#1B1006] px-12 text-white">
      <p className="text-style-caption flex min-w-0 items-center gap-8">
        <span className="rounded-full bg-brand-default px-6 py-1 leading-none text-text-strong">{BUILD.label}</span>
        <span className="truncate font-mono text-white/55">{BUILD_VERSION}</span>
      </p>
      <div className="flex shrink-0 items-center gap-6">
        <span className="text-style-caption text-white/55">Design</span>
        <VersionSwitcher dark />
      </div>
    </div>
  )
}
