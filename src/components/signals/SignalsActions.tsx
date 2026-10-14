import type { SignalDef } from '@canshift/core'
import { SignalsAction } from './SignalsToolbar'
import { XmlMenu } from './XmlMenu'
import { downloadFile } from '../../lib/download'
import {
  PROFILE_XML_ACCEPT,
  PROFILE_XML_MIME,
  profileXmlFilename,
  serializeProfileXml,
} from '../../lib/profile-xml'

export interface SignalsActionsProps {
  scanning: boolean
  canScan: boolean
  analysing: boolean
  onToggleScan: () => void
  onToggleAnalysis: () => void
  signals: readonly SignalDef[]
  profileLabel: string
  onImportXml: (fileName: string, xml: string) => void
}

const NO_BUS = 'Plug a dash in — simulation has no bus to listen to.'
const ANALYSE_TITLE = 'Sort, byte histograms and learn mode — for mapping an unknown ECU'

export const SignalsActions = (props: SignalsActionsProps) => {
  const download = () => {
    const xml = serializeProfileXml(props.signals)
    downloadFile(profileXmlFilename(props.profileLabel), PROFILE_XML_MIME, xml)
  }
  const importFile = (file: File) => {
    void file.text().then((xml) => {
      props.onImportXml(file.name, xml)
    })
  }

  return (
    <>
      <SignalsAction
        disabled={!props.canScan}
        title={props.canScan ? undefined : NO_BUS}
        onClick={props.onToggleScan}
      >
        {props.scanning ? 'Stop scan' : 'Scan bus'}
      </SignalsAction>
      <SignalsAction onClick={props.onToggleAnalysis} title={ANALYSE_TITLE}>
        {props.analysing ? 'Back to signals' : 'Analyse'}
      </SignalsAction>
      <XmlMenu accept={PROFILE_XML_ACCEPT} onImport={importFile} onDownload={download} />
    </>
  )
}
