import { BOARD_PROFILES, type BoardProfile } from '@canshift/core'
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
      <span className="block border border-ui-line-strong bg-ui-panel px-3 py-2.5 pr-16 transition-colors hover:border-brand-accent peer-checked:border-brand-accent peer-checked:bg-brand-accent/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent">
        <span className="block text-sm font-semibold text-ui-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ui-muted">{summary}</span>
      </span>
    </label>
    {onDelete && (
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-2 text-xs text-ui-muted transition-colors hover:text-brand-accent"
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

const GROUP_LABEL = 'text-[10px] font-extrabold uppercase tracking-[0.18em] text-ui-muted'

const boardSummary = (profile: BoardProfile): string =>
  `${profile.chipFamily.toUpperCase()} · ${profile.lcd.driver} · ${profile.touch.driver}`

const KnownBoards = ({ selected }: { selected: SelectedBoard | null }) => {
  const selectCatalog = useBoardConfigStore((s) => s.selectCatalog)
  return (
    <div className="grid gap-2">
      <span className={GROUP_LABEL}>Known boards</span>
      {BOARD_PROFILES.map((board) => (
        <BoardCard
          key={board.boardId}
          title={board.boardName}
          summary={boardSummary(board)}
          checked={isSelected(selected, 'catalog', board.boardId)}
          onSelect={() => selectCatalog(board.boardId)}
        />
      ))}
    </div>
  )
}

const CustomBoards = ({ selected }: { selected: SelectedBoard | null }) => {
  const customBoards = useBoardConfigStore((s) => s.customBoards)
  const selectCustom = useBoardConfigStore((s) => s.selectCustom)
  const deleteCustom = useBoardConfigStore((s) => s.deleteCustom)
  if (customBoards.length === 0) return null
  return (
    <div className="grid gap-2">
      <span className={GROUP_LABEL}>Custom boards</span>
      {customBoards.map((entry) => (
        <BoardCard
          key={entry.id}
          title={entry.name}
          summary={boardSummary(entry.profile)}
          checked={isSelected(selected, 'custom', entry.id)}
          onSelect={() => selectCustom(entry.id)}
          onDelete={() => deleteCustom(entry.id)}
        />
      ))}
    </div>
  )
}

export const BoardPicker = () => {
  const selected = useBoardConfigStore((s) => s.selected)
  return (
    <div className="grid gap-4">
      <KnownBoards selected={selected} />
      <CustomBoards selected={selected} />
    </div>
  )
}
