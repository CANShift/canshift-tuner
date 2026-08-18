import { useState } from 'react'
import { ContactPane } from '../components/contact/ContactPane'
import { DiagnosticsToggle } from '../components/contact/DiagnosticsToggle'
import { useContactContext } from '../hooks/useContactContext'
import { useProjectStore } from '../stores/project/project.store'
import { submitFeedback, type FeedbackAttachment, type FeedbackKind } from '../lib/feedback'
import { buildContactReport, CONTACT_REPORT_FILENAME } from '../lib/contact-report'
import { downloadFile } from '../lib/download'
import { projectFileName } from '../lib/project-file'
import { readFileAsBase64 } from '../lib/file-base64'

const MESSAGE_MIN = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONFIG_MIME = 'application/json'
const REPORT_MIME = 'text/plain;charset=utf-8'

const INVALID_EMAIL = 'That email address does not look right — we answer to it, so it has to work.'
const SHORT_MESSAGE = 'Tell us a little more — what you expected, and what happened instead.'

const ContactRoute = () => {
  const { context, lines } = useContactContext()
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const activeProjectName = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId)?.name ?? 'config'
  )
  const exportProject = useProjectStore((s) => s.exportProject)

  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [contextAttached, setContextAttached] = useState(true)
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configJson = (): string | null =>
    activeProjectId === null ? null : exportProject(activeProjectId)

  const carriesContext = kind === 'bug' && contextAttached

  const addAttachments = async (files: FileList) => {
    const encoded = await Promise.all([...files].map(readFileAsBase64))
    setAttachments((prev) => [
      ...prev.filter((file) => !encoded.some((next) => next.name === file.name)),
      ...encoded,
    ])
  }

  const attachConfig = () => {
    const json = configJson()
    if (json === null) {
      setError('There is no config open to attach.')
      return
    }
    const name = projectFileName(activeProjectName)
    setAttachments((prev) => [
      ...prev.filter((file) => file.name !== name),
      { name, mimetype: CONFIG_MIME, content: btoa(unescape(encodeURIComponent(json))) },
    ])
  }

  const send = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(INVALID_EMAIL)
      return
    }
    if (message.trim().length < MESSAGE_MIN) {
      setError(SHORT_MESSAGE)
      return
    }
    setError(null)
    setSending(true)
    const result = await submitFeedback({
      kind,
      email,
      message,
      context: carriesContext ? context : null,
      attachments,
    })
    setSending(false)
    if (result.ok) {
      setSent(true)
      return
    }
    setError(result.error)
  }

  return (
    <ContactPane
      kind={kind}
      onKindChange={setKind}
      email={email}
      onEmailChange={setEmail}
      message={message}
      onMessageChange={setMessage}
      contextLines={lines}
      contextAttached={contextAttached}
      onToggleContext={() => {
        setContextAttached((on) => !on)
      }}
      attachments={attachments}
      onAttachFiles={(files) => {
        void addAttachments(files)
      }}
      onAttachConfig={attachConfig}
      onRemoveAttachment={(name) => {
        setAttachments((prev) => prev.filter((file) => file.name !== name))
      }}
      onDownloadReport={() => {
        downloadFile(
          CONTACT_REPORT_FILENAME,
          REPORT_MIME,
          buildContactReport({
            kind,
            email,
            message,
            context: carriesContext ? context : null,
            configJson: configJson(),
          })
        )
      }}
      onSend={() => {
        void send()
      }}
      sending={sending}
      sent={sent}
      error={error}
      diagnosticsToggle={<DiagnosticsToggle />}
    />
  )
}

export default ContactRoute
