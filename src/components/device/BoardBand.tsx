export interface BoardFact {
  label: string
  value: string
}

export interface BoardBandProps {
  facts: readonly BoardFact[]
}

export const BoardBand = ({ facts }: BoardBandProps) => (
  <div className="grid border-b-2 border-ui-rule [grid-template-columns:repeat(3,1fr)] max-[1040px]:[grid-template-columns:repeat(2,1fr)] max-[760px]:[grid-template-columns:1fr]">
    {facts.map((fact) => (
      <div key={fact.label} className="border-r border-t border-ui-line px-7 pb-5 pt-[18px]">
        <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-ui-muted">
          {fact.label}
        </div>
        <div className="font-mono text-[17px] tracking-[-0.01em] text-ui-ink">{fact.value}</div>
      </div>
    ))}
  </div>
)
