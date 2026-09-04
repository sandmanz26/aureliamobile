import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { FlagState } from './modules'
import { STORAGE_KEY, defaultFlags } from './modules'

interface FeatureFlagsValue {
  flags: FlagState
  /** Module or "module.feature" — a feature is off whenever its module is off. */
  isEnabled: (id: string) => boolean
  setFlag: (id: string, value: boolean) => void
  setAll: (value: boolean) => void
  reset: () => void
}

const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(null)

function readStored(): FlagState {
  const base = defaultFlags()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    return { ...base, ...(JSON.parse(raw) as FlagState) }
  } catch {
    // Private mode / blocked storage — fall back to the defaults.
    return base
  }
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FlagState>(readStored)

  const persist = useCallback((next: FlagState) => {
    setFlags(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Non-fatal: the toggle still applies for this tab's lifetime.
    }
  }, [])

  // Lets the presenter drive the demo from the control panel in one tab
  // while the client watches the app in another.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setFlags(readStored())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<FeatureFlagsValue>(
    () => ({
      flags,
      isEnabled: (id: string) => {
        const [moduleId] = id.split('.')
        if (flags[moduleId] === false) return false
        return flags[id] !== false
      },
      setFlag: (id, next) => persist({ ...flags, [id]: next }),
      setAll: (next) => {
        const all: FlagState = {}
        for (const key of Object.keys(defaultFlags())) all[key] = next
        persist(all)
      },
      reset: () => persist(defaultFlags()),
    }),
    [flags, persist],
  )

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) throw new Error('useFeatureFlags must be used inside FeatureFlagsProvider')
  return context
}
