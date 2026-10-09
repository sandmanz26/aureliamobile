import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCw } from 'lucide-react'
import { MiniPlayer } from '../components/chat/MiniPlayer'
import { useAudioPlayer } from '../audio/AudioPlayerContext'

/*
 * Behaviour that only exists in design Version 2 (staging). Everything here
 * is mounted by AppLayout behind `useUiVersion() >= 2`, so v1 never runs it.
 */

/** The running session, floating over every screen that does not already show it. */
export function FloatingPlayer({ pathname }: { pathname: string }) {
  const { track } = useAudioPlayer()
  const shown = !!track && !pathname.startsWith('/chat')
  // Bottom bars (New Session, Play, …) move up above the card while it shows.
  useEffect(() => {
    if (!shown) return
    document.documentElement.setAttribute('data-floating-player', '')
    return () => document.documentElement.removeAttribute('data-floating-player')
  }, [shown])
  if (!shown) return null
  return (
    <>
      {/* Room at the end of the page so the card never hides the last row. */}
      <div aria-hidden="true" className="h-96" />
      {/* Portaled: .u-page's transform would otherwise pin this to the page box. */}
      {createPortal(
      <div className="v2-float-in fixed inset-x-0 bottom-16 z-40 mx-auto w-[calc(100%-32px)] max-w-[402px] lg:left-auto lg:right-24 lg:mx-0 lg:w-[360px]">
        <div className="rounded-[20px] shadow-[0_12px_32px_-8px_rgba(27,16,6,0.28)]">
          <MiniPlayer />
        </div>
      </div>,
      document.body,
      )}
    </>
  )
}

const PULL_MAX = 110
const PULL_TRIGGER = 70

/**
 * Pull down at the top of a page to refresh it. There is no server to ask,
 * so "refresh" remounts the screen (its entrances replay, local state resets)
 * rather than reloading the tab — a reload would also sign you out.
 */
export function usePullToRefresh(enabled: boolean) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [key, setKey] = useState(0)
  const start = useRef<number | null>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const onStart = (e: TouchEvent) => {
      const t = e.target as Element
      start.current = window.scrollY <= 0 && !t.closest('.u-sheet, [role="dialog"], input, textarea') ? e.touches[0].clientY : null
    }
    const onMove = (e: TouchEvent) => {
      if (start.current === null) return
      const dy = e.touches[0].clientY - start.current
      if (dy <= 0 || window.scrollY > 0) {
        pullRef.current = 0
        setPull(0)
        return
      }
      // Resistance: the further you pull, the less it follows.
      const eased = Math.min(PULL_MAX, dy * 0.5)
      pullRef.current = eased
      setPull(eased)
    }
    const onEnd = () => {
      if (start.current === null) return
      start.current = null
      if (pullRef.current >= PULL_TRIGGER) {
        setRefreshing(true)
        setPull(PULL_TRIGGER)
        window.setTimeout(() => {
          setKey((k) => k + 1)
          setRefreshing(false)
          setPull(0)
        }, 700)
      } else setPull(0)
      pullRef.current = 0
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [enabled])

  return { pull, refreshing, key }
}

export function PullIndicator({ pull, refreshing }: { pull: number; refreshing: boolean }) {
  if (!pull && !refreshing) return null
  const ready = pull >= PULL_TRIGGER
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ top: `calc(var(--staging-bar) + ${pull - 40}px)`, opacity: Math.min(1, pull / PULL_TRIGGER) }}
    >
      <span className="flex size-36 items-center justify-center rounded-full bg-surface-default text-[#ff881b] shadow-[0_6px_18px_-6px_rgba(27,16,6,0.35)]">
        <RotateCw
          size={18}
          className={refreshing ? 'animate-spin' : ''}
          style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)`, opacity: ready ? 1 : 0.6 }}
        />
      </span>
    </div>
  )
}

/**
 * Drag any bottom sheet (`.u-sheet`) by its top area, or anywhere once its
 * own scroll is at the top. It follows the finger, resists upward pulls, and
 * past a third of its height or a quick flick it slides away and closes by
 * clicking its backdrop — the close path every sheet already has. A sheet
 * with no backdrop close springs back instead.
 */
export function useSheetDrag(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let sheet: HTMLElement | null = null
    let startY = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0
    let dragging = false

    const scroller = (el: HTMLElement, from: Element) => {
      for (let n: Element | null = from; n && n !== el.parentElement; n = n.parentElement) {
        if (n instanceof HTMLElement && n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return n
      }
      return null
    }

    const onDown = (e: PointerEvent) => {
      const s = (e.target as Element).closest<HTMLElement>('.u-sheet')
      if (!s || s.closest('[data-no-sheet-drag]') || (e.target as Element).closest('input, textarea, select, button, a')) return
      const sc = scroller(s, e.target as Element)
      const nearTop = e.clientY - s.getBoundingClientRect().top < 56
      if (!nearTop && sc && sc.scrollTop > 0) return
      sheet = s
      startY = lastY = e.clientY
      lastT = performance.now()
      velocity = 0
      dragging = false
    }
    const onMove = (e: PointerEvent) => {
      if (!sheet) return
      const dy = e.clientY - startY
      if (!dragging && Math.abs(dy) < 6) return
      dragging = true
      const now = performance.now()
      velocity = (e.clientY - lastY) / Math.max(1, now - lastT)
      lastY = e.clientY
      lastT = now
      const y = dy > 0 ? dy : -Math.sqrt(-dy) * 3
      sheet.style.transition = 'none'
      sheet.style.animation = 'none'
      sheet.style.transform = `translateY(${y}px)`
    }
    const onUp = (e: PointerEvent) => {
      if (!sheet) return
      const s = sheet
      sheet = null
      if (!dragging) return
      const dy = e.clientY - startY
      const overlay = s.parentElement
      const close = !!overlay && (dy > s.offsetHeight / 3 || velocity > 0.8)
      const springBack = () => {
        s.style.transition = 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'
        s.style.transform = 'translateY(0)'
        if (overlay) overlay.style.opacity = '1'
      }
      if (close) {
        s.style.transition = 'transform 260ms cubic-bezier(0.4, 0, 1, 1)'
        s.style.transform = 'translateY(110%)'
        if (overlay) {
          overlay.style.transition = 'opacity 260ms ease'
          overlay.style.opacity = '0'
        }
        window.setTimeout(() => {
          overlay?.click()
          // A sheet whose backdrop does not close it is still here: bring it back.
          window.setTimeout(() => s.isConnected && springBack(), 60)
        }, 240)
      } else springBack()
    }
    // Swallow the click that ends a drag so it doesn't hit a row underneath.
    const onClick = (e: MouseEvent) => {
      if (dragging && (e.target as Element).closest('.u-sheet')) {
        e.stopPropagation()
        e.preventDefault()
        dragging = false
      }
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('click', onClick, true)
    }
  }, [enabled])
}
