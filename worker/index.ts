import firmwareDownload from './firmware-download'

type Route = (req: Request) => Promise<Response>

const ROUTES: Record<string, Route> = {
  '/api/firmware-download': firmwareDownload,
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

const harden = (response: Response): Response => {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value)
  return response
}

const notFound = (): Response =>
  new Response('not_found', { status: 404, headers: { 'Content-Type': 'text/plain' } })

export default {
  fetch: async (request: Request): Promise<Response> => {
    const route = ROUTES[new URL(request.url).pathname]
    return harden(route ? await route(request) : notFound())
  },
}
