import { BUILD } from '../lib/build'

/**
 * Design versions you can switch between on staging.
 *
 * Each version is a set of opt-in changes layered on the same code, keyed by
 * `data-ui-version` on <html>. Version 1 is the app exactly as it ships — no
 * attribute-scoped rule applies to it — so switching back is always a true
 * "before". Production never reads the stored choice: it is pinned to 1.
 *
 * To add a version: append an entry here, then scope its rules under
 * `:root[data-ui-version='N']` (see `src/styles/versions.css`).
 */
export interface UiVersion {
  id: number
  name: string
  summary: string
  changes: string[]
}

export const UI_VERSIONS: UiVersion[] = [
  {
    id: 1,
    name: 'Version 1',
    summary: 'The current app, as it ships.',
    changes: ['Baseline: the screens and motion currently on staging.'],
  },
  {
    id: 2,
    name: 'Version 2',
    summary: 'More transition animation on every page.',
    changes: [
      'Page change: screens arrive with a soft blur-and-rise instead of a plain rise.',
      'Sections, cards and list rows reveal as they scroll into view, on every page.',
      'Card photos ease in with a slow zoom; on desktop they zoom slightly on hover.',
      'Buttons and links get a springier press, and a gentle lift on hover (desktop).',
      'Drawer, sheets and dialogs open with a springier, slightly longer motion.',
      'All of it is switched off for anyone with "reduce motion" set.',
    ],
  },
]

const KEY = 'aurelia.ui.version'

export const VERSIONS_ENABLED = BUILD.environment !== 'production'

export function readVersion(): number {
  if (!VERSIONS_ENABLED) return 1
  try {
    const n = Number(localStorage.getItem(KEY))
    return UI_VERSIONS.some((v) => v.id === n) ? n : 1
  } catch {
    return 1
  }
}

export function applyVersion(id: number) {
  const root = document.documentElement
  if (id === 1) root.removeAttribute('data-ui-version')
  else root.setAttribute('data-ui-version', String(id))
}

export function storeVersion(id: number) {
  try {
    localStorage.setItem(KEY, String(id))
  } catch {
    /* private mode: the switch still applies for this tab */
  }
  applyVersion(id)
  window.dispatchEvent(new Event('aurelia:ui-version'))
}
