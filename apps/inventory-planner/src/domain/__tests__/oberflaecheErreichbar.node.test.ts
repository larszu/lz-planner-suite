import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// Erreicht die Oberfläche ihre eigenen Rechenwerke? (B-65)
//
// ─── DER BEFUND, GEMESSEN 2026-09-09 ───────────────────────────────────────
//
// Der Eigentümer schickte Bildschirmfotos einer fremden Bestands-App: „Es
// fehlen noch einige Funktionen." Nachgerechnet fehlten die meisten davon
// nicht — sie waren gebaut und von keinem Knopf aus erreichbar. Von 18
// Modulen unter `domain/lib/` erreichte der Import-Graph ab `ui/App.tsx`
// nur acht:
//
//   erreicht     containerCheckout, custodyPeriod, faultHistory,
//                handoverSignature, inventoryMerge, ownership,
//                storageMoves, storageTree
//   NICHT        damageRegister, insuranceSchedule, inventoryAudit,
//                inventoryCommitment, inventoryPortable, inventoryPrint,
//                inventoryReport, inventoryScan, packList, unitIdentity
//
// Das ist dieselbe Defektform wie ein Feld, das nur beschrieben und nie
// gelesen wird — nur zehnmal. Für den Lageristen ist ein Modul, das kein Weg
// erreicht, kein Modul.
//
// ─── WAS DIESE DATEI TUT UND WARUM SIE EINE RATSCHE IST ────────────────────
//
// Sie rechnet den Graph NACH, statt eine Liste zu pflegen. Eine Liste wäre
// der Kenntnisstand ihres Autors: das nächste verwaiste Modul stünde nicht
// darauf, und niemandem fiele es auf.
//
// Die Zahl darf sinken und nie steigen. Wer eine Ansicht entfernt und damit
// ein Modul abhängt, sieht es hier — und wer eine anhängt, muss die Schranke
// nachziehen, was der Moment ist, in dem jemand den Fortschritt bemerkt.
//
// ─── WAS SIE NICHT PRÜFT ───────────────────────────────────────────────────
//
// Ob die Ansicht das Modul SINNVOLL benutzt. Ein Import, der nur dasteht,
// zählt hier als erreicht — das ist die Grenze einer Graph-Messung, und sie
// steht hier, damit niemand die Zahl für mehr hält, als sie ist. Was die
// Inventur-Ansicht wirklich rechnet, prüfen die Tests von `inventoryAudit`.
// ───────────────────────────────────────────────────────────────────────────

const SRC = join(__dirname, '..', '..')
const LIB = join(SRC, 'domain', 'lib')

/** Ein relativer Import, aufgelöst auf die Datei, die er wirklich meint. */
const aufloesen = (von: string, spez: string): string | null => {
  const basis = normalize(join(dirname(von), spez))
  for (const kandidat of [`${basis}.ts`, `${basis}.tsx`, join(basis, 'index.ts')]) {
    if (existsSync(kandidat) && statSync(kandidat).isFile()) return kandidat
  }
  return null
}

/** Alles, was von den Einstiegspunkten aus über relative Importe erreichbar ist. */
const erreichbar = (): Set<string> => {
  const gesehen = new Set<string>()
  const gehe = (f: string) => {
    if (gesehen.has(f)) return
    gesehen.add(f)
    const quelle = readFileSync(f, 'utf8')
    for (const m of quelle.matchAll(/from\s+['"](\.[^'"]*)['"]/g)) {
      const ziel = aufloesen(f, m[1])
      if (ziel) gehe(ziel)
    }
  }
  for (const start of ['ui/App.tsx', 'main.tsx']) {
    const p = join(SRC, start)
    if (existsSync(p)) gehe(p)
  }
  return gesehen
}

/**
 * Wie viele Module noch keinen Weg haben.
 *
 * 2026-09-09, in zwei Schritten von 10 auf 3:
 *
 *   10 → 7  Ansicht `Inventur` — `inventoryScan`, `inventoryAudit`, und
 *           `unitIdentity` kam MIT, weil `auditScan` seinen `unitLabel`
 *           braucht.
 *    7 → 3  Ansicht `Bericht` — `inventoryReport`, `inventoryPortable`,
 *           `packList`, `inventoryPrint`.
 *
 * Beide Male hätte eine gepflegte Liste die falsche Zahl gemeldet: beim
 * ersten Mal zwei statt drei. Das ist der Grund, warum hier gerechnet und
 * nicht aufgezählt wird.
 *
 * Übrig sind `damageRegister`, `insuranceSchedule` und
 * `inventoryCommitment` — die drei, die von Schäden, Fristen und Zusagen
 * handeln. Wer die nächste Ansicht baut, setzt diese Zahl herunter; nicht
 * der Test soll nachgeben, sondern der Zustand.
 */
const SCHRANKE = 3

describe('B-65 — die Oberfläche erreicht ihre Rechenwerke', () => {
  const gesehen = erreichbar()
  const module: string[] = readdirSync(LIB).filter((f: string) => f.endsWith('.ts'))
  const ohneWeg = module.filter((f: string) => !gesehen.has(join(LIB, f)))

  it('1. die Messung findet überhaupt etwas — Gegenprobe zum Lauf selbst', () => {
    // Ohne diese Zeile wäre ein Graph, der an der ersten Datei abbricht,
    // grün: alles unerreichbar, Schranke überschritten — oder, bei einem
    // leeren Modul-Verzeichnis, alles erreichbar und nichts bewiesen.
    expect(module.length, 'keine Module unter domain/lib gefunden').toBeGreaterThan(10)
    expect(gesehen.size, 'der Import-Graph ist leer geblieben').toBeGreaterThan(20)
  })

  it('2. wofür eine Ansicht gebaut wurde, ist auch erreichbar', () => {
    // Namentlich und nicht nur über die Zahl: die Schranke allein liesse
    // offen, WELCHE sieben erreicht sind. Fiele eine dieser Ansichten weg,
    // koennte eine andere die Zahl halten und der Verlust bliebe unbenannt.
    for (const m of [
      // Ansicht `Inventur`
      'inventoryScan.ts',
      'inventoryAudit.ts',
      // Ansicht `Bericht`
      'inventoryReport.ts',
      'inventoryPortable.ts',
      'packList.ts',
      'inventoryPrint.ts',
    ]) {
      expect(
        gesehen.has(join(LIB, m)),
        `${m} ist von ui/App.tsx aus nicht erreichbar — dann gibt es die ` +
          'Ansicht, für die es gebaut wurde, für den Lageristen nicht',
      ).toBe(true)
    }
  })

  it('3. die Zahl der Module ohne Weg sinkt und steigt nie', () => {
    expect(
      ohneWeg.length,
      `Module ohne Weg: ${ohneWeg.join(', ')}. Sind es weniger geworden, ` +
        'gehört SCHRANKE heruntergesetzt — genau dort merkt jemand den Fortschritt.',
    ).toBeLessThanOrEqual(SCHRANKE)
  })

  it('4. die Schranke ist nicht großzügiger als der Zustand', () => {
    // Eine Ratsche, die über dem Ist steht, ist keine: sie ließe das nächste
    // verwaiste Modul stillschweigend durch.
    expect(
      SCHRANKE,
      `SCHRANKE ist ${SCHRANKE}, ohne Weg sind aber nur ${ohneWeg.length}`,
    ).toBe(ohneWeg.length)
  })

  it('5. die Ansichten liegen im Verzeichnis der Oberfläche', () => {
    // Klein, aber es hält die Grenze aus ADR-006: Rechnen unter `domain/`,
    // Bedienen unter `ui/`.
    for (const datei of ['Inventur.tsx', 'Bericht.tsx']) {
      const p = join(SRC, 'ui', datei)
      expect(existsSync(p), `src/ui/${datei} fehlt`).toBe(true)
      expect(relative(SRC, p).startsWith('ui')).toBe(true)
    }
  })
})
