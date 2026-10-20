const KILOBYTE = 1_000
const MEGABYTE = 1_000_000

const sizeLabel = (bytes: number): string =>
  bytes >= MEGABYTE
    ? `${(bytes / MEGABYTE).toFixed(1)} MB`
    : `${String(Math.max(1, Math.round(bytes / KILOBYTE)))} KB`

export const SESSION_LOGS = {
  sessionLogs: {
    title: 'Recorded sessions',
    row: 'Recorded sessions',
    intro:
      'The dash records every signal and every lap to its memory card while the car runs. Download a session to keep it or open it in a spreadsheet.',
    checking: 'Looking for sessions on the dash…',
    empty: 'No session on the card yet. The dash starts one when the car’s bus wakes up.',
    noCard: 'No memory card in the dash. Put one in the card slot to record sessions.',
    unsupported:
      'This dash doesn’t record sessions. It needs a memory card slot and a firmware that records to it.',
    unreachable: 'The dash didn’t answer. Check you are on its Wi-Fi, then try again.',
    noWifi:
      'Sessions come off the dash over its Wi-Fi. Open the tuner from the dash in workshop mode to see them.',
    refused:
      'The dash only answers the tuner it serves itself. Open the tuner from the dash’s own Wi-Fi address.',
    notOwner:
      'Another phone or laptop is connected to the dash. Close the tuner there, or wait until this one reconnects, then try again.',
    retry: 'Try again',
    size: sizeLabel,
    downloadCsv: 'Spreadsheet (.csv)',
    downloadRaw: 'Original file',
    remove: 'Delete',
    removeTitle: (name: string): string => `Delete ${name}?`,
    removeBody: 'The session is removed from the dash’s card. Download it first to keep a copy.',
    cancel: 'Cancel',
    gone: 'That session is no longer on the card.',
    downloadFailed: 'The session didn’t download. Try again.',
    unreadable: 'The session file is damaged and can’t be turned into a spreadsheet.',
    removeFailed: 'The dash didn’t delete the session. Try again.',
    removed: 'Session deleted.',
  },
} as const
