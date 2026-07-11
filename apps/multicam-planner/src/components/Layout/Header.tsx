import { useStore, APP_VERSION } from '../../store/useStore';
import { FiCamera, FiLayout, FiBox, FiMonitor, FiSliders, FiSave, FiUpload, FiDownload, FiChevronDown, FiX, FiCheck, FiMapPin } from 'react-icons/fi';
import { toVenueExchange, parseVenueExchange } from '../../utils/venueExchange';
import { toCameraList } from '../../utils/cameraExport';
import { getCameraById } from '../../data/cameras';
import { makeAvPlan, parseAvPlan } from '../../utils/avplan';
import type { ProjectFile } from '../../types';
import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import type { ExportMode } from '../Export/ExportPanel';
import type { EditMode } from '../../types';
import { useTranslation, format } from '../../i18n';

type TFn = (key: string, en: string) => string;

const getTabs = (t: TFn): { id: string; label: string; icon: React.ReactNode }[] => [
  { id: 'tab-2d', label: t('header.tab.2dPlan', '2D Plan'), icon: <FiLayout size={16} /> },
  { id: 'tab-3d', label: t('header.tab.3dView', '3D View'), icon: <FiBox size={16} /> },
  { id: 'tab-preview', label: t('header.tab.preview', 'Preview'), icon: <FiMonitor size={16} /> },
  { id: 'tab-calc', label: t('header.tab.calculator', 'Calculator'), icon: <FiSliders size={16} /> },
];

// Edit-mode slider options (issue #43). Each mode locks everything except its
// own category in the 2D plan; "All" honours each object's manual lock flag.
const getEditModes = (t: TFn): { id: EditMode; label: string; title: string }[] => [
  { id: 'all', label: t('header.editMode.all', 'All'), title: t('header.editMode.all.title', 'Edit everything (respects per-object locks)') },
  { id: 'floorplan', label: t('header.editMode.floorplan', 'Floor Plan'), title: t('header.editMode.floorplan.title', 'Edit only the floor plan & walls') },
  { id: 'stage', label: t('header.editMode.stage', 'Stage'), title: t('header.editMode.stage.title', 'Edit only stages') },
  { id: 'objects', label: t('header.editMode.objects', 'Objects'), title: t('header.editMode.objects.title', 'Edit only objects & persons') },
  { id: 'cameras', label: t('header.editMode.cameras', 'Cameras'), title: t('header.editMode.cameras.title', 'Edit only cameras') },
];

type HeaderProps = {
  onSelectTab: (tabId: string) => void;
  onSetLayoutMode: (mode: 'focus' | 'grid') => void;
  onApplyPreset: (presetId: string) => void;
  onSaveLayoutPreset: (name: string) => void;
  onDeleteLayoutPreset: (presetId: string) => void;
  onDragNewPanel: (tabId: string, event: DragEvent) => void;
  layoutPresetOptions: { id: string; label: string }[];
  layoutMode: 'focus' | 'grid' | 'custom';
};

export default function Header({
  onSelectTab,
  onSetLayoutMode,
  onApplyPreset,
  onSaveLayoutPreset,
  onDeleteLayoutPreset,
  onDragNewPanel,
  layoutPresetOptions,
  layoutMode,
}: HeaderProps) {
  const { t } = useTranslation();
  const tabs = useMemo(() => getTabs(t), [t]);
  const editModes = useMemo(() => getEditModes(t), [t]);
  const { venue, projectVersion, lastSavedVersion, saveProject, loadProject, editMode, setEditMode, avForeign, showForeign, toggleShowForeign } = useStore();
  const hasForeignLighting = !!(avForeign.lighting && Array.isArray((avForeign.lighting as { fixtures?: unknown }).fixtures) && (avForeign.lighting as { fixtures: unknown[] }).fixtures.length > 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);
  const avplanInputRef = useRef<HTMLInputElement>(null);
  const unsaved = projectVersion !== lastSavedVersion;
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [savePresetName, setSavePresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const presetMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);

  // Close preset menu on outside click
  useEffect(() => {
    if (!presetMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (presetMenuRef.current && !presetMenuRef.current.contains(e.target as Node)) {
        setPresetMenuOpen(false);
        setShowSaveInput(false);
        setSavePresetName('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [presetMenuOpen]);

  // Close export menu on outside click
  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportMenuOpen]);

  // Auto-focus the save input when shown
  useEffect(() => {
    if (showSaveInput) saveInputRef.current?.focus();
  }, [showSaveInput]);

  const handleSavePresetSubmit = useCallback(() => {
    if (!savePresetName.trim()) return;
    onSaveLayoutPreset(savePresetName.trim());
    setSavePresetName('');
    setShowSaveInput(false);
    setPresetMenuOpen(false);
  }, [onSaveLayoutPreset, savePresetName]);

  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadProject(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [loadProject]);

  const handleExport = useCallback((mode: ExportMode = 'current') => {
    setExportMenuOpen(false);
    window.dispatchEvent(new CustomEvent('multicam-export', { detail: { mode } }));
  }, []);

  // ── Venue-Austausch: exportiert den geteilten Raum (Floor-Plan, Waende,
  // Stage, Personen) als neutrale .venue.json, die auch Light-Planner liest.
  const handleExportVenue = useCallback(() => {
    const s = useStore.getState();
    const ex = toVenueExchange({
      venue: s.venue, persons: s.persons, walls: s.walls, backgroundPlan: s.backgroundPlan,
      appVersion: APP_VERSION, exportedAt: new Date().toISOString(),
    });
    const blob = new Blob([JSON.stringify(ex, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.venue.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.venue.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Exportiert die platzierten Kameras als camera-list fuer den Cable-Planner
  // (dort werden sie zu verkabelbaren Equipment-Nodes).
  const handleExportCameras = useCallback(() => {
    const s = useStore.getState();
    const ex = toCameraList(
      s.cameras,
      (id) => getCameraById(id, s.customCameras),
      { appVersion: APP_VERSION, exportedAt: new Date().toISOString() },
    );
    const blob = new Blob([JSON.stringify(ex, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.venue.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.cameras.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Gesamtprojekt (.avplan): verlustfrei. MultiCam bearbeitet den cameras-
  // Slot nativ und reicht lighting/cabling 1:1 durch.
  const handleExportAvplan = useCallback(() => {
    const s = useStore.getState();
    const now = new Date().toISOString();
    const cameraDoc: ProjectFile = {
      formatVersion: 1, appVersion: APP_VERSION, projectVersion: s.projectVersion,
      savedAt: now, venue: s.venue, cameras: s.cameras, persons: s.persons,
      walls: s.walls ?? [], backgroundPlan: s.backgroundPlan,
    };
    const venue = toVenueExchange({
      venue: s.venue, persons: s.persons, walls: s.walls, backgroundPlan: s.backgroundPlan,
      appVersion: APP_VERSION, exportedAt: now,
    }).venue;
    const avplan = makeAvPlan({
      app: 'multicam-planner', appVersion: APP_VERSION, exportedAt: now, venue,
      domains: { cameras: cameraDoc, lighting: s.avForeign.lighting, cabling: s.avForeign.cabling },
    });
    const blob = new Blob([JSON.stringify(avplan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.venue.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.avplan`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportAvplan = useCallback(() => {
    avplanInputRef.current?.click();
  }, []);

  const handleAvplanFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        useStore.getState().importAvPlan(parseAvPlan(await file.text()));
      } catch (err) {
        alert(`.avplan-Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (avplanInputRef.current) avplanInputRef.current.value = '';
  }, []);

  const handleImportVenue = useCallback(() => {
    venueInputRef.current?.click();
  }, []);

  const handleVenueFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const ex = parseVenueExchange(await file.text());
        useStore.getState().importVenueExchange(ex);
      } catch (err) {
        alert(`Venue-Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (venueInputRef.current) venueInputRef.current.value = '';
  }, []);

  return (
    <header className="h-14 bg-bc-panel border-b border-bc-border flex items-center justify-between px-2 sm:px-4 shrink-0 gap-3">
      <div className="flex items-center gap-2 text-white min-w-0 shrink-0">
        <FiCamera size={20} className="text-bc-accent shrink-0" />
        <span className="font-bold text-sm hidden sm:inline">MultiCam Planner</span>
        <span className="text-xs text-gray-500 ml-2 hidden lg:inline">— {venue.name}</span>
        {/* Minimal unsaved-changes indicator (no project-version counter). */}
        {unsaved && (
          <span
            className="text-xs ml-2 px-1.5 py-0.5 rounded shrink-0 bg-bc-yellow/20 text-bc-yellow"
            title={t('header.unsaved.title', 'There are unsaved changes — use Save to write a .mcplan file')}
          >
            {t('header.unsaved', '● unsaved')}
          </span>
        )}
      </div>

      <nav className="flex gap-2 min-w-0 flex-1 justify-center items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            draggable={layoutMode === 'grid'}
            onDragStart={(e) => {
              onDragNewPanel(tab.id, e.nativeEvent);
            }}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-gray-300 hover:text-white hover:bg-bc-border border border-transparent hover:border-bc-border ${
              layoutMode === 'grid' ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            title={layoutMode === 'grid' ? format(t('header.tab.dragTitle', 'Drag {label} into the grid'), { label: tab.label }) : format(t('header.tab.focusTitle', '{label} in focus view'), { label: tab.label })}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
        <div className="hidden md:flex items-center rounded-lg border border-bc-border bg-bc-dark p-0.5 ml-2">
          <button
            type="button"
            onClick={() => onSetLayoutMode('focus')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${layoutMode === 'focus' ? 'bg-bc-accent text-white' : 'text-gray-400 hover:text-white'}`}
            title={t('header.layout.focus.title', 'Show a single focused panel')}
          >
            {t('header.layout.focus', 'Focus')}
          </button>
          <button
            type="button"
            onClick={() => onSetLayoutMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${layoutMode === 'grid' ? 'bg-bc-accent text-white' : 'text-gray-400 hover:text-white'}`}
            title={t('header.layout.grid.title', 'Show the grid workspace')}
          >
            {t('header.layout.grid', 'Grid')}
          </button>
        </div>
        {/* Edit-mode slider — restricts editing to one category (issue #43) */}
        <div className="hidden lg:flex items-center rounded-lg border border-bc-border bg-bc-dark p-0.5" title={t('header.editModeSlider.title', 'Edit mode — lock everything except the selected category')}>
          {editModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setEditMode(m.id)}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode === m.id ? 'bg-bc-yellow text-black' : 'text-gray-400 hover:text-white'}`}
              title={m.title}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="relative" ref={presetMenuRef}>
          <button
            type="button"
            onClick={() => setPresetMenuOpen((open) => !open)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors"
            title={t('header.presets.title', 'Layout presets')}
          >
            <span>{t('header.presets', 'Presets')}</span>
            <FiChevronDown size={12} />
          </button>
          {presetMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[220px] rounded-lg border border-bc-border bg-bc-panel shadow-2xl overflow-hidden z-30">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 border-b border-bc-border">{t('header.presets.builtIn', 'Built-in')}</div>
              <button
                type="button"
                onClick={() => { onApplyPreset('focus'); setPresetMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${layoutMode === 'focus' ? 'text-bc-accent' : 'text-gray-300 hover:text-white hover:bg-bc-border'}`}
              >{t('header.presets.focus', 'Focus')}</button>
              <button
                type="button"
                onClick={() => { onApplyPreset('grid'); setPresetMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${layoutMode === 'grid' ? 'text-bc-accent' : 'text-gray-300 hover:text-white hover:bg-bc-border'}`}
              >{t('header.presets.defaultGrid', 'Default Grid')}</button>
              {layoutPresetOptions.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 border-t border-b border-bc-border">{t('header.presets.saved', 'Saved')}</div>
                  {layoutPresetOptions.map((preset) => (
                    <div key={preset.id} className="flex items-center group">
                      <button
                        type="button"
                        onClick={() => { onApplyPreset(preset.id); setPresetMenuOpen(false); }}
                        className="flex-1 text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-bc-border transition-colors"
                      >{preset.label}</button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteLayoutPreset(preset.id); }}
                        className="px-2 py-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        title={format(t('header.presets.deleteTitle', 'Delete preset "{label}"'), { label: preset.label })}
                      ><FiX size={12} /></button>
                    </div>
                  ))}
                </>
              )}
              {layoutMode === 'grid' && (
                <div className="border-t border-bc-border">
                  {!showSaveInput ? (
                    <button
                      type="button"
                      onClick={() => setShowSaveInput(true)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors flex items-center gap-1.5"
                    ><FiSave size={12} /> {t('header.presets.saveCurrent', 'Save current grid as preset…')}</button>
                  ) : (
                    <form
                      className="flex items-center gap-1 px-2 py-1.5"
                      onSubmit={(e) => { e.preventDefault(); handleSavePresetSubmit(); }}
                    >
                      <input
                        ref={saveInputRef}
                        type="text"
                        value={savePresetName}
                        onChange={(e) => setSavePresetName(e.target.value)}
                        placeholder={t('header.presets.namePlaceholder', 'Preset name…')}
                        className="flex-1 bg-bc-dark border border-bc-border rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-bc-accent"
                      />
                      <button
                        type="submit"
                        disabled={!savePresetName.trim()}
                        className="p-1 rounded text-gray-400 hover:text-bc-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={t('header.presets.save', 'Save preset')}
                      ><FiCheck size={14} /></button>
                      <button
                        type="button"
                        onClick={() => { setShowSaveInput(false); setSavePresetName(''); }}
                        className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
                        title={t('header.presets.cancel', 'Cancel')}
                      ><FiX size={14} /></button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button onClick={saveProject} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.save.title', 'Save project (.mcplan)')}>
          <FiSave size={14} />
          <span className="hidden sm:inline">{t('header.save', 'Save')}</span>
        </button>
        <button onClick={handleLoad} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.open.title', 'Open project file')}>
          <FiUpload size={14} />
          <span className="hidden sm:inline">{t('header.open', 'Open')}</span>
        </button>
        <button onClick={handleExportAvplan} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.avplanExport.title', 'Export full combined project (.avplan) — venue + cameras + lighting + cabling, lossless across all three apps')}>
          <FiBox size={14} />
          <span className="hidden md:inline">.avplan ↑</span>
        </button>
        <button onClick={handleImportAvplan} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.avplanImport.title', 'Import a combined project (.avplan) — cameras load natively, lighting/cabling are preserved losslessly')}>
          <FiBox size={14} />
          <span className="hidden md:inline">.avplan ↓</span>
        </button>
        {hasForeignLighting && (
          <button onClick={toggleShowForeign} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${showForeign ? 'text-bc-yellow bg-bc-yellow/15' : 'text-gray-500 hover:text-white hover:bg-bc-border'}`} title={t('header.lamps.title', 'Show/hide read-only lighting fixtures imported from the Light-Planner (.avplan)')}>
            <FiSliders size={14} />
            <span className="hidden lg:inline">{t('header.lamps', 'Lampen')}</span>
          </button>
        )}
        <button onClick={handleExportVenue} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.venueExport.title', 'Export venue (room, walls, stage, persons, floor plan) as a shared .venue.json — importable in Light-Planner')}>
          <FiMapPin size={14} />
          <span className="hidden md:inline">Venue ↑</span>
        </button>
        <button onClick={handleImportVenue} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.venueImport.title', 'Import a shared venue (.venue.json) — replaces room, walls, stage, persons, floor plan; cameras are kept')}>
          <FiMapPin size={14} />
          <span className="hidden md:inline">Venue ↓</span>
        </button>
        <button onClick={handleExportCameras} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-bc-border transition-colors" title={t('header.camerasExport.title', 'Export placed cameras as a .cameras.json for Cable-Planner — there they become cabling equipment nodes')}>
          <FiCamera size={14} />
          <span className="hidden md:inline">→ Cable</span>
        </button>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setExportMenuOpen((o) => !o)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-bc-accent hover:text-white hover:bg-bc-accent/20 transition-colors"
            title={t('header.export.title', 'Export views as PNG')}
          >
            <FiDownload size={14} />
            <span className="hidden sm:inline">{t('header.export', 'Export')}</span>
            <FiChevronDown size={12} />
          </button>
          {exportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[260px] rounded-lg border border-bc-border bg-bc-panel shadow-2xl overflow-hidden z-30">
              <button
                type="button"
                onClick={() => handleExport('current')}
                className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-bc-border hover:text-white transition-colors"
              >
                <div className="font-medium">{t('header.export.current', 'Current camera')}</div>
                <div className="text-[10px] text-gray-500">{t('header.export.current.desc', 'Selected camera at current focal length')}</div>
              </button>
              <button
                type="button"
                onClick={() => handleExport('all')}
                className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-bc-border hover:text-white transition-colors border-t border-bc-border"
              >
                <div className="font-medium">{t('header.export.all', 'All cameras')}</div>
                <div className="text-[10px] text-gray-500">{t('header.export.all.desc', 'One PNG per camera at its current focal length')}</div>
              </button>
              <button
                type="button"
                onClick={() => handleExport('widetele')}
                className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-bc-border hover:text-white transition-colors border-t border-bc-border"
              >
                <div className="font-medium">{t('header.export.widetele', 'Current — wide + tele')}</div>
                <div className="text-[10px] text-gray-500">{t('header.export.widetele.desc', 'Selected camera at lens min and max focal length')}</div>
              </button>
              <button
                type="button"
                onClick={() => handleExport('all-widetele')}
                className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-bc-border hover:text-white transition-colors border-t border-bc-border"
              >
                <div className="font-medium">{t('header.export.allWidetele', 'All — wide + tele')}</div>
                <div className="text-[10px] text-gray-500">{t('header.export.allWidetele.desc', 'Two PNGs per camera (lens min and max)')}</div>
              </button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".mcplan,.json" className="hidden" onChange={handleFileChange} />
        <input ref={venueInputRef} type="file" accept=".venue.json,.json" className="hidden" onChange={handleVenueFileChange} />
        <input ref={avplanInputRef} type="file" accept=".avplan,.json" className="hidden" onChange={handleAvplanFileChange} />
        <span className="text-xs text-gray-500 hidden lg:inline">v{APP_VERSION}</span>
      </div>
    </header>
  );
}
