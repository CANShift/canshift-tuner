export interface RouteMeta {
  title: string
  description: string
}

export const ROUTE_META = {
  '/dash': {
    title: 'Dash — CANShift Tuner',
    description:
      'Arrange pages and widgets on the dash canvas — gauges, warnings, gear and shift lights — with a live device-accurate preview.',
  },
  '/vehicle': {
    title: 'Vehicle — CANShift Tuner',
    description:
      'Pick an ECU profile, bind CAN signals and OBD-II PIDs, scan the bus, watch live values and set the bus speed.',
  },
  '/device': {
    title: 'Device — CANShift Tuner',
    description: 'Units, brightness, the board profile, and backing up or restoring the config.',
  },
} as const satisfies Record<string, RouteMeta>

export type RoutePath = keyof typeof ROUTE_META

export const ROUTE_PATHS = Object.keys(ROUTE_META) as readonly RoutePath[]

export const HOME_PATH: RoutePath = '/dash'

export const LEGACY_REDIRECTS: Record<string, RoutePath> = {
  '/': '/dash',
  '/dashboard': '/dash',
  '/cli': '/dash',
  '/signals': '/vehicle',
  '/logs': '/vehicle',
  '/can': '/vehicle',
  '/ecu': '/vehicle',
  '/obd2': '/vehicle',
  '/themes': '/device',
  '/board': '/device',
  '/firmware': '/device',
  '/flash': '/device',
  '/about': '/dash',
  '/contact': '/dash',
}
