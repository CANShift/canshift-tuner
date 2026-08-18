export interface FirmwareUpdateBandProps {
  current: string
  latest: string
  notesUrl: string
  onGoToFlash: () => void
  onDismiss: () => void
}

export const FirmwareUpdateBand = ({
  current,
  latest,
  notesUrl,
  onGoToFlash,
  onDismiss,
}: FirmwareUpdateBandProps) => (
  <div className="flex shrink-0 flex-wrap items-center gap-[18px] border-t-[3px] border-ui-accent bg-ui-header-bg px-6 py-4 text-ui-header-ink">
    <span className="whitespace-nowrap font-mono text-[10.5px] tracking-[0.18em] text-ui-accent">
      FIRMWARE UPDATE
    </span>
    <span className="whitespace-nowrap font-mono text-[17px]">
      {current} → <span className="text-ui-engaged">{latest}</span>
    </span>
    <span className="min-w-[200px] flex-1 text-[13.5px] text-ui-header-dim">
      A newer firmware is available for the dash.
    </span>
    <div className="flex gap-px">
      <button
        type="button"
        onClick={onGoToFlash}
        className="cursor-pointer whitespace-nowrap border-0 bg-ui-accent px-[18px] py-[11px] text-left text-[12.5px] font-extrabold tracking-[0.08em] text-white hover:bg-ui-accent-hover"
      >
        GO TO FLASH
      </button>
      <a
        href={notesUrl}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap border border-ui-header-line px-[18px] py-[11px] text-[12.5px] font-bold text-ui-header-dim no-underline hover:text-ui-header-ink"
      >
        Changelog ↗
      </a>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss the firmware update notice"
      className="cursor-pointer border-0 bg-transparent font-mono text-[15px] leading-none text-ui-faint hover:text-ui-header-ink"
    >
      ×
    </button>
  </div>
)
