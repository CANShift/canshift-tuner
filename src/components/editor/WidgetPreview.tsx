import * as React from 'react'
import { memo, useCallback, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { ControlState, SignalDef, Widget, WidgetConfig, PagePalette } from '@canshift/core'
import { MAXXECU_SIGNAL_UNITS } from '@canshift/core'
import { useSignalStore } from '../../stores/signal.store'
import { ButtonPreview } from './widget-previews/Button'
import { GearPreview } from './widget-previews/Gear'
import { GaugeArcPreview, type GaugeArcRendererProps } from './widget-previews/GaugeArc'
import { GaugeNumericPreview, type GaugeNumericRendererProps } from './widget-previews/GaugeNumeric'
import { ShiftLightPreview } from './widget-previews/ShiftLight'
import { ImagePreview } from './widget-previews/Image'
import { TimerPreview } from './widget-previews/Timer'
import { WarningPreview } from './widget-previews/Warning'
import { isDangerState } from './widget-previews/gauge-math'
import { isUnboundWidget } from '../../utils/unbound-widgets'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { convertibleUnitFor, displayUnitFor } from '../../lib/unit-display'

const FALLBACK_UNIT_TABLE: Readonly<Record<string, string>> = MAXXECU_SIGNAL_UNITS

const applyPalette = (widget: Widget, palette: PagePalette): Widget => {
  if (widget.style.respectDayMode === false) return widget
  return {
    ...widget,
    style: {
      ...widget.style,
      textColor: palette.text,
    },
  }
}

interface RenderContext {
  w: number
  h: number
  revLimiting: boolean
  buttonState: ControlState
  cycleStateIndex: number | undefined
  noAnimate: boolean
  testValue: number | null
  danger: boolean
  signalUnit: string
  toDisplay: (value: number) => number
  unbound: boolean
  scale: number
}

type WidgetTypeKey = WidgetConfig['type']

type RendererDispatch = Record<
  WidgetTypeKey,
  (widget: Widget, ctx: RenderContext) => React.JSX.Element | null
>

type GaugeRendererProps = GaugeArcRendererProps | GaugeNumericRendererProps

const gaugeRendererByDisplay: Record<'arc' | 'numeric', ComponentType<GaugeRendererProps>> = {
  arc: GaugeArcPreview as ComponentType<GaugeRendererProps>,
  numeric: GaugeNumericPreview as ComponentType<GaugeRendererProps>,
}

const RENDERERS: RendererDispatch = {
  shift_light: (widget, ctx) => (
    <ShiftLightPreview widget={widget} w={ctx.w} h={ctx.h} testValue={ctx.testValue} />
  ),
  gauge: (widget, ctx) => {
    if (widget.config.type !== 'gauge') return null
    const Renderer = gaugeRendererByDisplay[widget.config.displayStyle]
    return (
      <Renderer
        widget={widget}
        w={ctx.w}
        h={ctx.h}
        revLimiting={ctx.revLimiting}
        danger={ctx.danger}
        testValue={ctx.testValue}
        signalUnit={ctx.signalUnit}
        toDisplay={ctx.toDisplay}
        unbound={ctx.unbound}
        scale={ctx.scale}
      />
    )
  },
  warning: (widget, ctx) => (
    <WarningPreview widget={widget} w={ctx.w} h={ctx.h} noAnimate={ctx.noAnimate} />
  ),
  button: (widget, ctx) => (
    <ButtonPreview
      widget={widget}
      w={ctx.w}
      h={ctx.h}
      state={ctx.buttonState}
      cycleStateIndex={ctx.cycleStateIndex}
    />
  ),
  gear: (widget, ctx) => (
    <GearPreview widget={widget} w={ctx.w} h={ctx.h} unbound={ctx.unbound} scale={ctx.scale} />
  ),
  timer: (widget, ctx) => <TimerPreview widget={widget} w={ctx.w} h={ctx.h} />,
  image: (widget, ctx) => <ImagePreview widget={widget} w={ctx.w} h={ctx.h} />,
}

interface WidgetPreviewProps {
  widget: Widget
  displayW: number
  displayH: number
  scale?: number
  palette?: PagePalette
  revLimiting?: boolean
  buttonState?: ControlState
  cycleStateIndex?: number | undefined
  noAnimate?: boolean
  testValue?: number | null
}

interface ResolvedUnit {
  symbol: string
  toDisplay: (value: number) => number
}

const configSuffixOf = (widget: Widget): string => {
  const cfg = widget.config
  if (cfg.type !== 'gauge' && cfg.type !== 'timer') return ''
  return (cfg as { suffix?: string }).suffix ?? ''
}

const declaredUnitOf = (widget: Widget, signals: readonly SignalDef[]): string => {
  if (!widget.signal) return ''
  const def = signals.find((s) => s.name === widget.signal)
  return def?.unit ?? FALLBACK_UNIT_TABLE[widget.signal] ?? ''
}

const useResolvedSignalUnit = (widget: Widget): ResolvedUnit => {
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  const suffix = configSuffixOf(widget)
  const declared = declaredUnitOf(widget, signals)
  const convertible = convertibleUnitFor(suffix, declared)
  const symbol = displayUnitFor(suffix, declared, units.system)
  const toDisplay = useCallback(
    (value: number) => units.valueOf(value, convertible),
    [units, convertible]
  )
  return useMemo(() => ({ symbol, toDisplay }), [symbol, toDisplay])
}

const WidgetPreviewImpl = ({
  widget,
  displayW: rawW,
  displayH: rawH,
  scale = 1,
  palette,
  revLimiting = false,
  buttonState = 'off',
  cycleStateIndex,
  noAnimate = false,
  testValue = null,
}: WidgetPreviewProps) => {
  const w = Math.max(0, rawW)
  const h = Math.max(0, rawH)

  const resolved = palette ? applyPalette(widget, palette) : widget
  const danger = noAnimate ? false : isDangerState(resolved, testValue)
  const { symbol: signalUnit, toDisplay } = useResolvedSignalUnit(resolved)
  const unbound = isUnboundWidget(resolved)

  const ctx: RenderContext = {
    w,
    h,
    revLimiting: noAnimate ? false : revLimiting,
    buttonState,
    cycleStateIndex,
    noAnimate,
    testValue,
    danger,
    signalUnit,
    toDisplay,
    unbound,
    scale,
  }

  const render = RENDERERS[resolved.config.type]
  return render(resolved, ctx)
}

export const WidgetPreview = memo(WidgetPreviewImpl)
