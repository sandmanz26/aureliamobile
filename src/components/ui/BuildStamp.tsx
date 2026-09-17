import { useEffect, useState } from 'react'

/**
 * What is actually running, stated on the page.
 *
 * "I pushed that and I cannot see it" has cost this project real time, and the
 * answer has been a stale deployment more than once — a browser holding an old
 * `index.html` looks identical from the outside. Neither is diagnosable from a
 * screenshot, so the bundle carries its own provenance and prints it here.
 *
 * The age ticks, because a stamp reading "17:42" tells you nothing unless you
 * happen to know what time it is; "4 minutes ago" is the thing you actually
 * want to know.
 */
function ago(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function BuildStamp() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const built = new Date(__BUILT_AT__)
  const valid = !Number.isNaN(built.getTime())

  return (
    <div className="rounded-16 border border-border-subtle bg-surface-default p-16">
      <p className="text-style-caption uppercase tracking-widest text-text-secondary">This build</p>
      <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-16 gap-y-8">
        <dt className="text-style-body-small text-text-secondary">Commit</dt>
        <dd className="text-style-body-small font-mono text-text-primary">{__BUILD_ID__}</dd>

        <dt className="text-style-body-small text-text-secondary">Branch</dt>
        <dd className="text-style-body-small font-mono text-text-primary">{__BUILD_BRANCH__}</dd>

        <dt className="text-style-body-small text-text-secondary">Built</dt>
        <dd className="text-style-body-small text-text-primary">
          {valid ? (
            <>
              {built.toLocaleString()} <span className="text-text-secondary">· {ago(__BUILT_AT__, now)}</span>
            </>
          ) : (
            'unknown'
          )}
        </dd>
      </dl>
      {/* The two failure modes look the same from a screenshot, so name both and
          say which action fixes which. */}
      <p className="text-style-caption mt-12 text-text-secondary">
        If this commit is behind the branch you pushed, the <strong>deployment</strong> is behind and clearing a cache
        will not help — check which branch the Vercel project builds. If it matches but a screen still looks old, it is
        the <strong>browser</strong>: hard-reload (Cmd/Ctrl + Shift + R).
      </p>
    </div>
  )
}
