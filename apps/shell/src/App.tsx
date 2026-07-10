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
import { PROJECT } from './data/project'
import { Topbar } from './shell/Topbar'
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
}

export function App() {
  const { theme, toggle } = useTheme()
  const [moduleId, setModuleId] = useState<ModuleId>('overview')
  const [tabs, setTabs] = useState<Record<ModuleId, string>>(DEFAULT_TAB)
  const [selected, setSelected] = useState<Record<ModuleId, string | null>>({
    overview: null,
    signal: 'v012',
    cameras: 'cam2',
    licht: 'lx3',
  })
  const [mounted, setMounted] = useState<Record<ModuleId, boolean>>({
    overview: false,
    signal: false,
    cameras: false,
    licht: false,
  })
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)

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
      <Topbar meta={PROJECT.meta} onOpenPalette={() => setPaletteOpen(true)} />

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
            <LibraryPanel module={mod} />
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
            selectedId={selected[moduleId]}
            onSelect={selectItem}
            onNavigate={goToModule}
          />
        </main>

        <aside className="hidden w-80 flex-none border-l border-av-border-muted lg:block" aria-label="Eigenschaften">
          <PropertiesPanel module={mod} selectedId={selected[moduleId]} onNavigate={goToModule} />
        </aside>
      </div>

      <StatusBar module={moduleId} zoom={mod.id === 'signal' ? 74 : 82} />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        context={{ moduleId }}
      />
    </div>
  )
}
