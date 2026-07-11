import { useCallback, useMemo, useRef, useState } from 'react';
import { FiUpload, FiPlus, FiX, FiArrowRight, FiCheck } from 'react-icons/fi';
import { WelcomeDialog, createOnboardingState } from '@avplan/onboarding-core';
import { useStore } from '../../store/useStore';
import type { EditMode } from '../../types';
import { useTranslation } from '../../i18n';
import { useDomTheme } from '../../hooks/useDomTheme';
import { isEmbedded } from '../../hooks/useIsEmbedded';

type TFn = (key: string, en: string) => string;

const LEGACY_SEEN_KEY = 'mcplan-assistant-seen';

// Ordered steps of the "New Plan" wizard (issue #43): draw the floor plan, then
// the stages, then objects/persons, and finally the cameras.
const getWizardSteps = (t: TFn): { mode: EditMode; title: string; hint: string }[] => [
  { mode: 'floorplan', title: t('header.wizard.step1.title', '1 · Floor Plan'), hint: t('header.wizard.step1.hint', 'Upload a plan image/PDF, set the scale, and draw the walls.') },
  { mode: 'stage', title: t('header.wizard.step2.title', '2 · Stages'), hint: t('header.wizard.step2.hint', 'Add and size the stages. Everything else is locked for now.') },
  { mode: 'objects', title: t('header.wizard.step3.title', '3 · Objects & Persons'), hint: t('header.wizard.step3.hint', 'Place performers, instruments and props on the stage.') },
  { mode: 'cameras', title: t('header.wizard.step4.title', '4 · Cameras'), hint: t('header.wizard.step4.hint', 'Position the cameras and aim them at the action.') },
];

export default function StartupAssistant() {
  const { t } = useTranslation();
  const WIZARD_STEPS = getWizardSteps(t);
  const { loadProject, setEditMode } = useStore();
  const language = useStore((s) => s.language);
  const theme = useDomTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Bewusst sessionStorage: der Assistent darf pro Sitzung einmal erscheinen
  // (nicht nur einmal pro Installation). Dialog-UI und Seen-State kommen aus
  // dem suite-weiten @avplan/onboarding-core.
  const onboarding = useMemo(
    () =>
      createOnboardingState({
        appId: 'multicam-planner',
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        migrateFrom: [{ key: LEGACY_SEEN_KEY, flag: 'welcome' }],
      }),
    [],
  );
  // Embedded in the suite shell, the sessionStorage-backed assistant would
  // re-open on every shell reload — suppress auto-open there and start 'done'.
  const [phase, setPhase] = useState<'choose' | 'wizard' | 'done'>(
    isEmbedded || onboarding.hasSeen('welcome') ? 'done' : 'choose',
  );
  const [stepIndex, setStepIndex] = useState(0);

  const markSeen = useCallback(() => onboarding.markSeen('welcome'), [onboarding]);

  const dismiss = useCallback(() => { markSeen(); setPhase('done'); }, [markSeen]);

  const startWizard = useCallback(() => {
    markSeen();
    setStepIndex(0);
    setEditMode(WIZARD_STEPS[0].mode);
    setPhase('wizard');
  }, [markSeen, setEditMode, WIZARD_STEPS]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await loadProject(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditMode('cameras'); // an existing plan jumps straight to camera editing
    dismiss();
  }, [loadProject, setEditMode, dismiss]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= WIZARD_STEPS.length) {
        setEditMode('all');
        setPhase('done');
        return i;
      }
      setEditMode(WIZARD_STEPS[next].mode);
      return next;
    });
  }, [setEditMode, WIZARD_STEPS]);

  const finishWizard = useCallback(() => { setEditMode('all'); setPhase('done'); }, [setEditMode]);

  if (phase === 'done') return null;

  if (phase === 'wizard') {
    const step = WIZARD_STEPS[stepIndex];
    const isLast = stepIndex === WIZARD_STEPS.length - 1;
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[420px] max-w-[92vw] rounded-xl border border-bc-border bg-bc-panel shadow-2xl px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-bc-yellow text-xs font-semibold">{step.title}</div>
            <div className="text-gray-300 text-xs mt-1 leading-relaxed">{step.hint}</div>
          </div>
          <button onClick={finishWizard} className="p-1 text-gray-500 hover:text-white" title={t('header.wizard.exit', 'Exit assistant (unlock everything)')}>
            <FiX size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {WIZARD_STEPS.map((s, i) => (
              <span key={s.mode} className={`h-1.5 w-6 rounded-full ${i <= stepIndex ? 'bg-bc-yellow' : 'bg-bc-border'}`} />
            ))}
          </div>
          <button
            onClick={isLast ? finishWizard : nextStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bc-accent text-white text-xs font-medium hover:bg-bc-accent/80"
          >
            {isLast ? <><FiCheck size={13} /> {t('header.wizard.finish', 'Finish')}</> : <>{t('header.wizard.next', 'Next')} <FiArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    );
  }

  // phase === 'choose' — suite-einheitlicher Welcome-Dialog
  return (
    <>
      <WelcomeDialog
        open
        lang={language}
        theme={theme}
        accent="#3b82f6"
        title={t('header.welcome.title', 'Welcome to MultiCam Planner')}
        intro={t('header.welcome.intro', 'How would you like to start?')}
        onDismiss={dismiss}
        actions={[
          {
            id: 'load',
            title: t('header.welcome.load.title', 'Load Plan'),
            description: t('header.welcome.load.desc', 'Open an existing .mcplan file and jump to camera editing'),
            icon: <FiUpload size={20} />,
            accent: '#3b82f6',
            onSelect: () => fileInputRef.current?.click(),
          },
          {
            id: 'new',
            title: t('header.welcome.new.title', 'New Plan'),
            description: t('header.welcome.new.desc', 'Step through floor plan → stages → objects → cameras'),
            icon: <FiPlus size={20} />,
            accent: '#eab308',
            onSelect: startWizard,
          },
        ]}
      />
      <input ref={fileInputRef} type="file" accept=".mcplan,.json" className="hidden" onChange={handleFileChange} />
    </>
  );
}
