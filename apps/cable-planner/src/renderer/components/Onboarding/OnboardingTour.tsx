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
    title: t('onboarding.steps.welcome.title', 'Welcome to Cable Planner'),
    body: t(
      'onboarding.steps.welcome.body',
      'A short tour shows where the main features live. You can re-open it any time from the Help menu in the top right.',
    ),
  },
  {
    title: t('onboarding.steps.file.title', 'File menu (top left)'),
    body: t(
      'onboarding.steps.file.body',
      'Use "File" to create projects, open saved files and persist changes. Project metadata is editable from "Project properties" there.',
    ),
  },
  {
    title: t('onboarding.steps.export.title', 'Export menu'),
    body: t(
      'onboarding.steps.export.body',
      'The "Export" menu hosts PDF plan export, the cable BOM and two Rentman actions: attach PDF to Rentman and send cables to Rentman.',
    ),
    hint: t(
      'onboarding.steps.export.hint',
      'The Rentman entries are only active if a Rentman project is linked.',
    ),
  },
  {
    title: t('onboarding.steps.settings.title', 'Settings → Rentman'),
    body: t(
      'onboarding.steps.settings.body',
      'Save the token, test the connection and link/switch Rentman projects from the "Rentman API" tab in Settings.',
    ),
  },
  {
    title: t('onboarding.steps.library.title', 'Library on the left'),
    body: t(
      'onboarding.steps.library.body',
      'The left column holds equipment, cable library and groups. In the Equipment tab you can switch between local and Rentman-imported devices.',
    ),
  },
  {
    title: t('onboarding.steps.properties.title', 'Properties on the right'),
    body: t(
      'onboarding.steps.properties.body',
      'Selecting an item on the canvas opens its details and editing tools on the right.',
    ),
  },
  {
    title: t('onboarding.steps.cablePlan.title', 'Cable plan & warnings'),
    body: t(
      'onboarding.steps.cablePlan.body',
      'If you import cable quantities from Rentman, Cable Planner warns when you wire more cables than available. "Send cables to Rentman" syncs back the assembled totals.',
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
        stepHeader: t('onboarding.header', 'Getting-started tour · step {step} / {total}'),
        back: t('onboarding.back', 'Back'),
        next: t('onboarding.next', 'Next'),
        finish: t('onboarding.start', "Let's go"),
        endTour: t('onboarding.end', 'End tour'),
        tip: t('onboarding.tip', 'Tip:'),
      }}
    />
  )
}
