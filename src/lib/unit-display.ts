import { displayUnit, type UnitSystem } from '@canshift/core'

export const convertibleUnitFor = (configSuffix: string, declaredUnit: string): string =>
  configSuffix === '' ? declaredUnit : ''

export const displayUnitFor = (
  configSuffix: string,
  declaredUnit: string,
  system: UnitSystem
): string => (configSuffix === '' ? displayUnit(declaredUnit, system) : configSuffix)
