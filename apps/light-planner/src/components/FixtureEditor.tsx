import React, { useState } from 'react';
import type { Fixture, FixtureCategory, BeamShape, LensType, MountType, DmxMode, DmxModeOrigin } from '../types';
import { extractFixtureSpecs, AI_MODELS, type ExtractedFields, type VerificationItem } from '../utils/aiExtract';
import { useHost } from '../integration/hostContext';
import { useTranslation } from '../i18n';

interface Props {
  onSave: (fixture: Fixture) => void;
  onCancel: () => void;
  initial?: Fixture;
}

const FixtureEditor: React.FC<Props> = ({ onSave, onCancel, initial }) => {
  const host = useHost();
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  const [category, setCategory] = useState<FixtureCategory>(initial?.category ?? 'custom');
  const [wattage, setWattage] = useState(initial?.wattage ?? 100);
  const [lumens, setLumens] = useState(initial?.lumens ?? 10000);
  const [beamAngle, setBeamAngle] = useState(initial?.beamAngle ?? 26);
  const [fieldAngle, setFieldAngle] = useState(initial?.fieldAngle ?? 32);
  const [cutoffAngle, setCutoffAngle] = useState(initial?.cutoffAngle ?? 0);
  const [beamShape, setBeamShape] = useState<BeamShape>(initial?.beamShape ?? 'circular');
  const [beamRatioWH, setBeamRatioWH] = useState(initial?.beamRatioWH ?? 1);
  const [lensType, setLensType] = useState<LensType>(initial?.lensType ?? 'pc');
  const [colorTemp, setColorTemp] = useState(initial?.colorTemp ?? 3200);
  const [weight, setWeight] = useState(initial?.weight ?? 5);
  const [hasZoom, setHasZoom] = useState(!!initial?.zoomRange);
  const [zoomMin, setZoomMin] = useState(initial?.zoomRange?.[0] ?? 15);
  const [zoomMax, setZoomMax] = useState(initial?.zoomRange?.[1] ?? 30);
  const [cri, setCri] = useState(initial?.cri ?? 90);
  const [ipRating, setIpRating] = useState(initial?.ipRating ?? '');
  const [dmxChannels, setDmxChannels] = useState(initial?.dmxChannels ?? 1);
  // Die Betriebsmodi. Leer heisst: ueber die Modi dieses Geraets ist nichts
  // erklaert — dann gilt die Kanalzahl darueber als EIN Modus geschaetzter
  // Herkunft (`modesOf()` in `core/patch.ts`). Ein Moving Head gehoert hier
  // hinein, denn seine Kanalzahl ist keine Eigenschaft des Geraets, sondern
  // eine seiner Betriebsart.
  const [dmxModes, setDmxModes] = useState<DmxMode[]>(initial?.dmxModes ?? []);
  // New fields
  const [mountType, setMountType] = useState<MountType>(initial?.mountType ?? 'clamp');
  const [hasColorTempRange, setHasColorTempRange] = useState(!!initial?.colorTempRange);
  const [colorTempMin, setColorTempMin] = useState(initial?.colorTempRange?.[0] ?? 2700);
  const [colorTempMax, setColorTempMax] = useState(initial?.colorTempRange?.[1] ?? 6500);
  const [hasPhotometric, setHasPhotometric] = useState(!!initial?.photometric);
  const [photoLux, setPhotoLux] = useState(initial?.photometric?.lux ?? 10000);
  const [photoDistance, setPhotoDistance] = useState(initial?.photometric?.distance ?? 1);
  const [tlci, setTlci] = useState(initial?.tlci ?? 0);

  // ── KI-Datenblatt-Extraktion ──
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [aiModel, setAiModel] = useState<string>(AI_MODELS[0].id);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiVerification, setAiVerification] = useState<VerificationItem[] | null>(null);

  const applyExtracted = (f: ExtractedFields) => {
    if (f.name != null) setName(f.name);
    if (f.manufacturer != null) setManufacturer(f.manufacturer);
    if (f.category != null) setCategory(f.category as FixtureCategory);
    if (f.wattage != null) setWattage(f.wattage);
    if (f.lumens != null) setLumens(f.lumens);
    if (f.beamAngle != null) setBeamAngle(f.beamAngle);
    if (f.fieldAngle != null) setFieldAngle(f.fieldAngle);
    if (f.cutoffAngle != null) setCutoffAngle(f.cutoffAngle);
    if (f.beamShape != null) setBeamShape(f.beamShape as BeamShape);
    if (f.lensType != null) setLensType(f.lensType as LensType);
    if (f.hasZoom != null) setHasZoom(f.hasZoom);
    if (f.zoomMin != null) setZoomMin(f.zoomMin);
    if (f.zoomMax != null) setZoomMax(f.zoomMax);
    if (f.hasColorTempRange != null) setHasColorTempRange(f.hasColorTempRange);
    if (f.colorTemp != null) setColorTemp(f.colorTemp);
    if (f.colorTempMin != null) setColorTempMin(f.colorTempMin);
    if (f.colorTempMax != null) setColorTempMax(f.colorTempMax);
    if (f.cri != null) setCri(f.cri);
    if (f.tlci != null) setTlci(f.tlci);
    if (f.weight != null) setWeight(f.weight);
    if (f.mountType != null) setMountType(f.mountType as MountType);
    if (f.ipRating != null) setIpRating(f.ipRating);
    if (f.dmxChannels != null) setDmxChannels(f.dmxChannels);
    if (f.hasPhotometric != null) setHasPhotometric(f.hasPhotometric);
    if (f.photoLux != null) setPhotoLux(f.photoLux);
    if (f.photoDistance != null) setPhotoDistance(f.photoDistance);
  };

  const handleExtract = async () => {
    if (!aiText.trim()) { setAiError(t('dlg.fx.ai.needText', 'Please paste datasheet text or a model name.')); return; }
    if (!aiKey.trim()) { setAiError(t('dlg.fx.ai.needKey', 'Please enter an Anthropic API key.')); return; }
    setAiLoading(true); setAiError(null);
    try {
      // Use the host's AI service when it provides one (e.g. Cable-Planner's
      // multi-provider aiSuggestions + keychain); else the direct browser call.
      const extract = host.extractDatasheet ?? extractFixtureSpecs;
      const { fields, verification } = await extract(aiText, { apiKey: aiKey.trim(), model: aiModel });
      applyExtracted(fields);
      setAiVerification(verification);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const fixture: Fixture = {
      id: initial?.id ?? 'custom-' + Date.now(),
      name: name.trim(),
      manufacturer: manufacturer.trim() || 'Custom',
      category,
      wattage,
      lumens,
      beamAngle,
      fieldAngle: fieldAngle || beamAngle + 6,
      cutoffAngle: cutoffAngle || undefined,
      beamShape,
      beamRatioWH,
      lensType,
      colorTemp: hasColorTempRange ? 0 : colorTemp,
      colorTempRange: hasColorTempRange ? [colorTempMin, colorTempMax] : undefined,
      weight,
      mountType,
      zoomRange: hasZoom ? [zoomMin, zoomMax] : undefined,
      cri,
      tlci: tlci || undefined,
      ipRating: ipRating || undefined,
      dmxChannels: dmxChannels || undefined,
      dmxModes: dmxModes.length > 0 ? dmxModes : undefined,
      photometric: hasPhotometric ? { lux: photoLux, distance: photoDistance, beamAngle, colorTemp: colorTemp || 5600 } : undefined,
      // Den Beleg mitnehmen. Er stand bis hierher in `aiVerification`, wurde
      // im Dialog angezeigt („bitte pruefen") — und beim Speichern verworfen.
      // Danach war eine geschaetzte Zahl von einer abgelesenen nicht mehr zu
      // unterscheiden, obwohl das Modell den Unterschied geliefert hatte.
      specSource: aiVerification?.length
        ? Object.fromEntries(
            aiVerification.map((v) => [v.field, { value: v.value, source: v.source }]),
          )
        : initial?.specSource,
    };
    onSave(fixture);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal fixture-editor-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? t('dlg.fx.editTitle', 'Edit fixture') : t('dlg.fx.newTitle', 'Create custom fixture')}</h3>

        <div className="ai-assist">
          <button type="button" className={`ai-toggle ${aiOpen ? 'open' : ''}`} onClick={() => setAiOpen((o) => !o)}>
            ✨ {t('dlg.fx.ai.toggle', 'AI assistant – pull data from a datasheet')} {aiOpen ? '▾' : '▸'}
          </button>
          {aiOpen && (
            <div className="ai-body">
              <textarea
                className="ai-textarea"
                rows={5}
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder={t('dlg.fx.ai.textPlaceholder', 'Paste datasheet text here – or just name the model, e.g. Elation KL Profile FC …')}
              />
              <div className="ai-controls">
                <input
                  className="ai-key"
                  type="password"
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder={t('dlg.fx.ai.keyPlaceholder', 'Anthropic API key (sk-ant-…)')}
                />
                <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                  {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <button type="button" className="primary" disabled={aiLoading} onClick={handleExtract}>
                  {aiLoading ? t('dlg.fx.ai.extracting', 'Extracting…') : t('dlg.fx.ai.extract', 'Extract data')}
                </button>
              </div>
              <div className="ai-note">
                {t('dlg.fx.ai.note', 'The key is kept in memory for this session only and is not stored. It goes directly to api.anthropic.com. Please verify all applied values below.')}
              </div>
              {aiError && <div className="ai-error">⚠ {aiError}</div>}
              {aiVerification && (
                <div className="ai-verify">
                  <div className="ai-verify-head">✓ {t('dlg.fx.ai.verifyHead', 'Applied – please verify')} ({aiVerification.length} {t('dlg.fx.ai.fields', 'fields')}):</div>
                  <table className="ai-verify-table">
                    <thead><tr><th>{t('dlg.fx.ai.colField', 'Field')}</th><th>{t('dlg.fx.ai.colValue', 'Value')}</th><th>{t('dlg.fx.ai.colSource', 'Source / rationale')}</th></tr></thead>
                    <tbody>
                      {aiVerification.map((v, i) => (
                        <tr key={i} className={/gesch/i.test(v.source) ? 'ai-est' : ''}>
                          <td>{v.field}</td><td>{v.value}</td><td>{v.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="editor-grid">
          <label>{t('dlg.fx.name', 'Name*')}<input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('dlg.fx.namePlaceholder', 'e.g. PAR 64 CP62')} /></label>
          <label>{t('dlg.fx.manufacturer', 'Manufacturer')}<input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder={t('dlg.fx.manufacturerPlaceholder', 'e.g. Generic')} /></label>

          <label>{t('dlg.fx.category', 'Category')}
            <select value={category} onChange={(e) => setCategory(e.target.value as FixtureCategory)}>
              <option value="profile">{t('dlg.fx.cat.profile', 'Profile spot')}</option>
              <option value="fresnel">{t('dlg.fx.cat.fresnel', 'Fresnel')}</option>
              <option value="par">PAR</option>
              <option value="wash">LED Wash</option>
              <option value="spot">LED Spot</option>
              <option value="beam">Beam</option>
              <option value="moving-wash">Moving Head Wash</option>
              <option value="moving-spot">Moving Head Spot</option>
              <option value="moving-beam">Moving Head Beam</option>
              <option value="blinder">Blinder</option>
              <option value="cyc">{t('dlg.fx.cat.cyc', 'Cyclorama light')}</option>
              <option value="flood">{t('dlg.fx.cat.flood', 'Flood')}</option>
              <option value="followspot">{t('dlg.fx.cat.followspot', 'Followspot')}</option>
              <option value="led-panel">{t('dlg.fx.cat.ledPanel', 'LED panel')}</option>
              <option value="custom">{t('dlg.fx.cat.custom', 'Custom')}</option>
            </select>
          </label>

          <label>{t('dlg.fx.mount', 'Mount')}
            <select value={mountType} onChange={(e) => setMountType(e.target.value as MountType)}>
              <option value="bowens">Bowens S-Mount</option>
              <option value="prolock-bowens">ProLock Bowens</option>
              <option value="junior">Junior Pin (1-1/8")</option>
              <option value="baby">Baby Pin (5/8")</option>
              <option value="clamp">{t('dlg.fx.mount.clamp', 'C-clamp')}</option>
              <option value="yoke">{t('dlg.fx.mount.yoke', 'Integrated yoke')}</option>
              <option value="none">{t('dlg.fx.mount.none', 'No mount')}</option>
            </select>
          </label>

          <label>{t('dlg.fx.power', 'Power (W)')}<input type="number" value={wattage} onChange={(e) => setWattage(Number(e.target.value))} min={1} /></label>
          <label>{t('dlg.fx.lumens', 'Luminous flux (lm)')}<input type="number" value={lumens} onChange={(e) => setLumens(Number(e.target.value))} min={1} /></label>

          <label title={t('dlg.fx.beamTip', 'Bright core: angle at which intensity falls to 50 % of maximum (FWHM).')}>{t('dlg.fx.beam', 'Beam angle 50 % (°)')}<input type="number" value={beamAngle} step={0.5} onChange={(e) => setBeamAngle(Number(e.target.value))} min={1} max={180} /></label>
          <label title={t('dlg.fx.fieldTip', 'Usable edge: at 10 % of maximum. Always wider than the beam angle.')}>{t('dlg.fx.field', 'Field angle 10 % (°)')}<input type="number" value={fieldAngle} step={0.5} onChange={(e) => setFieldAngle(Number(e.target.value))} min={1} max={180} /></label>
          <label title={t('dlg.fx.cutoffTip', 'Where the light practically ends (2.5 %). Optional – 0 = not specified.')}>{t('dlg.fx.cutoff', 'Cutoff 2.5 % (°)')}<input type="number" value={cutoffAngle} step={0.5} onChange={(e) => setCutoffAngle(Number(e.target.value))} min={0} max={180} /></label>
          <div className="editor-note">{t('dlg.fx.angleNote1', 'Beam (50 %) < Field (10 %) < Cutoff (2.5 %). The')} <b>Zoom</b> {t('dlg.fx.angleNote2', '(below) is the adjustable beam-angle range – different from Beam/Field.')}</div>

          <label>{t('dlg.fx.beamShape', 'Beam shape')}
            <select value={beamShape} onChange={(e) => setBeamShape(e.target.value as BeamShape)}>
              <option value="circular">{t('dlg.fx.shape.circular', 'Circular')}</option>
              <option value="elliptical">{t('dlg.fx.shape.elliptical', 'Elliptical')}</option>
              <option value="linear">{t('dlg.fx.shape.linear', 'Linear')}</option>
              <option value="rectangular">{t('dlg.fx.shape.rectangular', 'Rectangular')}</option>
            </select>
          </label>

          {beamShape !== 'circular' && (
            <label>{t('dlg.fx.beamRatio', 'Beam W:H ratio')}<input type="number" value={beamRatioWH} step={0.1} onChange={(e) => setBeamRatioWH(Number(e.target.value))} min={0.1} max={10} /></label>
          )}

          <label>{t('dlg.fx.lens', 'Lens type')}
            <select value={lensType} onChange={(e) => setLensType(e.target.value as LensType)}>
              <option value="fixed">{t('dlg.fx.lens.fixed', 'Fixed')}</option>
              <option value="zoom">Zoom</option>
              <option value="interchangeable">{t('dlg.fx.lens.interchangeable', 'Interchangeable')}</option>
              <option value="fresnel">Fresnel</option>
              <option value="pc">Plano-Convex (PC)</option>
              <option value="reflector">{t('dlg.fx.lens.reflector', 'Reflector')}</option>
            </select>
          </label>

          <label className="checkbox-field">
            <input type="checkbox" checked={hasColorTempRange} onChange={(e) => setHasColorTempRange(e.target.checked)} /> {t('dlg.fx.cctRange', 'Colour-temperature range (bi-color)')}
          </label>
          {hasColorTempRange ? (
            <>
              <label>{t('dlg.fx.cctMin', 'CCT min (K)')}<input type="number" value={colorTempMin} onChange={(e) => setColorTempMin(Number(e.target.value))} min={1800} max={10000} /></label>
              <label>{t('dlg.fx.cctMax', 'CCT max (K)')}<input type="number" value={colorTempMax} onChange={(e) => setColorTempMax(Number(e.target.value))} min={1800} max={10000} /></label>
            </>
          ) : (
            <label>{t('dlg.fx.cct', 'Colour temperature (K, 0=RGBW)')}<input type="number" value={colorTemp} onChange={(e) => setColorTemp(Number(e.target.value))} min={0} /></label>
          )}

          <label>{t('dlg.fx.weight', 'Weight (kg)')}<input type="number" value={weight} step={0.1} onChange={(e) => setWeight(Number(e.target.value))} min={0} /></label>
          <label>CRI<input type="number" value={cri} onChange={(e) => setCri(Number(e.target.value))} min={0} max={100} /></label>
          <label>TLCI<input type="number" value={tlci} onChange={(e) => setTlci(Number(e.target.value))} min={0} max={100} /></label>
          <label>{t('dlg.fx.ip', 'IP rating')}<input value={ipRating} onChange={(e) => setIpRating(e.target.value)} placeholder={t('dlg.fx.ipPlaceholder', 'e.g. 65')} /></label>
          <label>{t('dlg.fx.dmxChannels', 'DMX channels')}<input type="number" value={dmxChannels} onChange={(e) => setDmxChannels(Number(e.target.value))} min={0} /></label>

          {/* ── Betriebsmodi ───────────────────────────────────────────────
              Die Zahl darueber ist der Fussabdruck OHNE Modusbegriff. Fuer
              alles, was mehr als eine Betriebsart hat — jeder Moving Head,
              jede Pixel-Leuchte — steht sie hier drin, je Modus eine Zeile.
              Zu jeder Kanalzahl gehoert, WOHER sie kommt: eine Zahl ohne
              Quelle ist von einer abgelesenen nicht zu unterscheiden, und
              eine falsche verschiebt jede Folgeadresse im Rig. */}
          <div className="fx-modes">
            <div className="fx-modes-head">
              <span>{t('fx.dmxModes', 'DMX modes')}</span>
              <button
                type="button"
                onClick={() => setDmxModes([...dmxModes, {
                  id: `m${dmxModes.length + 1}`,
                  name: `Mode ${dmxModes.length + 1}`,
                  channels: dmxChannels || 1,
                  origin: 'manual',
                }])}
              >{t('fx.dmxModeAdd', '+ Mode')}</button>
            </div>
            {dmxModes.length === 0 && (
              <p className="fx-modes-hint">
                {t('fx.dmxModesEmpty', 'No mode stated: the channel count above then counts as a single mode of unrecorded origin. Enter one line per operating mode for anything that has more than one.')}
              </p>
            )}
            {dmxModes.map((m, i) => (
              <div key={m.id} className="fx-mode-row">
                <input
                  value={m.name}
                  onChange={(e) => setDmxModes(dmxModes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder={t('fx.dmxModeNamePh', 'Mode 1')}
                />
                <input
                  type="number" min={1} max={512} value={m.channels}
                  title={t('fx.dmxModeChannels', 'Channels in this mode')}
                  onChange={(e) => setDmxModes(dmxModes.map((x, j) => (j === i ? { ...x, channels: Math.max(1, Math.round(Number(e.target.value) || 1)) } : x)))}
                />
                <select
                  value={m.origin}
                  title={t('fx.dmxModeOrigin', 'Where this channel count comes from')}
                  onChange={(e) => setDmxModes(dmxModes.map((x, j) => (j === i ? { ...x, origin: e.target.value as DmxModeOrigin } : x)))}
                >
                  <option value="manual">{t('fx.originManual', 'Manual')}</option>
                  <option value="gdtf">{t('fx.originGdtf', 'GDTF file')}</option>
                  <option value="console">{t('fx.originConsole', 'Console patch')}</option>
                  <option value="device">{t('fx.originDevice', 'Read off the device')}</option>
                  <option value="estimated">{t('fx.originEstimated', 'Estimate')}</option>
                </select>
                <input
                  value={m.evidence ?? ''}
                  placeholder={t('fx.dmxModeEvidencePh', 'Source: page, file, export')}
                  onChange={(e) => setDmxModes(dmxModes.map((x, j) => (j === i ? { ...x, evidence: e.target.value || undefined } : x)))}
                />
                <button type="button" onClick={() => setDmxModes(dmxModes.filter((_, j) => j !== i))}>x</button>
              </div>
            ))}
          </div>

          <label className="checkbox-field">
            <input type="checkbox" checked={hasZoom} onChange={(e) => setHasZoom(e.target.checked)} /> Zoom
          </label>
          {hasZoom && (
            <>
              <label>{t('dlg.fx.zoomMin', 'Zoom min (°)')}<input type="number" value={zoomMin} step={0.5} onChange={(e) => setZoomMin(Number(e.target.value))} min={1} /></label>
              <label>{t('dlg.fx.zoomMax', 'Zoom max (°)')}<input type="number" value={zoomMax} step={0.5} onChange={(e) => setZoomMax(Number(e.target.value))} min={1} /></label>
            </>
          )}

          <label className="checkbox-field">
            <input type="checkbox" checked={hasPhotometric} onChange={(e) => setHasPhotometric(e.target.checked)} /> {t('dlg.fx.photoRef', 'Photometric reference')}
          </label>
          {hasPhotometric && (
            <>
              <label>{t('dlg.fx.photoLux', 'Lux (measured)')}<input type="number" value={photoLux} onChange={(e) => setPhotoLux(Number(e.target.value))} min={1} /></label>
              <label>{t('dlg.fx.photoDist', 'Measurement distance (m)')}<input type="number" value={photoDistance} step={0.5} onChange={(e) => setPhotoDistance(Number(e.target.value))} min={0.5} /></label>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel}>{t('dlg.fx.cancel', 'Cancel')}</button>
          <button className="primary" onClick={handleSave} disabled={!name.trim()}>{t('dlg.fx.save', 'Save')}</button>
        </div>
      </div>
    </div>
  );
};

export default FixtureEditor;
