import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BenchTheme } from '../../lib/bench-entry'

export interface ConfigThumbnailProps {
  theme: BenchTheme
  kicker: string
  pageCount: number
}

const frame = cva('flex h-[70px] w-[100px] shrink-0 flex-col justify-between px-1.5 py-1', {
  variants: {
    theme: {
      night: 'bg-[#121212] text-white',
      day: 'bg-[#DDDDDD] text-black',
    },
  },
  defaultVariants: { theme: 'night' },
})

const rule = cva('block w-full', {
  variants: {
    theme: { night: 'bg-white', day: 'bg-black' },
    weight: { top: 'h-0.5', bottom: 'h-px opacity-40' },
  },
  defaultVariants: { theme: 'night', weight: 'top' },
})

const META = 'font-mono text-[8px] whitespace-nowrap uppercase tracking-[0.08em] opacity-60'

const VALUE = [
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'font-mono text-[17px] leading-none',
].join(' ')

export const ConfigThumbnail = ({ theme, kicker, pageCount }: ConfigThumbnailProps) => (
  <div className={cn(frame({ theme }))} aria-hidden="true">
    <span className={cn(rule({ theme, weight: 'top' }))} />
    <span className={VALUE}>{kicker}</span>
    <span className="flex flex-col gap-0.5">
      <span className={cn(rule({ theme, weight: 'bottom' }))} />
      <span className={META}>
        {pageCount} {pageCount === 1 ? 'page' : 'pages'} · {theme}
      </span>
    </span>
  </div>
)
