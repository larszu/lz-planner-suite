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
  'hub.tab.projects': 'Projects',
  'hub.tab.templates': 'Templates',

  /* Vorlagen (B-39.2). Keys: tpl.* — sie leben hier und nicht in einem
     eigenen Dict, weil sie im selben Modal stehen und ein zweites Dict fuer
     zwei Reiter desselben Fensters nur eine weitere Datei zum Vergessen
     waere. */
  'tpl.intro':
    'A template is the show without its date and without its client: room, rig, signal path, running order, crew and budget frame stay, so the next identical production does not start from nothing.',
  'tpl.empty': 'No templates yet. Create one from the current project.',
  'tpl.use': 'New project',
  'tpl.create': 'Create',
  'tpl.newName': 'Name of the new show',
  'tpl.name': 'Template name',
  'tpl.note': 'What is it for? (optional)',
  'tpl.fromProject': 'Current project as template',
  'tpl.omitted': 'Does not travel:',
  // {name} wird vom Aufrufer ersetzt und muss stehen bleiben.
  'tpl.confirmDelete': 'Really delete template "{name}"?',
  'tpl.omit.contacts': 'contacts (address, VAT ID, customer number, Lexware contact)',
  'tpl.omit.invoices': 'issued documents',
  'tpl.omit.billing': 'tax type and rate',
  'tpl.omit.date': 'show date',
  'tpl.omit.phase': 'production phase',
  'tpl.omit.progress': 'planning progress',
  'tpl.omit.crewTimes': 'call times and confirmations (crew stays)',
  'tpl.omit.budgetActual': 'actual cost (estimate stays)',
  'tpl.omit.tasksDone': 'ticked tasks (list stays)',
  'tpl.omit.loadIn': 'load-in time',
}
