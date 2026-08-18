import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { ButtonWidgetConfig, ControlState } from '@canshift/core'
import { resolveGridRect, resolveScreenProfile } from '@canshift/core'

import { Checkbox } from '@/components/ui/checkbox'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { WidgetPreview } from '../WidgetPreview'
import { CycleModeBody } from './button/cycle-mode-body'
import { ModeToggle } from './button/mode-toggle'
import { convertCycleToSingle, convertSingleToCycle, EMPTY_PAGES } from './button/shared'
import { SingleModeBody } from './button/single-mode-body'
import { type ConfigFieldsProps } from './shared'
import { PanelField, PanelInput } from '@/components/ui/form-field'
import { controlFor, statesFor } from '../../../lib/control-paint'

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

const kickerOf = (cfg: ButtonWidgetConfig, signal: string): string =>
  cfg.kicker !== undefined && cfg.kicker !== '' ? cfg.kicker : signal

export const ButtonFields = ({ widget, onChange }: ConfigFieldsProps) => {
  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const topBarHeight = useDashboardStore((s) => s.config?.topBar.height ?? 0)
  const pageIds = pages.map((p) => p.id)
  const [previewStateIndex, setPreviewStateIndex] = useState(0)
  const [previewStateIdx, setPreviewStateIdx] = useState(0)

  if (widget.config.type !== 'button') return null
  const cfg: ButtonWidgetConfig = widget.config

  const ownerPage = pages.find((p) => p.widgets.some((pw) => pw.id === widget.id))
  const profile = resolveScreenProfile(targetProfile)
  const areaHeight =
    ownerPage?.showTopBar !== false ? profile.height - topBarHeight : profile.height
  const { w, h } = resolveGridRect(widget.layout, { width: profile.width, height: areaHeight })
  const PREVIEW_BUDGET_W = 140
  const PREVIEW_BUDGET_H = 180
  const PREVIEW_MAX_SCALE = 4
  const previewScale = Math.min(PREVIEW_MAX_SCALE, PREVIEW_BUDGET_W / w, PREVIEW_BUDGET_H / h)
  const previewW = Math.round(w * previewScale)
  const previewH = Math.round(h * previewScale)

  const previewStates = statesFor(controlFor(kickerOf(cfg, widget.signal)))
  const previewState = previewStates[previewStateIndex % previewStates.length] ?? 'off'

  const cycleStateCount = cfg.mode === 'cycle' ? cfg.states.length : 0
  const clampedPreviewIdx = cycleStateCount > 0 ? previewStateIdx % cycleStateCount : 0

  const handleModeChange = (next: 'single' | 'cycle') => {
    if (cfg.mode === next) return
    if (cfg.mode === 'single' && next === 'cycle') {
      onChange({ config: convertSingleToCycle(cfg, pageIds) })
    } else if (cfg.mode === 'cycle' && next === 'single') {
      onChange({ config: convertCycleToSingle(cfg, pageIds) })
    }
    setPreviewStateIdx(0)
  }

  return (
    <>
      <PanelField label="Active state">
        <div className="mb-0.5 flex items-center gap-2">
          <div
            className="inline-block shrink-0 overflow-hidden border border-solid"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{
              borderColor:
                previewState === 'off'
                  ? 'hsl(var(--brand-neutral-300))'
                  : widget.style.primaryColor,
            }}
          >
            <WidgetPreview
              widget={widget}
              displayW={previewW}
              displayH={previewH}
              buttonState={previewState}
              cycleStateIndex={cfg.mode === 'cycle' ? clampedPreviewIdx : undefined}
            />
          </div>
          {cfg.mode === 'single' ? (
            <button
              title="Step through the states the dash will render"
              onClick={() => {
                setPreviewStateIndex((i) => i + 1)
              }}
              className={cn(previewToggle({ active: previewState !== 'off' }))}
            >
              {STATE_LABELS[previewState]}
            </button>
          ) : (
            <button
              onClick={() => {
                setPreviewStateIdx((i) => (i + 1) % Math.max(1, cycleStateCount))
              }}
              className={cn(previewToggle({ active: false }), 'font-mono')}
              title="Click to preview next cycle state"
            >
              {clampedPreviewIdx + 1} / {Math.max(1, cycleStateCount)} ›
            </button>
          )}
        </div>
      </PanelField>

      <PanelField label="Mode">
        <ModeToggle mode={cfg.mode} onChange={handleModeChange} />
      </PanelField>

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
            const value = e.target.value
            onChange({
              config: value ? { ...cfg, kicker: value } : (({ kicker: _, ...rest }) => rest)(cfg),
            })
          }}
        />
      </PanelField>

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

      {cfg.mode === 'single' ? (
        <SingleModeBody cfg={cfg} pageIds={pageIds} onChange={onChange} />
      ) : (
        <CycleModeBody cfg={cfg} pageIds={pageIds} onChange={onChange} />
      )}
    </>
  )
}
