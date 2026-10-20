import { CAR } from './car'
import { CAR_SCAN } from './car-scan'
import { CHANGES } from './changes'
import { DASH } from './dash'
import { EVERYWHERE } from './everywhere'
import { GAUGES } from './gauges'

export const STRINGS = {
  ...EVERYWHERE,
  ...CHANGES,
  ...GAUGES,
  ...CAR,
  ...CAR_SCAN,
  ...DASH,
} as const
