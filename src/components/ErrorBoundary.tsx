import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLogStore } from '../stores/log.store'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  scope?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const stack = info.componentStack ?? '(no component stack)'
    useLogStore
      .getState()
      .push('error', `Render crash: ${error.message}\n${stack}`, this.props.scope)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (error === null) return this.props.children

    if (this.props.fallback !== undefined) {
      return this.props.fallback(error, this.reset)
    }

    return <FallbackPanel error={error} onReset={this.reset} />
  }
}

interface FallbackPanelProps {
  error: Error
  onReset: () => void
}

const FallbackPanel = ({ error, onReset }: FallbackPanelProps) => {
  return (
    <div role="alert" className={PANEL}>
      <div className="text-[16px] font-semibold">Something went wrong</div>
      <div className="max-w-[480px] text-ui-muted">{error.message || 'Unknown render error'}</div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onReset} className={FALLBACK_BUTTON}>
          Try again
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.reload()
          }}
          className={FALLBACK_BUTTON}
        >
          Reload
        </button>
      </div>
      <details className="mt-3 max-w-[560px] text-ui-muted">
        <summary className="cursor-pointer text-[11px]">Details</summary>
        <pre className={STACK}>{error.stack ?? error.message}</pre>
      </details>
    </div>
  )
}

const PANEL = [
  'flex flex-1 flex-col items-center justify-center gap-3 p-6',
  'bg-bg text-center text-[13px] text-ui-ink',
  '[font-family:system-ui,sans-serif]',
].join(' ')

const FALLBACK_BUTTON = [
  'cursor-pointer border border-solid border-ui-line-strong',
  'bg-ui-panel px-3 py-1.5 text-[12px] text-ui-ink',
].join(' ')

const STACK = [
  'mt-2 whitespace-pre-wrap p-2 text-left text-[11px]',
  'border border-solid border-ui-line-strong bg-ui-panel',
].join(' ')
