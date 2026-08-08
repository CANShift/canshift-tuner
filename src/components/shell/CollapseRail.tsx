import type { CSSProperties } from 'react'

type Side = 'left' | 'right'

const Chevron = ({ dir }: { dir: Side }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}
  >
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface CollapseRailProps {
  side: Side
  label: string
  onExpand: () => void
}

export const CollapseRail = ({ side, label, onExpand }: CollapseRailProps) => (
  <div style={railStyle(side)}>
    <button
      type="button"
      onClick={onExpand}
      title={`Expand ${label}`}
      aria-label={`Expand ${label}`}
      className="shell-nav-item"
      style={railButtonStyle}
    >
      <Chevron dir={side === 'left' ? 'right' : 'left'} />
    </button>
    <span style={railLabelStyle}>{label}</span>
  </div>
)

interface CollapseButtonProps {
  side: Side
  label: string
  onCollapse: () => void
}

export const CollapseButton = ({ side, label, onCollapse }: CollapseButtonProps) => (
  <button
    type="button"
    onClick={onCollapse}
    title={`Collapse ${label}`}
    aria-label={`Collapse ${label}`}
    className="shell-nav-item"
    style={collapseButtonStyle}
  >
    <Chevron dir={side === 'left' ? 'left' : 'right'} />
  </button>
)

const railStyle = (side: Side): CSSProperties => ({
  width: 30,
  flexShrink: 0,
  background: 'hsl(var(--brand-neutral-100))',
  ...(side === 'left'
    ? { borderRight: '2px solid var(--brand-divider)' }
    : { borderLeft: '2px solid var(--brand-divider)' }),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  paddingTop: 10,
})

const railButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  border: 0,
  background: 'transparent',
  color: 'hsl(var(--brand-neutral-600))',
  cursor: 'pointer',
}

const railLabelStyle: CSSProperties = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'hsl(var(--brand-neutral-600))',
  userSelect: 'none',
}

const collapseButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  flexShrink: 0,
  border: 0,
  background: 'transparent',
  color: 'hsl(var(--brand-neutral-600))',
  cursor: 'pointer',
}
