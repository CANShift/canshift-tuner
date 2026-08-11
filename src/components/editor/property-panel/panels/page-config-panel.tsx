import { useCallback, useState } from 'react'
import {
  DEFAULT_PAGE_PALETTE,
  DEFAULT_SCREEN_PROFILE_ID,
  FIRMWARE_CAPS,
  HexColorSchema,
  SCREEN_PROFILES,
  type DashboardConfig,
  type PageConfig,
  type ScreenProfileId,
} from '@canshift/core'

import { Checkbox } from '@/components/ui/checkbox'
import { CompactSelect } from '@/components/ui/form-field'
import { CruiseControlOverCapDialog } from '../../CruiseControlOverCapDialog'

const PANEL_LABEL = 'hsl(var(--brand-neutral-600))'
const PANEL_HINT = 'hsl(var(--brand-neutral-500))'
const CRUISE_CONTROL_PAGE_ID = 'cruise_control'

interface PageConfigPanelProps {
  config: DashboardConfig
  setTargetProfile: (id: ScreenProfileId) => void
  addPage: (page: PageConfig) => void
  removePage: (pageId: string) => void
}

export const PageConfigPanel = ({
  config,
  setTargetProfile,
  addPage,
  removePage,
}: PageConfigPanelProps) => {
  const [overCapPageIds, setOverCapPageIds] = useState<string[] | null>(null)

  const toggleCruiseControlPage = useCallback(
    (enabled: boolean) => {
      const existing = config.pages.find((p) => p.template === 'cruise_control')
      if (enabled && !existing) {
        if (config.pages.length >= FIRMWARE_CAPS.MAX_PAGES) {
          setOverCapPageIds(config.pages.map((p) => p.id))
          return
        }
        addPage({
          id: CRUISE_CONTROL_PAGE_ID,
          backgroundImage: null,
          backgroundColor: HexColorSchema.parse('#000000'),
          palette: DEFAULT_PAGE_PALETTE,
          showTopBar: true,
          template: 'cruise_control',
          widgets: [],
        })
      } else if (!enabled && existing) {
        removePage(existing.id)
      }
    },
    [config, addPage, removePage]
  )

  const activeProfileId: ScreenProfileId = config.targetProfile ?? DEFAULT_SCREEN_PROFILE_ID

  return (
    <>
      <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            color: PANEL_LABEL,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 6,
          }}
        >
          Target screen
        </div>
        <CompactSelect
          ariaLabel="Target screen profile"
          value={activeProfileId}
          options={SCREEN_PROFILES.map((profile) => ({
            value: profile.id,
            label: `${profile.name} — ${String(profile.width)}×${String(profile.height)}`,
          }))}
          onChange={(next) => {
            setTargetProfile(next as ScreenProfileId)
          }}
        />
        <div style={{ fontSize: 10, color: PANEL_HINT, marginTop: 4, marginBottom: 4 }}>
          Drives the editor canvas size. Widgets are not auto-scaled — out-of-bounds widgets are
          flagged on the canvas so you can adjust manually.
        </div>

        <div
          style={{
            fontSize: 10,
            color: PANEL_LABEL,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 6,
            marginTop: 12,
          }}
        >
          Modes
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: 'hsl(var(--brand-text))',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <Checkbox
            checked={config.pages.some((p) => p.template === 'cruise_control')}
            onCheckedChange={(checked) => {
              toggleCruiseControlPage(checked === true)
            }}
          />
          Cruise control page
        </label>
        <div style={{ fontSize: 10, color: PANEL_HINT, marginTop: 4, marginBottom: 4 }}>
          Adds a dedicated cruise control page at the end of the dashboard.
        </div>

        <div style={{ fontSize: 10, color: PANEL_HINT, marginTop: 12 }}>
          Select a widget to edit its properties.
        </div>
      </div>
      {overCapPageIds && (
        <CruiseControlOverCapDialog
          open
          onOpenChange={(open) => {
            if (!open) setOverCapPageIds(null)
          }}
          pageIds={overCapPageIds}
          maxPages={FIRMWARE_CAPS.MAX_PAGES}
        />
      )}
    </>
  )
}
