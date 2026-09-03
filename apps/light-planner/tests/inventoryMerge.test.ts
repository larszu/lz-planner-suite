import { describe, expect, it } from 'vitest';
import { mergeById, mergeDefined } from '../src/inventory/merge';

// ADR-005, Inkrement 4, Regel 2 — eine Projektion darf nicht ueberschreiben.
//
// Der Lager-Import nahm im Modus „merge" den eingehenden Datensatz als GANZES
// (`byId.set(x.id, x)`). Eine v1-Datei aus der Zeit vor ADR-002 traegt keine
// `deviceTypeId`; stand im lokalen Lager derselbe Artikel MIT bestaetigter
// Typ-Identitaet, war sie nach dem Import weg.
//
// Suite-Overlay: upstream haelt diese Zusagen in
// `scripts/inventory-contract-check.ts`, weil dort kein vitest laeuft. Hier
// laeuft eins (`npm run test --workspaces` in ci.yml), also stehen sie als
// Test — sonst pruefte sie in der Suite niemand. Sinngleich im cable-planner
// (tests/inventoryMerge.test.ts) und im multicam-planner
// (src/__tests__/merge.test.ts).

describe('mergeDefined — was die Datei nicht sagt, loescht nichts', () => {
  it('haelt den vorhandenen Wert, wenn der eingehende undefined ist', () => {
    const merged = mergeDefined(
      { id: 'a', deviceTypeId: 'dt-1' },
      { id: 'a', deviceTypeId: undefined },
    );
    expect(merged.deviceTypeId).toBe('dt-1');
  });

  it('uebernimmt einen gesetzten Wert — auch einen leeren String', () => {
    // Leerer String ist eine Aussage („der Nutzer hat die Notiz geleert"),
    // undefined ist keine. Der Unterschied ist der ganze Punkt.
    expect(mergeDefined({ notes: 'alt' }, { notes: '' }).notes).toBe('');
  });

  it('uebernimmt auch 0 und false', () => {
    expect(mergeDefined({ q: 5, l: true }, { q: 0, l: false })).toEqual({ q: 0, l: false });
  });

  it('fasst die Eingaben nicht an', () => {
    const base = { id: 'a', model: 'X', deviceTypeId: 'dt-1' };
    const over = { id: 'a', model: 'Y', deviceTypeId: undefined };
    const before = JSON.stringify([base, over]);
    mergeDefined(base, over);
    expect(JSON.stringify([base, over])).toBe(before);
  });
});

describe('mergeById — der eigentliche Fall', () => {
  const bestand = [
    { id: 'i1', model: 'ULXD2', deviceTypeId: 'dt-shure-ulxd2', notes: 'Regal A3' },
    { id: 'i2', model: 'SM58' },
  ];

  it('eine aeltere v1-Datei loescht die bestaetigte deviceTypeId NICHT mehr', () => {
    const out = mergeById(bestand, [
      { id: 'i1', model: 'ULXD2', deviceTypeId: undefined, notes: undefined },
    ]);
    const i1 = out.find((x) => x.id === 'i1');
    expect(i1?.deviceTypeId).toBe('dt-shure-ulxd2');
    expect(i1?.notes).toBe('Regal A3');
  });

  it('schreibt gesetzte Felder fort — der Import bleibt ein Import', () => {
    const out = mergeById(bestand, [{ id: 'i1', model: 'ULXD2', notes: 'Case 7' }]);
    const i1 = out.find((x) => x.id === 'i1');
    expect(i1?.notes).toBe('Case 7');
    expect(i1?.deviceTypeId).toBe('dt-shure-ulxd2');
  });

  it('haengt unbekannte Artikel an und haelt die Reihenfolge des Bestands', () => {
    expect(mergeById(bestand, [{ id: 'i9', model: 'Neu' }]).map((x) => x.id)).toEqual([
      'i1',
      'i2',
      'i9',
    ]);
  });
});
