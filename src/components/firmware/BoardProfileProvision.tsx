import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useProvisionBoardProfile } from '../../hooks/useProvisionBoardProfile'
import { MONO_FONT } from '../../lib/typography'

export const BoardProfileProvision = () => {
  const { resolved, linked, canProvision, state, provision } = useProvisionBoardProfile()

  return (
    <div style={wrapperStyle}>
      <span style={labelStyle}>Board profile</span>

      {resolved === null ? (
        <span style={noteStyle}>
          Pick a board on the{' '}
          <Link to="/board" style={linkStyle}>
            Board config
          </Link>{' '}
          page to provision it after flashing.
        </span>
      ) : (
        <>
          <span style={summaryStyle}>
            {resolved.profile.boardName} ({resolved.source})
          </span>
          <div style={actionsRowStyle}>
            <button
              type="button"
              className="shell-link-button"
              disabled={!canProvision}
              onClick={provision}
              style={buttonStyle(!canProvision)}
            >
              {state.kind === 'writing' ? 'WRITING…' : 'PROVISION BOARD PROFILE'}
            </button>
            {!linked && <span style={noteStyle}>Connect the dash to provision over USB.</span>}
          </div>
          <span style={hintStyle}>
            A full flash wipes NVS — provision the board profile so the dash boots configured. On an
            already-running dash this saves the profile and reboots it.
          </span>
        </>
      )}

      {state.kind === 'ok' && (
        <div style={successCardStyle}>
          Board profile saved.
          {state.restart ? ' The dash is rebooting — reconnect from Welcome when it returns.' : ''}
        </div>
      )}
      {state.kind === 'invalid' && (
        <div style={errorCardStyle}>
          The firmware rejected this profile (invalid_board_profile). Re-check the board definition
          on the Board config page.
        </div>
      )}
      {state.kind === 'error' && (
        <div style={errorCardStyle}>Board profile write failed — {state.message}.</div>
      )}
    </div>
  )
}

const wrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '16px 24px',
  borderTop: '1px solid hsl(var(--brand-neutral-200))',
}

const labelStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'hsl(var(--brand-neutral-600))',
}

const summaryStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 12,
  color: 'hsl(var(--brand-text))',
}

const actionsRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
}

const buttonStyle = (disabled: boolean): CSSProperties => ({
  padding: '11px 20px',
  background: 'none',
  border: '1px solid hsl(var(--brand-neutral-400))',
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: '0.07em',
  color: disabled ? 'hsl(var(--brand-neutral-500))' : 'hsl(var(--brand-text))',
  cursor: disabled ? 'not-allowed' : 'pointer',
})

const noteStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-neutral-700))',
}

const hintStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-neutral-600))',
}

const linkStyle: CSSProperties = {
  color: 'hsl(var(--brand-accent))',
  textDecoration: 'underline',
}

const successCardStyle: CSSProperties = {
  padding: '10px 14px',
  border: '1px solid hsl(var(--success))',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-text))',
}

const errorCardStyle: CSSProperties = {
  padding: '10px 14px',
  border: '1px solid hsl(var(--brand-accent))',
  background: 'color-mix(in srgb, hsl(var(--brand-accent)) 8%, transparent)',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-text))',
}
