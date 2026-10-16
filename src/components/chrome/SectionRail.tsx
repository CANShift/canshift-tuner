import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSectionsWithChanges } from '../../hooks/useSectionsWithChanges'
import { UiIcon } from '../icons/UiIcons'
import { SECTIONS } from './sections'
import { StatusDot } from './StatusDot'

const ITEM = 'flex h-12 items-center gap-3 rounded-control px-3.5 text-[15px] no-underline'

export const SectionRail = () => {
  const unsent = useSectionsWithChanges()
  return (
    <nav
      aria-label="Sections"
      className="hidden w-[200px] shrink-0 flex-col gap-1 border-r border-app-border p-4 lg:flex"
    >
      {SECTIONS.map((section) => (
        <NavLink
          key={section.id}
          to={section.path}
          className={({ isActive }) =>
            cn(
              ITEM,
              isActive ? 'bg-app-surface-2 font-semibold text-app-text' : 'text-app-secondary'
            )
          }
        >
          <UiIcon name={section.icon} className="text-app-accent" />
          {section.label}
          {unsent.has(section.id) && <StatusDot tone="warning" className="ml-auto" />}
        </NavLink>
      ))}
    </nav>
  )
}
