import {
  CMD_CALIBRATE_TOUCH,
  CMD_CAN_SCAN_START,
  CMD_CAN_SCAN_STOP,
  CMD_GET_CONFIG,
  CMD_GET_DEVICE_CONFIG,
  CMD_GET_INPUT_BINDINGS,
  CMD_OBD_CLEAR_DTC,
  CMD_OBD_READ_DTC,
  CMD_OTA_BEGIN,
  CMD_OTA_END,
  CMD_OTA_WRITE,
  CMD_PING,
  CMD_PUT_CONFIG_CHUNK,
  CMD_PUT_DEVICE_CONFIG,
  CMD_PUT_INPUT_BINDINGS,
  CMD_QUERY_VERSION,
  CMD_REBOOT,
  CMD_SCREEN_SETTINGS,
  CMD_SET_BOARD_PROFILE,
  CMD_SET_DAY_NIGHT,
  CMD_TOGGLE_DAY_NIGHT,
} from '../src/transport/opcodes'
import { putConfigChunk } from './mock-dash-chunks'
import { otaBegin, otaEnd, otaWrite } from './mock-dash-ota'
import { fail, ok, okThenReboot, type Command, type Outcome } from './mock-dash-replies'
import type { MockDashState } from './mock-dash-state'

type CommandHandler = (command: Command, state: MockDashState) => Outcome

const PROTOCOL_VERSION = 1
const BOARD_ID = 'waveshare_s3_28'

const queryVersion: CommandHandler = (_command, state) =>
  ok({
    version: state.firmwareVersion,
    protocol: PROTOCOL_VERSION,
    is_day: state.isDay ? 1 : 0,
    board_id: BOARD_ID,
  })

const ping: CommandHandler = (_command, state) => ok({ uptime_ms: Date.now() - state.bootedAt })

const getConfig: CommandHandler = (_command, state) =>
  state.config === null ? fail('config_not_found') : ok({ config: state.config })

const getDeviceConfig: CommandHandler = (_command, state) =>
  ok({ device_config: state.deviceConfig })

const putDeviceConfig: CommandHandler = (command, state) => {
  const next = command.device_config as MockDashState['deviceConfig'] | undefined
  if (next === undefined) return fail('missing_device_config')
  state.deviceConfig = next
  return okThenReboot({ restart: true })
}

const setDayNight: CommandHandler = (command, state) => {
  state.isDay = command.day === true
  return ok()
}

const toggleDayNight: CommandHandler = (_command, state) => {
  state.isDay = !state.isDay
  return ok()
}

const readDtc: CommandHandler = () => ok({ dtc_bytes: [] })

const reboot: CommandHandler = () => okThenReboot()

const acknowledge: CommandHandler = () => ok()

export const COMMAND_HANDLERS: Record<number, CommandHandler> = {
  [CMD_GET_CONFIG]: getConfig,
  [CMD_PUT_CONFIG_CHUNK]: putConfigChunk,
  [CMD_GET_DEVICE_CONFIG]: getDeviceConfig,
  [CMD_PUT_DEVICE_CONFIG]: putDeviceConfig,
  [CMD_SCREEN_SETTINGS]: acknowledge,
  [CMD_TOGGLE_DAY_NIGHT]: toggleDayNight,
  [CMD_CALIBRATE_TOUCH]: acknowledge,
  [CMD_SET_DAY_NIGHT]: setDayNight,
  [CMD_GET_INPUT_BINDINGS]: () => fail('config_not_found'),
  [CMD_PUT_INPUT_BINDINGS]: acknowledge,
  [CMD_SET_BOARD_PROFILE]: () => ok({ restart: false }),
  [CMD_QUERY_VERSION]: queryVersion,
  [CMD_PING]: ping,
  [CMD_CAN_SCAN_START]: acknowledge,
  [CMD_CAN_SCAN_STOP]: acknowledge,
  [CMD_OBD_READ_DTC]: readDtc,
  [CMD_OBD_CLEAR_DTC]: acknowledge,
  [CMD_OTA_BEGIN]: otaBegin,
  [CMD_OTA_WRITE]: otaWrite,
  [CMD_OTA_END]: otaEnd,
  [CMD_REBOOT]: reboot,
}

export const unknownCommand = (): Outcome => fail('unknown_command')
