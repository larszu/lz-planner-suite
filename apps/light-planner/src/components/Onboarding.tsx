import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WelcomeDialog,
  TourDialog,
  createOnboardingState,
  type TourStep,
} from '@avplan/onboarding-core';
import { Icon } from './Icon';
import { useUiStore } from '../store/uiStore';
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

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Willkommen im Light Planner',
    body: 'Eine kurze Tour zeigt dir, wo die wichtigsten Funktionen liegen. Grundriss importieren, Maßstab kalibrieren, Leuchten platzieren — in ein paar Minuten steht dein erster Plan.',
  },
  {
    title: 'Bibliothek links',
    body: 'Die linke Spalte enthält die Leuchten-Bibliothek — von Profilscheinwerfer bis Moving Head, per Drag & Drop oder Klick auf den Plan. Unten kannst du eigene Leuchten anlegen; die Tabs „Ebenen" und „Szenen" organisieren den Plan.',
  },
  {
    title: '2D-Plan, 3D und Render oben',
    body: 'Oben wechselst du zwischen 2D-Plan, 3D-Vorschau und Render-Modus. Daneben liegen Geräteliste, Export und Speichern.',
    hint: 'Leertaste verschiebt die Ansicht, das Mausrad zoomt.',
  },
  {
    title: 'Lager unten links',
    body: 'Der Lager-Button öffnet den projektübergreifenden Bestand (Artikel, Lagerorte, Sets, Einzelgeräte). Über Export/Import teilt er sich das Format mit Cable Planner und MultiCam Planner — ein Lager für die ganze Suite.',
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
        title="Willkommen im Light Planner"
        intro="Starte mit deinem Grundriss oder leg direkt mit einem leeren Plan los."
        onDismiss={closeWelcome}
        actions={[
          {
            id: 'floorplan',
            title: 'Grundriss importieren',
            description: 'JPG, PNG oder PDF laden, Maßstab kalibrieren, dann Leuchten platzieren.',
            icon: <Icon name="import" size={20} />,
            onSelect: () => fileInputRef.current?.click(),
          },
          {
            id: 'empty',
            title: 'Leer starten',
            description: 'Direkt auf dem Raster planen — ein Grundriss lässt sich später jederzeit hinterlegen.',
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
        steps={TOUR_STEPS}
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
