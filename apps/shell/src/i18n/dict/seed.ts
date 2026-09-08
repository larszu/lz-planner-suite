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

  'seed.writer.shell': 'the suite',
  'seed.writer.cameras': 'the camera planner',
  'seed.writer.fixtures': 'the lighting planner',
  'seed.writer.signal': 'the cabling planner',

  'seed.field.name': 'Venue',
  'seed.field.widthM': 'Hall width',
  'seed.field.heightM': 'Hall depth',
  'seed.field.stage': 'Stage',
}
