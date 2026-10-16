import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { useChanges } from '../../hooks/useChanges'
import { useUiStore } from '../../stores/ui.store'
import { undoAllChanges, undoChange } from '../../stores/sync/draft'
import { ChangeRow } from './ChangeRow'
import { SendButton } from './SendButton'

const useCloseWhenSynced = (count: number, close: () => void): void => {
  useEffect(() => {
    if (count === 0) close()
  }, [count, close])
}

const SheetHeading = ({ count }: { count: number }) => (
  <div className="flex flex-col gap-1">
    <SheetTitle className="text-[21px] font-bold lg:text-lg">
      {STRINGS.sync.notSent(count)}
    </SheetTitle>
    <SheetDescription className="text-sm text-app-muted">{STRINGS.sync.keptHere}</SheetDescription>
  </div>
)

const SheetActions = () => (
  <div className="flex gap-2">
    <Button variant="outline" className="h-[52px] px-[18px] text-[15px]" onClick={undoAllChanges}>
      {STRINGS.sync.undoAll}
    </Button>
    <SendButton className="h-[52px] flex-1 text-base" />
  </div>
)

export const NotSentSheet = () => {
  const changes = useChanges()
  const open = useUiStore((s) => s.notSentOpen)
  const setOpen = useUiStore((s) => s.setNotSentOpen)
  useCloseWhenSynced(changes.length, () => {
    setOpen(false)
  })
  return (
    <Sheet open={open && changes.length > 0} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeading count={changes.length} />
        <ul className="flex flex-col rounded-[12px] border border-app-border bg-app-bg">
          {changes.map((change) => (
            <ChangeRow key={change.id} change={change} onUndo={undoChange} />
          ))}
        </ul>
        <SheetActions />
      </SheetContent>
    </Sheet>
  )
}
