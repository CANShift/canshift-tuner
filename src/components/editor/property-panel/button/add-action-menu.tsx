import type { ButtonAction } from '@canshift/core'

import { buildActionPresets } from './shared'

const PRESET_BUTTON = 'cursor-pointer border-solid bg-transparent px-[7px] py-0.5 text-[10px]'

interface AddActionMenuProps {
  pageIds: string[]
  onAdd: (a: ButtonAction) => void
}

export const AddActionMenu = ({ pageIds, onAdd }: AddActionMenuProps) => (
  <div className="flex flex-wrap gap-1 mt-0.5">
    {buildActionPresets(pageIds).map(({ label, color, build }) => (
      <button
        key={label}
        onClick={() => {
          onAdd(build())
        }}
        className={PRESET_BUTTON}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ border: `1px solid ${color}44`, color }}
      >
        + {label}
      </button>
    ))}
  </div>
)
