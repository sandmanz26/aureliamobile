import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import coinIcon from '../assets/coin-icon.png'
import { useUiVersion } from './useUiVersion'

/**
 * Version 2: a profile picture that behaves like a coin — it spins in on
 * arrival, and flips to a gold coin face and back when tapped or hovered.
 * In v1 it renders the picture alone, with no wrapper.
 */
export function CoinFlip({ size, children }: { size: number; children: ReactNode }) {
  const v2 = useUiVersion() >= 2
  const [spins, setSpins] = useState(0)
  // One flip at a time. Remounting the face under the pointer makes React
  // report a fresh mouseenter, which without this guard restarts it forever.
  const busy = useRef(false)
  if (!v2) return <>{children}</>
  const flip = () => {
    if (busy.current) return
    busy.current = true
    setSpins((n) => n + 1)
  }

  return (
    <button
      type="button"
      aria-label="Flip"
      onClick={flip}
      onMouseEnter={flip}
      className="v2-coin shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      <span
        key={spins}
        onAnimationEnd={() => (busy.current = false)}
        className={`v2-coin-inner ${spins ? 'v2-coin-flip' : 'v2-coin-arrive'}`}
      >
        <span className="v2-coin-face">{children}</span>
        <span className="v2-coin-face v2-coin-back">
          <img src={coinIcon} alt="" style={{ width: size * 0.62, height: size * 0.62 }} />
        </span>
      </span>
    </button>
  )
}
