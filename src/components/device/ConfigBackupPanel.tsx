import { ConfigBackupSection } from './ConfigBackupSection'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useProjectStore } from '../../stores/project/project.store'
import { useProjectFileActions } from '../../hooks/useProjectFileActions'
import { summarizeConfig } from '../../lib/config-summary'
import { PROJECT_FILE_ACCEPT } from '../../lib/project-file'

export const ConfigBackupPanel = () => {
  const config = useDashboardStore((s) => s.config)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const { fileInputRef, exportProjectFile, openImportPicker, handleImportChange } =
    useProjectFileActions()

  return (
    <>
      <ConfigBackupSection
        summary={summarizeConfig(config)}
        onExport={() => {
          exportProjectFile(activeProjectId, config?.name ?? 'config')
        }}
        onImport={openImportPicker}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_FILE_ACCEPT}
        onChange={(event) => {
          void handleImportChange(event)
        }}
        className="hidden"
      />
    </>
  )
}
