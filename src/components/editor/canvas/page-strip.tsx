import type { MouseEvent, ReactNode, Ref } from 'react'
import type { GridTracks, PageConfig, TopBarConfig } from '@canshift/core'
import { PageFrame, type PageFrameInteraction } from './page-frame'
import { useFaceColors } from './use-face-colors'

const THUMBNAIL_RATIO = 0.42
const LABEL = 'flex items-baseline justify-between gap-3 font-mono text-[10px] tracking-[0.18em]'
const REV_LIMIT =
  'cursor-pointer border-0 bg-transparent p-0 font-mono text-[10px] tracking-[0.16em] text-ui-accent disabled:opacity-60'

export interface ScreenSize {
  width: number
  height: number
}

export interface CurrentPageControls {
  interaction: PageFrameInteraction
  revLimiting: boolean
  onRevLimiter: () => void
  onToggleSettings: () => void
}

export interface PageCardProps {
  page: PageConfig
  index: number
  topBar: TopBarConfig
  tracks: GridTracks
  screen: ScreenSize
  scale: number
  current: CurrentPageControls | null
  onSelect: () => void
  onContextMenu: (event: MouseEvent) => void
}

interface PageWrapperProps {
  current: boolean
  onSelect: () => void
  onContextMenu: (event: MouseEvent) => void
  children: ReactNode
}

const PageWrapper = ({ current, onSelect, onContextMenu, children }: PageWrapperProps) => {
  if (current) {
    return (
      <div onContextMenu={onContextMenu} className="outline outline-2 outline-ui-accent">
        {children}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      onContextMenu={onContextMenu}
      title="Edit this page"
      className="cursor-pointer border-0 bg-transparent p-0 opacity-50 hover:opacity-100"
    >
      {children}
    </button>
  )
}

const PageLabel = ({ index, current }: { index: number; current: CurrentPageControls | null }) => (
  <div className={LABEL}>
    <span className={current !== null ? 'text-ui-ink' : 'text-ui-muted'}>PAGE {index + 1}</span>
    {current !== null && (
      <button
        type="button"
        onClick={current.onRevLimiter}
        disabled={current.revLimiting}
        title="Preview the rev limiter for five seconds"
        className={REV_LIMIT}
      >
        REV LIMIT
      </button>
    )}
  </div>
)

const areaHeight = (page: PageConfig, screen: ScreenSize, topBar: TopBarConfig): number =>
  page.showTopBar !== false ? screen.height - topBar.height : screen.height

type PagePreviewProps = Omit<PageCardProps, 'index' | 'onSelect' | 'onContextMenu'>

const PagePreview = ({ page, topBar, tracks, screen, scale, current }: PagePreviewProps) => {
  const { palette, bgColor, isDayMode } = useFaceColors(page)
  return (
    <PageFrame
      tracks={tracks}
      page={page}
      topBar={topBar}
      scale={current !== null ? scale : scale * THUMBNAIL_RATIO}
      palette={palette}
      bgColor={bgColor}
      isDayMode={isDayMode}
      areaWidth={screen.width}
      areaHeight={areaHeight(page, screen, topBar)}
      screenHeight={screen.height}
      revLimiting={current?.revLimiting ?? false}
      interaction={current?.interaction}
      onOpenSettings={current?.onToggleSettings}
    />
  )
}

export const PageCard = ({ index, onSelect, onContextMenu, ...preview }: PageCardProps) => (
  <>
    <PageLabel index={index} current={preview.current} />
    <PageWrapper
      current={preview.current !== null}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
    >
      <PagePreview {...preview} />
    </PageWrapper>
  </>
)

export interface PageStripProps extends Omit<
  PageCardProps,
  'page' | 'index' | 'current' | 'onSelect' | 'onContextMenu'
> {
  pages: readonly PageConfig[]
  currentPageId: string
  currentControls: CurrentPageControls
  currentRef: Ref<HTMLDivElement>
  onSelectPage: (pageId: string) => void
  onPageContextMenu: ((pageId: string, x: number, y: number) => void) | undefined
}

const contextMenuFor =
  (pageId: string, onPageContextMenu: PageStripProps['onPageContextMenu']) =>
  (event: MouseEvent) => {
    if (!onPageContextMenu) return
    event.preventDefault()
    onPageContextMenu(pageId, event.clientX, event.clientY)
  }

export const PageStrip = ({
  pages,
  currentPageId,
  currentControls,
  currentRef,
  onSelectPage,
  onPageContextMenu,
  ...shared
}: PageStripProps) => (
  <>
    {pages.map((candidate, index) => (
      <div
        key={candidate.id}
        ref={candidate.id === currentPageId ? currentRef : undefined}
        className="flex flex-none flex-col gap-2"
      >
        <PageCard
          {...shared}
          page={candidate}
          index={index}
          current={candidate.id === currentPageId ? currentControls : null}
          onSelect={() => onSelectPage(candidate.id)}
          onContextMenu={contextMenuFor(candidate.id, onPageContextMenu)}
        />
      </div>
    ))}
  </>
)
