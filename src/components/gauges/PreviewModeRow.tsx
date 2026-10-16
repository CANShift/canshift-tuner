import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import {
  PREVIEW_LABELS,
  PREVIEW_MODES,
  PREVIEW_TITLES,
  type PreviewMode,
} from '../editor/preview/preview-modes'

export interface PreviewModeRowProps {
  mode: PreviewMode
  onMode: (mode: PreviewMode) => void
}

export const PreviewModeRow = ({ mode, onMode }: PreviewModeRowProps) => (
  <div className="flex flex-wrap items-center gap-2 text-sm text-app-muted">
    <span>{STRINGS.gauges.previewAs}</span>
    <ToggleGroup
      type="single"
      value={mode}
      aria-label={STRINGS.gauges.previewAs}
      onValueChange={(value) => value.length > 0 && onMode(value as PreviewMode)}
    >
      {PREVIEW_MODES.map((candidate) => (
        <ToggleGroupItem
          key={candidate}
          value={candidate}
          title={PREVIEW_TITLES[candidate]}
          className="h-9 px-3 text-sm"
        >
          {PREVIEW_LABELS[candidate]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </div>
)
