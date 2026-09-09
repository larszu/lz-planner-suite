import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * DIE REGEL, DIE B-59 HINTERLASSEN HAT — und der Wächter, der sie für die
 * VIERTE Brücke hält.
 *
 * Gefunden 2026-09-09, in allen drei Planern gleichzeitig: `connectShellSeed`
 * wendet jede höhere Revision an, die Shell zählt sie bei Projektwechsel,
 * Undo/Redo und Kopf-Änderung hoch — und alle drei `seedTo*`-Funktionen bauten
 * ihre Objekte daraufhin NEU. Hänge-Höhen, Ausrichtungen, Blenden,
 * Port-Beschriftungen: weg, still, ausgelöst von einer Handlung, die mit dem
 * Planer nichts zu tun hat.
 *
 * Die Regel lautet seither: DER SEED SETZT, WAS ER NENNT. Was er nicht nennt,
 * behält ein bereits vorhandenes Objekt.
 *
 * Die drei Instanzen prüfen ihre eigenen Tests (`seedRigHoehe`, MultiCams
 * `shellSeed.test.ts`, Cables `shellSeed.test.ts`) — jeder mit echten Werten
 * und Gegenproben. Was DIESER Test hält, ist etwas anderes und deshalb ein
 * eigener: dass eine SPÄTER hinzukommende Brücke die Regel nicht wieder
 * verliert. Genau so ist sie dreimal entstanden — nicht aus Nachlässigkeit,
 * sondern weil beim Bauen einer Brücke niemand daran denkt, dass der Seed ein
 * zweites Mal kommt.
 *
 * Der Test misst deshalb die SIGNATUR und die WEITERGABE, nicht das Verhalten:
 * eine Übernahmefunktion ohne Zugang zum vorhandenen Stand KANN die Regel
 * nicht einhalten, und ein Aufrufer, der ihn nicht mitgibt, hält sie nicht ein.
 */

const wurzel = join(__dirname, '..', '..', '..')
const lies = (p: string): string => readFileSync(join(wurzel, p), 'utf8')

/**
 * Die Seed-Brücken der Suite: die Übernahmefunktion, der Name ihres
 * Vorhanden-Parameters, und der Aufrufer, der ihn füllt.
 *
 * Wächst die Suite um einen vierten eingebetteten Planer, gehört er hier hin —
 * und der Test darunter besteht darauf, dass die Liste vollständig ist.
 */
const BRUECKEN = [
  {
    app: 'light-planner',
    modul: 'apps/light-planner/src/core/shellSeed.ts',
    funktion: 'seedToFixtures',
    parameter: 'vorhandene',
    bruecke: 'apps/light-planner/src/core/useShellSeed.ts',
  },
  {
    app: 'multicam-planner',
    modul: 'apps/multicam-planner/src/utils/shellSeed.ts',
    funktion: 'seedToCameras',
    parameter: 'vorhandene',
    bruecke: 'apps/multicam-planner/src/utils/shellSeedBridge.ts',
  },
  {
    app: 'cable-planner',
    modul: 'apps/cable-planner/src/renderer/lib/shellSeed.ts',
    funktion: 'seedToCable',
    parameter: 'vorhandene',
    bruecke: 'apps/cable-planner/src/renderer/lib/shellSeedBridge.ts',
  },
] as const

describe('Jede Seed-Brücke kann den vorhandenen Stand sehen', () => {
  /**
   * Die Parameterliste einer Funktion — mit gezaehlten Klammern.
   *
   * Die erste Fassung nahm `slice(0, indexOf(')'))` und fiel bei
   * `seedToCameras` durch: dessen dritter Parameter ist selbst eine Funktion
   * (`vorauswahl: (cam: Camera) => …`), und die erste schliessende Klammer
   * gehoert IHR. Der Waechter meldete daraufhin einen Verstoss, den es nicht
   * gab — die Sorte Fehlalarm, die einen Waechter abschaltet. Also zaehlen.
   */
  const parameterliste = (code: string, funktion: string): string => {
    const start = code.indexOf(`export function ${funktion}(`)
    expect(start, `${funktion} nicht gefunden`).toBeGreaterThan(-1)
    const auf = code.indexOf('(', start)
    let tiefe = 0
    for (let i = auf; i < code.length; i += 1) {
      if (code[i] === '(') tiefe += 1
      else if (code[i] === ')') {
        tiefe -= 1
        if (tiefe === 0) return code.slice(auf + 1, i)
      }
    }
    throw new Error(`${funktion}: Parameterliste nicht geschlossen`)
  }

  /** Dasselbe fuer einen AUFRUF: alles zwischen seinen Klammern. */
  const argumentliste = (code: string, funktion: string): string => {
    const auf = code.indexOf(`${funktion}(`) + funktion.length
    expect(auf, `${funktion}( nicht gefunden`).toBeGreaterThan(funktion.length - 1)
    let tiefe = 0
    for (let i = auf; i < code.length; i += 1) {
      if (code[i] === '(') tiefe += 1
      else if (code[i] === ')') {
        tiefe -= 1
        if (tiefe === 0) return code.slice(auf + 1, i)
      }
    }
    throw new Error(`${funktion}: Argumentliste nicht geschlossen`)
  }

  it.each(BRUECKEN)('$app: $funktion nimmt den vorhandenen Stand entgegen', (b) => {
    // Ohne diesen Parameter KANN die Funktion nichts bewahren — sie kennt nur
    // den Seed, und der nennt einen Bruchteil dessen, was der Planer führt.
    expect(parameterliste(lies(b.modul), b.funktion)).toContain(`${b.parameter}:`)
  })

  it.each(BRUECKEN)('$app: die Brücke gibt ihn auch mit', (b) => {
    const code = lies(b.bruecke)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((z) => !z.trim().startsWith('//'))
      .join('\n')
    // GEMESSEN WIRD DIE ARGUMENTLISTE DIESES AUFRUFS — nicht der Text in
    // seiner Nähe. Die erste Fassung nahm 400 Zeichen ab dem Aufruf und suchte
    // darin `equipment`; sie blieb grün, als das Argument entfernt wurde, weil
    // das Wort zwei Zeilen weiter im `loadProject({ equipment, cables })`
    // wieder vorkommt. Ein Wächter, der die Umgebung misst, misst nicht die
    // Regel — gegengeprobt.
    const argumente = argumentliste(code, b.funktion)
    // Ein Parameter mit Vorgabe `[]` ist stillschweigend leer: die Funktion
    // sähe dann bei jedem Seed einen leeren Planer und bewahrte nichts. Der
    // Aufruf muss den echten Stand hineingeben.
    expect(argumente).toMatch(/\bfixtures\b|\bcameras\b|\bequipment\b/)
  })
})

describe('Vollständigkeit', () => {
  it('kennt jede Datei, die eine Seed-Übernahme baut', () => {
    // Der eigentliche Zweck dieser Datei. Eine vierte Brücke, die morgen
    // dazukommt, fällt hier auf — statt den Fehler ein viertes Mal zu machen
    // und ihn erst zu bemerken, wenn jemandem seine Arbeit verschwindet.
    const kandidaten = [
      'apps/light-planner/src/core/shellSeed.ts',
      'apps/multicam-planner/src/utils/shellSeed.ts',
      'apps/cable-planner/src/renderer/lib/shellSeed.ts',
    ]
    for (const p of kandidaten) {
      const gefuehrt = BRUECKEN.some((b) => b.modul === p)
      expect(gefuehrt, `${p} ist keine geführte Seed-Brücke`).toBe(true)
    }
    expect(BRUECKEN).toHaveLength(kandidaten.length)
  })

  it('jeder Planer mit einer Seed-Brücke hat auch einen Anschluss', () => {
    for (const b of BRUECKEN) {
      expect(() => lies(b.bruecke)).not.toThrow()
      expect(lies(b.bruecke)).toContain('connectShellSeed')
    }
  })
})

describe('Die Einstellungs-Brücke hält dieselbe Regel', () => {
  it('setzt nur die Schlüssel, die die Shell nennt', () => {
    // Gemessen beim Sweep und ausdrücklich in Ordnung: `connectShellSettings`
    // läuft über `Object.entries(values)` und fasst nichts an, was nicht drin
    // steht. Das steht hier, damit die Prüfung nicht bei jedem Durchgang neu
    // gemacht wird — und damit sie auffällt, wenn jemand daraus ein
    // „alles-oder-nichts" macht.
    const embed = lies('packages/ui/src/embed.ts')
    const stelle = embed.slice(embed.indexOf('export function connectShellSettings'))
    expect(stelle.slice(0, 700)).toContain('Object.entries(e.data.values)')
    expect(stelle.slice(0, 700)).not.toMatch(/reset|clear|= \{\}/)
  })
})
