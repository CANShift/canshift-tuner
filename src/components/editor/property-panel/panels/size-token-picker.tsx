import { cn } from '@/lib/utils'
import type { Widget } from '@canshift/core'

import { SIZE_TOKENS, STANDARD_TOKEN_IDS, tokenFromSpans } from '../../../../utils/size-tokens'
import { PanelField, segmentPill } from '@/components/ui/form-field'

interface SizeTokenPickerProps {
  widget: Widget
  onChange: (patch: Partial<Widget>) => void
}

export const SizeTokenPicker = ({ widget, onChange }: SizeTokenPickerProps) => {
  const activeTokenId =
    tokenFromSpans(widget.layout.colSpan, widget.layout.rowSpan) ?? STANDARD_TOKEN_IDS[0] ?? null

  return (
    <PanelField label="Size">
      <div className="flex flex-wrap gap-1">
        {STANDARD_TOKEN_IDS.map((tokenId) => {
          const token = SIZE_TOKENS[tokenId]
          const isActive = tokenId === activeTokenId
          return (
            <button
              key={tokenId}
              onClick={() => {
                onChange({
                  layout: { ...widget.layout, colSpan: token.colSpan, rowSpan: token.rowSpan },
                })
              }}
              title={token.description}
              className={cn(segmentPill({ tone: 'green', active: isActive }))}
            >
              {token.label}
            </button>
          )
        })}
      </div>
    </PanelField>
  )
}
