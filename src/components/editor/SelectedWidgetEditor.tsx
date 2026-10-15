import type { Widget } from '@canshift/core'
import { cn } from '@/lib/utils'
import type { GaugeThresholds } from './sidebar/useGaugeThresholds'

const FIELD =
  'w-full border border-ui-line-strong bg-transparent px-[7px] py-[5px] font-mono text-[13px] text-ui-ink outline-none'
const LABEL = 'mb-[5px] block font-mono text-[10px] tracking-[0.16em]'

const NAME_UNAVAILABLE = 'This widget draws no label on the dash.'
const THRESHOLD_UNAVAILABLE = 'Only a gauge colours itself by threshold.'

export interface SelectedWidgetEditorProps {
  widget: Widget
  name: string
  nameEditable: boolean
  onName: (name: string) => void
  onMove: (direction: 1 | -1) => void
  canMoveUp: boolean
  canMoveDown: boolean
  thresholds: GaugeThresholds
}

export const parseThreshold = (raw: string): number | null => {
  const parsed = Number(raw)
  return raw.trim().length === 0 || !Number.isFinite(parsed) ? null : parsed
}

type NameRowProps = Pick<
  SelectedWidgetEditorProps,
  'name' | 'nameEditable' | 'onName' | 'onMove' | 'canMoveUp' | 'canMoveDown'
>

const NameRow = ({ name, nameEditable, onName, onMove, canMoveUp, canMoveDown }: NameRowProps) => (
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
    <MoveButton label="Move up" disabled={!canMoveUp} onClick={() => onMove(-1)}>
      <path d="M8 13 V4 M4 8 L8 4 L12 8" />
    </MoveButton>
    <MoveButton label="Move down" disabled={!canMoveDown} onClick={() => onMove(1)}>
      <path d="M8 3 V12 M4 8 L8 12 L12 8" />
    </MoveButton>
  </div>
)

interface ThresholdFieldProps {
  label: string
  tone: string
  value: number | null
  editable: boolean
  onValue: (value: number | null) => void
}

const ThresholdField = ({ label, tone, value, editable, onValue }: ThresholdFieldProps) => (
  <label className="block">
    <span className={cn(LABEL, tone)}>{label}</span>
    <input
      value={value === null ? '' : String(value)}
      readOnly={!editable}
      placeholder="—"
      title={editable ? undefined : THRESHOLD_UNAVAILABLE}
      aria-label={`${label.toLowerCase()} threshold`}
      spellCheck={false}
      onChange={(e) => {
        onValue(parseThreshold(e.target.value))
      }}
      className={cn(FIELD, !editable && 'cursor-not-allowed text-ui-faint')}
    />
  </label>
)

const ThresholdDirection = ({ thresholds }: { thresholds: GaugeThresholds }) => (
  <select
    value={thresholds.below ? 'below' : 'above'}
    disabled={!thresholds.editable}
    aria-label="Threshold direction"
    onChange={(e) => {
      thresholds.setBelow(e.target.value === 'below')
    }}
    className="border border-ui-line-strong bg-transparent px-1 py-1.5 font-mono text-[12.5px] text-ui-ink disabled:cursor-not-allowed disabled:text-ui-faint"
  >
    <option value="above">above</option>
    <option value="below">below</option>
  </select>
)

const ThresholdRow = ({ thresholds }: { thresholds: GaugeThresholds }) => (
  <div className="grid grid-cols-[1fr_1fr_84px] items-end gap-2">
    <ThresholdField
      label="WARN AT"
      tone="text-ui-warning"
      value={thresholds.warnAt}
      editable={thresholds.editable}
      onValue={thresholds.setWarnAt}
    />
    <ThresholdField
      label="DANGER AT"
      tone="text-ui-danger"
      value={thresholds.dangerAt}
      editable={thresholds.editable}
      onValue={thresholds.setDangerAt}
    />
    <ThresholdDirection thresholds={thresholds} />
  </div>
)

export const SelectedWidgetEditor = ({
  widget,
  thresholds,
  ...props
}: SelectedWidgetEditorProps) => (
  <div className="shrink-0 border-t-2 border-ui-rule bg-ui-panel px-4 pb-[15px] pt-[13px]">
    <NameRow {...props} />
    <ThresholdRow thresholds={thresholds} />
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
