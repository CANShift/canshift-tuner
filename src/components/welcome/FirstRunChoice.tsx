export interface FirstRunChoiceProps {
  onStartFromDefaults: () => void
  onStartBlank: () => void
}

export const FirstRunChoice = ({ onStartFromDefaults, onStartBlank }: FirstRunChoiceProps) => (
  <div className="mb-[34px] max-w-[520px] border-l-[3px] border-ui-accent bg-ui-panel px-[18px] pb-[18px] pt-4">
    <p className="mb-2 font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">FIRST RUN</p>
    <p className="mb-4 text-pretty text-[14.5px] leading-[1.6] text-ui-ink">
      Nothing saved in this browser yet. Start from the six reference pages, or from an empty one.
    </p>
    <div className="flex flex-wrap gap-px">
      <button
        type="button"
        onClick={onStartFromDefaults}
        className="cursor-pointer whitespace-nowrap border-0 bg-ui-accent px-[18px] py-3 text-left text-[12.5px] font-extrabold tracking-[0.08em] text-white hover:bg-ui-accent-hover"
      >
        SIX DEFAULT PAGES
      </button>
      <button
        type="button"
        onClick={onStartBlank}
        className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-[18px] py-3 text-left text-[12.5px] font-bold text-ui-ink hover:bg-ui-panel"
      >
        One blank page
      </button>
    </div>
  </div>
)
