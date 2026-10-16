import { useRef, useState, type ChangeEvent } from 'react'
import { CANSHIFT_FILE_EXTENSION, CANSHIFT_FILE_MIME } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { readBackup, type ReadBackup } from '../../lib/backup/backup'
import { restoreBackup, saveBackup } from '../../stores/sync/backup-actions'
import { useToastStore } from '../../stores/toast.store'
import { UiIcon } from '../icons/UiIcons'
import { RestoreDialog } from './RestoreDialog'

const D = STRINGS.dash

type Chosen = Extract<ReadBackup, { kind: 'ok' }>

const readChosenFile = async (event: ChangeEvent<HTMLInputElement>): Promise<ReadBackup | null> => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file === undefined) return null
  return readBackup(file.name, await file.text())
}

const useRestore = () => {
  const [chosen, setChosen] = useState<Chosen | null>(null)
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const read = await readChosenFile(event)
    if (read === null) return
    if (read.kind === 'invalid') {
      useToastStore.getState().show(D.notABackup, 'warning')
      return
    }
    setChosen(read)
  }
  const replace = () => {
    if (chosen !== null) void restoreBackup(chosen.contents)
    setChosen(null)
  }
  return { chosen, onFile, replace, cancel: () => setChosen(null) }
}

const BackupButtons = ({ onRestore }: { onRestore: () => void }) => (
  <div className="flex flex-wrap gap-2">
    <Button variant="secondary" onClick={saveBackup}>
      <UiIcon name="download" />
      {D.saveBackup}
    </Button>
    <Button variant="outline" onClick={onRestore}>
      <UiIcon name="upload" />
      {D.restore}
    </Button>
  </div>
)

export const BackupCard = () => {
  const input = useRef<HTMLInputElement>(null)
  const restore = useRestore()
  return (
    <section className="flex flex-col gap-3 rounded-card border border-app-border bg-app-surface p-4 lg:p-5">
      <h2 className="text-[17px] font-bold">{D.backup}</h2>
      <p className="text-sm text-app-muted">{D.backupHint}</p>
      <BackupButtons onRestore={() => input.current?.click()} />
      <input
        ref={input}
        type="file"
        className="hidden"
        accept={`${CANSHIFT_FILE_EXTENSION},${CANSHIFT_FILE_MIME}`}
        onChange={(event) => void restore.onFile(event)}
      />
      <RestoreDialog
        summary={restore.chosen?.summary ?? null}
        onReplace={restore.replace}
        onSaveFirst={saveBackup}
        onCancel={restore.cancel}
      />
    </section>
  )
}
