import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { DeviceSection } from './DeviceSection'
import { INSTALLED_MESSAGES } from '../../lib/firmware-restart'
import { useDeviceStore } from '../../stores/device.store'
import {
  useFirmwareUpdate,
  type FirmwareUpdateState,
  type PickedImage,
} from '../../hooks/useFirmwareUpdate'

const BYTES_PER_KB = 1024
const NOT_LINKED = 'Connect the dash to install an update.'
const INSTALLABLE = new Set<FirmwareUpdateState['kind']>(['ready', 'failed'])

const sizeLabel = (bytes: number): string => `${String(Math.round(bytes / BYTES_PER_KB))} KB`

const STATUS: Record<FirmwareUpdateState['kind'], (state: FirmwareUpdateState) => string> = {
  empty: () => 'Download the signed firmware .bin from the release, then choose it here.',
  invalid: (state) => (state.kind === 'invalid' ? state.message : ''),
  ready: () => 'The dash checks the image, writes it to its spare slot and restarts into it.',
  installing: () => 'Installing — keep the dash powered and this page open.',
  installed: (state) => (state.kind === 'installed' ? INSTALLED_MESSAGES[state.link] : ''),
  failed: (state) => (state.kind === 'failed' ? state.message : ''),
}

const STATUS_TONE: Record<FirmwareUpdateState['kind'], string> = {
  empty: 'text-ui-faint',
  invalid: 'text-ui-danger',
  ready: 'text-ui-faint',
  installing: 'text-ui-ink',
  installed: 'text-ui-ok',
  failed: 'text-ui-danger',
}

const useLinked = (): boolean => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  return connected && !simulationMode
}

const RunningVersion = () => {
  const version = useDeviceStore((s) => s.firmwareVersion)
  return (
    <p className="mt-3.5 text-[13px] text-ui-muted">
      Running <span className="font-mono text-ui-ink">{version ?? '—'}</span>
    </p>
  )
}

const PickedSummary = ({ image }: { image: PickedImage }) => (
  <p className="text-[13px] text-ui-muted">
    <span className="font-mono text-ui-ink">{image.name}</span> ·{' '}
    {sizeLabel(image.bytes.byteLength)} · version{' '}
    <span className="font-mono text-ui-ink">{image.info.version}</span>
  </p>
)

const InstallProgress = ({ state }: { state: FirmwareUpdateState }) => {
  if (state.kind !== 'installing') return null
  const total = state.image.bytes.byteLength
  return (
    <progress
      value={state.sent}
      max={total}
      aria-label="Firmware upload"
      className="h-2 w-full appearance-none bg-ui-panel [&::-moz-progress-bar]:bg-ui-accent [&::-webkit-progress-bar]:bg-ui-panel [&::-webkit-progress-value]:bg-ui-accent"
    />
  )
}

const FilePicker = ({ disabled, onPick }: { disabled: boolean; onPick: (file: File) => void }) => {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        Choose .bin…
      </Button>
      <input
        ref={input}
        type="file"
        accept=".bin,application/octet-stream"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onPick(file)
          event.target.value = ''
        }}
      />
    </>
  )
}

export const FirmwareUpdateSection = () => {
  const { state, pick, install } = useFirmwareUpdate()
  const linked = useLinked()
  const installing = state.kind === 'installing'
  const canInstall = linked && INSTALLABLE.has(state.kind)
  const image = 'image' in state ? state.image : null

  return (
    <DeviceSection title="FIRMWARE UPDATE">
      <RunningVersion />
      <div className="mt-4 flex flex-col gap-3">
        {image !== null && <PickedSummary image={image} />}
        <InstallProgress state={state} />
        <p className={`text-[13px] ${STATUS_TONE[state.kind]}`}>
          {linked ? STATUS[state.kind](state) : NOT_LINKED}
        </p>
        <div className="flex gap-2">
          <FilePicker disabled={installing} onPick={pick} />
          <Button size="sm" disabled={!canInstall} onClick={install}>
            Install
          </Button>
        </div>
      </div>
    </DeviceSection>
  )
}
