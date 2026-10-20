import * as React from 'react'
import { memo, useCallback, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { ControlState, SignalLimits, Widget, WidgetConfig, PagePalette } from '@canshift/core'
import { displayDecimals } from '@canshift/core'
import { useSignalStore } from '../../stores/signal.store'
import { ButtonPreview } from './widget-previews/Button'
import { GearPreview } from './widget-previews/Gear'
import { GMeterPreview } from './widget-previews/GMeter'
import { GaugeArcPreview, type GaugeArcRendererProps } from './widget-previews/GaugeArc'
import { GaugeNumericPreview, type GaugeNumericRendererProps } from './widget-previews/GaugeNumeric'
import { ShiftLightPreview } from './widget-previews/ShiftLight'
import { ImagePreview } from './widget-previews/Image'
import { TimerPreview } from './widget-previews/Timer'
import { WarningPreview } from './widget-previews/Warning'
import { widgetSeverity } from './widget-previews/gauge-math'
import { isUnboundWidget } from '../../utils/unbound-widgets'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { useBoardLacksImu } from '../../hooks/useBoardLacksImu'
import { widgetUnitOf } from '../../lib/unit-display'

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
  signalLimits: SignalLimits | undefined
  signalUnit: string
  toDisplay: (value: number) => number
  decimalsOf: (decimals: number) => number
  unbound: boolean
  scale: number
  imuMissing: boolean
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
        signalLimits={ctx.signalLimits}
        testValue={ctx.testValue}
        signalUnit={ctx.signalUnit}
        toDisplay={ctx.toDisplay}
        decimalsOf={ctx.decimalsOf}
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
  g_meter: (widget, ctx) => (
    <GMeterPreview widget={widget} w={ctx.w} h={ctx.h} scale={ctx.scale} locked={ctx.imuMissing} />
  ),
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
  decimalsOf: (decimals: number) => number
}

const useResolvedSignalUnit = (widget: Widget): ResolvedUnit => {
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  const { symbol, convertible } = widgetUnitOf(widget, signals, units.system)
  const toDisplay = useCallback(
    (value: number) => units.valueOf(value, convertible),
    [units, convertible]
  )
  const decimalsOf = useCallback(
    (decimals: number) => displayDecimals(decimals, convertible, units.system),
    [units.system, convertible]
  )
  return useMemo(() => ({ symbol, toDisplay, decimalsOf }), [symbol, toDisplay, decimalsOf])
}

const useSignalLimits = (widget: Widget): SignalLimits | undefined =>
  useSignalStore((s) => s.signals.find((candidate) => candidate.name === widget.signal))

const liveFlags = (
  props: WidgetPreviewProps,
  resolved: Widget,
  signalLimits: SignalLimits | undefined
) => {
  const noAnimate = props.noAnimate ?? false
  const testValue = props.testValue ?? null
  return {
    noAnimate,
    testValue,
    signalLimits,
    danger: noAnimate ? false : widgetSeverity(resolved, testValue, signalLimits) === 'danger',
    revLimiting: noAnimate ? false : (props.revLimiting ?? false),
  }
}

const WidgetPreviewImpl = (props: WidgetPreviewProps) => {
  const { widget, palette, scale = 1, buttonState = 'off', cycleStateIndex } = props
  const resolved = palette ? applyPalette(widget, palette) : widget
  const { symbol: signalUnit, toDisplay, decimalsOf } = useResolvedSignalUnit(resolved)
  const signalLimits = useSignalLimits(resolved)
  const imuMissing = useBoardLacksImu()
  const ctx: RenderContext = {
    w: Math.max(0, props.displayW),
    h: Math.max(0, props.displayH),
    buttonState,
    cycleStateIndex,
    signalUnit,
    toDisplay,
    decimalsOf,
    unbound: isUnboundWidget(resolved),
    scale,
    imuMissing,
    ...liveFlags(props, resolved, signalLimits),
  }
  return RENDERERS[resolved.config.type](resolved, ctx)
}

export const WidgetPreview = memo(WidgetPreviewImpl)
