import { useEffect, useState } from 'react'

export interface ConfigNameFieldProps {
  name: string
  onCommit: (name: string) => void
}

const useNameDraft = ({ name, onCommit }: ConfigNameFieldProps) => {
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
  return { draft, setDraft, commit, reset: () => setDraft(name) }
}

const KEY_ACTIONS: Record<string, (input: HTMLInputElement, reset: () => void) => void> = {
  Enter: (input) => input.blur(),
  Escape: (_input, reset) => reset(),
}

export const ConfigNameField = (props: ConfigNameFieldProps) => {
  const { draft, setDraft, commit, reset } = useNameDraft(props)
  return (
    <input
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value)
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        KEY_ACTIONS[e.key]?.(e.currentTarget, reset)
      }}
      spellCheck={false}
      title="Config name"
      aria-label="Config name"
      className="ml-1 min-w-[56px] flex-[0_1_160px] self-center border border-ui-header-line bg-transparent px-2 py-[5px] font-mono text-[12px] text-ui-header-ink outline-none"
    />
  )
}
