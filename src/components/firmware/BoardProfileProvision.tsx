import { Link } from 'react-router-dom'
import { useProvisionBoardProfile } from '../../hooks/useProvisionBoardProfile'
import { cn } from '@/lib/utils'
import { Eyebrow } from '../ui/meta-text'

export const BoardProfileProvision = () => {
  const { resolved, linked, canProvision, state, provision } = useProvisionBoardProfile()

  return (
    <div className="flex flex-col gap-2.5 border-t border-brand-neutral-200 px-6 py-4">
      <Eyebrow className="uppercase tracking-[0.18em]">Board profile</Eyebrow>

      {resolved === null ? (
        <span className={NOTE}>
          Pick a board on the{' '}
          <Link to="/board" className="text-brand-accent underline">
            Board config
          </Link>{' '}
          page to provision it after flashing.
        </span>
      ) : (
        <>
          <span className="font-mono text-[12px] text-brand-text">
            {resolved.profile.boardName} ({resolved.source})
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canProvision}
              onClick={provision}
              className={cn(
                'shell-link-button border border-brand-neutral-400 bg-transparent px-5 py-[11px] text-[13px] font-extrabold tracking-[0.07em]',
                canProvision
                  ? 'cursor-pointer text-brand-text'
                  : 'cursor-not-allowed text-brand-neutral-500'
              )}
            >
              {state.kind === 'writing' ? 'WRITING…' : 'PROVISION BOARD PROFILE'}
            </button>
            {!linked && <span className={NOTE}>Connect the dash to provision over USB.</span>}
          </div>
          <span className="text-[11px] leading-[1.5] text-brand-neutral-600">
            A full flash wipes NVS — provision the board profile so the dash boots configured. On an
            already-running dash this saves the profile and reboots it.
          </span>
        </>
      )}

      {state.kind === 'ok' && (
        <div className={cn(CARD, 'border-success')}>
          Board profile saved.
          {state.restart ? ' The dash is rebooting — reconnect from Welcome when it returns.' : ''}
        </div>
      )}
      {state.kind === 'invalid' && (
        <div className={cn(CARD, ERROR_CARD)}>
          The firmware rejected this profile (invalid_board_profile). Re-check the board definition
          on the Board config page.
        </div>
      )}
      {state.kind === 'error' && (
        <div className={cn(CARD, ERROR_CARD)}>Board profile write failed — {state.message}.</div>
      )}
    </div>
  )
}

const NOTE = 'text-[12px] leading-[1.5] text-brand-neutral-700'

const CARD = 'border px-3.5 py-2.5 text-[12px] leading-[1.5] text-brand-text'

const ERROR_CARD =
  'border-brand-accent bg-[color-mix(in_srgb,hsl(var(--brand-accent))_8%,transparent)]'
