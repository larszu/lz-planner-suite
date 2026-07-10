import { TourDialog, type TourStep } from '@avplan/onboarding-core'
import { useTranslation } from '../../lib/i18n'
import { useUiStore } from '../../store/uiStore'
import { markTourSeen } from './onboardingState'

/**
 * One-time onboarding tour shown on first launch (and re-openable from the
 * Help menu). Rendering und Mechanik kommen aus `@avplan/onboarding-core`
 * (suite-einheitlich); dieses Modul liefert nur noch die Cable-Planner-Slides,
 * die i18n-Strings und die Persistenz.
 *
 * Persistence helpers (`hasSeenTour` / `markTourSeen`) live in
 * `./onboardingState` so this module only exports the component.
 */

const stepsForLang = (
  t: (key: string, fallback?: string) => string,
): TourStep[] => [
  {
    title: t('onboarding.steps.welcome.title', 'Willkommen im Cable Planner'),
    body: t(
      'onboarding.steps.welcome.body',
      'Eine kurze Tour zeigt dir, wo du die wichtigsten Funktionen findest. Du kannst sie jederzeit über das Hilfe-Menü oben rechts wieder öffnen.',
    ),
  },
  {
    title: t('onboarding.steps.file.title', 'Datei-Menü oben links'),
    body: t(
      'onboarding.steps.file.body',
      'Über „Datei" legst du Projekte an, öffnest gespeicherte Dateien und sicherst Änderungen. Die Projekt-Metadaten bearbeitest du dort über „Projekt-Eigenschaften".',
    ),
  },
  {
    title: t('onboarding.steps.export.title', 'Export-Menü'),
    body: t(
      'onboarding.steps.export.body',
      'Im „Export"-Menü findest du den PDF-Plan-Export, die Kabel-Stückliste sowie zwei Rentman-Aktionen: PDF an Rentman anhängen und Kabel an Rentman senden.',
    ),
    hint: t(
      'onboarding.steps.export.hint',
      'Die Rentman-Einträge sind nur aktiv, wenn ein Rentman-Projekt verknüpft ist.',
    ),
  },
  {
    title: t('onboarding.steps.settings.title', 'Einstellungen → Rentman'),
    body: t(
      'onboarding.steps.settings.body',
      'Token speichern, Verbindung testen und Rentman-Projekt verknüpfen oder wechseln machst du in den Einstellungen im Tab „Rentman API".',
    ),
  },
  {
    title: t('onboarding.steps.library.title', 'Bibliothek links'),
    body: t(
      'onboarding.steps.library.body',
      'Die linke Spalte enthält Equipment, Kabel-Library und Gruppen. Im Equipment-Tab kannst du zwischen lokalen und aus Rentman importierten Geräten umschalten.',
    ),
  },
  {
    title: t('onboarding.steps.properties.title', 'Eigenschaften rechts'),
    body: t(
      'onboarding.steps.properties.body',
      'Wenn du ein Element auf der Canvas auswählst, erscheinen rechts die Details und Werkzeuge zur Bearbeitung.',
    ),
  },
  {
    title: t('onboarding.steps.cablePlan.title', 'Kabel-Plan & Warnung'),
    body: t(
      'onboarding.steps.cablePlan.body',
      'Importierst du Kabelmengen aus Rentman, warnt der Cable Planner beim Verkabeln, sobald du mehr Kabel verbaust als vorhanden sind. Über „Kabel an Rentman senden" gleichst du fertige Mengen zurück.',
    ),
  },
]

interface OnboardingTourProps {
  open: boolean
  onClose: () => void
}

export const OnboardingTour = ({ open, onClose }: OnboardingTourProps) => {
  const t = useTranslation()
  const theme = useUiStore((state) => state.canvasTheme)

  const finish = () => {
    markTourSeen()
    onClose()
  }

  return (
    <TourDialog
      open={open}
      steps={stepsForLang(t)}
      onClose={finish}
      theme={theme}
      accent="#ea580c"
      strings={{
        stepHeader: t('onboarding.header', 'Erste-Schritte-Tour · Schritt {step} / {total}'),
        back: t('onboarding.back', 'Zurück'),
        next: t('onboarding.next', 'Weiter'),
        finish: t('onboarding.start', "Los geht's"),
        endTour: t('onboarding.end', 'Tour beenden'),
        tip: t('onboarding.tip', 'Tipp:'),
      }}
    />
  )
}
