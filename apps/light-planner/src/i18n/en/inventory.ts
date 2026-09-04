/** EN-Overrides: InventoryDialog (Lager/Bestand) + gemeinsame Schaltflächen.
 *  Keys: inventory.*, common.*
 *
 *  WARUM DIESES TEILDICT ERST JETZT KOMMT. Das englische Wörterbuch der Suite
 *  hatte 562 Schlüssel — und davon bediente **kein einziger** den
 *  Lager-Dialog. `inventory/InventoryDialog.tsx` ist mit 35 t()-Aufrufen der
 *  aufrufstärkste Dialog der App und war vollständig unübersetzt.
 *
 *  Eine Zählung ("562 Schlüssel, sieht gut aus") zeigt das nie. Sichtbar wurde
 *  es erst, als `i18n:check` (light#59/#60) nicht mehr Schlüssel zählte,
 *  sondern abglich, welche t()-Aufrufe von einer GERENDERTEN Komponente
 *  kommen.
 *
 *  `common.*` steht hier mit, weil diese vier Schaltflächen bisher nur im
 *  Lager-Dialog vorkommen. Taucht die erste außerhalb auf, gehören sie in ein
 *  eigenes Teildict — nicht vorher.
 */
export const inventory: Record<string, string> = {
  // ── Kopf, Liste, Leerzustand ─────────────────────────────────────────────
  'inventory.title': 'Inventory',
  'inventory.item': 'Item',
  'inventory.add': 'Item',
  'inventory.new': 'New item',
  'inventory.edit': 'Edit item',
  'inventory.empty':
    'No inventory items yet. Add some, or import an inventory from Cable/MultiCam Planner.',

  // ── Formular ─────────────────────────────────────────────────────────────
  'inventory.model': 'Model',
  'inventory.manufacturer': 'Manufacturer',
  'inventory.quantity': 'Quantity',
  'inventory.code': 'Code',
  'inventory.location': 'Location',
  'inventory.locations': 'Locations/cases',
  'inventory.unit': 'Unit',
  'inventory.units': 'Units',
  // `ownership` ist das Feld, `owned` einer seiner Werte. Im Deutschen heißen
  // beide "Eigentum" — Beschriftung und erste Auswahl sind dort also
  // wortgleich. Englisch kann das trennen, und tut es hier.
  'inventory.ownership': 'Ownership',
  'inventory.owned': 'Owned',
  'inventory.rented': 'Rented',
  'inventory.subhire': 'Sub-hire',

  // ── Scannen ──────────────────────────────────────────────────────────────
  'inventory.scan': 'Resolve',
  'inventory.scanPh': 'Scan / enter code…',
  'inventory.scanNone': 'No match.',

  // ── Import/Export ────────────────────────────────────────────────────────
  'inventory.import': 'Import',
  'inventory.importErr': 'Not a valid inventory file (avplan-inventory).',
  // ABWEICHUNG ZU UPSTREAM, UND ZWAR NOETIG. Upstream (light-planner) fragt
  // mit `window.confirm`, dessen Knöpfe "OK" und "Abbrechen" heißen — dort
  // steht deshalb "Cancel = merge" im Text, und das stimmt. Die Suite ersetzt
  // den Aufruf durch `confirmDialog` mit eigenen Beschriftungen ("Ersetzen" /
  // "Zusammenführen"). Der Satz beschriebe dann einen Knopf, den es nicht mehr
  // gibt. Die Beschriftungen sagen es jetzt selbst, der Text fragt nur noch.
  'inventory.importConfirm': 'Replace the existing inventory?',
  'inventory.importReplace': 'Replace',
  'inventory.importMerge': 'Merge',
  // Der Platzhalter {n} wird vom Aufrufer ersetzt und muss stehen bleiben.
  'inventory.importDone': '{n} items imported.',
  'inventory.export': 'Export',
  'inventory.exportHint': 'Export across apps',
  'inventory.fromImport': 'from import, preserved losslessly',

  // ── Gemeinsame Schaltflächen ─────────────────────────────────────────────
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
};
