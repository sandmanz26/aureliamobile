import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/* The Summary | Detail tab state for PageTabs (U142, J203), kept in the URL as `?tab=detail`. */

export type PageTab = 'summary' | 'detail'

/** The current tab and a setter that keeps every other search param (a page's own `?view=` etc.). */
export function usePageTab(): [PageTab, (tab: PageTab) => void] {
  const [params, setParams] = useSearchParams()
  const tab: PageTab = params.get('tab') === 'detail' ? 'detail' : 'summary'
  const set = useCallback(
    (next: PageTab) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'detail') p.set('tab', 'detail')
        else p.delete('tab')
        return p
      }),
    [setParams],
  )
  return [tab, set]
}

/**
 * For pages that write their own search params with a fresh object
 * (`setParams({ view: 'x' })`): carries `tab` over so a click inside Detail
 * does not throw the reader back to Summary.
 */
export function keepTab(prev: URLSearchParams, next: Record<string, string>): Record<string, string> {
  const tab = prev.get('tab')
  return tab ? { ...next, tab } : next
}

