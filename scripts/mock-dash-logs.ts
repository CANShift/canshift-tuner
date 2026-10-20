import type { IncomingMessage, ServerResponse } from 'node:http'
import { mockSessionFile, type MockSignal } from './mock-dash-session-file'

const LOGS_PATH = '/api/logs'
const LOG_NAME = /^S\d{5}\.csl$/
const TWO_PI = 2 * Math.PI

type LogsMode = 'card' | 'no-card' | 'old-firmware'

const SIGNALS: readonly MockSignal[] = [
  { id: 0, name: 'rpm', at: (s) => 4_500 + 2_500 * Math.sin((s * TWO_PI) / 9) },
  { id: 5, name: 'coolant_temp_c', at: (s) => 85 + s / 20 },
  { id: 11, name: 'speed_kph', at: (s) => 110 + 60 * Math.sin((s * TWO_PI) / 21) },
  { id: 12, name: 'gear', at: (s) => 3 + Math.round(Math.sin((s * TWO_PI) / 9)) },
]

const logs = new Map<string, Buffer>([
  [
    'S00001.csl',
    mockSessionFile({ session: 1, seconds: 45, lapEveryS: 15, closed: true }, SIGNALS),
  ],
  [
    'S00002.csl',
    mockSessionFile({ session: 2, seconds: 30, lapEveryS: 12, closed: false }, SIGNALS),
  ],
])

const MODES: Record<string, LogsMode> = { 'no-card': 'no-card', 'old-firmware': 'old-firmware' }

export const logsMode: LogsMode = MODES[process.env.MOCK_DASH_LOGS ?? ''] ?? 'card'

const allowDevOrigin = (res: ServerResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE')
}

const sendIndex = (res: ServerResponse): void => {
  const card = logsMode === 'card'
  const listed = card ? [...logs].map(([name, file]) => ({ name, bytes: file.length })) : []
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ card, logs: listed }))
}

const sendFile = (res: ServerResponse, name: string): void => {
  const file = logs.get(name)
  if (file === undefined) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${name}"`,
  })
  res.end(file)
}

const removeFile = (res: ServerResponse, name: string): void => {
  res.writeHead(logs.delete(name) ? 204 : 404).end()
}

const answerFile = (req: IncomingMessage, res: ServerResponse, name: string): void => {
  if (!LOG_NAME.test(name) || logsMode !== 'card') {
    res.writeHead(404).end()
    return
  }
  if (req.method === 'DELETE') removeFile(res, name)
  else sendFile(res, name)
}

export const answerLogs = (req: IncomingMessage, res: ServerResponse): void => {
  allowDevOrigin(res)
  const path = (req.url ?? '').split('?')[0] ?? ''
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end()
    return
  }
  if (logsMode === 'old-firmware' || !path.startsWith(LOGS_PATH)) {
    res
      .writeHead(200, { 'Content-Type': 'text/html' })
      .end('<!doctype html><title>CANShift</title>')
    return
  }
  if (path === LOGS_PATH) sendIndex(res)
  else answerFile(req, res, decodeURIComponent(path.slice(LOGS_PATH.length + 1)))
}
