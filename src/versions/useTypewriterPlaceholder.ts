import { useEffect, useState } from 'react'

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Version 2: a placeholder that types example prompts, holds, erases and moves
 * on. Returns `fallback` when off, when the user prefers reduced motion, or
 * while `paused` (the field has focus or text) — a placeholder that moves
 * under someone's cursor is noise.
 */
export function useTypewriterPlaceholder(lines: string[], { enabled, paused, fallback }: { enabled: boolean; paused: boolean; fallback: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (!enabled || paused || REDUCED) return
    let line = 0
    let i = 0
    let deleting = false
    let timer: number
    const step = () => {
      const target = lines[line]
      if (!deleting) {
        i += 1
        setText(target.slice(0, i))
        if (i >= target.length) {
          deleting = true
          timer = window.setTimeout(step, 1800)
          return
        }
        timer = window.setTimeout(step, 45 + Math.random() * 40)
      } else {
        i -= 1
        setText(target.slice(0, i))
        if (i <= 0) {
          deleting = false
          line = (line + 1) % lines.length
          timer = window.setTimeout(step, 400)
          return
        }
        timer = window.setTimeout(step, 22)
      }
    }
    timer = window.setTimeout(step, 600)
    return () => window.clearTimeout(timer)
  }, [enabled, paused, lines])

  if (!enabled || paused || REDUCED) return fallback
  return text ? `${text}|` : fallback
}
