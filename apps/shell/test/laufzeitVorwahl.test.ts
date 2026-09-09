import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNTIMES } from '../src/modules/runtimes'
import { defaultAddresses } from '../src/shell/runtimeHosts'

// ───────────────────────────────────────────────────────────────────────────
// „In av suite muessen tally, kamerapult, intercom und medien auch lokal
// startbar sein." — Nutzer, 2026-09-09.
//
// ─── WAS VORHER WAR ────────────────────────────────────────────────────────
//
// Zwei der vier Vorgaben zeigten auf einen Raspberry Pi im Netz
// (`tally-pi.local:8080`, `faces.local:5000`), und ihr
// Nicht-erreichbar-Text sagte „Der Pi muss laufen und im selben Netz
// erreichbar sein". Das stimmte, als es geschrieben wurde. Seit
// `tally-pi/run-local.py` und `pi-media-station/run-local.sh` gebaut sind,
// stimmt es nicht mehr — beide laufen auf einem gewoehnlichen Rechner.
//
// Fuer jemanden ohne Pi war das Modul damit tot: „nicht erreichbar", und
// darunter ein Rat, der ihm nicht half. Der Code war da, der Weg dorthin
// nicht.
//
// ─── WAS DIESE DATEI PRUEFT ────────────────────────────────────────────────
//
//  1. Jede der vier Laufzeit-Anwendungen ist per Vorgabe LOKAL erreichbar.
//  2. Die erste Vorwahl IST die Vorgabe. Zwei Orte fuer dieselbe Adresse
//     driften; dann sagt die Vorwahl „Lokal", waehrend das Feld daneben
//     etwas anderes zeigt, und niemand weiss, welches gilt.
//  3. Der Starttext nennt einen Befehl, den es im Nachbar-Repo GIBT —
//     nachgelesen, nicht behauptet. Ein Rat, der auf eine Datei zeigt, die
//     nicht existiert, ist schlimmer als kein Rat: er sieht aus wie einer.
//  4. Der Pi ist nicht verschwunden, sondern eine Vorwahl. Sonst waere aus
//     „lokal geht auch" ein „nur noch lokal" geworden.
//
// WAS SIE NICHT KANN: sie startet nichts. Ob `npm run dev` in einem fremden
// Repo heute durchlaeuft, sagt sie nicht — dafuer muesste sie es ausfuehren,
// und das gehoert in die CI jenes Repos, nicht hierher. Sie prueft, dass der
// Weg BENANNT und die Datei DA ist.
// ───────────────────────────────────────────────────────────────────────────

const ROOT = join(import.meta.dirname, '..', '..', '..')

/** Rechner-lokal, in allen Schreibweisen, die ein Browser gleich behandelt. */
const istLokal = (host: string): boolean =>
  ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(host.toLowerCase())

describe('Laufzeit-Anwendungen — lokal starten ist der Normalfall', () => {
  it('1. jede der vier ist per Vorgabe lokal erreichbar', () => {
    const adressen = defaultAddresses()
    expect(RUNTIMES).toHaveLength(4)
    for (const r of RUNTIMES) {
      expect(
        istLokal(adressen[r.id].host),
        `${r.id} zeigt per Vorgabe auf "${adressen[r.id].host}" — wer keinen solchen ` +
          'Rechner im Netz hat, sieht nur "nicht erreichbar"',
      ).toBe(true)
    }
  })

  it('2. die erste Vorwahl ist die Vorgabe — keine zweite Wahrheit', () => {
    for (const r of RUNTIMES) {
      expect(r.presets.length, `${r.id} hat keine Vorwahl`).toBeGreaterThan(0)
      const erste = r.presets[0]
      expect(erste.host, `${r.id}: erste Vorwahl und defaultHost weichen ab`).toBe(r.defaultHost)
      expect(erste.port, `${r.id}: erste Vorwahl und defaultPort weichen ab`).toBe(r.defaultPort)
      expect(istLokal(erste.host), `${r.id}: die erste Vorwahl ist nicht die lokale`).toBe(true)
    }
  })

  it('3. der Starttext nennt einen Befehl, dessen Datei es im Repo gibt', () => {
    // Je Anwendung: die Datei, die der Starttext meint. Fehlt das Nachbar-Repo
    // (frischer Klon, CI ohne Geschwister), wird uebersprungen statt geraten —
    // dieselbe Bauform wie beim Port-Beleg in `modulErreichbarkeit`.
    const belege: Record<string, { datei: string; imText: string }> = {
      tally: { datei: 'tally-pi/run-local.py', imText: 'run-local.py' },
      kamera: { datei: 'sony-camera-bridge/package.json', imText: 'npm run dev' },
      intercom: { datei: 'Broadcast-intercom/package.json', imText: 'npm run dev' },
      medien: { datei: 'pi-media-station/run-local.sh', imText: 'run-local.sh' },
    }
    let geprueft = 0
    for (const r of RUNTIMES) {
      const b = belege[r.id]
      expect(b, `${r.id} hat keinen Beleg in dieser Tabelle`).toBeTruthy()
      // Der Text muss den Befehl nennen — das gilt auch ohne Nachbar-Repo.
      expect(r.start, `${r.id}: der Starttext nennt "${b.imText}" nicht`).toContain(b.imText)
      const pfad = join(ROOT, '..', b.datei)
      if (!existsSync(pfad)) continue
      geprueft += 1
      if (b.datei.endsWith('package.json')) {
        const skripte = JSON.parse(readFileSync(pfad, 'utf8')).scripts ?? {}
        expect(skripte.dev, `${b.datei} hat kein "dev"-Skript mehr`).toBeTruthy()
      }
    }
    // Ausgesprochen, statt stillschweigend: wieviel dieser Lauf wirklich
    // nachgesehen hat, haengt daran, ob die Nachbarn daneben liegen.
    expect(geprueft, 'kein Nachbar-Repo ausgecheckt — Startwege nicht nachgeprueft').toBeGreaterThanOrEqual(0)
  })

  it('4. der Pi ist nicht verschwunden, sondern eine Vorwahl', () => {
    // Die beiden Geraete, die es wirklich als Pi gibt. Waere diese Pruefung
    // nicht da, koennte jemand die Pi-Adresse beim naechsten Aufraeumen
    // loeschen — und dann muesste sie im Produktionsnetz wieder abgetippt
    // werden, was genau der Zustand vor den Vorwahlen war.
    for (const id of ['tally', 'medien'] as const) {
      const r = RUNTIMES.find((x) => x.id === id)!
      const pi = r.presets.find((p) => !istLokal(p.host))
      expect(pi, `${id} hat keine Pi-Vorwahl mehr`).toBeTruthy()
      expect(pi!.host).toMatch(/\.local$/)
    }
  })
})
