import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { RequireAuth } from './RequireAuth'

function Login() {
  return <p>login page</p>
}

function Home() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/sessions')}>
      open sessions
    </button>
  )
}

function app(initial: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/sessions"
            element={
              <RequireAuth>
                <p>secret sessions</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RequireAuth', () => {
  it('answers a forced, signed-out address with the 404 page and a Sign in link', () => {
    app('/sessions')
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(screen.queryByText('secret sessions')).toBeNull()
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login')
  })

  it('sends someone navigating inside the app to sign-in instead', () => {
    app('/home')
    act(() => fireEvent.click(screen.getByRole('button', { name: 'open sessions' })))
    expect(screen.getByText('login page')).toBeTruthy()
  })
})
