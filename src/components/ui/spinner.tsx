export interface SpinnerProps {
  size?: number
}

export const Spinner = ({ size = 12 }: SpinnerProps) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: '2px solid hsl(var(--brand-ground))',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'canshift-tuner-spin 700ms linear infinite',
      marginRight: Math.round(size * 0.65),
      verticalAlign: `-${String(Math.round(size / 6))}px`,
    }}
  />
)
