import { CANVAS, type CriticalAlertDirection } from '@canshift/core'
import { AlertTakeover } from '../editor/preview/Takeover'
import { parseThreshold } from '../editor/SelectedWidgetEditor'
import { takeoverTextFor } from '../../lib/critical-alert'
import { DeviceSection } from './DeviceSection'
import { SettingRow } from './SettingRow'
import { useCriticalAlert, type CriticalAlertEditor } from '../../hooks/useCriticalAlert'

const PREVIEW_SCALE = 0.875
const NO_SIGNAL = ''

const DIRECTION_OPTIONS = [
  { value: 'above', label: 'above' },
  { value: 'below', label: 'below' },
]

const ACKNOWLEDGE_OPTIONS = [{ value: 'dash', label: 'dash' }]

const INPUT =
  'ml-auto w-[180px] shrink-0 border border-ui-ink bg-ui-bg px-2.5 py-2 font-mono text-[14px] font-bold text-ui-ink hover:border-ui-accent disabled:cursor-not-allowed disabled:border-ui-line disabled:text-ui-faint'

const SignalRow = ({ editor }: { editor: CriticalAlertEditor }) => (
  <SettingRow
    label="SIGNAL"
    note="The one reading that takes the whole screen, on top of the built-in engine protection."
    value={editor.alert?.signal ?? NO_SIGNAL}
    options={[
      { value: NO_SIGNAL, label: 'none' },
      ...editor.signals.map((signal) => ({ value: signal.name, label: signal.name })),
    ]}
    onChange={editor.setSignal}
  />
)

const FiresAtRow = ({ editor }: { editor: CriticalAlertEditor }) => (
  <div className="flex items-center gap-4 border-b border-ui-line py-3.5">
    <div>
      <div className="mb-[3px] font-mono text-[10.5px] tracking-[0.16em] text-ui-danger">
        FIRES AT
      </div>
      <div className="text-[13px] text-ui-faint">
        {editor.unit.length > 0 ? `In ${editor.unit}.` : 'In the signal unit.'}
      </div>
    </div>
    <input
      value={editor.shownFiresAt === null ? '' : String(editor.shownFiresAt)}
      disabled={editor.alert === undefined}
      aria-label="FIRES AT"
      spellCheck={false}
      onChange={(e) => {
        editor.setFiresAt(parseThreshold(e.target.value))
      }}
      className={INPUT}
    />
  </div>
)

const DirectionRow = ({ editor }: { editor: CriticalAlertEditor }) => (
  <SettingRow
    label="DIRECTION"
    note="Above for a temperature, below for a pressure."
    value={editor.alert?.direction ?? 'above'}
    options={DIRECTION_OPTIONS}
    disabled={editor.alert === undefined}
    onChange={(value) => {
      editor.setDirection(value as CriticalAlertDirection)
    }}
  />
)

const AcknowledgeRow = ({ editor }: { editor: CriticalAlertEditor }) => (
  <SettingRow
    label="ACKNOWLEDGE ON"
    note="A tap on the dash clears it. The phone cannot acknowledge yet."
    value="dash"
    options={ACKNOWLEDGE_OPTIONS}
    disabled={editor.alert === undefined}
    onChange={() => undefined}
  />
)

const TakeoverPreview = ({ editor }: { editor: CriticalAlertEditor }) => {
  const { alert, shownFiresAt, unit } = editor
  if (alert === undefined || shownFiresAt === null) {
    return <p className="font-mono text-[12.5px] text-ui-faint">No critical alert is set.</p>
  }
  return (
    <div
      className="relative overflow-hidden font-sans"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: CANVAS.WIDTH * PREVIEW_SCALE, height: CANVAS.HEIGHT * PREVIEW_SCALE }}
    >
      <AlertTakeover scale={PREVIEW_SCALE} {...takeoverTextFor(alert, shownFiresAt, unit)} />
    </div>
  )
}

export const CriticalAlertSection = () => {
  const editor = useCriticalAlert()
  return (
    <DeviceSection title="CRITICAL ALERT">
      <div className="grid gap-8 pt-2 min-[900px]:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <SignalRow editor={editor} />
          <FiresAtRow editor={editor} />
          <DirectionRow editor={editor} />
          <AcknowledgeRow editor={editor} />
        </div>
        <div className="pt-3.5">
          <TakeoverPreview editor={editor} />
        </div>
      </div>
    </DeviceSection>
  )
}
