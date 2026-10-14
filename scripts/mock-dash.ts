import { WebSocketServer, type WebSocket } from 'ws'
import { CMD_OTA_WRITE, CMD_PING } from '../src/transport/opcodes'
import { COMMAND_HANDLERS, unknownCommand } from './mock-dash-commands'
import { canStatFrame, heapFrame, teleFrame } from './mock-dash-telemetry'
import { freshState, reboot, type MockDashState } from './mock-dash-state'
import { MOCK_SIGNING_KEY_PATH, startSigningKey } from './mock-dash-signing'
import type { Command, Outcome } from './mock-dash-replies'

const DEFAULT_PORT = 8787
const SOCKET_PATH = '/ws'
const TELE_INTERVAL_MS = 100
const STATS_INTERVAL_MS = 2_000
const REBOOT_DELAY_MS = 300
const MS_PER_S = 1_000
const QUIET_COMMANDS = new Set([CMD_OTA_WRITE, CMD_PING])

const port = Number(process.env.MOCK_DASH_PORT ?? DEFAULT_PORT)
const state = freshState(startSigningKey())

const parseCommand = (raw: string): Command | null => {
  try {
    const parsed = JSON.parse(raw) as unknown
    const isCommand = typeof parsed === 'object' && parsed !== null && 'cmd' in parsed
    return isCommand ? (parsed as Command) : null
  } catch {
    return null
  }
}

const send = (socket: WebSocket, frame: Record<string, unknown>): void => {
  socket.send(JSON.stringify(frame))
}

const run = (command: Command): Outcome =>
  (COMMAND_HANDLERS[command.cmd] ?? unknownCommand)(command, state)

const rebootSoon = (socket: WebSocket): void => {
  console.log('[mock-dash] rebooting')
  setTimeout(() => {
    reboot(state)
    socket.close()
  }, REBOOT_DELAY_MS)
}

const answer = (socket: WebSocket, raw: string): void => {
  const command = parseCommand(raw)
  if (command === null) return
  const outcome = run(command)
  if (!QUIET_COMMANDS.has(command.cmd)) {
    console.log(`[mock-dash] cmd 0x${command.cmd.toString(16)} → ${String(outcome.reply.status)}`)
  }
  send(socket, outcome.reply)
  if (outcome.reboot) rebootSoon(socket)
}

const streamTelemetry = (socket: WebSocket, dash: MockDashState): (() => void) => {
  const uptime = () => Date.now() - dash.bootedAt
  const tele = setInterval(() => {
    send(socket, teleFrame(uptime() / MS_PER_S))
  }, TELE_INTERVAL_MS)
  const stats = setInterval(() => {
    send(socket, heapFrame(uptime()))
    send(socket, canStatFrame())
  }, STATS_INTERVAL_MS)
  return () => {
    clearInterval(tele)
    clearInterval(stats)
  }
}

const server = new WebSocketServer({ port, path: SOCKET_PATH })

server.on('connection', (socket) => {
  console.log('[mock-dash] tuner connected')
  const stopTelemetry = streamTelemetry(socket, state)
  socket.on('message', (data) => {
    answer(socket, data.toString())
  })
  socket.on('close', stopTelemetry)
})

console.log(`[mock-dash] listening on ws://localhost:${String(port)}${SOCKET_PATH}`)
console.log(`[mock-dash] open the tuner with ?dash=localhost:${String(port)}`)
console.log(`[mock-dash] throwaway signing key in ${MOCK_SIGNING_KEY_PATH}`)
console.log('[mock-dash] sign a test image with: npm run mock-dash:sign -- <firmware.bin>')
