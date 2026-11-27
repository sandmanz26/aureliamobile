import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { buyerSummary } from '../../data/reportSummaries'
import { DetailDrawerProvider } from './DetailDrawer'
import { SummaryBlock } from './ReportSummary'

// B6 (U146, J206): the Buyer agent report's Summary tab says it in 150 words or fewer.
describe('buyer agent summary', () => {
  it('is 150 words or fewer in its compact form', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailDrawerProvider>
          <SummaryBlock s={buyerSummary()} compact />
        </DetailDrawerProvider>
      </MemoryRouter>,
    )
    const words = (container.textContent ?? '').replace(/([a-z?%)])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean)
    expect(words.length, words.join(' ')).toBeLessThanOrEqual(150)
  })
})
