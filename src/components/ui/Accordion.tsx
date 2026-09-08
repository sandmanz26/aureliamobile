import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Uppercase, hairline-separated collapsible rows — the documentation-sidebar
 * pattern from the reference screenshot.
 *
 * A session carries far more than fits on one screen (structure, layers,
 * personalization, lineage, safety). Stacking it all flat buries the play
 * button; this keeps every heading visible at once and opens only what is
 * asked for. Sections listed in `defaultOpen` start expanded so the page never
 * loads as a wall of closed rows.
 */
export interface AccordionSection {
  id: string
  label: string
  /** Optional right-aligned hint — a count, a duration, a status. */
  meta?: string
  content: ReactNode
}

interface AccordionProps {
  sections: AccordionSection[]
  defaultOpen?: string[]
}

export function Accordion({ sections, defaultOpen = [] }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen)

  function toggle(id: string) {
    setOpen((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  return (
    <div className="flex flex-col border-t border-border-subtle">
      {sections.map((section) => {
        const expanded = open.includes(section.id)
        return (
          <div key={section.id} className="border-b border-border-subtle">
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={expanded}
              aria-controls={`section-${section.id}`}
              className="u-press flex w-full items-center gap-12 py-16 text-left"
            >
              <span className="text-style-label flex-1 uppercase tracking-[0.12em] text-text-primary">
                {section.label}
              </span>
              {section.meta && <span className="text-style-caption text-text-secondary">{section.meta}</span>}
              <ChevronDown
                size={16}
                className={`shrink-0 text-icon-secondary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
            {/* Kept mounted and collapsed rather than unmounted, so opening and
                closing both animate and the content keeps its own state. */}
            <div id={`section-${section.id}`} className="u-collapse" data-open={expanded}>
              {/* inert while collapsed: the content stays mounted so both
                  directions animate, but it must not be tabbable or read out
                  while it is a zero-height row. */}
              <div inert={!expanded}>
                <div className="pb-20">{section.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
