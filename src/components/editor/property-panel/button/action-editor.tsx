import {
  CRUISE_CONTROL_OPS,
  type ButtonAction,
  type CanRawAction,
  type CruiseControlAction,
  type CruiseControlOp,
  type MapSwitchAction,
  type NavigateAction,
} from '@canshift/core'

import { CompactSelect, FieldLabel, PanelInput } from '@/components/ui/form-field'
import { CRUISE_STEP_OPS, HEX_FRAME_ID_REGEX } from './shared'

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
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] text-brand-neutral-500">Map</span>
    <PanelInput
      type="number"
      min={1}
      max={8}
      className="w-[50px]"
      value={action.mapIndex}
      onChange={(e) => {
        onUpdate({ ...action, mapIndex: Number(e.target.value) })
      }}
    />
  </div>
)

const CanRawFields = ({ action, onUpdate }: FieldEditorProps<CanRawAction>) => (
  <div className="flex gap-1.5">
    <div className="flex-[0_0_70px]">
      <FieldLabel>FRAME ID</FieldLabel>
      <PanelInput
        className="text-[10px]"
        placeholder="0x123"
        value={`0x${action.frameId.toString(16).toUpperCase()}`}
        onChange={(e) => {
          const raw = e.target.value.trim()
          if (!HEX_FRAME_ID_REGEX.test(raw)) return
          onUpdate({ ...action, frameId: parseInt(raw, 16) })
        }}
      />
    </div>
    <div className="flex-1">
      <FieldLabel>DATA (HEX)</FieldLabel>
      <PanelInput
        className="font-mono text-[10px]"
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
  <div className="flex items-end gap-1.5">
    <div className="flex-1">
      <FieldLabel>OP</FieldLabel>
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
      <div className="flex-[0_0_80px]">
        <FieldLabel>STEP (KM/H)</FieldLabel>
        <PanelInput
          type="number"
          min={1}
          max={20}
          className="text-[11px]"
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
