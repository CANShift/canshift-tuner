export const config = {
  runtime: 'edge',
}

const OWNER = 'CANShift'
const REPO = 'canshift-firmware'

const TAG_RE = /^v?\d+\.\d+\.\d+([.-][a-z0-9.-]+)?$/i
const ASSET_RE = /^[a-z0-9._-]+\.(bin|json)$/i

const assetContentType = (asset: string): string =>
  asset.toLowerCase().endsWith('.json') ? 'application/json' : 'application/octet-stream'

const RATE_LIMIT = 20
const WINDOW_MS = 60_000
const MAX_ASSET_BYTES = 16 * 1024 * 1024

const hits = new Map<string, { count: number; resetAt: number }>()

const clientIp = (req: Request): string =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'unknown'

const pruneExpired = (now: number): void => {
  for (const [key, value] of hits) {
    if (now > value.resetAt) hits.delete(key)
  }
}

const rateLimited = (ip: string): boolean => {
  const now = Date.now()
  const entry = hits.get(ip)
  if (entry && now <= entry.resetAt) {
    entry.count += 1
    return entry.count > RATE_LIMIT
  }
  if (hits.size > 10_000) pruneExpired(now)
  hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  return false
}

const cappedStream = (): TransformStream<Uint8Array, Uint8Array> => {
  let forwarded = 0
  return new TransformStream({
    transform: (chunk, controller) => {
      forwarded += chunk.byteLength
      if (forwarded > MAX_ASSET_BYTES) {
        controller.error(new Error('asset_too_large'))
        return
      }
      controller.enqueue(chunk)
    },
  })
}

const respond = (status: number, body: string, headers: HeadersInit = {}): Response =>
  new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain', ...headers },
  })

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)
  const tag = url.searchParams.get('tag')
  const asset = url.searchParams.get('asset')

  if (!tag || !TAG_RE.test(tag) || tag.includes('..')) return respond(400, 'bad_tag')
  if (!asset || !ASSET_RE.test(asset) || asset.includes('..')) return respond(400, 'bad_asset')

  if (rateLimited(clientIp(req))) {
    return respond(429, 'rate_limited', {
      'Retry-After': (WINDOW_MS / 1000).toString(),
    })
  }

  const target = `https://github.com/${OWNER}/${REPO}/releases/download/${tag}/${asset}`

  let upstream: Response
  try {
    upstream = await fetch(target, { redirect: 'follow' })
  } catch (err) {
    return respond(502, `upstream_failed: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  if (!upstream.ok || !upstream.body) {
    return respond(upstream.status, `upstream_failed_${upstream.status.toString()}`)
  }

  const length = upstream.headers.get('content-length')
  if (length && Number(length) > MAX_ASSET_BYTES) return respond(502, 'asset_too_large')

  const passHeaders = new Headers({
    'Content-Type': assetContentType(asset),
    'Cache-Control': 'public, max-age=3600',
  })
  if (length) passHeaders.set('Content-Length', length)

  return new Response(upstream.body.pipeThrough(cappedStream()), {
    status: 200,
    headers: passHeaders,
  })
}

export default handler
