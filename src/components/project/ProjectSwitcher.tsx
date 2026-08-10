import { useRef, useState, type ChangeEvent } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NewProjectWizard } from './NewProjectWizard'
import { DEFAULT_PROJECT_NAME, useProjectStore } from '../../stores/project/project.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useLogStore } from '../../stores/log.store'
import {
  PROJECT_FILE_ACCEPT,
  downloadProjectFile,
  readProjectFileText,
} from '../../lib/project-file'

const RECENT_LIMIT = 8

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const ProjectSwitcher = () => {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const switchProject = useProjectStore((s) => s.switchProject)
  const duplicateProject = useProjectStore((s) => s.duplicateProject)
  const importProject = useProjectStore((s) => s.importProject)
  const exportProject = useProjectStore((s) => s.exportProject)
  const dashboardName = useDashboardStore((s) => s.config?.name ?? null)
  const log = useLogStore((s) => s.push)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const activeMeta = projects.find((p) => p.id === activeProjectId) ?? null
  const activeName = activeMeta?.name ?? dashboardName ?? DEFAULT_PROJECT_NAME
  const recent = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, RECENT_LIMIT)

  const handleSwitch = (id: string) => {
    if (id === activeProjectId) return
    if (!switchProject(id)) log('error', 'Could not open that project.')
  }

  const handleDuplicate = () => {
    if (activeProjectId === null) return
    const newId = duplicateProject(activeProjectId)
    if (newId === null) log('error', 'Could not duplicate the project.')
    else log('success', `Duplicated “${activeName}”.`)
  }

  const handleExport = () => {
    if (activeProjectId === null) return
    const json = exportProject(activeProjectId)
    if (json === null) {
      log('error', 'Could not export the project.')
      return
    }
    downloadProjectFile(activeName, json)
    log('info', `Exported “${activeName}”.`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    let raw: string
    try {
      raw = await readProjectFileText(file)
    } catch (err) {
      console.warn('[project] import read failed', err)
      log('error', 'Could not read the selected file.')
      return
    }
    const result = importProject(raw)
    if (result.ok) log('success', `Imported “${result.name}”.`)
    else log('error', result.error)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Switch project"
            className="flex max-w-[280px] items-center gap-1.5 text-[15px] font-extrabold text-text transition-colors hover:text-brand-accent focus-visible:text-brand-accent"
          >
            <span className="truncate">{activeName}</span>
            <ChevronIcon />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Recent projects</DropdownMenuLabel>
          <DropdownMenuGroup>
            {recent.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={() => {
                  handleSwitch(project.id)
                }}
              >
                <span className="w-3 text-brand-accent">
                  {project.id === activeProjectId ? '●' : ''}
                </span>
                <span className="truncate">{project.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setWizardOpen(true)
            }}
          >
            New project…
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={activeProjectId === null}
            onSelect={() => {
              handleDuplicate()
            }}
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              handleImportClick()
            }}
          >
            Import .canshift…
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={activeProjectId === null}
            onSelect={() => {
              handleExport()
            }}
          >
            Export .canshift
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_FILE_ACCEPT}
        onChange={(event) => {
          void handleFileChange(event)
        }}
        style={{ display: 'none' }}
      />
      <NewProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  )
}
