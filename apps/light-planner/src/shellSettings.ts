import { connectShellSettings } from '@avplan/ui/embed';
import { useUiStore } from './store/uiStore';

/**
 * Suite-Shell-Bridge: die Shell schiebt die „Suite-Einstellungen" herein, hier
 * bilden wir jeden Schlüssel auf den passenden uiStore-Setter ab. No-op im
 * Standalone-Betrieb (connectShellSettings prüft window.parent).
 */
export function initShellSettings(): () => void {
  return connectShellSettings((key, value) => {
    const s = useUiStore.getState();
    switch (key) {
      case 'mode': {
        // Ansicht: 2d / 3d / photo (= 3D + Foto-Render)
        const target = value === '3d' || value === 'photo' ? '3d' : '2d';
        if (s.viewMode !== target) s.setViewMode(target);
        const wantPhoto = value === 'photo';
        if (s.photoMode !== wantPhoto) s.togglePhotoMode();
        break;
      }
      case 'showHeatMap':
        if (s.showHeatMap !== !!value) s.toggleHeatMap();
        break;
      case 'showBeams':
        if (s.showBeams !== !!value) s.toggleBeams();
        break;
      case 'exposure': {
        const n = Number(value);
        if (Number.isFinite(n)) s.setExposure(n);
        break;
      }
      case 'ambience': {
        const n = Number(value);
        if (Number.isFinite(n)) s.setAmbience(n);
        break;
      }
      case 'haze': {
        const n = Number(value);
        if (Number.isFinite(n)) s.setHaze(n);
        break;
      }
      case 'snap': {
        const on = s.snapStep > 0;
        if (on !== !!value) s.toggleSnap();
        break;
      }
      case 'showFocusNotes':
        if (s.showFocusNotes !== !!value) s.toggleFocusNotes();
        break;
    }
  });
}
