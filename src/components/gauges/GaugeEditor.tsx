import type { PageConfig, Widget } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { pageName, widgetName } from '../../lib/sync/describe'
import { positionOf } from '../../lib/gauges/reading-order'
import { carriesKicker, withKicker } from '../../lib/widget-kicker'
import { SIGNAL_HIDDEN_TYPES } from '../editor/property-panel/panels/widget-editor-panel'
import { MoreOptions } from './MoreOptions'
import { useDashboardStore } from '../../stores/dashboard.store'
import { AlertLink } from './AlertLink'
import { FitWarning } from './FitWarning'
import { GaugeActions } from './GaugeActions'
import { LimitsField } from './LimitsField'
import { NameField } from './NameField'
import { ShowsField } from './ShowsField'

export interface GaugeEditorProps {
  page: PageConfig
  widget: Widget
}

const EDITOR = [
  'flex flex-col gap-4 border-t border-app-border bg-app-surface px-4 pb-5 pt-3',
  'rounded-t-sheet lg:rounded-card lg:border lg:p-5',
].join(' ')

const EditorHeader = ({ page, widget }: GaugeEditorProps) => {
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xl font-bold lg:text-[22px]">{widgetName(widget)}</span>
        <span className="text-[13px] text-app-muted">
          {STRINGS.gauges.gaugeOf(positionOf(page, widget.id), page.widgets.length, pageName(page))}
        </span>
      </div>
      <Button
        className="bg-app-text text-[15px] text-app-bg lg:hidden"
        onClick={() => {
          selectWidget(null)
        }}
      >
        {STRINGS.gauges.done}
      </Button>
    </div>
  )
}

const useGaugeWrites = (page: PageConfig, widget: Widget) => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  return {
    pick: (signal: string) => {
      updateWidget(page.id, widget.id, { signal })
    },
    rename: (name: string) => {
      const config = withKicker(widget, name)
      if (config !== null) updateWidget(page.id, widget.id, { config })
    },
  }
}

export const GaugeEditor = ({ page, widget }: GaugeEditorProps) => {
  const writes = useGaugeWrites(page, widget)
  return (
    <section aria-label={STRINGS.gauges.editGauge} className={EDITOR}>
      <div aria-hidden="true" className="h-1 w-9 self-center rounded-full bg-[#3a3f46] lg:hidden" />
      <EditorHeader page={page} widget={widget} />
      <FitWarning widget={widget} />
      {!SIGNAL_HIDDEN_TYPES.has(widget.type) && <ShowsField widget={widget} onPick={writes.pick} />}
      {carriesKicker(widget) && <NameField widget={widget} onRename={writes.rename} />}
      <LimitsField pageId={page.id} widget={widget} />
      <AlertLink widget={widget} />
      <MoreOptions page={page} widget={widget} />
      <GaugeActions page={page} widget={widget} />
    </section>
  )
}
