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
  '/dashboard': {
    title: 'Pages & widgets — CANShift Tuner',
    description:
      'Arrange pages and widgets on the dash canvas — gauges, warnings, gear and shift lights — with a live device-accurate preview.',
  },
  '/can': {
    title: 'CAN bus — CANShift Tuner',
    description:
      'Scan the CAN bus live — frame rates, byte histograms and signal binding straight from the wire.',
  },
  '/ecu': {
    title: 'ECU profile — CANShift Tuner',
    description:
      'Load an ECU broadcast profile from the catalogue or import its XML, and preview the decoded signals.',
  },
  '/obd2': {
    title: 'OBD-II — CANShift Tuner',
    description:
      'Tune OBD-II PID polling and read diagnostic trouble codes from the connected device.',
  },
  '/themes': {
    title: 'Themes — CANShift Tuner',
    description: 'Pick a colour theme for the dash and preview its palette before burning it.',
  },
  '/live': {
    title: 'Live data — CANShift Tuner',
    description: 'Watch decoded signal values stream from the device in real time.',
  },
  '/logs': {
    title: 'Logs — CANShift Tuner',
    description: 'Browse device log output and recorded sessions.',
  },
  '/cli': {
    title: 'CLI — CANShift Tuner',
    description: 'Send raw firmware opcodes to the device over USB.',
  },
  '/board': {
    title: 'Board config — CANShift Tuner',
    description:
      'Select a supported board or describe custom hardware — display, touch, pins and CAN transceiver.',
  },
  '/firmware': {
    title: 'Firmware — CANShift Tuner',
    description: 'Download CANShift firmware releases and flash them to the board over WebSerial.',
  },
  '/about': {
    title: 'About — CANShift Tuner',
    description: 'Version details, device diagnostics and feedback.',
  },
} as const satisfies Record<string, RouteMeta>

export type RoutePath = keyof typeof ROUTE_META

export const ROUTE_PATHS = Object.keys(ROUTE_META) as readonly RoutePath[]
