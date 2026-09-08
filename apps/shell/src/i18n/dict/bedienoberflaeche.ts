/**
 * EN-Overrides: der Belegungsplan der Bedienoberflaeche (Bedarf 45). Keys: rundown.sheet.surface, .grid*
 *
 * Der INHALT des Blattes bleibt kanonisch deutsch — wie bei allen
 * Ablauf-Sichten: ein Blatt, dessen Text sich mit dem Sprachschalter aendert,
 * meldet jedes gedruckte Exemplar als veraltet. Uebersetzt wird nur, was auf
 * dem Schirm steht.
 */
export const bedienoberflaeche: Record<string, string> = {
  'rundown.sheet.surface': 'Control surface',
  'rundown.sheet.grid': 'Grid',
  'rundown.sheet.gridCols': 'Columns per page',
  'rundown.sheet.gridRows': 'Rows per page',
}
