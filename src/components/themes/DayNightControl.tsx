import { useState } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '../../stores/device.store'
import { useLogStore } from '../../stores/log.store'
import { usbService } from '../../transport'
import { transportErrorText } from '../../transport/humanize-transport-error'

type Face = 'night' | 'day'

const FACE_LABELS: Record<Face, string> = { night: 'NIGHT', day: 'DAY' }
const FACES = Object.keys(FACE_LABELS) as Face[]

const useFacePicker = () => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const setIsDayMode = useDeviceStore((s) => s.setIsDayMode)
  const [busy, setBusy] = useState(false)
  const live = connected && !simulationMode
  const pick = async (face: Face) => {
    const day = face === 'day'
    if (!live) {
      setIsDayMode(day)
      return
    }
    setBusy(true)
    await switchDash(face, setIsDayMode)
    setBusy(false)
  }
  return { live, busy, pick }
}

const switchDash = async (face: Face, setIsDayMode: (day: boolean) => void) => {
  const log = useLogStore.getState().push
  const result = await usbService.setDayNight(face === 'day')
  if (!result.success) {
    log('error', `Could not switch the dash: ${transportErrorText(result.error)}`)
    return
  }
  setIsDayMode(face === 'day')
  log('success', `Dash forced to ${FACE_LABELS[face]}`)
}

export const DayNightControl = () => {
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  const { live, busy, pick } = useFacePicker()
  const active: Face = isDayMode === true ? 'day' : 'night'
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">PREVIEW</span>
      <div className="flex gap-px">
        {FACES.map((face) => (
          <button
            key={face}
            type="button"
            disabled={busy}
            onClick={() => void pick(face)}
            className={cn(segment({ active: face === active }))}
          >
            {FACE_LABELS[face]}
          </button>
        ))}
      </div>
      {!live && (
        <span className="font-mono text-[11px] text-ui-faint">
          preview only — no board attached
        </span>
      )}
    </div>
  )
}

const segment = cva(
  'cursor-pointer border border-ui-ink px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] disabled:opacity-60',
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)
