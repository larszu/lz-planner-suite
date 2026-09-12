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

  'seed.writer.shell': 'the suite',
  'seed.writer.cameras': 'the camera planner',
  'seed.writer.fixtures': 'the lighting planner',
  'seed.writer.signal': 'the cabling planner',

  'seed.field.name': 'Venue',
  'seed.field.widthM': 'Hall width',
  'seed.field.heightM': 'Hall depth',
  'seed.field.stage': 'Stage',
}
