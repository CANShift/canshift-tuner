export interface ModelOption {
  id: string
  label: string
  hint: string
}

export interface ModelSelectProps {
  options: readonly ModelOption[]
  selectedId: string
  detected: boolean
  disabled: boolean
  onSelect: (id: string) => void
}

const NOTE = 'firmware builds are per model'
const DETECTED = 'read from the board'

export const ModelSelect = ({
  options,
  selectedId,
  detected,
  disabled,
  onSelect,
}: ModelSelectProps) => {
  const selected = options.find((option) => option.id === selectedId) ?? null
  return (
    <section className="mb-9">
      <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-ui-muted">MODEL</p>
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedId}
          disabled={disabled}
          aria-label="Board model"
          onChange={(e) => {
            onSelect(e.target.value)
          }}
          className="max-w-[380px] border-2 border-ui-rule bg-ui-bg py-[11px] pl-3 pr-8 font-mono text-[14px] font-bold text-ui-ink disabled:text-ui-faint"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="font-mono text-[11.5px] text-ui-muted">{detected ? DETECTED : NOTE}</span>
      </div>
      {selected && <p className="mt-2.5 text-[13px] text-ui-faint">{selected.hint}</p>}
    </section>
  )
}
