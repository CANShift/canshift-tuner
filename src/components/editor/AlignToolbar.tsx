import { useCallback } from 'react'
import { useDashboardStore } from '../../stores/dashboard.store'
import type { AlignDirection } from '../../stores/dashboard.store'

const BUTTON_CLASS = [
  'cursor-pointer border border-solid border-brand-neutral-300 bg-brand-neutral-100',
  'px-[7px] py-0.5 font-mono text-[10px] leading-[1.2] tracking-[0.03em] text-brand-neutral-600',
  'hover:border-brand-neutral-400 hover:text-brand-neutral-700',
  'focus-visible:border-brand-neutral-400 focus-visible:text-brand-neutral-700',
].join(' ')

const LABEL_CLASS = 'self-center text-[9px] uppercase tracking-[0.06em] text-brand-neutral-500'

const DIVIDER_CLASS = 'mx-0.5 h-3.5 w-px bg-brand-neutral-300'

interface ToolbarButtonProps {
  glyph: string
  title: string
  onClick: () => void
}

const ToolbarButton = ({ glyph, title, onClick }: ToolbarButtonProps) => {
  return (
    <button
      type="button"
      className={BUTTON_CLASS}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  )
}

interface AlignSpec {
  dir: AlignDirection
  glyph: string
  title: string
}

const ALIGN_SPECS: readonly AlignSpec[] = [
  { dir: 'left', glyph: '←', title: 'Align left edges' },
  { dir: 'center-h', glyph: '↔', title: 'Center horizontally' },
  { dir: 'right', glyph: '→', title: 'Align right edges' },
  { dir: 'top', glyph: '↑', title: 'Align top edges' },
  { dir: 'center-v', glyph: '↕', title: 'Center vertically' },
  { dir: 'bottom', glyph: '↓', title: 'Align bottom edges' },
]

interface DistributeSpec {
  axis: 'h' | 'v'
  glyph: string
  title: string
}

const DISTRIBUTE_SPECS: readonly DistributeSpec[] = [
  { axis: 'h', glyph: '⇔', title: 'Distribute horizontally' },
  { axis: 'v', glyph: '⇕', title: 'Distribute vertically' },
]

export interface AlignToolbarProps {
  pageId: string
  widgetIds: string[]
  canDistribute: boolean
}

export const AlignToolbar = ({ pageId, widgetIds, canDistribute }: AlignToolbarProps) => {
  const alignWidgets = useDashboardStore((s) => s.alignWidgets)
  const distributeWidgets = useDashboardStore((s) => s.distributeWidgets)

  const handleAlign = useCallback(
    (dir: AlignDirection) => {
      alignWidgets(pageId, widgetIds, dir)
    },
    [alignWidgets, pageId, widgetIds]
  )
  const handleDistribute = useCallback(
    (axis: 'h' | 'v') => {
      distributeWidgets(pageId, widgetIds, axis)
    },
    [distributeWidgets, pageId, widgetIds]
  )

  return (
    <div className="flex items-center gap-1">
      <span className={LABEL_CLASS}>Align</span>
      {ALIGN_SPECS.map((spec) => (
        <ToolbarButton
          key={spec.dir}
          glyph={spec.glyph}
          title={spec.title}
          onClick={() => {
            handleAlign(spec.dir)
          }}
        />
      ))}
      {canDistribute && (
        <>
          <div className={DIVIDER_CLASS} />
          <span className={LABEL_CLASS}>Dist</span>
          {DISTRIBUTE_SPECS.map((spec) => (
            <ToolbarButton
              key={spec.axis}
              glyph={spec.glyph}
              title={spec.title}
              onClick={() => {
                handleDistribute(spec.axis)
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
