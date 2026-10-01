import { Download, EyeOff, List, PencilLine, Plus, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFeatureFlags } from '../FeatureFlags'
import { ANNOTATIONS_FLAG, MOBILE_WEB_BREAKPOINT } from '../modules'
import type { Annotation } from './format'
import {
  annotationsFileName,
  newAnnotationId,
  parseAnnotations,
  serializeAnnotations,
  sortAnnotations,
} from './format'

// Review annotations — a /__demo tool, not part of the product.
//
// Switched on from the console's "Review annotations" card. Even then it only
// renders below MOBILE_WEB_BREAKPOINT (the mobile web layout) and never on
// /__demo itself. A 40px button opens a menu: drop a numbered pin anywhere,
// write a note on it, drag pins and the button around, save everything to a
// .txt, open one back — and a note in the list takes you to its screen.
//
// Notes live in this browser's localStorage, not in the shared flag store:
// the flag decides who sees the tool, the .txt is how notes travel.
//
// Geometry (positions, sizes) is inline because it is computed; colour and
// type are the token utilities like everywhere else. Rendered through a
// portal for the reason in CLAUDE.md: `.u-page` animates with a transform,
// which would pin a `fixed` overlay to the page box instead of the viewport.

const NOTES_KEY = 'aurelia.demo.annotations'
const FAB_KEY = 'aurelia.demo.annotationsButton'
const FAB = 40
const PIN = 26
const TAP_SLOP = 5
const Z = 2147483000

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/**
 * A pin's spot in the full document, in pixels — independent of the current
 * scroll position. `x` is recomputed against the live viewport width (so a
 * note still lands on the same area on another phone width), but `y` has to
 * be resolved against the scroll the page was at when the pin was placed:
 * `y` alone is only a fraction of one screenful, not a position in the page.
 */
function docPosition(annotation: Annotation, vw: number) {
  return {
    left: (annotation.x / 100) * vw,
    top: annotation.scrollY + (annotation.y / 100) * annotation.vh,
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode — notes last for the tab; Save to .txt still works.
  }
}

const MOBILE_QUERY = `(max-width: ${MOBILE_WEB_BREAKPOINT - 0.02}px)`

function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function useIsMobileWeb() {
  return useSyncExternalStore(subscribeToWidth, () => window.matchMedia(MOBILE_QUERY).matches)
}

/** Re-render on resize so pins and panels re-clamp to the new viewport. */
function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

interface DragHandlers {
  onMove?: (clientX: number, clientY: number) => void
  onEnd?: () => void
  onTap?: () => void
}

/** Pointer-event drag for mouse and touch alike; under TAP_SLOP of travel is a tap. */
function startDrag(event: ReactPointerEvent<HTMLElement>, handlers: DragHandlers) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.preventDefault()
  event.stopPropagation()
  const el = event.currentTarget
  const pointerId = event.pointerId
  const startX = event.clientX
  const startY = event.clientY
  let moved = false
  try {
    el.setPointerCapture(pointerId)
  } catch {
    // Capture is a nicety; the listeners below still fire on the element.
  }
  const move = (e: PointerEvent) => {
    if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < TAP_SLOP) return
    moved = true
    handlers.onMove?.(e.clientX, e.clientY)
  }
  const end = (e: PointerEvent) => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', end)
    el.removeEventListener('pointercancel', end)
    try {
      el.releasePointerCapture(pointerId)
    } catch {
      // Already released.
    }
    if (moved) handlers.onEnd?.()
    else if (e.type === 'pointerup') handlers.onTap?.()
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', end)
  el.addEventListener('pointercancel', end)
}

export function DemoAnnotator() {
  const { isEnabled } = useFeatureFlags()
  const { pathname } = useLocation()
  const isMobileWeb = useIsMobileWeb()
  // "Hide" is for one person wanting a clean screen, so it is per tab and
  // lasts until reload — the flag itself is the console's to change.
  const [hidden, setHidden] = useState(false)

  if (!isEnabled(ANNOTATIONS_FLAG) || !isMobileWeb || hidden || pathname.startsWith('/__demo')) {
    return null
  }
  return createPortal(<AnnotationOverlay pathname={pathname} onHide={() => setHidden(true)} />, document.body)
}

function AnnotationOverlay({ pathname, onHide }: { pathname: string; onHide: () => void }) {
  const navigate = useNavigate()
  const { w: vw, h: vh } = useViewport()

  const [annotations, setAnnotations] = useState<Annotation[]>(() => readJson<Annotation[]>(NOTES_KEY, []))
  const [fab, setFab] = useState(() => readJson(FAB_KEY, { x: window.innerWidth - 36, y: window.innerHeight - 140 }))
  const [placing, setPlacing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => writeJson(NOTES_KEY, annotations), [annotations])

  useEffect(() => {
    if (!highlightId) return
    const timer = window.setTimeout(() => setHighlightId(null), 2600)
    return () => window.clearTimeout(timer)
  }, [highlightId])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const onThisPage = useMemo(
    () => sortAnnotations(annotations.filter((a) => a.page === pathname)),
    [annotations, pathname],
  )
  const written = annotations.filter((a) => a.text.trim() !== '')

  const update = useCallback((id: string, patch: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const remove = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    setOpenId((current) => (current === id ? null : current))
  }, [])

  /** Closing a note that was never written drops it, so a stray tap leaves nothing behind. */
  const closeNote = useCallback(() => {
    if (openId) setAnnotations((prev) => prev.filter((a) => a.id !== openId || a.text.trim() !== ''))
    setOpenId(null)
  }, [openId])

  const goTo = useCallback(
    (annotation: Annotation) => {
      setListOpen(false)
      setMenuOpen(false)
      if (annotation.page !== pathname) navigate(annotation.page)
      setOpenId(annotation.id)
      setHighlightId(annotation.id)
    },
    [navigate, pathname],
  )

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (placing) setPlacing(false)
      else if (openId) closeNote()
      else if (listOpen) setListOpen(false)
      else if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placing, openId, listOpen, menuOpen, closeNote])

  function startPlacing() {
    closeNote()
    setMenuOpen(false)
    setPlacing(true)
  }

  function placeAt(clientX: number, clientY: number) {
    const now = new Date().toISOString()
    const annotation: Annotation = {
      id: newAnnotationId(),
      page: pathname,
      x: clamp((clientX / vw) * 100, 0, 100),
      y: clamp((clientY / vh) * 100, 0, 100),
      vw,
      vh,
      scrollY: window.scrollY,
      text: '',
      createdAt: now,
      updatedAt: now,
    }
    setAnnotations((prev) => [...prev, annotation])
    setPlacing(false)
    setOpenId(annotation.id)
  }

  function saveTxt() {
    setMenuOpen(false)
    if (!written.length) {
      setToast('Nothing to save yet')
      return
    }
    const blob = new Blob([serializeAnnotations(written)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = annotationsFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function openTxt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    let parsed: Annotation[] = []
    try {
      parsed = parseAnnotations(await file.text())
    } catch {
      parsed = []
    }
    if (!parsed.length) {
      setToast('No annotations in that file')
      return
    }
    // Merged by id: opening the same file twice does not duplicate, and the
    // file wins over an older local copy of the same note.
    setAnnotations((prev) => {
      const byId = new Map(prev.map((a) => [a.id, a]))
      for (const a of parsed) byId.set(a.id, a)
      return Array.from(byId.values())
    })
    setMenuOpen(false)
    // One screen's worth of notes: go straight there. Several: let them pick.
    if (new Set(parsed.map((a) => a.page)).size === 1) goTo(sortAnnotations(parsed)[0])
    else setListOpen(true)
  }

  const open = openId ? annotations.find((a) => a.id === openId) : undefined
  const fabLeft = clamp(fab.x - FAB / 2, 8, vw - FAB - 8)
  const fabTop = clamp(fab.y - FAB / 2, 8, vh - FAB - 8)

  return (
    <>
      {/* Pins, in normal document flow (`position: absolute`, no `fixed`
          ancestor) so they scroll along with the content they're marking.
          A `fixed` overlay stays put on screen while the page moves under
          it, which reads as the pin itself drifting. This div sits at the
          document's own (0, 0) — not the viewport's — so each pin's `left`/
          `top` (from `docPosition`) is a document-absolute pixel position
          that holds across a scroll, and across a reload. */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: Z, pointerEvents: 'none' }} data-demo-annotations="">
        {onThisPage.map((a, i) => {
          const { left, top } = docPosition(a, vw)
          return (
            <Pin
              key={a.id}
              annotation={a}
              left={left}
              top={top}
              number={i + 1}
              active={a.id === openId}
              highlight={a.id === highlightId}
              onTap={() => (a.id === openId ? closeNote() : setOpenId(a.id))}
              onMove={(cx, cy) =>
                update(a.id, {
                  x: clamp((cx / vw) * 100, 0, 100),
                  y: clamp((cy / vh) * 100, 0, 100),
                  scrollY: window.scrollY,
                })
              }
              onDragEnd={() => update(a.id, { updatedAt: new Date().toISOString() })}
            />
          )
        })}
      </div>

      {/* The tool's own chrome — FAB, menu, editor, toast — stays genuinely
          fixed to the viewport, unlike the pins above. */}
      <div className="fixed inset-0" style={{ zIndex: Z, pointerEvents: 'none' }} data-demo-annotations="">
      {placing && (
        <div
          className="absolute inset-0 bg-interactive-primary/5"
          style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
          onClick={(e) => placeAt(e.clientX, e.clientY)}
        >
          <p className="text-style-label absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-full bg-interactive-primary px-12 py-6 text-text-inverse shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            Tap anywhere to pin a note
          </p>
        </div>
      )}

      {open && open.page === pathname && (
        <NoteCard
          key={open.id}
          annotation={open}
          number={onThisPage.findIndex((a) => a.id === open.id) + 1}
          vw={vw}
          vh={vh}
          scrollY={window.scrollY}
          onChange={(text) => update(open.id, { text, updatedAt: new Date().toISOString() })}
          onDelete={() => remove(open.id)}
          onClose={closeNote}
        />
      )}

      {listOpen && (
        <NoteList annotations={written} currentPage={pathname} onPick={goTo} onClose={() => setListOpen(false)} />
      )}

      {menuOpen && !placing && !listOpen && (
        <Menu
          fabLeft={fabLeft}
          fabTop={fabTop}
          vw={vw}
          vh={vh}
          count={written.length}
          onAdd={startPlacing}
          onList={() => {
            setMenuOpen(false)
            setListOpen(true)
          }}
          onSave={saveTxt}
          onOpen={() => fileInput.current?.click()}
          onHide={onHide}
        />
      )}

      {/* Hidden while the list sheet is up so it does not sit on top of it. */}
      {!listOpen && (
        <div
          role="button"
          aria-label={placing ? 'Cancel adding a note' : 'Review annotations'}
          className="flex items-center justify-center rounded-full bg-interactive-primary text-brand-default shadow-[0_5px_18px_rgba(0,0,0,0.22)]"
          style={{
            position: 'absolute',
            left: fabLeft,
            top: fabTop,
            width: FAB,
            height: FAB,
            pointerEvents: 'auto',
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'grab',
          }}
          onPointerDown={(e) =>
            startDrag(e, {
              onMove: (cx, cy) => setFab({ x: cx, y: cy }),
              onEnd: () =>
                setFab((position) => {
                  writeJson(FAB_KEY, position)
                  return position
                }),
              onTap: () => (placing ? setPlacing(false) : setMenuOpen((value) => !value)),
            })
          }
        >
          {placing ? <X size={18} /> : <PencilLine size={18} />}
          {!placing && onThisPage.length > 0 && (
            <span
              className="text-style-caption absolute flex items-center justify-center rounded-full bg-brand-default font-bold text-text-strong ring-2 ring-surface-default"
              style={{ top: -4, right: -4, minWidth: 18, height: 18, padding: '0 5px' }}
            >
              {onThisPage.length}
            </span>
          )}
        </div>
      )}

      {toast && (
        <p
          role="status"
          className="text-style-label absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-interactive-primary px-12 py-6 text-text-inverse"
          style={{ bottom: 24 }}
        >
          {toast}
        </p>
      )}

      <input ref={fileInput} type="file" accept=".txt,text/plain" onChange={openTxt} hidden />
      </div>
    </>
  )
}

function Pin({
  annotation,
  left,
  top,
  number,
  active,
  highlight,
  onTap,
  onMove,
  onDragEnd,
}: {
  annotation: Annotation
  /** Document-absolute pixels, from `docPosition` — not a percentage of the
   *  viewport, so this stays put under the pin's spot in the content as the
   *  page scrolls. */
  left: number
  top: number
  number: number
  active: boolean
  highlight: boolean
  onTap: () => void
  onMove: (clientX: number, clientY: number) => void
  onDragEnd: () => void
}) {
  return (
    <div
      role="button"
      aria-label={`Annotation ${number}`}
      title={annotation.text || undefined}
      className={`text-style-label flex items-center justify-center rounded-full border-2 font-bold shadow-[0_3px_10px_rgba(0,0,0,0.2)] ${
        active
          ? 'border-brand-default bg-interactive-primary text-brand-default'
          : 'border-interactive-primary bg-brand-default text-interactive-primary'
      }`}
      style={{
        position: 'absolute',
        left,
        top,
        width: PIN,
        height: PIN,
        marginLeft: -PIN / 2,
        marginTop: -PIN / 2,
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab',
      }}
      onPointerDown={(e) => startDrag(e, { onMove, onEnd: onDragEnd, onTap })}
    >
      {highlight && <span className="absolute -inset-6 animate-ping rounded-full bg-brand-emphasis/40" />}
      <span className="relative">{number}</span>
    </div>
  )
}

function NoteCard({
  annotation,
  number,
  vw,
  vh,
  scrollY,
  onChange,
  onDelete,
  onClose,
}: {
  annotation: Annotation
  number: number
  vw: number
  vh: number
  /** `window.scrollY` as of this render — the card lives in the viewport-
   *  fixed chrome layer, so its pin's document position has to be projected
   *  back to a screen position before it means anything here. */
  scrollY: number
  onChange: (text: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Focus without scrolling the page behind the overlay.
    textarea.current?.focus({ preventScroll: true })
  }, [])

  const width = Math.min(240, vw - 16)
  const pin = docPosition(annotation, vw)
  const px = pin.left
  const py = pin.top - scrollY
  const left = clamp(px - width / 2, 8, vw - width - 8)
  const fitsBelow = py + PIN / 2 + 8 + 160 < vh
  const vertical = fitsBelow ? { top: py + PIN / 2 + 8 } : { bottom: vh - py + PIN / 2 + 8 }

  return (
    <div
      className="rounded-16 border border-border-subtle bg-surface-default p-10 shadow-[0_5px_24px_4px_rgba(0,0,0,0.08)]"
      style={{ position: 'absolute', left, width, ...vertical, pointerEvents: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between gap-8">
        <span className="text-style-caption truncate text-text-secondary">
          #{number} · {annotation.page}
        </span>
        <button type="button" aria-label="Close note" onClick={onClose} className="p-2 text-icon-secondary">
          <X size={14} />
        </button>
      </div>
      <textarea
        ref={textarea}
        value={annotation.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a note…"
        rows={3}
        // text-style-body is 16px — anything smaller makes iOS Safari zoom on focus.
        className="text-style-body w-full resize-none rounded-12 border border-border-subtle bg-background-default px-10 py-8 text-text-primary outline-none"
      />
      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onDelete} className="text-style-label px-4 py-6 text-feedback-error">
          Delete
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-style-label rounded-full bg-interactive-primary px-16 py-6 text-text-inverse"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function Menu({
  fabLeft,
  fabTop,
  vw,
  vh,
  count,
  onAdd,
  onList,
  onSave,
  onOpen,
  onHide,
}: {
  fabLeft: number
  fabTop: number
  vw: number
  vh: number
  count: number
  onAdd: () => void
  onList: () => void
  onSave: () => void
  onOpen: () => void
  onHide: () => void
}) {
  const width = 196
  const onRight = fabLeft + FAB / 2 > vw / 2
  const left = clamp(onRight ? fabLeft + FAB - width : fabLeft, 8, vw - width - 8)
  const vertical = fabTop > vh / 2 ? { bottom: vh - fabTop + 8 } : { top: fabTop + FAB + 8 }

  const items = [
    { label: 'Add a note', icon: Plus, onClick: onAdd },
    { label: `All notes (${count})`, icon: List, onClick: onList },
    { label: 'Save to .txt', icon: Download, onClick: onSave },
    { label: 'Open a .txt', icon: Upload, onClick: onOpen },
    { label: 'Hide until reload', icon: EyeOff, onClick: onHide },
  ]

  return (
    <div
      className="rounded-16 border border-border-subtle bg-surface-default p-4 shadow-[0_5px_24px_4px_rgba(0,0,0,0.1)]"
      style={{ position: 'absolute', left, width, ...vertical, pointerEvents: 'auto' }}
    >
      {items.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="text-style-body-small flex w-full items-center gap-10 rounded-12 px-10 py-8 text-left text-text-primary hover:bg-background-elevated"
        >
          <Icon size={15} className="shrink-0 text-icon-secondary" />
          {label}
        </button>
      ))}
    </div>
  )
}

function NoteList({
  annotations,
  currentPage,
  onPick,
  onClose,
}: {
  annotations: Annotation[]
  currentPage: string
  onPick: (annotation: Annotation) => void
  onClose: () => void
}) {
  const groups = useMemo(() => {
    const byPage = new Map<string, Annotation[]>()
    for (const a of sortAnnotations(annotations)) byPage.set(a.page, [...(byPage.get(a.page) ?? []), a])
    // The screen you are on first.
    return Array.from(byPage.entries()).sort(([a], [b]) => (a === currentPage ? -1 : b === currentPage ? 1 : 0))
  }, [annotations, currentPage])

  return (
    <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'auto' }} onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-24 bg-surface-default shadow-[0_-6px_24px_rgba(0,0,0,0.12)]"
        style={{ maxHeight: '55vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-16 pb-8 pt-12">
          <h2 className="text-style-body font-semibold text-text-primary">Notes ({annotations.length})</h2>
          <button type="button" aria-label="Close list" onClick={onClose} className="p-4 text-icon-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto pb-16 pt-4">
          {annotations.length === 0 && (
            <p className="text-style-body-small p-16 text-text-secondary">
              No notes yet — add one, or open a .txt.
            </p>
          )}
          {groups.map(([page, list]) => (
            <div key={page}>
              <p className="text-style-caption px-16 pb-4 pt-10 font-semibold uppercase tracking-wider text-text-secondary">
                {page}
                {page === currentPage ? ' · this screen' : ''}
              </p>
              {list.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onPick(a)}
                  className="flex w-full items-start gap-10 px-16 py-8 text-left hover:bg-background-elevated"
                >
                  <span className="text-style-caption flex size-20 shrink-0 items-center justify-center rounded-full bg-brand-default font-bold text-text-strong">
                    {i + 1}
                  </span>
                  <span className="text-style-body-small line-clamp-2 text-text-primary">{a.text}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
