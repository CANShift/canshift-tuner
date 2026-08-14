import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type InlineStateSeverity = 'neutral' | 'warning' | 'failure' | 'empty'

export interface InlineStateAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

export interface InlineStateHeader {
  label: string
  status: string
}

export interface InlineStateProps {
  severity: InlineStateSeverity
  title?: string | undefined
  kicker?: string | undefined
  body?: ReactNode
  header?: InlineStateHeader | undefined
  primaryAction?: InlineStateAction | undefined
  secondaryAction?: InlineStateAction | undefined
  footnote?: ReactNode
  children?: ReactNode
  className?: string | undefined
}

interface InlineStateSkin {
  block: string
  region: string
  kicker: string
  title: string
  actions: string
  role: 'status' | 'alert'
}

const SKINS: Record<InlineStateSeverity, InlineStateSkin> = {
  neutral: {
    block: 'border-l-[3px] border-brand-text bg-brand-neutral-100',
    region: 'px-[18px] py-[14px]',
    kicker: 'mb-1.5 text-brand-neutral-600',
    title: 'mb-1',
    actions: 'mt-[14px]',
    role: 'status',
  },
  warning: {
    block: 'border-l-[3px] border-brand-warning bg-brand-neutral-100',
    region: 'px-[18px] py-[14px]',
    kicker: 'mb-1.5 text-brand-neutral-600',
    title: 'mb-1',
    actions: 'mt-[14px]',
    role: 'alert',
  },
  failure: {
    block: 'border-l-[3px] border-brand-accent bg-brand-accent-100',
    region: 'px-[18px] py-[14px]',
    kicker: 'mb-1.5 text-brand-accent-700',
    title: 'mb-1',
    actions: 'mt-[14px]',
    role: 'alert',
  },
  empty: {
    block: 'border border-brand-neutral-400',
    region: 'gap-3 px-[22px] py-[20px]',
    kicker: 'text-brand-neutral-600',
    title: '',
    actions: '',
    role: 'status',
  },
}

const FRAMED_REGION = 'gap-[10px] px-4 py-[14px]'
const HEADER_ROW =
  'flex items-center justify-between border-b border-brand-neutral-300 px-4 py-[11px] font-mono text-[11px] tracking-[0.12em] text-brand-neutral-600'
const KICKER = 'font-mono text-[11px] tracking-[0.14em]'
const TITLE = 'font-sans text-[17px] font-extrabold'
const BODY = 'text-[13.5px] leading-[1.55] text-brand-neutral-700'
const FOOTNOTE = 'mt-3 text-[13px] leading-[1.55] text-brand-neutral-700'
const ACTION = 'h-auto justify-start px-4 py-[10px] text-[12.5px] font-extrabold leading-[1.2]'
const SECONDARY_ACTION = 'border-brand-divider bg-transparent'

interface InlineStateActionsProps {
  primaryAction: InlineStateAction | undefined
  secondaryAction: InlineStateAction | undefined
  className: string
}

const InlineStateActions = ({
  primaryAction,
  secondaryAction,
  className,
}: InlineStateActionsProps) => {
  if (!primaryAction && !secondaryAction) return null
  return (
    <div className={cn('flex gap-px', className)}>
      {primaryAction ? (
        <Button
          type="button"
          variant="default"
          className={ACTION}
          disabled={primaryAction.disabled}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>
      ) : null}
      {secondaryAction ? (
        <Button
          type="button"
          variant="outline"
          className={cn(ACTION, SECONDARY_ACTION)}
          disabled={secondaryAction.disabled}
          onClick={secondaryAction.onClick}
        >
          {secondaryAction.label}
        </Button>
      ) : null}
    </div>
  )
}

export interface InlineStateHeaderRowProps {
  header: InlineStateHeader | undefined
}

export const InlineStateHeaderRow = ({ header }: InlineStateHeaderRowProps) => {
  if (!header) return null
  return (
    <div className={HEADER_ROW}>
      <span>{header.label}</span>
      <span>{header.status}</span>
    </div>
  )
}

export const InlineState = ({
  severity,
  title,
  kicker,
  body,
  header,
  primaryAction,
  secondaryAction,
  footnote,
  children,
  className,
}: InlineStateProps) => {
  const skin = SKINS[severity]
  return (
    <div className={cn('flex flex-col', className)}>
      <div role={skin.role} className={cn('flex flex-col', skin.block)}>
        <InlineStateHeaderRow header={header} />
        <div
          className={cn('flex flex-col items-start', header ? FRAMED_REGION : skin.region)}
          data-inline-state={severity}
        >
          {kicker ? <div className={cn(KICKER, skin.kicker)}>{kicker}</div> : null}
          {title ? <div className={cn(TITLE, skin.title)}>{title}</div> : null}
          {body ? <div className={BODY}>{body}</div> : null}
          {children}
          <InlineStateActions
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            className={skin.actions}
          />
        </div>
      </div>
      {footnote ? <div className={FOOTNOTE}>{footnote}</div> : null}
    </div>
  )
}
