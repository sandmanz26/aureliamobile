import { BUILD, BUILD_VERSION } from '../../lib/build'

/**
 * Which site is this, and which build?
 *
 * Small enough to sit in a sidebar without competing with anything, and it
 * answers the two questions that a screenshot cannot: production or staging,
 * and which cut. `/__demo` has the full panel; this is the version that is
 * always in front of you.
 *
 * **It deliberately does not link to `/__demo`.** That console sits outside the
 * site password so nobody can lock themselves out of the switch, which makes
 * its URL a way around the gate — a link to it from the app drawer would hand
 * that to every visitor. Read the badge, type the URL.
 *
 * Staging is the loud one. Production is the normal state of affairs and does
 * not need a banner; being on the rehearsal copy without realising is the
 * mistake worth interrupting for.
 */
export function BuildBadge({ dark = false }: { dark?: boolean }) {
  const staging = BUILD.environment !== 'production'

  const chip = staging
    ? 'bg-brand-default text-text-strong'
    : dark
      ? 'bg-white/12 text-white/80'
      : 'bg-background-elevated text-text-secondary'

  return (
    <div
      className="flex items-center gap-8"
      title={`${BUILD.label} · ${BUILD.branch} · built ${new Date(BUILD.builtAt).toLocaleString()}`}
    >
      <span className={`text-style-caption rounded-full px-8 py-2 leading-none ${chip}`}>{BUILD.label}</span>
      <span className={`text-style-caption font-mono ${dark ? 'text-white/45' : 'text-text-secondary'}`}>
        {BUILD_VERSION}
      </span>
    </div>
  )
}
