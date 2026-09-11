import { useEffect } from 'react'

/**
 * Hides every scrollbar while the calling screen is mounted.
 *
 * The consumer app is a phone UI shown on a desktop screen, and a native
 * scrollbar down the side breaks that illusion immediately — as do the ones
 * that appear under each horizontal shelf.
 *
 * Scoped to a class on <html> rather than set globally, because the back office
 * at /admin is a desktop tool with long tables, where a scrollbar is a real
 * affordance and should stay. Only screens that call this hook lose theirs.
 *
 * Scrolling itself is untouched: wheel, trackpad, touch and keyboard (space,
 * arrows, Page Up/Down) all still work. What goes is the visual indicator and
 * the ability to drag the bar.
 */
export function useHiddenScrollbars() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('u-no-scrollbars')
    return () => root.classList.remove('u-no-scrollbars')
  }, [])
}
