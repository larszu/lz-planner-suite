import { Badge, Icon, IconButton, Kbd, useTheme } from '@avplan/ui'
import type { ProjectMeta } from '../data/project'

const MENUS = ['Datei', 'Bearbeiten', 'Ansicht', 'Einfügen', 'Export', 'Hilfe']

export function Topbar({
  meta,
  onOpenPalette,
}: {
  meta: ProjectMeta
  onOpenPalette: () => void
}) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex h-13 items-center gap-3 border-b border-av-border-muted bg-av-surface-1 px-3" style={{ height: 52 }}>
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

      <div className="mx-2 flex min-w-0 items-center gap-2 text-sm text-av-text-muted">
        <span className="text-av-text-faint">—</span>
        <span className="truncate font-semibold text-av-text-secondary">{meta.name}</span>
        <span className="text-av-text-faint">·</span>
        <span className="truncate">{meta.venue}</span>
        <span className="av-num text-av-text-faint">v{meta.version}</span>
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

        <Badge tone="ok" dot>{meta.saved ? 'Gespeichert' : 'Ungespeichert'}</Badge>

        <IconButton label={theme === 'dark' ? 'Zu hellem Theme wechseln' : 'Zu dunklem Theme wechseln'} onClick={toggle}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </IconButton>
      </div>
    </header>
  )
}
