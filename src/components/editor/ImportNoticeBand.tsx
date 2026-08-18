import { useUiStore } from '../../stores/ui.store'

export const ImportNoticeBand = () => {
  const notice = useUiStore((s) => s.importNotice)
  const setImportNotice = useUiStore((s) => s.setImportNotice)
  if (notice === null) return null

  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-l-[3px] border-ui-line border-l-ui-warning bg-ui-panel px-6 py-3">
      <span className="font-mono text-[12.5px] text-ui-ink">{notice}</span>
      <button
        type="button"
        onClick={() => {
          setImportNotice(null)
        }}
        className="ml-auto cursor-pointer border-0 bg-transparent font-mono text-[12px] text-ui-muted hover:text-ui-ink"
      >
        dismiss
      </button>
    </div>
  )
}
