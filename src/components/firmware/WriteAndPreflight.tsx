import type { ReactNode } from 'react'
import type { FirmwareSelection } from '../../stores/firmware-selection.store'
import { formatBytes } from '../../lib/format'
import { Eyebrow } from '../ui/meta-text'
import { cn } from '@/lib/utils'

export interface WriteAndPreflightProps {
  selection: FirmwareSelection
}

const isWebSerialAvailable = (): boolean =>
  typeof navigator !== 'undefined' && 'serial' in navigator

const CheckRow = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <div className={cn(STAT_ROW, ok ? 'text-brand-text' : 'text-brand-neutral-700')}>
    <span className={cn('font-mono', ok ? 'text-brand-accent' : 'text-brand-neutral-500')}>
      {ok ? '✓' : '—'}
    </span>
    {children}
  </div>
)

export const WriteAndPreflight = ({ selection }: WriteAndPreflightProps) => {
  const hasBuild = selection.kind !== 'none'
  const webSerial = isWebSerialAvailable()

  return (
    <div className="grid grid-cols-2 border-b-2 border-brand-divider">
      <div className="flex flex-col gap-3 border-r border-brand-neutral-300 px-6 py-5">
        <Eyebrow>WHAT GETS WRITTEN</Eyebrow>
        <div className={cn(STAT_ROW, 'text-brand-text')}>
          <span className="size-[15px] shrink-0 border-2 border-brand-accent bg-brand-accent" />
          Firmware image — full flash, checksum-verified
        </div>
        <div className={cn(STAT_ROW, 'text-brand-neutral-700')}>
          <span className="size-[15px] shrink-0 border-2 border-brand-neutral-400" />
          Dashboard layout — burned separately via BURN TO DEVICE
        </div>
        <div className={cn(STAT_ROW, 'text-brand-neutral-700')}>
          <span className="size-[15px] shrink-0 border-2 border-brand-neutral-400" />
          User settings and logs — kept, never erased by the flasher
        </div>
      </div>
      <div className="flex flex-col gap-3 px-6 py-5">
        <Eyebrow>PRE-FLIGHT</Eyebrow>
        <CheckRow ok={webSerial}>
          {webSerial
            ? 'WebSerial available in this browser'
            : 'WebSerial unavailable — use Chrome or Edge'}
        </CheckRow>
        <CheckRow ok={hasBuild}>
          {hasBuild
            ? `Build ready — ${formatBytes(selection.firmware.size)}, sha256 ${selection.firmware.sha256.slice(0, 12)}…`
            : 'No build selected or downloaded yet'}
        </CheckRow>
        <CheckRow ok={false}>Hold BOOT on the back of the dash while starting the flash</CheckRow>
      </div>
    </div>
  )
}

const STAT_ROW = 'flex items-center gap-2.5 text-[13px]'
