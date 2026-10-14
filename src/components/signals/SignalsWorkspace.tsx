import { useMemo } from 'react'
import { CanSignalTable } from './CanSignalTable'
import { LivePlot } from '../live-data/LivePlot'
import { BusSilentNotice } from '../states/BusSilentNotice'
import { NoEcuProfileState } from '../states/NoEcuProfileState'
import { useSignalStore } from '../../stores/signal.store'
import { useSignalUsage } from '../../hooks/useSignalUsage'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { useVisibleFrames } from '../../hooks/useVisibleSignals'
import { useSignalSelection } from '../../hooks/useLiveView'
import type { LiveSession } from '../../hooks/useLiveSession'
import { useRenameFrame } from '../../hooks/useRenameFrame'
import { PROFILE_SELECT_ID } from './SignalsToolbar'

const DEFAULT_PLOTTED = 3

const PANES =
  'min-h-0 flex-1 overflow-y-auto min-[1100px]:grid min-[1100px]:grid-cols-[minmax(0,720px)_minmax(0,1fr)] min-[1100px]:grid-rows-[minmax(0,1fr)] min-[1100px]:overflow-hidden'

export interface SignalsWorkspaceProps {
  session: LiveSession
  filter: string
  hideUnused: boolean
  onCaptureBus: () => void
}

const useDefaultPlotted = (): string[] => {
  const signals = useSignalStore((s) => s.signals)
  const usage = useSignalUsage()
  return useMemo(
    () =>
      signals
        .filter((signal) => usage.has(signal.name))
        .slice(0, DEFAULT_PLOTTED)
        .map((s) => s.name),
    [signals, usage]
  )
}

interface PlotPaneProps {
  plotted: readonly string[]
  session: LiveSession
}

const PlotPane = ({ plotted, session }: PlotPaneProps) => (
  <aside className="border-b border-ui-line p-3 md:p-4 min-[1100px]:sticky min-[1100px]:top-0 min-[1100px]:self-start min-[1100px]:border-b-0 min-[1100px]:border-l">
    <LivePlot
      selected={plotted}
      samples={session.history}
      className="h-[120px] min-[1100px]:h-[40vh]"
    />
  </aside>
)

type TablePaneProps = Omit<SignalsWorkspaceProps, 'onCaptureBus'> & {
  plotted: readonly string[]
  onTogglePlot: (name: string) => void
}

const TablePane = ({ session, filter, hideUnused, plotted, onTogglePlot }: TablePaneProps) => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const renameFrame = useRenameFrame()
  const usage = useSignalUsage()
  const units = useDisplayUnits()
  const frames = useVisibleFrames(signals, usage, filter, hideUnused)
  return (
    <div className="min-[1100px]:min-h-0 min-[1100px]:flex-1 min-[1100px]:overflow-y-auto">
      <CanSignalTable
        frames={frames}
        values={session.values}
        usage={usage}
        units={units}
        onPatch={updateSignal}
        onRenameFrame={renameFrame}
        plotted={plotted}
        onTogglePlot={onTogglePlot}
      />
    </div>
  )
}

const focusProfileSelect = (): void => {
  document.getElementById(PROFILE_SELECT_ID)?.focus()
}

const SignalsPanes = (props: Omit<SignalsWorkspaceProps, 'onCaptureBus'>) => {
  const { selected, toggle } = useSignalSelection(useDefaultPlotted())
  return (
    <div className={PANES}>
      <div className="min-[1100px]:order-2 min-[1100px]:min-h-0">
        <PlotPane plotted={selected} session={props.session} />
      </div>
      <div className="min-[1100px]:order-1 min-[1100px]:flex min-[1100px]:min-h-0 min-[1100px]:flex-col">
        <TablePane {...props} plotted={selected} onTogglePlot={toggle} />
      </div>
    </div>
  )
}

export const SignalsWorkspace = ({ onCaptureBus, ...panes }: SignalsWorkspaceProps) => {
  const hasSignals = useSignalStore((s) => s.signals.length > 0)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BusSilentNotice />
      {hasSignals ? (
        <SignalsPanes {...panes} />
      ) : (
        <NoEcuProfileState
          className="mx-4 my-6 max-w-[560px]"
          onPickProfile={focusProfileSelect}
          onCaptureBus={onCaptureBus}
        />
      )}
    </div>
  )
}
