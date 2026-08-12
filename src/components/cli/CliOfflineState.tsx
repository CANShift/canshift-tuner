import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useConnectionStore } from '../../stores/connection.store'
import { KNOWN_OPCODES } from '../../transport'
import { cn } from '@/lib/utils'

const formatHex = (id: number): string => `0x${id.toString(16).toUpperCase().padStart(2, '0')}`

export const CliOfflineState = () => {
  const status = useConnectionStore((s) => s.status)
  const connect = useConnectionStore((s) => s.connect)
  const [opcodesOpen, setOpcodesOpen] = useState(false)

  const busy = status === 'connecting' || status === 'reconnecting'

  return (
    <div className="flex min-h-0 flex-1 flex-col items-stretch gap-5 overflow-auto">
      <div className="flex flex-col items-center gap-3 px-4 pb-8 pt-12 text-center">
        <div className="text-[16px] font-semibold text-text">No device connected</div>
        <div className="max-w-[360px] text-[13px] text-text-dim">
          Connect a device to send raw firmware commands over USB.
        </div>
        <Button
          type="button"
          onClick={() => {
            void connect()
          }}
          disabled={busy}
        >
          {busy ? (status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…') : 'Connect device'}
        </Button>
      </div>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text"
          onClick={() => {
            setOpcodesOpen((v) => !v)
          }}
          aria-expanded={opcodesOpen}
        >
          <span>Known opcodes ({String(KNOWN_OPCODES.length)})</span>
          <span
            className={cn(
              'inline-block text-[11px] text-text-dim transition-transform duration-[120ms]',
              opcodesOpen ? 'rotate-90' : 'rotate-0'
            )}
            aria-hidden="true"
          >
            ▸
          </span>
        </button>
        {opcodesOpen && (
          <table className="mt-3 w-full border-collapse text-[12px] text-text">
            <thead>
              <tr>
                <th className={TH}>Hex</th>
                <th className={TH}>Name</th>
                <th className={TH}>Description</th>
              </tr>
            </thead>
            <tbody>
              {KNOWN_OPCODES.map((op) => (
                <tr key={op.id}>
                  <td className={cn(TD, 'whitespace-nowrap font-mono text-accent')}>
                    {formatHex(op.id)}
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap font-mono')}>{op.name}</td>
                  <td className={cn(TD, 'text-text-dim')}>{op.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const TH =
  'border-b border-border px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.04em] text-text-dim'

const TD = 'border-b border-border/50 px-2.5 py-1.5'
