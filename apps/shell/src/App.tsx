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
import {
  blankProject,
  downloadProject,
  loadProjectLocal,
  parseProject,
  saveProjectLocal,
} from './data/projectFile'
import { Topbar } from './shell/Topbar'
import { SettingsModal } from './shell/SettingsModal'
import {
  loadAppSettings,
  saveAppSettings,
  type AppModuleId,
  type SettingValue,
} from './shell/appSettings'
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
  // Projekt-Historie: zugewiesenes Projekt (oder null) mit Undo/Redo-Stapeln.
  // Startwert: zuletzt gespeichertes Projekt, sonst das Demo-Projekt.
  const [history, setHistory] = useState<{
    past: (SuiteProject | null)[]
    present: SuiteProject | null
    future: (SuiteProject | null)[]
  }>(() => ({ past: [], present: loadProjectLocal() ?? PROJECT, future: [] }))
  const project = history.present
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Projektwechsel mit Historie (assign/clear/neu/öffnen).
  const commitProject = useCallback((next: SuiteProject | null) => {
    setHistory((h) => ({ past: [...h.past, h.present], present: next, future: [] }))
  }, [])
  const undo = useCallback(() => {
    setHistory((h) =>
      h.past.length
        ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
        : h,
    )
  }, [])
  const redo = useCallback(() => {
    setHistory((h) =>
      h.future.length
        ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
        : h,
    )
  }, [])

  // Datei-Operationen (Topbar „Datei"-Menü).
  const saveProject = useCallback(() => {
    if (!project) return
    const saved = { ...project, meta: { ...project.meta, saved: true } }
    saveProjectLocal(saved)
    setHistory((h) => ({ ...h, present: saved }))
  }, [project])
  const saveProjectAs = useCallback(() => {
    if (!project) return
    downloadProject(project)
    const saved = { ...project, meta: { ...project.meta, saved: true } }
    saveProjectLocal(saved)
    setHistory((h) => ({ ...h, present: saved }))
  }, [project])
  const newProject = useCallback(() => commitProject(blankProject()), [commitProject])
  const importProject = useCallback(
    (text: string) => {
      try {
        commitProject(parseProject(text))
      } catch (e) {
        window.alert(`Projekt konnte nicht geladen werden: ${e instanceof Error ? e.message : 'Unbekannter Fehler'}`)
      }
    },
    [commitProject],
  )

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
  // Suite-weite App-Einstellungen (Quelle der Wahrheit) — persistiert und in den
  // jeweils geöffneten Planer per Bridge geschoben.
  const [appSettings, setAppSettings] = useState(loadAppSettings)

  const changeAppSetting = useCallback((app: AppModuleId, key: string, value: SettingValue) => {
    setAppSettings((prev) => {
      const next = { ...prev, [app]: { ...prev[app], [key]: value } }
      saveAppSettings(next)
      return next
    })
  }, [])

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

  // Globale Tastenkürzel: Speichern (⌘/Ctrl+S), Rückgängig/Wiederholen (⌘/Ctrl+Z / ⇧Z / Y).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault()
        saveProject()
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveProject, undo, redo])

  return (
    <div data-module={mod.dataModule} className="flex h-full flex-col bg-av-bg text-av-text">
      <Topbar
        project={project}
        theme={theme}
        onToggleTheme={toggle}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
        onAssign={() => commitProject(PROJECT)}
        onClear={() => commitProject(null)}
        onNew={newProject}
        onSave={saveProject}
        onSaveAs={saveProjectAs}
        onImport={importProject}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
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
            onAssign={() => commitProject(PROJECT)}
            plannerSettings={
              moduleId === 'signal' || moduleId === 'cameras' || moduleId === 'licht'
                ? appSettings[moduleId]
                : undefined
            }
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
        appSettings={appSettings}
        onChangeAppSetting={changeAppSetting}
      />
    </div>
  )
}
