import { useRef, type ChangeEvent } from 'react'
import { useProjectStore, type ImportResult } from '../stores/project/project.store'
import { useLogStore } from '../stores/log.store'
import { useUiStore } from '../stores/ui.store'
import { downloadProjectFile, readProjectFileText } from '../lib/project-file'

export interface ProjectFileActions {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  exportProjectFile: (id: string | null, name: string) => void
  openImportPicker: () => void
  handleImportChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

const readImportText = async (file: File): Promise<string | null> => {
  try {
    return await readProjectFileText(file)
  } catch {
    useLogStore.getState().push('error', 'Could not read the selected file.')
    return null
  }
}

const panelNotice = (name: string, panel: string | null): string | null =>
  panel === null
    ? null
    : `“${name}” was built for a ${panel}. The panel switched to match — check the layout before burning.`

const announceImport = (result: ImportResult) => {
  const log = useLogStore.getState().push
  if (!result.ok) {
    log('error', result.error)
    return
  }
  log('success', `Imported “${result.name}”.`)
  useUiStore.getState().setImportNotice(panelNotice(result.name, result.panelSwitchedTo))
}

const exportFile = (id: string | null, name: string) => {
  if (id === null) return
  const log = useLogStore.getState().push
  const json = useProjectStore.getState().exportProject(id)
  if (json === null) {
    log('error', 'Could not export the project.')
    return
  }
  downloadProjectFile(name, json)
  log('info', `Exported “${name}”.`)
}

const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const raw = await readImportText(file)
  if (raw === null) return
  announceImport(useProjectStore.getState().importProject(raw))
}

export const useProjectFileActions = (): ProjectFileActions => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const openImportPicker = () => {
    fileInputRef.current?.click()
  }
  return {
    fileInputRef,
    exportProjectFile: exportFile,
    openImportPicker,
    handleImportChange: importFile,
  }
}
