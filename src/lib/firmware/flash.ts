import { chipFamiliesMatch } from './board-resolution'
import { bestEffort, type BestEffortReport } from '../../transport/best-effort'
import { errorMessage } from '../error-message'

const FLASH_BAUD = 460_800
const PRE_RESET_BAUD = 115_200
const MERGED_FLASH_OFFSET = 0x0
const NVS_FLASH_OFFSET = 0x9000

const SUPPORTED_CHIPS: readonly string[] = ['ESP32']

const PRE_RESET_HOLD_MS = 250
const PRE_RESET_SETTLE_MS = 600

const ROM_BOOTLOADER_CONNECT_ATTEMPTS = 15

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

interface SignalCapablePort {
  setSignals?: (signals: { dataTerminalReady?: boolean; requestToSend?: boolean }) => Promise<void>
}

let esptoolModulePromise: Promise<typeof import('esptool-js')> | null = null

const loadEsptool = (): Promise<typeof import('esptool-js')> => {
  esptoolModulePromise ??= import('esptool-js')
  return esptoolModulePromise
}

type Esptool = Awaited<ReturnType<typeof loadEsptool>>
type EspTransport = InstanceType<Esptool['Transport']>
type EspLoader = InstanceType<Esptool['ESPLoader']>
type ConnectMode = 'no_reset' | 'default_reset'

export type FlashProgress = (loaded: number, total: number) => void
export type FlashLog = (line: string) => void

export interface FlashOptions {
  port: SerialPort
  bytes: Uint8Array
  expectedChip?: string
  nvsImage?: Uint8Array
  onProgress: FlashProgress
  onLog: FlashLog
}

export const flashFileArray = (
  bytes: Uint8Array,
  nvsImage?: Uint8Array
): { data: Uint8Array; address: number }[] =>
  nvsImage
    ? [
        { data: bytes, address: MERGED_FLASH_OFFSET },
        { data: nvsImage, address: NVS_FLASH_OFFSET },
      ]
    : [{ data: bytes, address: MERGED_FLASH_OFFSET }]

export class FlashError extends Error {
  readonly cause: unknown
  constructor(message: string, cause: unknown) {
    super(message)
    this.name = 'FlashError'
    this.cause = cause
  }
}

export class UnsupportedChipError extends Error {
  readonly detectedChip: string
  constructor(detectedChip: string) {
    super(
      `Refusing to flash — detected ${detectedChip}, CANShift firmware is built only for classic ESP32. Writing it onto a different family will brick the device.`
    )
    this.name = 'UnsupportedChipError'
    this.detectedChip = detectedChip
  }
}

export const assertChipMatchesBoard = (
  expectedChip: string | undefined,
  detectedChip: string
): void => {
  if (expectedChip !== undefined && !chipFamiliesMatch(expectedChip, detectedChip)) {
    throw new FlashError(
      `Refusing to flash — you picked a ${expectedChip} board but esptool detected ${detectedChip}. Writing a ${expectedChip} image onto a ${detectedChip} would brick it. Select the matching board and retry.`,
      null
    )
  }
}

export interface PortPreparation {
  mode: ConnectMode
  fallbackReason?: string
}

export const handshakeFailureMessage = (detail: string, fallbackReason?: string): string => {
  const preReset =
    fallbackReason === undefined
      ? ''
      : ` The pre-reset into the ROM bootloader never ran (${fallbackReason}), so this fell back to the slower default reset — fix that first.`
  return `ESP32 bootloader handshake failed (${detail}).${preReset} If the chip was detected and the failure happened after baud change, try a lower FLASH_BAUD. Otherwise hold BOOT, tap RESET, and retry.`
}

const reportTo =
  (onLog: FlashLog): BestEffortReport =>
  (message, err) => {
    onLog(`${message}: ${errorMessage(err)}`)
  }

const pulseRomBootloader = async (port: SerialPort, onLog: FlashLog): Promise<PortPreparation> => {
  const setSignals = (port as SignalCapablePort).setSignals
  if (typeof setSignals !== 'function') {
    return { mode: 'default_reset', fallbackReason: 'this port cannot toggle DTR/RTS' }
  }
  const send = (signals: { dataTerminalReady?: boolean; requestToSend?: boolean }) =>
    setSignals.call(port, signals)

  onLog('Pre-reset: pulling EN low, IO0 low')
  await send({ dataTerminalReady: false, requestToSend: true })
  await sleep(PRE_RESET_HOLD_MS)
  await send({ dataTerminalReady: true, requestToSend: false })
  await sleep(PRE_RESET_SETTLE_MS)
  await send({ dataTerminalReady: false, requestToSend: false })
  onLog('Pre-reset complete — chip should be in ROM bootloader')
  return { mode: 'no_reset' }
}

const preparePort = async (port: SerialPort, onLog: FlashLog): Promise<PortPreparation> => {
  const report = reportTo(onLog)
  let prepared: PortPreparation
  try {
    await port.open({ baudRate: PRE_RESET_BAUD })
    prepared = await pulseRomBootloader(port, onLog)
  } catch (err) {
    report('Pre-reset', err)
    prepared = { mode: 'default_reset', fallbackReason: errorMessage(err) }
  }
  await bestEffort('Pre-reset port close', () => port.close(), report)
  return prepared
}

const makeTerminal = (onLog: FlashLog) => ({
  clean: () => undefined,
  writeLine: (line: string) => {
    if (line.trim().length > 0) onLog(line.trim())
  },
  write: (_data: string) => undefined,
})

const createLoader = (
  esptool: Esptool,
  transport: EspTransport,
  connectMode: ConnectMode,
  onLog: FlashLog
): EspLoader => {
  const loader = new esptool.ESPLoader({
    transport,
    baudrate: FLASH_BAUD,
    terminal: makeTerminal(onLog),
    debugLogging: false,
  })
  const originalConnect = loader.connect.bind(loader)
  loader.connect = (
    mode = connectMode,
    _attempts = ROM_BOOTLOADER_CONNECT_ATTEMPTS,
    detecting = true
  ) => originalConnect(mode, ROM_BOOTLOADER_CONNECT_ATTEMPTS, detecting)
  return loader
}

const handshake = async (
  loader: EspLoader,
  preparation: PortPreparation,
  expectedChip: string | undefined,
  onLog: FlashLog
): Promise<void> => {
  try {
    await loader.main(preparation.mode)
  } catch (err) {
    throw new FlashError(
      handshakeFailureMessage(errorMessage(err), preparation.fallbackReason),
      err
    )
  }

  const detectedChip = loader.chip.CHIP_NAME
  onLog(`Detected chip: ${detectedChip}`)
  assertChipMatchesBoard(expectedChip, detectedChip)
  if (!SUPPORTED_CHIPS.includes(detectedChip)) throw new UnsupportedChipError(detectedChip)
}

const writeImages = async (
  loader: EspLoader,
  bytes: Uint8Array,
  nvsImage: Uint8Array | undefined,
  onProgress: FlashProgress,
  onLog: FlashLog
): Promise<void> => {
  if (nvsImage) onLog(`Baking board profile into NVS at 0x${NVS_FLASH_OFFSET.toString(16)}`)
  try {
    await loader.writeFlash({
      fileArray: flashFileArray(bytes, nvsImage),
      flashMode: 'keep',
      flashFreq: 'keep',
      flashSize: 'keep',
      eraseAll: false,
      compress: true,
      reportProgress: (_fileIndex, written, total) => {
        if (total > 0) onProgress(written, total)
      },
    })
  } catch (err) {
    throw new FlashError(`Flash write failed: ${errorMessage(err)}`, err)
  }
}

const withTransport = async <T>(
  transport: EspTransport,
  report: BestEffortReport,
  run: () => Promise<T>
): Promise<T> => {
  try {
    return await run()
  } finally {
    await bestEffort('Serial port release', () => transport.disconnect(), report)
  }
}

export const flashFirmware = async ({
  port,
  bytes,
  expectedChip,
  nvsImage,
  onProgress,
  onLog,
}: FlashOptions): Promise<void> => {
  const report = reportTo(onLog)
  const preparation = await preparePort(port, onLog)
  const esptool = await loadEsptool()
  const transport = new esptool.Transport(port, false)
  const loader = createLoader(esptool, transport, preparation.mode, onLog)

  await withTransport(transport, report, async () => {
    await handshake(loader, preparation, expectedChip, onLog)
    await writeImages(loader, bytes, nvsImage, onProgress, onLog)
    await bestEffort(
      'Reset',
      () => loader.softReset(false),
      (_message, err) => {
        onLog(`Reset failed (${errorMessage(err)}) — unplug/replug to restart the dash.`)
      }
    )
  })
}
