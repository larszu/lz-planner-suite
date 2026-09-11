// ───────────────────────────────────────────────────────────────────────────
// Die obere Leiste — im Schnitt des Cable Planners (ADR-007 Abschnitt 6).
//
//   40 px hoch · Menüs links · Einstellungen rechts aussen
//
// WELCHE MENÜS, UND WARUM NICHT FÜNF. Der Cable Planner führt fünf: Datei ·
// Bearbeiten · Werkzeuge · Ansicht · Hilfe. Dieses Repo führt ZWEI, und das
// ist kein Rückstand, sondern eine Messung: ein Lager hat keinen
// Zeichenbereich, also nichts einzupassen und nichts zu zoomen, und es hat
// keine Rückgängig-Kette. Ein Menü „Ansicht" mit einem ausgegrauten
// „Einpassen" wäre ein PLACEHOLDER — es sähe aus wie eine Funktion und wäre
// keine.
//
// `scripts/chrome-parity.mjs` in der Suite misst genau das: `File` und `Help`
// sind Pflicht (jede App hat ihre Daten und ihre Auskunft über sich selbst),
// `Edit`/`Tools`/`View` nur dort, wo das Darunterliegende existiert — und die
// REIHENFOLGE der vorhandenen bleibt immer die des Cable Planners.
//
// DIE BESCHRIFTUNGEN SIND DEUTSCH, und das ist kein Bruch der
// Vereinheitlichung, sondern ihre Voraussetzung. Der Cable Planner ist
// englisch-quellig (E-28), dieses Repo deutsch (`package.json` ->
// `avplan.sourceLanguage: de`, von `lang:check` gemessen). Vereinheitlicht
// wird der BAU der Leiste — Reihenfolge, Position, Verhalten —, nicht die
// Sprache: „File" in einer deutschen Oberfläche wäre ein Sprachmix, und
// gegen genau den steht in dieser Suite ein eigener Zähler.
// `chrome-parity.mjs` misst deshalb die ROLLE eines Menüs und nicht sein
// Wort.
//
// DIE REITER SIND KEIN MENÜ. Sie standen bis 2026-09-11 in derselben Zeile
// wie der App-Name und sahen damit aus wie eine Menüleiste. Sie sind aber
// Modul-Navigation — in der Suite ist das die Rail links, hier eine eigene
// Zeile unter der Kopfzeile. Zwei verschiedene Dinge in einer Zeile heisst:
// der Nutzer muss raten, welches davon was tut.
// ───────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { Menue, MenuePunkt, MenueTrenner } from './Menue'
import { Einstellungen } from './Einstellungen'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { serializeInventory, parseInventory } from '../domain/lib/inventoryPortable'

/** Lädt einen Text als Datei herunter. */
const gibAus = (name: string, inhalt: string) => {
  const blob = new Blob([inhalt], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

const heute = () => new Date().toISOString().slice(0, 10)

/** Der Vorgabename beider Speicher-Einträge — einmal formuliert, damit
 *  „Speichern" und „Speichern unter…" nicht auseinanderlaufen. */
const standardName = () => `bestand-${heute()}.avplan-inventory.json`

export function Kopfzeile() {
  const [einstellungenOffen, setEinstellungenOffen] = useState(false)
  const dateiFeld = useRef<HTMLInputElement>(null)
  const exportSnapshot = useInventoryStore((s) => s.exportSnapshot)
  const importSnapshot = useInventoryStore((s) => s.importSnapshot)

  const speichern = (name: string) => {
    gibAus(name, serializeInventory(exportSnapshot(), { exportedAt: new Date().toISOString(), app: 'inventory-planner' }))
  }

  const oeffnen = async (datei: File) => {
    const snap = parseInventory(await datei.text())
    if (!snap) {
      // ADR-005 — laut scheitern. Eine Datei, die nicht gelesen werden kann,
      // darf nicht als „nichts passiert" durchgehen.
      window.alert('Die Datei ist kein lesbarer Lagerbestand (avplan-inventory).')
      return
    }
    const bericht = importSnapshot(snap, 'replace')
    // ADR-005 — was nicht bewahrt werden konnte, wird GENANNT und nicht
    // stillschweigend weggezählt.
    if (bericht.rejected.length > 0) {
      window.alert(
        `${bericht.imported} übernommen, ${bericht.rejected.length} abgewiesen.\n\n` +
          bericht.rejected.slice(0, 5).map((r) => `· ${r.kind}: ${r.label}`).join('\n'),
      )
    }
  }

  return (
    <>
      <header className="kopf">
        <span className="marke">Lager</span>

        <Menue label="Datei">
          {(zu) => (
            <>
              <MenuePunkt
                onClick={() => {
                  zu()
                  // DIE VERNEINUNG IST DER PUNKT. Vorher stand hier
                  // `if (window.confirm('… Vorher speichern?')) return` — wer
                  // den Dialog mit OK bestätigte, bekam NICHTS, und wer auf
                  // „Abbrechen" drückte, verlor seinen Bestand. Ein
                  // Bestätigungsdialog, dessen Abbruch die Tat ausführt, ist
                  // schlimmer als gar keiner: er erzeugt genau das Vertrauen,
                  // das er dann bricht.
                  //
                  // Die Frage lautet jetzt nach der Tat und nicht nach einer
                  // Vorbereitung darauf, damit OK und Abbrechen das
                  // Naheliegende tun.
                  if (!window.confirm('Neues Lager — der aktuelle Bestand wird ersetzt. Fortfahren?')) return
                  importSnapshot({ items: [], nodes: [], sets: [], units: [] }, 'replace')
                }}
              >
                Neues Lager
              </MenuePunkt>
              <MenuePunkt onClick={() => { zu(); dateiFeld.current?.click() }}>Öffnen…</MenuePunkt>
              <MenueTrenner />
              <MenuePunkt onClick={() => { zu(); speichern(standardName()) }}>Speichern</MenuePunkt>
              <MenuePunkt
                onClick={() => {
                  zu()
                  // „Speichern unter…" unterscheidet sich vom „Speichern"
                  // durch GENAU eine Sache: den Namen. Vorher legten beide
                  // Einträge dieselbe Datei ab, nur mit anderem Vorgabenamen —
                  // zwei Wege zu einer Sache, und der zweite sah aus wie eine
                  // Fähigkeit, die es nicht gab. Der Browser fragt beim
                  // Download ohnehin nach dem ORT; was er nicht fragt, ist der
                  // NAME, und genau den holt dieser Eintrag.
                  const name = window.prompt('Dateiname', standardName())
                  if (!name) return
                  speichern(name)
                }}
              >
                Speichern unter…
              </MenuePunkt>
            </>
          )}
        </Menue>

        <Menue label="Hilfe">
          {(zu) => (
            <MenuePunkt onClick={() => { zu(); setEinstellungenOffen(true) }}>Über Inventory Planner…</MenuePunkt>
          )}
        </Menue>

        {/* Rechts aussen, als LETZTER Bedienpunkt der Zeile — dieselbe Stelle
            wie im Cable Planner. Das Wort ab breiteren Fenstern, darunter nur
            das Zeichen, damit die Zeile auf schmalen nicht bricht. */}
        <div className="kopf-rechts">
          <button
            type="button"
            className="kopf-knopf"
            onClick={() => setEinstellungenOffen(true)}
            title="Einstellungen"
          >
            <span aria-hidden="true">⚙</span>
            <span className="nur-breit">Einstellungen</span>
          </button>
        </div>

        <input
          ref={dateiFeld}
          type="file"
          accept=".json"
          className="versteckt"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void oeffnen(f)
            e.target.value = ''
          }}
        />
      </header>
      {einstellungenOffen && <Einstellungen onClose={() => setEinstellungenOffen(false)} />}
    </>
  )
}
