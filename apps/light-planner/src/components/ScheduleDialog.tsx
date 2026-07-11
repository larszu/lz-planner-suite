import React, { useState } from 'react';
import type { PlacedFixture, Truss, Wall, Ceiling } from '../types';
import { computePower, fixtureCounts, footprint, trussLoads, circuitBreakdown, colorCounts, nearestTrussId } from '../core/patch';
import { rigCheck, issueCounts } from '../core/rigCheck';
import { photometricReport, type EvalArea } from '../core/photometrics';
import { buildMvr } from '../core/mvrExport';
import { gelLibrary } from '../core/gelLibrary';
import { getFixtureCCT, cctToRgb } from '../core/colorTemp';
import Icon from './Icon';
import type { IconName } from './Icon';
import { useTranslation } from '../i18n';

interface Props {
  fixtures: PlacedFixture[];
  trusses: Truss[];
  walls: Wall[];
  ceilings: Ceiling[];
  area: EvalArea | null;
  projectName: string;
  conflicts: Set<string>;
  onAutoNumber: () => void;
  onAutoPatch: () => void;
  onLocate: (ids: string[]) => void;
  onUpdateFixture: (id: string, updates: Partial<PlacedFixture>) => void;
  onClose: () => void;
}

type Tab = 'list' | 'magic' | 'focus' | 'check' | 'photo' | 'load' | 'export';
type T = (key: string, de: string) => string;
const buildTabs = (t: T): { id: Tab; label: string; icon: IconName }[] => [
  { id: 'list', label: t('dlg.sch.tab.list', 'Geräteliste & Patch'), icon: 'schedule' },
  { id: 'magic', label: t('dlg.sch.tab.magic', 'Magic Sheet'), icon: 'grid' },
  { id: 'focus', label: t('dlg.sch.tab.focus', 'Fokus'), icon: 'autolight' },
  { id: 'check', label: t('dlg.sch.tab.check', 'Prüfung'), icon: 'check' },
  { id: 'photo', label: t('dlg.sch.tab.photo', 'Photometrie'), icon: 'heatmap' },
  { id: 'load', label: t('dlg.sch.tab.load', 'Last & Strom'), icon: 'truss' },
  { id: 'export', label: t('dlg.sch.tab.export', 'Export'), icon: 'export' },
];
const TAB_IDS: Tab[] = ['list', 'magic', 'focus', 'check', 'photo', 'load', 'export'];

const cssRgb = (rgb: [number, number, number]) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
// Representative swatch per gel family (the library has no per-gel RGB).
const gelSwatch = (type: string): string =>
  type === 'CTO' ? '#f0a35e' : type === 'CTB' ? '#7fb6f0'
    : (type === 'frost' || type === 'diffusion') ? '#e8ecf2' : '#9aa7b6';

const gelCodes = (ids?: string[]) =>
  (ids ?? []).map((id) => gelLibrary.find((g) => g.id === id)?.code ?? '').filter(Boolean).join('+');

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(';')).join('\r\n');
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

const lx = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString());
const utilClass = (u: number) => (u >= 1 ? 'util-over' : u >= 0.8 ? 'util-warn' : 'util-ok');

// A focused multi-tool hub for paperwork, validation, analysis and interchange.
// Each tab is one job, so no single view is overloaded.
const ScheduleDialog: React.FC<Props> = ({ fixtures, trusses, walls, ceilings, area, projectName, conflicts, onAutoNumber, onAutoPatch, onLocate, onUpdateFixture, onClose }) => {
  const { t } = useTranslation();
  const TABS = buildTabs(t);
  const [tab, setTabState] = useState<Tab>(() => {
    try { const saved = localStorage.getItem('lp-tool-tab'); if (saved && TAB_IDS.includes(saved as Tab)) return saved as Tab; } catch { /* ignore */ }
    return 'list';
  });
  const setTab = (t: Tab) => { setTabState(t); try { localStorage.setItem('lp-tool-tab', t); } catch { /* ignore */ } };

  const counts = fixtureCounts(fixtures);
  const power = computePower(fixtures);
  const totalWeight = fixtures.reduce((s, f) => s + (f.fixture.weight || 0), 0);
  const issues = rigCheck(fixtures, trusses);
  const ic = issueCounts(issues);
  const photo = photometricReport(fixtures, walls, ceilings, area);
  const loads = trussLoads(fixtures, trusses);
  const circuits = circuitBreakdown(fixtures);
  const colors = colorCounts(fixtures);
  const checkBadge = ic.errors + ic.warnings;

  const ordered = [...fixtures].sort((a, b) => (a.channel ?? 1e9) - (b.channel ?? 1e9) || a.y - b.y || a.x - b.x);
  const safe = (projectName || 'lichtplan').replace(/[^\w.-]+/g, '_');

  const exportSchedule = () => {
    const header = ['Unit', t('dlg.sch.csv.channel', 'Kanal'), 'Universe', t('dlg.sch.csv.address', 'Adresse'), t('dlg.sch.csv.type', 'Typ'), t('dlg.sch.csv.manufacturer', 'Hersteller'), 'X (m)', 'Y (m)', t('dlg.sch.csv.height', 'Höhe (m)'), 'Gel', t('dlg.sch.csv.purpose', 'Zweck'), t('dlg.sch.csv.focused', 'Fokussiert'), t('dlg.sch.csv.focusNote', 'Fokus-Notiz'), 'W', 'kg'];
    const rows = ordered.map((f) => [
      f.unitNumber ?? '', f.channel ?? '', f.universe ?? '', f.dmxAddress ?? '',
      f.fixture.name, f.fixture.manufacturer, f.x, f.y, f.mountingHeight,
      gelCodes(f.gelFilterIds), f.purpose ?? '', f.focused ? t('dlg.sch.csv.yes', 'ja') : '', f.focusNote ?? '', f.fixture.wattage, f.fixture.weight,
    ]);
    downloadCsv('instrument-schedule.csv', [header, ...rows]);
  };
  const exportInventory = () => {
    const header = [t('dlg.sch.csv.count', 'Anzahl'), t('dlg.sch.csv.manufacturer', 'Hersteller'), t('dlg.sch.csv.type', 'Typ'), 'W/Stk', 'kg/Stk', t('dlg.sch.csv.wTotal', 'W gesamt'), t('dlg.sch.csv.kgTotal', 'kg gesamt')];
    const rows = counts.map((c) => [c.count, c.manufacturer, c.name, c.watts, c.weight, c.count * c.watts, (c.count * c.weight).toFixed(1)]);
    downloadCsv('geraeteliste.csv', [header, ...rows]);
  };
  const exportColors = () => {
    const header = [t('dlg.sch.csv.count', 'Anzahl'), t('dlg.sch.csv.brand', 'Marke'), 'Code', 'Name', t('dlg.sch.csv.type', 'Typ')];
    const rows = colors.map((c) => [c.count, c.brand, c.code, c.name, c.type]);
    downloadCsv('farbliste.csv', [header, ...rows]);
  };
  const exportMvr = () => {
    const data = buildMvr(fixtures, trusses, projectName);
    triggerDownload(new Blob([data as BlobPart], { type: 'application/octet-stream' }), `${safe}.mvr`);
  };

  // Magic sheet: channels grouped by purpose (system), each a clickable chip
  // tinted by its effective colour temperature — at-a-glance "what is what".
  const groups = (() => {
    const m = new Map<string, PlacedFixture[]>();
    for (const f of fixtures) {
      const key = (f.purpose && f.purpose.trim()) || 'Ohne Zweck';
      (m.get(key) ?? m.set(key, []).get(key)!).push(f);
    }
    return [...m.entries()]
      .map(([name, fs]) => ({ name, fs: fs.sort((a, b) => (a.channel ?? 1e9) - (b.channel ?? 1e9)) }))
      .sort((a, b) => (a.name === 'Ohne Zweck' ? 1 : 0) - (b.name === 'Ohne Zweck' ? 1 : 0) || a.name.localeCompare(b.name));
  })();

  // Focus session: group by hanging position (truss) — the order a focus call
  // actually works through the rig — and track per-fixture done + note.
  const focusGroups = (() => {
    const m = new Map<string, PlacedFixture[]>();
    for (const f of fixtures) {
      const tid = nearestTrussId(f, trusses);
      const key = tid ? (trusses.find((x) => x.id === tid)?.label || 'Traverse') : 'Boden / Stative';
      (m.get(key) ?? m.set(key, []).get(key)!).push(f);
    }
    return [...m.entries()]
      .map(([name, fs]) => ({ name, fs: fs.sort((a, b) => (a.channel ?? 1e9) - (b.channel ?? 1e9)) }))
      .sort((a, b) => (a.name === 'Boden / Stative' ? 1 : 0) - (b.name === 'Boden / Stative' ? 1 : 0) || a.name.localeCompare(b.name));
  })();
  const focusedCount = fixtures.filter((f) => f.focused).length;

  // Translate the well-known group keys for display only; the raw German keys
  // stay as grouping/sort identifiers above.
  const groupLabel = (name: string): string => {
    if (name === 'Ohne Zweck') return t('dlg.sch.noPurpose', 'Ohne Zweck');
    if (name === 'Boden / Stative') return t('dlg.sch.floorStands', 'Boden / Stative');
    if (name === 'Traverse') return t('dlg.sch.truss', 'Traverse');
    return name;
  };

  const activeLabel = TABS.find((x) => x.id === tab)!.label;

  // ── per-tool panels ──
  const listPanel = (
    <>
      <div className="schedule-actions">
        <button className="btn-secondary" onClick={onAutoNumber}>① {t('dlg.sch.autoNumber', 'Auto-Nummerieren')}</button>
        <button className="btn-secondary" onClick={onAutoPatch}>② {t('dlg.sch.autoPatch', 'Auto-Patch (DMX)')}</button>
      </div>
      <h4 className="schedule-subhead">{t('dlg.sch.inventory', 'Inventar')} ({fixtures.length} {t('dlg.sch.fixtures', 'Leuchten')}, {counts.length} {t('dlg.sch.types', 'Typen')})</h4>
      <table className="schedule-table">
        <thead><tr><th>{t('dlg.sch.col.qty', 'Anz.')}</th><th>{t('dlg.sch.col.manufacturer', 'Hersteller')}</th><th>{t('dlg.sch.col.type', 'Typ')}</th><th>W/Stk</th><th>{t('dlg.sch.col.wTotal', 'W ges.')}</th><th>{t('dlg.sch.col.kgTotal', 'kg ges.')}</th></tr></thead>
        <tbody>
          {counts.map((c) => (
            <tr key={c.manufacturer + c.name}>
              <td><strong>{c.count}</strong></td><td>{c.manufacturer}</td><td>{c.name}</td>
              <td>{c.watts}</td><td>{c.count * c.watts}</td><td>{(c.count * c.weight).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="schedule-subhead">{t('dlg.sch.instrumentSchedule', 'Instrument Schedule')}</h4>
      <table className="schedule-table">
        <thead><tr><th>Unit</th><th>Ch</th><th>DMX</th><th>{t('dlg.sch.col.type', 'Typ')}</th><th>{t('dlg.sch.col.pos', 'Pos (x,y,h)')}</th><th>Gel</th><th>{t('dlg.sch.col.purpose', 'Zweck')}</th></tr></thead>
        <tbody>
          {ordered.map((f) => (
            <tr key={f.id} className={conflicts.has(f.id) ? 'row-conflict' : ''}
              onClick={() => onLocate([f.id])} title={t('dlg.sch.showInPlan', 'Im Plan zeigen')}>
              <td>{f.unitNumber ?? '–'}</td>
              <td>{f.channel ?? '–'}</td>
              <td>{f.universe != null && f.dmxAddress != null ? `${f.universe}.${f.dmxAddress}` : (footprint(f) === 0 ? 'Dimmer' : '–')}</td>
              <td>{f.fixture.name}</td>
              <td>{f.x},{f.y} · {f.mountingHeight}m</td>
              <td>{gelCodes(f.gelFilterIds) || '–'}</td>
              <td>{f.purpose || '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {colors.length > 0 && (
        <>
          <h4 className="schedule-subhead">{t('dlg.sch.colorsUsage', 'Farben & Verbrauch')} ({colors.reduce((s, c) => s + c.count, 0)} {t('dlg.sch.cuts', 'Schnitte')})</h4>
          <table className="schedule-table">
            <thead><tr><th>{t('dlg.sch.col.qty', 'Anz.')}</th><th>{t('dlg.sch.col.color', 'Farbe')}</th><th>{t('dlg.sch.col.brandCode', 'Marke / Code')}</th><th>Name</th><th>{t('dlg.sch.col.type', 'Typ')}</th></tr></thead>
            <tbody>
              {colors.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.count}</strong></td>
                  <td><span className="gel-swatch" style={{ background: gelSwatch(c.type) }} /></td>
                  <td>{c.brand} {c.code}</td><td>{c.name}</td><td>{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );

  const magicPanel = (
    <div className="magic-sheet">
      {groups.map((g) => (
        <div key={g.name} className="magic-group">
          <div className="magic-group-head">{groupLabel(g.name)} <em>{g.fs.length}</em></div>
          <div className="magic-chips">
            {g.fs.map((f) => (
              <button key={f.id} className={`magic-chip ${f.focused ? 'focused' : ''}`} onClick={() => onLocate([f.id])}
                title={`${f.fixture.name} · ${f.x},${f.y} · ${f.mountingHeight} m${f.focused ? ' · ' + t('dlg.sch.focusedTag', 'fokussiert') : ''}`}>
                <span className="mc-tint" style={{ background: cssRgb(cctToRgb(getFixtureCCT(f))) }} />
                <span className="mc-ch">{f.channel ?? '–'}</span>
                <span className="mc-meta">
                  <span className="mc-type">{f.fixture.name}</span>
                  <span className="mc-gel">{gelCodes(f.gelFilterIds) || `${Math.round(getFixtureCCT(f))} K`}</span>
                </span>
                {f.focused && <span className="mc-done"><Icon name="check" size={11} /></span>}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="prop-derived">{t('dlg.sch.magicHint', 'Nach Zweck gruppiert · Tönung = effektive Farbtemperatur · Klick zeigt die Leuchte im Plan.')}</div>
    </div>
  );

  const focusPanel = (
    <div className="focus-tool">
      <div className="focus-progress">
        <div className="fp-bar"><i style={{ width: `${fixtures.length ? (focusedCount / fixtures.length) * 100 : 0}%` }} /></div>
        <span className="fp-label">{focusedCount} {t('dlg.sch.ofN', 'von')} {fixtures.length} {t('dlg.sch.focusedTag', 'fokussiert')}</span>
      </div>
      {focusGroups.map((g) => (
        <div key={g.name} className="focus-group">
          <div className="schedule-subhead">{groupLabel(g.name)} · {g.fs.filter((f) => f.focused).length}/{g.fs.length}</div>
          <div className="focus-rows">
            {g.fs.map((f) => (
              <div key={f.id} className={`focus-row ${f.focused ? 'done' : ''}`}>
                <button className={`focus-tick ${f.focused ? 'on' : ''}`} title={t('dlg.sch.focusedTag', 'fokussiert')}
                  onClick={() => onUpdateFixture(f.id, { focused: !f.focused })}>
                  {f.focused && <Icon name="check" size={14} />}
                </button>
                <span className="focus-ch">{f.channel ?? '–'}</span>
                <span className="focus-info">
                  <b>{f.fixture.name}</b>
                  <span>{f.purpose || '—'} · {t('dlg.sch.aim', 'Ziel')} {f.aimX},{f.aimY}</span>
                </span>
                <input className="focus-note" placeholder={t('dlg.sch.focusNotePlaceholder', 'Fokus-Notiz – z. B. Gesicht Solist, harte Kante…')}
                  value={f.focusNote ?? ''} onChange={(e) => onUpdateFixture(f.id, { focusNote: e.target.value })} />
                <button className="focus-locate" title={t('dlg.sch.showInPlan', 'Im Plan zeigen')} onClick={() => onLocate([f.id])}><Icon name="select" size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="prop-derived">{t('dlg.sch.focusHint', 'Live beim Einleuchten: abhaken, Fokus-Notiz je Leuchte erfassen, im Plan finden. Wird im Projekt gespeichert und im Schedule-CSV exportiert.')}</div>
    </div>
  );

  const checkPanel = (
    <>
      <div className="rig-pills">
        <span className={`rig-pill ${ic.errors ? 'err' : 'off'}`}>{ic.errors} {t('dlg.sch.errors', 'Fehler')}</span>
        <span className={`rig-pill ${ic.warnings ? 'warn' : 'off'}`}>{ic.warnings} {t('dlg.sch.warnings', 'Warnungen')}</span>
        <span className="rig-pill info">{ic.infos} {t('dlg.sch.infos', 'Hinweise')}</span>
      </div>
      {issues.length === 0 ? (
        <div className="rig-clean">✓ {t('dlg.sch.noIssues', 'Keine Probleme gefunden.')}</div>
      ) : (
        <ul className="rig-issues">
          {issues.map((i, k) => {
            const locatable = !!i.ids && i.ids.length > 0;
            return (
              <li key={k} className={`rig-issue sev-${i.severity} ${locatable ? 'locatable' : ''}`}
                onClick={locatable ? () => onLocate(i.ids!) : undefined}
                title={locatable ? t('dlg.sch.showAffected', 'Betroffene Leuchten im Plan zeigen') : undefined}>
                <span className="rig-dot" />{i.message}
                {locatable && <Icon name="chevronRight" size={14} className="rig-go" />}
              </li>
            );
          })}
        </ul>
      )}
      <div className="prop-derived">{t('dlg.sch.checkHint', 'Geprüft: DMX-Überlappung, doppelte Kanäle, ungepatchte Movers, Traversen-Last, Strom-Headroom.')}</div>
    </>
  );

  const photoPanel = photo ? (
    <>
      <div className="schedule-cards">
        <div className="schedule-card"><span className="sc-val">{lx(photo.avg)} lx</span><span className="sc-label">{t('dlg.sch.avg', 'Mittel (Eavg)')}</span></div>
        <div className="schedule-card"><span className="sc-val">{lx(photo.min)} lx</span><span className="sc-label">{t('dlg.sch.min', 'Minimum')}</span></div>
        <div className="schedule-card"><span className="sc-val">{lx(photo.max)} lx</span><span className="sc-label">{t('dlg.sch.max', 'Maximum')}</span></div>
        <div className={`schedule-card photo-${photo.u0 >= 0.6 ? 'ok' : photo.u0 >= 0.4 ? 'warn' : 'bad'}`}>
          <span className="sc-val">{photo.u0.toFixed(2)}</span><span className="sc-label">U0 = Emin/Eavg · {photo.rating}</span>
        </div>
        <div className="schedule-card"><span className="sc-val">{photo.u2.toFixed(2)}</span><span className="sc-label">U2 = Emin/Emax</span></div>
        <div className="schedule-card"><span className="sc-val">{photo.areaM2.toFixed(1)} m²</span><span className="sc-label">{t('dlg.sch.lit', 'ausgeleuchtet')}</span></div>
      </div>
      <div className="prop-derived">{t('dlg.sch.photoHint', 'Richtwert (DIN EN 12464 / CIBSE): U0 ≥ 0,6 gut · ≥ 0,4 akzeptabel. Werte über die ausgeleuchtete Bühnenfläche (gleiche Engine wie die Heatmap).')}</div>
    </>
  ) : (
    <div className="tool-empty">{t('dlg.sch.noPhoto', 'Keine beleuchteten Leuchten – Photometrie nicht verfügbar.')}</div>
  );

  const loadPanel = (
    <>
      <h4 className="schedule-subhead">{t('dlg.sch.power', 'Leistung')}</h4>
      <div className="schedule-cards">
        <div className="schedule-card"><span className="sc-val">{(power.totalWatts / 1000).toFixed(2)} kW</span><span className="sc-label">{t('dlg.sch.totalPower', 'Gesamtleistung')}</span></div>
        <div className="schedule-card"><span className="sc-val">{power.amps1ph.toFixed(1)} A</span><span className="sc-label">{t('dlg.sch.singlePhase', '@ 230 V (1-phasig)')}</span></div>
        <div className="schedule-card"><span className="sc-val">{power.ampsPerPhase.toFixed(1)} A</span><span className="sc-label">{t('dlg.sch.perPhase', 'pro Phase (3×230 V)')}</span></div>
        <div className="schedule-card"><span className="sc-val">{circuits.length}×</span><span className="sc-label">{t('dlg.sch.circuits', 'Stromkreise (16 A, 3 kW)')}</span></div>
      </div>
      {circuits.length > 0 && (
        <div className="circuit-strip">
          {circuits.map((c) => (
            <div key={c.index} className="circuit-chip" title={`${c.fixtureCount} ${t('dlg.sch.fixtures', 'Leuchten')} · ${c.watts} W`}>
              <span className="cc-name">C{c.index}</span>
              <span className={`cc-bar ${utilClass(c.utilization)}`}><i style={{ width: `${Math.min(100, c.utilization * 100)}%` }} /></span>
              <span className="cc-val">{c.watts} W</span>
            </div>
          ))}
        </div>
      )}
      <h4 className="schedule-subhead">{t('dlg.sch.loadPerTruss', 'Last pro Traverse')} · {totalWeight.toFixed(1)} {t('dlg.sch.kgTotalLabel', 'kg gesamt')}</h4>
      <table className="schedule-table">
        <thead><tr><th>{t('dlg.sch.col.truss', 'Traverse')}</th><th>{t('dlg.sch.fixtures', 'Leuchten')}</th><th>{t('dlg.sch.col.load', 'Last')}</th><th>{t('dlg.sch.col.capacity', 'Traglast')}</th><th>{t('dlg.sch.col.utilization', 'Auslastung')}</th></tr></thead>
        <tbody>
          {loads.perTruss.map((tr) => (
            <tr key={tr.id} className={tr.overloaded ? 'row-conflict' : ''}>
              <td>{tr.label}</td><td>{tr.fixtureCount}</td><td>{tr.weightKg.toFixed(1)} kg</td><td>{tr.capacityKg} kg</td>
              <td>
                <span className={`util-bar ${utilClass(tr.utilization)}`}><i style={{ width: `${Math.min(100, tr.utilization * 100)}%` }} /></span>
                <span className="util-pct">{Math.round(tr.utilization * 100)} %{tr.overloaded ? ' ⚠' : ''}</span>
              </td>
            </tr>
          ))}
          {loads.unassigned.count > 0 && (
            <tr className="row-muted"><td>{t('dlg.sch.floorFreestanding', 'Boden / freistehend')}</td><td>{loads.unassigned.count}</td><td>{loads.unassigned.weightKg.toFixed(1)} kg</td><td>–</td><td>–</td></tr>
          )}
          {loads.perTruss.length === 0 && loads.unassigned.count === 0 && (
            <tr><td colSpan={5} className="row-muted">{t('dlg.sch.noneAssigned', 'Keine Leuchten zugeordnet.')}</td></tr>
          )}
        </tbody>
      </table>
    </>
  );

  const exportPanel = (
    <div className="export-list">
      <div className="export-row">
        <Icon name="schedule" size={22} className="er-icon" />
        <div className="er-text"><b>{t('dlg.sch.exp.schedule', 'Instrument Schedule (CSV)')}</b><span>{t('dlg.sch.exp.scheduleDesc', 'Patch, Position, Gel & Zweck je Leuchte – für Tabellenkalkulation.')}</span></div>
        <button className="btn-secondary" onClick={exportSchedule}>⬇ CSV</button>
      </div>
      <div className="export-row">
        <Icon name="library" size={22} className="er-icon" />
        <div className="er-text"><b>{t('dlg.sch.exp.inventory', 'Geräteliste (CSV)')}</b><span>{t('dlg.sch.exp.inventoryDesc', 'Stückzahlen je Typ mit Leistung & Gewicht – für Bestellung/Disposition.')}</span></div>
        <button className="btn-secondary" onClick={exportInventory}>⬇ CSV</button>
      </div>
      <div className="export-row">
        <Icon name="heatmap" size={22} className="er-icon" />
        <div className="er-text"><b>{t('dlg.sch.exp.colors', 'Farbliste (CSV)')}</b><span>{t('dlg.sch.exp.colorsDesc', 'Gel-Schnitte je Code – für Farb-Bestellung & Vorbereitung.')}</span></div>
        <button className="btn-secondary" onClick={exportColors} disabled={colors.length === 0}>⬇ CSV</button>
      </div>
      <div className="export-row">
        <Icon name="cube3d" size={22} className="er-icon" />
        <div className="er-text"><b>MVR (GDTF/MVR)</b><span>{t('dlg.sch.exp.mvrDesc', 'Rig mit Positionen & Patch – öffnet in Capture, grandMA3, WYSIWYG, Vectorworks, BlenderDMX.')}</span></div>
        <button className="btn-secondary" onClick={exportMvr}>⬇ .mvr</button>
      </div>
    </div>
  );

  const panels: Record<Tab, React.ReactNode> = { list: listPanel, magic: magicPanel, focus: focusPanel, check: checkPanel, photo: photoPanel, load: loadPanel, export: exportPanel };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal tool-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tool-head">
          <h3><Icon name={TABS.find((x) => x.id === tab)!.icon} size={18} /> {activeLabel}</h3>
          <button className="fp-icon-btn fp-close" onClick={onClose} title={t('dlg.sch.close', 'Schließen')}>✕</button>
        </div>
        {fixtures.length === 0 ? (
          <div className="tool-empty-wrap"><p className="dialog-hint">{t('dlg.sch.empty', 'Noch keine Leuchten platziert.')}</p></div>
        ) : (
          <div className="tool-body">
            <nav className="tool-nav">
              {TABS.map((x) => (
                <button key={x.id} className={tab === x.id ? 'on' : ''} onClick={() => setTab(x.id)}>
                  <Icon name={x.icon} size={16} /><span>{x.label}</span>
                  {x.id === 'check' && checkBadge > 0 && <span className={`nav-badge ${ic.errors ? 'err' : 'warn'}`}>{checkBadge}</span>}
                </button>
              ))}
            </nav>
            <div className="tool-content">{panels[tab]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleDialog;
