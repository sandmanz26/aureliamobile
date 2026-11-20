/** A share (0–1) as a cell shade (U107): one hue, light to dark; `dark` says to write on it in white. */
export function shade(v: number) {
  const p = Math.round(12 + Math.max(0, Math.min(1, v)) * 80)
  return { background: `color-mix(in oklab, var(--color-adm-s1) ${p}%, var(--color-adm-surface))`, dark: p >= 56 }
}
