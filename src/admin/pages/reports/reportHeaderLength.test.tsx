import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { REPORT_BRIEF_ROUTES, reportBrief } from '../../data/reportBriefs'
import { ReportHeaderCard } from './ReportHeaderCard'

// U151 (J208): every report and analysis Summary tab is one header card of about 180 words or fewer.
describe('report header card', () => {
  it.each(REPORT_BRIEF_ROUTES)('%s: three labelled blocks, 180 words or fewer', (route) => {
    const { container } = render(
      <MemoryRouter>
        <ReportHeaderCard route={route} brief={reportBrief(route)} />
      </MemoryRouter>,
    )
    for (const block of ['purpose', 'conclusion', 'sources']) expect(container.querySelector(`[data-block="${block}"]`), block).not.toBeNull()
    expect(container.textContent).toContain('What this report is for')
    expect(container.textContent).toContain('Conclusion')
    expect(container.textContent).toContain('Where it comes from')
    expect(container.querySelectorAll('[data-key-number]').length).toBeLessThanOrEqual(3)
    const words = (container.textContent ?? '').replace(/([a-z?%)])([A-Z0-9])/g, '$1 $2').split(/\s+/).filter(Boolean)
    expect(words.length, words.join(' ')).toBeLessThanOrEqual(180)
  })
})
