import type { ZodType } from 'zod'

/**
 * Browser storage, safely.
 *
 * Every read can fail (private mode, a full quota, storage blocked by policy)
 * and every stored value can be stale or hand-edited, so nothing here throws
 * and nothing is trusted: JSON reads are parsed *and* validated against a
 * schema, and a value that fails either falls back instead of reaching the UI
 * with the wrong shape. Writes report whether they landed, for the few callers
 * that need to say "saved on this device only".
 *
 * Use this rather than touching `localStorage` directly. When accounts exist,
 * the values that belong to a person (onboarding answers, objectives) move to
 * the server; this stays for what belongs to the device.
 */

type Area = 'local' | 'session'

function area(which: Area): Storage | null {
  try {
    return which === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readString(key: string, which: Area = 'local'): string | null {
  try {
    return area(which)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeString(key: string, value: string, which: Area = 'local'): boolean {
  try {
    const store = area(which)
    if (!store) return false
    store.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string, which: Area = 'local'): void {
  try {
    area(which)?.removeItem(key)
  } catch {
    // Nothing to clear, or storage is blocked — either way there is nothing left to do.
  }
}

/** Parse and validate a JSON value; anything missing, malformed or the wrong shape returns `fallback`. */
export function readJson<T>(key: string, schema: ZodType<T>, fallback: T, which: Area = 'local'): T {
  const raw = readString(key, which)
  if (raw === null) return fallback
  try {
    const parsed = schema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown, which: Area = 'local'): boolean {
  try {
    return writeString(key, JSON.stringify(value), which)
  } catch {
    // A value that cannot be serialised (a cycle) is a bug, but not one worth a crash.
    return false
  }
}
