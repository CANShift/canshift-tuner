import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useDeviceStore } from '../../stores/device.store'
import { useFirmwareStore } from '../../stores/firmware.store'
import { useConnection } from '../../hooks/useConnection'
import { UiIcon } from '../icons/UiIcons'
import { ConfirmInstallDialog } from './ConfirmInstallDialog'
import { FileSlot } from './FileSlot'

const F = STRINGS.firmware

const Files = () => {
  const bin = useFirmwareStore((s) => s.bin)
  const sig = useFirmwareStore((s) => s.sig)
  const chooseBin = useFirmwareStore((s) => s.chooseBin)
  const chooseSig = useFirmwareStore((s) => s.chooseSig)
  return (
    <div className="flex flex-col gap-2.5">
      <FileSlot
        label={F.binLabel}
        extension=".bin"
        chosen={bin?.name ?? null}
        onChoose={(file) => void chooseBin(file)}
      />
      <FileSlot
        label={F.sigLabel}
        extension=".sig"
        chosen={sig?.name ?? null}
        onChoose={(file) => void chooseSig(file)}
      />
    </div>
  )
}

const InstallAction = () => {
  const ready = useFirmwareStore((s) => s.bin !== null && s.sig !== null)
  const problem = useFirmwareStore((s) => s.problem)
  const ask = useFirmwareStore((s) => s.askToInstall)
  const connected = useConnection().connection === 'connected'
  return (
    <div className="mt-auto flex flex-col gap-2">
      {problem !== null && (
        <p role="alert" className="text-sm text-app-warning">
          {problem}
        </p>
      )}
      <Button
        className="h-[52px] text-base disabled:bg-app-surface-2 disabled:text-[#6b7178] disabled:opacity-100"
        disabled={!ready || !connected}
        onClick={ask}
      >
        {F.install}
      </Button>
      {!ready && <p className="text-center text-[13px] text-app-muted">{F.chooseBoth}</p>}
    </div>
  )
}

const FirmwareScreen = () => {
  const version = useDeviceStore((s) => s.firmwareVersion) ?? STRINGS.dash.unknownVersion
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-4 pt-2 lg:p-8">
        <Link
          to="/dash"
          className="inline-flex h-11 items-center gap-1 self-start text-[15px] text-app-secondary no-underline"
        >
          <UiIcon name="chevronLeft" />
          {STRINGS.tabs.dash}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{F.title}</h1>
          <p className="text-[15px] text-app-muted">{F.runs(version)}</p>
        </div>
        <p className="rounded-[12px] border border-app-border bg-app-surface px-3.5 py-3 text-sm leading-normal text-app-secondary">
          {F.downloadAhead}
        </p>
        <Files />
        <InstallAction />
      </div>
      <ConfirmInstallDialog />
    </div>
  )
}

export default FirmwareScreen
