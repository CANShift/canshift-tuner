import { SCREEN_SETTINGS_BOUNDS } from '@canshift/core'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { STRINGS } from '../../strings'
import { useSoundDraft, type SoundDraft } from '../../hooks/useSettingsDraft'

const D = STRINGS.dash

const ROW = 'flex min-h-14 items-center gap-3 border-b border-app-divider py-2 last:border-b-0'

interface SoundRowProps {
  sound: SoundDraft
}

const VolumeRow = ({ sound }: SoundRowProps) => (
  <div className={ROW}>
    <span className="w-[84px] text-[15px] lg:w-24">{D.volume}</span>
    <Slider
      thumbLabel={D.volume}
      min={SCREEN_SETTINGS_BOUNDS.volumeMinPct}
      max={SCREEN_SETTINGS_BOUNDS.volumeMaxPct}
      value={[sound.value.volume]}
      onValueChange={([volume]) => {
        if (volume !== undefined) sound.set({ volume })
      }}
      className="flex-1"
    />
    <span className="w-11 text-right font-num text-sm text-app-secondary">
      {STRINGS.changes.percent(sound.value.volume)}
    </span>
  </div>
)

interface ToggleRowProps {
  label: string
  hint: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const ToggleRow = ({ label, hint, checked, onChange }: ToggleRowProps) => (
  <div className={ROW}>
    <span className="flex flex-1 flex-col">
      <span className="text-[15px]">{label}</span>
      <span className="text-xs text-app-muted">{hint}</span>
    </span>
    <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
  </div>
)

export const SoundPanel = ({ sound }: SoundRowProps) => (
  <section className="flex flex-col rounded-card border border-app-border bg-app-surface px-3.5 py-1 lg:px-5 lg:py-2">
    <h2 className="pt-2 text-[17px] font-bold">{D.sound}</h2>
    <p className="text-xs text-app-muted">{D.criticalSoundHint}</p>
    <VolumeRow sound={sound} />
    <ToggleRow
      label={D.bootSound}
      hint={D.bootSoundHint}
      checked={sound.value.boot}
      onChange={(boot) => sound.set({ boot })}
    />
    <ToggleRow
      label={D.shiftTone}
      hint={D.shiftToneHint}
      checked={sound.value.shiftTone}
      onChange={(shiftTone) => sound.set({ shiftTone })}
    />
  </section>
)

export const SoundCard = () => {
  const sound = useSoundDraft()
  return sound === null ? null : <SoundPanel sound={sound} />
}
