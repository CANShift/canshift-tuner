import { CANSHIFT_FILE_EXTENSION, CANSHIFT_FILE_MIME } from '@canshift/core'

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
  const blob = new Blob([json], { type: CANSHIFT_FILE_MIME })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = projectFileName(name)
  anchor.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 10_000)
}

export const readProjectFileText = (file: File): Promise<string> => file.text()
