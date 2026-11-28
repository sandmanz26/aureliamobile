import type { AkpFamily } from '../../data/akps'

/*
 * How each AKP family looks (U149): its own hue from the admin series tokens
 * (s1–s6 plus ink-2, so script and image are no longer both green, nor music
 * and video both amber) and its own shape, so the families stay apart for
 * colour-blind readers and in greyscale. Used by the list, the legend, the
 * graph and the explainer alike.
 */

export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'pentagon' | 'triangle-down' | 'star'

export interface Look {
  bg: string
  fill: string
  shape: Shape
}

export const FAMILY_LOOK: Record<AkpFamily, Look> = {
  goal: { bg: 'bg-adm-s1', fill: 'fill-adm-s1', shape: 'circle' },
  identity: { bg: 'bg-adm-s5', fill: 'fill-adm-s5', shape: 'hexagon' },
  script: { bg: 'bg-adm-s3', fill: 'fill-adm-s3', shape: 'square' },
  music: { bg: 'bg-adm-s4', fill: 'fill-adm-s4', shape: 'triangle' },
  image: { bg: 'bg-adm-s6', fill: 'fill-adm-s6', shape: 'diamond' },
  video: { bg: 'bg-adm-s2', fill: 'fill-adm-s2', shape: 'triangle-down' },
  product: { bg: 'bg-adm-ink-2', fill: 'fill-adm-ink-2', shape: 'pentagon' },
}

/** Sleep chapter 1's modalities, matched to the family looks (voice has no family yet). */
export const MODALITY_LOOK: Record<string, Look> = {
  Script: FAMILY_LOOK.script,
  Music: FAMILY_LOOK.music,
  Image: FAMILY_LOOK.image,
  Video: FAMILY_LOOK.video,
  Voice: { bg: 'bg-adm-s5', fill: 'fill-adm-s5', shape: 'star' },
}

export const GOAL_LOOK: Look = { bg: 'bg-adm-ink', fill: 'fill-adm-ink', shape: 'circle' }

const ring = (cx: number, cy: number, r: number, n: number, rot: number, inner?: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = rot + (i / n) * Math.PI * 2
    const rr = inner !== undefined && i % 2 ? inner : r
    return `${(cx + Math.cos(t) * rr).toFixed(2)},${(cy + Math.sin(t) * rr).toFixed(2)}`
  }).join('L')

/** An SVG path for a shape of radius r centred on (cx, cy), area roughly equal across shapes. */
export function shapePath(shape: Shape, cx: number, cy: number, r: number): string {
  const up = -Math.PI / 2
  switch (shape) {
    case 'circle':
      return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0z`
    case 'square': {
      const s = r * 0.88
      return `M${cx - s},${cy - s}h${2 * s}v${2 * s}h${-2 * s}z`
    }
    case 'triangle':
      return `M${ring(cx, cy + r * 0.15, r * 1.25, 3, up)}z`
    case 'triangle-down':
      return `M${ring(cx, cy - r * 0.15, r * 1.25, 3, -up)}z`
    case 'diamond':
      return `M${ring(cx, cy, r * 1.2, 4, up)}z`
    case 'hexagon':
      return `M${ring(cx, cy, r * 1.05, 6, 0)}z`
    case 'pentagon':
      return `M${ring(cx, cy, r * 1.1, 5, up)}z`
    case 'star':
      return `M${ring(cx, cy, r * 1.3, 10, up, r * 0.55)}z`
  }
}
