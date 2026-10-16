import { PROJECT_FILE_VERSION, parseCanshiftFile, serializeCanshiftFile } from '@canshift/core'
import type { DashboardConfig, SignalDef } from '@canshift/core'
import { createId } from '../../utils/id'
import { CATALOGUE_INDEX } from '../ecu-catalogue'
import { ecuLabelForKey } from '../../utils/ecu-label'

export interface BackupContents {
  dashboard: DashboardConfig
  ecuProfileKey: string
  signals: SignalDef[]
}

export interface BackupSummary {
  fileName: string
  savedAt: Date | null
  car: string
  pages: number
}

export type ReadBackup =
  { kind: 'ok'; contents: BackupContents; summary: BackupSummary } | { kind: 'invalid' }

const BACKUP_NAME = 'Backup'
const ISO_DATE_LENGTH = 10

export const backupFileName = (now: Date): string =>
  `canshift-backup-${now.toISOString().slice(0, ISO_DATE_LENGTH)}.canshift`

export const serializeBackup = (contents: BackupContents, now: Date): string =>
  serializeCanshiftFile({
    projectVersion: PROJECT_FILE_VERSION,
    id: createId('backup'),
    name: BACKUP_NAME,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...contents,
  })

const savedAtOf = (iso: string): Date | null => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export const readBackup = (fileName: string, raw: string): ReadBackup => {
  const parsed = parseCanshiftFile(raw)
  if (parsed.kind !== 'ok') return { kind: 'invalid' }
  const { project } = parsed
  const dashboard = project.dashboard as DashboardConfig
  return {
    kind: 'ok',
    contents: { dashboard, ecuProfileKey: project.ecuProfileKey, signals: project.signals },
    summary: {
      fileName,
      savedAt: savedAtOf(project.updatedAt),
      car: ecuLabelForKey(project.ecuProfileKey, CATALOGUE_INDEX),
      pages: dashboard.pages.length,
    },
  }
}
