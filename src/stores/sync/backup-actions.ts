import { CANSHIFT_FILE_MIME } from '@canshift/core'
import { backupFileName, serializeBackup, type BackupContents } from '../../lib/backup/backup'
import { downloadFile } from '../../lib/download'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../dashboard.store'
import { useSignalStore } from '../signal.store'
import { sendToDash } from './send-actions'

export const saveBackup = (): void => {
  const dashboard = useDashboardStore.getState().config
  if (dashboard === null) return
  const { selectedProfileKey, signals } = useSignalStore.getState()
  const now = new Date()
  const contents: BackupContents = { dashboard, ecuProfileKey: selectedProfileKey, signals }
  downloadFile(backupFileName(now), CANSHIFT_FILE_MIME, serializeBackup(contents, now))
}

export const restoreBackup = async (contents: BackupContents): Promise<void> => {
  useDashboardStore.getState().replaceConfig(contents.dashboard, STRINGS.dash.restore)
  useSignalStore.getState().applyProfile(contents.ecuProfileKey, contents.signals)
  await sendToDash()
}
