import { Checkbox } from '../ui/checkbox'
import { useObservabilityStore } from '../../stores/observability.store'

export const DiagnosticsToggle = () => {
  const enabled = useObservabilityStore((s) => s.enabled)
  const setEnabled = useObservabilityStore((s) => s.setEnabled)
  return (
    <label className="flex max-w-[520px] cursor-pointer items-start gap-2.5 text-[12px] leading-[1.5] text-ui-muted">
      <Checkbox
        checked={enabled}
        onCheckedChange={(checked) => {
          setEnabled(checked === true)
        }}
      />
      <span>
        Share anonymous diagnostics — feature usage, never dashboards or CAN data. Applies
        immediately.
      </span>
    </label>
  )
}
