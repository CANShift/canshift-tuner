const DONE_BORDER = 'border-t-[3px] border-t-[#00cc2a]'

export interface FlashDonePanelProps {
  outcome: string
  provisionLabel: string | null
  onOpenDash: () => void
  onFlashAnother: () => void
  onProvision: () => void
}

export const FlashDonePanel = ({
  outcome,
  provisionLabel,
  onOpenDash,
  onFlashAnother,
  onProvision,
}: FlashDonePanelProps) => (
  <div className={`mb-9 bg-ui-panel px-7 py-6 ${DONE_BORDER}`}>
    <p className="font-mono text-[10.5px] tracking-[0.2em] text-ui-muted">DONE</p>
    <p className="mb-6 mt-3 font-mono text-[22px] leading-[1.3] text-ui-ink">{outcome}</p>
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        onClick={onOpenDash}
        className="cursor-pointer border-0 bg-ui-accent px-[22px] py-[15px] text-[13px] font-extrabold tracking-[0.09em] text-white hover:bg-ui-accent-hover"
      >
        OPEN THE DASH
      </button>
      <button
        type="button"
        onClick={onFlashAnother}
        className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-ui-muted underline hover:text-ui-ink"
      >
        Flash another version
      </button>
      {provisionLabel !== null && (
        <button
          type="button"
          onClick={onProvision}
          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-ui-muted underline hover:text-ui-ink"
        >
          {provisionLabel}
        </button>
      )}
    </div>
  </div>
)
