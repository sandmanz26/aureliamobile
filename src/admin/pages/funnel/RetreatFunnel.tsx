import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, FormField, Panel, inputClass } from '../../components/ui'
import { OFFERS, OUTCOMES, PLUS_NET_YEAR1, cohort, eur, pct, perTicket, pilotGates, type Offer, type Outcome } from '../../data/retreatFunnel'

/**
 * The creator retreat (B2B2C) view of the Business funnel (U113, J159):
 * Eugene's Retreat-in-a-Box, as written and as redesigned (approved
 * 24 Nov 2026), on the wiki's unit-economics inputs. Pick the terms (offer)
 * and how people behave (outcome); every assumption can be changed here and
 * reset. Estimates until the pilot measures them.
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

  return (
    <div className="flex flex-col gap-16">
      <section aria-label="About this view" className="rounded-12 border border-adm-line bg-adm-surface p-14 text-12 leading-[18px] text-adm-ink-2">
        <p>
          <b className="text-adm-ink">Retreat-in-a-Box as a funnel.</b> A creator sells an 8-week paid journey to their followers; graduates move to Aurelia Plus. The{' '}
          <b className="text-adm-ink">redesign was approved on 24 Nov 2026</b>: 70/30 plus a share of the Plus each cohort drives, a journey produced once in the creator’s voice with personal inserts, a digital kit, and €39 tested against €19.99. Every number is an estimate from the{' '}
          <Link to="/wiki/b2b2c/economics" className="underline decoration-adm-line underline-offset-2 hover:text-adm-ink">
            B2B2C research
          </Link>{' '}
          until a pilot measures it.
        </p>
      </section>

      <div className="flex flex-wrap items-end gap-12">
        <FormField label="Terms (offer)">
          <select aria-label="Offer" className={`${inputClass} w-auto!`} value={offerId} onChange={(e) => (setOfferId(e.target.value), setEdits({}))}>
            {OFFERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="How people behave (outcome)">
          <select aria-label="Outcome" className={`${inputClass} w-auto!`} value={outcomeId} onChange={(e) => (setOutcomeId(e.target.value as Outcome['id']), setEdits({}))}>
            {OUTCOMES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Paid seats per cohort">
          <input type="number" min={1} max={1000} aria-label="Paid seats per cohort" className={`${inputClass} w-96!`} value={seats} onChange={(e) => setSeats(clampNum(e.target.value, 1, 1000))} />
        </FormField>
        <FormField label="Creators (one cohort each)">
          <input type="number" min={1} max={500} aria-label="Creators" className={`${inputClass} w-96!`} value={creators} onChange={(e) => setCreators(clampNum(e.target.value, 1, 500))} />
        </FormField>
        {edited && (
          <Button size="sm" icon={<RotateCcw size={13} />} onClick={() => setEdits({})}>
            Reset assumptions
          </Button>
        )}
      </div>
      <p className="-mt-8 text-11 text-adm-muted">{offer.note} Pilot: 3–5 creators. The spec’s full wave: 50 creators × 200 seats.</p>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="One cohort, step by step" description={`${seats} paid seats under “${baseOffer.name}”, outcome “${baseOutcome.name}”${edited ? ', with your edits' : ''}. Each bar is a share of buyers.`}>
          <ol className="flex flex-col gap-10" aria-label="Retreat funnel">
            <Step label="Buys a ticket" stage="Entry" n={seats} of={seats} />
            <Step label="Keeps it (not refunded)" stage="Entry" n={c.kept} of={seats} />
            <Step label="Still active at week 8" stage="Staying" n={c.graduates} of={seats} />
            <Step label="Chooses Plus at graduation" stage="Upsell" n={c.plus} of={seats} strong />
          </ol>
          <p className="mt-12 text-11 leading-[16px] text-adm-muted">
            Plus per ticket buyer is the number that decides the plan: {pct(c.plusPerBuyer, 1)} here ({pct(outcome.gradToPlus)} of graduates). The spec’s 30% is per graduate.
          </p>
        </Panel>

        <Panel title="Pilot gates" description="The five numbers set in advance in the plan. Each miss points to a different fix." actions={<Badge tone={passed === 5 ? 'good' : passed >= 3 ? 'warning' : 'critical'}>{passed} of 5 pass</Badge>}>
          <ul className="flex flex-col gap-8">
            {gates.map((g) => (
              <li key={g.id} className="grid grid-cols-[18px_1fr_auto] items-start gap-8 text-12">
                {g.pass ? <Check size={15} className="mt-1 text-adm-good" aria-label="Passes" /> : <X size={15} className="mt-1 text-adm-critical" aria-label="Misses" />}
                <span className="text-adm-ink">
                  {g.label}
                  <span className="block text-11 text-adm-muted">{g.target}</span>
                </span>
                <span className={`tabular-nums font-semibold ${g.pass ? 'text-adm-ink' : 'text-adm-critical'}`}>{g.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-11 text-adm-muted">
            From{' '}
            <Link to="/wiki/b2b2c/plan" className="underline decoration-adm-line underline-offset-2 hover:text-adm-ink">
              the plan
            </Link>
            . The seat gate reads the seats you entered.
          </p>
        </Panel>
      </div>

      <Panel title="Money" description="Per cohort, then across all creators. Year-1 Plus counts an annual subscriber at about $70.83 net ($1 = €1). Aurelia’s ticket line already subtracts AI and the box for every buyer.">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <Money label="Aurelia, per cohort" value={eur(c.aureliaTotal)} hint={`ticket ${eur(c.aureliaTicket)} · Plus ${eur(c.aureliaPlus)}`} bad={c.aureliaTotal < 0} />
          <Money label="Creator, per cohort" value={eur(c.creatorTotal)} hint={`ticket ${eur(c.creatorTicket)} · Plus share ${eur(c.creatorPlus)}`} />
          <Money label="Creator on a course platform" value={eur(c.creatorElsewhere)} hint="same seats, keeping about 90%: what Aurelia must beat" />
          <Money label={`Across ${creators} creator${creators === 1 ? '' : 's'}`} value={eur(c.aureliaTotal * creators)} hint={`${Math.round(c.plus * creators).toLocaleString('en-GB')} Plus subscribers for Aurelia`} bad={c.aureliaTotal < 0} />
        </div>
        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-12">
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
        <p className="mt-10 text-11 text-adm-muted">
          The spec loses money on every ticket once 24 personalised sessions and a physical box are paid for. The redesign keeps a margin because the journey is produced once per creator. AI: {offer.aiNote}.
        </p>
      </Panel>

      <details className="rounded-12 border border-adm-line bg-adm-surface p-14 text-12">
        <summary className="cursor-pointer font-semibold text-adm-ink">Change the assumptions</summary>
        <p className="mt-6 text-11 text-adm-muted">Edits apply to the chosen offer and outcome until you reset or pick another.</p>
        <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <NumField label="Ticket price (€)" value={offer.price} step={1} onChange={(v) => set('price', v)} />
          <NumField label="Creator share of ticket (%)" value={offer.creatorShare * 100} onChange={(v) => set('creatorShare', v / 100)} />
          <NumField label="Creator share of year-1 Plus (%)" value={offer.creatorPlusShare * 100} onChange={(v) => set('creatorPlusShare', v / 100)} />
          <NumField label="AI per buyer (€)" value={offer.aiPerBuyer} step={0.1} onChange={(v) => set('aiPerBuyer', v)} />
          <NumField label="Box per buyer (€)" value={offer.boxPerBuyer} step={1} onChange={(v) => set('boxPerBuyer', v)} />
          <NumField label="Active at week 8 (%)" value={outcome.activeWeek8 * 100} onChange={(v) => set('activeWeek8', v / 100)} />
          <NumField label="Graduates choosing Plus (%)" value={outcome.gradToPlus * 100} onChange={(v) => set('gradToPlus', v / 100)} />
          <NumField label="Refunds (%)" value={outcome.refundRate * 100} step={0.5} onChange={(v) => set('refundRate', v / 100)} />
        </div>
      </details>

      <details className="rounded-12 border border-adm-line bg-adm-surface p-14 text-12 leading-[18px] text-adm-ink-2">
        <summary className="cursor-pointer font-semibold text-adm-ink">Where the numbers come from</summary>
        <ul className="mt-8 flex list-disc flex-col gap-4 pl-18">
          <li>Ticket maths: 20% VAT, card fees 1.4% + €0.25, the split on the net, as on the wiki’s Unit economics page.</li>
          <li>Outcomes: low 20% / middle 35% / spec 76.5% active at week 8; mindfulness apps keep 4.7% at day 30 (Baumel et al., 2019). Graduates to Plus 15% / 30% / 30%; health and fitness trials convert 37.7% (RevenueCat 2026).</li>
          <li>Plus year 1: $100 ÷ 1.2 VAT × 0.85 after a 15% store fee = ${PLUS_NET_YEAR1}.</li>
          <li>Creator elsewhere: course platforms keep 0–10% when the creator brings the buyers (Maven 10%, Teachable 0–7.5%, Kajabi 0%).</li>
          <li>The redesign’s AI per buyer (€0.50) and the creator’s 20% Plus share are proposals to test, not research figures.</li>
        </ul>
      </details>
    </div>
  )
}

function Step({ label, stage, n, of, strong }: { label: string; stage: string; n: number; of: number; strong?: boolean }) {
  const share = of ? n / of : 0
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-12 gap-y-4 text-12">
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
    <div className="flex flex-col gap-4 rounded-8 border border-adm-line p-12">
      <span className="text-11 text-adm-muted">{label}</span>
      <span className={`text-[22px] font-semibold leading-[28px] tabular-nums ${bad ? 'text-adm-critical' : 'text-adm-ink'}`}>{value}</span>
      <span className="text-11 leading-[15px] text-adm-muted">{hint}</span>
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
