import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { UiIcon } from '../icons/UiIcons'
import { SECTIONS } from './sections'

const TAB = 'flex flex-col items-center justify-center gap-1 text-xs no-underline'

export const TabBar = () => (
  <nav
    aria-label="Sections"
    className="grid h-[calc(64px+max(env(safe-area-inset-bottom),20px))] shrink-0 grid-cols-3 border-t border-app-border bg-app-surface pb-[max(env(safe-area-inset-bottom),20px)] lg:hidden"
  >
    {SECTIONS.map((section) => (
      <NavLink
        key={section.id}
        to={section.path}
        className={({ isActive }) =>
          cn(TAB, isActive ? 'font-semibold text-app-text' : 'text-app-muted')
        }
      >
        {({ isActive }) => (
          <>
            <UiIcon name={section.icon} className={cn('size-6', isActive && 'text-app-accent')} />
            {section.label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
)
