import { connectShellSettings } from '@avplan/ui/embed'
import { useUiStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Suite-Shell-Bridge: die Shell schiebt die „Suite-Einstellungen" herein, hier
 * bilden wir jeden Schlüssel auf den passenden uiStore-Setter ab. No-op im
 * Standalone-/Desktop-Betrieb (connectShellSettings prüft window.parent).
 */
export function initShellSettings(): () => void {
  // Eingebettet gehoert der Erststart der Suite, nicht diesem Planer. Der
  // Modul-Dialog („wofuer nutzt du Cable-Planner?") legte sich sonst beim
  // ersten Oeffnen des Signal-Moduls ueber den Plan, den die Shell gerade
  // hineingeschoben hat — gemessen am gebauten Stand, nicht vermutet.
  // Die Voreinstellungen bleiben dieselben wie beim Ueberspringen.
  try {
    if (typeof window !== 'undefined' && window.parent !== window) {
      const s = useSettingsStore.getState()
      if (!s.onboardingDone) s.setOnboardingDone(true)
    }
  } catch {
    /* Standalone/Desktop — kein Shell-Parent */
  }

  return connectShellSettings((key, value) => {
    const s = useUiStore.getState()
    switch (key) {
      case 'cableColorMode':
        s.setCableColorMode(value === 'byLength' ? 'byLength' : 'manual')
        break
      case 'defaultRouting':
        if (value === 'orthogonal' || value === 'straight' || value === 'curved') s.setDefaultRouting(value)
        break
      case 'bgVariant':
        if (value === 'dots' || value === 'lines' || value === 'cross' || value === 'none') s.setBgVariant(value)
        break
      case 'hideAllCableLabels':
        s.setHideAllCableLabels(!!value)
        break
      case 'cableLabelShortForm':
        s.setCableLabelShortForm(!!value)
        break
      case 'defaultArrow':
        s.setDefaultArrow(!!value)
        break
      case 'colorPortsByType':
        s.setColorPortsByType(!!value)
        break
      case 'cableBumps':
        s.setCableBumps(!!value)
        break
      case 'language':
        s.setLanguage(value === 'en' ? 'en' : 'de')
        break
    }
  })
}
