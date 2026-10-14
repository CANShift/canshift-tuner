import { useState } from 'react'
import type { ButtonWidgetConfig } from '@canshift/core'
import { Checkbox } from '@/components/ui/checkbox'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { CycleModeBody } from './button/cycle-mode-body'
import { ModeToggle } from './button/mode-toggle'
import { convertCycleToSingle, convertSingleToCycle, EMPTY_PAGES } from './button/shared'
import { SingleModeBody } from './button/single-mode-body'
import { ActiveStatePreview, type PreviewSteps } from './button/active-state-preview'
import { type ConfigFieldsProps } from './shared'
import { PanelField, PanelInput } from '@/components/ui/form-field'

type ButtonMode = ButtonWidgetConfig['mode']

interface ButtonFieldProps {
  cfg: ButtonWidgetConfig
  onChange: ConfigFieldsProps['onChange']
}

const withKicker = (cfg: ButtonWidgetConfig, kicker: string): ButtonWidgetConfig => {
  if (kicker) return { ...cfg, kicker }
  const { kicker: _, ...rest } = cfg
  return rest
}

const convertMode = (cfg: ButtonWidgetConfig, pageIds: string[]): ButtonWidgetConfig =>
  cfg.mode === 'single' ? convertSingleToCycle(cfg, pageIds) : convertCycleToSingle(cfg, pageIds)

const usePreviewSteps = (): PreviewSteps & { resetCycle: () => void } => {
  const [stateIndex, setStateIndex] = useState(0)
  const [cycleIndex, setCycleIndex] = useState(0)
  return {
    stateIndex,
    cycleIndex,
    nextState: () => {
      setStateIndex((i) => i + 1)
    },
    nextCycle: (count) => {
      setCycleIndex((i) => (i + 1) % Math.max(1, count))
    },
    resetCycle: () => {
      setCycleIndex(0)
    },
  }
}

const TextFields = ({ cfg, onChange }: ButtonFieldProps) => (
  <>
    <PanelField label="Label">
      <PanelInput
        value={cfg.label}
        onChange={(e) => {
          onChange({ config: { ...cfg, label: e.target.value } })
        }}
      />
    </PanelField>
    <PanelField label="Kicker">
      <PanelInput
        value={cfg.kicker ?? ''}
        placeholder="auto"
        onChange={(e) => {
          onChange({ config: withKicker(cfg, e.target.value) })
        }}
      />
    </PanelField>
  </>
)

const ShowField = ({ cfg, onChange }: ButtonFieldProps) => (
  <PanelField label="Show">
    <div className="flex gap-3 text-[12px] text-brand-neutral-600">
      <label className="flex cursor-pointer items-center gap-[5px]">
        <Checkbox
          checked={cfg.showLabel !== false}
          onCheckedChange={(checked) => {
            onChange({ config: { ...cfg, showLabel: checked === true } })
          }}
        />
        Text
      </label>
    </div>
  </PanelField>
)

const ModeBody = ({ cfg, onChange, pageIds }: ButtonFieldProps & { pageIds: string[] }) =>
  cfg.mode === 'single' ? (
    <SingleModeBody cfg={cfg} pageIds={pageIds} onChange={onChange} />
  ) : (
    <CycleModeBody cfg={cfg} pageIds={pageIds} onChange={onChange} />
  )

export const ButtonFields = ({ widget, onChange }: ConfigFieldsProps) => {
  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)
  const steps = usePreviewSteps()
  if (widget.config.type !== 'button') return null
  const cfg = widget.config
  const pageIds = pages.map((p) => p.id)
  const changeMode = (next: ButtonMode) => {
    if (cfg.mode === next) return
    onChange({ config: convertMode(cfg, pageIds) })
    steps.resetCycle()
  }
  return (
    <>
      <ActiveStatePreview widget={widget} cfg={cfg} steps={steps} />
      <PanelField label="Mode">
        <ModeToggle mode={cfg.mode} onChange={changeMode} />
      </PanelField>
      <TextFields cfg={cfg} onChange={onChange} />
      <ShowField cfg={cfg} onChange={onChange} />
      <ModeBody cfg={cfg} onChange={onChange} pageIds={pageIds} />
    </>
  )
}
