import { Fragment, useRef, type PointerEvent } from 'react'
import type { TopBarConfig, TopBarItem, PageStatusRow } from '@canshift/core'
import { DEFAULT_TOP_BAR_LAYOUT } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { mergePageStatusRow } from '../../lib/top-bar-layout'
import { barMetrics, renderTopBarItem, type ItemContext } from './top-bar/top-bar-items'

const SWIPE_DOWN_THRESHOLD = 18

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

type BarPosition = TopBarItem['position']

export interface DashTopBarProps {
  topBar: TopBarConfig
  statusRow?: PageStatusRow | undefined
  scale: number
  settingsOpen: boolean
  isDayMode: boolean
  onOpenSettings: () => void
}

const dropStaleSeparators = (items: readonly TopBarItem[]): readonly TopBarItem[] =>
  items.filter((it, i) => it.type !== 'separator' || items[i - 1]?.type === 'modeFlag')

const itemsAt = (layout: readonly TopBarItem[], position: BarPosition) =>
  dropStaleSeparators(layout.filter((it) => it.position === position))

const useSettingsSwipe = (settingsOpen: boolean, onOpenSettings: () => void) => {
  const swipeStartY = useRef<number | null>(null)
  const onPointerDown = (e: PointerEvent) => {
    swipeStartY.current = e.clientY
  }
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStartY.current === null) return
    const dy = e.clientY - swipeStartY.current
    swipeStartY.current = null
    const opens = dy > SWIPE_DOWN_THRESHOLD
    const closes = dy < -SWIPE_DOWN_THRESHOLD && settingsOpen
    if (opens || closes) onOpenSettings()
  }
  return { onPointerDown, onPointerUp }
}

interface ItemGroupProps {
  items: readonly TopBarItem[]
  ctx: ItemContext
  className: string
}

const ItemGroup = ({ items, ctx, className }: ItemGroupProps) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <div className={className} style={{ gap: ctx.metrics.gap }}>
    {items.map((item, i) => (
      <Fragment key={i}>{renderTopBarItem(item, ctx)}</Fragment>
    ))}
  </div>
)

export const DashTopBar = (props: DashTopBarProps) => {
  const { topBar, settingsOpen, isDayMode } = props
  const swipe = useSettingsSwipe(settingsOpen, props.onOpenSettings)
  const metrics = barMetrics(topBar.height, props.scale)
  const ctx: ItemContext = { metrics, isDayMode, textColor: topBar.textColor }
  const layout = mergePageStatusRow(topBar.layout ?? DEFAULT_TOP_BAR_LAYOUT, props.statusRow)
  const centerItems = itemsAt(layout, 'center')
  return (
    <div
      {...swipe}
      className={cn(BAR, barRule({ settingsOpen }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        height: metrics.h,
        background: settingsOpen ? topBar.bgColor + 'CC' : topBar.bgColor,
        padding: `0 ${String(metrics.px)}px`,
      }}
    >
      <ItemGroup items={itemsAt(layout, 'left')} ctx={ctx} className={GROUP} />
      {centerItems.length > 0 && (
        <ItemGroup items={centerItems} ctx={ctx} className={CENTER_GROUP} />
      )}
      <ItemGroup items={itemsAt(layout, 'right')} ctx={ctx} className={GROUP} />
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={CHEVRON} style={{ fontSize: metrics.fs * 0.7 }}>
        ▾
      </div>
    </div>
  )
}
