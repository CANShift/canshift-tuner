import { useEffect, useState } from 'react'

export interface ScalingInputProps {
  id: string
  label: string
  value: string
  numeric?: boolean
  onCommit: (text: string) => void
}

export const ScalingInput = ({ id, label, value, numeric = true, onCommit }: ScalingInputProps) => {
  const [text, setText] = useState(value)
  useEffect(() => {
    setText(value)
  }, [value])
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="flex-1 text-[15px]">
        {label}
      </label>
      <input
        id={id}
        value={text}
        inputMode={numeric ? 'decimal' : 'text'}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => onCommit(text)}
        onKeyDown={(event) => event.key === 'Enter' && onCommit(text)}
        className="h-12 w-[120px] rounded-control border border-app-border bg-app-bg px-3 text-right text-base text-app-text focus:border-2 focus:border-app-text"
      />
    </div>
  )
}
