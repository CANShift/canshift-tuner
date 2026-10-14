import { Button } from '@/components/ui/button'
import { DeviceSection } from './DeviceSection'

export interface ConfigBackupSectionProps {
  summary: string
  onExport: () => void
  onImport: () => void
}

export const ConfigBackupSection = ({ summary, onExport, onImport }: ConfigBackupSectionProps) => (
  <DeviceSection title="CONFIG BACKUP">
    <p className="mb-4 mt-3.5 text-[13px] text-ui-faint">
      Save the open config ({summary}) to a file, or restore one saved earlier.
    </p>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onExport}>
        Back up
      </Button>
      <Button variant="outline" size="sm" onClick={onImport}>
        Restore
      </Button>
    </div>
  </DeviceSection>
)
