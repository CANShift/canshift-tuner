import { BOARD_PROFILES } from '@canshift/core'
import { useBoardConfigStore } from '../../stores/board-config/board-config.store'
import type { SelectedBoard } from '../../stores/board-config/storage'

interface BoardCardProps {
  title: string
  summary: string
  checked: boolean
  onSelect: () => void
  onDelete?: () => void
}

const BoardCard = ({ title, summary, checked, onSelect, onDelete }: BoardCardProps) => (
  <div className="relative">
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="board-pick"
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span className="block border border-border bg-surface px-3 py-2.5 pr-16 transition-colors hover:border-brand-accent peer-checked:border-brand-accent peer-checked:bg-brand-accent/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent">
        <span className="block text-sm font-semibold text-text">{title}</span>
        <span className="mt-0.5 block text-xs text-text-muted">{summary}</span>
      </span>
    </label>
    {onDelete && (
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-2 text-xs text-text-muted transition-colors hover:text-brand-accent"
      >
        Delete
      </button>
    )}
  </div>
)

const isSelected = (
  selected: SelectedBoard | null,
  source: 'catalog' | 'custom',
  id: string
): boolean => selected !== null && selected.source === source && selected.boardId === id

export const BoardPicker = () => {
  const customBoards = useBoardConfigStore((s) => s.customBoards)
  const selected = useBoardConfigStore((s) => s.selected)
  const selectCatalog = useBoardConfigStore((s) => s.selectCatalog)
  const selectCustom = useBoardConfigStore((s) => s.selectCustom)
  const deleteCustom = useBoardConfigStore((s) => s.deleteCustom)

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
          Known boards
        </span>
        {BOARD_PROFILES.map((board) => (
          <BoardCard
            key={board.boardId}
            title={board.boardName}
            summary={`${board.chipFamily.toUpperCase()} · ${board.lcd.driver} · ${board.touch.driver}`}
            checked={isSelected(selected, 'catalog', board.boardId)}
            onSelect={() => {
              selectCatalog(board.boardId)
            }}
          />
        ))}
      </div>

      {customBoards.length > 0 && (
        <div className="grid gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
            Custom boards
          </span>
          {customBoards.map((entry) => (
            <BoardCard
              key={entry.id}
              title={entry.name}
              summary={`${entry.profile.chipFamily.toUpperCase()} · ${entry.profile.lcd.driver} · ${entry.profile.touch.driver}`}
              checked={isSelected(selected, 'custom', entry.id)}
              onSelect={() => {
                selectCustom(entry.id)
              }}
              onDelete={() => {
                deleteCustom(entry.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
