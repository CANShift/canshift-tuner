const PERCENT = 100

export interface ProgressBarProps {
  percent: number
  label: string
}

export const ProgressBar = ({ percent, label }: ProgressBarProps) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={PERCENT}
    className="h-2.5 overflow-hidden rounded-full bg-app-divider"
  >
    <div
      className="h-full rounded-full bg-app-text transition-[width]"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: `${String(percent)}%` }}
    />
  </div>
)
