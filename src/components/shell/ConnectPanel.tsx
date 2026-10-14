import { Button } from '@/components/ui/button'

export interface ConnectPanelProps {
  title: string
  body: string
  busy: boolean
  connectLabel: string
  error: string | null
  onConnect: (() => void) | null
  onEditOffline: () => void
}

export const ConnectPanel = ({
  title,
  body,
  busy,
  connectLabel,
  error,
  onConnect,
  onEditOffline,
}: ConnectPanelProps) => (
  <section className="max-w-[560px] px-4 py-8 sm:px-8 sm:py-10">
    <h1 className="mb-2 text-[22px] font-bold text-ui-ink">{title}</h1>
    <p className="mb-6 text-[14px] leading-[1.6] text-ui-muted">{body}</p>
    <div className="flex flex-wrap gap-2">
      {onConnect !== null && (
        <Button onClick={onConnect} disabled={busy}>
          {connectLabel}
        </Button>
      )}
      <Button variant="outline" onClick={onEditOffline}>
        Edit offline
      </Button>
    </div>
    {error !== null && (
      <p role="alert" className="mt-4 text-[13px] text-ui-danger">
        {error}
      </p>
    )}
  </section>
)
