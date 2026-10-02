import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Modal } from '../components/Modal'
import type { Column } from '../components/DataTable'
import { DataTable } from '../components/DataTable'
import { Badge, Button, FormField, PageHeader, Panel, StatCard, textareaClass } from '../components/ui'
import type { Reply, Rule } from '../../lib/replies'
import { FALLBACK, RULES } from '../../lib/replies'

/** An editable projection of a Rule — the trigger pattern stays whatever the
 *  real regex is; only the reply around it is something this page lets
 *  someone rewrite. `replyText`/`changes`/`proposes`/`hasPrompts` are flat
 *  copies of fields inside `reply`, so the table's search, sort and CSV
 *  export read real values instead of stringifying the `reply` object. */
interface RuleRow {
  id: string
  pattern: string
  reply: Reply
  replyText: string
  changes: boolean
  proposes: boolean
  hasPrompts: boolean
}

function toRow(id: string, pattern: string, reply: Reply): RuleRow {
  return {
    id,
    pattern,
    reply,
    replyText: reply.text,
    changes: reply.changes ?? false,
    proposes: reply.proposes ?? false,
    hasPrompts: Boolean(reply.prompts),
  }
}

function toRows(rules: Rule[]): RuleRow[] {
  return rules.map((rule) => toRow(rule.id, rule.test.source, rule.reply))
}

/** The edit sheet a row's "Edit" action opens. The trigger pattern is shown,
 *  never as a field to type into — it is the regex `replyTo()` actually runs
 *  in production, and a typo here would silently stop a rule from firing
 *  with nothing in the UI to say so. What an ops or content person actually
 *  wants to tune is the words Aurelia says back, and whether saying them
 *  commits the cockpit to a proposal or a new cut. */
function EditRuleForm({ row, onSave, onClose }: { row: RuleRow; onSave: (row: RuleRow) => void; onClose: () => void }) {
  const [reply, setReply] = useState<Reply>(row.reply)

  return (
    <div className="flex flex-col gap-16">
      <FormField label="Trigger pattern" hint="Not editable here — a changed pattern can silently stop this rule from matching, with nothing in this UI to catch it.">
        <code className="block overflow-x-auto rounded-8 border border-adm-line bg-adm-hover px-10 py-8 text-12 text-adm-ink-2">
          /{row.pattern}/
        </code>
      </FormField>

      <FormField label="Reply text" hint="What Aurelia says back when this rule matches.">
        <textarea value={reply.text} onChange={(event) => setReply({ ...reply, text: event.target.value })} className={textareaClass} />
      </FormField>

      <div className="flex flex-col gap-8">
        <label className="flex items-center gap-8 text-13 text-adm-ink">
          <input
            type="checkbox"
            checked={reply.changes ?? false}
            onChange={(event) => setReply({ ...reply, changes: event.target.checked })}
          />
          Produces a new cut (the cockpit must show a version bump)
        </label>
        <label className="flex items-center gap-8 text-13 text-adm-ink">
          <input
            type="checkbox"
            checked={reply.proposes ?? false}
            onChange={(event) => setReply({ ...reply, proposes: event.target.checked })}
          />
          Hands over the recommendation deck
        </label>
      </div>

      {reply.prompts && (
        <FormField label="Prompts offered instead of an answer" hint="One per line.">
          <textarea
            value={reply.prompts.join('\n')}
            onChange={(event) => setReply({ ...reply, prompts: event.target.value.split('\n') })}
            className={textareaClass}
          />
        </FormField>
      )}

      <div className="mt-4 flex justify-end gap-8 border-t border-adm-line pt-16">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(toRow(row.id, row.pattern, reply))}>Save changes</Button>
      </div>
    </div>
  )
}

export function CockpitRulesPage() {
  const [rows, setRows] = useState<RuleRow[]>(() => toRows(RULES))
  const [editing, setEditing] = useState<RuleRow | null>(null)

  function save(updated: RuleRow) {
    setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)))
    setEditing(null)
  }

  const proposing = rows.filter((row) => row.proposes).length
  const changing = rows.filter((row) => row.changes).length

  const columns: Column<RuleRow>[] = [
    { key: 'id', header: 'Rule', render: (row) => <code className="text-12 text-adm-ink">{row.id}</code> },
    {
      key: 'pattern',
      header: 'Trigger pattern',
      sortable: false,
      render: (row) => <code className="block max-w-[260px] truncate text-11 text-adm-muted">/{row.pattern}/</code>,
    },
    {
      key: 'replyText',
      header: 'Reply',
      render: (row) => <p className="max-w-[360px] truncate text-13 text-adm-ink">{row.replyText}</p>,
    },
    {
      key: 'changes',
      header: 'Behaviour',
      sortable: false,
      render: (row) => (
        <div className="flex gap-4">
          {row.changes && <Badge tone="info">changes</Badge>}
          {row.proposes && <Badge tone="good">proposes</Badge>}
          {row.hasPrompts && <Badge tone="neutral">prompts</Badge>}
        </div>
      ),
    },
    {
      key: 'id',
      header: '',
      sortable: false,
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon={<Pencil size={12} />} onClick={() => setEditing(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Cockpit rules"
        description="The reply engine behind every chat session — a keyword matcher, not a model. The first rule whose pattern matches the message wins; order in the source is the priority order."
      />

      <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
        <StatCard label="Rules" value={rows.length.toString()} />
        <StatCard label="Propose a brief" value={proposing.toString()} hint="hand over the recommendation deck" />
        <StatCard label="Produce a new cut" value={changing.toString()} hint="the version the card must show" />
        <StatCard label="Fallback" value="1" hint="when nothing matches" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        exportName="aurelia-cockpit-rules"
        searchKeys={['id']}
        pageSize={20}
      />

      <Panel
        title="Fallback reply"
        description="What Aurelia says when no rule above matches. It says it took a note rather than pretending to understand — a confident non-answer is worse than a plain one."
      >
        <p className="text-13 text-adm-ink">{FALLBACK.text}</p>
      </Panel>

      {editing && (
        <Modal title="Edit rule" description={editing.id} onClose={() => setEditing(null)} width={520}>
          <EditRuleForm row={editing} onSave={save} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  )
}
