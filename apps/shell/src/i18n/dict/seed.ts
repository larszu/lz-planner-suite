/**
 * EN-Overrides: die Befunde aus dem Seed-Rückweg (E-21). Keys: seed.*
 *
 * Die Schlüssel für Schreiber und Felder stehen in `SeedConflictBar` als
 * Tabelle statt als `t('…')`-Aufruf — der Abdeckungs-Test findet sie deshalb
 * nicht von selbst. Sie gehören trotzdem hierher: ein Streifen, der auf
 * Englisch „der Licht-Planer" sagt, ist derselbe Fehler wie ein fehlender
 * Schlüssel, nur ohne Testabdeckung.
 */
export const seed: Record<string, string> = {
  'seed.conflict.region': 'Conflicting values from the planners',
  'seed.conflict.toast': '{n} value(s) from the planner not applied — conflict',
  'seed.conflict.line': '{feld}: {quelle} proposes {neu} — {alt} from {halter} stands',
  'seed.conflict.accept': 'Accept',
  'seed.conflict.dismiss': 'Dismiss',

  // ── Die angebotene Uebergabe an die anderen Planer (Nutzer-Auftrag
  //    2026-09-12: „soll man anklicken koennen") ──
  'seed.handoff.region': 'Offered hand-overs to the other planners',
  'seed.handoff.line': 'Reported by {quelle}: {was} — hand over to the other planners?',
  'seed.handoff.accept': 'Hand over',
  'seed.handoff.dismiss': 'Keep here',
  'seed.handoff.new': '{n} new',
  'seed.handoff.changed': '{n} changed',
  'seed.handoff.removed': '{n} removed',
  'seed.handoff.toast': 'Handed over to the other planners',
  'seed.handoff.toastMany': '{n} reports handed over',
  'seed.handoff.keptToast': 'Kept here',
  'seed.handoff.keptToastMany': '{n} reports kept here',
  'seed.handoff.count': '{n} open reports',
  'seed.handoff.acceptAll': 'Hand over all',
  'seed.handoff.dismissAll': 'Keep all here',
  'seed.handoff.header': 'Reported by {quelle}: {was}',
  'seed.handoff.countPlanners': 'Reports from {n} planners',
  'seed.from.cameras': 'LZ Multicam Planner',
  'seed.from.fixtures': 'LZ Light Planner',
  'seed.from.signal': 'LZ Cable Planner',

  // ── Die Kamera aus dem Signalplan, die im Kameraplan fehlt
  //    (Nutzer-Auftrag 2026-09-19) ──
  'seed.kamera.region': 'Cameras from the signal plan that are missing in the camera plan',
  'seed.kamera.line': '{name} ({modell}) is in the signal plan but not yet in the camera plan — create it there?',
  'seed.kamera.lineOhneModell':
    '{name} is in the signal plan but not yet in the camera plan — without a model the camera plan will not be able to match it.',
  'seed.kamera.accept': 'Create in camera plan',
  'seed.kamera.dismiss': 'Signal plan only',
  'seed.kamera.toast': '{name} created in the camera plan',

  'seed.writer.shell': 'the suite',
  'seed.writer.cameras': 'LZ Multicam Planner',
  'seed.writer.fixtures': 'LZ Light Planner',
  'seed.writer.signal': 'LZ Cable Planner',
  'seed.writer.lager': 'LZ Inventory Planner',
  'seed.writer.gebaeude': 'LZ Facility Planner',

  'seed.field.name': 'Venue',
  'seed.field.widthM': 'Hall width',
  'seed.field.heightM': 'Hall depth',
  'seed.field.stage': 'Stage',
}
