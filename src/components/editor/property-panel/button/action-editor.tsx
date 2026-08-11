import {
  CRUISE_CONTROL_OPS,
  type ButtonAction,
  type CanRawAction,
  type CruiseControlAction,
  type CruiseControlOp,
  type MapSwitchAction,
  type NavigateAction,
} from '@canshift/core'

import { CompactSelect } from '@/components/ui/form-field'
import { inputStyle, numberInputStyle } from '../shared'
import { CRUISE_STEP_OPS, HEX_FRAME_ID_REGEX } from './shared'
import { MONO_FONT } from '../../../../lib/typography'

interface ActionEditorProps {
  action: ButtonAction
  pageIds: string[]
  onUpdate: (updated: ButtonAction) => void
}

interface FieldEditorProps<A extends ButtonAction> {
  action: A
  pageIds: string[]
  onUpdate: (updated: ButtonAction) => void
}

const NavigateFields = ({ action, pageIds, onUpdate }: FieldEditorProps<NavigateAction>) => (
  <CompactSelect
    value={action.pageId}
    options={[
      { value: '', label: '— select page —' },
      ...pageIds.map((id) => ({ value: id, label: id })),
    ]}
    onChange={(pageId) => {
      onUpdate({ ...action, pageId })
    }}
  />
)

const MapSwitchFields = ({ action, onUpdate }: FieldEditorProps<MapSwitchAction>) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 10, color: 'hsl(var(--brand-neutral-500))' }}>Map</span>
    <input
      type="number"
      min={1}
      max={8}
      style={{ ...numberInputStyle, width: 50 }}
      value={action.mapIndex}
      onChange={(e) => {
        onUpdate({ ...action, mapIndex: Number(e.target.value) })
      }}
    />
  </div>
)

const CanRawFields = ({ action, onUpdate }: FieldEditorProps<CanRawAction>) => (
  <div style={{ display: 'flex', gap: 6 }}>
    <div style={{ flex: '0 0 70px' }}>
      <div style={{ fontSize: 9, color: 'hsl(var(--brand-neutral-600))', marginBottom: 2 }}>
        FRAME ID
      </div>
      <input
        style={{ ...inputStyle, fontSize: 10 }}
        placeholder="0x123"
        value={`0x${action.frameId.toString(16).toUpperCase()}`}
        onChange={(e) => {
          const raw = e.target.value.trim()
          if (!HEX_FRAME_ID_REGEX.test(raw)) return
          onUpdate({ ...action, frameId: parseInt(raw, 16) })
        }}
      />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, color: 'hsl(var(--brand-neutral-600))', marginBottom: 2 }}>
        DATA (HEX)
      </div>
      <input
        style={{ ...inputStyle, fontSize: 10, fontFamily: MONO_FONT }}
        placeholder="0102030405060708"
        value={action.data}
        onChange={(e) => {
          onUpdate({ ...action, data: e.target.value })
        }}
      />
    </div>
  </div>
)

const withoutStep = (action: CruiseControlAction, nextOp: CruiseControlOp): CruiseControlAction => {
  const { stepKmh: _drop, ...rest } = action
  void _drop
  return { ...rest, op: nextOp }
}

const CruiseControlFields = ({ action, onUpdate }: FieldEditorProps<CruiseControlAction>) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, color: 'hsl(var(--brand-neutral-600))', marginBottom: 2 }}>OP</div>
      <CompactSelect
        value={action.op}
        options={CRUISE_CONTROL_OPS.map((op) => ({ value: op, label: op }))}
        onChange={(next) => {
          const nextOp = next as CruiseControlOp
          const keepStep = CRUISE_STEP_OPS.has(nextOp) || action.stepKmh === undefined
          onUpdate(keepStep ? { ...action, op: nextOp } : withoutStep(action, nextOp))
        }}
      />
    </div>
    {CRUISE_STEP_OPS.has(action.op) && (
      <div style={{ flex: '0 0 80px' }}>
        <div style={{ fontSize: 9, color: 'hsl(var(--brand-neutral-600))', marginBottom: 2 }}>
          STEP (KM/H)
        </div>
        <input
          type="number"
          min={1}
          max={20}
          style={{ ...numberInputStyle, fontSize: 11 }}
          value={action.stepKmh ?? 1}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v)) onUpdate({ ...action, stepKmh: v })
          }}
        />
      </div>
    )}
  </div>
)

const FIELD_EDITORS: Record<
  ButtonAction['type'],
  (props: FieldEditorProps<ButtonAction>) => React.JSX.Element | null
> = {
  navigate: ({ action, pageIds, onUpdate }) =>
    action.type !== 'navigate' ? null : (
      <NavigateFields action={action} pageIds={pageIds} onUpdate={onUpdate} />
    ),
  map_switch: ({ action, pageIds, onUpdate }) =>
    action.type !== 'map_switch' ? null : (
      <MapSwitchFields action={action} pageIds={pageIds} onUpdate={onUpdate} />
    ),
  can_raw: ({ action, pageIds, onUpdate }) =>
    action.type !== 'can_raw' ? null : (
      <CanRawFields action={action} pageIds={pageIds} onUpdate={onUpdate} />
    ),
  cruise_control: ({ action, pageIds, onUpdate }) =>
    action.type !== 'cruise_control' ? null : (
      <CruiseControlFields action={action} pageIds={pageIds} onUpdate={onUpdate} />
    ),
}

export const ActionEditor = ({ action, pageIds, onUpdate }: ActionEditorProps) =>
  FIELD_EDITORS[action.type]({ action, pageIds, onUpdate })
