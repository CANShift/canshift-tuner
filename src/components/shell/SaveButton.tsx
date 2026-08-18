import { useEffect, useState } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useUiStore } from '../../stores/ui.store'

const SAVED_FLASH_MS = 1_600

export interface SaveButtonProps {
  onSave: () => void
  disabled: boolean
}

export const SaveButton = ({ onSave, disabled }: SaveButtonProps) => {
  const savedAt = useUiStore((s) => s.savedAt)
  const markSaved = useUiStore((s) => s.markSaved)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (savedAt === null) return
    setFlashing(true)
    const timer = setTimeout(() => {
      setFlashing(false)
    }, SAVED_FLASH_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [savedAt])

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? 'Nothing to save yet' : 'Save this config in the browser (Cmd/Ctrl+S)'}
      onClick={() => {
        onSave()
        markSaved()
      }}
      className={cn(saveFace({ disabled }))}
    >
      {flashing ? 'SAVED' : 'SAVE'}
    </button>
  )
}

const saveFace = cva(
  [
    'flex items-center whitespace-nowrap border-0 border-l border-solid border-ui-header-line',
    'bg-transparent px-4 font-mono text-[11px] tracking-[0.14em]',
  ].join(' '),
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed text-ui-header-line',
        false: 'cursor-pointer text-ui-header-dim hover:text-ui-header-ink',
      },
    },
    defaultVariants: { disabled: false },
  }
)
