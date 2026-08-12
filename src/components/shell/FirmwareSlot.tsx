import { cn } from '@/lib/utils'

export type FirmwareCompat =
  | { kind: 'unknown' }
  | { kind: 'compatible'; protocol: number }
  | { kind: 'mismatch'; expected: number; got: number; version: string }

export interface FirmwareSlotProps {
  version: string | null
  compat: FirmwareCompat
}

export const FirmwareSlot = ({ version, compat }: FirmwareSlotProps) => {
  if (compat.kind === 'mismatch') {
    return (
      <span
        className={cn(SLOT, 'cursor-help border border-destructive px-2 py-0.5 text-destructive')}
        title={`Tuner expects firmware major ${String(compat.expected)}.x — device reports ${compat.version}. Burn disabled until the firmware is updated.`}
      >
        fw v{compat.version} · mismatch
      </span>
    )
  }
  if (version) {
    return (
      <span className={cn(SLOT, 'inline')} title={`Firmware v${version}`}>
        fw v{version}
      </span>
    )
  }
  return (
    <span className={cn(SLOT, 'inline')} title="Firmware version — waiting for handshake">
      fw —
    </span>
  )
}

const SLOT = 'font-mono text-[11px] tracking-[0.04em] text-brand-neutral-600'
