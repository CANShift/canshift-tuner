export interface RouteMeta {
  title: string
  description: string
}

export const ROUTE_META = {
  '/gauges': {
    title: 'Gauges — CANShift Tuner',
    description:
      'What the dash shows: pages, gauges, their signals and limits, with a live preview.',
  },
  '/car': {
    title: 'Car — CANShift Tuner',
    description: 'What the car sends: the ECU from the catalogue and its signals with live values.',
  },
  '/dash': {
    title: 'Dash — CANShift Tuner',
    description:
      'The dash itself: units, brightness, the full-screen alert, CAN bus speed, backup and firmware.',
  },
} as const satisfies Record<string, RouteMeta>

export type RoutePath = keyof typeof ROUTE_META

export const ROUTE_PATHS = Object.keys(ROUTE_META) as readonly RoutePath[]

export const HOME_PATH: RoutePath = '/gauges'

export const LEGACY_REDIRECTS: Record<string, RoutePath> = {
  '/': '/gauges',
  '/dashboard': '/gauges',
  '/cli': '/gauges',
  '/vehicle': '/car',
  '/signals': '/car',
  '/logs': '/car',
  '/can': '/car',
  '/ecu': '/car',
  '/obd2': '/car',
  '/device': '/dash',
  '/themes': '/dash',
  '/board': '/dash',
  '/firmware': '/dash',
  '/flash': '/dash',
  '/about': '/gauges',
  '/contact': '/gauges',
}
