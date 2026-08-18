import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { FeedbackAttachment, FeedbackKind } from '../../lib/feedback'

export interface ContactPaneProps {
  kind: FeedbackKind
  onKindChange: (kind: FeedbackKind) => void
  email: string
  onEmailChange: (email: string) => void
  message: string
  onMessageChange: (message: string) => void
  contextLines: string[]
  contextAttached: boolean
  onToggleContext: () => void
  attachments: FeedbackAttachment[]
  onAttachFiles: (files: FileList) => void
  onAttachConfig: () => void
  onRemoveAttachment: (name: string) => void
  onDownloadReport: () => void
  onSend: () => void
  sending: boolean
  sent: boolean
  error: string | null
  diagnosticsToggle: ReactNode
}

const KIND_OPTIONS: readonly { value: FeedbackKind; label: string }[] = [
  { value: 'bug', label: 'BUG' },
  { value: 'ecu-request', label: 'ECU REQUEST' },
  { value: 'info', label: 'QUESTION' },
]

const FIELD_LABEL = 'mb-2 block font-mono text-[10px] tracking-[0.16em] text-ui-muted'
const FIELD = [
  'w-full border border-ui-ink bg-ui-bg px-3.5 py-3',
  'font-mono text-[14px] text-ui-ink outline-none',
].join(' ')

const ISSUES_URL = 'https://github.com/CANShift/canshift-tuner/issues'

export const ContactPane = ({
  kind,
  onKindChange,
  email,
  onEmailChange,
  message,
  onMessageChange,
  contextLines,
  contextAttached,
  onToggleContext,
  attachments,
  onAttachFiles,
  onAttachConfig,
  onRemoveAttachment,
  onDownloadReport,
  onSend,
  sending,
  sent,
  error,
  diagnosticsToggle,
}: ContactPaneProps) => (
  <div className="max-w-[720px] px-11 pb-[60px] pt-12">
    <p className="border-b-2 border-ui-rule pb-3 font-mono text-[10.5px] tracking-[0.2em] text-ui-muted">
      SUPPORT
    </p>
    <h1 className="mb-3 mt-6 text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ui-ink">
      Tell us what happened.
    </h1>
    <p className="mb-7 max-w-[46ch] text-pretty text-[15px] leading-[1.6] text-ui-muted">
      Bug, unsupported ECU, or a question about a build. We read every message.
    </p>

    {sent ? (
      <p className="max-w-[560px] border-l-[3px] border-ui-ok bg-ui-panel px-[18px] py-4 font-mono text-[13.5px] text-ui-ink">
        Sent. We answer to {email} within two working days.
      </p>
    ) : (
      <div className="flex max-w-[560px] flex-col gap-[18px]">
        <div>
          <span className={FIELD_LABEL}>TYPE</span>
          <div className="flex flex-wrap gap-px">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onKindChange(option.value)
                }}
                className={cn(segment({ active: option.value === kind }))}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className={FIELD_LABEL}>EMAIL</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value)
            }}
            placeholder="you@example.com"
            spellCheck={false}
            className={FIELD}
          />
        </label>

        <label className="block">
          <span className={FIELD_LABEL}>MESSAGE</span>
          <textarea
            value={message}
            onChange={(e) => {
              onMessageChange(e.target.value)
            }}
            rows={6}
            placeholder="What did you expect, and what happened instead?"
            className={cn(FIELD, 'resize-y font-sans text-[14.5px] leading-[1.6]')}
          />
        </label>

        {kind === 'bug' && (
          <div className="border-t border-ui-line pt-4">
            <p className={FIELD_LABEL}>ATTACHED AUTOMATICALLY</p>
            <div className="font-mono text-[13px] leading-[1.9] text-ui-muted">
              {contextAttached
                ? contextLines.map((line) => <div key={line}>{line}</div>)
                : 'Removed — the report will carry your message only.'}
            </div>
            <button
              type="button"
              onClick={onToggleContext}
              className="mt-2.5 cursor-pointer border border-ui-line-strong bg-transparent px-3 py-[7px] font-mono text-[11.5px] text-ui-muted hover:text-ui-ink"
            >
              {contextAttached ? 'Remove the context' : 'Attach the context'}
            </button>
          </div>
        )}

        <div className="border-t border-ui-line pt-4">
          <p className={FIELD_LABEL}>FILES</p>
          {attachments.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3.5 border-b border-ui-line py-2.5 font-mono text-[13px]"
            >
              <span className="min-w-0 flex-1 truncate text-ui-ink">{file.name}</span>
              <span className="text-ui-faint">{file.mimetype}</span>
              <button
                type="button"
                onClick={() => {
                  onRemoveAttachment(file.name)
                }}
                className="cursor-pointer border-0 bg-transparent font-mono text-[12px] text-ui-accent"
              >
                remove
              </button>
            </div>
          ))}
          <div className="mt-3 flex flex-wrap gap-px">
            <label className="cursor-pointer whitespace-nowrap border border-ui-ink px-4 py-[11px] text-[12.5px] font-bold text-ui-ink hover:bg-ui-panel">
              Attach files
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) onAttachFiles(e.target.files)
                  e.target.value = ''
                }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={onAttachConfig}
              className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-4 py-[11px] text-left text-[12.5px] font-bold text-ui-ink hover:bg-ui-panel"
            >
              Attach current config
            </button>
            <button
              type="button"
              onClick={onDownloadReport}
              className="cursor-pointer whitespace-nowrap border border-ui-line-strong bg-transparent px-4 py-[11px] text-left text-[12.5px] font-bold text-ui-muted hover:text-ui-ink"
            >
              Download report
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onSend}
            disabled={sending}
            className="cursor-pointer whitespace-nowrap border-0 bg-ui-accent px-[22px] py-3.5 text-left text-[13px] font-extrabold tracking-[0.09em] text-white hover:bg-ui-accent-hover disabled:opacity-70"
          >
            {sending ? 'SENDING…' : 'SEND'}
          </button>
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12.5px] text-ui-muted no-underline hover:text-ui-accent"
          >
            Open an issue on GitHub ↗
          </a>
        </div>

        {error !== null && (
          <p role="alert" className="font-mono text-[12.5px] text-ui-accent">
            {error}
          </p>
        )}

        <div className="border-t border-ui-line pt-4">{diagnosticsToggle}</div>
      </div>
    )}
  </div>
)

const segment = cva(
  [
    'cursor-pointer whitespace-nowrap border border-ui-ink px-4 py-2.5',
    'text-[12.5px] font-bold tracking-[0.06em]',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)
