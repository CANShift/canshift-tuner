import { CANSHIFT_FILE_EXTENSION, CANSHIFT_FILE_MIME } from '@canshift/core'
import { downloadFile } from './download'
import { slugForFileName } from './file-name'

export const PROJECT_FILE_ACCEPT = `${CANSHIFT_FILE_EXTENSION},${CANSHIFT_FILE_MIME}`

export const projectFileName = (name: string): string =>
  `${slugForFileName(name, 'project')}${CANSHIFT_FILE_EXTENSION}`

export const downloadProjectFile = (name: string, json: string): void => {
  downloadFile(projectFileName(name), CANSHIFT_FILE_MIME, json)
}

export const readProjectFileText = (file: File): Promise<string> => file.text()
