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

export const useFirmwareManifest = (release: ReleaseInfo | null): ManifestState => {
  const [state, setState] = useState<ManifestState>({ kind: 'idle' })

  useEffect(() => {
    if (!release) {
      setState({ kind: 'idle' })
      return
    }
    const asset = findManifestAsset(release)
    if (!asset) {
      setState({ kind: 'none' })
      return
    }

    let cancelled = false
    setState({ kind: 'loading' })
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
        if (!manifest) {
          setState({ kind: 'error', message: 'The release manifest was malformed.' })
          return
        }
        setState({ kind: 'ok', manifest })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Manifest fetch failed.',
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

  return state
}
