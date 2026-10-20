const REVOKE_DELAY_MS = 10_000

export const downloadFile = (filename: string, mime: string, content: BlobPart): void => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, REVOKE_DELAY_MS)
}
