/**
 * Rewrites a `/play/...` URL to its `/player-beta/...` counterpart when the
 * flag is on. Used by every place in the app that links to the player, so
 * flipping `player.beta` in `/__demo` redirects existing links rather than
 * requiring two copies of each one.
 *
 * The flag itself lives in `/__demo` (`DEMO_MODULES`, module `player`,
 * feature `beta`) and is read the normal way, through `useFeatureFlags()` —
 * this file only holds the one bit of URL arithmetic every caller shares.
 */
export function playerHref(href: string, betaEnabled: boolean): string {
  return betaEnabled ? href.replace(/^\/play\//, '/player-beta/') : href
}
