import { SquareButton, type SquareTone } from './SquareButton'

export interface PageOps {
  onAdd: () => void
  onSetBoot: () => void
  onDuplicate: () => void
  onMoveEarlier: () => void
  onMoveLater: () => void
  onDelete: () => void
  canAdd: boolean
  isBoot: boolean
  canMoveEarlier: boolean
  canMoveLater: boolean
  canDelete: boolean
}

interface PageOpSpec {
  key: string
  icon: string
  label: (ops: PageOps) => string
  action: (ops: PageOps) => () => void
  enabled: (ops: PageOps) => boolean
  tone: (ops: PageOps) => SquareTone
}

const always = () => true
const plain = (): SquareTone => 'default'

const PAGE_OPS: readonly PageOpSpec[] = [
  {
    key: 'add',
    icon: 'M8 3 V13 M3 8 H13',
    label: () => 'Add a page',
    action: (ops) => ops.onAdd,
    enabled: (ops) => ops.canAdd,
    tone: plain,
  },
  {
    key: 'boot',
    icon: 'M8 2 L10 6.4 L14.6 7 L11.2 10.2 L12.1 14.8 L8 12.6 L3.9 14.8 L4.8 10.2 L1.4 7 L6 6.4 Z',
    label: (ops) => (ops.isBoot ? 'This page boots the dash' : 'Boot the dash on this page'),
    action: (ops) => ops.onSetBoot,
    enabled: always,
    tone: (ops) => (ops.isBoot ? 'active' : 'default'),
  },
  {
    key: 'duplicate',
    icon: 'M5.5 5.5 H13 V13 H5.5 Z M10.5 5.5 V3 H3 V10.5 H5.5',
    label: () => 'Duplicate this page',
    action: (ops) => ops.onDuplicate,
    enabled: (ops) => ops.canAdd,
    tone: plain,
  },
  {
    key: 'earlier',
    icon: 'M8 13 V4 M4 8 L8 4 L12 8',
    label: () => 'Move this page earlier',
    action: (ops) => ops.onMoveEarlier,
    enabled: (ops) => ops.canMoveEarlier,
    tone: plain,
  },
  {
    key: 'later',
    icon: 'M8 3 V12 M4 8 L8 12 L12 8',
    label: () => 'Move this page later',
    action: (ops) => ops.onMoveLater,
    enabled: (ops) => ops.canMoveLater,
    tone: plain,
  },
  {
    key: 'delete',
    icon: 'M3 5 H13 M6.5 5 V3.5 H9.5 V5 M4.5 5 L5.2 13 H10.8 L11.5 5',
    label: () => 'Delete this page',
    action: (ops) => ops.onDelete,
    enabled: (ops) => ops.canDelete,
    tone: () => 'danger',
  },
]

export const PageOpsCluster = ({ ops }: { ops: PageOps }) => (
  <div className="flex gap-px">
    {PAGE_OPS.map((spec) => (
      <SquareButton
        key={spec.key}
        label={spec.label(ops)}
        onClick={spec.action(ops)}
        disabled={!spec.enabled(ops)}
        tone={spec.tone(ops)}
      >
        <path d={spec.icon} />
      </SquareButton>
    ))}
  </div>
)
