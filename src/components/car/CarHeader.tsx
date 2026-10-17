import { useRef, type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { downloadFile } from '../../lib/download'
import {
  PROFILE_XML_ACCEPT,
  PROFILE_XML_MIME,
  profileXmlFilename,
  serializeProfileXml,
} from '../../lib/profile-xml'
import { useProfileChange } from '../../hooks/useProfileChange'
import { useCarLabel } from '../../hooks/useCarLabel'
import { useSignalStore } from '../../stores/signal.store'
import { UiIcon } from '../icons/UiIcons'
import { PendingCar } from './PendingCar'

const useDownload = () => {
  const signals = useSignalStore((s) => s.signals)
  const label = useCarLabel()
  return () => {
    downloadFile(profileXmlFilename(label), PROFILE_XML_MIME, serializeProfileXml(signals))
  }
}

interface XmlInputProps {
  inputRef: RefObject<HTMLInputElement | null>
  onXml: (fileName: string, xml: string) => void
}

const XmlInput = ({ inputRef, onXml }: XmlInputProps) => (
  <input
    ref={inputRef}
    type="file"
    accept={PROFILE_XML_ACCEPT}
    className="hidden"
    onChange={(event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file !== undefined) void file.text().then((xml) => onXml(file.name, xml))
    }}
  />
)

const C = STRINGS.car

interface CarActionsProps {
  onChange: () => void
  onImport: () => void
  onExport: () => void
}

const CarActions = ({ onChange, onImport, onExport }: CarActionsProps) => (
  <div className="ml-auto flex flex-wrap gap-2">
    <Button variant="secondary" onClick={onChange}>
      <span className="lg:hidden">{C.change}</span>
      <span className="max-lg:hidden">{C.changeCar}</span>
    </Button>
    <Button variant="outline" onClick={onImport} title={C.importXml}>
      <UiIcon name="upload" />
      {C.importShort}
    </Button>
    <Button variant="outline" onClick={onExport} title={C.downloadXml}>
      <UiIcon name="download" />
      {C.exportShort}
    </Button>
  </div>
)

export const CarHeader = ({ onChange }: { onChange: () => void }) => {
  const input = useRef<HTMLInputElement>(null)
  const profile = useProfileChange()
  const download = useDownload()
  const label = useCarLabel()
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-bold lg:text-[28px]">{C.yourCar}</h1>
        <span className="rounded-control bg-app-surface-2 px-2.5 py-1 text-sm text-app-secondary">
          {label}
        </span>
        <CarActions
          onChange={onChange}
          onImport={() => input.current?.click()}
          onExport={download}
        />
      </div>
      <PendingCar profile={profile} onDone={() => undefined} />
      <XmlInput inputRef={input} onXml={profile.importXml} />
    </header>
  )
}
