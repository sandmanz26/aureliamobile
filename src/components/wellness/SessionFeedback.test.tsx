import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SessionFeedback } from './SessionFeedback'

describe('SessionFeedback', () => {
  it('keeps Send disabled until something is typed, then thanks the user', () => {
    render(<SessionFeedback sessionKey="t1" />)
    const send = screen.getByRole('button', { name: 'Send feedback' })
    expect(send).toHaveProperty('disabled', true)
    fireEvent.change(screen.getByLabelText('How is the experience?'), { target: { value: 'Lovely' } })
    expect(send).toHaveProperty('disabled', false)
    fireEvent.click(send)
    expect(screen.getByText('Thank you for your feedback')).toBeTruthy()
  })

  it('answers the face that was picked, not always the happy one', () => {
    render(<SessionFeedback sessionKey="t2" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Unpleasant' }))
    expect(screen.getByText('Sorry it didn’t land')).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: 'Very pleasant' }))
    expect(screen.getByText('Glad to hear it!')).toBeTruthy()
  })

  it('remembers answers per session for the visit', () => {
    const { unmount } = render(<SessionFeedback sessionKey="t3" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Neutral' }))
    unmount()
    render(<SessionFeedback sessionKey="t3" />)
    expect(screen.getByRole('radio', { name: 'Neutral' }).getAttribute('aria-checked')).toBe('true')
  })
})
