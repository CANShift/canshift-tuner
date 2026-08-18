export interface ErasePanelProps {
  available: boolean
  unavailableNote: string
  canExport: boolean
  onErase: () => void
  onExportConfig: () => void
}

const CONSEQUENCE =
  'A full erase wipes the firmware, the config on the board and the ECU profile it was flashed with. Nothing survives it. Reach for it on a brand-new board, or on one that will not boot far enough to take a normal flash.'

const NO_CONFIG = 'No config open to export — open one from Welcome first.'

export const ErasePanel = ({
  available,
  unavailableNote,
  canExport,
  onErase,
  onExportConfig,
}: ErasePanelProps) => (
  <section className="mb-8">
    <p className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-ui-accent">FULL ERASE</p>
    <p className="mb-7 max-w-[52ch] text-pretty text-[15px] leading-[1.6] text-ui-muted">
      {CONSEQUENCE}
    </p>
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        disabled={!available}
        title={available ? undefined : unavailableNote}
        onClick={onErase}
        className={
          available
            ? 'cursor-pointer border-0 bg-ui-accent px-[22px] py-[15px] text-[13px] font-extrabold tracking-[0.09em] text-white hover:bg-ui-accent-hover'
            : 'cursor-not-allowed border-0 bg-ui-line px-[22px] py-[15px] text-[13px] font-extrabold tracking-[0.09em] text-ui-faint'
        }
      >
        ERASE THE BOARD
      </button>
      {canExport ? (
        <button
          type="button"
          onClick={onExportConfig}
          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-ui-muted underline hover:text-ui-ink"
        >
          Export config first
        </button>
      ) : (
        <span className="text-[13px] text-ui-faint">{NO_CONFIG}</span>
      )}
    </div>
    {!available && <p className="mt-4 text-[13px] text-ui-faint">{unavailableNote}</p>}
  </section>
)
