import { useEffect, useRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '../../stores/dashboard.store'

const EMPTY = 'flex-1 px-[18px] py-6 text-[12px] leading-[1.5] text-brand-neutral-500'

const PANEL = 'flex min-h-0 flex-1 flex-col'

const HEADER = [
  'border-b-2 border-solid border-brand-divider px-[18px] py-3',
  'text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-neutral-600',
].join(' ')

const LIST = 'min-h-0 flex-1 overflow-y-auto'

const row = cva(
  [
    'flex w-full items-baseline gap-2.5 px-[18px] py-2 text-left',
    'border-0 border-b border-solid border-brand-neutral-300 bg-transparent',
    '[font-family:inherit]',
  ].join(' '),
  {
    variants: {
      state: {
        latest: 'cursor-default text-brand-neutral-700',
        past: 'cursor-pointer text-brand-neutral-700',
        future: 'cursor-pointer text-brand-neutral-500',
      },
    },
    defaultVariants: { state: 'past' },
  }
)

const CURRENT_ROW = [
  'flex items-center gap-2.5 px-[18px] py-2',
  'border-b border-solid border-brand-neutral-300 bg-brand-neutral-100',
  'shadow-[inset_3px_0_0_hsl(var(--brand-accent))]',
  'text-[12px] font-extrabold text-brand-text',
].join(' ')

const CURRENT_DOT = 'h-[7px] w-[7px] shrink-0 bg-brand-accent'

const INDEX = 'shrink-0 font-mono text-[10px] text-brand-neutral-500'

const LABEL = 'overflow-hidden text-ellipsis whitespace-nowrap text-[12px]'

const HistoryPanel = () => {
  const past = useDashboardStore((s) => s.past)
  const future = useDashboardStore((s) => s.future)
  const jumpTo = useDashboardStore((s) => s.jumpTo)
  const currentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest' })
  }, [past.length, future.length])

  if (past.length === 0 && future.length === 0) {
    return (
      <div className={EMPTY}>
        No history yet — every edit lands here, and clicking an entry jumps the canvas back to that
        state.
      </div>
    )
  }

  return (
    <div className={PANEL}>
      <div className={HEADER}>
        {past.length + future.length} step{past.length + future.length === 1 ? '' : 's'}
      </div>
      <div className={LIST}>
        {past.map((entry, i) => {
          const isLatestDone = i === past.length - 1
          return (
            <button
              key={`p${String(i)}`}
              type="button"
              onClick={() => {
                if (!isLatestDone) jumpTo({ kind: 'past', index: i + 1 })
              }}
              className={cn(row({ state: isLatestDone ? 'latest' : 'past' }))}
              title={
                isLatestDone ? 'This is the current state' : 'Jump back to just after this action'
              }
            >
              <span className={INDEX}>{String(i + 1).padStart(2, '0')}</span>
              <span className={LABEL}>{entry.label}</span>
            </button>
          )
        })}
        <div ref={currentRef} className={CURRENT_ROW}>
          <span className={CURRENT_DOT} />
          Current state
        </div>
        {future.map((entry, k) => (
          <button
            key={`f${String(k)}`}
            type="button"
            onClick={() => {
              jumpTo({ kind: 'future', index: k })
            }}
            className={cn(row({ state: 'future' }))}
            title="Jump forward to just after this action"
          >
            <span className={INDEX}>{String(past.length + k + 1).padStart(2, '0')}</span>
            <span className={LABEL}>{entry.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default HistoryPanel
