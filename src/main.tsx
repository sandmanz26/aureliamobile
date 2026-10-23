import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import { installErrorReporting } from './lib/monitoring'
import { queryClient } from './lib/queryClient'
import { applyVersion, readVersion } from './versions/versions'

// Dev-only: the React Query devtools never reach a production bundle.
const QueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null

installErrorReporting()
applyVersion(readVersion())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {QueryDevtools && (
          <Suspense fallback={null}>
            <QueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
