import { useEffect, useState } from 'react'

export interface ConfigNameFieldProps {
  name: string
  onCommit: (name: string) => void
}

export const ConfigNameField = ({ name, onCommit }: ConfigNameFieldProps) => {
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    setDraft(name)
  }, [name])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed.length === 0 || trimmed === name) {
      setDraft(name)
      return
    }
    onCommit(trimmed)
  }

  return (
    <input
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value)
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') setDraft(name)
      }}
      spellCheck={false}
      title="Config name"
      aria-label="Config name"
      className="ml-1 min-w-[56px] flex-[0_1_160px] self-center border border-ui-header-line bg-transparent px-2 py-[5px] font-mono text-[12px] text-ui-header-ink outline-none"
    />
  )
}
