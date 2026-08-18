import { CANSHIFT_FILE_EXTENSION, CANSHIFT_FILE_MIME } from '@canshift/core'
import { downloadFile } from './download'

export const PROJECT_FILE_ACCEPT = `${CANSHIFT_FILE_EXTENSION},${CANSHIFT_FILE_MIME}`

const sanitizeFileName = (name: string): string =>
  name
    .trim()
    .replace(/[^a-z0-9\-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'project'

export const projectFileName = (name: string): string =>
  `${sanitizeFileName(name)}${CANSHIFT_FILE_EXTENSION}`

export const downloadProjectFile = (name: string, json: string): void => {
  downloadFile(projectFileName(name), CANSHIFT_FILE_MIME, json)
}

export const readProjectFileText = (file: File): Promise<string> => file.text()
