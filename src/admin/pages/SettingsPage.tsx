import { useState } from 'react'
import { PageHeader, Panel } from '../components/ui'
import { MODEL_PRICING } from '../data/mock'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`u-tap relative h-22 w-40 shrink-0 rounded-full transition-colors ${checked ? 'bg-adm-good' : 'bg-adm-line'}`}
    >
      <span
        className={`absolute top-2 size-18 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-20' : 'left-2'}`}
      />
    </button>
  )
}

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-16 border-b border-adm-line py-12 last:border-0">
      <div className="min-w-0">
        <p className="text-13 font-medium text-adm-ink">{title}</p>
        <p className="mt-2 text-12 text-adm-ink-2">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function SettingsPage() {
  // Mirrors what the consumer app actually ships today. A flag panel that
  // disagrees with the product is worse than no panel: an operator reads it to
  // decide what is live, and acts on what it says.
  const [flags, setFlags] = useState({
    community: true,
    voice: true,
    challenges: true,
    wearables: true,
    sessionSettings: false,
  })
  const [model, setModel] = useState('claude-opus-5')
  const [budget, setBudget] = useState('12000')

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform configuration. Model and budget changes require the ai.config / ai.budget permissions and are written to the audit log."
      />

      <div className="grid gap-16 xl:grid-cols-2">
        <Panel title="AI configuration" description="Which model serves session generation, and the monthly spend ceiling.">
          <Row title="Primary generation model" description="Used for session scripts and chat replies.">
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-32 rounded-8 border border-adm-line bg-adm-surface px-10 text-13 text-adm-ink outline-none focus:border-adm-accent"
            >
              {Object.keys(MODEL_PRICING).map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </Row>
          <Row title="Monthly spend ceiling (USD)" description="Generation degrades to the cheaper model past this figure.">
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              inputMode="numeric"
              className="h-32 w-[120px] rounded-8 border border-adm-line bg-adm-surface px-10 text-right text-13 tabular-nums text-adm-ink outline-none focus:border-adm-accent"
            />
          </Row>
          <Row title="Current list price" description={`Input / output per 1M tokens for ${model}.`}>
            <span className="whitespace-nowrap text-13 tabular-nums text-adm-ink">
              ${MODEL_PRICING[model].in.toFixed(2)} / ${MODEL_PRICING[model].out.toFixed(2)}
            </span>
          </Row>
        </Panel>

        <Panel title="Feature flags" description="Platform-wide switches. These gate the consumer app for every user.">
          <Row title="Community publishing" description="Lets users publish sessions to the community feed.">
            <Toggle checked={flags.community} onChange={(v) => setFlags({ ...flags, community: v })} label="Community publishing" />
          </Row>
          <Row title="Voice input" description="Microphone capture in the chat cockpit.">
            <Toggle checked={flags.voice} onChange={(v) => setFlags({ ...flags, voice: v })} label="Voice input" />
          </Row>
          <Row title="Challenges" description="Group challenges and leaderboards, with the podium and standings.">
            <Toggle checked={flags.challenges} onChange={(v) => setFlags({ ...flags, challenges: v })} label="Challenges" />
          </Row>
          <Row title="Wearable sync" description="Sleep and HRV import, switched per source on My Wellness.">
            <Toggle checked={flags.wearables} onChange={(v) => setFlags({ ...flags, wearables: v })} label="Wearable sync" />
          </Row>
          <Row
            title="Session settings"
            description="Script / Visual / Sound editing behind the chat ⋯ menu. Built and working, held dark until it has been rehearsed — off is the intended state."
          >
            <Toggle
              checked={flags.sessionSettings}
              onChange={(v) => setFlags({ ...flags, sessionSettings: v })}
              label="Session settings"
            />
          </Row>
        </Panel>
      </div>
    </>
  )
}
