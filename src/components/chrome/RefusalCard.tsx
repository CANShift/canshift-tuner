import type { Refusal } from '../../lib/sync/refusal'

export interface RefusalCardProps {
  refusal: Refusal
}

export const RefusalCard = ({ refusal }: RefusalCardProps) => (
  <div className="flex flex-col gap-1.5 rounded-[12px] border border-app-border bg-app-bg p-3.5">
    <span className="text-xs text-app-muted">{refusal.where}</span>
    <span className="text-base leading-snug">{refusal.text}</span>
  </div>
)
