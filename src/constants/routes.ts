export const ROUTE_PATHS = [
  '/',
  '/dashboard',
  '/can',
  '/ecu',
  '/obd2',
  '/themes',
  '/live',
  '/logs',
  '/cli',
  '/board',
  '/firmware',
  '/about',
] as const

export type RoutePath = (typeof ROUTE_PATHS)[number]
