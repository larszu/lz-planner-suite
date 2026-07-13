import { describe, it, expect } from 'vitest';
import { translate } from '../src/i18n';

// Deutsch ist Quell-Sprache und steht als Fallback direkt am Aufruf. Das en-Dict
// liefert nur die Übersetzung; fehlt ein Key, greift der deutsche Fallback.
describe('light-planner i18n translate()', () => {
  it('liefert bei EN die Übersetzung, wenn der Key existiert', () => {
    expect(translate('en', 'menu.file', 'Datei')).toBe('File');
    expect(translate('en', 'tool.select', 'Auswahl')).toBe('Select');
  });

  it('faellt bei fehlendem Key auf den deutschen Quelltext zurueck (auch bei EN)', () => {
    expect(translate('en', 'nicht.vorhanden.key', 'Deutscher Text')).toBe('Deutscher Text');
  });

  it('gibt bei DE immer den deutschen Fallback zurueck', () => {
    expect(translate('de', 'menu.file', 'Datei')).toBe('Datei');
    expect(translate('de', 'tool.select', 'Auswahl')).toBe('Auswahl');
  });
});
