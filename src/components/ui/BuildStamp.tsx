import { ExternalLink } from 'lucide-react'
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
 *
 * Since staging and production went up, the panel also has to answer *which
 * site is this* — the two are identical from a screenshot, and "I published
 * and the client still sees the old scope" is the same question wearing a
 * different hat.
 */

/** What Vercel calls the deployment, said the way a human would say it. */
const ENVIRONMENTS: Record<string, { label: string; tone: string }> = {
  production: { label: 'Production', tone: 'bg-brand-default text-text-strong' },
  preview: { label: 'Staging', tone: 'bg-background-elevated text-text-primary' },
  local: { label: 'Local', tone: 'bg-background-elevated text-text-secondary' },
}

/**
 * The other deployment, if there is one.
 *
 * Both sites carry both URLs and each links to the one it is not, so a single
 * shared pair of env vars configures them. Neither is required: with the vars
 * unset the link is simply absent, which is correct for a project with one
 * deployment.
 */
function peer(environment: string) {
  const production = import.meta.env.VITE_PRODUCTION_URL?.trim()
  const staging = import.meta.env.VITE_STAGING_URL?.trim()
  if (environment === 'production') return staging ? { label: 'Open staging', href: staging } : null
  return production ? { label: 'Open production', href: production } : null
}

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
  const environment = ENVIRONMENTS[__BUILD_ENV__] ?? { label: __BUILD_ENV__, tone: 'bg-background-elevated text-text-secondary' }
  const other = peer(__BUILD_ENV__)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const built = new Date(__BUILT_AT__)
  const valid = !Number.isNaN(built.getTime())

  return (
    <div className="rounded-16 border border-border-subtle bg-surface-default p-16">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <p className="text-style-caption uppercase tracking-widest text-text-secondary">This build</p>
        {other && (
          <a
            href={other.href}
            className="text-style-caption flex items-center gap-4 rounded-full border border-border-subtle px-12 py-4 text-text-primary hover:bg-background-elevated"
          >
            {other.label}
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-16 gap-y-8">
        <dt className="text-style-body-small text-text-secondary">Environment</dt>
        <dd>
          <span className={`text-style-caption rounded-full px-10 py-2 ${environment.tone}`}>{environment.label}</span>
        </dd>

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
