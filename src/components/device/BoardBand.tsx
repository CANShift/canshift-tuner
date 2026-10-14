export interface BoardFact {
  label: string
  value: string
}

export interface BoardBandProps {
  facts: readonly BoardFact[]
}

export const BoardBand = ({ facts }: BoardBandProps) => (
  <div className="grid border-b-2 border-ui-rule [grid-template-columns:repeat(auto-fit,minmax(min(170px,45%),1fr))]">
    {facts.map((fact) => (
      <div
        key={fact.label}
        className="border-r border-t border-ui-line px-4 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-[18px]"
      >
        <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-ui-muted">
          {fact.label}
        </div>
        <div className="break-words font-mono text-[15px] sm:text-[17px] tracking-[-0.01em] text-ui-ink">
          {fact.value}
        </div>
      </div>
    ))}
  </div>
)
