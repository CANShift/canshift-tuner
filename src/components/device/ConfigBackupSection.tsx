import { Button } from '@/components/ui/button'

export interface ConfigBackupSectionProps {
  summary: string
  onExport: () => void
  onImport: () => void
}

export const ConfigBackupSection = ({ summary, onExport, onImport }: ConfigBackupSectionProps) => (
  <section className="border-b border-ui-line px-7 pb-[34px] pt-[30px]">
    <h2 className="border-b-2 border-ui-rule pb-3 font-mono text-[10.5px] tracking-[0.18em] text-ui-muted">
      CONFIG BACKUP
    </h2>
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
  </section>
)
