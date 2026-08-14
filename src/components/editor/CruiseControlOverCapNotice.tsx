import { InlineState } from '@/components/states/InlineState'

export interface CruiseControlOverCapNoticeProps {
  pageIds: string[]
  maxPages: number
  onDismiss: () => void
}

export const CruiseControlOverCapNotice = ({
  pageIds,
  maxPages,
  onDismiss,
}: CruiseControlOverCapNoticeProps) => (
  <InlineState
    className="m-3 mt-0"
    severity="failure"
    kicker={`PAGES ${String(pageIds.length)} · MAX ${String(maxPages)}`}
    title="The cruise-control page will not fit"
    body={`You already have ${String(pageIds.length)} pages — the firmware accepts at most ${String(maxPages)}. Remove a page first, then enable cruise control.`}
    secondaryAction={{ label: 'Dismiss', onClick: onDismiss }}
  >
    <ol className="mt-2 list-decimal pl-5 font-mono text-[11px] text-brand-neutral-700">
      {pageIds.map((id) => (
        <li key={id}>{id}</li>
      ))}
    </ol>
  </InlineState>
)
