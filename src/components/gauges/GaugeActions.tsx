import { useState } from 'react'
import type { PageConfig, Widget } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { swappedWithNeighbour, neighbourOf, type Step } from '../../lib/gauges/reading-order'
import { widgetName } from '../../lib/sync/describe'
import { useDashboardStore } from '../../stores/dashboard.store'
import { RemoveGaugeDialog } from './RemoveGaugeDialog'

export interface GaugeActionsProps {
  page: PageConfig
  widget: Widget
}

const MOVE_LABELS: Record<Step, string> = {
  [-1]: STRINGS.gauges.moveLeft,
  1: STRINGS.gauges.moveRight,
}

const moveGauge = (page: PageConfig, widget: Widget, step: Step): void => {
  const store = useDashboardStore.getState()
  const moved = swappedWithNeighbour(page, widget.id, step)
  if (moved === null || store.config === null) return
  const pages = store.config.pages.map((candidate) =>
    candidate.id === page.id ? moved : candidate
  )
  store.replaceConfig({ ...store.config, pages }, MOVE_LABELS[step])
}

const MoveButton = ({ page, widget, step }: GaugeActionsProps & { step: Step }) => (
  <Button
    variant="secondary"
    disabled={neighbourOf(page, widget.id, step) === null}
    onClick={() => {
      moveGauge(page, widget, step)
    }}
  >
    {MOVE_LABELS[step]}
  </Button>
)

const RemoveButton = ({ page, widget }: GaugeActionsProps) => {
  const [confirming, setConfirming] = useState(false)
  const removeWidget = useDashboardStore((s) => s.removeWidget)
  return (
    <>
      <Button
        variant="outline"
        className="ml-auto text-[#ff6b6b]"
        onClick={() => setConfirming(true)}
      >
        {STRINGS.gauges.removeGauge}
      </Button>
      <RemoveGaugeDialog
        name={widgetName(widget)}
        open={confirming}
        onOpenChange={setConfirming}
        onRemove={() => {
          removeWidget(page.id, widget.id)
        }}
      />
    </>
  )
}

export const GaugeActions = (props: GaugeActionsProps) => (
  <div className="flex flex-wrap gap-2 border-t border-app-border pt-4">
    <MoveButton {...props} step={-1} />
    <MoveButton {...props} step={1} />
    <RemoveButton {...props} />
  </div>
)
