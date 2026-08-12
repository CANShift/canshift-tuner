import type { SignalDef } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { RoutePanel } from '../ui/route-shell'
import { TABLE_HEAD_CELL, TABLE_SHELL } from '../ui/table'

export interface SignalPreviewTableProps {
  signals: readonly SignalDef[]
  boundTo: ReadonlyMap<string, string>
  warnings?: readonly string[]
}

const cell = cva(
  [
    'overflow-hidden text-ellipsis whitespace-nowrap tabular-nums',
    'border-b border-brand-neutral-300 py-3 pl-0 pr-5',
    'font-mono text-[13px] text-brand-text',
  ].join(' '),
  {
    variants: {
      tone: {
        default: '',
        id: 'text-brand-accent',
        dim: 'text-brand-neutral-600',
        bound: 'font-sans text-[12px]',
        unbound: 'font-sans text-[12px] text-brand-neutral-500',
      },
      first: {
        true: 'pl-5',
        false: '',
      },
    },
    defaultVariants: { tone: 'default', first: false },
  }
)

export const signalRowKey = (signal: SignalDef, index: number): string =>
  `${String(index)}:${signal.name}`

export const SignalPreviewTable = ({
  signals,
  boundTo,
  warnings = [],
}: SignalPreviewTableProps) => {
  if (signals.length === 0 && warnings.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-brand-neutral-500">
        No signals to preview.
      </div>
    )
  }

  return (
    <RoutePanel>
      {warnings.length > 0 && (
        <div className="mx-5 mt-3 border border-brand-accent bg-[color-mix(in_srgb,hsl(var(--brand-accent))_8%,transparent)] px-3 py-2.5">
          <div className="mb-1.5 text-[10px] font-extrabold tracking-[0.18em] text-brand-accent">
            {warnings.length} parser warning{warnings.length === 1 ? '' : 's'}
          </div>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {warnings.map((w, i) => (
              <li key={i} className="font-mono text-[12px] text-brand-neutral-700">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className={TABLE_SHELL}>
          <colgroup>
            <col className="w-40" />
            <col className="w-24" />
            <col className="w-[84px]" />
            <col className="w-[84px]" />
            <col className="w-[84px]" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={cn(TABLE_HEAD_CELL, 'pl-5')}>SIGNAL</th>
              <th className={TABLE_HEAD_CELL}>CAN ID</th>
              <th className={TABLE_HEAD_CELL}>BYTES</th>
              <th className={TABLE_HEAD_CELL}>SCALE</th>
              <th className={TABLE_HEAD_CELL}>UNIT</th>
              <th className={TABLE_HEAD_CELL}>BOUND TO</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s, i) => {
              const bound = boundTo.get(s.name) ?? null
              return (
                <tr key={signalRowKey(s, i)}>
                  <td className={cn(cell({ first: true }))}>{s.name}</td>
                  <td className={cn(cell({ tone: 'id' }))}>{s.canFrameId}</td>
                  <td className={cn(cell({ tone: 'dim' }))}>
                    {formatBytes(s.startByte, s.byteLength)}
                  </td>
                  <td className={cn(cell({ tone: 'dim' }))}>{formatNumber(s.scale)}</td>
                  <td className={cn(cell({ tone: 'dim' }))}>{s.unit || '—'}</td>
                  <td className={cn(cell({ tone: bound ? 'bound' : 'unbound' }))}>
                    {bound ?? 'not bound'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </RoutePanel>
  )
}

const formatBytes = (start: number, length: number): string =>
  length <= 1 ? String(start) : `${String(start)}–${String(start + length - 1)}`

const formatNumber = (n: number): string => {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(3).replace(/\.?0+$/, '')
}
