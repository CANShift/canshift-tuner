import { Button } from '@/components/ui/button'
import type { ShownComparison } from '../../lib/sync/compare-dash'
import { STRINGS } from '../../strings'
import { useConnectionStore } from '../../stores/connection.store'
import { pullFromDash } from '../../stores/sync/draft'
import { useSyncStore } from '../../stores/sync/sync.store'

interface DashCompareBannerProps {
  comparison: ShownComparison
}

const CAN_PULL: Record<ShownComparison, boolean> = {
  projectNewer: true,
  deviceNewer: false,
  differentProject: true,
  deviceEmpty: false,
}

const dismiss = (): void => {
  useSyncStore.getState().setComparison(null)
}

const DashCompareBanner = ({ comparison }: DashCompareBannerProps) => (
  <div
    role="status"
    className="m-4 flex flex-wrap items-center gap-4 rounded-[12px] border border-app-border bg-app-surface px-5 py-4 text-[15px] leading-snug lg:mx-8 lg:mt-6"
  >
    <span className="min-w-0 flex-[1_1_300px]">{STRINGS.sync.compared[comparison]}</span>
    <div className="flex gap-2">
      {CAN_PULL[comparison] && <Button onClick={pullFromDash}>{STRINGS.sync.pull}</Button>}
      <Button variant="outline" onClick={dismiss}>
        {STRINGS.refused.notNow}
      </Button>
    </div>
  </div>
)

export const DashCompareNotice = () => {
  const comparison = useSyncStore((s) => s.comparison)
  const connected = useConnectionStore((s) => s.status === 'connected')
  if (comparison === null || !connected) return null
  return <DashCompareBanner comparison={comparison} />
}
