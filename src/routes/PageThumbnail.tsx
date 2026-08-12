import { memo } from 'react'
import type { PageConfig, ScreenProfile, TopBarConfig } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE, resolveGridRect, resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { CruiseControlPreview } from '../components/editor/CruiseControlPreview'
import { WidgetPreview } from '../components/editor/WidgetPreview'

export const THUMB_W = 128

export interface PageThumbnailProps {
  page: PageConfig
  topBar: TopBarConfig
}

const PageThumbnailImpl = ({ page, topBar }: PageThumbnailProps) => {
  const targetProfileId = useDashboardStore((s) => s.config?.targetProfile)
  const profile: ScreenProfile = resolveScreenProfile(targetProfileId)
  const thumbH = Math.round((THUMB_W * profile.height) / profile.width)
  const thumbScale = THUMB_W / profile.width
  const fullBarH = page.showTopBar !== false ? topBar.height : 0
  const isCruiseTemplate = page.template === 'cruise_control'

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: THUMB_W, height: thumbH, background: page.backgroundColor }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{
          width: profile.width,
          height: profile.height,
          background: page.backgroundColor,
          transform: `scale(${String(thumbScale)})`,
        }}
      >
        {page.showTopBar !== false && (
          <div
            className="absolute left-0 right-0 top-0 border-b border-solid border-[#1E1E1E]"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ height: fullBarH, background: topBar.bgColor }}
          />
        )}

        {isCruiseTemplate ? (
          <CruiseControlPreview
            scale={1}
            canvasW={profile.width}
            contentH={profile.height - fullBarH}
            palette={page.palette ?? DEFAULT_PAGE_PALETTE}
          />
        ) : (
          page.widgets.map((widget) => {
            const rect = resolveGridRect(widget.layout, {
              width: profile.width,
              height: profile.height - fullBarH,
            })
            return (
              <div
                key={widget.id}
                className="absolute overflow-hidden"
                // eslint-disable-next-line no-inline-style/no-inline-style
                style={{ left: rect.x, top: fullBarH + rect.y, width: rect.w, height: rect.h }}
              >
                <WidgetPreview widget={widget} displayW={rect.w} displayH={rect.h} noAnimate />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export const PageThumbnail = memo(PageThumbnailImpl)
