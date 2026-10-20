import { STRING_CAPS } from '@canshift/core'
import { Switch } from '@/components/ui/switch'
import { CompactSelect, PanelField, PanelInput } from '@/components/ui/form-field'
import { signalName } from '../../lib/sync/describe'
import { useSignalStore } from '../../stores/signal.store'

export interface StatusTextFieldProps {
  label: string
  value: string
  maxLength?: number
  onChange: (value: string) => void
}

export const StatusTextField = ({
  label,
  value,
  maxLength = STRING_CAPS.TOPBAR_TEXT,
  onChange,
}: StatusTextFieldProps) => (
  <PanelField label={label}>
    <PanelInput
      aria-label={label}
      value={value}
      maxLength={maxLength}
      onChange={(event) => {
        onChange(event.target.value)
      }}
    />
  </PanelField>
)

export interface StatusSignalFieldProps {
  label: string
  value: string
  onChange: (signal: string) => void
}

export const StatusSignalField = ({ label, value, onChange }: StatusSignalFieldProps) => {
  const signals = useSignalStore((s) => s.signals)
  const options = signals.map((signal) => ({ value: signal.name, label: signalName(signal.name) }))
  return (
    <PanelField label={label}>
      <CompactSelect value={value} options={options} onChange={onChange} ariaLabel={label} />
    </PanelField>
  )
}

export interface StatusSwitchRowProps {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export const StatusSwitchRow = ({ label, checked, disabled, onChange }: StatusSwitchRowProps) => (
  <label className="mb-2.5 flex items-center justify-between gap-3 text-sm">
    <span>{label}</span>
    <Switch
      aria-label={label}
      checked={checked}
      disabled={disabled ?? false}
      onCheckedChange={onChange}
    />
  </label>
)

export const StatusNote = ({ children }: { children: string }) => (
  <p className="mb-2.5 text-[11px] leading-normal text-app-muted">{children}</p>
)
