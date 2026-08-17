import { Button } from '@/components/ui/button'
import { useBoardDraft } from '../../hooks/useBoardDraft'
import { IdentitySection } from './sections/identity-section'
import { LcdSection } from './sections/lcd-section'
import { BacklightSection } from './sections/backlight-section'
import { TouchSection } from './sections/touch-section'
import { CanSection } from './sections/can-section'
import { StorageSection } from './sections/storage-section'
import { ConnectivitySection } from './sections/connectivity-section'

export const CustomBoardBuilder = () => {
  const { draft, issues, patch, patchSection, save } = useBoardDraft()

  return (
    <div className="grid gap-4">
      <IdentitySection draft={draft} onPatch={patch} />
      <LcdSection
        lcd={draft.lcd}
        onPatch={(p) => {
          patchSection('lcd', p)
        }}
      />
      <BacklightSection
        backlight={draft.backlight}
        onPatch={(p) => {
          patchSection('backlight', p)
        }}
      />
      <TouchSection
        touch={draft.touch}
        onPatch={(p) => {
          patchSection('touch', p)
        }}
      />
      <CanSection
        can={draft.can}
        onPatch={(p) => {
          patchSection('can', p)
        }}
      />
      <StorageSection
        storage={draft.storage}
        onPatch={(p) => {
          patchSection('storage', p)
        }}
      />
      <ConnectivitySection
        conn={draft.conn}
        onPatch={(p) => {
          patchSection('conn', p)
        }}
      />

      {issues.length > 0 && (
        <div role="alert" className="grid gap-1 border border-brand-accent p-3 text-xs text-ui-ink">
          <span className="font-semibold">This board profile isn’t valid yet:</span>
          {issues.map((issue) => (
            <span key={issue} className="text-ui-muted">
              {issue}
            </span>
          ))}
        </div>
      )}

      <div>
        <Button onClick={save}>Save custom board</Button>
      </div>
    </div>
  )
}
