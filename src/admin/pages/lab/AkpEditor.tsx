import { Download, History, Plus, RotateCcw, Trash2, Undo2, Upload, X } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'
import { inputClass } from '../../components/ui'
import {
  AKP_FUNCTION_IDS, AKP_LINK_TYPES, AKP_MODALITIES, AKP_STATUSES, akpEditsFile, defaultHelps, defaultUsedFor, describeEdit, diffFields, editsFor, makeEdit, parseAkpEditsImport, revertAkp,
  type AkpEdit, type AkpFields, type AkpView,
} from '../../data/akpEdits'
import { syncText, useAkpEdits } from '../../data/akpEditsSync'
import { FAMILIES, FAMILY, LINK_TEXT, akpById, akpByIdAny, akps, type AkpFamily, type LinkType } from '../../data/akps'
import { stateFlipById } from '../../data/stateFlips'
import { Mark } from './AkpGraph'
import { FAMILY_LOOK } from './akpStyle'

/*
 * Editing AKPs (U149, J207): the explainer at the top of the catalogue tab,
 * the edit bar (who is editing, the sync line, export / import / reset), and
 * the editor inside each AKP's drawer (fields, links, history, revert,
 * delete). Every change is one edit in akpEdits.ts, recorded with who, when
 * and what; the generated catalogue is never touched.
 */

const flipTitle = (id: string) => stateFlipById(id)?.title
const btn = 'inline-flex items-center gap-4 rounded-8 border border-adm-line px-10 py-6 text-12 font-medium text-adm-ink hover:bg-adm-hover disabled:opacity-50'
const primary = 'inline-flex items-center gap-4 rounded-8 bg-adm-ink px-12 py-6 text-12 font-medium text-adm-surface hover:opacity-90 disabled:opacity-50'
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/* ------------------------------------------------------------ Explainer */

function Piece({ family, children }: { family: AkpFamily; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-6 rounded-full border border-adm-line bg-adm-surface px-8 py-2 text-11 text-adm-ink">
      <Mark look={FAMILY_LOOK[family]} size={12} />
      {children}
    </li>
  )
}

/** "What is an AKP", with one chapter drawn as its pieces. */
export function AkpExplainer() {
  return (
    <section aria-labelledby="akp-what" className="flex min-w-0 flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20" data-akp-explainer>
      <h2 id="akp-what" className="text-15 font-semibold text-adm-ink">
        What is an AKP?
      </h2>
      <p className="max-w-[860px] text-13 leading-relaxed text-adm-ink-2">
        An <span className="font-semibold text-adm-ink">atomic knowledge point</span> is the smallest piece of know-how a session is built from: one breathing pattern, one tempo, one picture, one line of script. <span className="font-semibold text-adm-ink">Goal AKPs</span> say what the person wants to reach (a StateFlip and its steps X, Y, Z). <span className="font-semibold text-adm-ink">Strategy AKPs</span> say how to get there. Links say how two pieces work together. Every AKP can be edited here; each change records who made it and can be undone.
      </p>
      <figure className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line bg-adm-bg p-12" aria-label="One chapter as AKPs">
        <figcaption className="text-11 font-medium text-adm-muted">One chapter = these pieces (sleep, chapter 1)</figcaption>
        <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-center">
          <ul className="flex min-w-0 flex-wrap gap-6">
            <Piece family="script">Breathe in 4, out 6</Piece>
            <Piece family="script">Let muscles go</Piece>
            <Piece family="music">Tempo slows to 55</Piece>
            <Piece family="music">Night rain</Piece>
            <Piece family="image">Still water</Piece>
          </ul>
          <span className="shrink-0 whitespace-nowrap text-11 text-adm-muted" aria-hidden="true">
            <span className="lg:hidden">↓</span>
            <span className="hidden lg:inline">→ drive →</span>
          </span>
          <ul className="flex flex-wrap gap-6">
            <Piece family="goal">Step X: first relief from bad sleep</Piece>
          </ul>
          <span className="shrink-0 whitespace-nowrap text-11 text-adm-muted" aria-hidden="true">
            <span className="lg:hidden">↓</span>
            <span className="hidden lg:inline">→ toward →</span>
          </span>
          <ul className="flex flex-wrap gap-6">
            <Piece family="goal">StateFlip: bad sleep → rested</Piece>
          </ul>
        </div>
      </figure>
    </section>
  )
}

/* ------------------------------------------------------------- Edit bar */

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Who is editing, the sync line, and export / import / reset of every edit. */
export function AkpEditBar({ onNew }: { onNew: () => void }) {
  const { edits, sync, scope, who, setWho, commit } = useAkpEdits()
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const nameId = useId()
  const touched = new Set(edits.map((e) => e.akp)).size
  return (
    <section aria-label="Editing" className="flex min-w-0 flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-16" data-akp-editbar>
      <div className="flex min-w-0 flex-col gap-10 lg:flex-row lg:flex-wrap lg:items-end">
        <label htmlFor={nameId} className="flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted lg:w-[200px]">
          Editing as
          <input id={nameId} value={who} onChange={(e) => setWho(e.target.value)} maxLength={60} className={inputClass} data-editor-name />
        </label>
        <div className="flex flex-wrap gap-6">
          <button type="button" className={primary} onClick={onNew} data-akp-new>
            <Plus size={14} aria-hidden="true" /> New AKP
          </button>
          <button type="button" className={btn} onClick={() => download(`akp-edits-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(akpEditsFile(edits), null, 2))} data-akp-export>
            <Download size={14} aria-hidden="true" /> Export JSON
          </button>
          <button type="button" className={btn} onClick={() => file.current?.click()} data-akp-import>
            <Upload size={14} aria-hidden="true" /> Import JSON
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Import AKP edits file"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              const r = parseAkpEditsImport(await f.text())
              if (!r.ok) return setMsg({ ok: false, text: r.error })
              commit(r.edits)
              setMsg({ ok: true, text: `Imported ${r.edits.length} edits; they replace the ones that were here.` })
            }}
          />
          {confirmReset ? (
            <span className="inline-flex flex-wrap items-center gap-6 text-12 text-adm-ink">
              Undo all {edits.length} edits?
              <button type="button" className={btn} onClick={() => (commit([]), setConfirmReset(false), setMsg({ ok: true, text: 'Every edit undone; the catalogue is back to the generated draft.' }))} data-akp-reset-yes>
                Yes, reset all
              </button>
              <button type="button" className={btn} onClick={() => setConfirmReset(false)}>
                Keep them
              </button>
            </span>
          ) : (
            <button type="button" className={btn} disabled={!edits.length} onClick={() => setConfirmReset(true)} data-akp-reset>
              <RotateCcw size={14} aria-hidden="true" /> Reset all edits
            </button>
          )}
        </div>
      </div>
      <p className="text-12 text-adm-ink-2" aria-live="polite">
        {edits.length ? `${edits.length} ${edits.length === 1 ? 'edit' : 'edits'} to ${touched} ${touched === 1 ? 'AKP' : 'AKPs'}` : 'No edits yet: this is the generated draft.'}{' '}
        <span className={`text-11 ${sync === 'error' ? 'text-adm-critical' : 'text-adm-muted'}`} data-akp-sync={sync}>
          · {syncText(sync, scope)}
        </span>
      </p>
      {msg && (
        <p role="status" className={`text-12 ${msg.ok ? 'text-adm-ink-2' : 'text-adm-critical'}`}>
          {msg.text}
        </p>
      )}
    </section>
  )
}

/* --------------------------------------------------------------- Editor */

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-4 text-11 font-medium text-adm-muted">
      {label}
      {children}
      {hint && <span className="font-normal">{hint}</span>}
    </label>
  )
}

type Form = Required<Omit<AkpFields, 'flips'>> & { flips: string }

function formOf(a: AkpView): Form {
  return {
    name: a.name, family: a.family, fn: a.fn, layer: a.layer, modality: a.modality, status: a.status, description: a.description,
    usedFor: a.usedFor ?? '', helps: a.helps ?? '', causalRole: a.causalRole, flips: a.flips.join(', '),
  }
}

/** The editable fields, the links and the history of one AKP; lives inside its drawer. */
export function AkpEditPanel({ a, onSaved, onOpenAkp }: { a: AkpView; onSaved: (id: string) => void; onOpenAkp: (id: string) => void }) {
  const { edits, who, commit } = useAkpEdits()
  const [form, setForm] = useState(() => formOf(a))
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [confirmRevert, setConfirmRevert] = useState(false)
  const [linkTo, setLinkTo] = useState('')
  const [linkType, setLinkType] = useState<LinkType>('supports')
  const [linkError, setLinkError] = useState<string | null>(null)
  const listId = useId()
  const mine = editsFor(edits, a.id)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const push = (e: AkpEdit) => commit([...edits, e])

  const save = () => {
    const flips = [...new Set(form.flips.toUpperCase().split(/[\s,;]+/).filter(Boolean))]
    const unknown = flips.filter((f) => !stateFlipById(f))
    if (unknown.length) return setError(`Unknown StateFlip ${unknown.join(', ')}. Use ids like SF-PHY-01.`)
    if (!form.name.trim()) return setError('The name cannot be empty.')
    const next: AkpFields = { ...form, name: form.name.trim(), flips }
    const d = diffFields(a, next)
    setError(null)
    if (!d) return setNote('Nothing changed.')
    push(makeEdit('update', a.id, who, d))
    setNote(`Saved ${Object.keys(d.set).length} ${Object.keys(d.set).length === 1 ? 'change' : 'changes'}.`)
    onSaved(a.id)
  }

  const out = a.links
  const incoming = akps().filter((x) => x.links.some((l) => l.to === a.id))
  const addLink = () => {
    const to = linkTo.trim().split(/\s/)[0]
    if (!akpById(to)) return setLinkError(`No AKP with id “${to || '…'}”.`)
    if (to === a.id) return setLinkError('An AKP cannot link to itself.')
    if (out.some((l) => l.to === to && l.type === linkType)) return setLinkError('That link is already there.')
    setLinkError(null)
    setLinkTo('')
    push(makeEdit('link-add', a.id, who, { to, type: linkType }))
  }

  return (
    <div className="flex flex-col gap-12" data-akp-editor>
      {a.deleted && (
        <p className="rounded-8 border border-adm-critical p-8 text-12 text-adm-critical" role="status">
          Deleted: hidden from the catalogue, the graph and the counts. Restore it to bring it back.
        </p>
      )}
      <form
        className="flex flex-col gap-10"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        aria-label={`Edit ${a.id}`}
      >
        <Field label="Name">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={200} className={inputClass} data-field="name" />
        </Field>
        <div className="grid grid-cols-2 gap-8">
          <Field label="Family">
            <select value={form.family} onChange={(e) => set('family', e.target.value as AkpFamily)} className={inputClass} data-field="family">
              {FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {FAMILY[f].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Function">
            <select value={form.fn} onChange={(e) => set('fn', e.target.value as Form['fn'])} className={inputClass} data-field="fn">
              {AKP_FUNCTION_IDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Layer">
            <input value={form.layer} onChange={(e) => set('layer', e.target.value)} maxLength={120} className={inputClass} data-field="layer" />
          </Field>
          <Field label="Modality">
            <select value={form.modality} onChange={(e) => set('modality', e.target.value as Form['modality'])} className={inputClass} data-field="modality">
              {AKP_MODALITIES.map((m) => (
                <option key={m} value={m}>
                  {m === '—' ? 'None' : m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value as Form['status'])} className={inputClass} data-field="status">
              {AKP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Used for (plain words)" hint="Leave empty to use the generated wording shown.">
          <input value={form.usedFor} onChange={(e) => set('usedFor', e.target.value)} maxLength={300} placeholder={defaultUsedFor({ ...a, family: form.family, layer: form.layer, modality: form.modality })} className={inputClass} data-field="usedFor" />
        </Field>
        <Field label="Helps">
          <input value={form.helps} onChange={(e) => set('helps', e.target.value)} maxLength={300} placeholder={defaultHelps(a, flipTitle)} className={inputClass} data-field="helps" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={2000} rows={3} className={inputClass} data-field="description" />
        </Field>
        <Field label="Causal role">
          <textarea value={form.causalRole} onChange={(e) => set('causalRole', e.target.value)} maxLength={1000} rows={2} className={inputClass} data-field="causalRole" />
        </Field>
        <Field label="StateFlips served" hint="Ids separated by commas, e.g. SF-PHY-01, SF-EMO-03.">
          <input value={form.flips} onChange={(e) => set('flips', e.target.value)} className={inputClass} data-field="flips" />
        </Field>
        {error && (
          <p role="alert" className="text-12 text-adm-critical">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" className={primary} data-akp-save>
            Save changes
          </button>
          <button type="button" className={btn} onClick={() => (setForm(formOf(a)), setError(null), setNote(null))}>
            Cancel
          </button>
          {note && (
            <span role="status" className="text-12 text-adm-muted">
              {note}
            </span>
          )}
        </div>
      </form>

      <section className="flex flex-col gap-6 border-t border-adm-line pt-10" aria-label="Links">
        <h3 className="text-12 font-semibold text-adm-ink">Links</h3>
        <ul className="flex flex-col gap-4 text-12 text-adm-ink-2" data-akp-links>
          {out.map((l) => (
            <li key={`o${l.type}${l.to}`} className="flex min-w-0 items-start justify-between gap-6">
              <span className="min-w-0">
                {LINK_TEXT[l.type]}{' '}
                <button type="button" className="font-medium text-adm-ink underline-offset-2 hover:underline" onClick={() => onOpenAkp(l.to)}>
                  {l.to}
                </button>{' '}
                {akpByIdAny(l.to)?.name}
              </span>
              <button type="button" aria-label={`Remove link: ${LINK_TEXT[l.type]} ${l.to}`} className="shrink-0 rounded-8 p-4 text-adm-muted hover:bg-adm-hover hover:text-adm-critical" onClick={() => push(makeEdit('link-remove', a.id, who, { to: l.to, type: l.type }))} data-link-remove>
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
          {incoming.slice(0, 12).map((x) => {
            const l = x.links.find((y) => y.to === a.id)!
            return (
              <li key={`i${x.id}`} className="flex min-w-0 items-start justify-between gap-6">
                <span className="min-w-0">
                  <button type="button" className="font-medium text-adm-ink underline-offset-2 hover:underline" onClick={() => onOpenAkp(x.id)}>
                    {x.id}
                  </button>{' '}
                  {x.name} {LINK_TEXT[l.type]} this
                </span>
                <button type="button" aria-label={`Remove link: ${x.id} ${LINK_TEXT[l.type]} this`} className="shrink-0 rounded-8 p-4 text-adm-muted hover:bg-adm-hover hover:text-adm-critical" onClick={() => push(makeEdit('link-remove', x.id, who, { to: a.id, type: l.type }))}>
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            )
          })}
          {incoming.length > 12 && <li className="text-adm-muted">+ {incoming.length - 12} more linking here</li>}
          {!out.length && !incoming.length && <li className="text-adm-muted">No typed links yet.</li>}
        </ul>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <Field label="Add a link to (AKP id)">
            <input value={linkTo} onChange={(e) => setLinkTo(e.target.value)} list={listId} placeholder="e.g. WS-M2" className={inputClass} data-link-to />
          </Field>
          <datalist id={listId}>
            {akps().slice(0, 1200).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </datalist>
          <Field label="Type">
            <select value={linkType} onChange={(e) => setLinkType(e.target.value as LinkType)} className={inputClass} data-link-type>
              {AKP_LINK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LINK_TEXT[t]}
                </option>
              ))}
            </select>
          </Field>
          <button type="button" className={btn} onClick={addLink} data-link-add>
            <Plus size={14} aria-hidden="true" /> Add link
          </button>
        </div>
        {linkError && (
          <p role="alert" className="text-12 text-adm-critical">
            {linkError}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-6 border-t border-adm-line pt-10" aria-label="History">
        <h3 className="inline-flex items-center gap-4 text-12 font-semibold text-adm-ink">
          <History size={14} aria-hidden="true" /> History ({mine.length})
        </h3>
        {mine.length ? (
          <ol className="flex flex-col gap-4 text-11 text-adm-ink-2" data-akp-history>
            {[...mine].reverse().map((e) => (
              <li key={e.id}>
                <span className="font-medium text-adm-ink">{e.by}</span> · {when(e.at)} · {describeEdit(e)}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-11 text-adm-muted">As generated: nobody has edited it.</p>
        )}
        <div className="flex flex-wrap items-center gap-6">
          {a.deleted ? (
            <button type="button" className={btn} onClick={() => push(makeEdit('restore', a.id, who, {}))} data-akp-restore>
              <Undo2 size={14} aria-hidden="true" /> Restore
            </button>
          ) : (
            <button type="button" className={btn} onClick={() => push(makeEdit('delete', a.id, who, {}))} data-akp-delete>
              <Trash2 size={14} aria-hidden="true" /> Delete
            </button>
          )}
          {confirmRevert ? (
            <span className="inline-flex flex-wrap items-center gap-6 text-12 text-adm-ink">
              {a.added ? 'Remove this added AKP?' : `Undo its ${mine.length} edits?`}
              <button
                type="button"
                className={btn}
                onClick={() => {
                  commit(revertAkp(edits, a.id))
                  setConfirmRevert(false)
                  onSaved(a.id)
                }}
                data-akp-revert-yes
              >
                Yes, revert
              </button>
              <button type="button" className={btn} onClick={() => setConfirmRevert(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className={btn} disabled={!mine.length} onClick={() => setConfirmRevert(true)} data-akp-revert>
              <RotateCcw size={14} aria-hidden="true" /> Revert to original
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
