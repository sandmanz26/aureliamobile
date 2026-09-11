import { useId } from 'react'

/**
 * The figure standing inside a network, above the closing CTA on Home.
 *
 * Drawn rather than shipped as a PNG: it is the widest element on the page at
 * every breakpoint, so a raster would either band on a phone or cost a large
 * file on desktop, and the palette has to follow the theme tokens rather than
 * bake one set of oranges into pixels.
 *
 * The mesh reads as "one person, many connections" — that is the whole claim
 * the CTA underneath is making, so the figure sits at the centre and every
 * link passes through or around it, never behind it in a way that breaks.
 */

/** Ringed nodes — the people. Hand-placed; an arc, not a random scatter. */
const NODES = [
  { x: 74, y: 116 },
  { x: 128, y: 52 },
  { x: 201, y: 36 },
  { x: 276, y: 56 },
  { x: 330, y: 110 },
  { x: 48, y: 176 },
  { x: 352, y: 172 },
]

/** Which people are connected. Indices into NODES. */
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 2], [1, 3], [2, 4],
  [5, 0], [4, 6], [5, 2], [6, 3], [5, 6],
]

/** Loose dots — the crowd the named nodes sit in. */
const DOTS = [
  { x: 30, y: 92, r: 2.5, o: 0.5 }, { x: 96, y: 62, r: 2, o: 0.35 },
  { x: 160, y: 74, r: 3, o: 0.55 }, { x: 232, y: 30, r: 2, o: 0.4 },
  { x: 300, y: 34, r: 2.5, o: 0.45 }, { x: 368, y: 74, r: 2, o: 0.35 },
  { x: 388, y: 128, r: 3, o: 0.5 }, { x: 20, y: 146, r: 2, o: 0.4 },
  { x: 86, y: 190, r: 2.5, o: 0.45 }, { x: 140, y: 206, r: 2, o: 0.3 },
  { x: 262, y: 200, r: 2.5, o: 0.4 }, { x: 312, y: 196, r: 2, o: 0.3 },
  { x: 56, y: 62, r: 2, o: 0.3 }, { x: 246, y: 92, r: 2, o: 0.3 },
  { x: 152, y: 34, r: 2, o: 0.35 }, { x: 348, y: 48, r: 2, o: 0.3 },
  { x: 108, y: 148, r: 2, o: 0.28 }, { x: 296, y: 142, r: 2, o: 0.28 },
  { x: 12, y: 112, r: 2, o: 0.3 }, { x: 392, y: 176, r: 2, o: 0.3 },
]

export function CommunityNetwork({ className = '' }: { className?: string }) {
  // Every instance needs its own gradient ids — duplicated ids resolve to the
  // first in the document, which silently blanks the rest.
  const uid = useId().replace(/:/g, '')
  const figure = `figure-${uid}`
  const halo = `halo-${uid}`
  const soft = `soft-${uid}`

  return (
    <svg
      viewBox="0 0 402 240"
      className={`w-full ${className}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={figure} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC7A6" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#FFD9C2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE8D8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={halo} cx="50%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#FFC0CE" stopOpacity="0.32" />
          <stop offset="45%" stopColor="#FFD2B0" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFE0CC" stopOpacity="0" />
        </radialGradient>
        <filter id={soft} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* The figure: head and shoulders, blurred so it reads as presence
          rather than as a portrait competing with the headline below. */}
      <g filter={`url(#${soft})`}>
        <path
          d="M201 128c-38 0-62 26-70 60-4 18-6 34-7 52h154c-1-18-3-34-7-52-8-34-32-60-70-60z"
          fill={`url(#${figure})`}
        />
        <ellipse cx="201" cy="112" rx="33" ry="40" fill={`url(#${figure})`} />
        <ellipse cx="201" cy="112" rx="74" ry="86" fill={`url(#${halo})`} />
      </g>

      {/* Links first, so a node always sits on top of the lines it joins. */}
      <g stroke="#FF881B" strokeOpacity="0.38" strokeWidth="1" strokeDasharray="3 4">
        {LINKS.map(([a, z]) => (
          <line key={`${a}-${z}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[z].x} y2={NODES[z].y} />
        ))}
      </g>

      <g fill="#FF881B">
        {DOTS.map((dot) => (
          <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.o} />
        ))}
      </g>

      {NODES.map((node) => (
        <g key={`${node.x}-${node.y}`}>
          <circle cx={node.x} cy={node.y} r="11" fill="#FFF6E6" />
          <circle cx={node.x} cy={node.y} r="11" fill="none" stroke="#FF881B" strokeWidth="1.5" opacity="0.55" />
          <circle cx={node.x} cy={node.y} r="5.5" fill="#FF881B" />
        </g>
      ))}
    </svg>
  )
}
