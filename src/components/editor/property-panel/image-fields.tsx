import { ConfigFieldsProps } from './shared'
import { PanelField, PanelInput } from '@/components/ui/form-field'

const IMAGE_PATH_HINT = '/assets/logo.bin'

export const ImageFields = ({ widget, onChange }: ConfigFieldsProps) => {
  if (widget.config.type !== 'image') return null
  const cfg = widget.config
  return (
    <PanelField label="Image file on the dash">
      <PanelInput
        value={cfg.imagePath}
        placeholder={IMAGE_PATH_HINT}
        onChange={(e) => {
          onChange({ config: { ...cfg, imagePath: e.target.value } })
        }}
      />
    </PanelField>
  )
}
