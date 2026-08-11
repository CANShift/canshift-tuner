import { BoardPicker } from '../components/board-config/BoardPicker'
import { CustomBoardBuilder } from '../components/board-config/CustomBoardBuilder'
import { useResolvedBoardProfile } from '../hooks/useResolvedBoardProfile'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RoutePage } from '../components/ui/route-shell'
import { MetaText } from '../components/ui/meta-text'

const BoardConfigRoute = () => {
  const resolved = useResolvedBoardProfile()

  return (
    <RoutePage>
      <RouteHeader
        title="Board configuration"
        action={<MetaText>select a known board, or define your own</MetaText>}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 overflow-y-auto p-6">
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-xs font-extrabold tracking-[0.06em] text-brand-text">Pick a board</h2>
          <BoardPicker />
          {resolved && (
            <div className="border border-success">
              <div className="border-b border-brand-neutral-200 px-3 py-2 text-xs font-semibold text-brand-text">
                Resolved profile — {resolved.profile.boardName} ({resolved.source})
              </div>
              <pre className="m-0 max-h-[220px] overflow-auto p-3 font-mono text-[11px] leading-normal text-brand-neutral-700">
                {resolved.blob}
              </pre>
            </div>
          )}
        </section>
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-xs font-extrabold tracking-[0.06em] text-brand-text">
            Define a custom board
          </h2>
          <CustomBoardBuilder />
        </section>
      </div>
    </RoutePage>
  )
}

export default BoardConfigRoute
