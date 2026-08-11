import { useMemo } from 'react'
import type { SignalDef } from '@canshift/core'
import { useSignalStore } from '../../stores/signal.store'
import { useDeviceStore } from '../../stores/device.store'
import { useCanScanStore } from '../../stores/can-scan/can-scan.store'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useRebindFlashStore } from '../../stores/rebind-flash.store'
import {
  SIGNAL_DRAG_MIME,
  WIDGET_TYPE_DRAG_MIME,
  widgetOfTypeForSignal,
} from '../../utils/default-widget'
import { autoPlace } from '../../utils/layout'
import { unboundFrames } from '../../stores/can-scan/unbound-frames'
import { captureFlowEvent } from '../../lib/posthog'
import { cn } from '@/lib/utils'
import { RoutePanel } from '../ui/route-shell'
import { Eyebrow, MetaText } from '../ui/meta-text'

const formatFrameId = (id: number): string => `0x${id.toString(16).toUpperCase()}`

const formatPayload = (payload: readonly number[]): string =>
  payload.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')

const formatValue = (value: number | undefined): string => {
  if (value === undefined) return '- -'
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1)
}

interface SignalsPanelProps {
  pageId?: string | undefined
}

const SignalsPanel = ({ pageId }: SignalsPanelProps) => {
  const signals = useSignalStore((s) => s.signals)
  const addWidget = useDashboardStore((s) => s.addWidget)
  const page = useDashboardStore((s) => s.config?.pages.find((p) => p.id === pageId))
  const flashWidget = useRebindFlashStore((s) => s.flash)
  const canBindWidgets = page !== undefined && (page.template ?? 'custom') === 'custom'

  const handleWidgetTypeDrop = (e: React.DragEvent, sig: SignalDef) => {
    const type = e.dataTransfer.getData(WIDGET_TYPE_DRAG_MIME)
    if (!type || !canBindWidgets || pageId === undefined) return
    e.preventDefault()
    const widget = widgetOfTypeForSignal(type, sig)
    if (!widget) return
    const slot = autoPlace(
      { colSpan: widget.layout.colSpan, rowSpan: widget.layout.rowSpan },
      page.widgets.map((w) => w.layout)
    )
    if (!slot) return
    addWidget(pageId, widget)
    flashWidget(widget.id)
    captureFlowEvent('signal_bound', { target: 'signal_row', widgetType: widget.type })
  }
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const status = useCanScanStore((s) => s.status)
  const scanError = useCanScanStore((s) => s.error)
  const snapshot = useCanScanStore((s) => s.snapshot)
  const start = useCanScanStore((s) => s.start)
  const stop = useCanScanStore((s) => s.stop)
  const liveValues = useLiveSignals()

  const unbound = useMemo(() => unboundFrames(snapshot.frames, signals), [snapshot.frames, signals])

  const canScan = connected && !simulationMode
  const isScanning = status === 'running' || status === 'starting'

  return (
    <RoutePanel>
      <div className="flex items-center gap-2 border-b-2 border-brand-divider px-[18px] py-2.5">
        <span
          className={cn(
            'size-[7px] shrink-0',
            status === 'running' ? 'bg-brand-accent' : 'bg-brand-neutral-400'
          )}
        />
        <MetaText size="sm" className="flex-1 tracking-[0.12em]">
          {status === 'running' ? `SCAN ${String(snapshot.totalRate)} f/s` : 'SCAN OFF'}
        </MetaText>
        <button
          type="button"
          className={cn(
            'editor-ghost-accent border bg-none px-2.5 py-[3px] text-[10px] font-extrabold tracking-[0.09em]',
            canScan
              ? 'cursor-pointer border-brand-accent text-brand-accent'
              : 'cursor-default border-brand-neutral-300 text-brand-neutral-400'
          )}
          disabled={!canScan}
          onClick={() => {
            void (isScanning ? stop() : start())
          }}
          title={canScan ? undefined : 'Connect a device to scan the bus'}
        >
          {isScanning ? 'STOP' : 'START'}
        </button>
      </div>
      {status === 'error' && scanError !== null && (
        <div className="border-b border-brand-neutral-300 px-[18px] py-1.5 text-[11px] text-brand-accent">
          Scan failed: {scanError}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Eyebrow className="block px-[18px] pb-1.5 pt-2.5">
          BOUND — {String(signals.length)}
        </Eyebrow>
        {signals.length === 0 && (
          <div className="px-[18px] pb-2.5 pt-1 text-[11px] leading-[1.5] text-brand-neutral-500">
            No signals in the active profile.
          </div>
        )}
        {signals.map((sig) => (
          <div
            key={sig.name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(SIGNAL_DRAG_MIME, sig.name)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            onDragOver={(e) => {
              if (!canBindWidgets || !e.dataTransfer.types.includes(WIDGET_TYPE_DRAG_MIME)) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(e) => {
              handleWidgetTypeDrop(e, sig)
            }}
            title="Drag onto the canvas to create a bound widget"
            className="cursor-grab border-b border-brand-neutral-300 px-[18px] py-1.5"
          >
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-brand-neutral-700">
                {sig.name}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-brand-text">
                {formatValue(liveValues[sig.name])}
                {liveValues[sig.name] !== undefined && sig.unit ? ` ${sig.unit}` : ''}
              </span>
            </div>
            <MetaText size="sm" className="mt-px block text-brand-neutral-500">
              {sig.canFrameId.toUpperCase().replace('0X', '0x')}
            </MetaText>
          </div>
        ))}

        <Eyebrow className="block px-[18px] pb-1.5 pt-2.5">
          UNBOUND — {String(unbound.length)}
        </Eyebrow>
        {unbound.length === 0 && (
          <div className="px-[18px] pb-2.5 pt-1 text-[11px] leading-[1.5] text-brand-neutral-500">
            {canScan
              ? isScanning
                ? 'Listening — no unbound IDs seen yet.'
                : 'Start a scan to list arriving IDs with no signal bound.'
              : simulationMode
                ? 'Simulation streams decoded signals only — connect a device to see raw IDs.'
                : 'Connect a device and start a scan to see arriving IDs.'}
          </div>
        )}
        {unbound.map((frame) => (
          <div key={frame.id} className="border-b border-brand-neutral-300 px-[18px] py-1.5">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="font-mono text-[12px] text-brand-neutral-700">
                {formatFrameId(frame.id)}
              </span>
              <MetaText className="shrink-0 text-brand-neutral-500">
                {String(frame.rateHz)} Hz
              </MetaText>
            </div>
            <MetaText size="sm" className="mt-px block text-brand-neutral-500">
              {formatPayload(frame.lastPayload)}
            </MetaText>
          </div>
        ))}
      </div>
    </RoutePanel>
  )
}

export default SignalsPanel
