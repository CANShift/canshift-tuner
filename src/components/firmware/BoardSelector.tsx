import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { boardLabel, boardSummary, type BoardManifestEntry } from '../../lib/firmware/manifest'
import { FALLBACK_BOARD_ID } from '../../lib/firmware/manifest'
import type { ManifestState } from '../../hooks/useFirmwareManifest'
import { Eyebrow, MetaText } from '../ui/meta-text'

export interface BoardSelectorProps {
  manifestState: ManifestState
  boards: BoardManifestEntry[]
  selectedId: string | null
  detected: boolean
  onSelect: (id: string) => void
}

export const BoardSelector = ({
  manifestState,
  boards,
  selectedId,
  detected,
  onSelect,
}: BoardSelectorProps) => {
  if (manifestState.kind === 'idle') return null

  if (manifestState.kind === 'loading') {
    return (
      <div className={PANEL_BLOCK}>
        <Eyebrow className="uppercase tracking-[0.18em]">Board</Eyebrow>
        <span className={NOTE}>Reading the release board manifest…</span>
      </div>
    )
  }

  if (manifestState.kind === 'none' || manifestState.kind === 'error') {
    return (
      <div className={PANEL_BLOCK}>
        <Eyebrow className="uppercase tracking-[0.18em]">Board</Eyebrow>
        <span className={NOTE}>
          {manifestState.kind === 'error'
            ? `Couldn't read the board manifest (${manifestState.message}). `
            : 'This release predates per-board builds. '}
          Falling back to the single {boardLabel(FALLBACK_BOARD_ID)} ({FALLBACK_BOARD_ID}) image.
        </span>
      </div>
    )
  }

  const selected = boards.find((board) => board.id === selectedId) ?? null

  return (
    <div className={PANEL_BLOCK}>
      <Eyebrow className="uppercase tracking-[0.18em]">Board</Eyebrow>
      {detected && selected && (
        <MetaText className="self-start border border-success px-2.5 py-[3px] text-brand-text">
          Detected: {boardLabel(selected.id)}
        </MetaText>
      )}
      <Select {...(selectedId !== null ? { value: selectedId } : {})} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select your board" />
        </SelectTrigger>
        <SelectContent>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {boardLabel(board.id)} — {boardSummary(board)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && <MetaText>{boardSummary(selected)}</MetaText>}
    </div>
  )
}

const PANEL_BLOCK = 'flex flex-col gap-2 border-b border-brand-neutral-200 px-6 py-4'

const NOTE = 'text-[12px] leading-[1.5] text-brand-neutral-700'
