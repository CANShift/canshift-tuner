import { useEffect, useRef } from 'react'
import { detectOverflow } from '../lib/detect-overflow'
import { overflowMessage, overflowSignature } from '../lib/overflow-warning'
import { useDashboardStore } from '../stores/dashboard.store'
import { useLogStore } from '../stores/log.store'

export const useWidgetOverflowWarnings = (): void => {
  const config = useDashboardStore((s) => s.config)
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const log = useLogStore((s) => s.push)
  const lastSignatureRef = useRef<string | null>(null)

  useEffect(() => {
    if (!config) {
      lastSignatureRef.current = null
      return
    }
    const overflowing = detectOverflow(config)
    const signature = overflowSignature(targetProfile, overflowing)
    if (signature === lastSignatureRef.current) return
    lastSignatureRef.current = signature
    if (overflowing.length === 0) return
    log('warn', overflowMessage(overflowing), 'overflow')
  }, [config, targetProfile, log])
}
