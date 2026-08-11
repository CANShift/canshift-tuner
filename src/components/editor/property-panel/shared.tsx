import React from 'react'
import type { GaugeDisplayStyle, SignalDef, Widget } from '@canshift/core'

export const Field = ({
  label,
  children,
  onReset,
}: {
  label: string
  children: React.ReactNode
  onReset?: (() => void) | undefined
}) => {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
        <label
          style={{
            display: 'block',
            fontSize: 10,
            color: 'hsl(var(--brand-neutral-500))',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </label>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset to default"
            style={{
              padding: 0,
              width: 14,
              height: 14,
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--brand-neutral-500))',
              cursor: 'pointer',
              fontSize: 11,
              lineHeight: '14px',
            }}
          >
            ↺
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 7px',
  background: 'hsl(var(--brand-neutral-100))',
  border: '1px solid hsl(var(--brand-neutral-300))',
  color: 'hsl(var(--brand-neutral-700))',
  fontSize: 12,
  boxSizing: 'border-box',
  outline: 'none',
}

export const numberInputStyle: React.CSSProperties = {
  ...inputStyle,
  width: '100%',
}

export const Row = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ display: 'flex', gap: 6 }}>{children}</div>
}

export interface ConfigFieldsProps {
  widget: Widget
  onChange: (patch: Partial<Widget>) => void
  signalDef?: SignalDef | undefined
}

export const GAUGE_STYLES: { value: GaugeDisplayStyle; label: string }[] = [
  { value: 'arc', label: 'Arc' },
  { value: 'numeric', label: 'Numeric' },
]
