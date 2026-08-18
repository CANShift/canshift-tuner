import { cn } from '@/lib/utils'

export interface FooterViewProps {
  cliHandle: boolean
  cliOpen: boolean
  onToggleCli: () => void
  connected: boolean
  boardLabel: string
  ecuLabel: string
  firmwareLabel: string
}

export const FooterView = ({
  cliHandle,
  cliOpen,
  onToggleCli,
  connected,
  boardLabel,
  ecuLabel,
  firmwareLabel,
}: FooterViewProps) => (
  <footer
    className={cn(FOOTER, cliHandle && !cliOpen && 'border-t-2 border-ui-accent bg-ui-console')}
  >
    {cliHandle && (
      <button
        type="button"
        onClick={onToggleCli}
        className="flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 font-[inherit] tracking-[0.12em] text-inherit hover:text-ui-header-ink"
      >
        <span className="text-ui-engaged">&gt;</span>
        <span>CLI</span>
        <span className="text-ui-header-line">
          {cliOpen ? 'hide the console' : 'open the console'}
        </span>
        <span className="text-[12px]">{cliOpen ? '▼' : '▲'}</span>
      </button>
    )}
    {connected ? (
      <span className="ml-auto flex items-center gap-4">
        <span className="flex items-center gap-2 text-ui-ok">
          <span aria-hidden="true" className="block size-1.5 bg-current" />
          {boardLabel}
        </span>
        <span>{ecuLabel}</span>
        <span>{firmwareLabel}</span>
      </span>
    ) : (
      <span className="ml-auto text-ui-header-line">NO DEVICE · {ecuLabel}</span>
    )}
  </footer>
)

const FOOTER = [
  'flex h-[34px] shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap px-5',
  'bg-ui-header-bg font-mono text-[11px] tracking-[0.08em] text-ui-header-dim',
].join(' ')
