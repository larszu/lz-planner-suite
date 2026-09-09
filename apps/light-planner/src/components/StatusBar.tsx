import React from 'react';
import Icon from './Icon';
import { useTranslation } from '../i18n';

interface Props {
  viewMode: '2d' | '3d';
  photoMode: boolean;
  cursorLux: number | null;
  selectionCount: number;
  snapStep: number;
  haze: number;
  exposure: number;
  activeSceneName: string | null;
  hiddenCount: number;
}

// Persistent bottom status bar — the live feedback (lux, selection, snap, render
// settings, active scene) that used to be scattered across the UI.
const StatusBar: React.FC<Props> = ({ viewMode, photoMode, cursorLux, selectionCount, snapStep, haze, exposure, activeSceneName, hiddenCount }) => {
  const { t } = useTranslation();
  return (
    <footer className="statusbar">
      <span className="sb-item"><Icon name={viewMode === '2d' ? 'plan2d' : (photoMode ? 'photo' : 'cube3d')} size={13} />
        {viewMode === '2d' ? t('menu.plan2d', '2D plan') : (photoMode ? t('topbar.render', 'Render') : t('topbar.mode3d', '3D'))}</span>
      {cursorLux !== null && (
        <span className="sb-item sb-lux"><Icon name="heatmap" size={13} /><b>{Math.round(cursorLux).toLocaleString('de-DE')}</b> lx</span>
      )}
      <span className="sb-item"><b>{selectionCount}</b> {t('status.selected', 'selected')}</span>
      {hiddenCount > 0 && <span className="sb-item">{hiddenCount} {t('status.muted', 'muted')}</span>}
      <span className="sb-spacer" />
      {photoMode && <span className="sb-item">{t('topbar.exposure', 'Exposure')} <b>{exposure.toFixed(2)}</b></span>}
      {photoMode && <span className="sb-item">{t('status.haze', 'Haze')} <b>{Math.round(haze * 100)}%</b></span>}
      <span className="sb-item">{t('topbar.snap', 'Snap')} <b>{snapStep > 0 ? `${snapStep} m` : t('status.off', 'off')}</b></span>
      {activeSceneName && <span className="sb-item sb-scene"><span className="sb-dot" />{t('status.scene', 'Scene')} „{activeSceneName}"</span>}
    </footer>
  );
};

export default StatusBar;
