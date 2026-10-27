import { BUILD } from '../lib/build'
import { readString, writeString } from '../lib/storage'

/**
 * Design versions you can switch between on staging.
 *
 * Each version is a set of opt-in changes layered on the same code, keyed by
 * `data-ui-version` on <html>. Version 1 is the app exactly as it ships — no
 * attribute-scoped rule applies to it — so switching back is always a true
 * "before". Production never reads the stored choice: it is pinned to
 * PRODUCTION_VERSION (2 since U020, 4 since U052 — both on request).
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
          'The “+” sheet gets a filter: All, Visual, Sound, Movement, Selected — with counts, a sliding highlight, and a live “N of M selected · ↑ up to X% expected” line.',
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
  {
    id: 4,
    name: 'Version 4',
    summary: 'Everything in v3, plus onboarding, a first session built from your own words with a reason to come back, and a simpler app: four tabs for the four core features.',
    changes: [
      {
        group: 'Onboarding',
        items: [
          'After your first sign-in or sign-up on a device: Welcome (how Aurelia works, in three steps) → your goal → how you feel today (optional) → how sessions should sound (pre-filled) → a summary you can edit.',
          'The goal becomes your first session’s objective; everything else becomes your first message to Aurelia, shown word for word before you send it.',
          'Every step has Skip, and Skip keeps what you answered. If you signed in to do something specific, the last step offers “Continue where I was”.',
          'Settings → Replay onboarding runs it again from the start.',
        ],
      },
      {
        group: 'First session and coming back',
        items: [
          'What you typed on Home fills in onboarding and becomes your first message; one button builds your first session, with changes for your goal.',
          'After listening: “How do you feel now?”, then “Chapter 2 is ready tomorrow” with a calendar reminder. Home leads with your next chapter.',
        ],
      },
      {
        group: 'Simpler',
        items: [
          'Four tabs at the bottom — Create, Discover, Progress, Me — instead of the menu.',
          'Create: ask, your next chapter, recent conversations, one community shelf. Discover: community, creators, live, challenge.',
          'Progress: your goals and data sources. Me: Library (created / played), Credits & plan, notifications, invite, settings, help.',
          'The coin balance only in Me (and where coins are earned). Insights is folded into Session details and Analysis.',
          'One list of changes in the chat: the proposals open the “+” sheet, already picked, one score each.',
        ],
      },
      {
        group: 'Good to know',
        items: [
          'Includes everything in Version 3.',
          'Answers are kept on this device only — there are no accounts yet, so a new browser asks again.',
          'To see it again on staging: Settings → Replay onboarding, or clear site data.',
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Version 5',
    summary: 'Everything in v4, reworked after the first three user interviews: progress in words instead of scores, the reason behind every suggestion, an optional journal, your wearable asked for up front, and a community about stories rather than rankings.',
    changes: [
      {
        group: 'Progress without the scoreboard',
        items: [
          'Progress shows how you have been feeling, in words, from your own check-ins — no percentages, no sample analytics.',
          'A short report every two weeks; the detail (each check-in and what drove it) is one tap away for those who want it.',
          'The player no longer shows analytics at all.',
        ],
      },
      {
        group: 'Tell me why, ask me less',
        items: [
          'Every suggested change has a Why: what it does and what it is based on (your goal, your words, your last check-in).',
          'After a check-in Aurelia says what it will change in the next chapter, so there is nothing to tune unless you want to.',
        ],
      },
      {
        group: 'Your data, asked for properly',
        items: [
          'Onboarding asks which wearable you use (Apple Watch, Whoop, Oura) and says exactly what it would read. Data sources start with only that one on.',
          'A journal: an optional line under each check-in, and notes from Progress on days without a session. Only you see it.',
        ],
      },
      {
        group: 'Community',
        items: [
          'Session cards describe what the session is like instead of percentage claims; tags lose the #.',
          'The challenge is a shared journey: who joined and what they made, no podium or ranking.',
          'Publishing says plainly what others can see and what stays private.',
          'Home for visitors says what Aurelia is in plain words, without the map that read as co-working locations.',
        ],
      },
      {
        group: 'Good to know',
        items: ['Includes everything in Version 4.', 'Production stays on v4 until v5 is approved.'],
      },
    ],
  },
]

const KEY = 'aurelia.ui.version'

/**
 * The one design version production shows. No picker there.
 * v2 since U020; v4 since U052 (on request, 2026-10-27).
 */
export const PRODUCTION_VERSION = 4

export const VERSIONS_ENABLED = BUILD.environment !== 'production'

export function readVersion(): number {
  if (!VERSIONS_ENABLED) return PRODUCTION_VERSION
  const n = Number(readString(KEY))
  return UI_VERSIONS.some((v) => v.id === n) ? n : 1
}

export function applyVersion(id: number) {
  const root = document.documentElement
  if (id === 1) root.removeAttribute('data-ui-version')
  else root.setAttribute('data-ui-version', String(id))
}

export function storeVersion(id: number) {
  // Private mode: the switch still applies for this tab.
  writeString(KEY, String(id))
  applyVersion(id)
  window.dispatchEvent(new Event('aurelia:ui-version'))
}
