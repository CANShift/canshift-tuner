import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DEFAULT_SCREEN_PROFILE_ID } from '@canshift/core'
import { WelcomeScreen } from '../components/shell/WelcomeScreen'
import { NewProjectWizard } from '../components/project/NewProjectWizard'
import { useConnectionStore } from '../stores/connection.store'
import { useDeviceStore } from '../stores/device.store'
import { useProjectStore } from '../stores/project/project.store'
import { useLogStore } from '../stores/log.store'
import { useBenchEntries } from '../hooks/useBenchEntries'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { buildNewProjectDashboard } from '../lib/new-project'
import { PROJECT_FILE_ACCEPT } from '../lib/project-file'
import { humanizeTransportError } from '../transport/humanize-transport-error'

const SUPPORT_EMAIL = 'support@canshift.app'

const isWebSerialAvailable = (): boolean =>
  typeof navigator !== 'undefined' && 'serial' in navigator

const buildSupportMailto = (lastError: string | null): string => {
  const subject = encodeURIComponent('CANShift Tuner — issue report')
  const lines = [
    'Hi,',
    '',
    "I'm running into an issue with CANShift Tuner. Here are the details:",
    '',
    `- Browser: ${navigator.userAgent}`,
    `- Status when reporting: ${lastError ?? '—'}`,
    `- Tuner version: ${typeof __TUNER_VERSION__ !== 'undefined' ? __TUNER_VERSION__ : 'unknown'}`,
    '',
    'What happened:',
    '',
    '',
    'What I expected:',
    '',
    '',
    'Thanks!',
  ]
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`
}

const LINK = 'text-brand-neutral-600 no-underline hover:text-brand-accent'

const WelcomeRoute = () => {
  const status = useConnectionStore((s) => s.status)
  const lastError = useConnectionStore((s) => s.lastError)
  const connect = useConnectionStore((s) => s.connect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const enterSimulation = useDeviceStore((s) => s.enterSimulation)
  const switchProject = useProjectStore((s) => s.switchProject)
  const createProject = useProjectStore((s) => s.createProject)
  const log = useLogStore((s) => s.push)
  const navigate = useNavigate()
  const entries = useBenchEntries()
  const { fileInputRef, exportProjectFile, openImportPicker, handleImportChange } =
    useProjectFileActions()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [now] = useState(() => Date.now())

  if (status === 'connected' || simulationMode) {
    return <Navigate to="/dashboard" replace />
  }

  const resume = (id: string) => {
    if (!switchProject(id)) {
      log('error', 'Could not open that config.')
      return
    }
    void navigate('/dashboard')
  }

  const startFromPageSet = (pageSetId: string) => {
    const name = pageSetId.charAt(0).toUpperCase() + pageSetId.slice(1)
    createProject(
      name,
      buildNewProjectDashboard({
        name,
        targetProfile: DEFAULT_SCREEN_PROFILE_ID,
        pageSetId,
      })
    )
    void navigate('/dashboard')
  }

  const newest = entries[0] ?? null

  return (
    <>
      <WelcomeScreen
        entries={entries}
        now={now}
        supported={isWebSerialAvailable()}
        busy={status === 'connecting' || status === 'reconnecting'}
        reconnecting={status === 'reconnecting'}
        lastError={lastError !== null ? humanizeTransportError(lastError) : null}
        onConnect={() => {
          void connect()
        }}
        onExploreSimulation={() => {
          enterSimulation()
        }}
        onResume={resume}
        onNewConfig={() => {
          setWizardOpen(true)
        }}
        onStartFromPageSet={startFromPageSet}
        onExport={() => {
          exportProjectFile(newest?.id ?? null, newest?.name ?? '')
        }}
        onImport={openImportPicker}
        footerLinks={
          <>
            <Link to="/about" className={LINK}>
              About
            </Link>
            <span className="text-brand-neutral-500">·</span>
            <a
              href="https://canshift.app/user-guide/install/boot-issues/"
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              Troubleshooting
            </a>
            <span className="text-brand-neutral-500">·</span>
            <a href={buildSupportMailto(lastError)} className={LINK}>
              Report a problem
            </a>
          </>
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
      <NewProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  )
}

export default WelcomeRoute
