import { useRef, useState } from 'react'
import {
  Badge,
  Icon,
  IconButton,
  Kbd,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Modal,
  type ResolvedTheme,
} from '@avplan/ui'
import type { SuiteProject } from '../data/project'

function ProjectPicker({
  project,
  onAssign,
  onClear,
}: {
  project: SuiteProject | null
  onAssign: () => void
  onClear: () => void
}) {
  return (
    <Menu
      align="left"
      triggerClassName="av-focus flex items-center gap-2 rounded-av-control px-2 py-1 text-sm text-av-text-muted hover:bg-av-surface-2"
      ariaLabel="Projekt wählen"
      button={
        <>
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
        </>
      }
    >
      {(close) => (
        <>
          <MenuLabel>Projekt</MenuLabel>
          <MenuItem
            icon={<Icon name="modules" size={16} style={{ color: 'var(--av-accent)' }} />}
            active={project !== null}
            hint={project !== null ? <Icon name="check" size={14} /> : undefined}
            onClick={() => { onAssign(); close() }}
          >
            Sommershow 2026
          </MenuItem>
          <MenuItem
            icon={<Icon name="close" size={16} />}
            active={project === null}
            hint={project === null ? <Icon name="check" size={14} /> : undefined}
            onClick={() => { onClear(); close() }}
          >
            Kein Projekt
          </MenuItem>
        </>
      )}
    </Menu>
  )
}

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows: { keys: string[]; label: string }[] = [
    { keys: ['⌘', 'K'], label: 'Suchen & Befehle (Command-Palette)' },
    { keys: ['⌘', 'S'], label: 'Projekt speichern' },
    { keys: ['⌘', 'Z'], label: 'Rückgängig' },
    { keys: ['⌘', '⇧', 'Z'], label: 'Wiederholen' },
    { keys: ['1'], label: 'Übersicht' },
    { keys: ['2'], label: 'Signal-Flow' },
    { keys: ['3'], label: 'Kamera-Plan' },
    { keys: ['4'], label: 'Licht-Plan' },
    { keys: ['5'], label: 'Kreativ-Board' },
    { keys: ['Esc'], label: 'Dialog / Auswahl schließen' },
  ]
  return (
    <Modal open={open} onClose={onClose} title="Tastenkürzel" size="sm">
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-[13px] text-av-text-secondary">{r.label}</span>
            <span className="flex items-center gap-1">{r.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export function Topbar({
  project,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenPalette,
  onAssign,
  onClear,
  onNew,
  onSave,
  onSaveAs,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  project: SuiteProject | null
  theme: ResolvedTheme
  onToggleTheme: () => void
  onOpenSettings: () => void
  onOpenPalette: () => void
  onAssign: () => void
  onClear: () => void
  onNew: () => void
  onSave: () => void
  onSaveAs: () => void
  onImport: (text: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = () => fileInputRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Input zurücksetzen, damit dieselbe Datei erneut wählbar bleibt.
    e.target.value = ''
    if (!file) return
    file
      .text()
      .then(onImport)
      .catch(() => window.alert('Datei konnte nicht gelesen werden.'))
  }

  const ghost = 'av-btn'

  return (
    <header className="flex items-center gap-3 border-b border-av-border-muted bg-av-surface-1 px-3" style={{ height: 52 }}>
      <div className="flex items-center gap-2 pr-1">
        <span
          className="grid h-6 w-6 place-items-center rounded-md"
          style={{ background: 'linear-gradient(135deg, var(--mod-cameras), var(--mod-signal) 55%, var(--mod-licht))' }}
        />
        <span className="text-[15px] font-bold tracking-tight text-av-text">AV Planner Suite</span>
      </div>

      {/* Funktionale Menüleiste (geteiltes Menu) */}
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Menü">
        <Menu button="Datei" triggerClassName={ghost} align="left">
          {(close) => (
            <>
              <MenuItem icon={<Icon name="plus" size={15} />} onClick={() => { onNew(); close() }}>Neues Projekt</MenuItem>
              <MenuItem icon={<Icon name="external" size={15} />} onClick={() => { close(); openFileDialog() }}>Projekt öffnen…</MenuItem>
              <MenuSeparator />
              <MenuItem
                icon={<Icon name="check" size={15} />}
                hint={<span><Kbd>⌘</Kbd><Kbd>S</Kbd></span>}
                disabled={!project}
                onClick={() => { onSave(); close() }}
              >
                Speichern
              </MenuItem>
              <MenuItem
                icon={<Icon name="library" size={15} />}
                disabled={!project}
                onClick={() => { onSaveAs(); close() }}
              >
                Speichern unter…
              </MenuItem>
              <MenuSeparator />
              <MenuLabel>Demo-Projekt</MenuLabel>
              <MenuItem icon={<Icon name="modules" size={15} />} onClick={() => { onAssign(); close() }}>Sommershow 2026 laden</MenuItem>
              <MenuItem icon={<Icon name="close" size={15} />} onClick={() => { onClear(); close() }}>Kein Projekt (Module einzeln)</MenuItem>
            </>
          )}
        </Menu>
        <Menu button="Ansicht" triggerClassName={ghost} align="left">
          {(close) => (
            <>
              <MenuItem
                icon={<Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />}
                onClick={() => { onToggleTheme(); close() }}
              >
                {theme === 'dark' ? 'Helles Theme' : 'Dunkles Theme'}
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                icon={<Icon name="settings" size={15} />}
                onClick={() => { close(); onOpenSettings() }}
              >
                Einstellungen…
              </MenuItem>
            </>
          )}
        </Menu>
        <Menu button="Hilfe" triggerClassName={ghost} align="left">
          {(close) => (
            <>
              <MenuItem icon={<Icon name="search" size={15} />} hint={<span><Kbd>⌘</Kbd><Kbd>K</Kbd></span>} onClick={() => { close(); onOpenPalette() }}>Suchen & Befehle</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Icon name="command" size={15} />} onClick={() => { close(); setShortcutsOpen(true) }}>Tastenkürzel…</MenuItem>
            </>
          )}
        </Menu>
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
          <IconButton label="Rückgängig" onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }}>
            <Icon name="undo" size={17} />
          </IconButton>
          <IconButton label="Wiederholen" onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }}>
            <Icon name="redo" size={17} />
          </IconButton>
        </div>

        {project && <Badge tone="ok" dot>{project.meta.saved ? 'Gespeichert' : 'Ungespeichert'}</Badge>}

        <IconButton label={theme === 'dark' ? 'Zu hellem Theme wechseln' : 'Zu dunklem Theme wechseln'} onClick={onToggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </IconButton>

        <IconButton label="Einstellungen" onClick={onOpenSettings}>
          <Icon name="settings" size={17} />
        </IconButton>
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.avsuite.json,application/json"
        className="hidden"
        onChange={handleFile}
      />
    </header>
  )
}
