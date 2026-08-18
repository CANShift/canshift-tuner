import { useEffect } from 'react'
import { useProjectStore } from '../stores/project/project.store'
import { useLogStore } from '../stores/log.store'
import { useUiStore } from '../stores/ui.store'
import { isEditableTarget } from '../utils/is-editable-target'

export const useSaveShortcut = (): void => {
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const log = useLogStore((s) => s.push)
  const markSaved = useUiStore((s) => s.markSaved)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 's') return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      if (activeProjectId === null) {
        log('info', 'Nothing to save yet — start a config from HOME.')
        return
      }
      saveActiveProject()
      markSaved()
      log('success', 'Saved in this browser.')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [saveActiveProject, activeProjectId, log, markSaved])
}
