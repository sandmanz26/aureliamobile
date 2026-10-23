import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount whatever a component test rendered, and start every test with
// empty storage, so tests cannot leak into each other.
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
