import type { SourceLabel } from '../../data/reportSources'

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
