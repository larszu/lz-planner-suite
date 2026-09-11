// ───────────────────────────────────────────────────────────────────────────
// Die obere Leiste — im Schnitt des Cable Planners (ADR-007 Abschnitt 6).
//
//   40 px hoch · Menüs links · Einstellungen rechts aussen
//
// WELCHE MENÜS, UND WARUM NICHT FÜNF. Der Cable Planner führt fünf: Datei ·
// Bearbeiten · Werkzeuge · Ansicht · Hilfe. Dieses Repo führt ZWEI, und das
// ist kein Rückstand, sondern eine Messung: das Gebäude-Werkzeug trägt ein,
// was das Haus erklärt — es hat keinen Zeichenbereich zum Einpassen und keine
// Rückgängig-Kette. Ein Menü „Ansicht" mit einem ausgegrauten „Einpassen"
// wäre ein PLACEHOLDER.
//
// `scripts/chrome-parity.mjs` in der Suite misst genau das: `Datei` und
// `Hilfe` sind Pflicht (jede App hat ihre Daten und ihre Auskunft über sich
// selbst), die übrigen drei nur dort, wo das Darunterliegende existiert — und
// die REIHENFOLGE der vorhandenen bleibt immer die des Cable Planners.
//
// DIE BESCHRIFTUNGEN SIND DEUTSCH. Dieses Repo ist deutsch-quellig
// (`package.json` → `avplan.sourceLanguage: de`, von `lang:check` gemessen),
// der Cable Planner seit E-28 englisch. Vereinheitlicht wird der BAU der
// Leiste, nicht die Sprache; `chrome-parity.mjs` misst deshalb die ROLLE
// eines Menüs und nicht sein Wort.
//
// DIE REITER SIND KEIN MENÜ. Sie standen bis 2026-09-11 in derselben Zeile
// wie der Gebäudename UND den zwei Datei-Knöpfen — drei verschiedene Dinge
// nebeneinander. Die Reiter ordnen die Module (in der Suite ist das die Rail
// links), die Datei-Knöpfe sind jetzt das Datei-Menü.
// ───────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { Menue, MenuePunkt, MenueTrenner } from './Menue'
import { Einstellungen } from './Einstellungen'

interface Props {
  /** Der Gebäudename — er steht links wie der App-Name im Cable Planner. */
  name: string
  onNeu: () => void
  /** Ohne Namen: der Vorgabename. Mit Namen: „Speichern unter…". */
  onSichern: (dateiname?: string) => void
  onLaden: (datei: File) => void
}

export function Kopfzeile({ name, onNeu, onSichern, onLaden }: Props) {
  const [einstellungenOffen, setEinstellungenOffen] = useState(false)
  const dateiFeld = useRef<HTMLInputElement>(null)
  // Derselbe Vorgabename, den `App.tsx` ohne Argument bildet — hier nur als
  // VORSCHLAG im Eingabefeld. Gebildet wird der Dateiname weiterhin an einer
  // Stelle, nämlich dort, wo auch die Datei entsteht.
  const vorschlag = `${(name || 'gebaeude').replace(/[^\p{L}\p{N}_-]+/gu, '-')}.avfacility`

  return (
    <>
      <header className="kopf">
        <span className="marke">{name || 'Gebäude'}</span>

        <Menue label="Datei">
          {(zu) => (
            <>
              <MenuePunkt
                onClick={() => {
                  zu()
                  // Rückfrage, weil hier etwas VERLOREN geht: das Gebäude
                  // lebt im localStorage dieser App, und ein neues ersetzt
                  // es. Der Cable Planner fragt an derselben Stelle dasselbe.
                  //
                  // DIE VERNEINUNG IST DER PUNKT. Vorher stand hier
                  // `if (window.confirm('… Vorher sichern?')) return` — wer
                  // mit OK bestätigte, bekam NICHTS, und wer auf „Abbrechen"
                  // drückte, verlor sein Gebäude. Ein Bestätigungsdialog,
                  // dessen Abbruch die Tat ausführt, ist schlimmer als gar
                  // keiner: er erzeugt genau das Vertrauen, das er bricht.
                  if (!window.confirm('Neues Gebäude — das aktuelle wird ersetzt. Fortfahren?')) return
                  onNeu()
                }}
              >
                Neues Gebäude
              </MenuePunkt>
              <MenuePunkt onClick={() => { zu(); dateiFeld.current?.click() }}>Öffnen…</MenuePunkt>
              <MenueTrenner />
              <MenuePunkt onClick={() => { zu(); onSichern() }}>Speichern</MenuePunkt>
              <MenuePunkt
                onClick={() => {
                  zu()
                  // „Speichern unter…" unterscheidet sich vom „Speichern"
                  // durch GENAU eine Sache: den Namen. Vorher riefen beide
                  // Einträge dasselbe `onSichern()` — zwei Wege zu einer
                  // Sache, und der zweite sah aus wie eine Fähigkeit, die es
                  // nicht gab. Der Browser fragt beim Download nach dem ORT;
                  // was er nicht fragt, ist der NAME, und den holt dieser
                  // Eintrag.
                  const gewaehlt = window.prompt('Dateiname', vorschlag)
                  if (!gewaehlt) return
                  onSichern(gewaehlt)
                }}
              >
                Speichern unter…
              </MenuePunkt>
            </>
          )}
        </Menue>

        <Menue label="Hilfe">
          {(zu) => (
            <MenuePunkt onClick={() => { zu(); setEinstellungenOffen(true) }}>Über Facility Planner…</MenuePunkt>
          )}
        </Menue>

        {/* Rechts aussen, als LETZTER Bedienpunkt der Zeile — dieselbe Stelle
            wie im Cable Planner. */}
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
          accept=".avfacility,application/json"
          className="versteckt"
          aria-label="Gebäude-Datei laden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) onLaden(f)
          }}
        />
      </header>
      {einstellungenOffen && <Einstellungen onClose={() => setEinstellungenOffen(false)} />}
    </>
  )
}
