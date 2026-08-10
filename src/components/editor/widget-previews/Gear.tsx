import { memo } from 'react'
import { STALE_PLACEHOLDER } from '@canshift/core'
import type { BaseRendererProps } from './shared'
import { MONO_FONT } from '../../../lib/typography'

interface GearRendererProps extends BaseRendererProps {
  unbound?: boolean
}

export const GearPreview = memo(function GearPreview({
  widget,
  w,
  h,
  unbound = false,
}: GearRendererProps) {
  if (widget.config.type !== 'gear') return null
  const st = widget.style
  const fontSize = Math.min(w * 0.72, h * 0.85)

  return (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: st.primaryColor,
            fontSize,
            fontWeight: 800,
            fontFamily: MONO_FONT,
            lineHeight: 1,
            textAlign: 'center',
            width: '100%',
            display: 'inline-block',
          }}
        >
          {unbound ? STALE_PLACEHOLDER : '3'}
        </span>
      </div>
    </div>
  )
})
