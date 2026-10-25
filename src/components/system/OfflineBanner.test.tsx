import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value)
  window.dispatchEvent(new Event(value ? 'online' : 'offline'))
}

describe('OfflineBanner', () => {
  it('renders nothing while online', () => {
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('says so when offline, then "Back online" briefly when the connection returns', () => {
    vi.useFakeTimers()
    render(<OfflineBanner />)
    act(() => setOnline(false))
    expect(screen.getByRole('status').textContent).toContain('You’re offline')
    act(() => setOnline(true))
    expect(screen.getByRole('status').textContent).toContain('Back online')
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByRole('status')).toBeNull()
    vi.useRealTimers()
  })
})
