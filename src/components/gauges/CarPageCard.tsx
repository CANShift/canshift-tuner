import type { TopBarConfig } from '@canshift/core'
import { Checkbox } from '@/components/ui/checkbox'
import { STRINGS } from '../../strings'
import { pageName } from '../../lib/sync/describe'
import { PHONE_PREVIEW_SCALE } from '../../lib/gauges/preview-scale'
import type { CarPageProposal } from '../../lib/gauges/car-pages'
import { PageFace } from './PageFace'

export interface CarPageCardProps {
  proposal: CarPageProposal
  topBar: TopBarConfig
  checked: boolean
  disabled: boolean
  onToggle: (checked: boolean) => void
}

const inputIdOf = (proposal: CarPageProposal): string => `car-page-${proposal.id}`

const CARD = [
  'flex cursor-pointer flex-col gap-3 rounded-[12px] border border-app-border bg-app-bg p-3',
  'has-[[data-state=checked]]:border-app-accent has-[button:disabled]:cursor-not-allowed',
  'has-[button:disabled]:opacity-50',
].join(' ')

const CardHeading = ({
  proposal,
  checked,
  disabled,
  onToggle,
}: Omit<CarPageCardProps, 'topBar'>) => (
  <span className="flex items-center gap-3">
    <Checkbox
      id={inputIdOf(proposal)}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(state) => {
        onToggle(state === true)
      }}
    />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[15px] font-semibold">{pageName(proposal.page)}</span>
      <span className="text-[13px] text-app-muted">{STRINGS.gauges.carPageAbout[proposal.id]}</span>
    </span>
    <span className="shrink-0 text-[13px] text-app-muted">
      {STRINGS.gauges.layoutGauges(proposal.page.widgets.length)}
    </span>
  </span>
)

export const CarPageCard = ({ topBar, ...heading }: CarPageCardProps) => (
  <li>
    <label htmlFor={inputIdOf(heading.proposal)} className={CARD}>
      <CardHeading {...heading} />
      <span aria-hidden="true" className="pointer-events-none self-center font-sans">
        <PageFace page={heading.proposal.page} topBar={topBar} scale={PHONE_PREVIEW_SCALE} />
      </span>
    </label>
  </li>
)
