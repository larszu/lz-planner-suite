import React, { useState } from 'react';
import type { Fixture, FixtureCategory } from '../types';
import { fixtureLibrary } from '../core/fixtureLibrary';
import { useTranslation } from '../i18n';
import FixtureEditor from './FixtureEditor';

interface Props {
  customFixtures: Fixture[];
  onAddCustomFixture: (f: Fixture) => void;
  fixtureToPlace: Fixture | null;
  onSelectFixtureToPlace: (f: Fixture) => void;
}

const categoryLabels = (t: (key: string, fallback: string) => string): Record<FixtureCategory, string> => ({
  profile: t('side.cat.profile', 'Profilscheinwerfer'),
  fresnel: t('side.cat.fresnel', 'Stufenlinsen'),
  par: t('side.cat.par', 'PAR-Scheinwerfer'),
  wash: t('side.cat.wash', 'LED Wash'),
  spot: t('side.cat.spot', 'LED Spot'),
  beam: t('side.cat.beam', 'Beam-Effekt'),
  'moving-wash': t('side.cat.movingWash', 'Moving Head Wash'),
  'moving-spot': t('side.cat.movingSpot', 'Moving Head Spot'),
  'moving-beam': t('side.cat.movingBeam', 'Moving Head Beam'),
  blinder: t('side.cat.blinder', 'Blinder / Strobe'),
  cyc: t('side.cat.cyc', 'Horizontleuchte'),
  flood: t('side.cat.flood', 'Fluter'),
  followspot: t('side.cat.followspot', 'Verfolger'),
  'led-panel': t('side.cat.ledPanel', 'LED-Flächenleuchten'),
  custom: t('side.cat.custom', 'Eigene'),
});

const CATEGORIES: FixtureCategory[] = [
  'profile', 'fresnel', 'par', 'wash', 'spot', 'beam',
  'moving-wash', 'moving-spot', 'moving-beam',
  'blinder', 'cyc', 'flood', 'followspot', 'led-panel', 'custom',
];

const Sidebar: React.FC<Props> = ({
  customFixtures,
  onAddCustomFixture,
  fixtureToPlace,
  onSelectFixtureToPlace,
}) => {
  const { t } = useTranslation();
  const CATEGORY_LABELS = categoryLabels(t);
  const [search, setSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState<FixtureCategory | null>(null); // all categories collapsed by default
  const [showEditor, setShowEditor] = useState(false);

  const allFixtures = [...fixtureLibrary, ...customFixtures];
  const filtered = search
    ? allFixtures.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.manufacturer.toLowerCase().includes(search.toLowerCase()),
      )
    : allFixtures;

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    fixtures: filtered.filter((f) => f.category === cat),
  })).filter((g) => g.fixtures.length > 0);

  // While searching, expand every group that has a match so results aren't
  // hidden inside collapsed categories.
  const searching = search.trim() !== '';

  const handleDragStart = (e: React.DragEvent, fixture: Fixture) => {
    e.dataTransfer.setData('application/fixture', JSON.stringify(fixture));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{t('side.libraryTitle', 'Leuchten-Bibliothek')}</h2>
        <span className="sidebar-hint">{t('side.dragHint', 'Drag & Drop oder Klick')}</span>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder={t('side.searchPlaceholder', 'Suchen…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="sidebar-list">
        {grouped.map((g) => {
          const expanded = searching || expandedCat === g.category;
          return (
          <div key={g.category} className="fixture-group">
            <button
              className="group-header"
              onClick={() => setExpandedCat(expandedCat === g.category ? null : g.category)}
            >
              <span className="group-arrow">{expanded ? '▾' : '▸'}</span>
              <span>{CATEGORY_LABELS[g.category]}</span>
              <span className="group-count">{g.fixtures.length}</span>
            </button>
            {expanded && (
              <div className="group-items">
                {g.fixtures.map((f) => (
                  <button
                    key={f.id}
                    className={`fixture-item ${fixtureToPlace?.id === f.id ? 'selected' : ''}`}
                    onClick={() => onSelectFixtureToPlace(f)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, f)}
                  >
                    <div className="fixture-item-name">{f.name}</div>
                    <div className="fixture-item-info">
                      {f.manufacturer} · {f.wattage}W · {f.beamAngle}°
                      {f.zoomRange && ` (${f.zoomRange[0]}–${f.zoomRange[1]}°)`}
                    </div>
                    <div className="fixture-item-info">
                      {f.photometric
                        ? `${f.photometric.lux.toLocaleString()} lux@${f.photometric.distance}m`
                        : `${f.lumens.toLocaleString()} lm`}
                      {' · '}
                      {f.colorTempRange
                        ? `${f.colorTempRange[0]}–${f.colorTempRange[1]}K`
                        : f.colorTemp > 0
                        ? `${f.colorTemp}K`
                        : 'RGBW'}
                      · {f.weight}kg
                    </div>
                    {f.compatibleAttachments && f.compatibleAttachments.length > 0 && (
                      <div className="fixture-item-info attachment-hint">
                        🔧 {f.compatibleAttachments.length} {t('side.attachmentsAvailable', 'Vorsätze verfügbar')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button className="add-fixture-btn" onClick={() => setShowEditor(true)}>
          {t('side.addCustomFixture', '+ Eigene Leuchte anlegen')}
        </button>
      </div>

      {showEditor && (
        <FixtureEditor
          onSave={(f) => {
            onAddCustomFixture(f);
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
