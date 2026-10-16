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

export const XmlCard = () => {
  const input = useRef<HTMLInputElement>(null)
  const profile = useProfileChange()
  const download = useDownload()
  return (
    <div className="flex flex-col gap-3 p-3.5 lg:p-5">
      <PendingCar profile={profile} onDone={() => undefined} />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => input.current?.click()}>
          <UiIcon name="upload" />
          {STRINGS.car.importXml}
        </Button>
        <Button variant="outline" onClick={download}>
          <UiIcon name="download" />
          {STRINGS.car.downloadXml}
        </Button>
      </div>
      <XmlInput inputRef={input} onXml={profile.importXml} />
    </div>
  )
}
