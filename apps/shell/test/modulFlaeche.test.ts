import { describe, expect, it } from 'vitest'
import { MODULES, adresseMitgeliefert, plannerMitgeliefert } from '../src/modules/registry'
import { toolbars, werkzeugeFuer } from '../src/shell/tabdeckWerkzeuge'

// ---------------------------------------------------------------------------
// Zwei Nutzer-Meldungen vom 2026-09-09, beide auf der veroeffentlichten Seite:
//
//   „Auf GitHub Pages stuerzt bei Lager, Gebaeude ab"
//   „in ab planner suite sind mockups zu sehen. Da sollen nur die echten Apps
//    drin laufen."
//
// Sie hatten dieselbe Wurzel-Gegend — die Flaeche eines Moduls — und zwei
// verschiedene Ursachen. Beide werden hier festgehalten.
//
// 1. DER ABSTURZ war ein Cast. Die Ansicht las die Werkzeug-Tabelle mit
//    `toolbars(t)[module.id as CanvasModuleId]`. Der Cast BEHAUPTET, die
//    Kennung sei eine der drei Vorschau-Module — der Compiler hoert daraufhin
//    auf zu pruefen, und zur Laufzeit kam bei `lager` und `gebaeude`
//    `undefined` heraus. `.length` darauf hat die ganze Shell weiss
//    geschaltet: nicht nur das Modul, die ganze Seite, und ohne Meldung.
//
//    Der Test laeuft ueber ALLE Module. Ein neues Modul ohne Werkzeugleiste
//    kann diesen Absturz damit nicht wieder ausloesen.
//
// 2. DIE ATTRAPPEN waren eine Voreinstellung. `mounted` hing an
//    `BUNDLED_PLANNERS` — also allein an der gepackten Desktop-Suite. Auf der
//    Seite stand deshalb ueberall die Shell-Vorschau, obwohl der Pages-Lauf
//    alle fuenf Planer mitbaut und als `./planners/<modul>/` danebenlegt. Die
//    echten Anwendungen waren da und wurden nicht gezeigt.
// ---------------------------------------------------------------------------

/** Uebersetzer-Attrappe: dieser Test prueft Struktur, nicht Sprache. */
const t = ((_key: string, fallback: string) => fallback) as unknown as Parameters<
  typeof toolbars
>[0]

describe('Modul-Flaeche — jedes Modul haelt einen Klick aus', () => {
  it('jedes Modul liefert eine Werkzeug-Liste, kein undefined', () => {
    for (const m of MODULES) {
      const w = werkzeugeFuer(m.id, t)
      expect(Array.isArray(w), `${m.id} liefert keine Liste`).toBe(true)
      // Genau dieser Zugriff hat die Shell weiss geschaltet.
      expect(() => w.length).not.toThrow()
    }
  })

  it('die Tabelle selbst hat NICHT fuer jedes Modul einen Eintrag', () => {
    // Die Gegenprobe zum Test darueber: waere die Tabelle vollstaendig, liefe
    // er ins Leere und bewiese nichts. Der Schutz sitzt im `?? []`, nicht in
    // einer vollstaendigen Tabelle — und genau die Luecke ist gewollt.
    const tabelle = toolbars(t)
    const ohneEintrag = MODULES.filter((m) => tabelle[m.id] === undefined)
    expect(ohneEintrag.length).toBeGreaterThan(0)
    expect(ohneEintrag.map((m) => m.id)).toEqual(
      expect.arrayContaining(['lager', 'gebaeude']),
    )
  })
})

describe('Mitgelieferte Planer laufen auch', () => {
  it('ein relativer Pfad gilt als mitgeliefert — das ist der Pages-Fall', () => {
    // Der Pages-Lauf setzt VITE_PLANNER_* auf `./planners/<modul>/` und legt
    // die gebauten Planer daneben. Eine Adresse ohne Schema zeigt auf etwas,
    // das MIT der Shell ausgeliefert wird: es ist genau dann da, wenn die
    // Shell da ist.
    expect(adresseMitgeliefert('./planners/lager/')).toBe(true)
    expect(adresseMitgeliefert('planners/lager/')).toBe(true)
    expect(adresseMitgeliefert('/av-planner-suite/planners/lager/')).toBe(true)
  })

  it('das planner-*://-Schema der Desktop-Suite gilt als mitgeliefert', () => {
    expect(adresseMitgeliefert('planner-lager://index.html')).toBe(true)
  })

  it('eine http-Adresse gilt NICHT als mitgeliefert', () => {
    // Sie zeigt auf einen Dienst, der laufen muss (im Entwicklungsbetrieb
    // `localhost:418x`). Steht er nicht, ist ein toter Rahmen die schlechtere
    // Antwort als eine Flaeche, die sagt, dass sie eine Vorschau ist.
    expect(adresseMitgeliefert('http://localhost:4184/')).toBe(false)
    expect(adresseMitgeliefert('https://example.invalid/planer/')).toBe(false)
    expect(adresseMitgeliefert(undefined)).toBe(false)
  })

  it('im Entwicklungsbetrieb steht die Vorschau — dort zeigen die Adressen auf localhost', () => {
    // Ohne gesetzte VITE_PLANNER_*-Variablen greifen die Dev-Fallbacks. Fiele
    // dieser Test um, hiesse das: die Voreinstellung hat sich gedreht, und ein
    // Entwickler ohne laufende Dev-Server saehe fuenf tote Rahmen.
    for (const id of ['signal', 'cameras', 'licht', 'lager', 'gebaeude'] as const) {
      expect(plannerMitgeliefert(id), `${id} haette einen mitgelieferten Planer`).toBe(false)
    }
  })
})
