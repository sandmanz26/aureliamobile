import type { TocEntry } from '../guides/prepareDoc'

/** The design system's sections, in page order, for the wiki's contents list. */
export const DS_TOC: TocEntry[] = [
  ['principles', 'Principles'],
  ['colour', 'Colour'],
  ['type', 'Typography'],
  ['numbers', 'Spacing, size and radius'],
  ['effects', 'Shadow and gradient'],
  ['brand', 'Brand'],
  ['icons', 'Icons'],
  ['components', 'Components and patterns'],
  ['gaps', 'Open gaps'],
].map(([id, text]) => ({ id, text, level: 2 as const, search: text.toLowerCase() }))
