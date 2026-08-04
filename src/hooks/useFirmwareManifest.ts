import { useEffect, useState } from 'react'
import type { ReleaseInfo } from '@canshift/core'
import { findManifestAsset } from '../lib/firmware/releases'
import { firmwareAssetProxyUrl } from '../lib/firmware/download'
import { parseManifest, type BoardManifest } from '../lib/firmware/manifest'

const MANIFEST_FETCH_TIMEOUT_MS = 10_000

export type ManifestState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'ok'; manifest: BoardManifest }
  | { kind: 'error'; message: string }

interface ScopedManifest {
  tag: string | null
  state: ManifestState
}

export const resolveManifestForRelease = (
  requestedTag: string | null,
  scoped: ScopedManifest
): ManifestState => {
  if (requestedTag !== scoped.tag) {
    return requestedTag === null ? { kind: 'idle' } : { kind: 'loading' }
  }
  return scoped.state
}

export const useFirmwareManifest = (release: ReleaseInfo | null): ManifestState => {
  const [scoped, setScoped] = useState<ScopedManifest>({ tag: null, state: { kind: 'idle' } })

  useEffect(() => {
    if (!release) {
      setScoped({ tag: null, state: { kind: 'idle' } })
      return
    }
    const tag = release.tag
    const asset = findManifestAsset(release)
    if (!asset) {
      setScoped({ tag, state: { kind: 'none' } })
      return
    }

    let cancelled = false
    setScoped({ tag, state: { kind: 'loading' } })
    const controller = new AbortController()
    const timer = setTimeout(() => {
      controller.abort()
    }, MANIFEST_FETCH_TIMEOUT_MS)

    void fetch(firmwareAssetProxyUrl(asset.downloadUrl), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
        return response.text()
      })
      .then((text) => {
        if (cancelled) return
        const manifest = parseManifest(text)
        setScoped({
          tag,
          state: manifest
            ? { kind: 'ok', manifest }
            : { kind: 'error', message: 'The release manifest was malformed.' },
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setScoped({
          tag,
          state: {
            kind: 'error',
            message: err instanceof Error ? err.message : 'Manifest fetch failed.',
          },
        })
      })
      .finally(() => {
        clearTimeout(timer)
      })

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [release])

  return resolveManifestForRelease(release?.tag ?? null, scoped)
}
