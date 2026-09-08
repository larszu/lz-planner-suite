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
  // DIE FRAGE IST WEG, DIE VORSCHAU HAT SIE ABGELOEST (E-15, light#97).
  //
  // Hier standen fuenf Schluessel fuer den `choiceDialog` aus suite#154:
  // `importConfirm`, `importReplace`, `importMerge`, `importBody` und
  // `importCancelled`. Das war das Zwischenmass — es hat verhindert, dass
  // Escape und der Klick daneben zusammenfuehren, aber gefragt hat es immer
  // noch, bevor jemand sehen konnte, worueber er entscheidet. Genau dafuer
  // war es angekuendigt: „bleibt, bis die Vorschau es abloest". Sie loest es
  // jetzt ab, und die Schluessel gehen mit — ein Schluessel ohne Aufrufer ist
  // eine Uebersetzung fuer einen Knopf, den es nicht gibt.
  //
  // ABWEICHUNG ZU UPSTREAM, BEWUSST. Dort steht an dieser Stelle ein
  // Kommentar, der die entfallene Rueckfrage im Wortlaut zitiert
  // („REPLACE the existing inventory? Cancel = merge."). Diese Kopie hatte
  // diesen Wortlaut nie: `suite#154` hatte ihn schon durch `choiceDialog`
  // mit eigenen Beschriftungen ersetzt. Den Satz mitzuvendorieren hiesse,
  // ueber DIESE Kopie etwas Falsches zu behaupten — deshalb steht hier die
  // Geschichte dieser Kopie und nicht die der anderen. Der Drift-Guard
  // meldet die drei Zeilen als „nicht uebernommen"; sie sind mit
  // `--write-baseline --force` begraben, und das hier ist die Begruendung.
  'inventory.importFull': '{n} objects read but NOT saved: local storage is full. Free some space, then import again.',

  // ── Import-Vorschau (E-15) ───────────────────────────────────────────────
  'inventory.previewTitle': 'What this import changes',
  'inventory.previewMerge': 'Merge',
  'inventory.previewReplace': 'Replace',
  'inventory.previewMergeHint': 'Carried forward — nothing is dropped.',
  'inventory.previewReplaceHint': 'The existing inventory is discarded.',
  'inventory.previewNew': 'new',
  'inventory.previewChanged': 'changed',
  'inventory.previewSame': 'unchanged',
  'inventory.previewRemoved': 'dropped',
  'inventory.previewUntouched': 'kept',
  'inventory.previewCancel': 'Cancel',
  'inventory.previewApply': 'Import',
  // Der Platzhalter {n} wird vom Aufrufer ersetzt und muss stehen bleiben.
  'inventory.previewRemoves': '{n} existing records will be dropped. This cannot be undone.',
  'inventory.previewNothing': 'This file changes nothing in the inventory.',
  'inventory.sorte.items': 'Items',
  'inventory.sorte.nodes': 'Locations / cases',
  'inventory.sorte.sets': 'Sets',
  'inventory.sorte.units': 'Units',
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

  // Aus light#62: der Schliessen-Knopf im Projekt- und Aenderungs-Dialog.

  'common.close': 'Close',
};
