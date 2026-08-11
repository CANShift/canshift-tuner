interface IconProps {
  size?: number
  color?: string
  style?: React.CSSProperties
}

type IconComponent = (props: IconProps) => React.JSX.Element

const icon = (path: string, viewBox = '0 0 16 16'): IconComponent => {
  return function Icon({ size = 14, color = 'currentColor', style }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        style={{ flexShrink: 0, ...style }}
        aria-hidden
      >
        <path
          d={path}
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
}

export const IconTrash = icon('M3 5h10M5 5V3h6v2M6 8v4M10 8v4M4 5l1 9h6l1-9')
