import { describe, expect, it } from 'vitest'
import {
  OCR_HINDERNIS_TEXT,
  OCR_SPRACHE,
  TESSDATA_PFAD,
  sprachdatenDa,
} from '../../lib/belegOcr'

// ───────────────────────────────────────────────────────────────────────────
// Das Beleg-Foto (Eigentümer-Entscheidung 2026-09-10: lokales OCR).
//
// Geprüft wird, was MEIN Code tut — nicht die Erkennung selbst. Ein echter
// tesseract-Lauf gehört nicht in einen Unit-Test: er lädt vier Megabyte und
// misst am Ende die Qualität fremder Trainingsdaten.
//
// Was hier zählt, ist die Zusage aus der Entscheidung: die App lädt die
// Sprachdaten NICHT still von einem fremden Server nach. Fehlen sie, sagt
// sie das mit Namen. Genau das ist prüfbar, und genau daran würde man
// merken, wenn jemand später „der Bequemlichkeit halber" eine CDN-Adresse
// einträgt.
// ───────────────────────────────────────────────────────────────────────────

describe('Beleg-Foto: lokal, oder gar nicht', () => {
  it('1. die Sprachdaten werden aus dem EIGENEN Pfad geholt, nicht aus dem Netz', async () => {
    const gefragt: string[] = []
    const hole = (async (u: string) => {
      gefragt.push(String(u))
      return { ok: true } as Response
    }) as unknown as typeof fetch
    await sprachdatenDa(hole)
    expect(gefragt).toHaveLength(1)
    expect(gefragt[0]).toBe(`${TESSDATA_PFAD}/${OCR_SPRACHE}.traineddata.gz`)
    // Der Kern der Zusage: keine fremde Adresse, kein Protokoll davor.
    expect(gefragt[0]).not.toMatch(/^https?:/)
    expect(gefragt[0]).not.toContain('tessdata.projectnaptha.com')
  })

  it('2. fehlen sie, ist das ein benannter Grund und kein Absturz', async () => {
    const fehlt = (async () => ({ ok: false }) as Response) as unknown as typeof fetch
    expect(await sprachdatenDa(fehlt)).toBe(false)
    const kaputt = (async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    expect(await sprachdatenDa(kaputt)).toBe(false)
  })

  it('3. jeder Grund hat einen Satz, den man vorlesen kann', () => {
    // Dieselbe Regel wie beim Kamera-Scan: ein Grund ohne Text wäre ein
    // Fehlercode im Gesicht des Lageristen.
    for (const [grund, text] of Object.entries(OCR_HINDERNIS_TEXT)) {
      expect(text.length, `${grund} ohne Text`).toBeGreaterThan(30)
      expect(text.trim().endsWith('.'), `${grund} ohne Satzende`).toBe(true)
    }
  })

  it('4. der Hinweis auf fehlende Daten nennt den Weg, nicht nur den Mangel', () => {
    // „Fehlt" allein hilft niemandem weiter; der Satz muss sagen, wohin die
    // Datei gehört.
    expect(OCR_HINDERNIS_TEXT['sprachdaten-fehlen']).toContain('tessdata')
    expect(OCR_HINDERNIS_TEXT['sprachdaten-fehlen']).toContain('traineddata')
  })
})
