// GENERATED from src/assets/aurelia-network.png by measuring it (U035) —
// positions in the artwork's own 362×155 pixel space, colours sampled.
// Regenerate rather than hand-edit if the artwork changes.

export type NodeKind = 'hub' | 'bokeh' | 'dot'
export interface NetNode { x: number; y: number; r: number; soft: number; color: string; kind: NodeKind }
/** An edge end: a node index, or a point (frame edge, head outline, a line that fades out). */
export type End = number | readonly [number, number]
export interface NetEdge { a: End; b: End; dashed: boolean; opacity: number; head?: boolean }

export const ART = { width: 362, height: 155 } as const

export const NODES: NetNode[] = [
  { x: 271.8, y: 87.7, r: 6.5, soft: 1.0, color: '#FDAF74', kind: 'hub' }, // 0
  { x: 256.4, y: 34.0, r: 6.5, soft: 1.0, color: '#FDAA6D', kind: 'hub' }, // 1
  { x: 51.2, y: 83.2, r: 6.5, soft: 1.0, color: '#FEB171', kind: 'hub' }, // 2
  { x: 102.8, y: 13.2, r: 6.5, soft: 1.0, color: '#FEB273', kind: 'hub' }, // 3
  { x: 187.3, y: 9.0, r: 6.5, soft: 1.0, color: '#FDAF6E', kind: 'hub' }, // 4
  { x: 56.3, y: 49.1, r: 5.0, soft: 1.75, color: '#FFCEA9', kind: 'bokeh' }, // 5
  { x: 120.0, y: 53.3, r: 4.25, soft: 2.5, color: '#FECEA8', kind: 'bokeh' }, // 6
  { x: 161.2, y: 28.4, r: 4.0, soft: 2.75, color: '#FECFAA', kind: 'bokeh' }, // 7
  { x: 259.4, y: 104.1, r: 3.75, soft: 1.75, color: '#FEC9A8', kind: 'bokeh' }, // 8
  { x: 263.4, y: 6.6, r: 3.25, soft: 1.75, color: '#FFCCAB', kind: 'dot' }, // 9
  { x: 293.9, y: 30.5, r: 3.25, soft: 2.25, color: '#FFC5A2', kind: 'dot' }, // 10
  { x: 290.4, y: 66.7, r: 3.25, soft: 2.25, color: '#FEC8A8', kind: 'dot' }, // 11
  { x: 59.5, y: 123.0, r: 2.5, soft: 1.5, color: '#FFD0AB', kind: 'dot' }, // 12
  { x: 40.5, y: 4.1, r: 2.25, soft: 1.75, color: '#FFCFAC', kind: 'dot' }, // 13
  { x: 249.4, y: 118.4, r: 2.5, soft: 1.75, color: '#FFC5AC', kind: 'dot' }, // 14
  { x: 90.7, y: 132.0, r: 2.25, soft: 1.5, color: '#FFE1C9', kind: 'dot' }, // 15
  { x: 29.4, y: 32.4, r: 2.25, soft: 1.5, color: '#FFE0C7', kind: 'dot' }, // 16
  { x: 342.4, y: 33.4, r: 2.25, soft: 1.75, color: '#FFDCC9', kind: 'dot' }, // 17
  { x: 107.4, y: 64.6, r: 2.25, soft: 1.5, color: '#FFE0C7', kind: 'dot' }, // 18
  { x: 11.4, y: 73.4, r: 2.0, soft: 1.75, color: '#FFCFA9', kind: 'dot' }, // 19
  { x: 307.4, y: 109.6, r: 2.25, soft: 1.5, color: '#FFC9AA', kind: 'dot' }, // 20
  { x: 32.4, y: 127.4, r: 2.25, soft: 1.75, color: '#FFD0AC', kind: 'dot' }, // 21
  { x: 328.0, y: 56.5, r: 2.25, soft: 1.5, color: '#FFDAC5', kind: 'dot' }, // 22
  { x: 309.5, y: 82.5, r: 2.25, soft: 1.75, color: '#FECAA8', kind: 'dot' }, // 23
  { x: 77.0, y: 100.5, r: 2.25, soft: 1.75, color: '#FFDEC5', kind: 'dot' }, // 24
  { x: 15.5, y: 107.5, r: 2.25, soft: 1.75, color: '#FFD3AC', kind: 'dot' }, // 25
  { x: 284.3, y: 122.1, r: 2.25, soft: 1.75, color: '#FFC9A9', kind: 'dot' }, // 26
  { x: 253.2, y: 58.8, r: 2.25, soft: 1.5, color: '#FFDCC8', kind: 'dot' }, // 27
  { x: 81.8, y: 74.8, r: 2.25, soft: 1.5, color: '#FFDFC6', kind: 'dot' }, // 28
  { x: 230.0, y: 71.2, r: 2.0, soft: 1.5, color: '#FFDCC8', kind: 'dot' }, // 29
  { x: 67.4, y: 0.7, r: 1.75, soft: 1.75, color: '#FFCEAD', kind: 'dot' }, // 30
]

export const EDGES: NetEdge[] = [
  { a: 0, b: 1, dashed: true, opacity: 0.47 },
  { a: 4, b: 0, dashed: true, opacity: 0.44 },
  { a: 0, b: [205, 87.5], dashed: true, opacity: 0.41, head: true },
  { a: 3, b: 1, dashed: true, opacity: 0.47 },
  { a: 1, b: [205.5, 55.8], dashed: true, opacity: 0.49, head: true },
  { a: 2, b: 3, dashed: true, opacity: 0.44 },
  { a: 2, b: 7, dashed: true, opacity: 0.5 },
  { a: 4, b: 2, dashed: true, opacity: 0.49 },
  { a: 2, b: [135.3, 75], dashed: true, opacity: 0.46, head: true },
  { a: 2, b: [140.2, 87.1], dashed: true, opacity: 0.42, head: true },
  { a: [157, 33.3], b: 1, dashed: true, opacity: 0.35, head: true },
  { a: 0, b: 26, dashed: false, opacity: 0.12 },
  { a: 0, b: 8, dashed: false, opacity: 0.15 },
  { a: 0, b: 11, dashed: false, opacity: 0.15 },
  { a: 1, b: 27, dashed: false, opacity: 0.1 },
  { a: 27, b: 29, dashed: false, opacity: 0.13 },
  { a: 1, b: 29, dashed: false, opacity: 0.1 },
  { a: 29, b: [205, 69], dashed: false, opacity: 0.15, head: true },
  { a: [57.5, 54], b: [124, 58.8], dashed: false, opacity: 0.36 },
  { a: [151.8, 0], b: 6, dashed: false, opacity: 0.21 },
  { a: [161, 0], b: 7, dashed: false, opacity: 0.21 },
  { a: 4, b: 7, dashed: false, opacity: 0.51 },
  { a: 2, b: 16, dashed: false, opacity: 0.08 },
  { a: 16, b: [0, 36.5], dashed: false, opacity: 0.07 },
  { a: 2, b: 25, dashed: false, opacity: 0.13 },
  { a: 2, b: 28, dashed: false, opacity: 0.1 },
  { a: 2, b: [35, 102], dashed: false, opacity: 0.07 },
  { a: 28, b: 18, dashed: false, opacity: 0.12 },
  { a: 28, b: 24, dashed: false, opacity: 0.39 },
  { a: 18, b: 24, dashed: false, opacity: 0.24 },
  { a: 24, b: 15, dashed: false, opacity: 0.13 },
  { a: 3, b: 30, dashed: false, opacity: 0.16 },
  { a: 30, b: 13, dashed: false, opacity: 0.17 },
  { a: 13, b: [36, 0], dashed: false, opacity: 0.26 },
  { a: 19, b: 25, dashed: false, opacity: 0.11 },
  { a: 25, b: 12, dashed: false, opacity: 0.17 },
  { a: 25, b: 21, dashed: false, opacity: 0.14 },
  { a: 21, b: 12, dashed: false, opacity: 0.16 },
  { a: 9, b: 10, dashed: false, opacity: 0.19 },
  { a: 9, b: 11, dashed: false, opacity: 0.17 },
  { a: 10, b: 11, dashed: false, opacity: 0.1 },
  { a: 10, b: [321.5, 0], dashed: false, opacity: 0.18 },
  { a: 17, b: 22, dashed: false, opacity: 0.1 },
  { a: 17, b: [362, 33.2], dashed: false, opacity: 0.15 },
  { a: 22, b: [362, 37.5], dashed: false, opacity: 0.09 },
  { a: [296, 3], b: 17, dashed: false, opacity: 0.14 },
  { a: 14, b: 26, dashed: false, opacity: 0.13 },
  { a: 26, b: 23, dashed: false, opacity: 0.13 },
  { a: 26, b: 20, dashed: false, opacity: 0.13 },
  { a: 20, b: 23, dashed: false, opacity: 0.12 },
]
