import { useCallback, useMemo, useRef, useState } from 'react'
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
import { sendPlannerCommand } from './embed/plannerBridge'
import { Topbar } from './shell/Topbar'
import { SettingsModal } from './shell/SettingsModal'
import { BillingModal } from './shell/BillingModal'
import { ToastHost, type ToastMsg } from './shell/Toast'
import {
  loadAppSettings,
  saveAppSettings,
  type AppModuleId,
  type SettingValue,
} from './shell/appSettings'
import { loadLanguage, saveLanguage, type Language } from './shell/language'
import { LibraryPanel } from './shell/LibraryPanel'
import { PropertiesPanel } from './shell/PropertiesPanel'
import { TabDeck } from './shell/TabDeck'
import { StatusBar } from './shell/StatusBar'
import { buildCommands } from './shell/buildCommands'
import { LanguageProvider, translate } from './i18n'

const DEFAULT_TAB: Record<ModuleId, string> = {
  overview: 'summary',
  signal: 'flow',
  cameras: 'plan2d',
  licht: 'plan2d',
  board: 'board',
}

export function App() {
  const { theme, preference, setPreference, toggle } = useTheme()
  // Suite-weite Sprache (gilt gemeinsam, an die Planer gebrückt). Weiter unten
  // per LanguageProvider in den Baum gereicht; hier oben via translate() genutzt.
  const [language, setLanguageState] = useState<Language>(loadLanguage)
  const setLanguage = useCallback((lang: Language) => {
    saveLanguage(lang)
    setLanguageState(lang)
  }, [])
  const tt = useCallback((key: string, de: string) => translate(language, key, de), [language])
  // Projekt-Historie: zugewiesenes Projekt (oder null) mit Undo/Redo-Stapeln.
  // Startwert: zuletzt gespeichertes Projekt, sonst das Demo-Projekt.
  const [history, setHistory] = useState<{
    past: (SuiteProject | null)[]
    present: SuiteProject | null
    future: (SuiteProject | null)[]
  }>(() => ({ past: [], present: loadProjectLocal() ?? PROJECT, future: [] }))
  const project = history.present
  const shellCanUndo = history.past.length > 0
  const shellCanRedo = history.future.length > 0
  // Undo/Redo-Zustand des gerade geöffneten Planers (per Bridge gemeldet).
  const [plannerHistory, setPlannerHistory] = useState({ canUndo: false, canRedo: false })

  // Transiente Rückmeldungen (Speichern-Bestätigung, Verwerfen mit Undo).
  const toastId = useRef(0)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const pushToast = useCallback((text: string, opts: Partial<Omit<ToastMsg, 'id' | 'text'>> = {}) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text, ...opts }])
  }, [])
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

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
    pushToast(tt('config.toast.saved', 'Projekt gespeichert'), { tone: 'ok' })
  }, [project, pushToast, tt])
  const saveProjectAs = useCallback(() => {
    if (!project) return
    downloadProject(project)
    const saved = { ...project, meta: { ...project.meta, saved: true } }
    saveProjectLocal(saved)
    setHistory((h) => ({ ...h, present: saved }))
    pushToast(tt('config.toast.exported', 'Projekt exportiert & gespeichert'), { tone: 'ok' })
  }, [project, pushToast, tt])

  // Projektwechsel mit Schutz vor Datenverlust: bei ungespeichertem Stand eine
  // Rückmeldung mit „Rückgängig" (nutzt die Projekt-Historie).
  const switchProject = useCallback(
    (next: SuiteProject | null) => {
      if (project && !project.meta.saved) {
        pushToast(tt('config.toast.discarded', 'Ungespeicherte Änderungen verworfen'), {
          tone: 'warn',
          actionLabel: tt('config.action.undo', 'Rückgängig'),
          onAction: undo,
        })
      }
      commitProject(next)
    },
    [project, pushToast, undo, commitProject, tt],
  )
  const newProject = useCallback(() => switchProject(blankProject()), [switchProject])
  const importProject = useCallback(
    (text: string) => {
      try {
        switchProject(parseProject(text))
      } catch (e) {
        pushToast(
          `${tt('config.toast.loadFailed', 'Projekt konnte nicht geladen werden')}: ${e instanceof Error ? e.message : tt('config.error.unknown', 'Unbekannter Fehler')}`,
          { tone: 'warn' },
        )
      }
    },
    [switchProject, pushToast, tt],
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
  const [billingOpen, setBillingOpen] = useState(false)
  // Zoom der Canvas-Vorschau (Signal/Kameras/Licht) — via Statusleiste steuerbar.
  const [zoom, setZoom] = useState(100)
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
  const RAIL = useMemo<RailModule[]>(
    () =>
      MODULES.map((m) => ({
        id: m.id,
        label: tt(`config.mod.${m.id}.label`, m.label),
        icon: m.icon,
        hotkey: m.hotkey,
        accent: m.accent,
      })),
    [tt],
  )
  const RAIL_FOOTER = useMemo<RailModule[]>(
    () => [{ id: 'library', label: tt('config.rail.library', 'Bibliothek'), icon: 'library' }],
    [tt],
  )
  // Ist gerade ein Planer-iframe offen? Dann zielt Undo/Redo auf ihn, sonst auf
  // die Projekt-Historie der Shell.
  const plannerActive = !!mod.planner && mounted[moduleId]
  const undoRedo = useMemo(
    () => ({
      onUndo: () => (plannerActive ? sendPlannerCommand('undo') : undo()),
      onRedo: () => (plannerActive ? sendPlannerCommand('redo') : redo()),
      canUndo: plannerActive ? plannerHistory.canUndo : shellCanUndo,
      canRedo: plannerActive ? plannerHistory.canRedo : shellCanRedo,
    }),
    [plannerActive, plannerHistory, shellCanUndo, shellCanRedo, undo, redo],
  )

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
    () => buildCommands(mod, { goToModule, setTab, selectItem, toggleTheme: toggle, toggleMount }, tt),
    [mod, goToModule, setTab, selectItem, toggle, toggleMount, tt],
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
        undoRedo.onUndo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        undoRedo.onRedo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveProject, undoRedo])

  return (
   <LanguageProvider language={language}>
    <div data-module={mod.dataModule} className="flex h-full flex-col bg-av-bg text-av-text">
      <Topbar
        project={project}
        theme={theme}
        onToggleTheme={toggle}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenBilling={() => setBillingOpen(true)}
        onAssign={() => switchProject(PROJECT)}
        onClear={() => switchProject(null)}
        onNew={newProject}
        onSave={saveProject}
        onSaveAs={saveProjectAs}
        onImport={importProject}
        onUndo={undoRedo.onUndo}
        onRedo={undoRedo.onRedo}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
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
          <aside className="flex w-64 flex-none flex-col border-r border-av-border-muted" aria-label={tt('config.aria.libraryLayers', 'Bibliothek und Ebenen')}>
            <LibraryPanel key={mod.id} module={mod} project={project} />
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
            onAssign={() => switchProject(PROJECT)}
            zoom={zoom}
            plannerSettings={
              moduleId === 'signal' || moduleId === 'cameras' || moduleId === 'licht'
                ? { ...appSettings[moduleId], language }
                : undefined
            }
            onPlannerHistory={setPlannerHistory}
          />
        </main>

        <aside className="hidden w-80 flex-none border-l border-av-border-muted lg:block" aria-label={tt('config.aria.properties', 'Eigenschaften')}>
          <PropertiesPanel module={mod} project={project} selectedId={selected[moduleId]} onNavigate={goToModule} />
        </aside>
      </div>

      <StatusBar
        module={moduleId}
        project={project}
        zoom={zoom}
        onZoom={(z) => setZoom(Math.max(50, Math.min(200, z)))}
        onNavigate={goToModule}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        context={{ moduleId }}
      />

      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preference={preference}
        onSetPreference={setPreference}
        activeModule={moduleId}
        appSettings={appSettings}
        onChangeAppSetting={changeAppSetting}
        language={language}
        onSetLanguage={setLanguage}
      />

      <BillingModal open={billingOpen} onClose={() => setBillingOpen(false)} project={project} />
    </div>
   </LanguageProvider>
  )
}
