import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * The last line of defense against a render crash. Without this, an
 * uncaught error anywhere in the tree unmounts React entirely and leaves a
 * blank white page — the worst possible failure mode for a mental-health
 * product mid-session. Catches render/lifecycle errors only (React's own
 * contract): it cannot catch errors from event handlers, async code, or
 * effects, which is why individual features still need their own
 * try/catch where they call anything that can fail.
 *
 * `onError` is the seam for a real error-reporting service (Sentry or
 * equivalent) once one exists; today it only logs, since there is nothing
 * to report to yet.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background-default px-24 text-center">
      <span className="flex size-64 items-center justify-center rounded-full bg-background-elevated text-icon-default">
        <AlertTriangle size={24} />
      </span>
      <div className="flex flex-col gap-8">
        <h1 className="text-style-title text-text-primary">Something went wrong</h1>
        <p className="text-style-body-small max-w-[320px] text-text-secondary">
          This screen hit an error and couldn't finish loading. Your other tabs and any
          session you were building are unaffected.
        </p>
      </div>
      <div className="mt-8 flex gap-12">
        <Button variant="secondary" onClick={() => window.location.assign('/home')}>
          Go home
        </Button>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  )
}
