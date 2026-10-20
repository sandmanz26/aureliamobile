import { BUILD } from '../lib/build'

/**
 * Design versions you can switch between on staging.
 *
 * Each version is a set of opt-in changes layered on the same code, keyed by
 * `data-ui-version` on <html>. Version 1 is the app exactly as it ships — no
 * attribute-scoped rule applies to it — so switching back is always a true
 * "before". Production never reads the stored choice: it is pinned to
 * PRODUCTION_VERSION (2 since U020, on request — production no longer uses v1).
 *
 * To add a version: append an entry here, then scope its rules under
 * `:root[data-ui-version='N']` (see `src/styles/versions.css`). Versions are
 * cumulative: code checks `useUiVersion() >= N`, and v2's CSS applies to every
 * version above 1.
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
    summary: 'A livelier Aurelia: motion on every screen, smoother sheets, a player that follows you, a reordered Home, sharing and filtering — plus a tablet layout.',
    changes: [
      {
        group: 'Everywhere',
        items: [
          'Page changes slide in: forward from the right, back from the left, with a soft blur.',
          'Sections, cards and list rows fade up as you scroll to them; card photos settle in with a slow zoom.',
          'Buttons have a springier press, and a small lift on hover (desktop).',
          'Bottom sheets have a grab handle, follow your finger, and close when dragged down or flicked.',
          'Pull down at the top of a page to refresh it.',
          'A playing session follows you: its mini player floats over every screen except chat, with bottom buttons moved above it.',
          'Coin balances count up to their value.',
        ],
      },
      {
        group: 'Home',
        items: [
          'New order: Quick Start right under the Ask field; Ongoing Live Sessions moves down, above Recreate from Community.',
          'The Ask field types out example prompts while it waits.',
          'Live dots on the Live Sessions map pulse.',
          'Promo banner: the warm glows roam and brighten, and a soft light follows your cursor or finger.',
        ],
      },
      {
        group: 'Chat',
        items: [
          'New chat: a soft warm background drifts behind a breathing orb, and the greeting rises in.',
          'Opened recommendations get a filter: All, Visual, Sound, Movement, Selected — with counts, a sliding highlight, and a live “N of M selected · ↑ X% combined” line.',
          'Voice input: the black button shows Pause / Play, because that is what it does.',
        ],
      },
      {
        group: 'Player',
        items: [
          'The details sheet works like Google Maps: it peeks with the title, stops halfway with the player still visible above it, and opens fully — drag it from anywhere, flick it, or tap it to open.',
          'Share opens a share sheet: WhatsApp, X, Facebook, Telegram, LinkedIn, Email, Copy link, and More for the phone’s own sheet.',
        ],
      },
      {
        group: 'Profile, Credits, Sign-in',
        items: [
          'Profile picture spins in like a coin and flips to a gold coin face when tapped or hovered.',
          'Total Credits counts up on the Credits screen.',
          'Sign-in: “Welcome to Aurelia.” is centred.',
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
        group: 'Good to know',
        items: [
          'Switching back to v1 restores the app exactly as before.',
          'Review pins are kept per version, so v2 notes never show on v1.',
          'Anyone with “reduce motion” turned on sees none of the animation.',
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Version 3',
    summary: 'Everything in v2, plus a clearer way to change a session: a summary of what you will get before you apply, and every build kept in the chat.',
    changes: [
      {
        group: 'Chat',
        items: [
          'The “+” sheet becomes a list you can scan, with a summary at the bottom: which changes are picked, what they are expected to do, and the version it will build.',
          'Each Apply keeps its own result in the conversation — apply three times and you see three versions (v1.2, v1.3, v1.4), the newest playing, the older ones still there to go back to, like replies in an AI chat.',
        ],
      },
      {
        group: 'Good to know',
        items: ['Includes everything in Version 2.', 'Switching to v2 or v1 restores those exactly.'],
      },
    ],
  },
]

const KEY = 'aurelia.ui.version'

/** The one design version production shows. No picker there. */
export const PRODUCTION_VERSION = 2

export const VERSIONS_ENABLED = BUILD.environment !== 'production'

export function readVersion(): number {
  if (!VERSIONS_ENABLED) return PRODUCTION_VERSION
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
