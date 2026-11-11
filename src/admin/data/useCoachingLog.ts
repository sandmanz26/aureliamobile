import { useMemo, useState } from 'react'
import { readLog, sampleLog, writeLog, type LogEntry } from './coachingLog'
import type { Participant } from './study'

/** The coaching log for one page: sample contacts plus the PM's own, saved in this browser. */
export function useCoachingLog(ps: Participant[], today: string) {
  const [own, setOwn] = useState<LogEntry[]>(readLog)
  const [saved, setSaved] = useState(true)
  const sample = useMemo(() => sampleLog(ps, today), [ps, today])
  const log = useMemo(() => [...sample, ...own], [sample, own])
  function update(next: LogEntry[]) {
    setOwn(next)
    setSaved(writeLog(next))
  }
  return {
    log,
    saved,
    add: (e: LogEntry) => update([...own, e]),
    remove: (id: string) => update(own.filter((e) => e.id !== id)),
  }
}
