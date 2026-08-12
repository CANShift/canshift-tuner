import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { submitFeedback } from '../../lib/feedback'
import { readItem, writeItem, STORAGE_KEYS } from '../../lib/local-storage'
import { cn } from '@/lib/utils'

const STORAGE_KEY = STORAGE_KEYS.feedbackDismissedHint

const readDismissed = (): boolean => readItem(STORAGE_KEY) === '1'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const SEND_LABELS: Record<Status, string> = {
  idle: 'Send',
  sending: 'Sending…',
  sent: 'Send',
  error: 'Retry',
}

const FeedbackButton = () => {
  const [showHint, setShowHint] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const location = useLocation()

  useEffect(() => {
    setShowHint(!readDismissed())
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    writeItem(STORAGE_KEY, '1')
  }

  const openDialog = () => {
    dismissHint()
    setOpen(true)
    setStatus('idle')
  }

  const closeDialog = () => {
    setOpen(false)
    setMessage('')
    setEmail('')
    setStatus('idle')
    setErrorMessage('')
  }

  const submit = async () => {
    const trimmed = message.trim()
    if (trimmed.length === 0) return
    setStatus('sending')
    setErrorMessage('')
    const trimmedEmail = email.trim()
    const result = await submitFeedback({
      message: trimmed,
      route: location.pathname,
      tunerVersion: __TUNER_VERSION__,
      ...(trimmedEmail.length > 0 ? { email: trimmedEmail } : {}),
    })
    if (result.ok) {
      setStatus('sent')
      setTimeout(closeDialog, 1500)
      return
    }
    setStatus('error')
    setErrorMessage(result.error)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          role="dialog"
          aria-label="Send feedback"
          className={cn(
            SURFACE,
            'pointer-events-auto flex w-[320px] flex-col gap-2.5 p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
          )}
        >
          <div className="text-[13px] font-semibold text-brand-text">Send feedback</div>
          {status === 'sent' ? (
            <div className="py-2 text-[12px] text-success">Thanks — your feedback was sent.</div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                }}
                placeholder="Describe the bug or your suggestion…"
                rows={4}
                maxLength={1900}
                autoFocus
                className={cn(FIELD, 'resize-y p-2')}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                placeholder="Email (optional, for follow-up)"
                className={cn(FIELD, 'px-2 py-1.5')}
              />
              {status === 'error' && (
                <div role="alert" className="text-[12px] text-brand-accent">
                  Couldn’t send your feedback ({errorMessage}). Please try again.
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={status === 'sending'}
                  className="cursor-pointer border border-brand-neutral-300 bg-transparent px-2.5 py-[5px] text-[12px] text-brand-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void submit()
                  }}
                  disabled={status === 'sending' || message.trim().length === 0}
                  className={cn(
                    'border-none px-3 py-[5px] text-[12px] text-brand-ground',
                    message.trim().length === 0
                      ? 'cursor-not-allowed bg-brand-accent-600/35'
                      : 'cursor-pointer bg-brand-accent-600'
                  )}
                >
                  {SEND_LABELS[status]}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {!open && showHint && (
        <div
          role="status"
          className={cn(
            SURFACE,
            'pointer-events-auto max-w-[240px] px-3 py-2 text-[12px] leading-[1.4]',
            BUBBLE_SHADOW
          )}
        >
          Got a bug or a suggestion? Click the bubble.
          <button
            type="button"
            onClick={dismissHint}
            className="ml-2 cursor-pointer border-none bg-transparent text-[12px] text-brand-neutral-500"
            aria-label="Dismiss hint"
          >
            ✕
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={openDialog}
        aria-label="Send feedback"
        title="Send feedback"
        className={cn(
          'pointer-events-auto flex size-11 cursor-pointer items-center justify-center border-none bg-brand-accent text-brand-ground',
          BUBBLE_SHADOW
        )}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default FeedbackButton

const SURFACE = 'border border-brand-neutral-300 bg-brand-chrome-surface text-brand-neutral-700'

const FIELD =
  'border border-brand-neutral-300 bg-brand-neutral-100 text-[12px] [font-family:inherit] text-brand-neutral-700'

const BUBBLE_SHADOW = 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
