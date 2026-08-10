import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { submitFeedback } from '../../lib/feedback'
import { readItem, writeItem, STORAGE_KEYS } from '../../lib/local-storage'

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
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Send feedback"
          style={{
            background: 'hsl(var(--brand-chrome-surface))',
            color: 'hsl(var(--brand-neutral-700))',
            border: '1px solid hsl(var(--brand-neutral-300))',
            padding: 14,
            width: 320,
            pointerEvents: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--brand-text))' }}>
            Send feedback
          </div>
          {status === 'sent' ? (
            <div style={{ fontSize: 12, color: 'hsl(var(--success))', padding: '8px 0' }}>
              Thanks — your feedback was sent.
            </div>
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
                style={{
                  background: 'hsl(var(--brand-neutral-100))',
                  border: '1px solid hsl(var(--brand-neutral-300))',
                  color: 'hsl(var(--brand-neutral-700))',
                  fontSize: 12,
                  padding: 8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                placeholder="Email (optional, for follow-up)"
                style={{
                  background: 'hsl(var(--brand-neutral-100))',
                  border: '1px solid hsl(var(--brand-neutral-300))',
                  color: 'hsl(var(--brand-neutral-700))',
                  fontSize: 12,
                  padding: '6px 8px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {status === 'error' && (
                <div role="alert" style={{ fontSize: 12, color: 'hsl(var(--brand-accent))' }}>
                  Couldn’t send your feedback ({errorMessage}). Please try again.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={status === 'sending'}
                  style={{
                    background: 'transparent',
                    border: '1px solid hsl(var(--brand-neutral-300))',
                    color: 'hsl(var(--brand-neutral-600))',
                    fontSize: 12,
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void submit()
                  }}
                  disabled={status === 'sending' || message.trim().length === 0}
                  style={{
                    background:
                      message.trim().length === 0
                        ? 'hsl(var(--brand-accent-600) / 0.35)'
                        : 'hsl(var(--brand-accent-600))',
                    border: 'none',
                    color: 'hsl(var(--brand-ground))',
                    fontSize: 12,
                    padding: '5px 12px',
                    cursor: message.trim().length === 0 ? 'not-allowed' : 'pointer',
                  }}
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
          style={{
            background: 'hsl(var(--brand-chrome-surface))',
            color: 'hsl(var(--brand-neutral-700))',
            border: '1px solid hsl(var(--brand-neutral-300))',
            padding: '8px 12px',
            fontSize: 12,
            lineHeight: 1.4,
            maxWidth: 240,
            pointerEvents: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          Got a bug or a suggestion? Click the bubble.
          <button
            type="button"
            onClick={dismissHint}
            style={{
              marginLeft: 8,
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--brand-neutral-500))',
              cursor: 'pointer',
              fontSize: 12,
            }}
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
        style={{
          width: 44,
          height: 44,
          background: 'hsl(var(--brand-accent))',
          color: 'hsl(var(--brand-ground))',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
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
