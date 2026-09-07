import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { FlagState } from './modules'
import { STORAGE_KEY, defaultFlags } from './modules'

/**
 * Two layers of state, deliberately separate:
 *
 *  - **published** — what /api/config holds. Every visitor gets this, on every
 *    device. The presenter changes it by pressing Publish.
 *  - **draft** — the presenter's local edits, kept in localStorage. Lets them
 *    stage a scope without the audience seeing each toggle land mid-demo.
 *
 * When the server has no config (or isn't set up), the draft is all there is —
 * which is exactly how this behaved before the endpoint existed.
 */
type SyncState = 'loading' | 'synced' | 'local-only' | 'error'

interface FeatureFlagsValue {
  flags: FlagState
  isEnabled: (id: string) => boolean
  setFlag: (id: string, value: boolean) => void
  setAll: (value: boolean) => void
  reset: () => void
  /** Pushes the current draft to the server for everyone. */
  publish: () => Promise<void>
  /** Discards local edits and returns to what is published. */
  revertToPublished: () => void
  sync: SyncState
  dirty: boolean
  publishing: boolean
  lastPublishedAt: string | null
}

const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(null)

const POLL_MS = 15_000

function readDraft(): FlagState {
  const base = defaultFlags()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...base, ...(JSON.parse(raw) as FlagState) } : base
  } catch {
    return base
  }
}

function writeDraft(flags: FlagState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {
    // Private mode — the flags still apply for this tab's lifetime.
  }
}

function sameFlags(a: FlagState, b: FlagState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) if (a[key] !== b[key]) return false
  return true
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FlagState>(readDraft)
  const [published, setPublished] = useState<FlagState | null>(null)
  const [sync, setSync] = useState<SyncState>('loading')
  const [publishing, setPublishing] = useState(false)
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null)
  // A viewer follows the server; the presenter (who has edited) does not get
  // their draft yanked out from under them by a poll.
  const dirtyRef = useRef(false)

  const applyPublished = useCallback((incoming: FlagState) => {
    setPublished(incoming)
    if (!dirtyRef.current) {
      setFlags({ ...defaultFlags(), ...incoming })
    }
  }, [])

  const fetchPublished = useCallback(async () => {
    try {
      const response = await fetch('/api/config', { cache: 'no-store' })
      if (!response.ok) throw new Error(String(response.status))
      const data = (await response.json()) as { configured: boolean; flags: FlagState | null }
      if (!data.configured) {
        setSync('local-only')
        return
      }
      setSync('synced')
      if (data.flags) applyPublished(data.flags)
      else setPublished({})
    } catch {
      // No endpoint (e.g. `vite dev` without `vercel dev`) or offline — the
      // local draft carries the demo.
      setSync('local-only')
    }
  }, [applyPublished])

  useEffect(() => {
    void fetchPublished()
    const timer = window.setInterval(() => void fetchPublished(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [fetchPublished])

  // Keeps a second tab on the same machine in step with the console.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setFlags(readDraft())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const dirty = published !== null && !sameFlags(flags, { ...defaultFlags(), ...published })
  dirtyRef.current = dirty

  const value = useMemo<FeatureFlagsValue>(() => {
    const commit = (next: FlagState) => {
      setFlags(next)
      writeDraft(next)
    }

    return {
      flags,
      isEnabled: (id: string) => {
        const [moduleId] = id.split('.')
        if (flags[moduleId] === false) return false
        return flags[id] !== false
      },
      setFlag: (id, next) => commit({ ...flags, [id]: next }),
      setAll: (next) => {
        const all: FlagState = {}
        for (const key of Object.keys(defaultFlags())) all[key] = next
        commit(all)
      },
      reset: () => commit(defaultFlags()),
      revertToPublished: () => commit({ ...defaultFlags(), ...(published ?? {}) }),
      publish: async () => {
        setPublishing(true)
        try {
          const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flags }),
          })
          const data = (await response.json()) as {
            configured?: boolean
            flags?: FlagState
            savedAt?: string
            error?: string
          }
          if (!response.ok) throw new Error(data.error ?? String(response.status))
          if (!data.configured) {
            setSync('local-only')
            return
          }
          setPublished(data.flags ?? flags)
          setLastPublishedAt(data.savedAt ?? new Date().toISOString())
          setSync('synced')
        } catch {
          setSync('error')
        } finally {
          setPublishing(false)
        }
      },
      sync,
      dirty,
      publishing,
      lastPublishedAt,
    }
  }, [flags, published, sync, dirty, publishing, lastPublishedAt])

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) throw new Error('useFeatureFlags must be used inside FeatureFlagsProvider')
  return context
}
