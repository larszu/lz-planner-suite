import { describe, it, expect } from 'vitest'
import { translate, format } from '../src/i18n'

// Deutsch ist Quell-Sprache und steht als Fallback am Aufruf. Das en-Dict liefert
// nur die Uebersetzung; fehlt ein Key, greift der deutsche Fallback.
describe('shell i18n translate()', () => {
  it('liefert bei EN die Uebersetzung, wenn der Key existiert', () => {
    expect(translate('en', 'config.mod.signal.label', 'Signal')).toBe('Signal')
    expect(translate('en', 'config.mod.cameras.label', 'Kameras')).toBe('Cameras')
    expect(translate('en', 'config.toast.saved', 'Projekt gespeichert')).toBe('Project saved')
  })

  it('faellt bei fehlendem Key auf den deutschen Quelltext zurueck', () => {
    expect(translate('en', 'config.gibt.es.nicht', 'Deutscher Text')).toBe('Deutscher Text')
  })

  it('gibt bei DE immer den deutschen Fallback zurueck', () => {
    expect(translate('de', 'config.mod.signal.label', 'Signal')).toBe('Signal')
    expect(translate('de', 'config.toast.saved', 'Projekt gespeichert')).toBe('Projekt gespeichert')
  })
})

describe('shell i18n format()', () => {
  it('setzt Platzhalter ein', () => {
    expect(format('{n} Kabel', { n: 5 })).toBe('5 Kabel')
    expect(format('{a} / {b}', { a: 'X', b: 'Y' })).toBe('X / Y')
  })

  it('laesst unbekannte Platzhalter stehen', () => {
    expect(format('{n} von {m}', { n: 3 })).toBe('3 von {m}')
  })
})
