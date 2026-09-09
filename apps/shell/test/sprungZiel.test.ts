import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { annahme, knotenFuer, objektAmKabel, querziel, zustellung } from '../src/shell/crossLink'
import type { SuiteProject } from '../src/data/project'
import { PROJECT } from '../src/data/project'

/**
 * B-18 / B-39 Punkt 5 — DER SPRUNG NIMMT DIE AUSWAHL MIT.
 *
 * Der Backlog-Eintrag: „„Im Signal-Flow zeigen" wechselt das Modul, die
 * Auswahl bleibt zurueck." Geprueft ist hier beides, was daran haengt:
 *
 *  1. WELCHE Id mitfaehrt — die des Ziel-Gewerks, aufgeloest ueber eine
 *     DEKLARIERTE Entsprechung. Nie ueber Namensaehnlichkeit (ADR-002).
 *  2. WANN sie ankommt — erst im Ziel-Modul, dessen Rahmen beim Klick noch gar
 *     nicht steht. Wer sofort sendet, zeigt im Modul, das der Nutzer verlaesst.
 */

const projekt = (teil: Partial<SuiteProject> = {}): SuiteProject =>
  ({ ...PROJECT, ...teil }) as SuiteProject

describe('Die Entsprechung ist deklariert, nicht geraten', () => {
  it('findet den Knoten, der erklaertermassen fuer die Kamera steht', () => {
    expect(knotenFuer(PROJECT, 'camera', 'cam2')).toBe('n_cam2')
  })

  it('raet NICHT aus dem Namen', () => {
    // `n_cam9` heisst „CAM 9" und sieht fuer jedes Auge nach `cam9` aus. Genau
    // deshalb steht der Fall hier: ohne `represents` ist die Antwort
    // `undefined` und nicht der naheliegende Treffer. Ein geratener Sprung
    // saehe aus wie ein gelungener.
    const p = projekt({
      cameras: [{ ...PROJECT.cameras[0], id: 'cam9', name: 'CAM 9' }],
      nodes: [{ ...PROJECT.nodes[0], id: 'n_cam9', name: 'CAM 9 — Sony FX9', represents: undefined }],
    })
    expect(knotenFuer(p, 'camera', 'cam9')).toBeUndefined()
    expect(querziel(p, { modul: 'cameras', id: 'cam9' }, 'signal')).toBeUndefined()
  })

  it('unterscheidet die Art: ein Fixture ist keine Kamera unter derselben Id', () => {
    // Beide Gewerke duerfen dieselbe Id vergeben — sie sind getrennte
    // Id-Raeume. Wer nur die Id vergleicht, springt vom Fixture auf den Knoten
    // der gleichnamigen Kamera.
    const p = projekt({
      nodes: [{ ...PROJECT.nodes[0], id: 'n_x', represents: { kind: 'camera', id: 'gleich' } }],
    })
    expect(knotenFuer(p, 'camera', 'gleich')).toBe('n_x')
    expect(knotenFuer(p, 'fixture', 'gleich')).toBeUndefined()
  })
})

describe('Was mitfaehrt, ist die Id des ZIEL-Gewerks', () => {
  it('Kamera -> Signalweg: der Knoten, nicht die Kamera', () => {
    expect(querziel(PROJECT, { modul: 'cameras', id: 'cam2' }, 'signal')).toBe('n_cam2')
  })

  it('Signalweg -> Kameraplan: die Kamera am Kabel, nicht das Kabel', () => {
    // v012 haengt an n_cam2, und n_cam2 steht erklaertermassen fuer cam2.
    expect(objektAmKabel(PROJECT, 'v012', 'camera')).toBe('cam2')
    expect(querziel(PROJECT, { modul: 'signal', id: 'v012' }, 'cameras')).toBe('cam2')
  })

  it('nimmt die Quell-Seite, wenn beide Enden fuer eine Kamera stehen', () => {
    // Willkuerlich, aber festgehalten: in einem Signalweg ist „welche Kamera
    // ist das" die Seite, die das Signal erzeugt.
    const p = projekt({
      cables: [{ ...PROJECT.cables[0], id: 'k', from: 'n_cam2', to: 'n_cam1' }],
    })
    expect(objektAmKabel(p, 'k', 'camera')).toBe('cam2')
  })

  it('faehrt ohne Ziel, wo nichts erklaert ist', () => {
    // dmx03 haengt an n_dimmer und n_foh — fuer beide steht kein Fixture und
    // keine Kamera. Der Knopf wechselt dann nur das Modul, wie bisher.
    expect(querziel(PROJECT, { modul: 'signal', id: 'dmx03' }, 'cameras')).toBeUndefined()
    expect(querziel(PROJECT, { modul: 'licht', id: 'lx3' }, 'signal')).toBeUndefined()
  })

  it('Kamera -> Licht bleibt ohne Ziel', () => {
    // „Das Licht am Motiv dieser Kamera" ist kein Objekt. Wer hier eines
    // zurueckgibt, hat sich eines ausgesucht.
    expect(querziel(PROJECT, { modul: 'cameras', id: 'cam2' }, 'licht')).toBeUndefined()
  })

  it('springt nicht ins eigene Gewerk und nicht ohne Auswahl', () => {
    expect(querziel(PROJECT, { modul: 'signal', id: 'v012' }, 'signal')).toBeUndefined()
    expect(querziel(PROJECT, { modul: 'cameras', id: null }, 'signal')).toBeUndefined()
    expect(querziel(null, { modul: 'cameras', id: 'cam2' }, 'signal')).toBeUndefined()
  })

  it('kennt kein Ziel in Modulen, die keine Objekte fuehren', () => {
    expect(querziel(PROJECT, { modul: 'cameras', id: 'cam2' }, 'board')).toBeUndefined()
    expect(querziel(PROJECT, { modul: 'overview', id: 'cam2' }, 'signal')).toBeUndefined()
  })
})

describe('Die offene Bitte kommt im richtigen Moment im richtigen Modul an', () => {
  const bitte = { modul: 'signal' as const, id: 'n_cam2' }

  it('sendet, wenn ihr Modul vorne steht und der Rahmen hoert', () => {
    expect(
      zustellung(bitte, { modul: 'signal', planerOffen: true, rahmenHoert: true }),
    ).toEqual({ tun: 'senden' })
  })

  it('wartet, solange der Rahmen noch laedt', () => {
    // Der Normalfall direkt nach dem Modulwechsel: das iframe wird gerade erst
    // gemountet. Hier zu melden hiesse, jeden zweiten Sprung als Fehlschlag
    // auszugeben.
    expect(
      zustellung(bitte, { modul: 'signal', planerOffen: true, rahmenHoert: false }),
    ).toEqual({ tun: 'warten' })
  })

  it('feuert NIE im Modul, das der Nutzer verlassen hat', () => {
    // Die eine Zustellung, die schlimmer waere als gar keine: der Nutzer ist
    // weitergeklickt, und der Sprung zeigt ihm im neuen Modul ein Objekt aus
    // dem alten.
    expect(
      zustellung(bitte, { modul: 'cameras', planerOffen: true, rahmenHoert: true }),
    ).toEqual({ tun: 'verwerfen' })
  })

  it('verwirft, wenn der Nutzer den Planer inzwischen zugeklappt hat', () => {
    // Sein eigener Griff, nicht ein Fehlschlag des Sprungs. Eine Meldung
    // darueber waere Vorhaltung — und zuzustellen gaebe es nichts mehr.
    expect(
      zustellung(bitte, { modul: 'signal', planerOffen: false, rahmenHoert: false }),
    ).toEqual({ tun: 'verwerfen' })
  })

  it('tut nichts, wenn nichts offen ist', () => {
    expect(
      zustellung(null, { modul: 'signal', planerOffen: true, rahmenHoert: true }),
    ).toEqual({ tun: 'nichts' })
  })
})

describe('Der zugeklappte Planer wird beim SPRUNG beantwortet, nicht spaeter', () => {
  it('meldet, dass der Sprung nur bis zur Vorschau reicht', () => {
    // Da kommt nichts mehr nach — kein Rahmen, der sich spaeter meldet.
    // Schweigen waere hier der stumme Sprung aus E-11: der Nutzer suchte in
    // einem Planer nach etwas, das dort nie ankam.
    expect(annahme({ hatPlaner: true, gemountet: false })).toEqual({ tun: 'melden' })
  })

  it('legt eine Bitte an, wenn ein Planer offen ist', () => {
    expect(annahme({ hatPlaner: true, gemountet: true })).toEqual({ tun: 'bitte' })
  })

  it('schweigt, wo es gar keinen Planer gibt', () => {
    // Uebersicht und Board: die Auswahl IST der ganze Sprung, die Shell zeigt
    // sie in ihren eigenen Panels. Eine Meldung waere hier Laerm ueber einen
    // Sprung, der gelungen ist.
    expect(annahme({ hatPlaner: false, gemountet: false })).toEqual({ tun: 'nichts' })
    expect(annahme({ hatPlaner: false, gemountet: true })).toEqual({ tun: 'nichts' })
  })
})

describe('Die Shell loest die Entsprechung auf, nicht der Planer', () => {
  it('macht aus der Id des Absenders die des Ziel-Gewerks', () => {
    // Der Cable-Planner kennt `n_cam2` (Seed-Id = Knoten-Id) und NICHT `cam2`.
    // Bittet er „zeig das im Kameraplan", muss die Uebersetzung hier
    // passieren: `represents` steht im Shell-Modell, nicht im Seed.
    expect(querziel(PROJECT, { modul: 'signal', id: 'v012' }, 'cameras')).toBe('cam2')
  })

  it('laesst die Id in Ruhe, wo keine Entsprechung erklaert ist', () => {
    // Kein stiller Abbruch: der Absender spricht dann entweder schon den
    // Id-Raum des Ziels, oder das Ziel antwortet „kenne ich nicht" — sichtbar.
    expect(querziel(PROJECT, { modul: 'signal', id: 'dmx03' }, 'cameras')).toBeUndefined()
  })
})

describe('Der Bus sagt, wann ein Rahmen zu horchen beginnt', () => {
  it('meldet die Anmeldung — sonst muesste die Shell pollen', async () => {
    const { onPlannerFrameListening, onPlannerReveal, plannerRevealListening } = await import(
      '../src/embed/plannerBridge'
    )
    let meldungen = 0
    const abMeldung = onPlannerFrameListening(() => {
      meldungen += 1
    })
    expect(plannerRevealListening()).toBe(false)
    const abRahmen = onPlannerReveal(() => {})
    expect(meldungen).toBe(1)
    expect(plannerRevealListening()).toBe(true)
    abRahmen()
    expect(plannerRevealListening()).toBe(false)
    abMeldung()
    onPlannerReveal(() => {})()
    // Abgemeldet heisst abgemeldet: eine Meldung mehr waere ein Leck.
    expect(meldungen).toBe(1)
  })
})

describe('Die Verdrahtung', () => {
  const lies = (p: string): string => readFileSync(join(__dirname, '..', p), 'utf8')

  it('die Shell verwirft `msg.target` nicht mehr', () => {
    const app = lies('src/App.tsx')
    const stelle = app.slice(app.indexOf("msg.type === 'avplan:navigate'"))
    // Frueher stand hier `setModuleId(msg.module as ModuleId)` — der Wechsel
    // ohne das Objekt. Gefragt ist der Weg ueber `goToModule`, weil nur der
    // die Auswahl setzt und die Bitte offen haelt.
    const kopf = stelle.slice(0, 1400)
    expect(kopf).toMatch(/goToModule\(\s*ziel,/)
    expect(kopf).toMatch(/querziel\(project, \{ modul: moduleId, id: msg\.target \}, ziel\)/)
    expect(kopf).not.toMatch(/setModuleId\(msg\.module/)
  })

  it('der Absender existiert — nicht nur der Empfaenger', () => {
    // B-18 war so lange offen, weil dieser Kanal einen Empfaenger und einen
    // Typ hatte, aber niemanden, der sendet.
    const embed = lies('../../packages/ui/src/embed.ts')
    expect(embed).toContain('export function postNavigateToShell')
    expect(lies('../../packages/ui/src/index.ts')).toContain('postNavigateToShell')
  })

  it('die Annahme faellt im Sprung, die Zustellung im Effekt', () => {
    const app = lies('src/App.tsx')
    const sprung = app.slice(app.indexOf('const goToModule = useCallback'))
    expect(sprung.slice(0, 1400)).toMatch(/annahme\(\{ hatPlaner:/)
    expect(sprung.slice(0, 1400)).toContain('shell.reveal.plannerClosed')
    // Der Zustell-Effekt vermerkt in einem Ref und ruft KEIN setState: sonst
    // loeste jede Zustellung eine zweite Renderrunde aus.
    const effekt = app.slice(app.indexOf('const was = zustellung('))
    expect(effekt.slice(0, 900)).toContain('erledigt.current = bitte')
    expect(effekt.slice(0, 900)).not.toMatch(/setOffeneBitte|pushToast/)
  })

  it('die Knoepfe im Eigenschaften-Panel nehmen ein Ziel mit', () => {
    const panel = lies('src/shell/PropertiesPanel.tsx')
    // Zwei der vier Knoepfe haben eine erklaerbare Entsprechung, und beide
    // nutzen die eine Aufloesung aus `crossLink` — eine zweite hier waere die
    // zweite Wahrheit.
    expect(panel).toContain("onNavigate('signal', knotenFuer(project, 'camera', cam.id))")
    expect(panel).toContain("onNavigate('signal', knotenFuer(project, 'fixture', fx.id))")
    expect(panel).toContain("onNavigate('cameras', objektAmKabel(project, cable.id, 'camera'))")
    expect(panel).not.toMatch(/replace\(['"]n_|startsWith\(['"]n_/)
  })
})
