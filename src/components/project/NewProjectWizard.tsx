import { useState } from 'react'
import {
  DEFAULT_PROFILE_ID,
  DEFAULT_SCREEN_PROFILE_ID,
  ECU_PROFILES,
  PROJECT_NAME_MAX,
  SCREEN_PROFILES,
  type ScreenProfileId,
} from '@canshift/core'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProjectStore } from '../../stores/project/project.store'
import { useLogStore } from '../../stores/log.store'
import { BLANK_PAGE_SET, PAGE_SET_OPTIONS, buildNewProjectDashboard } from '../../lib/new-project'

const STEP_TITLES = ['Target panel', 'ECU profile', 'Starting point'] as const
const DEFAULT_NEW_NAME = 'New project'

export interface NewProjectWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface OptionCardProps {
  group: string
  value: string
  checked: boolean
  onSelect: (value: string) => void
  title: string
  subtitle?: string
}

const OptionCard = ({ group, value, checked, onSelect, title, subtitle }: OptionCardProps) => (
  <label className="relative block cursor-pointer">
    <input
      type="radio"
      name={group}
      value={value}
      checked={checked}
      onChange={() => {
        onSelect(value)
      }}
      className="peer sr-only"
    />
    <span className="block border border-border bg-surface px-3 py-2.5 transition-colors hover:border-brand-accent peer-checked:border-brand-accent peer-checked:bg-brand-accent/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent">
      <span className="block text-sm font-semibold text-text">{title}</span>
      {subtitle !== undefined && (
        <span className="mt-0.5 block text-xs text-text-muted">{subtitle}</span>
      )}
    </span>
  </label>
)

export const NewProjectWizard = ({ open, onOpenChange }: NewProjectWizardProps) => {
  const createProject = useProjectStore((s) => s.createProject)
  const log = useLogStore((s) => s.push)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [targetProfileId, setTargetProfileId] = useState<ScreenProfileId>(DEFAULT_SCREEN_PROFILE_ID)
  const [ecuProfileId, setEcuProfileId] = useState<string>(DEFAULT_PROFILE_ID)
  const [pageSetId, setPageSetId] = useState<string>(BLANK_PAGE_SET)

  const reset = () => {
    setStep(0)
    setName('')
    setTargetProfileId(DEFAULT_SCREEN_PROFILE_ID)
    setEcuProfileId(DEFAULT_PROFILE_ID)
    setPageSetId(BLANK_PAGE_SET)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const finalName = name.trim().slice(0, PROJECT_NAME_MAX) || DEFAULT_NEW_NAME
  const isLastStep = step === STEP_TITLES.length - 1

  const handleCreate = () => {
    const profile = ECU_PROFILES.find((p) => p.id === ecuProfileId)
    const dashboard = buildNewProjectDashboard({
      name: finalName,
      targetProfile: targetProfileId,
      pageSetId,
    })
    createProject(
      finalName,
      dashboard,
      profile ? { key: `builtin:${profile.id}`, signals: profile.signals } : undefined
    )
    log('success', `Created “${finalName}”.`)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Step {String(step + 1)} of {String(STEP_TITLES.length)} — {STEP_TITLES[step]}
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="new-project-name">Project name</Label>
              <Input
                id="new-project-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                placeholder={DEFAULT_NEW_NAME}
                maxLength={PROJECT_NAME_MAX}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              {SCREEN_PROFILES.map((profile) => (
                <OptionCard
                  key={profile.id}
                  group="target-panel"
                  value={profile.id}
                  checked={targetProfileId === profile.id}
                  onSelect={(value) => {
                    setTargetProfileId(value as ScreenProfileId)
                  }}
                  title={profile.name}
                  subtitle={`${String(profile.width)} × ${String(profile.height)}`}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-2">
            {ECU_PROFILES.map((profile) => (
              <OptionCard
                key={profile.id}
                group="ecu-profile"
                value={profile.id}
                checked={ecuProfileId === profile.id}
                onSelect={setEcuProfileId}
                title={profile.name}
                subtitle={profile.description}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2">
            <OptionCard
              group="page-set"
              value={BLANK_PAGE_SET}
              checked={pageSetId === BLANK_PAGE_SET}
              onSelect={setPageSetId}
              title="Blank"
              subtitle="Start from an empty page"
            />
            {PAGE_SET_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                group="page-set"
                value={option.id}
                checked={pageSetId === option.id}
                onSelect={setPageSetId}
                title={option.label}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false)
            }}
          >
            Cancel
          </Button>
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setStep(step - 1)
              }}
            >
              Back
            </Button>
          )}
          {isLastStep ? (
            <Button onClick={handleCreate}>Create project</Button>
          ) : (
            <Button
              onClick={() => {
                setStep(step + 1)
              }}
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
