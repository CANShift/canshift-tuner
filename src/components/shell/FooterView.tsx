import { cn } from '@/lib/utils'

export interface FooterViewProps {
  cliOpen: boolean
  onToggleCli: () => void
}

export const FooterView = ({ cliOpen, onToggleCli }: FooterViewProps) => (
  <footer className={cn(FOOTER, !cliOpen && 'border-t-2 border-ui-accent bg-ui-console')}>
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
  </footer>
)

const FOOTER = [
  'flex h-[34px] shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap px-5',
  'bg-ui-header-bg font-mono text-[11px] tracking-[0.08em] text-ui-header-dim',
].join(' ')
