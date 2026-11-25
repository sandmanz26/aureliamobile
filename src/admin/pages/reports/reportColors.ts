import type { InputKind } from '../../data/buyerAgentReport'
import type { SourceLabel } from '../../data/reportSources'
import type { Tone } from '../../components/ui'

/** Edge and dot colour per label; admin series tokens, so both themes work. Shared by the report graphs. */
export const LABEL_STROKE: Record<SourceLabel, string> = {
  measured: 'stroke-adm-good',
  prediction: 'stroke-adm-s1',
  sample: 'stroke-adm-s3',
  estimate: 'stroke-adm-s2',
  document: 'stroke-adm-s4',
  'company-price': 'stroke-adm-good',
  'third-party': 'stroke-adm-muted',
  scenario: 'stroke-adm-critical',
}
export const LABEL_FILL: Record<SourceLabel, string> = {
  measured: 'fill-adm-good',
  prediction: 'fill-adm-s1',
  sample: 'fill-adm-s3',
  estimate: 'fill-adm-s2',
  document: 'fill-adm-s4',
  'company-price': 'fill-adm-good',
  'third-party': 'fill-adm-muted',
  scenario: 'fill-adm-critical',
}

/** Dot colour per buyer-report input (U122). */
export const INPUT_DOT: Record<InputKind, string> = {
  personas: 'bg-adm-s1',
  product: 'bg-adm-s2',
  prd: 'bg-adm-s3',
  ownerDocs: 'bg-adm-s4',
  price: 'bg-adm-good',
}

/** Badge tone per label. */
export const LABEL_TONE: Record<SourceLabel, Tone> = { measured: 'good', prediction: 'info', sample: 'neutral', estimate: 'serious', document: 'warning', 'company-price': 'good', 'third-party': 'neutral', scenario: 'critical' }
