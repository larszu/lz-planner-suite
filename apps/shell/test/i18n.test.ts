import { describe, it, expect } from 'vitest'
import { translate, format } from '../src/i18n'
import { en } from '../src/i18n/en'

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


// ── Abdeckung, nicht nur Mechanik ──────────────────────────────────────────
//
// Die Tests oben pruefen, dass `translate` funktioniert. Ob das Woerterbuch
// die Oberflaeche auch ABDECKT, sagen sie nicht — und genau dort lag der
// Fehler: 21 erreichbare Schluessel hatten keine englische Fassung, darunter
// der komplette Projekt-Hub (14). Er ist ueber „Projekte verwalten…"
// erreichbar; ein englischer Nutzer bekam die ganze Projektverwaltung auf
// Deutsch.
//
// Dieselbe Erhebung hat in `cable-planner` 492 fehlende Schluessel gefunden
// (davon 451 im falschen Woerterbuch abgelegt) und in `light-planner` 34.
// Eine Zaehlung der Eintraege zeigt so etwas nie: die Shell hatte 601
// Eintraege und sah damit „vollstaendig" aus.

const quellen = import.meta.glob('../src/**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** Kommentare raus, damit Beispiele in Kopfkommentaren nicht mitzaehlen. */
const ohneKommentare = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')

const dateien = new Map(
  Object.entries(quellen)
    .filter(([p]) => !p.includes('/i18n/'))
    .map(([p, s]) => [p, ohneKommentare(s)]),
)

/** Wird die Datei irgendwo importiert — auch lazy? */
const wirdImportiert = (pfad: string): boolean => {
  const name = pfad.split('/').pop()!.replace(/\.tsx?$/, '')
  const muster = new RegExp(`from\\s+'[^']*/${name}'|import\\(\\s*'[^']*/${name}'`)
  for (const [p, s] of dateien) {
    if (p === pfad) continue
    if (muster.test(s)) return true
  }
  return false
}

describe('shell i18n — Abdeckung der erreichbaren Oberflaeche', () => {
  it('hat fuer jeden erreichbaren Schluessel eine englische Fassung', () => {
    const erreichbar = new Set<string>()
    for (const [pfad, s] of dateien) {
      // `t(` und `tt(` — App.tsx benutzt den zweiten Namen.
      const ks = [...s.matchAll(/\bt{1,2}\(\s*'([^']+)'/g)].map((m) => m[1])
      if (!ks.length) continue
      if (pfad.endsWith('src/App.tsx') || wirdImportiert(pfad)) ks.forEach((k) => erreichbar.add(k))
    }
    // Untergrenze: findet das Muster die Aufrufe nicht mehr, soll der Test das
    // sagen statt stumm gruen zu bleiben.
    expect(erreichbar.size, 'Zu wenige t()-Aufrufe gefunden — Muster passt nicht mehr').toBeGreaterThan(300)

    const fehlend = [...erreichbar].filter((k) => en[k] === undefined).sort()
    expect(
      fehlend,
      `Ohne englische Fassung, obwohl die Stelle gerendert wird: ${fehlend.slice(0, 12).join(', ')}` +
        `${fehlend.length > 12 ? ` … (+${fehlend.length - 12})` : ''}.`,
    ).toEqual([])
  })
})
