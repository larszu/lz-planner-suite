import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WelcomeDialog,
  TourDialog,
  createOnboardingState,
  type TourStep,
} from '@avplan/onboarding-core';
import { Icon } from './Icon';
import { useUiStore } from '../store/uiStore';
import { useTranslation } from '../i18n';
import { isEmbedded } from '../hooks/useIsEmbedded';

const ACCENT = '#3b9dff'; // App.css --accent

/** Aktuelles Theme aus `data-theme` am <html> (die Shell setzt es beim Einbetten). */
function useDomTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
  );
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setTheme(el.dataset.theme === 'light' ? 'light' : 'dark');
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

/**
 * Die Tour-Schritte brauchen `t`, stehen also nicht mehr auf Modulebene.
 *
 * WAS HIER SCHIEF WAR: `lang` ging schon immer an `WelcomeDialog` und
 * `TourDialog` -- deren Rahmen (Weiter, Ueberspringen, Schliessen) kommt aus
 * `@avplan/onboarding-core` und war uebersetzt. Der INHALT war fest deutsch.
 * Ein englischer Nutzer bekam englische Knoepfe um deutschen Text.
 *
 * `i18n:check` sah das nicht: seine Heuristik liest JSX-Text und vier
 * beschriftende Attribute, nicht Zeichenketten in Objekt-Literalen
 * (`title:`, `body:`, `description:`). Gemeldet war deshalb genau EINE
 * Stelle -- das `title=`-Attribut unten -- statt dreizehn.
 */
const tourSteps = (t: (key: string, de: string) => string): TourStep[] => [
  {
    title: t('onb.tour1.title', 'Welcome to Light Planner'),
    body: t('onb.tour1.body', 'A short tour shows you where the main functions are. Import a floor plan, calibrate the scale, place fixtures – your first plan is a few minutes away.'),
  },
  {
    title: t('onb.tour2.title', 'Library on the left'),
    body: t('onb.tour2.body', 'The left column holds the fixture library – from profile spots to moving heads, by drag and drop or by clicking onto the plan. Below it you can create your own fixtures; the "Layers" and "Scenes" tabs organise the plan.'),
  },
  {
    title: t('onb.tour3.title', '2D plan, 3D and render at the top'),
    body: t('onb.tour3.body', 'At the top you switch between the 2D plan, the 3D preview and render mode. Next to them sit the instrument schedule, export and save.'),
    hint: t('onb.tour3.hint', 'Space pans the view, the mouse wheel zooms.'),
  },
  {
    title: t('onb.tour4.title', 'Inventory, bottom left'),
    body: t('onb.tour4.body', 'The inventory button opens the cross-project stock (items, locations, sets, individual units). Through export/import it shares its format with Cable Planner and MultiCam Planner – one inventory for the whole suite.'),
  },
];
interface OnboardingProps {
  onUploadFloorPlan: (file: File) => void;
}

/**
 * Erststart-Onboarding des Light Planners — Welcome-Dialog und
 * Erste-Schritte-Tour aus dem suite-weiten `@avplan/onboarding-core`
 * (gleiche Mechanik wie Cable Planner und MultiCam Planner).
 */
export default function Onboarding({ onUploadFloorPlan }: OnboardingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useDomTheme();
  const lang = useUiStore((s) => s.language);
  const { t } = useTranslation();
  // An `lang` haengen, nicht an `t`: `t` ist bei jedem Rendern eine neue
  // Funktion, die Schritte waeren sonst nie stabil.
  const steps = useMemo(() => tourSteps(t), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const onboarding = useMemo(() => createOnboardingState({ appId: 'light-planner' }), []);
  // Eingebettet stellt die Shell das Onboarding; nicht automatisch aufpoppen.
  const [welcomeOpen, setWelcomeOpen] = useState(() => !isEmbedded && !onboarding.hasSeen('welcome'));
  const [tourOpen, setTourOpen] = useState(false);

  const closeWelcome = () => {
    onboarding.markSeen('welcome');
    setWelcomeOpen(false);
    if (!onboarding.hasSeen('tour')) setTourOpen(true);
  };

  const closeTour = () => {
    onboarding.markSeen('tour');
    setTourOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFloorPlan(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    closeWelcome();
  };

  return (
    <>
      <WelcomeDialog
        open={welcomeOpen}
        lang={lang}
        theme={theme}
        accent={ACCENT}
        title={t('onb.welcome.title', 'Welcome to Light Planner')}
        intro={t('onb.welcome.intro', 'Start from your floor plan, or go straight to an empty plan.')}
        onDismiss={closeWelcome}
        actions={[
          {
            id: 'floorplan',
            title: t('onb.action.floorplan', 'Import floor plan'),
            description: t('onb.action.floorplanDesc', 'Load a JPG, PNG or PDF, calibrate the scale, then place fixtures.'),
            icon: <Icon name="import" size={20} />,
            onSelect: () => fileInputRef.current?.click(),
          },
          {
            id: 'empty',
            title: t('onb.action.empty', 'Start empty'),
            description: t('onb.action.emptyDesc', 'Plan straight on the grid – a floor plan can be added at any time later.'),
            icon: <Icon name="lamp" size={20} />,
            accent: '#ff7a45',
            onSelect: closeWelcome,
          },
        ]}
      />
      <TourDialog
        open={tourOpen}
        lang={lang}
        theme={theme}
        accent={ACCENT}
        steps={steps}
        onClose={closeTour}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
