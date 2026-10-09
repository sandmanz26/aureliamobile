import { useEffect, useState } from 'react'
import { readVersion } from './versions'

/** The design version in effect, for behaviour CSS alone cannot gate. */
export function useUiVersion() {
  const [v, setV] = useState(readVersion)
  useEffect(() => {
    const sync = () => setV(readVersion())
    window.addEventListener('aurelia:ui-version', sync)
    return () => window.removeEventListener('aurelia:ui-version', sync)
  }, [])
  return v
}
