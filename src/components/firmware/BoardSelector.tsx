import type { CSSProperties } from 'react'
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
import { MONO_FONT } from '../../lib/typography'

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
      <div style={wrapperStyle}>
        <span style={labelStyle}>Board</span>
        <span style={noteStyle}>Reading the release board manifest…</span>
      </div>
    )
  }

  if (manifestState.kind === 'none' || manifestState.kind === 'error') {
    return (
      <div style={wrapperStyle}>
        <span style={labelStyle}>Board</span>
        <span style={noteStyle}>
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
    <div style={wrapperStyle}>
      <span style={labelStyle}>Board</span>
      {detected && selected && (
        <span style={detectedPillStyle}>Detected: {boardLabel(selected.id)}</span>
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
      {selected && <span style={summaryStyle}>{boardSummary(selected)}</span>}
    </div>
  )
}

const wrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 24px',
  borderBottom: '1px solid hsl(var(--brand-neutral-200))',
}

const labelStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'hsl(var(--brand-neutral-600))',
}

const detectedPillStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '3px 10px',
  border: '1px solid hsl(var(--success))',
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-text))',
}

const summaryStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const noteStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-neutral-700))',
}
