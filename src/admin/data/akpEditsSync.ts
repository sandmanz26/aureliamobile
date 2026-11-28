import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { fetchAkpEdits, saveAkpEdits } from '../../api/akpEdits'
import { readString, writeJson, writeString } from '../../lib/storage'
import type { AkpEdit } from './akpEdits'
import { AKP_EDITS_KEY, getAkpEdits, setAkpEdits, subscribeAkpEdits } from './akps'

/**
 * Keeps the AKP edits (akpEdits.ts) in step with /api/akp-edits (U149), the
 * same contract src/demo/annotations uses for pins:
 * - every change is written to this browser first (localStorage), then the
 *   whole list is pushed after a short debounce: last write wins, no merge;
 * - the server is polled while the editor is open, and what it holds
 *   replaces the local list unless a push is pending;
 * - `configured: false` (no KV on this deployment) or no endpoint at all
 *   (vite dev / preview) leaves the tool on its local copy, "Local only".
 * Staging and production keep separate lists: the server scopes the key.
 */

export type AkpSyncState = 'loading' | 'synced' | 'saving' | 'local-only' | 'error'

const POLL_MS = 20_000
const PUSH_DEBOUNCE_MS = 700
const WHO_KEY = 'aurelia.admin.akpEditor'

let sync: AkpSyncState = 'loading'
let scope: string | null = null
let loaded = false
let pushTimer: number | undefined
let lastServer: AkpEdit[] | null = null
const syncListeners = new Set<() => void>()
const emit = () => syncListeners.forEach((l) => l())
const setSync = (s: AkpSyncState) => {
  if (s === sync) return
  sync = s
  emit()
}

async function pull() {
  if (pushTimer !== undefined || sync === 'saving') return
  try {
    const data = await fetchAkpEdits()
    scope = data.scope ?? null
    if (!data.configured || !data.edits) {
      setSync('local-only')
      emit()
      return
    }
    if (pushTimer === undefined && (sync as AkpSyncState) !== 'saving') {
      lastServer = data.edits
      if (JSON.stringify(data.edits) !== JSON.stringify(getAkpEdits())) {
        setAkpEdits(data.edits)
        writeJson(AKP_EDITS_KEY, data.edits)
      }
    }
    setSync('synced')
    emit()
  } catch {
    // No endpoint (vite dev / preview) or offline: the local copy carries the tool.
    setSync(sync === 'error' ? 'error' : 'local-only')
  } finally {
    loaded = true
  }
}

async function push() {
  pushTimer = undefined
  const edits = getAkpEdits()
  if (edits === lastServer) return
  try {
    setSync('saving')
    const data = await saveAkpEdits(edits)
    scope = data.scope ?? scope
    lastServer = edits
    setSync(data.configured ? 'synced' : 'local-only')
  } catch {
    setSync('error')
  }
}

/** Replaces the edits: saved in this browser now, pushed to the shared store shortly after. */
export function commitAkpEdits(next: AkpEdit[]) {
  setAkpEdits(next)
  writeJson(AKP_EDITS_KEY, next)
  if (!loaded || sync === 'local-only') return
  if (pushTimer !== undefined) window.clearTimeout(pushTimer)
  pushTimer = window.setTimeout(() => void push(), PUSH_DEBOUNCE_MS)
}

let users = 0
let pollTimer: number | undefined
function start() {
  if (users++ > 0) return
  void pull()
  pollTimer = window.setInterval(() => void pull(), POLL_MS)
}
function stop() {
  if (--users > 0) return
  window.clearInterval(pollTimer)
}

const subscribeSync = (l: () => void) => {
  syncListeners.add(l)
  return () => void syncListeners.delete(l)
}

/** The name an edit is recorded under, kept in this browser. */
export function editorName(): string {
  return readString(WHO_KEY)?.trim() || 'admin'
}

/** The edits, the sync state and the actions; starts polling while mounted. */
export function useAkpEdits() {
  const edits = useSyncExternalStore(subscribeAkpEdits, getAkpEdits, getAkpEdits)
  const state = useSyncExternalStore(subscribeSync, () => sync, () => sync)
  const key = useSyncExternalStore(subscribeSync, () => scope, () => scope)
  const who = useSyncExternalStore(subscribeSync, editorName, editorName)
  useEffect(() => {
    start()
    return stop
  }, [])
  const setWho = useCallback((name: string) => {
    writeString(WHO_KEY, name.slice(0, 60))
    emit()
  }, [])
  return { edits, sync: state, scope: key, who, setWho, commit: commitAkpEdits }
}

/** The status line, in the words the annotations tool uses. */
export function syncText(state: AkpSyncState, key: string | null): string {
  switch (state) {
    case 'loading':
      return 'Checking the shared store…'
    case 'synced':
      return `Synced — every admin on this site sees these edits${key ? ` (${key})` : ''}`
    case 'saving':
      return 'Saving…'
    case 'local-only':
      return 'Local only — no server configured; edits are saved in this browser'
    case 'error':
      return 'Sync error — edits are saved in this browser and will be sent with the next change'
  }
}
