import { useMemo } from 'react'
import { InlineState } from '@/components/states/InlineState'
import { useDashboardStore } from '../../stores/dashboard.store'
import { describeLayoutOverflow } from '../../lib/layout-overflow'

export const LayoutOverflowNotice = () => {
  const config = useDashboardStore((s) => s.config)
  const overflow = useMemo(
    () => (config === null ? null : describeLayoutOverflow(config)),
    [config]
  )

  if (overflow === null) return null

  return (
    <InlineState
      className="shrink-0"
      severity="failure"
      kicker={overflow.kicker}
      title={overflow.title}
      body={overflow.body}
    />
  )
}
