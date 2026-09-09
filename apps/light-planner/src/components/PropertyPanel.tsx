import React from 'react';
import type { PlacedFixture, Person, StageElement, Fixture, Truss, Wall, Ceiling, Shape, CameraView, WallWindow } from '../types';
import { wallMidHandle, curveControlForMid, wallLength } from '../core/geometry';
import { luxFromFixture, effectiveFieldAngleDeg, explainLux } from '../core/lightCalc';
import type { FixtureCategory, BeamShape, LensType, MountType, WallPresetId } from '../types';
import { WALL_PRESETS, DEFAULT_WALL_MATERIAL, wallPreset } from '../core/surfaceTextures';
import { DEFAULT_TRUSS_CAPACITY, footprint } from '../core/patch';
import { gelLibrary } from '../core/gelLibrary';
import { fixtureLibrary } from '../core/fixtureLibrary';
import { getFixtureCCT, cctToRgb } from '../core/colorTemp';
import { useTranslation } from '../i18n';
import { isEstimate, isStaleSource } from '../types';

interface Props {
  fixtures: PlacedFixture[];
  persons: Person[];
  stageElements: StageElement[];
  trusses: Truss[];
  walls: Wall[];
  ceilings: Ceiling[];
  shapes: Shape[];
  cameras: CameraView[];
  selectedIds: Set<string>;
  cursorLux: number | null;
  patchConflicts: Set<string>;
  onUpdateFixture: (id: string, updates: Partial<PlacedFixture>) => void;
  onUpdatePerson: (id: string, updates: Partial<Person>) => void;
  onUpdateStageElement: (id: string, updates: Partial<StageElement>) => void;
  onUpdateTruss: (id: string, updates: Partial<Truss>) => void;
  onUpdateWall: (id: string, updates: Partial<Wall>) => void;
  onUpdateCeiling: (id: string, updates: Partial<Ceiling>) => void;
  onUpdateCamera: (id: string, updates: Partial<CameraView>) => void;
  onLookThroughCamera: (id: string) => void;
  onDelete: (id: string) => void;
  onAutoThreePointForPerson: (personId: string) => void;
  onAreaLight: () => void;
}

const mountLabels = (t: (key: string, fallback: string) => string): Record<string, string> => ({
  bowens: 'Bowens S-Mount',
  'prolock-bowens': 'ProLock Bowens',
  junior: 'Junior Pin',
  baby: 'Baby Pin',
  clamp: 'C-Clamp',
  yoke: t('prop.mount.yoke', 'Integrated yoke'),
  none: t('prop.mount.none', 'No mount'),
});

const PropertyPanel: React.FC<Props> = ({
  fixtures,
  persons,
  stageElements,
  trusses,
  walls,
  ceilings,
  shapes,
  cameras,
  selectedIds,
  cursorLux,
  patchConflicts,
  onUpdateFixture,
  onUpdatePerson,
  onUpdateStageElement,
  onUpdateTruss,
  onUpdateWall,
  onUpdateCeiling,
  onUpdateCamera,
  onLookThroughCamera,
  onDelete,
  onAutoThreePointForPerson,
  onAreaLight,
}) => {
  const { t } = useTranslation();
  const MOUNT_LABELS = mountLabels(t);
  const selectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;
  const selFixture = fixtures.find((f) => f.id === selectedId);
  const selPerson = persons.find((p) => p.id === selectedId);
  const selStage = stageElements.find((s) => s.id === selectedId);
  const selTruss = trusses.find((t) => t.id === selectedId);
  const selWall = walls.find((w) => w.id === selectedId);
  const selCeiling = ceilings.find((c) => c.id === selectedId);
  const selShape = shapes.find((s) => s.id === selectedId);
  const selCamera = cameras.find((c) => c.id === selectedId);

  // Multi-selection info
  const multiFixtures = fixtures.filter((f) => selectedIds.has(f.id));
  const multiCount = selectedIds.size;
  const [beamHelp, setBeamHelp] = React.useState(false);
  const [showCalc, setShowCalc] = React.useState(false);
  const [showSpecs, setShowSpecs] = React.useState(true);
  const [barnHelp, setBarnHelp] = React.useState(false);

  const numField = (label: string, value: number, onChange: (v: number) => void, step = 0.1, min?: number, max?: number) => {
    const clamp = (v: number) => {
      if (min != null && v < min) v = min;
      if (max != null && v > max) v = max;
      return Math.round(v * 1000) / 1000; // tame float error from ± step
    };
    return (
      <label className="prop-field prop-pos-field">
        <span>{label}</span>
        <div className="pos-nudge-group">
          <button type="button" className="nudge-btn" onClick={() => onChange(clamp(value - step))}>◀</button>
          <input type="number" value={value} step={step} min={min} max={max}
            onChange={(e) => onChange(Number(e.target.value))} />
          <button type="button" className="nudge-btn" onClick={() => onChange(clamp(value + step))}>▶</button>
        </div>
      </label>
    );
  };

  if (selFixture) {
    const f = selFixture;
    const hDist = Math.sqrt((f.aimX - f.x) ** 2 + (f.aimY - f.y) ** 2);
    const tiltDeg = (Math.atan2(hDist, f.mountingHeight) * 180) / Math.PI;
    const panDeg = (Math.atan2(f.aimY - f.y, f.aimX - f.x) * 180) / Math.PI;

    // Get effective beam angle considering attachment
    const activeAtt = f.activeAttachmentId
      ? f.fixture.compatibleAttachments?.find((a) => a.id === f.activeAttachmentId)
      : undefined;
    const effectiveBeamAngle = f.currentBeamAngle ?? activeAtt?.beamAngleOverride ?? f.fixture.beamAngle;
    const effectiveZoomRange = activeAtt?.zoomRangeOverride ?? f.fixture.zoomRange;
    const beamRadAtFloor = Math.tan((effectiveBeamAngle / 2) * (Math.PI / 180)) * f.mountingHeight;
    const effFieldAngle = effectiveFieldAngleDeg(f);
    const fieldRadAtFloor = Math.tan((effFieldAngle / 2) * (Math.PI / 180)) * f.mountingHeight;
    // Effective angles scale with the current zoom relative to the base beam.
    const baseBeam = activeAtt?.beamAngleOverride ?? f.fixture.beamAngle;
    const zoomScale = baseBeam > 0 ? effectiveBeamAngle / baseBeam : 1;
    const effCutoff = f.fixture.cutoffAngle != null ? f.fixture.cutoffAngle * zoomScale : undefined;

    // Compute peak lux at aim point using the real engine
    const peakLux = luxFromFixture(f, f.aimX, f.aimY);

    // Pan/tilt from aim point, allow setting directly
    const setPanTilt = (newPanDeg: number, newTiltDeg: number) => {
      const tiltRad = (newTiltDeg * Math.PI) / 180;
      const panRad = (newPanDeg * Math.PI) / 180;
      const dist = f.mountingHeight * Math.tan(tiltRad);
      const aimX = f.x + dist * Math.cos(panRad);
      const aimY = f.y + dist * Math.sin(panRad);
      onUpdateFixture(f.id, { aimX, aimY });
    };

    return (
      <div className="property-panel">
        <h3>{f.fixture.name}</h3>
        {activeAtt && <div className="prop-attachment-badge">+ {activeAtt.name}</div>}

        <button
          className={`hide-toggle ${f.hidden ? 'is-hidden' : ''}`}
          onClick={() => onUpdateFixture(f.id, { hidden: !f.hidden })}
          title={f.hidden ? t('prop.fixture.showTitle', 'Show fixture again') : t('prop.fixture.hideTitle', 'Temporarily hide fixture (excluded from heatmap)')}
        >
          {f.hidden ? t('prop.fixture.show', '👁 Show') : t('prop.fixture.hide', '🚫 Temporarily hide')}
        </button>
        {f.hidden && <div className="hide-note">{t('prop.fixture.hiddenNote', 'Hidden – this fixture currently does not contribute to the heatmap. The values below show its contribution once it is shown again.')}</div>}

        {/* Fixture swap */}
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.fixture.swap', 'Swap fixture')}</span>
          <label className="prop-field">
            <span>{t('prop.fixture.type', 'Type')}</span>
            <select
              value={f.fixture.id}
              onChange={(e) => {
                const newFixture = fixtureLibrary.find((fx) => fx.id === e.target.value);
                if (newFixture) {
                  onUpdateFixture(f.id, {
                    fixture: newFixture,
                    activeAttachmentId: undefined,
                    currentBeamAngle: undefined,
                    currentColorTemp: undefined,
                  });
                }
              }}
            >
              {fixtureLibrary.map((fx) => (
                <option key={fx.id} value={fx.id}>
                  {fx.manufacturer} {fx.name} ({fx.category}, {fx.wattage}W)
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="prop-section">
          <span className="prop-section-title">{t('prop.position', 'Position')}</span>
          <label className="prop-field prop-pos-field">
            <span>X (m)</span>
            <div className="pos-nudge-group">
              <button className="nudge-btn" onClick={() => onUpdateFixture(f.id, { x: f.x - 0.5, aimX: f.aimX - 0.5 })}>◀</button>
              <input type="number" value={f.x} step={0.1}
                onChange={(e) => {
                  const dx = Number(e.target.value) - f.x;
                  onUpdateFixture(f.id, { x: f.x + dx, aimX: f.aimX + dx });
                }} />
              <button className="nudge-btn" onClick={() => onUpdateFixture(f.id, { x: f.x + 0.5, aimX: f.aimX + 0.5 })}>▶</button>
            </div>
          </label>
          <label className="prop-field prop-pos-field">
            <span>Y (m)</span>
            <div className="pos-nudge-group">
              <button className="nudge-btn" onClick={() => onUpdateFixture(f.id, { y: f.y - 0.5, aimY: f.aimY - 0.5 })}>◀</button>
              <input type="number" value={f.y} step={0.1}
                onChange={(e) => {
                  const dy = Number(e.target.value) - f.y;
                  onUpdateFixture(f.id, { y: f.y + dy, aimY: f.aimY + dy });
                }} />
              <button className="nudge-btn" onClick={() => onUpdateFixture(f.id, { y: f.y + 0.5, aimY: f.aimY + 0.5 })}>▶</button>
            </div>
          </label>
          {numField(t('prop.height', 'Height (m)'), f.mountingHeight, (v) => onUpdateFixture(f.id, { mountingHeight: v }), 0.5, 0.5, 30)}
        </div>

        <div className="prop-section">
          <span className="prop-section-title">{t('prop.orientation', 'Orientation')}</span>
          {numField(t('prop.aimX', 'Aim X (m)'), f.aimX, (v) => onUpdateFixture(f.id, { aimX: v }))}
          {numField(t('prop.aimY', 'Aim Y (m)'), f.aimY, (v) => onUpdateFixture(f.id, { aimY: v }))}
          <label className="prop-field">
            <span>Pan ({panDeg.toFixed(1)}°)</span>
            <input type="range" min={-180} max={180} step={1} value={panDeg}
              onChange={(e) => setPanTilt(Number(e.target.value), tiltDeg)} />
          </label>
          <label className="prop-field">
            <span>Tilt ({tiltDeg.toFixed(1)}°)</span>
            <input type="range" min={0} max={90} step={1} value={tiltDeg}
              onChange={(e) => setPanTilt(panDeg, Number(e.target.value))} />
          </label>
          {numField(t('prop.rotation', 'Rotation (°)'), f.bodyRotation, (v) => onUpdateFixture(f.id, { bodyRotation: v }), 5, 0, 360)}
        </div>

        <div className="prop-section">
          <span className="prop-section-title">{t('prop.light', 'Light')}</span>
          {effectiveZoomRange && (
            <label className="prop-field">
              <span>Zoom ({effectiveBeamAngle.toFixed(0)}°)</span>
              <input type="range" min={effectiveZoomRange[0]} max={effectiveZoomRange[1]} step={0.5}
                value={effectiveBeamAngle}
                onChange={(e) => onUpdateFixture(f.id, { currentBeamAngle: Number(e.target.value) })} />
            </label>
          )}
          <label className="prop-field">
            <span>Dimmer ({f.dimming}%)</span>
            <input type="range" min={0} max={100} step={1} value={f.dimming}
              onChange={(e) => onUpdateFixture(f.id, { dimming: Number(e.target.value) })} />
          </label>
          {f.fixture.colorTempRange && (
            <label className="prop-field">
              <span>CCT ({f.currentColorTemp ?? f.fixture.colorTempRange[0]} K)</span>
              <input type="range"
                min={f.fixture.colorTempRange[0]} max={f.fixture.colorTempRange[1]} step={100}
                value={f.currentColorTemp ?? f.fixture.colorTempRange[0]}
                onChange={(e) => onUpdateFixture(f.id, { currentColorTemp: Number(e.target.value) })} />
            </label>
          )}
          <div className="prop-derived lux-readout">
            {t('prop.beamDia', 'Beam Ø (50 %)')}: {(beamRadAtFloor * 2).toFixed(1)} m<br />
            {t('prop.fieldDia', 'Field Ø (10 %)')}: {(fieldRadAtFloor * 2).toFixed(1)} m<br />
            {t('prop.peak', 'Peak')}: ~{peakLux.toFixed(0)} lux
          </div>
        </div>

        {/* Beam details – beam vs field vs cutoff vs zoom, with explanation */}
        <div className="prop-section">
          <span className="prop-section-title">
            {t('prop.beamDetails', 'Beam details')}
            <button type="button" className="beam-help-toggle" onClick={() => setBeamHelp((v) => !v)} title={t('prop.whatDoesThisMean', 'What does this mean?')}>ℹ</button>
          </span>
          <div className="beam-angles">
            <div><span className="ba-dot ba-beam" /> {t('prop.beam50', 'Beam (50 %)')} <strong>{effectiveBeamAngle.toFixed(1)}°</strong></div>
            <div><span className="ba-dot ba-field" /> {t('prop.field10', 'Field (10 %)')} <strong>{effFieldAngle.toFixed(1)}°</strong></div>
            {effCutoff != null && <div><span className="ba-dot ba-cut" /> {t('prop.cutoff25', 'Cutoff (2.5 %)')} <strong>{effCutoff.toFixed(1)}°</strong></div>}
            {effectiveZoomRange
              ? <div><span className="ba-dot ba-zoom" /> {t('prop.zoomRange', 'Zoom range')} <strong>{effectiveZoomRange[0]}–{effectiveZoomRange[1]}°</strong></div>
              : <div><span className="ba-dot ba-zoom" /> Zoom <strong>{t('prop.fixed', 'fixed')}</strong></div>}
          </div>
          {beamHelp && (
            <div className="beam-help">
              <p><strong>{t('prop.beamAngle50', 'Beam angle (50 %)')}</strong> {t('prop.beamHelp1', '– the bright core: the angle at which intensity drops to 50 % of the maximum (hotspot/FWHM).')}</p>
              <p><strong>{t('prop.fieldAngle10', 'Field angle (10 %)')}</strong> – {t('prop.beamHelp2a', 'the usable edge: at 10 % of the maximum. Always')} <em>{t('prop.larger', 'larger')}</em> {t('prop.beamHelp2b', 'than the beam angle.')}</p>
              <p><strong>{t('prop.cutoff25', 'Cutoff (2.5 %)')}</strong> {t('prop.beamHelp3', '– where the light practically ends.')}</p>
              <p><strong>{t('prop.zoomRange', 'Zoom range')}</strong> {t('prop.beamHelp4a', '– on zoom fixtures the')} <em>{t('prop.adjustable', 'adjustable')}</em> {t('prop.beamHelp4b', 'beam angle (narrow ↔ wide). Beam & field describe the beam shape at the current zoom setting.')}</p>
            </div>
          )}
        </div>

        {/* Attachment selector */}
        {f.fixture.compatibleAttachments && f.fixture.compatibleAttachments.length > 0 && (
          <div className="prop-section">
            <span className="prop-section-title">{t('prop.attachment', 'Attachment')}</span>
            <label className="prop-field">
              <span>{t('prop.mounted', 'Mounted')}</span>
              <select
                value={f.activeAttachmentId ?? ''}
                onChange={(e) => onUpdateFixture(f.id, {
                  activeAttachmentId: e.target.value || undefined,
                  currentBeamAngle: undefined, // reset zoom when switching
                })}
              >
                <option value="">{t('prop.noAttachment', 'No attachment (bare)')}</option>
                {f.fixture.compatibleAttachments.map((att) => (
                  <option key={att.id} value={att.id}>
                    {att.name} ({att.type}) +{att.weightAdditional}kg
                  </option>
                ))}
              </select>
            </label>
            {activeAtt && (
              <div className="prop-derived">
                {t('prop.type', 'Type')}: {activeAtt.type}<br />
                {activeAtt.beamAngleOverride && `Beam: ${activeAtt.beamAngleOverride}°`}
                {activeAtt.zoomRangeOverride && ` (${activeAtt.zoomRangeOverride[0]}–${activeAtt.zoomRangeOverride[1]}°)`}
                {activeAtt.photometricOverride && (
                  <><br />Ref: {activeAtt.photometricOverride.lux.toLocaleString()} lux@{activeAtt.photometricOverride.distance}m</>
                )}
              </div>
            )}
          </div>
        )}

        {/* Gel Filter Selector (CTO/CTB/Frost) */}
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.filterGel', 'Filter / Gel')}</span>
          <label className="prop-field">
            <span>{t('prop.addGel', 'Add gel')}</span>
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const current = f.gelFilterIds ?? [];
                onUpdateFixture(f.id, { gelFilterIds: [...current, e.target.value] });
              }}
            >
              <option value="">{t('prop.selectPlaceholder', '– Select –')}</option>
              <optgroup label={t('prop.gelCTO', 'CTO (warm)')}>
                {gelLibrary.filter((g) => g.type === 'CTO').map((g) => (
                  <option key={g.id} value={g.id}>{g.brand} {g.code} {g.name} ({Math.round((1 - g.transmissionFactor) * 100)}% {t('prop.loss', 'loss')})</option>
                ))}
              </optgroup>
              <optgroup label={t('prop.gelCTB', 'CTB (cool)')}>
                {gelLibrary.filter((g) => g.type === 'CTB').map((g) => (
                  <option key={g.id} value={g.id}>{g.brand} {g.code} {g.name} ({Math.round((1 - g.transmissionFactor) * 100)}% {t('prop.loss', 'loss')})</option>
                ))}
              </optgroup>
              <optgroup label={t('prop.gelFrost', 'Frost / Diffusion')}>
                {gelLibrary.filter((g) => g.type === 'frost').map((g) => (
                  <option key={g.id} value={g.id}>{g.brand} {g.code} {g.name} ({Math.round((1 - g.transmissionFactor) * 100)}% {t('prop.loss', 'loss')})</option>
                ))}
              </optgroup>
            </select>
          </label>
          {f.gelFilterIds && f.gelFilterIds.length > 0 && (
            <div className="gel-stack">
              {f.gelFilterIds.map((gid, idx) => {
                const gel = gelLibrary.find((g) => g.id === gid);
                return gel ? (
                  <div key={idx} className="gel-chip">
                    <span className={`gel-type-badge gel-type-${gel.type.toLowerCase()}`}>{gel.type}</span>
                    <span>{gel.brand} {gel.code}</span>
                    <button className="gel-remove" onClick={() => {
                      const updated = [...(f.gelFilterIds ?? [])];
                      updated.splice(idx, 1);
                      onUpdateFixture(f.id, { gelFilterIds: updated.length > 0 ? updated : undefined });
                    }}>✕</button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Barn doors (Flügeltore) + where the gels sit – the two interact */}
        <div className="prop-section">
          <span className="prop-section-title">
            {t('prop.barnTitle', 'Barn doors & gel position')}
            <button type="button" className="beam-help-toggle" onClick={() => setBarnHelp((v) => !v)} title={t('prop.explainDifferences', 'Explain the differences')}>ℹ</button>
          </span>
          {(() => {
            const bd = f.barnDoors ?? { top: 0, bottom: 0, left: 0, right: 0 };
            const setBarn = (patch: Partial<{ top: number; bottom: number; left: number; right: number }>) =>
              onUpdateFixture(f.id, { barnDoors: { ...bd, ...patch } });
            const flapRow = (label: string, value: number, onCh: (v: number) => void) => (
              <label className="prop-field">
                <span>{label} ({Math.round(value * 100)} %)</span>
                <input type="range" min={0} max={1} step={0.05} value={value}
                  onChange={(e) => onCh(Number(e.target.value))} />
              </label>
            );
            return (
              <>
                {flapRow(t('prop.barn.top', 'Top'), bd.top, (v) => setBarn({ top: v }))}
                {flapRow(t('prop.barn.bottom', 'Bottom'), bd.bottom, (v) => setBarn({ bottom: v }))}
                {flapRow(t('prop.barn.left', 'Left'), bd.left, (v) => setBarn({ left: v }))}
                {flapRow(t('prop.barn.right', 'Right'), bd.right, (v) => setBarn({ right: v }))}
                <div className="reflectance-presets">
                  <button className="refl-btn" onClick={() => onUpdateFixture(f.id, { barnDoors: undefined })}>{t('prop.barn.openAll', 'Open all')}</button>
                  <button className="refl-btn" onClick={() => setBarn({ top: 0.6, bottom: 0.6 })}>{t('prop.barn.topBottomHalf', 'Top/bottom ½')}</button>
                  <button className="refl-btn" onClick={() => setBarn({ left: 0.6, right: 0.6 })}>{t('prop.barn.sidesHalf', 'Sides ½')}</button>
                </div>
                <div className="prop-derived">{t('prop.barn.note', "Cut the beam laterally (in the fixture's frame of reference, rotated with it) – feeds directly into the heatmap.")}</div>
              </>
            );
          })()}
          <div className="prop-field-sub">{t('prop.gelPlacementLabel', 'Gel position (filter frame vs. in front of the doors):')}</div>
          <div className="gel-placement-toggle">
            {([['frame', t('prop.gelInFrame', 'In frame (at lens)')], ['front', t('prop.gelInFront', 'In front of barn doors')]] as const).map(([val, lbl]) => (
              <button key={val} type="button"
                className={`gp-btn${(f.gelPlacement ?? 'frame') === val ? ' active' : ''}`}
                onClick={() => onUpdateFixture(f.id, { gelPlacement: val })}>{lbl}</button>
            ))}
          </div>
          <div className="prop-derived gel-placement-note">
            {(f.gelPlacement ?? 'frame') === 'frame'
              ? <>{t('prop.gelFrameNoteA', 'Gel in the color frame right at the lens →')} <strong>{t('prop.gelFrameNoteB', 'sharp barn-door cut')}</strong>{t('prop.gelFrameNoteC', '. But it sits at the hottest spot; strong colors (dark blue/green) burn out fastest.')}</>
              : <>{t('prop.gelFrontNoteA', 'Gel hangs in front of the doors → the lit gel becomes the new, larger source and the cut gets')} <strong>{t('prop.gelFrontNoteB', 'softer')}</strong>{t('prop.gelFrontNoteC', '. With real frost the doors become practically ineffective. In return the gel stays cooler and lasts longer.')}</>}
          </div>
          {barnHelp && (
            <div className="beam-help">
              <p><strong>{t('prop.barnHelp1Title', 'Order inside the fixture:')}</strong> {t('prop.barnHelp1', 'Lamp → lens → color frame (runner) → barn doors (with their own gel slot in front).')}</p>
              <p><strong>{t('prop.barnHelp2Title', 'Heat & lifespan:')}</strong> {t('prop.barnHelp2', 'The closer to the lens, the hotter. Gel in the frame fades/burns fastest (IR absorption); in front of the doors it runs cooler and lasts longer.')}</p>
              <p><strong>{t('prop.barnHelp3Title', 'Optics:')}</strong> {t('prop.barnHelp3a', 'Diffusion further away = softer (the lit gel becomes the source). Hung in front of the doors it cancels their cut – for a clean cut the gel belongs in the frame')} <em>{t('prop.behind', 'behind')}</em> {t('prop.barnHelp3b', 'the doors.')}</p>
            </div>
          )}
        </div>

        <div className="prop-section">
          <span className="prop-section-title">{t('prop.patchPaperwork', 'Patch / Paperwork')}</span>
          {patchConflicts.has(f.id) && <div className="patch-conflict">{t('prop.dmxConflict', '⚠ DMX address overlaps')}</div>}
          <label className="prop-field">
            <span>{t('prop.channel', 'Channel')}</span>
            <input type="number" min={0} value={f.channel ?? ''}
              onChange={(e) => onUpdateFixture(f.id, { channel: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <label className="prop-field">
            <span>{t('prop.unitNo', 'Unit no.')}</span>
            <input type="text" value={f.unitNumber ?? ''}
              onChange={(e) => onUpdateFixture(f.id, { unitNumber: e.target.value || undefined })} />
          </label>
          <label className="prop-field">
            <span>Universe</span>
            <input type="number" min={1} value={f.universe ?? ''}
              onChange={(e) => onUpdateFixture(f.id, { universe: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <label className="prop-field">
            <span>{t('prop.dmxAddr', 'DMX addr.')}</span>
            <input type="number" min={1} max={512} value={f.dmxAddress ?? ''}
              onChange={(e) => onUpdateFixture(f.id, { dmxAddress: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <div className="prop-derived">
            {t('prop.footprint', 'Footprint')}: {footprint(f) > 0 ? `${footprint(f)} DMX-Ch` : t('prop.dimmer1ch', 'Dimmer (1 ch)')}
          </div>
          <label className="prop-field">
            <span>{t('prop.purpose', 'Purpose')}</span>
            <input type="text" value={f.purpose ?? ''} placeholder={t('prop.purposePlaceholder', 'e.g. front light')}
              onChange={(e) => onUpdateFixture(f.id, { purpose: e.target.value || undefined })} />
          </label>
        </div>

        {/* Editable technical data – every value can be checked & adjusted per lamp */}
        <div className="prop-section">
          <span className="prop-section-title">
            {t('prop.techData', 'Technical data (adjustable)')}
            <button type="button" className="beam-help-toggle" onClick={() => setShowSpecs((v) => !v)} title={t('prop.collapseExpand', 'Collapse/expand')}>{showSpecs ? '▾' : '▸'}</button>
          </span>
          {showSpecs && (() => {
            const setSpec = (patch: Partial<Fixture>) => onUpdateFixture(f.id, { fixture: { ...f.fixture, ...patch } });
            // Der Beleg zum Wert, falls einer mitgespeichert wurde.
            //
            // Die Datenblatt-Extraktion liefert zu jedem Feld eine Quelle —
            // ein Zitat oder eine als „geschaetzt" gekennzeichnete
            // Begruendung — und der Dialog zeigt sie an. Gespeichert wurde
            // sie bis dahin nicht, also war spaeter eine geschaetzte
            // Streuwinkel-Angabe von einer abgelesenen nicht mehr zu
            // unterscheiden. Genau diese Zahl geht in die Lichtberechnung.
            const srcMark = (key: string, current: unknown) => {
              const entry = f.fixture.specSource?.[key];
              if (!entry) return null;
              if (isStaleSource(entry, current)) {
                return (
                  <span
                    className="spec-src spec-src-stale"
                    title={`${t('prop.src.stale', 'Source referred to')} ${entry.value}: ${entry.source}`}
                  >
                    !
                  </span>
                );
              }
              const est = isEstimate(entry);
              return (
                <span
                  className={est ? 'spec-src spec-src-est' : 'spec-src'}
                  title={`${est ? t('prop.src.estimate', 'Estimated') : t('prop.src.cited', 'Cited')}: ${entry.source}`}
                >
                  {est ? '≈' : '✓'}
                </span>
              );
            };
            const sNum = (label: string, val: number | undefined, set: (v: number) => void, step = 1, title?: string, srcKey?: string) => (
              <label className="prop-field" title={title}>
                <span>{label}{srcKey ? srcMark(srcKey, val) : null}</span>
                <input type="number" value={val ?? 0} step={step} onChange={(e) => set(Number(e.target.value))} />
              </label>
            );
            const photo = f.fixture.photometric;
            return (
              <>
                <label className="prop-field"><span>{t('prop.manufacturer', 'Manufacturer')}</span>
                  <input type="text" value={f.fixture.manufacturer} onChange={(e) => setSpec({ manufacturer: e.target.value })} /></label>
                <label className="prop-field"><span>{t('prop.fixture.type', 'Type')}</span>
                  <input type="text" value={f.fixture.name} onChange={(e) => setSpec({ name: e.target.value })} /></label>
                {sNum(t('prop.power', 'Power (W)'), f.fixture.wattage, (v) => setSpec({ wattage: v }), 1, undefined, 'wattage')}
                {sNum(t('prop.luminousFlux', 'Luminous flux (lm)'), f.fixture.lumens, (v) => setSpec({ lumens: v }), 50, t('prop.luminousFluxTitle', 'Total luminous flux (fallback when no lux reference)'), 'lumens')}
                {sNum(t('prop.beam50deg', 'Beam 50 % (°)'), f.fixture.beamAngle, (v) => setSpec({ beamAngle: v }), 0.5, t('prop.beam50Title', 'Bright core (FWHM)'), 'beamAngle')}
                {sNum(t('prop.field10deg', 'Field 10 % (°)'), f.fixture.fieldAngle, (v) => setSpec({ fieldAngle: v }), 0.5, t('prop.field10Title', 'Usable edge – drives the calculation (σ)'), 'fieldAngle')}
                {sNum(t('prop.cutoff25deg', 'Cutoff 2.5 % (°)'), f.fixture.cutoffAngle, (v) => setSpec({ cutoffAngle: v || undefined }), 0.5, t('prop.cutoffTitle', 'Where the light ends (optional)'), 'cutoffAngle')}
                <label className="prop-field"><span>{t('prop.beamShape', 'Beam shape')}</span>
                  <select value={f.fixture.beamShape} onChange={(e) => setSpec({ beamShape: e.target.value as BeamShape })}>
                    <option value="circular">{t('prop.shape.circular', 'Circular')}</option><option value="elliptical">{t('prop.shape.elliptical', 'Elliptical')}</option>
                    <option value="linear">{t('prop.shape.linear', 'Linear')}</option><option value="rectangular">{t('prop.shape.rectangular', 'Rectangular')}</option>
                  </select></label>
                {f.fixture.beamShape !== 'circular' && sNum('Beam W:H', f.fixture.beamRatioWH, (v) => setSpec({ beamRatioWH: v }), 0.1)}
                <label className="prop-field"><span>{t('prop.lensType', 'Lens type')}</span>
                  <select value={f.fixture.lensType} onChange={(e) => setSpec({ lensType: e.target.value as LensType })}>
                    <option value="fixed">{t('prop.lens.fixed', 'Fixed')}</option><option value="zoom">Zoom</option><option value="interchangeable">{t('prop.lens.interchangeable', 'Interchangeable')}</option>
                    <option value="fresnel">Fresnel</option><option value="pc">PC</option><option value="reflector">{t('prop.lens.reflector', 'Reflector')}</option>
                  </select></label>
                <label className="prop-field"><span>{t('prop.mounting', 'Mounting')}</span>
                  <select value={f.fixture.mountType} onChange={(e) => setSpec({ mountType: e.target.value as MountType })}>
                    {Object.entries(MOUNT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select></label>
                {f.fixture.zoomRange && (
                  <div className="prop-field"><span>{t('prop.zoomRangeDeg', 'Zoom range (°)')}</span>
                    <span className="zoom-range-edit">
                      <input type="number" step={0.5} value={f.fixture.zoomRange[0]} onChange={(e) => setSpec({ zoomRange: [Number(e.target.value), f.fixture.zoomRange![1]] })} />
                      <input type="number" step={0.5} value={f.fixture.zoomRange[1]} onChange={(e) => setSpec({ zoomRange: [f.fixture.zoomRange![0], Number(e.target.value)] })} />
                    </span>
                  </div>
                )}
                {sNum(t('prop.colorTemp', 'Color temp. (K, 0=RGBW)'), f.fixture.colorTemp, (v) => setSpec({ colorTemp: v }), 100)}
                {sNum(t('prop.weight', 'Weight (kg)'), f.fixture.weight, (v) => setSpec({ weight: v }), 0.1)}
                {sNum('CRI', f.fixture.cri, (v) => setSpec({ cri: v || undefined }), 1)}
                {sNum('TLCI', f.fixture.tlci, (v) => setSpec({ tlci: v || undefined }), 1)}
                {sNum(t('prop.dmxChannels', 'DMX channels'), f.fixture.dmxChannels, (v) => setSpec({ dmxChannels: v || undefined }), 1)}
                <label className="prop-field"><span>{t('prop.ipRating', 'IP rating')}</span>
                  <input type="text" value={f.fixture.ipRating ?? ''} onChange={(e) => setSpec({ ipRating: e.target.value || undefined })} /></label>
                <div className="prop-field-sub">{t('prop.photoRef', 'Photometric reference (drives the lux calculation):')}</div>
                {sNum(t('prop.refLux', 'Ref. lux'), photo?.lux, (v) => setSpec({ photometric: { ...(photo ?? { lux: v, distance: 1 }), lux: v } }), 100)}
                {sNum(t('prop.refDistance', 'Ref. distance (m)'), photo?.distance, (v) => setSpec({ photometric: { ...(photo ?? { lux: 10000, distance: v }), distance: v } }), 0.5)}
                {sNum(t('prop.refBeam', 'Ref. at beam (°)'), photo?.beamAngle, (v) => setSpec({ photometric: { ...(photo ?? { lux: 10000, distance: 1 }), beamAngle: v } }), 0.5, t('prop.refBeamTitle', 'Beam angle at which the lux reference was measured'))}
              </>
            );
          })()}
        </div>

        {/* Calculation trace – fully visible & manually verifiable */}
        <div className="prop-section">
          <span className="prop-section-title">
            {t('prop.calcTitle', 'Calculation (lux at target point)')}
            <button type="button" className="beam-help-toggle" onClick={() => setShowCalc((v) => !v)} title={t('prop.showCalc', 'Show calculation')}>{showCalc ? '▾' : '▸'}</button>
          </span>
          {showCalc && (() => {
            const b = explainLux(f, f.aimX, f.aimY);
            const fmt = (n: number, d = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: d });
            return (
              <div className="calc-trace">
                <div className="calc-formula">E = I · cos θ / d²</div>
                <table className="calc-table">
                  <tbody>
                    {b.source === 'photometric'
                      ? <tr><td>{t('prop.calc.reference', 'Reference')}</td><td>{fmt(b.refLux!)} lx @ {b.refDistance} m</td><td>→ I₀ = lx·d² = <b>{fmt(b.basePeakCd)} cd</b></td></tr>
                      : <tr><td>{t('prop.calc.source', 'Source')}</td><td>{fmt(f.fixture.lumens)} lm</td><td>→ I₀ = <b>{fmt(b.basePeakCd)} cd</b></td></tr>}
                    {b.source === 'photometric' && Math.abs(b.zoomComp - 1) > 0.001 &&
                      <tr><td>{t('prop.calc.zoomComp', 'Zoom comp.')}</td><td>×{b.zoomComp.toFixed(3)}</td><td>Field {b.fieldAngleDeg.toFixed(1)}°</td></tr>}
                    <tr><td>Peak I₀</td><td colSpan={2}><b>{fmt(b.peakCd)} cd</b></td></tr>
                    <tr><td>Dimmer</td><td>×{(b.dimming * 100).toFixed(0)} %</td><td>{b.dimming.toFixed(2)}</td></tr>
                    {b.gel < 1 && <tr><td>Gel</td><td>×{(b.gel * 100).toFixed(0)} %</td><td>{b.gel.toFixed(2)}</td></tr>}
                    <tr><td>Gauss</td><td>×{b.gauss.toFixed(3)}</td><td>θ = {b.offAxisDeg.toFixed(1)}°</td></tr>
                    {f.barnDoors && <tr><td>{t('prop.barnDoors', 'Barn doors')}</td><td>×{b.barnDoor.toFixed(3)}</td><td>{b.barnDoor > 0.999 ? t('prop.calc.notCut', 'Target point not cut') : (f.gelPlacement ?? 'frame') === 'front' ? t('prop.calc.soft', 'soft (in front of doors)') : t('prop.calc.sharp', 'sharp (in frame)')}</td></tr>}
                    <tr><td>cos θ<sub>{t('prop.calc.incidenceSub', 'inc.')}</sub></td><td>×{b.cosIncidence.toFixed(3)}</td><td>h = {f.mountingHeight} m</td></tr>
                    <tr><td>÷ d²</td><td>d = {b.distance.toFixed(2)} m</td><td>d² = {fmt(b.distance * b.distance, 1)}</td></tr>
                    <tr className="calc-result"><td>= E</td><td colSpan={2}><b>{fmt(b.lux)} lx</b></td></tr>
                  </tbody>
                </table>
                <div className="calc-note">{t('prop.calc.note', 'All values come from the adjustable data above – so every step can be recalculated. (Elliptical correction for non-round beams simplified here.)')}</div>
              </div>
            );
          })()}
        </div>

        <button className="delete-btn" onClick={() => onDelete(f.id)}>{t('prop.deleteFixture', 'Delete fixture')}</button>
      </div>
    );
  }

  if (selPerson) {
    const p = selPerson;
    return (
      <div className="property-panel">
        <h3>{t('prop.person', 'Person')}</h3>
        <div className="prop-section">
          {numField('X (m)', p.x, (v) => onUpdatePerson(p.id, { x: v }))}
          {numField('Y (m)', p.y, (v) => onUpdatePerson(p.id, { y: v }))}
          {numField(t('prop.size', 'Height (m)'), p.height, (v) => onUpdatePerson(p.id, { height: v }), 0.05, 0.5, 2.5)}
          <label className="prop-field">
            <span>{t('prop.name', 'Name')}</span>
            <input type="text" value={p.label || ''} onChange={(e) => onUpdatePerson(p.id, { label: e.target.value })} />
          </label>
        </div>
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.poseGaze', 'Pose & gaze (photo view)')}</span>
          <label className="prop-field">
            <span>{t('prop.pose', 'Pose')}</span>
            <select value={p.pose ?? 'standing'} onChange={(e) => onUpdatePerson(p.id, { pose: e.target.value as 'standing' | 'sitting' })}>
              <option value="standing">{t('prop.pose.standing', 'Standing')}</option>
              <option value="sitting">{t('prop.pose.sitting', 'Sitting')}</option>
            </select>
          </label>
          <label className="prop-field">
            <span>{t('prop.gazeDir', 'Facing')} ({Math.round(p.facing ?? 270)}°)</span>
            <input type="range" min={0} max={360} step={5} value={p.facing ?? 270}
              onChange={(e) => onUpdatePerson(p.id, { facing: Number(e.target.value) })} />
          </label>
          <div className="reflectance-presets">
            {[[t('prop.face.stage', '↑ Stage'), 90], [t('prop.face.audience', '↓ Audience'), 270], [t('prop.face.left', '← Left'), 180], [t('prop.face.right', '→ Right'), 0]].map(([lbl, v]) => (
              <button key={lbl as string} className="refl-btn" onClick={() => onUpdatePerson(p.id, { facing: v as number })}>{lbl}</button>
            ))}
          </div>
          <div className="prop-derived">{t('prop.poseNote', 'Sitting pairs well with a riser/chair underneath. Takes effect in 3D photo mode.')}</div>
        </div>
        <button className="auto-btn wide" onClick={() => onAutoThreePointForPerson(p.id)}>
          {t('prop.threePoint', '💡 Create three-point light')}
        </button>
        <button className="delete-btn" onClick={() => onDelete(p.id)}>{t('prop.deletePerson', 'Delete person')}</button>
      </div>
    );
  }

  if (selStage) {
    const se = selStage;
    if (se.points && se.points.length >= 3) {
      const xs = se.points.map((p) => p.x), ys = se.points.map((p) => p.y);
      const bw = Math.max(...xs) - Math.min(...xs), bd = Math.max(...ys) - Math.min(...ys);
      return (
        <div className="property-panel">
          <h3>{t('prop.stagePolygon', 'Stage (polygon)')}</h3>
          <div className="prop-section">
            <div className="prop-derived lux-readout">{se.points.length} {t('prop.vertices', 'vertices')} · {t('prop.bounds', 'Bounds')} {bw.toFixed(1)} × {bd.toFixed(1)} m</div>
            {numField(t('prop.height', 'Height (m)'), se.height, (v) => onUpdateStageElement(se.id, { height: v }), 0.1, 0, 5)}
            <label className="prop-field">
              <span>{t('prop.designation', 'Label')}</span>
              <input type="text" value={se.label || ''} onChange={(e) => onUpdateStageElement(se.id, { label: e.target.value })} />
            </label>
            <div className="prop-derived">{t('prop.freeStageNote', 'Freely drawn stage. Dragging moves it together with its outline.')}</div>
          </div>
          <button className="delete-btn" onClick={() => onDelete(se.id)}>{t('prop.deleteStage', 'Delete stage')}</button>
        </div>
      );
    }
    return (
      <div className="property-panel">
        <h3>{t('prop.stageElement', 'Stage element')}</h3>
        <div className="prop-section">
          {numField('X (m)', se.x, (v) => onUpdateStageElement(se.id, { x: v }))}
          {numField('Y (m)', se.y, (v) => onUpdateStageElement(se.id, { y: v }))}
          {numField(t('prop.width', 'Width (m)'), se.width, (v) => onUpdateStageElement(se.id, { width: v }), 0.5, 0.5)}
          {numField(t('prop.depth', 'Depth (m)'), se.depth, (v) => onUpdateStageElement(se.id, { depth: v }), 0.5, 0.5)}
          {numField(se.height2 != null ? t('prop.heightFront', 'Height front (m)') : t('prop.height', 'Height (m)'), se.height, (v) => onUpdateStageElement(se.id, { height: v }), 0.1, 0.1, 5)}
          <label className="prop-field">
            <span>{t('prop.heightBack', 'Height back (m)')}</span>
            <input type="number" step={0.1} min={0} value={se.height2 ?? ''} placeholder={t('prop.flatPlaceholder', '= flat')}
              onChange={(e) => onUpdateStageElement(se.id, { height2: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          {numField(t('prop.rotation', 'Rotation (°)'), se.rotation, (v) => onUpdateStageElement(se.id, { rotation: v }), 15, 0, 360)}
          <label className="prop-field">
            <span>{t('prop.designation', 'Label')}</span>
            <input type="text" value={se.label || ''} onChange={(e) => onUpdateStageElement(se.id, { label: e.target.value })} />
          </label>
          <div className="prop-derived">
            {se.height2 != null && Math.abs(se.height2 - se.height) > 0.01
              ? `${t('prop.rampLabel', 'Ramp / slope')}: ${se.height} m → ${se.height2} m (${t('prop.overDepth', 'over')} ${se.depth} m ${t('prop.depthWord', 'depth')})`
              : t('prop.rampTip', 'Tip: setting "Height back" makes a ramp/slope. Dragging corners changes the size.')}
          </div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(se.id)}>{t('prop.deleteElement', 'Delete element')}</button>
      </div>
    );
  }

  if (selTruss) {
    const tr = selTruss;
    const len = Math.hypot(tr.x2 - tr.x1, tr.y2 - tr.y1);
    return (
      <div className="property-panel">
        <h3>{t('prop.truss', 'Truss')}</h3>
        <div className="prop-section">
          <div className="prop-derived lux-readout">{t('prop.length', 'Length')}: {len.toFixed(2)} m</div>
          {numField(t('prop.startX', 'Start X (m)'), tr.x1, (v) => onUpdateTruss(tr.id, { x1: v }))}
          {numField(t('prop.startY', 'Start Y (m)'), tr.y1, (v) => onUpdateTruss(tr.id, { y1: v }))}
          {numField(t('prop.endX', 'End X (m)'), tr.x2, (v) => onUpdateTruss(tr.id, { x2: v }))}
          {numField(t('prop.endY', 'End Y (m)'), tr.y2, (v) => onUpdateTruss(tr.id, { y2: v }))}
          {numField(t('prop.trimHeight', 'Trim height (m)'), tr.height, (v) => onUpdateTruss(tr.id, { height: v }), 0.5, 0, 30)}
          {numField(t('prop.loadCapacity', 'Load capacity (kg)'), tr.capacity ?? DEFAULT_TRUSS_CAPACITY, (v) => onUpdateTruss(tr.id, { capacity: v }), 10, 0, 5000)}
          <label className="prop-field">
            <span>{t('prop.designation', 'Label')}</span>
            <input type="text" value={tr.label || ''} onChange={(e) => onUpdateTruss(tr.id, { label: e.target.value })} />
          </label>
          <div className="prop-derived">{t('prop.trussLoadNote', 'Load & utilization per truss: see equipment list → "Load per truss".')}</div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(tr.id)}>{t('prop.deleteTruss', 'Delete truss')}</button>
      </div>
    );
  }

  if (selCamera) {
    const c = selCamera;
    const hDist = Math.hypot(c.aimX - c.x, c.aimY - c.y);
    const tilt = (Math.atan2(c.height, Math.max(0.01, hDist)) * 180) / Math.PI;
    return (
      <div className="property-panel">
        <h3>{t('prop.camera', '🎥 Camera')}</h3>
        <button className="auto-btn wide" onClick={() => onLookThroughCamera(c.id)}>
          {t('prop.lookThrough', '🎬 Look through this camera')}
        </button>
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.positionGaze', 'Position & gaze')}</span>
          {numField('X (m)', c.x, (v) => onUpdateCamera(c.id, { x: v }))}
          {numField('Y (m)', c.y, (v) => onUpdateCamera(c.id, { y: v }))}
          {numField(t('prop.eyeHeight', 'Eye height (m)'), c.height, (v) => onUpdateCamera(c.id, { height: v }), 0.1, 0.1, 30)}
          {numField(t('prop.aimX', 'Aim X (m)'), c.aimX, (v) => onUpdateCamera(c.id, { aimX: v }))}
          {numField(t('prop.aimY', 'Aim Y (m)'), c.aimY, (v) => onUpdateCamera(c.id, { aimY: v }))}
          <div className="prop-derived">{t('prop.gazeReach', 'View')} {hDist.toFixed(1)} m {t('prop.far', 'far')} · {t('prop.approx', 'approx.')} {tilt.toFixed(0)}° {t('prop.downward', 'downward')}</div>
        </div>
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.lens', 'Lens')}</span>
          <label className="prop-field">
            <span>{t('prop.fov', 'Field of view')} ({c.fov}°)</span>
            <input type="range" min={10} max={110} step={1} value={c.fov}
              onChange={(e) => onUpdateCamera(c.id, { fov: Number(e.target.value) })} />
          </label>
          <div className="reflectance-presets">
            {[[t('prop.fov.tele', 'Tele 35°'), 35], [t('prop.fov.normal', 'Normal 50°'), 50], [t('prop.fov.wide', 'Wide 75°'), 75], [t('prop.fov.ultra', 'Ultra 95°'), 95]].map(([lbl, v]) => (
              <button key={lbl as string} className="refl-btn" onClick={() => onUpdateCamera(c.id, { fov: v as number })}>{lbl}</button>
            ))}
          </div>
          <label className="prop-field">
            <span>{t('prop.designation', 'Label')}</span>
            <input type="text" value={c.label || ''} onChange={(e) => onUpdateCamera(c.id, { label: e.target.value })} />
          </label>
          <div className="prop-derived">{t('prop.fovNote', 'Smaller field of view = more "tele" (tighter framing), larger = wide angle.')}</div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(c.id)}>{t('prop.deleteCamera', 'Delete camera')}</button>
      </div>
    );
  }

  if (selWall) {
    const w = selWall;
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
    const chord = len || 1;
    const m0x = (w.x1 + w.x2) / 2, m0y = (w.y1 + w.y2) / 2;
    const ppx = -(w.y2 - w.y1) / chord, ppy = (w.x2 - w.x1) / chord;
    const mh = wallMidHandle(w);
    const curveFrac = Math.max(-1, Math.min(1, ((mh.x - m0x) * ppx + (mh.y - m0y) * ppy) / (chord / 2)));
    const setCurve = (frac: number) => {
      if (Math.abs(frac) < 0.02) { onUpdateWall(w.id, { cx: undefined, cy: undefined }); return; }
      const mx = m0x + ppx * frac * (chord / 2), my = m0y + ppy * frac * (chord / 2);
      const c = curveControlForMid(w.x1, w.y1, w.x2, w.y2, mx, my);
      onUpdateWall(w.id, { cx: Math.round(c.x * 100) / 100, cy: Math.round(c.y * 100) / 100 });
    };
    return (
      <div className="property-panel">
        <h3>{t('prop.wall', 'Wall')}</h3>
        <div className="prop-section">
          <div className="prop-derived lux-readout">{t('prop.length', 'Length')}: {len.toFixed(2)} m</div>
          {numField(t('prop.height', 'Height (m)'), w.height, (v) => onUpdateWall(w.id, { height: v }), 0.1, 0.1, 20)}
          <label className="prop-field">
            <span>{t('prop.curvature', 'Curvature')}</span>
            <input type="range" min={-1} max={1} step={0.05} value={curveFrac}
              onChange={(e) => setCurve(Number(e.target.value))} />
          </label>
          <div className="prop-derived">{t('prop.curveHandleNote', 'Or drag the yellow handle on the wall to bend it.')}</div>
          <label className="prop-field">
            <span>{t('prop.reflection', 'Reflectance')} ({Math.round(w.reflectance * 100)}%)</span>
            <input type="range" min={0} max={1} step={0.05} value={w.reflectance}
              onChange={(e) => onUpdateWall(w.id, { reflectance: Number(e.target.value) })} />
          </label>
          <div className="reflectance-presets">
            {[[t('prop.refl.black', 'Black'), 0.05], [t('prop.refl.concrete', 'Concrete'), 0.35], [t('prop.refl.light', 'Light'), 0.6], [t('prop.refl.white', 'White'), 0.85]].map(([lbl, v]) => (
              <button key={lbl as string} className="refl-btn" onClick={() => onUpdateWall(w.id, { reflectance: v as number })}>{lbl}</button>
            ))}
          </div>
          <label className="prop-field">
            <span>{t('prop.surface', 'Surface')}</span>
            <select value={w.material ?? DEFAULT_WALL_MATERIAL}
              onChange={(e) => { const id = e.target.value as WallPresetId; onUpdateWall(w.id, { material: id, color: wallPreset(id).defaultColor }); }}>
              {WALL_PRESETS.map((wp) => <option key={wp.id} value={wp.id}>{wp.label}</option>)}
            </select>
          </label>
          <label className="prop-field">
            <span>{t('prop.color', 'Color')}</span>
            <input type="color" value={w.color} onChange={(e) => onUpdateWall(w.id, { color: e.target.value })} />
          </label>
          <label className="prop-field">
            <span>{t('prop.designation', 'Label')}</span>
            <input type="text" value={w.label || ''} onChange={(e) => onUpdateWall(w.id, { label: e.target.value })} />
          </label>
          <div className="prop-derived">{t('prop.wallSurfaceNote', 'Surface & color apply in render mode. Reflects light diffusely into the room (single bounce) – feeds into the heatmap.')}</div>
        </div>
        {(() => {
          const wins = w.windows ?? [];
          const newId = () => 'win-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          const setWindows = (next: WallWindow[]) => onUpdateWall(w.id, { windows: next });
          const updateWin = (id: string, patch: Partial<WallWindow>) =>
            setWindows(wins.map((x) => (x.id === id ? { ...x, ...patch } : x)));
          const removeWin = (id: string) => setWindows(wins.filter((x) => x.id !== id));
          const addWin = (glassFront: boolean) => {
            const L = wallLength(w);
            const win: WallWindow = glassFront
              ? { id: newId(), start: 0, width: Math.round(L * 100) / 100, sill: 0, top: w.height, transmittance: 0.9, tint: '#bfe3ff' }
              : { id: newId(), start: Math.max(0, Math.round((L / 2 - 0.6) * 100) / 100), width: Math.min(1.2, Math.round(L * 100) / 100), sill: 0.9, top: Math.min(2.1, w.height), transmittance: 0.85, tint: '#bfe3ff' };
            setWindows([...wins, win]);
          };
          return (
            <div className="prop-section">
              <div className="prop-section-title">{t('prop.windowsGlass', 'Windows & glass front')}</div>
              {wins.length === 0 && (
                <div className="prop-derived">{t('prop.noWindows', 'No windows. Windows are real openings – light (and the sun) falls through them into the room.')}</div>
              )}
              {wins.map((win, i) => (
                <div key={win.id} className="window-edit">
                  <div className="window-edit-head">
                    <span>{t('prop.window', 'Window')} {i + 1}</span>
                    <button className="window-del" onClick={() => removeWin(win.id)} title={t('prop.removeWindow', 'Remove window')}>✕</button>
                  </div>
                  {numField(t('prop.start', 'Start (m)'), win.start, (v) => updateWin(win.id, { start: v }), 0.1, 0)}
                  {numField(t('prop.width', 'Width (m)'), win.width, (v) => updateWin(win.id, { width: v }), 0.1, 0.1)}
                  {numField(t('prop.sill', 'Sill (m)'), win.sill, (v) => updateWin(win.id, { sill: v }), 0.1, 0, w.height)}
                  {numField(t('prop.topEdge', 'Top edge (m)'), win.top, (v) => updateWin(win.id, { top: v }), 0.1, 0, w.height)}
                  <label className="prop-field">
                    <span>{t('prop.transmittance', 'Transmittance')} ({Math.round(win.transmittance * 100)}%)</span>
                    <input type="range" min={0} max={1} step={0.05} value={win.transmittance}
                      onChange={(e) => updateWin(win.id, { transmittance: Number(e.target.value) })} />
                  </label>
                  <label className="prop-field">
                    <span>{t('prop.glassColor', 'Glass color')}</span>
                    <input type="color" value={win.tint} onChange={(e) => updateWin(win.id, { tint: e.target.value })} />
                  </label>
                </div>
              ))}
              <div className="window-actions">
                <button onClick={() => addWin(false)}>{t('prop.addWindow', '+ Window')}</button>
                <button onClick={() => addWin(true)}>{t('prop.glassFront', 'Glass front')}</button>
              </div>
            </div>
          );
        })()}
        <button className="delete-btn" onClick={() => onDelete(w.id)}>{t('prop.deleteWall', 'Delete wall')}</button>
      </div>
    );
  }

  if (selCeiling) {
    const c = selCeiling;
    return (
      <div className="property-panel">
        <h3>{t('prop.ceiling', 'Ceiling')}</h3>
        <div className="prop-section">
          <div className="prop-derived lux-readout">{c.points.length} {t('prop.vertices', 'vertices')}</div>
          {numField(t('prop.height', 'Height (m)'), c.height, (v) => onUpdateCeiling(c.id, { height: v }), 0.1, 0.5, 30)}
          <label className="prop-field">
            <span>{t('prop.reflection', 'Reflectance')} ({Math.round(c.reflectance * 100)}%)</span>
            <input type="range" min={0} max={1} step={0.05} value={c.reflectance}
              onChange={(e) => onUpdateCeiling(c.id, { reflectance: Number(e.target.value) })} />
          </label>
          <div className="reflectance-presets">
            {[[t('prop.refl.dark', 'Dark'), 0.1], [t('prop.refl.concrete', 'Concrete'), 0.4], [t('prop.refl.light', 'Light'), 0.7], [t('prop.refl.white', 'White'), 0.85]].map(([lbl, v]) => (
              <button key={lbl as string} className="refl-btn" onClick={() => onUpdateCeiling(c.id, { reflectance: v as number })}>{lbl}</button>
            ))}
          </div>
          <label className="prop-field">
            <span>{t('prop.color', 'Color')}</span>
            <input type="color" value={c.color} onChange={(e) => onUpdateCeiling(c.id, { color: e.target.value })} />
          </label>
          <div className="prop-derived">{t('prop.ceilingNote', 'Reflects downward into the room. Tip: "Ceiling" in the toolbar recreates it from the walls.')}</div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(c.id)}>{t('prop.deleteCeiling', 'Delete ceiling')}</button>
      </div>
    );
  }

  if (selShape) {
    const sh = selShape;
    const isRect = sh.type === 'rect' && sh.points.length === 2;
    const w = isRect ? Math.abs(sh.points[1].x - sh.points[0].x) : 0;
    const h = isRect ? Math.abs(sh.points[1].y - sh.points[0].y) : 0;
    return (
      <div className="property-panel">
        <h3>{isRect ? t('prop.areaRect', 'Area (rectangle)') : sh.type === 'measure' ? t('prop.measureLine', 'Measure line') : t('prop.line', 'Line')}</h3>
        <div className="prop-section">
          {isRect
            ? <div className="prop-derived lux-readout">{t('prop.sizeLabel', 'Size')}: {w.toFixed(1)} × {h.toFixed(1)} m · {(w * h).toFixed(1)} m²</div>
            : <div className="prop-derived">{sh.label}</div>}
          <p className="prop-hint">{t('prop.edgeDragNote', 'Dragging an edge moves the area.')}</p>
        </div>
        {isRect && (
          <button className="auto-btn wide" onClick={onAreaLight}>{t('prop.lightArea', '🔆 Light this area')}</button>
        )}
        <button className="delete-btn" onClick={() => onDelete(sh.id)}>{t('prop.delete', 'Delete')}</button>
      </div>
    );
  }

  // Multi-selection panel
  if (multiCount > 1) {
    return (
      <div className="property-panel">
        <h3>{multiCount} {t('prop.elementsSelected', 'elements selected')}</h3>
        {multiFixtures.length > 0 && (
          <div className="prop-section">
            <span className="prop-section-title">{multiFixtures.length} {t('prop.fixtures', 'fixture(s)')}</span>
            <ul className="multi-sel-list">
              {multiFixtures.map((f) => (
                <li key={f.id}>{f.fixture.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="prop-section">
          <span className="prop-section-title">{t('prop.actions', 'Actions')}</span>
          <p className="prop-hint">
            {t('prop.multiMove', 'Move: drag one of the selected fixtures.')}<br />
            {t('prop.multiRotate', 'Rotate: use the toolbar buttons to rotate around a person.')}
          </p>
          {multiFixtures.length > 0 && (
            <div className="reflectance-presets">
              <button className="refl-btn" onClick={() => { for (const mf of multiFixtures) onUpdateFixture(mf.id, { hidden: true }); }}>{t('prop.multiHide', '🚫 Hide')}</button>
              <button className="refl-btn" onClick={() => { for (const mf of multiFixtures) onUpdateFixture(mf.id, { hidden: undefined }); }}>{t('prop.multiShow', '👁 Show')}</button>
            </div>
          )}
        </div>
        <button className="delete-btn" onClick={() => { for (const sid of selectedIds) onDelete(sid); }}>
          {t('prop.deleteAll', 'Delete all')} {multiCount} {t('prop.deleteAllSuffix', '')}
        </button>
      </div>
    );
  }

  // No selection
  return (
    <div className="property-panel">
      <h3>{t('prop.properties', 'Properties')}</h3>
      <p className="prop-hint">
        {t('prop.noSelectionHint', 'Select a fixture, person or stage element – or just get started:')}
      </p>
      <div className="prop-section">
        <span className="prop-section-title">{t('prop.quickstart', 'Quick start')}</span>
        <ol className="quickstart-list">
          <li><span>📐</span> <strong>{t('prop.qs1strong', 'Floor plan')}</strong> {t('prop.qs1rest', 'import – JPG, PNG or PDF')}</li>
          <li><span>📏</span> <strong>{t('prop.qs2strong', 'Calibrate scale')}</strong> {t('prop.qs2rest', '– drag a segment, enter the real length')}</li>
          <li><span>💡</span> {t('prop.qs3', 'Drag fixtures from the library onto the plan')}</li>
        </ol>
      </div>
      <div className="prop-section">
        <span className="prop-section-title">{t('prop.keyboard', 'Keyboard')}</span>
        <div className="shortcut-grid">
          <kbd>{t('prop.kbd.space', 'Space')}</kbd><span>{t('prop.kbd.pan', 'Pan view')}</span>
          <kbd>{t('prop.kbd.wheel', 'Scroll wheel')}</kbd><span>{t('prop.kbd.zoom', 'Zoom')}</span>
          <kbd>Strg/⌘&nbsp;Z</kbd><span>{t('prop.kbd.undo', 'Undo')}</span>
          <kbd>{t('prop.kbd.del', 'Del')}</kbd><span>{t('prop.delete', 'Delete')}</span>
          <kbd>Esc</kbd><span>{t('prop.kbd.cancel', 'Cancel')}</span>
        </div>
      </div>
      {cursorLux !== null && (
        <div className="cursor-lux">
          Cursor: <strong>{cursorLux.toFixed(0)} lux</strong>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;
