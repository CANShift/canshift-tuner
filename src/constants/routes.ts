export interface RouteMeta {
  title: string
  description: string
}

export const ROUTE_META = {
  '/': {
    title: 'CANShift Tuner',
    description:
      'Configure your CANShift dash, live. Edit pages, bind CAN signals, tune OBD-II polling and flash firmware — all in your browser.',
  },
  '/flash': {
    title: 'Flash — CANShift Tuner',
    description:
      'Write a firmware version to the board over USB, or wipe it back to a blank state.',
  },
  '/contact': {
    title: 'Contact — CANShift Tuner',
    description: 'Report a bug, request an ECU profile, or ask a question about a build.',
  },
  '/dash': {
    title: 'Dash — CANShift Tuner',
    description:
      'Arrange pages and widgets on the dash canvas — gauges, warnings, gear and shift lights — with a live device-accurate preview.',
  },
  '/signals': {
    title: 'Signals — CANShift Tuner',
    description:
      'Bind CAN signals and OBD-II PIDs, scan the bus live, and load an ECU broadcast profile.',
  },
  '/live': {
    title: 'Live — CANShift Tuner',
    description:
      'Watch decoded signal values stream from the device in real time, and record them.',
  },
  '/device': {
    title: 'Device — CANShift Tuner',
    description: 'Board, settings, dash theme and the critical alert the config will write.',
  },
} as const satisfies Record<string, RouteMeta>

export type RoutePath = keyof typeof ROUTE_META

export const ROUTE_PATHS = Object.keys(ROUTE_META) as readonly RoutePath[]

export const LEGACY_REDIRECTS: Record<string, RoutePath> = {
  '/dashboard': '/dash',
  '/can': '/signals',
  '/ecu': '/signals',
  '/obd2': '/signals',
  '/themes': '/device',
  '/board': '/device',
  '/firmware': '/flash',
  '/about': '/contact',
  '/logs': '/live',
  '/cli': '/dash',
}

export const HOME_PATHS = new Set<RoutePath>(['/', '/flash', '/contact'])

export const DEVICE_GATED_PATHS = new Set<RoutePath>(['/dash', '/signals', '/live', '/device'])
