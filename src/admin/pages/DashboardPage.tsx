import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, LineChart } from '../components/Charts'
import { Legend, PageHeader, Panel, StatCard, StatusBadge } from '../components/ui'
import { AI_TIMESERIES, AUDIT_LOG, REPORTS, ROLES, SESSIONS, USERS } from '../data/mock'

const TRAFFIC_SERIES = [{ key: 'requests', label: 'AI requests', color: 'var(--color-adm-s1)' }]

export function DashboardPage() {
  const spend30 = AI_TIMESERIES.reduce((sum, day) => sum + day.opus + day.sonnet + day.haiku, 0)
  const openReports = REPORTS.filter((r) => r.status === 'open' || r.status === 'in_review')
  const published = SESSIONS.filter((s) => s.status === 'published')
  const recentAudit = [...AUDIT_LOG].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6)

  const topSessions = [...SESSIONS]
    .filter((s) => s.status === 'published')
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 6)
    .map((s) => ({ label: s.title, value: s.plays }))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Platform health at a glance. Every figure links through to the module that owns it."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Users" value={USERS.length.toLocaleString()} delta={6.2} hint="30d" />
        <StatCard label="Published sessions" value={published.length.toLocaleString()} delta={14.7} />
        <StatCard label="AI spend (30d)" value={`$${spend30.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} delta={12.4} inverse />
        <StatCard label="Open reports" value={openReports.length.toLocaleString()} delta={-8.2} inverse />
        <StatCard label="Staff accounts" value={ROLES.reduce((sum, r) => sum + r.members, 0).toLocaleString()} hint="across 5 roles" />
        <StatCard label="Audit entries" value={AUDIT_LOG.length.toLocaleString()} hint="30d" />
      </div>

      <div className="grid gap-16 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="AI request volume"
          description="Daily generation and chat calls across all models."
          actions={<Legend items={TRAFFIC_SERIES.map((s) => ({ label: s.label, color: s.color }))} />}
        >
          <LineChart
            data={AI_TIMESERIES}
            xKey="date"
            series={TRAFFIC_SERIES}
            format={(v) => `${(v / 1000).toFixed(0)}k`}
          />
        </Panel>

        <Panel title="Most played sessions" description="Published catalogue, by lifetime plays.">
          <BarChart data={topSessions} format={(v) => `${(v / 1000).toFixed(1)}k`} />
        </Panel>
      </div>

      <div className="grid gap-16 xl:grid-cols-2">
        <Panel
          title="Needs attention"
          description="Queues that are past target or trending the wrong way."
          actions={
            <Link to="/admin/moderation" className="u-tap flex items-center gap-4 text-12 font-medium text-adm-ink hover:underline">
              Moderation <ArrowRight size={13} />
            </Link>
          }
        >
          <div className="flex flex-col gap-2">
            {openReports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center gap-10 border-b border-adm-line py-8 last:border-0">
                <StatusBadge status={report.severity} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-13 text-adm-ink">{report.sessionTitle}</p>
                  <p className="text-12 text-adm-muted">{report.reason}</p>
                </div>
                <span
                  className={`shrink-0 text-12 tabular-nums ${report.slaHoursLeft < 0 ? 'font-medium text-adm-critical' : 'text-adm-ink-2'}`}
                >
                  {report.slaHoursLeft < 0
                    ? `${Math.abs(report.slaHoursLeft).toFixed(0)}h over`
                    : `${report.slaHoursLeft.toFixed(0)}h left`}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Recent admin activity"
          description="Latest privileged actions."
          actions={
            <Link to="/admin/audit" className="u-tap flex items-center gap-4 text-12 font-medium text-adm-ink hover:underline">
              Audit log <ArrowRight size={13} />
            </Link>
          }
        >
          <div className="flex flex-col gap-2">
            {recentAudit.map((entry) => (
              <div key={entry.id} className="flex items-center gap-10 border-b border-adm-line py-8 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-13 text-adm-ink">
                    <span className="font-medium">{entry.actor}</span>{' '}
                    <code className="text-12 text-adm-ink-2">{entry.action}</code>
                  </p>
                  <p className="truncate text-12 text-adm-muted">{entry.target}</p>
                </div>
                <StatusBadge status={entry.result} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
