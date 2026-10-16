import { CAR } from './car'
import { CHANGES } from './changes'
import { DASH } from './dash'
import { EVERYWHERE } from './everywhere'
import { GAUGES } from './gauges'

export const STRINGS = { ...EVERYWHERE, ...CHANGES, ...GAUGES, ...CAR, ...DASH } as const
