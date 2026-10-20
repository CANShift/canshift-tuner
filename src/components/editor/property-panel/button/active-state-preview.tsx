import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonWidgetConfig, ControlState, Widget } from '@canshift/core'
import { resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../../../../stores/dashboard.store'
import { widgetRectOn } from '../../../../lib/page-rect'
import { WidgetPreview } from '../../WidgetPreview'
import { PanelField } from '@/components/ui/form-field'
import { controlFor, statesFor } from '../../../../lib/control-paint'
import { EMPTY_PAGES } from './shared'

const PREVIEW_BUDGET_W = 140
const PREVIEW_BUDGET_H = 180
const PREVIEW_MAX_SCALE = 4

const previewToggle = cva('shrink-0 cursor-pointer border border-solid px-2 py-[3px] text-[10px]', {
  variants: {
    active: {
      true: 'border-status-danger bg-[color-mix(in_srgb,hsl(var(--status-danger))_14%,transparent)] text-[#FF4444]',
      false: 'border-brand-neutral-300 bg-transparent text-brand-neutral-600',
    },
  },
  defaultVariants: { active: false },
})

const STATE_LABELS: Record<ControlState, string> = {
  off: 'Off',
  armed: 'Armed',
  active: 'Active',
  unavailable: 'Unavailable',
}

export interface PreviewSteps {
  stateIndex: number
  cycleIndex: number
  nextState: () => void
  nextCycle: (count: number) => void
}

export interface ActiveStatePreviewProps {
  widget: Widget
  cfg: ButtonWidgetConfig
  steps: PreviewSteps
}

const kickerOf = (cfg: ButtonWidgetConfig, signal: string): string =>
  cfg.kicker !== undefined && cfg.kicker !== '' ? cfg.kicker : signal

const usePreviewBox = (widget: Widget) => {
  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const topBarHeight = useDashboardStore((s) => s.config?.topBar.height ?? 0)
  const ownerPage = pages.find((p) => p.widgets.some((pw) => pw.id === widget.id))
  const profile = resolveScreenProfile(targetProfile)
  const areaHeight =
    ownerPage?.showTopBar !== false ? profile.height - topBarHeight : profile.height
  const area = { width: profile.width, height: areaHeight }
  const { w, h } = widgetRectOn(ownerPage ?? { widgets: [] }, widget, area)
  const scale = Math.min(PREVIEW_MAX_SCALE, PREVIEW_BUDGET_W / w, PREVIEW_BUDGET_H / h)
  return { w: Math.round(w * scale), h: Math.round(h * scale), scale }
}

const StateStepper = ({ state, onStep }: { state: ControlState; onStep: () => void }) => (
  <button
    title="Step through the states the dash will render"
    onClick={onStep}
    className={cn(previewToggle({ active: state !== 'off' }))}
  >
    {STATE_LABELS[state]}
  </button>
)

const CycleStepper = ({
  index,
  count,
  onStep,
}: {
  index: number
  count: number
  onStep: () => void
}) => (
  <button
    onClick={onStep}
    className={cn(previewToggle({ active: false }), 'font-mono')}
    title="Click to preview next cycle state"
  >
    {index + 1} / {Math.max(1, count)} ›
  </button>
)

interface PreviewFrameProps {
  widget: Widget
  state: ControlState
  cycleIndex: number | undefined
}

const PreviewFrame = ({ widget, state, cycleIndex }: PreviewFrameProps) => {
  const box = usePreviewBox(widget)
  return (
    <div
      className="inline-block shrink-0 font-sans overflow-hidden border border-solid"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        borderColor: state === 'off' ? 'hsl(var(--brand-neutral-300))' : widget.style.primaryColor,
      }}
    >
      <WidgetPreview
        widget={widget}
        displayW={box.w}
        displayH={box.h}
        scale={box.scale}
        buttonState={state}
        cycleStateIndex={cycleIndex}
      />
    </div>
  )
}

export const ActiveStatePreview = ({ widget, cfg, steps }: ActiveStatePreviewProps) => {
  const states = statesFor(controlFor(kickerOf(cfg, widget.signal)))
  const state = states[steps.stateIndex % states.length] ?? 'off'
  const cycleCount = cfg.mode === 'cycle' ? cfg.states.length : 0
  const cycleIndex = cycleCount > 0 ? steps.cycleIndex % cycleCount : 0
  return (
    <PanelField label="Active state">
      <div className="mb-0.5 flex items-center gap-2">
        <PreviewFrame
          widget={widget}
          state={state}
          cycleIndex={cfg.mode === 'cycle' ? cycleIndex : undefined}
        />
        {cfg.mode === 'single' ? (
          <StateStepper state={state} onStep={steps.nextState} />
        ) : (
          <CycleStepper
            index={cycleIndex}
            count={cycleCount}
            onStep={() => steps.nextCycle(cycleCount)}
          />
        )}
      </div>
    </PanelField>
  )
}
