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
import { CompactSelect, SectionLabel } from '@/components/ui/form-field'
import { CruiseControlOverCapNotice } from '../../CruiseControlOverCapNotice'

const CRUISE_CONTROL_PAGE_ID = 'cruise_control'

interface PageConfigPanelProps {
  config: DashboardConfig
  setTargetProfile: (id: ScreenProfileId) => void
  addPage: (page: PageConfig) => void
  removePage: (pageId: string) => void
}

type CruiseToggle = 'add' | 'over-cap' | 'remove' | 'none'

export const cruiseToggle = (config: DashboardConfig, enabled: boolean): CruiseToggle => {
  const exists = config.pages.some((p) => p.template === 'cruise_control')
  if (enabled === exists) return 'none'
  if (!enabled) return 'remove'
  return config.pages.length >= FIRMWARE_CAPS.MAX_PAGES ? 'over-cap' : 'add'
}

const cruisePage = (): PageConfig => ({
  id: CRUISE_CONTROL_PAGE_ID,
  backgroundImage: null,
  backgroundColor: HexColorSchema.parse('#000000'),
  palette: DEFAULT_PAGE_PALETTE,
  showTopBar: true,
  template: 'cruise_control',
  widgets: [],
})

const useCruiseToggle = ({
  config,
  addPage,
  removePage,
}: Omit<PageConfigPanelProps, 'setTargetProfile'>) => {
  const [overCapPageIds, setOverCapPageIds] = useState<string[] | null>(null)
  const toggle = useCallback(
    (enabled: boolean) => {
      const actions: Record<CruiseToggle, () => void> = {
        add: () => addPage(cruisePage()),
        'over-cap': () => setOverCapPageIds(config.pages.map((p) => p.id)),
        remove: () => {
          const existing = config.pages.find((p) => p.template === 'cruise_control')
          if (existing) removePage(existing.id)
        },
        none: () => undefined,
      }
      actions[cruiseToggle(config, enabled)]()
    },
    [config, addPage, removePage]
  )
  return { overCapPageIds, dismiss: () => setOverCapPageIds(null), toggle }
}

const NOTE = 'my-1 text-[10px] text-brand-neutral-500'

const TargetScreenSection = ({
  config,
  setTargetProfile,
}: Pick<PageConfigPanelProps, 'config' | 'setTargetProfile'>) => (
  <>
    <div className="mb-1.5">
      <SectionLabel>Target screen</SectionLabel>
    </div>
    <CompactSelect
      ariaLabel="Target screen profile"
      value={config.targetProfile ?? DEFAULT_SCREEN_PROFILE_ID}
      options={SCREEN_PROFILES.map((profile) => ({
        value: profile.id,
        label: `${profile.name} — ${String(profile.width)}×${String(profile.height)}`,
      }))}
      onChange={(next) => {
        setTargetProfile(next as ScreenProfileId)
      }}
    />
    <div className={NOTE}>
      Drives the editor canvas size. Widgets are not auto-scaled — out-of-bounds widgets are flagged
      on the canvas so you can adjust manually.
    </div>
  </>
)

const ModesSection = ({
  config,
  onToggle,
}: {
  config: DashboardConfig
  onToggle: (enabled: boolean) => void
}) => (
  <>
    <div className="mb-1.5 mt-3">
      <SectionLabel>Modes</SectionLabel>
    </div>
    <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] text-brand-text">
      <Checkbox
        checked={config.pages.some((p) => p.template === 'cruise_control')}
        onCheckedChange={(checked) => {
          onToggle(checked === true)
        }}
      />
      Cruise control page
    </label>
    <div className={NOTE}>Adds a dedicated cruise control page at the end of the dashboard.</div>
  </>
)

export const PageConfigPanel = (props: PageConfigPanelProps) => {
  const cruise = useCruiseToggle(props)
  return (
    <>
      <div className="flex-1 overflow-y-auto p-3">
        <TargetScreenSection config={props.config} setTargetProfile={props.setTargetProfile} />
        <ModesSection config={props.config} onToggle={cruise.toggle} />
        <div className="mt-3 text-[10px] text-brand-neutral-500">
          Select a widget to edit its properties.
        </div>
      </div>
      {cruise.overCapPageIds && (
        <CruiseControlOverCapNotice
          pageIds={cruise.overCapPageIds}
          maxPages={FIRMWARE_CAPS.MAX_PAGES}
          onDismiss={cruise.dismiss}
        />
      )}
    </>
  )
}
