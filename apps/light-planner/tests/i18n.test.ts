import { describe, it, expect } from 'vitest';
import { translate, QUELLSPRACHE, SPRACHEN } from '../src/i18n';

/**
 * GEDREHT MIT E-28 (2026-09-09). Vorher war Deutsch die Quellsprache und
 * stand als Fallback am Aufruf; das `en`-Dict lieferte die Uebersetzung.
 * Jetzt ist es umgekehrt — und der Test musste mitgedreht werden, weil er
 * sonst die alte Richtung festgehalten haette.
 *
 * Die eigentliche Zusicherung ist dieselbe geblieben und steht im dritten
 * Fall: ein fehlender Schluessel darf NIE einen Schluesselnamen auf den
 * Schirm bringen. Er faellt auf den Quelltext zurueck, in jeder Sprache.
 */
describe('light-planner i18n translate()', () => {
  it('liefert bei DE die Uebersetzung, wenn der Schluessel existiert', () => {
    expect(translate('de', 'menu.file', 'File')).toBe('Datei');
    expect(translate('de', 'tool.select', 'Select')).toBe('Auswahl');
  });

  it('gibt bei EN den englischen Quelltext zurueck — es gibt kein en-Dict', () => {
    // Und das ist Absicht: ein Woerterbuch fuer die Quellsprache waere eine
    // zweite Kopie derselben Texte, und zwei Kopien laufen auseinander.
    expect(translate('en', 'menu.file', 'File')).toBe('File');
    expect(translate('en', 'tool.select', 'Select')).toBe('Select');
  });

  it('faellt bei fehlendem Schluessel auf den Quelltext zurueck — in JEDER Sprache', () => {
    expect(translate('en', 'nicht.vorhanden.key', 'English text')).toBe('English text');
    expect(translate('de', 'nicht.vorhanden.key', 'English text')).toBe('English text');
  });

  it('erklaert die Quellsprache und kennt sie in der Auswahl', () => {
    // Ohne das koennte QUELLSPRACHE auf eine Sprache zeigen, die der
    // Schalter gar nicht anbietet — und niemand saehe den Quelltext je.
    expect(QUELLSPRACHE).toBe('en');
    expect(Object.keys(SPRACHEN)).toContain(QUELLSPRACHE);
  });
});
