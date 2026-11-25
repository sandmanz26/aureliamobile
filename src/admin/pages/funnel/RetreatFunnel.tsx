import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, FormField, Panel, inputClass } from '../../components/ui'
import { Details } from '../reports/ReportSummary'
import { InfoTip } from './InfoTip'
import { OFFERS, OUTCOMES, PLUS_NET_YEAR1, cohort, eur, pct, perTicket, pilotGates, type Offer, type Outcome } from '../../data/retreatFunnel'

/**
 * The creator retreat (B2B2C) view of the Business funnel (U113, J159):
 * the brief's Retreat-in-a-Box, as written and as redesigned (approved
 * 24 Nov 2026), on the wiki's unit-economics inputs. Pick the terms (offer)
 * and how people behave (outcome); every assumption can be changed here and
 * reset. Estimates until the pilot measures them. Summary first since
 * U127 (J180): tiles, gate chips and the funnel; the rest in Details.
 */
export function RetreatFunnel() {
  const [offerId, setOfferId] = useState('redesign')
  const [outcomeId, setOutcomeId] = useState<Outcome['id']>('middle')
  const [seats, setSeats] = useState(200)
  const [creators, setCreators] = useState(5)
  const [edits, setEdits] = useState<Partial<Offer & Outcome>>({})

  const baseOffer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[1]
  const baseOutcome = OUTCOMES.find((o) => o.id === outcomeId) ?? OUTCOMES[1]
  const offer: Offer = { ...baseOffer, ...pick(edits, ['price', 'creatorShare', 'creatorPlusShare', 'aiPerBuyer', 'boxPerBuyer']) }
  const outcome: Outcome = { ...baseOutcome, ...pick(edits, ['activeWeek8', 'gradToPlus', 'refundRate']) }
  const edited = Object.keys(edits).length > 0
  const c = cohort(offer, outcome, seats)
  const gates = pilotGates(offer, outcome, seats)
  const passed = gates.filter((g) => g.pass).length

  const set = (k: keyof (Offer & Outcome), v: number) => setEdits((e) => ({ ...e, [k]: v }))

  const [about, setAbout] = useState(false)
  const cut = (l: string) => l.replace(/ per cohort| per ticket buyer| and payment/g, '')

  return (
    <div className="flex flex-col gap-20">
      <section aria-label="Summary" className="flex min-w-0 flex-col gap-16 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
        <div className="flex flex-col gap-6">
          <p className="text-18 font-semibold leading-snug text-adm-ink">
            {passed} of {gates.length} pilot gates pass
            <span className="text-adm-ink-2">
              {' '}
              · Aurelia {c.aureliaTotal < 0 ? 'loses' : 'makes'} {eur(Math.abs(c.aureliaTotal))} per cohort
            </span>
          </p>
          <p className="flex flex-wrap items-center gap-8 text-12 text-adm-muted">
            <Badge tone="good">Redesign approved 24 Nov 2026</Badge>
            <span>Estimates until a pilot measures them.</span>
            <button type="button" aria-expanded={about} onClick={() => setAbout(!about)} className="font-medium text-adm-ink-2 underline decoration-adm-axis underline-offset-2 hover:text-adm-ink">
              {about ? 'Hide details' : 'Details'}
            </button>
          </p>
          {about && (
            <p className="max-w-[80ch] text-13 leading-[20px] text-adm-ink-2">
              A creator sells an 8-week paid journey to their followers; graduates move to Aurelia Plus. The redesign: 70/30 plus a share of the Plus each cohort drives, a journey produced once in the creator’s voice with personal inserts, a digital kit, and €39 tested against €19.99. Numbers from the{' '}
              <Link to="/wiki/b2b2c/economics" className="underline decoration-adm-line underline-offset-2 hover:text-adm-ink">
                B2B2C research
              </Link>
              . Pilot: 3–5 creators; the spec’s full wave is 50 creators × 200 seats.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-8 rounded-8 bg-adm-bg p-8 text-12 text-adm-muted" aria-label="Scenario" role="group">
          <select aria-label="Offer" title="Terms (offer)" className={`${inputClass} h-30 w-auto! text-12`} value={offerId} onChange={(e) => (setOfferId(e.target.value), setEdits({}))}>
            {OFFERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select aria-label="Outcome" title="How people behave (outcome)" className={`${inputClass} h-30 w-auto! text-12`} value={outcomeId} onChange={(e) => (setOutcomeId(e.target.value as Outcome['id']), setEdits({}))}>
            {OUTCOMES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-4">
            <input type="number" min={1} max={1000} aria-label="Paid seats per cohort" className={`${inputClass} h-30 w-72! text-12 tabular-nums`} value={seats} onChange={(e) => setSeats(clampNum(e.target.value, 1, 1000))} />
            seats
          </label>
          <label className="flex items-center gap-4">
            ×
            <input type="number" min={1} max={500} aria-label="Creators" className={`${inputClass} h-30 w-64! text-12 tabular-nums`} value={creators} onChange={(e) => setCreators(clampNum(e.target.value, 1, 500))} />
            creators
          </label>
          <InfoTip label="About this offer" align="right">
            {offer.note}
          </InfoTip>
          {edited && (
            <Button size="sm" icon={<RotateCcw size={13} />} onClick={() => setEdits({})}>
              Reset
            </Button>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <Money label="Aurelia, per cohort" value={eur(c.aureliaTotal)} hint={`ticket ${eur(c.aureliaTicket)} · Plus ${eur(c.aureliaPlus)}`} bad={c.aureliaTotal < 0} />
          <Money label="Creator, per cohort" value={eur(c.creatorTotal)} hint={`vs ${eur(c.creatorElsewhere)} on a course platform`} />
          <Money label="Plus per ticket buyer" value={pct(c.plusPerBuyer, 1)} hint={`${pct(outcome.gradToPlus)} of graduates`} bad={c.plusPerBuyer < 0.08} />
          <Money label={`Across ${creators} creator${creators === 1 ? '' : 's'}`} value={eur(c.aureliaTotal * creators)} hint={`${Math.round(c.plus * creators).toLocaleString('en-GB')} Plus subscribers`} bad={c.aureliaTotal < 0} />
        </dl>

        <ul className="flex flex-wrap items-center gap-6" aria-label="Pilot gates">
          <li className="mr-4 text-11 font-semibold uppercase tracking-wider text-adm-muted">Pilot gates</li>
          {gates.map((g) => (
            <li key={g.id} title={`Target: ${g.target}`} className={`inline-flex items-center gap-6 rounded-full border px-10 py-4 text-12 ${g.pass ? 'border-adm-good/40 bg-adm-good/8 text-adm-ink' : 'border-adm-critical/40 bg-adm-critical/6 text-adm-critical'}`}>
              {g.pass ? <Check size={13} className="text-adm-good" aria-label="Passes" /> : <X size={13} aria-label="Misses" />}
              <span>{cut(g.label)}</span>
              <b className="tabular-nums">{g.value}</b>
            </li>
          ))}
        </ul>
      </section>

      <Panel title="One cohort" description={`${seats} paid seats. Bars are a share of buyers.`}>
        <ol className="flex max-w-[860px] flex-col gap-12" aria-label="Retreat funnel">
          <Step label="Buys a ticket" stage="Entry" n={seats} of={seats} />
          <Step label="Keeps it" stage="Entry" n={c.kept} of={seats} />
          <Step label="Active at week 8" stage="Stay" n={c.graduates} of={seats} />
          <Step label="Chooses Plus" stage="Upsell" n={c.plus} of={seats} strong />
        </ol>
      </Panel>

      <Details title="One ticket under each offer" hint="price, split, AI and box">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-13">
            <caption className="sr-only">One ticket under each offer</caption>
            <thead className="text-11 text-adm-muted">
              <tr>
                <th className="py-6 pr-12 font-medium">One ticket (€)</th>
                {OFFERS.map((o) => (
                  <th key={o.id} className={`py-6 pr-12 font-medium ${o.id === offerId ? 'text-adm-ink' : ''}`}>
                    {o.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {(
                [
                  ['Price, VAT included', (o: Offer) => eur(o.price)],
                  ['Net after 20% VAT and card fees', (o: Offer) => eur(perTicket(o).net)],
                  ['Creator', (o: Offer) => `${eur(perTicket(o).creator)} (${pct(o.creatorShare)})`],
                  ['Aurelia, before AI', (o: Offer) => eur(perTicket(o).aurelia)],
                  ['AI per buyer', (o: Offer) => eur(-o.aiPerBuyer)],
                  ['Box per buyer', (o: Offer) => (o.boxPerBuyer ? eur(-o.boxPerBuyer) : 'digital kit')],
                  ['Aurelia, after AI and box', (o: Offer) => eur(perTicket(o).margin)],
                ] as const
              ).map(([label, f]) => (
                <tr key={label} className="border-t border-adm-line">
                  <th scope="row" className="py-6 pr-12 font-normal text-adm-ink-2">
                    {label}
                  </th>
                  {OFFERS.map((o) => {
                    const shown = o.id === offerId ? offer : o
                    const v = f(shown)
                    return (
                      <td key={o.id} className={`py-6 pr-12 ${o.id === offerId ? 'font-semibold text-adm-ink' : 'text-adm-ink-2'} ${v.startsWith('−') && label.startsWith('Aurelia, after') ? 'text-adm-critical' : ''}`}>
                        {v}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-12 text-adm-muted">
          The spec loses money per ticket once 24 personalised sessions and a box are paid for; the redesign produces the journey once per creator. AI: {offer.aiNote}.
        </p>
      </Details>

      <Details title="Change the assumptions" hint="applies to the chosen offer and outcome">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <NumField label="Ticket price (€)" value={offer.price} step={1} onChange={(v) => set('price', v)} />
          <NumField label="Creator share of ticket (%)" value={offer.creatorShare * 100} onChange={(v) => set('creatorShare', v / 100)} />
          <NumField label="Creator share of year-1 Plus (%)" value={offer.creatorPlusShare * 100} onChange={(v) => set('creatorPlusShare', v / 100)} />
          <NumField label="AI per buyer (€)" value={offer.aiPerBuyer} step={0.1} onChange={(v) => set('aiPerBuyer', v)} />
          <NumField label="Box per buyer (€)" value={offer.boxPerBuyer} step={1} onChange={(v) => set('boxPerBuyer', v)} />
          <NumField label="Active at week 8 (%)" value={outcome.activeWeek8 * 100} onChange={(v) => set('activeWeek8', v / 100)} />
          <NumField label="Graduates choosing Plus (%)" value={outcome.gradToPlus * 100} onChange={(v) => set('gradToPlus', v / 100)} />
          <NumField label="Refunds (%)" value={outcome.refundRate * 100} step={0.5} onChange={(v) => set('refundRate', v / 100)} />
        </div>
      </Details>

      <Details title="Where the numbers come from">
        <ul className="flex list-disc flex-col gap-4 pl-18 text-13 leading-[20px] text-adm-ink-2">
          <li>Ticket maths: 20% VAT, card fees 1.4% + €0.25, the split on the net, as on the wiki’s Unit economics page.</li>
          <li>Outcomes: low 20% / middle 35% / spec 76.5% active at week 8; mindfulness apps keep 4.7% at day 30 (Baumel et al., 2019). Graduates to Plus 15% / 30% / 30%; health and fitness trials convert 37.7% (RevenueCat 2026).</li>
          <li>Plus year 1: $100 ÷ 1.2 VAT × 0.85 after a 15% store fee = ${PLUS_NET_YEAR1}, at $1 = €1. Aurelia’s ticket line already subtracts AI and the box.</li>
          <li>Creator elsewhere: course platforms keep 0–10% when the creator brings the buyers (Maven 10%, Teachable 0–7.5%, Kajabi 0%).</li>
          <li>The redesign’s AI per buyer (€0.50) and the creator’s 20% Plus share are proposals to test, not research figures.</li>
          <li>
            Gates from{' '}
            <Link to="/wiki/b2b2c/plan" className="underline decoration-adm-line underline-offset-2 hover:text-adm-ink">
              the plan
            </Link>
            ; the seat gate reads the seats entered above. The spec’s 30% Plus is per graduate, not per buyer.
          </li>
        </ul>
      </Details>
    </div>
  )
}

function Step({ label, stage, n, of, strong }: { label: string; stage: string; n: number; of: number; strong?: boolean }) {
  const share = of ? n / of : 0
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-12 gap-y-4 text-13">
      <span className="text-adm-ink">
        {label} <span className="text-11 text-adm-muted">· {stage}</span>
      </span>
      <span className="tabular-nums text-adm-ink">
        <b>{n < 10 && n % 1 ? n.toFixed(1) : Math.round(n)}</b> <span className="text-adm-muted">({pct(share, strong || (share < 0.1 && share > 0) ? 1 : 0)})</span>
      </span>
      <span className="col-span-2 h-10 overflow-hidden rounded-full bg-adm-bg">
        <span className={`block h-full rounded-full ${strong ? 'bg-adm-s1' : 'bg-adm-s3'}`} style={{ width: `${Math.max(share * 100, share > 0 ? 1 : 0)}%` }} />
      </span>
    </li>
  )
}

function Money({ label, value, hint, bad }: { label: string; value: string; hint: string; bad?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-12">
      <dt className="text-11 font-medium text-adm-muted">{label}</dt>
      <dd className={`text-24 font-semibold leading-tight tabular-nums ${bad ? 'text-adm-critical' : 'text-adm-ink'}`}>{value}</dd>
      <dd className="text-12 text-adm-ink-2">{hint}</dd>
    </div>
  )
}

function NumField({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (v: number) => void }) {
  return (
    <FormField label={label}>
      <input type="number" min={0} step={step} aria-label={label} className={inputClass} value={Math.round(value * 100) / 100} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
    </FormField>
  )
}

function clampNum(v: string, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)))
}

function pick<T extends object, K extends keyof T>(o: Partial<T>, keys: K[]): Partial<Pick<T, K>> {
  const out: Partial<Pick<T, K>> = {}
  for (const k of keys) if (o[k] !== undefined) out[k] = o[k]
  return out
}
