/** EN-Overrides: Projekt-Hub (Liste, Anlegen, Umbenennen, Loeschen).
 *  Keys: hub.*
 *
 *  Der Hub war der groesste zusammenhaengende Block ohne englische Fassung:
 *  14 von 21 fehlenden Schluesseln der Shell. Er ist ueber „Projekte
 *  verwalten…" in der Topbar erreichbar — ein englischer Nutzer bekam die
 *  komplette Projektverwaltung auf Deutsch. */
export const hub: Record<string, string> = {
  'hub.title': 'Projects',
  'hub.close': 'Close',
  'hub.new': 'New project',
  'hub.empty': 'No projects yet. Create one.',
  'hub.open': 'Open',
  'hub.current': 'open',
  'hub.rename': 'Rename',
  'hub.duplicate': 'Duplicate',
  'hub.delete': 'Delete',
  // {name} wird vom Aufrufer ersetzt und muss stehen bleiben.
  'hub.confirmDelete': 'Really delete "{name}"?',
  'hub.save': 'Save',
  'hub.cancel': 'Cancel',
}
