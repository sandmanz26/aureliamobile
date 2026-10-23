import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { configKeys, fetchConfig, publishConfig } from '../api/config'
import { readJson, writeJson } from '../lib/storage'
import { z } from 'zod'
import type { FlagState } from './modules'
import { ANNOTATIONS_FLAG, CLICKS_FLAG, NETWORK3D_FLAG, NETWORK3D_MOTION_FLAG, SITE_LOCK_FLAG, STORAGE_KEY, defaultFlags } from './modules'

/** Flags that are tools around the demo rather than screens in it. */
const NOT_A_MODULE = [SITE_LOCK_FLAG, ANNOTATIONS_FLAG, CLICKS_FLAG, NETWORK3D_FLAG, NETWORK3D_MOTION_FLAG]

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
  /**
   * The KV key this deployment reads and writes, as the server reports it.
   * Staging and production are scoped apart, and the only way to be sure which
   * one Publish is about to change is to have the server say so.
   */
  scope: string | null
}

const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(null)

const POLL_MS = 15_000

const storedFlags = z.record(z.string(), z.boolean())

function readDraft(): FlagState {
  return { ...defaultFlags(), ...readJson(STORAGE_KEY, storedFlags, {}) }
}

function writeDraft(flags: FlagState) {
  // Private mode — the flags still apply for this tab's lifetime.
  writeJson(STORAGE_KEY, flags)
}

function sameFlags(a: FlagState, b: FlagState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) if (a[key] !== b[key]) return false
  return true
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient()
  // What this browser had last time — the first paint, before the server
  // answers, and everything there is when no server is configured.
  const [initialDraft] = useState<FlagState>(readDraft)
  // Edits made in this tab. Null = following what is published.
  const [edited, setEdited] = useState<FlagState | null>(null)

  // The published set, polled so every open browser follows a Publish
  // within one interval. React Query owns the request: cancellation,
  // de-duplication and the cache the Publish mutation writes back into.
  const config = useQuery({
    queryKey: configKeys.all,
    queryFn: ({ signal }) => fetchConfig(signal),
    refetchInterval: POLL_MS,
    staleTime: 0,
    // No endpoint (plain `vite dev`) or offline: the local draft carries
    // the demo, and the next poll tries again — no extra retries needed.
    retry: false,
    meta: { reportErrors: false },
  })

  const publishMutation = useMutation({
    mutationKey: ['config', 'publish'],
    mutationFn: publishConfig,
    onSuccess: (data, sent) => {
      client.setQueryData(configKeys.all, { ...data, flags: data.flags ?? sent })
      if (data.configured) setEdited(null)
    },
  })

  // Keeps a second tab on the same machine in step with the console.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setEdited(readDraft())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const data = config.data
  const published = useMemo<FlagState | null>(() => (data?.configured ? (data.flags ?? {}) : null), [data])
  const merged = useMemo(() => (published ? { ...defaultFlags(), ...published } : null), [published])
  const dirty = edited !== null && merged !== null && !sameFlags(edited, merged)
  // A viewer follows the server; the presenter (who has edited) keeps their
  // draft until they publish or revert.
  const flags = merged === null ? (edited ?? initialDraft) : dirty ? edited! : merged

  // A failed Publish shows until the next successful poll proves the server
  // is reachable again.
  const publishFailed = publishMutation.isError && publishMutation.submittedAt > config.dataUpdatedAt
  const sync: SyncState = config.isPending
    ? 'loading'
    : publishFailed
      ? 'error'
      : data?.configured
        ? 'synced'
        : 'local-only'
  const scope = publishMutation.data?.scope ?? data?.scope ?? null
  const lastPublishedAt = publishMutation.data?.configured ? (publishMutation.data.savedAt ?? null) : null
  const { mutateAsync } = publishMutation

  const value = useMemo<FeatureFlagsValue>(() => {
    const commit = (next: FlagState) => {
      setEdited(next)
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
        // The site lock is not a module and is not what "disable all" means:
        // that reads as "hide every screen from the walkthrough", not "let the
        // world in". It keeps whatever it was set to — and so does the
        // annotation overlay, which is a review tool, not a screen.
        const defaults = defaultFlags()
        const all: FlagState = {}
        for (const key of NOT_A_MODULE) all[key] = flags[key] ?? defaults[key]
        for (const key of Object.keys(defaults)) {
          if (!NOT_A_MODULE.includes(key)) all[key] = next
        }
        commit(all)
      },
      reset: () => commit(defaultFlags()),
      revertToPublished: () => commit({ ...defaultFlags(), ...(published ?? {}) }),
      publish: async () => {
        try {
          await mutateAsync(flags)
        } catch {
          // Surfaced through `sync === 'error'`; reported by the mutation cache.
        }
      },
      sync,
      dirty,
      publishing: publishMutation.isPending,
      lastPublishedAt,
      scope,
    }
  }, [flags, published, sync, dirty, publishMutation.isPending, lastPublishedAt, scope, mutateAsync])

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) throw new Error('useFeatureFlags must be used inside FeatureFlagsProvider')
  return context
}
