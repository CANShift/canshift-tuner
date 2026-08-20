import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModelSelect } from '../components/firmware/ModelSelect'
import { FlashModeTabs, type FlashMode } from '../components/firmware/FlashModeTabs'
import { VersionRow } from '../components/firmware/VersionRow'
import { ChangelogPanel } from '../components/firmware/ChangelogPanel'
import { ErasePanel } from '../components/firmware/ErasePanel'
import { FlashProgressPanel } from '../components/firmware/FlashProgressPanel'
import { FlashDonePanel } from '../components/firmware/FlashDonePanel'
import { useFlashTarget } from '../hooks/useFlashTarget'
import { useFlashRun } from '../hooks/useFlashRun'
import { useFlashProgress } from '../hooks/useFlashProgress'
import { useFlasherStore } from '../stores/flasher.store'
import { provisionMessage, useProvisionBoardProfile } from '../hooks/useProvisionBoardProfile'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { useProjectStore } from '../stores/project/project.store'
import { useConnectionStore } from '../stores/connection.store'
import { parseChangelog } from '../lib/firmware/changelog'
import type { ErrorTransport } from '../stores/flasher.store'

type PaneState = FlashMode | 'running' | 'done'

const KICKER_BY_LINK: Record<'linked' | 'offline', string> = {
  linked: 'USB-C · TUNER LINK ACTIVE',
  offline: 'USB-C · BOOTLOADER READY',
}

const INTRO =
  'Firmware builds are per model, so pick the board first. The write takes about thirty seconds and the dash reboots into it on its own.'

const KEEPS_CONFIG = 'Keeps the config already on the board.'

const ERASE_UNAVAILABLE =
  'The erase itself is not wired up yet — it writes to the board in a way that has to be verified on real hardware before it ships.'

const RECOVERY_BY_TRANSPORT: Record<ErrorTransport, string> = {
  ota: 'The board is still running the firmware it had — an OTA write only takes effect once the whole image checks out, and no BOOT button is involved. Try again.',
  esptool:
    'A write that stops partway can leave the board half-flashed — hold BOOT, tap RESET, and flash again to recover it.',
  unknown: 'The board keeps whatever it had before the write started.',
}

const NOTICE = 'mb-8 border-l-[3px] border-l-ui-danger py-1 pl-3.5 text-[13px] text-ui-ink'

const FirmwareRoute = () => {
  const target = useFlashTarget()
  const run = useFlashRun({
    release: target.release,
    asset: target.build.asset,
    sha256: target.build.sha256,
    chip: target.build.chip,
  })
  const progress = useFlashProgress()
  const flasherState = useFlasherStore((s) => s.state)
  const provision = useProvisionBoardProfile()
  const { exportProjectFile } = useProjectFileActions()
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const status = useConnectionStore((s) => s.status)
  const navigate = useNavigate()
  const [mode, setMode] = useState<FlashMode>('flash')

  const entries = useMemo(
    () => parseChangelog(target.release?.notes ?? ''),
    [target.release?.notes]
  )

  const blocked = target.build.blocked ?? target.releasesError
  const running = flasherState.kind === 'flashing' || run.busy

  const paneState = (): PaneState => {
    if (flasherState.kind === 'success') return 'done'
    if (running) return 'running'
    return mode
  }

  const notice = (): string | null => {
    if (run.downloadError !== null) return `Could not fetch the build — ${run.downloadError}.`
    if (flasherState.kind !== 'error') return null
    const detail = flasherState.message.replace(/\.$/, '')
    return `The flash stopped — ${detail}. ${RECOVERY_BY_TRANSPORT[flasherState.transport]}`
  }

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null

  const exportConfig = () => {
    if (!activeProject) return
    exportProjectFile(activeProject.id, activeProject.name)
  }

  const changelog =
    target.release === null ? null : (
      <ChangelogPanel
        version={target.release.version}
        publishedAt={target.release.publishedAt}
        notesUrl={target.release.htmlUrl}
        entries={entries}
      />
    )

  const BODIES: Record<PaneState, ReactNode> = {
    flash: (
      <>
        <VersionRow
          options={target.versions}
          selectedTag={target.selectedTag}
          actionLabel={run.label}
          actionDisabled={blocked !== null || target.build.asset === null}
          actionTitle={blocked ?? undefined}
          note={blocked ?? KEEPS_CONFIG}
          rollback={target.rollback}
          onSelect={target.setSelectedTag}
          onAction={run.start}
        />
        {changelog}
      </>
    ),
    erase: (
      <ErasePanel
        available={false}
        unavailableNote={ERASE_UNAVAILABLE}
        canExport={activeProject !== null}
        onErase={() => undefined}
        onExportConfig={exportConfig}
      />
    ),
    running: <FlashProgressPanel progress={progress} />,
    done: (
      <FlashDonePanel
        outcome={`${target.release?.version ?? 'Firmware'} is on the board.`}
        provisionLabel={provision.canProvision ? 'Provision the board profile' : null}
        provisionNote={provisionMessage(provision.state)}
        onOpenDash={() => {
          void navigate('/dash')
        }}
        onFlashAnother={run.reset}
        onProvision={provision.provision}
      />
    ),
  }

  const message = notice()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="max-w-[720px] px-11 pb-[60px] pt-12">
          <p className="border-b-2 border-ui-rule pb-3 font-mono text-[10.5px] tracking-[0.2em] text-ui-muted">
            {KICKER_BY_LINK[status === 'connected' ? 'linked' : 'offline']}
          </p>
          <h1 className="mb-3 mt-6 text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ui-ink">
            Flash the board.
          </h1>
          <p className="mb-9 max-w-[46ch] text-pretty text-[15px] leading-[1.6] text-ui-muted">
            {INTRO}
          </p>

          <ModelSelect
            options={target.models}
            selectedId={target.modelId}
            detected={target.modelDetected}
            disabled={running}
            onSelect={target.setModelId}
          />

          <FlashModeTabs mode={mode} onMode={setMode} />

          {message !== null && <p className={NOTICE}>{message}</p>}

          {BODIES[paneState()]}
        </div>
      </div>
    </div>
  )
}

export default FirmwareRoute
