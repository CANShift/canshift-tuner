import { CAR } from './car'
import { CAR_SCAN } from './car-scan'
import { CHANGES } from './changes'
import { DASH } from './dash'
import { EVERYWHERE } from './everywhere'
import { GAUGES } from './gauges'
import { SESSION_LOGS } from './session-logs'
import { STATUS_ROW } from './status-row'

export const STRINGS = {
  ...EVERYWHERE,
  ...CHANGES,
  ...GAUGES,
  ...CAR,
  ...CAR_SCAN,
  ...DASH,
  ...SESSION_LOGS,
  ...STATUS_ROW,
} as const
