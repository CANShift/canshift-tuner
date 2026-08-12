import { useRef, type PointerEvent } from 'react'
import type { TopBarConfig, TopBarItem } from '@canshift/core'
import { DEFAULT_TOP_BAR_LAYOUT, TopBarMetrics } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const SWIPE_DOWN_THRESHOLD = 18

const PREVIEW_SIGNAL_VALUES: Record<string, number> = {
  battery_volts: 12.4,
  rpm: 3500,
  speed_kph: 80,
  coolant_temp_c: 88,
  oil_press_bar: 4.2,
  oil_temp_c: 95,
  map_number: 1,
}

const BAR = [
  'relative box-border flex shrink-0 select-none items-center justify-between',
  'cursor-default overflow-hidden border-b border-solid',
].join(' ')

const barRule = cva('', {
  variants: {
    settingsOpen: { true: 'border-[#CC333333]', false: 'border-[#1E1E1E]' },
  },
  defaultVariants: { settingsOpen: false },
})

const GROUP = 'flex items-center'

const CENTER_GROUP = 'absolute left-1/2 flex -translate-x-1/2 items-center'

const CHEVRON = [
  'pointer-events-none absolute bottom-px left-1/2 -translate-x-1/2',
  'leading-none text-[#FFFFFF22]',
].join(' ')

const dimText = cva('leading-none tracking-[0.1em]', {
  variants: {
    day: { true: 'text-[#5A5A5A]', false: 'text-[#BABABA]' },
  },
  defaultVariants: { day: false },
})

const STATUS_DOT = 'inline-block shrink-0 bg-[#44CC44]'

const SEPARATOR = 'w-px shrink-0 bg-[#2A2A2A]'

const BLE_ICON = 'leading-none tracking-[0.04em] text-[#4499FF]'

const THEME_TOGGLE = 'shrink-0 leading-none'

const TRACK_BADGE = 'whitespace-nowrap'

const FLAG_BADGE = 'inline-flex items-center opacity-40'

const FLAG_SQUARE = 'shrink-0 bg-[#FF8800]'

const FLAG_TEXT = 'leading-none text-[#FF8800]'

const formatPreviewSignal = (signal: string, format?: string): string => {
  const value = PREVIEW_SIGNAL_VALUES[signal]
  if (value === undefined) return '--'
  if (!format) return value.toFixed(1)
  const m = /%\.(\d+)f(.*)/.exec(format)
  if (!m) return format.replace('%f', value.toFixed(1))
  const decimals = parseInt(m[1] ?? '1', 10)
  const suffix = m[2] ?? ''
  return value.toFixed(decimals) + suffix
}

export interface DashTopBarProps {
  topBar: TopBarConfig
  scale: number
  settingsOpen: boolean
  isDayMode: boolean
  onOpenSettings: () => void
}

export const DashTopBar = ({
  topBar,
  scale,
  settingsOpen,
  isDayMode,
  onOpenSettings,
}: DashTopBarProps) => {
  const swipeStartY = useRef<number | null>(null)

  const h = topBar.height * scale
  const dot = Math.round(h * TopBarMetrics.dotRatio)
  const fs = Math.round(TopBarMetrics.labelFontPx * scale)
  const sep = Math.round(h * TopBarMetrics.separatorRatio)
  const gap = Math.round(h * TopBarMetrics.gapRatio)
  const px = Math.round(h * TopBarMetrics.paddingRatio)
  const flagSquare = Math.round(TopBarMetrics.flagSquarePx * scale)
  const flagGap = Math.round(TopBarMetrics.flagGapPx * scale)

  const handlePointerDown = (e: PointerEvent) => {
    swipeStartY.current = e.clientY
  }

  const handlePointerUp = (e: PointerEvent) => {
    if (swipeStartY.current === null) return
    const dy = e.clientY - swipeStartY.current
    swipeStartY.current = null
    if (dy > SWIPE_DOWN_THRESHOLD) onOpenSettings()
    else if (dy < -SWIPE_DOWN_THRESHOLD && settingsOpen) onOpenSettings()
  }

  const dropStaleSeparators = (items: readonly TopBarItem[]): readonly TopBarItem[] =>
    items.filter((it, i) => it.type !== 'separator' || items[i - 1]?.type === 'modeFlag')

  const layout: readonly TopBarItem[] = topBar.layout ?? DEFAULT_TOP_BAR_LAYOUT
  const leftItems = dropStaleSeparators(layout.filter((it) => it.position === 'left'))
  const centerItems = dropStaleSeparators(layout.filter((it) => it.position === 'center'))
  const rightItems = dropStaleSeparators(layout.filter((it) => it.position === 'right'))

  const renderFlagBadge = (key: number, text: string) => (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <span key={key} className={FLAG_BADGE} style={{ gap: flagGap }}>
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <span className={FLAG_SQUARE} style={{ width: flagSquare, height: flagSquare }} />
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <span className={FLAG_TEXT} style={{ fontSize: fs }}>
        {text}
      </span>
    </span>
  )

  const dimClass = cn(dimText({ day: isDayMode }))

  const renderItem = (item: TopBarItem, key: number) => {
    switch (item.type) {
      case 'statusDot':
        return (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <span key={key} className={STATUS_DOT} style={{ width: dot, height: dot }} />
        )
      case 'label':
        return (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <span key={key} className={dimClass} style={{ fontSize: fs }}>
            {item.text}
          </span>
        )
      case 'separator':
        // eslint-disable-next-line no-inline-style/no-inline-style
        return <span key={key} className={SEPARATOR} style={{ height: sep }} />
      case 'signal':
        return (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <span key={key} className={dimClass} style={{ fontSize: fs }}>
            {formatPreviewSignal(item.signal, item.format)}
          </span>
        )
      case 'canRate':
        return (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <span key={key} className={dimClass} style={{ fontSize: fs }}>
            842 Hz
          </span>
        )
      case 'bleIcon':
        return (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <span key={key} className={BLE_ICON} style={{ fontSize: fs }}>
            BLE
          </span>
        )
      case 'themeToggle':
        return (
          <span
            key={key}
            className={THEME_TOGGLE}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ fontSize: fs + 1, color: topBar.textColor }}
          >
            {isDayMode ? '☀' : '☾'}
          </span>
        )
      case 'modeFlag':
        return renderFlagBadge(key, item.text)
      case 'trackBadge':
        return (
          <span
            key={key}
            className={cn(dimClass, TRACK_BADGE)}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ fontSize: fs }}
          >
            {'LAP 4\u00A0\u00A0\u00A01:38.42'}
          </span>
        )
    }
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={cn(BAR, barRule({ settingsOpen }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        height: h,
        background: settingsOpen ? topBar.bgColor + 'CC' : topBar.bgColor,
        padding: `0 ${String(px)}px`,
      }}
    >
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={GROUP} style={{ gap }}>
        {leftItems.map((it, i) => renderItem(it, i))}
      </div>

      {centerItems.length > 0 && (
        // eslint-disable-next-line no-inline-style/no-inline-style
        <div className={CENTER_GROUP} style={{ gap }}>
          {centerItems.map((it, i) => renderItem(it, i))}
        </div>
      )}

      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={GROUP} style={{ gap }}>
        {rightItems.map((it, i) => renderItem(it, i))}
      </div>

      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={CHEVRON} style={{ fontSize: fs * 0.7 }}>
        ▾
      </div>
    </div>
  )
}
