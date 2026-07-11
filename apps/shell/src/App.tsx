import { useCallback, useMemo, useState } from 'react'
import {
  CommandPalette,
  ModuleRail,
  onShellMessage,
  useCommandPaletteHotkey,
  useTheme,
  type RailModule,
} from '@avplan/ui'
import { useEffect } from 'react'
import { MODULES, MODULE_BY_ID, type ModuleId } from './modules/registry'
import { PROJECT, type SuiteProject } from './data/project'
import { Topbar } from './shell/Topbar'
import { SettingsModal } from './shell/SettingsModal'
import { LibraryPanel } from './shell/LibraryPanel'
import { PropertiesPanel } from './shell/PropertiesPanel'
import { TabDeck } from './shell/TabDeck'
import { StatusBar } from './shell/StatusBar'
import { buildCommands } from './shell/buildCommands'

const RAIL: RailModule[] = MODULES.map((m) => ({
  id: m.id,
  label: m.label,
  icon: m.icon,
  hotkey: m.hotkey,
  accent: m.accent,
}))

const RAIL_FOOTER: RailModule[] = [{ id: 'library', label: 'Bibliothek', icon: 'library' }]

const DEFAULT_TAB: Record<ModuleId, string> = {
  overview: 'summary',
  signal: 'flow',
  cameras: 'plan2d',
  licht: 'plan2d',
  board: 'board',
}

export function App() {
  const { theme, preference, setPreference, toggle } = useTheme()
  // Zugewiesenes Projekt oder null — ohne Projekt bleiben alle Module einzeln nutzbar.
  const [project, setProject] = useState<SuiteProject | null>(PROJECT)
  const [moduleId, setModuleId] = useState<ModuleId>('overview')
  const [tabs, setTabs] = useState<Record<ModuleId, string>>(DEFAULT_TAB)
  const [selected, setSelected] = useState<Record<ModuleId, string | null>>({
    overview: null,
    signal: 'v012',
    cameras: 'cam2',
    licht: 'lx3',
    board: null,
  })
  const [mounted, setMounted] = useState<Record<ModuleId, boolean>>({
    overview: false,
    signal: false,
    cameras: false,
    licht: false,
    board: false,
  })
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const mod = MODULE_BY_ID[moduleId]

  useCommandPaletteHotkey(setPaletteOpen)

  // Cross-Links aus eingebetteten Planern ("Im Signal-Flow zeigen") annehmen.
  useEffect(() => {
    return onShellMessage((msg) => {
      if (msg.type === 'avplan:navigate' && msg.module in MODULE_BY_ID) {
        setModuleId(msg.module as ModuleId)
      }
    })
  }, [])

  const setTab = useCallback(
    (id: string) => setTabs((t) => ({ ...t, [moduleId]: id })),
    [moduleId],
  )
  const selectItem = useCallback(
    (id: string) => setSelected((s) => ({ ...s, [moduleId]: id })),
    [moduleId],
  )
  const toggleMount = useCallback(
    () => setMounted((m) => ({ ...m, [moduleId]: !m[moduleId] })),
    [moduleId],
  )
  const goToModule = useCallback((id: ModuleId) => setModuleId(id), [])

  const commands = useMemo(
    () => buildCommands(mod, { goToModule, setTab, selectItem, toggleTheme: toggle, toggleMount }),
    [mod, goToModule, setTab, selectItem, toggle, toggleMount],
  )

  return (
    <div data-module={mod.dataModule} className="flex h-full flex-col bg-av-bg text-av-text">
      <Topbar
        project={project}
        theme={theme}
        onToggleTheme={toggle}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
        onAssign={() => setProject(PROJECT)}
        onClear={() => setProject(null)}
      />

      <div className="flex min-h-0 flex-1">
        <ModuleRail
          modules={RAIL}
          active={moduleId}
          onSelect={(id) => setModuleId(id as ModuleId)}
          footer={RAIL_FOOTER}
          activeFooter={libraryOpen ? 'library' : undefined}
          onSelectFooter={() => setLibraryOpen((o) => !o)}
        />

        {libraryOpen && (
          <aside className="flex w-64 flex-none flex-col border-r border-av-border-muted" aria-label="Bibliothek und Ebenen">
            <LibraryPanel module={mod} project={project} />
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <TabDeck
            module={mod}
            activeTab={tabs[moduleId]}
            onTab={setTab}
            mounted={mounted[moduleId]}
            onToggleMount={toggleMount}
            theme={theme}
            project={project}
            selectedId={selected[moduleId]}
            onSelect={selectItem}
            onNavigate={goToModule}
            onAssign={() => setProject(PROJECT)}
          />
        </main>

        <aside className="hidden w-80 flex-none border-l border-av-border-muted lg:block" aria-label="Eigenschaften">
          <PropertiesPanel module={mod} project={project} selectedId={selected[moduleId]} onNavigate={goToModule} />
        </aside>
      </div>

      <StatusBar module={moduleId} project={project} zoom={mod.id === 'signal' ? 74 : 82} />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        context={{ moduleId }}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preference={preference}
        onSetPreference={setPreference}
        activeModule={moduleId}
      />
    </div>
  )
}
