import type { ConnectivityProfile } from '@canshift/core'
import { BoolField, Section } from '@/components/ui/form-field'

export interface ConnectivitySectionProps {
  conn: ConnectivityProfile
  onPatch: (partial: Partial<ConnectivityProfile>) => void
}

export const ConnectivitySection = ({ conn, onPatch }: ConnectivitySectionProps) => (
  <Section title="Connectivity">
    <BoolField
      label="Wi-Fi supported"
      value={conn.wifiSupported}
      onChange={(v) => {
        onPatch({ wifiSupported: v })
      }}
    />
    <BoolField
      label="BLE supported"
      value={conn.bleSupported}
      onChange={(v) => {
        onPatch({ bleSupported: v })
      }}
    />
    <BoolField
      label="PSRAM present"
      value={conn.psramPresent}
      onChange={(v) => {
        onPatch({ psramPresent: v })
      }}
    />
  </Section>
)
