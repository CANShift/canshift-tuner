import { UiIcon } from '../icons/UiIcons'

export const ROW_LINK =
  'flex min-h-[52px] w-full items-center gap-3 rounded-[12px] border border-app-border px-3.5 text-left text-app-secondary lg:py-2 no-underline'

export interface RowLinkLabelProps {
  title: string
  hint: string
}

export const RowLinkLabel = ({ title, hint }: RowLinkLabelProps) => (
  <>
    <span className="flex flex-1 flex-col">
      <span className="text-[15px]">{title}</span>
      <span className="text-xs text-app-muted lg:text-sm">{hint}</span>
    </span>
    <UiIcon name="chevronRight" className="text-app-muted" />
  </>
)
