import { useDeviceStore } from '../../stores/device.store'
import { useBurnDashboard } from '../../hooks/useBurnDashboard'

const KEPT_PREVIOUS = 'The dash kept its previous config.'

const RETRY_BUTTON =
  'cursor-pointer whitespace-nowrap border-0 bg-ui-accent px-4 py-[9px] text-left text-[12.5px] font-extrabold tracking-[0.08em] text-white hover:bg-ui-accent-hover disabled:cursor-not-allowed disabled:opacity-60'

const DISMISS_BUTTON =
  'cursor-pointer whitespace-nowrap border border-ui-line-strong bg-transparent px-4 py-[9px] text-[12.5px] font-bold text-ui-muted hover:text-ui-ink'

const NoticeActions = ({ onDismiss }: { onDismiss: () => void }) => {
  const { canBurn, requestBurn } = useBurnDashboard()
  return (
    <div className="ml-auto flex gap-px">
      <button type="button" onClick={requestBurn} disabled={!canBurn} className={RETRY_BUTTON}>
        RETRY
      </button>
      <button type="button" onClick={onDismiss} className={DISMISS_BUTTON}>
        Dismiss
      </button>
    </div>
  )
}

export const BurnFailureNotice = () => {
  const lastBurnResult = useDeviceStore((s) => s.lastBurnResult)
  const setLastBurnResult = useDeviceStore((s) => s.setLastBurnResult)
  if (lastBurnResult === null || lastBurnResult.kind !== 'error') return null
  const { failure } = lastBurnResult
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-4 border-t-[3px] border-ui-accent bg-ui-panel px-5 py-3.5">
      <span className="whitespace-nowrap font-mono text-[10.5px] tracking-[0.16em] text-ui-accent">
        BURN FAILED
      </span>
      <span className="font-mono text-[13px] text-ui-ink">{failure.kicker}</span>
      <span className="text-[13.5px] text-ui-muted">{failure.body}</span>
      <span className="text-[13.5px] text-ui-muted">{KEPT_PREVIOUS}</span>
      <NoticeActions onDismiss={() => setLastBurnResult(null)} />
    </div>
  )
}
