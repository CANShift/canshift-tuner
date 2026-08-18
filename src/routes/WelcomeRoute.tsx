import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_SCREEN_PROFILE_ID } from '@canshift/core'
import { WelcomePane } from '../components/welcome/WelcomePane'
import { FirmwareUpdateBand } from '../components/welcome/FirmwareUpdateBand'
import { useConnectionStore } from '../stores/connection.store'
import { useDeviceStore } from '../stores/device.store'
import { useProjectStore } from '../stores/project/project.store'
import { useLogStore } from '../stores/log.store'
import { useBenchEntries } from '../hooks/useBenchEntries'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { useFirmwareUpdate } from '../hooks/useFirmwareUpdate'
import { buildNewProjectDashboard, BLANK_PAGE_SET, DEFAULT_PAGE_SET } from '../lib/new-project'
import { PROJECT_FILE_ACCEPT } from '../lib/project-file'
import { humanizeTransportError } from '../transport/humanize-transport-error'

type ConnectionStatus = ReturnType<typeof useConnectionStore.getState>['status']

const STATUS_KICKER: Record<ConnectionStatus, string> = {
  connected: 'DASH CONNECTED',
  connecting: 'OPENING THE PORT',
  reconnecting: 'RECONNECTING',
  disconnected: 'NO DEVICE CONNECTED',
}

const CONNECT_LABEL: Record<ConnectionStatus, string> = {
  connected: 'CONNECT',
  connecting: 'CONNECTING…',
  reconnecting: 'RECONNECTING…',
  disconnected: 'CONNECT',
}

const SIMULATION_KICKER = 'SIMULATION · NO BOARD'

const isWebSerialAvailable = (): boolean =>
  typeof navigator !== 'undefined' && 'serial' in navigator

const WelcomeRoute = () => {
  const status = useConnectionStore((s) => s.status)
  const lastError = useConnectionStore((s) => s.lastError)
  const connect = useConnectionStore((s) => s.connect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const enterSimulation = useDeviceStore((s) => s.enterSimulation)
  const switchProject = useProjectStore((s) => s.switchProject)
  const createProject = useProjectStore((s) => s.createProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const log = useLogStore((s) => s.push)
  const navigate = useNavigate()
  const entries = useBenchEntries()
  const { fileInputRef, exportProjectFile, handleImportChange } = useProjectFileActions()
  const update = useFirmwareUpdate()
  const [updateDismissed, setUpdateDismissed] = useState(false)

  const open = (id: string) => {
    if (!switchProject(id)) {
      log('error', 'Could not open that config.')
      return
    }
    void navigate('/dash')
  }

  const start = (pageSetId: string, name: string) => {
    createProject(
      name,
      buildNewProjectDashboard({ name, targetProfile: DEFAULT_SCREEN_PROFILE_ID, pageSetId })
    )
    void navigate('/dash')
  }

  const remove = (id: string) => {
    if (deleteProject(id)) return
    log('error', 'Could not delete that config.')
  }

  const busy = status === 'connecting' || status === 'reconnecting'

  return (
    <>
      <WelcomePane
        kicker={simulationMode ? SIMULATION_KICKER : STATUS_KICKER[status]}
        entries={entries}
        firstRun={entries.length === 0}
        supported={isWebSerialAvailable()}
        busy={busy}
        connectLabel={CONNECT_LABEL[status]}
        lastError={lastError !== null ? humanizeTransportError(lastError) : null}
        onConnect={() => {
          void connect()
        }}
        onEditOffline={enterSimulation}
        onStartFromDefaults={() => {
          start(DEFAULT_PAGE_SET, 'CANShift')
        }}
        onStartBlank={() => {
          start(BLANK_PAGE_SET, 'New config')
        }}
        onOpen={open}
        onExport={exportProjectFile}
        onDelete={remove}
        updateBand={
          update !== null && !updateDismissed ? (
            <FirmwareUpdateBand
              current={update.current}
              latest={update.latest}
              notesUrl={update.notesUrl}
              onGoToFlash={() => {
                void navigate('/flash')
              }}
              onDismiss={() => {
                setUpdateDismissed(true)
              }}
            />
          ) : null
        }
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_FILE_ACCEPT}
        onChange={(event) => {
          void handleImportChange(event)
        }}
        className="hidden"
      />
    </>
  )
}

export default WelcomeRoute
