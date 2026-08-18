export interface SettingOption {
  value: string
  label: string
}

export interface SettingRowProps {
  label: string
  note: string
  value: string
  options: readonly SettingOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export const SettingRow = ({
  label,
  note,
  value,
  options,
  onChange,
  disabled = false,
}: SettingRowProps) => (
  <div className="flex items-center gap-4 border-b border-ui-line py-3.5">
    <div>
      <div className="mb-[3px] font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
        {label}
      </div>
      <div className="text-[13px] text-ui-faint">{note}</div>
    </div>
    <select
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      className="ml-auto shrink-0 border border-ui-ink bg-ui-bg py-2 pl-2.5 pr-[26px] font-mono text-[14px] font-bold text-ui-ink hover:border-ui-accent disabled:cursor-not-allowed disabled:border-ui-line disabled:text-ui-faint"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)
