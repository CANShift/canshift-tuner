import type { CSSProperties } from 'react'
import { BoardPicker } from '../components/board-config/BoardPicker'
import { CustomBoardBuilder } from '../components/board-config/CustomBoardBuilder'
import { useResolvedBoardProfile } from '../hooks/useResolvedBoardProfile'
import { MONO_FONT } from '../lib/typography'

const BoardConfigRoute = () => {
  const resolved = useResolvedBoardProfile()

  return (
    <div style={containerStyle}>
      <header style={toolbarStyle}>
        <span style={titleStyle}>Board configuration</span>
        <span style={toolInfoStyle}>select a known board, or define your own</span>
      </header>
      <div style={bodyStyle}>
        <section style={columnStyle}>
          <h2 style={sectionTitleStyle}>Pick a board</h2>
          <BoardPicker />
          {resolved && (
            <div style={resolvedCardStyle}>
              <div style={resolvedHeadStyle}>
                Resolved profile — {resolved.profile.boardName} ({resolved.source})
              </div>
              <pre style={blobStyle}>{resolved.blob}</pre>
            </div>
          )}
        </section>
        <section style={columnStyle}>
          <h2 style={sectionTitleStyle}>Define a custom board</h2>
          <CustomBoardBuilder />
        </section>
      </div>
    </div>
  )
}

export default BoardConfigRoute

const containerStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: 'hsl(var(--brand-chrome-bg))',
  overflow: 'hidden',
}

const toolbarStyle: CSSProperties = {
  height: 48,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '0 20px',
  borderBottom: '2px solid var(--brand-divider)',
}

const titleStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 14,
  color: 'hsl(var(--brand-text))',
}

const toolInfoStyle: CSSProperties = {
  marginLeft: 'auto',
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const bodyStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: 24,
  padding: 24,
  overflowY: 'auto',
}

const columnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 0,
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.06em',
  color: 'hsl(var(--brand-text))',
}

const resolvedCardStyle: CSSProperties = {
  border: '1px solid hsl(var(--success))',
}

const resolvedHeadStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: 'hsl(var(--brand-text))',
  borderBottom: '1px solid hsl(var(--brand-neutral-200))',
}

const blobStyle: CSSProperties = {
  margin: 0,
  padding: 12,
  maxHeight: 220,
  overflow: 'auto',
  fontFamily: MONO_FONT,
  fontSize: 11,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-neutral-700))',
}
