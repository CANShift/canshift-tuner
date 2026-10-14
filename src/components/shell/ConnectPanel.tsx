import { Button } from '@/components/ui/button'

export interface ConnectPanelProps {
  busy: boolean
  connectLabel: string
  error: string | null
  onConnect: () => void
  onEditOffline: () => void
}

export const ConnectPanel = ({
  busy,
  connectLabel,
  error,
  onConnect,
  onEditOffline,
}: ConnectPanelProps) => (
  <section className="max-w-[560px] px-8 py-10">
    <h1 className="mb-2 text-[22px] font-bold text-ui-ink">Connect the dash</h1>
    <p className="mb-6 text-[14px] leading-[1.6] text-ui-muted">
      Plug the dash into this computer over USB-C, press Connect and pick its port. Edit offline
      opens a config without a board; burning stays disabled.
    </p>
    <div className="flex gap-2">
      <Button onClick={onConnect} disabled={busy}>
        {connectLabel}
      </Button>
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
