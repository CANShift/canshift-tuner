import { useRef, type ChangeEvent } from 'react'
import { useProjectStore } from '../stores/project/project.store'
import { useLogStore } from '../stores/log.store'
import { useUiStore } from '../stores/ui.store'
import { downloadProjectFile, readProjectFileText } from '../lib/project-file'

export interface ProjectFileActions {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  exportProjectFile: (id: string | null, name: string) => void
  openImportPicker: () => void
  handleImportChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

export const useProjectFileActions = (): ProjectFileActions => {
  const importProject = useProjectStore((s) => s.importProject)
  const exportProject = useProjectStore((s) => s.exportProject)
  const log = useLogStore((s) => s.push)
  const setImportNotice = useUiStore((s) => s.setImportNotice)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportProjectFile = (id: string | null, name: string) => {
    if (id === null) return
    const json = exportProject(id)
    if (json === null) {
      log('error', 'Could not export the project.')
      return
    }
    downloadProjectFile(name, json)
    log('info', `Exported “${name}”.`)
  }

  const openImportPicker = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    let raw: string
    try {
      raw = await readProjectFileText(file)
    } catch {
      log('error', 'Could not read the selected file.')
      return
    }
    const result = importProject(raw)
    if (!result.ok) {
      log('error', result.error)
      return
    }
    log('success', `Imported “${result.name}”.`)
    setImportNotice(
      result.panelSwitchedTo === null
        ? null
        : `“${result.name}” was built for a ${result.panelSwitchedTo}. The panel switched to match — check the layout before burning.`
    )
  }

  return { fileInputRef, exportProjectFile, openImportPicker, handleImportChange }
}
