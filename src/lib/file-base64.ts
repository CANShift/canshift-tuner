import type { FeedbackAttachment } from './feedback'

const DATA_URL_PREFIX = /^data:[^;]*;base64,/

export const readFileAsBase64 = (file: File): Promise<FeedbackAttachment> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => {
      reject(new Error(`Could not read ${file.name}.`))
    }
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve({
        name: file.name,
        mimetype: file.type.length > 0 ? file.type : 'application/octet-stream',
        content: result.replace(DATA_URL_PREFIX, ''),
      })
    }
    reader.readAsDataURL(file)
  })
