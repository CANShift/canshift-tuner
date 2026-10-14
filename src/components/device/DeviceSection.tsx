import type { ReactNode } from 'react'

export interface DeviceSectionProps {
  title: string
  aside?: ReactNode
  children: ReactNode
}

export const DeviceSection = ({ title, aside, children }: DeviceSectionProps) => (
  <section className="min-w-0">
    <div className="flex h-11 items-center justify-between gap-4 border-b-2 border-ui-rule font-mono text-[10.5px] tracking-[0.18em] text-ui-muted">
      <h2>{title}</h2>
      {aside}
    </div>
    {children}
  </section>
)
