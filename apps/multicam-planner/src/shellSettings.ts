import { connectShellSettings } from '@avplan/ui/embed'
import { useStore } from './store/useStore'
import type { EditMode } from './types'

const EDIT_MODES: EditMode[] = ['all', 'floorplan', 'stage', 'objects', 'cameras']

/**
 * Suite-Shell-Bridge: die Shell schiebt die „Suite-Einstellungen" herein, hier
 * bilden wir jeden Schlüssel auf den passenden Store-Setter ab. No-op im
 * Standalone-Betrieb (connectShellSettings prüft window.parent).
 */
export function initShellSettings(): () => void {
  return connectShellSettings((key, value) => {
    const s = useStore.getState()
    switch (key) {
      case 'showAllFov':
        if (s.showAllFov !== !!value) s.toggleShowAllFov()
        break
      case 'editMode':
        if (typeof value === 'string' && (EDIT_MODES as string[]).includes(value)) s.setEditMode(value as EditMode)
        break
      case 'wallSnap':
        s.setWallSnap(!!value)
        break
      case 'showForeign':
        if (s.showForeign !== !!value) s.toggleShowForeign()
        break
      case 'pixelsPerMeter': {
        const n = Number(value)
        if (Number.isFinite(n)) s.setPixelsPerMeter(n)
        break
      }
      case 'language':
        s.setLanguage(value === 'de' ? 'de' : 'en')
        break
    }
  })
}
