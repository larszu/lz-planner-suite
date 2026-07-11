import { useEffect, useRef, useState } from 'react'
import { Badge, Icon, IconButton, Kbd, useTheme } from '@avplan/ui'
import type { SuiteProject } from '../data/project'

const MENUS = ['Datei', 'Bearbeiten', 'Ansicht', 'Einfügen', 'Export', 'Hilfe']

function ProjectPicker({
  project,
  onAssign,
  onClear,
}: {
  project: SuiteProject | null
  onAssign: () => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDoc)
    return () => window.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="av-focus flex items-center gap-2 rounded-av-control px-2 py-1 text-sm text-av-text-muted hover:bg-av-surface-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-av-text-faint">—</span>
        {project ? (
          <>
            <span className="truncate font-semibold text-av-text-secondary">{project.meta.name}</span>
            <span className="text-av-text-faint">·</span>
            <span className="truncate">{project.meta.venue}</span>
            <span className="av-num text-av-text-faint">v{project.meta.version}</span>
          </>
        ) : (
          <span className="font-medium text-av-text-secondary">Kein Projekt · Module einzeln nutzbar</span>
        )}
        <Icon name="chevron-down" size={14} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-av-card border border-av-border bg-av-surface-1 p-1.5 shadow-[var(--av-shadow-pop)]"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={project !== null}
            onClick={() => { onAssign(); setOpen(false) }}
            className="av-focus flex w-full items-center gap-2.5 rounded-av-control px-2.5 py-2 text-left hover:bg-av-surface-2"
          >
            <Icon name="modules" size={16} style={{ color: 'var(--av-accent)' }} />
            <span className="flex-1">
              <span className="block text-[13px] font-medium text-av-text">Sommershow 2026</span>
              <span className="block text-[11px] text-av-text-muted">Halle A · Sa 18. Juli 2026</span>
            </span>
            {project !== null && <Icon name="check" size={15} style={{ color: 'var(--av-accent)' }} />}
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={project === null}
            onClick={() => { onClear(); setOpen(false) }}
            className="av-focus flex w-full items-center gap-2.5 rounded-av-control px-2.5 py-2 text-left hover:bg-av-surface-2"
          >
            <Icon name="close" size={16} style={{ color: 'var(--av-text-muted)' }} />
            <span className="flex-1">
              <span className="block text-[13px] font-medium text-av-text">Kein Projekt</span>
              <span className="block text-[11px] text-av-text-muted">Module einzeln und eigenständig nutzen</span>
            </span>
            {project === null && <Icon name="check" size={15} style={{ color: 'var(--av-accent)' }} />}
          </button>
        </div>
      )}
    </div>
  )
}

export function Topbar({
  project,
  onOpenPalette,
  onAssign,
  onClear,
}: {
  project: SuiteProject | null
  onOpenPalette: () => void
  onAssign: () => void
  onClear: () => void
}) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex items-center gap-3 border-b border-av-border-muted bg-av-surface-1 px-3" style={{ height: 52 }}>
      <div className="flex items-center gap-2 pr-1">
        <span
          className="grid h-6 w-6 place-items-center rounded-md"
          style={{ background: 'linear-gradient(135deg, var(--mod-cameras), var(--mod-signal) 55%, var(--mod-licht))' }}
        />
        <span className="text-[15px] font-bold tracking-tight text-av-text">AV Planner Suite</span>
      </div>

      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Menü">
        {MENUS.map((m) => (
          <button key={m} type="button" className="av-btn av-focus" data-variant="ghost" data-size="sm">
            {m}
          </button>
        ))}
      </nav>

      <div className="mx-1 min-w-0">
        <ProjectPicker project={project} onAssign={onAssign} onClear={onClear} />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenPalette}
          className="av-search-trigger av-focus flex h-8 items-center gap-2 rounded-av-control border border-av-border bg-av-surface-3 px-3 text-sm text-av-text-muted transition-colors hover:border-av-accent"
          style={{ minWidth: 220 }}
          aria-label="Suchen und Befehle öffnen"
        >
          <Icon name="search" size={15} />
          <span className="flex-1 text-left">Suchen &amp; Befehle</span>
          <span className="flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <div className="mx-1 flex items-center gap-0.5">
          <IconButton label="Rückgängig"><Icon name="undo" size={17} /></IconButton>
          <IconButton label="Wiederholen"><Icon name="redo" size={17} /></IconButton>
        </div>

        {project && <Badge tone="ok" dot>{project.meta.saved ? 'Gespeichert' : 'Ungespeichert'}</Badge>}

        <IconButton label={theme === 'dark' ? 'Zu hellem Theme wechseln' : 'Zu dunklem Theme wechseln'} onClick={toggle}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </IconButton>
      </div>
    </header>
  )
}
