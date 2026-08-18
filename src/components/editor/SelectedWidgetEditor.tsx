import type { Widget } from '@canshift/core'
import { cn } from '@/lib/utils'

const FIELD =
  'w-full border border-ui-line-strong bg-transparent px-[7px] py-[5px] font-mono text-[13px] text-ui-ink outline-none'
const LABEL = 'mb-[5px] block font-mono text-[10px] tracking-[0.16em]'

const NAME_UNAVAILABLE =
  'Only a button carries its own label today — every other type reads it from the signal. CANShift/canshift-core#125.'
const WARN_UNAVAILABLE =
  'No widget carries a warn threshold, and the dash draws no amber tier. CANShift/canshift-firmware#266.'
const DANGER_UNAVAILABLE = 'Only a gauge carries a danger threshold today.'

export interface SelectedWidgetEditorProps {
  widget: Widget
  name: string
  nameEditable: boolean
  onName: (name: string) => void
  onMove: (direction: 1 | -1) => void
  canMoveUp: boolean
  canMoveDown: boolean
  dangerAt: number | null
  dangerBelow: boolean
  dangerEditable: boolean
  onDangerAt: (value: number | null) => void
  onDangerBelow: (below: boolean) => void
}

export const SelectedWidgetEditor = ({
  widget,
  name,
  nameEditable,
  onName,
  onMove,
  canMoveUp,
  canMoveDown,
  dangerAt,
  dangerBelow,
  dangerEditable,
  onDangerAt,
  onDangerBelow,
}: SelectedWidgetEditorProps) => (
  <div className="shrink-0 border-t-2 border-ui-rule bg-ui-panel px-4 pb-[15px] pt-[13px]">
    <div className="mb-3 flex items-center gap-2.5">
      <span className="font-mono text-[10px] tracking-[0.16em] text-ui-muted">NAME</span>
      <input
        value={name}
        readOnly={!nameEditable}
        title={nameEditable ? undefined : NAME_UNAVAILABLE}
        aria-label="Widget name"
        spellCheck={false}
        onChange={(e) => {
          onName(e.target.value)
        }}
        className={cn(FIELD, 'flex-1 font-bold', !nameEditable && 'text-ui-faint')}
      />
      <MoveButton
        label="Move up"
        disabled={!canMoveUp}
        onClick={() => {
          onMove(-1)
        }}
      >
        <path d="M8 13 V4 M4 8 L8 4 L12 8" />
      </MoveButton>
      <MoveButton
        label="Move down"
        disabled={!canMoveDown}
        onClick={() => {
          onMove(1)
        }}
      >
        <path d="M8 3 V12 M4 8 L8 12 L12 8" />
      </MoveButton>
    </div>

    <div className="grid grid-cols-[1fr_1fr_84px] items-end gap-2">
      <label className="block">
        <span className={cn(LABEL, 'text-ui-warning')}>WARN AT</span>
        <input
          readOnly
          value=""
          placeholder="—"
          title={WARN_UNAVAILABLE}
          aria-label="Warn threshold"
          className={cn(FIELD, 'cursor-not-allowed text-ui-faint')}
        />
      </label>
      <label className="block">
        <span className={cn(LABEL, 'text-ui-danger')}>DANGER AT</span>
        <input
          value={dangerAt === null ? '' : String(dangerAt)}
          readOnly={!dangerEditable}
          placeholder="—"
          title={dangerEditable ? undefined : DANGER_UNAVAILABLE}
          aria-label="Danger threshold"
          spellCheck={false}
          onChange={(e) => {
            const parsed = Number(e.target.value)
            onDangerAt(
              e.target.value.trim().length === 0 || !Number.isFinite(parsed) ? null : parsed
            )
          }}
          className={cn(FIELD, !dangerEditable && 'cursor-not-allowed text-ui-faint')}
        />
      </label>
      <select
        value={dangerBelow ? 'below' : 'above'}
        disabled={!dangerEditable}
        aria-label="Danger direction"
        onChange={(e) => {
          onDangerBelow(e.target.value === 'below')
        }}
        className="border border-ui-line-strong bg-transparent px-1 py-1.5 font-mono text-[12.5px] text-ui-ink disabled:cursor-not-allowed disabled:text-ui-faint"
      >
        <option value="above">above</option>
        <option value="below">below</option>
      </select>
    </div>

    <p className="mt-2 font-mono text-[10.5px] text-ui-faint">{widget.type}</p>
  </div>
)

interface MoveButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

const MoveButton = ({ label, disabled, onClick, children }: MoveButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={cn(
      'grid size-7 shrink-0 place-items-center border border-ui-ink bg-transparent',
      disabled
        ? 'cursor-not-allowed border-ui-line text-ui-faint'
        : 'cursor-pointer text-ui-ink hover:bg-ui-bg'
    )}
  >
    <svg viewBox="0 0 16 16" className="w-[11px]" fill="none" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  </button>
)
