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
  /** Grouped so the dialog reads as a summary, not a wall of bullets. */
  changes: { group: string; items: string[] }[]
}

export const UI_VERSIONS: UiVersion[] = [
  {
    id: 1,
    name: 'Version 1',
    summary: 'The current app, as it ships.',
    changes: [{ group: 'Baseline', items: ['The screens and motion currently on staging, unchanged.'] }],
  },
  {
    id: 2,
    name: 'Version 2',
    summary: 'More motion and smoother interactions across the app, plus a proper tablet layout.',
    changes: [
      {
        group: 'Motion',
        items: [
          'Page changes slide in: forward from the right, back from the left.',
          'Sections, cards and list rows fade up as you scroll to them.',
          'Card photos settle in with a slow zoom (and zoom slightly on desktop hover).',
          'Buttons have a springier press and a small lift on hover.',
          'New chat: a soft warm background drifts slowly behind a breathing orb, and the greeting rises in.',
          'Home: the Ask field types out example prompts while it waits, and the live dots on the Live Sessions map pulse.',
          'Home promo banner: the warm glows behind it roam and brighten much more visibly.',
          'Profile picture spins in like a coin, and flips to a gold coin face when tapped or hovered.',
          'Coin balances count up to their value, including the Total Credits figure.',
        ],
      },
      {
        group: 'Interactions',
        items: [
          'Bottom sheets: grab handle, follow your finger, close when dragged down or flicked, spring back otherwise.',
          'Pull down at the top of a page to refresh it.',
          'Voice input: the black button now shows Pause / Play, because that is what it does.',
        ],
      },
      {
        group: 'Player',
        items: [
          'A playing session follows you: its mini player floats over every screen (except chat, which already shows it), with bottom buttons moved above it.',
        ],
      },
      {
        group: 'Tablet (640–1023px)',
        items: [
          'Home shows Live Sessions and Quick Start side by side; Sessions is two columns.',
          'Promo cards and the Explore hero are sized for the width; sign-in is a centred card.',
        ],
      },
      {
        group: 'Unchanged',
        items: ['Phone and desktop layouts stay as they are. Anyone with "reduce motion" on sees none of the animation.'],
      },
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
