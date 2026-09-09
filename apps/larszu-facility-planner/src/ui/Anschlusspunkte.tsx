// ───────────────────────────────────────────────────────────────────────────
// Anschlusspunkte — was ein Punkt hergibt, wo er ist, und ob er frei ist.
//
// Drei der sechs Vertragsfragen auf einem Blatt: `einspeisung`, `ort`,
// `verfuegbarkeit`. Die Ansicht ruft sie AUF, statt ihre Felder selbst
// zusammenzusuchen — sonst gäbe es die Auskunft zweimal, und die zweite
// Fassung liefe beim nächsten Feld weg.
//
// DIE SPALTE, AUF DIE ES ANKOMMT, IST „DAUERLAST". Sie zeigt, was das Gebäude
// ANGIBT — und wo es nichts angibt, den Grund statt einer Zahl.
// `absicherungA × 230` wäre die naheliegendste Zeile dieser Datei und die
// gefährlichste: der Nennstrom ist die Auslöseschwelle des Schutzschalters,
// nicht die zulässige Dauerlast. Eine hier gerechnete Zahl sähe im Plan aus
// wie eine Auskunft des Hauses.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { belastbarkeit, einspeisung, ort, verfuegbarkeit } from '../domain/vertrag'
import type { Anschlussart, Netzform, RcdTyp } from '../domain/modell'

const ANSCHLUSSARTEN: Anschlussart[] = ['cee63', 'cee32', 'cee16', 'powerlock', 'klemme', 'schuko']
const NETZFORMEN: Netzform[] = ['TN-S', 'TN-C-S', 'TT', 'IT']
const RCD: RcdTyp[] = ['A', 'F', 'B', 'keiner']

/** Ja / nein / nichts gesagt — als drei Zustände, nicht als zwei. */
const jaNein = (v: boolean | undefined): string =>
  v === undefined ? 'nicht angegeben' : v ? 'ja' : 'nein'

export function Anschlusspunkte() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const punktAnlegen = useGebaeudeStore((s) => s.punktAnlegen)
  const punktAendern = useGebaeudeStore((s) => s.punktAendern)
  const raumAnlegen = useGebaeudeStore((s) => s.raumAnlegen)

  const [bezeichnung, setBezeichnung] = useState('')
  const [raumName, setRaumName] = useState('')

  const raumAnlegenUndPunkt = () => {
    const b = bezeichnung.trim()
    if (!b) return
    let raumId = gebaeude.raeume[0]?.id
    if (!raumId) {
      const n = raumName.trim() || 'Raum 1'
      raumId = raumAnlegen({ name: n, hausbezeichner: n })
    }
    punktAnlegen({
      bezeichnung: b,
      art: 'dose',
      raumId,
      anschlussart: 'schuko',
      netzform: 'TN-S',
      absicherungA: 16,
      charakteristik: 'B',
      rcdTyp: 'A',
    })
    setBezeichnung('')
  }

  return (
    <section>
      <div className="leiste">
        <input
          value={bezeichnung}
          onChange={(e) => setBezeichnung(e.target.value)}
          placeholder="Neuer Anschlusspunkt"
          aria-label="Bezeichnung des Anschlusspunkts"
        />
        {gebaeude.raeume.length === 0 && (
          <input
            value={raumName}
            onChange={(e) => setRaumName(e.target.value)}
            placeholder="Raum (wird mit angelegt)"
            aria-label="Raum"
          />
        )}
        <button type="button" onClick={raumAnlegenUndPunkt}>
          Anlegen
        </button>
      </div>

      {gebaeude.punkte.length === 0 ? (
        <p className="leer">
          Noch kein Anschlusspunkt. Ein Punkt ist alles, woran der Aufbau Strom bekommt —
          die Einspeisung am Schaltschrank ebenso wie die Dose in der Wand. Beide tragen
          dieselben Angaben, weil ein Plan von beiden dasselbe wissen muss.
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <thead>
              <tr>
                <th>Bezeichnung</th>
                <th>Art</th>
                <th>Anschluss</th>
                <th>Netzform</th>
                <th className="rechts">Absicherung</th>
                <th>RCD</th>
                <th>Dauerlast</th>
                <th>Ort</th>
                <th>Geschaltet</th>
                <th>Gedimmt</th>
                <th>Frei</th>
              </tr>
            </thead>
            <tbody>
              {gebaeude.punkte.map((p) => {
                const a = einspeisung(gebaeude, p.id)!
                const o = ort(gebaeude, p.id)
                const v = verfuegbarkeit(gebaeude, p.id)!
                const last = belastbarkeit(p)
                return (
                  <tr key={p.id}>
                    <td>{a.bezeichnung}</td>
                    <td>{p.art === 'einspeisung' ? 'Einspeisung' : 'Dose'}</td>
                    <td>
                      <select
                        value={p.anschlussart}
                        onChange={(e) =>
                          punktAendern(p.id, { anschlussart: e.target.value as Anschlussart })
                        }
                        aria-label={`Anschlussart von ${a.bezeichnung}`}
                      >
                        {ANSCHLUSSARTEN.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={p.netzform}
                        onChange={(e) => punktAendern(p.id, { netzform: e.target.value as Netzform })}
                        aria-label={`Netzform von ${a.bezeichnung}`}
                      >
                        {NETZFORMEN.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="rechts">
                      <input
                        type="number"
                        min="1"
                        value={p.absicherungA}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          if (Number.isFinite(n) && n > 0) punktAendern(p.id, { absicherungA: n })
                        }}
                        aria-label={`Absicherung von ${a.bezeichnung}`}
                        className="schmal"
                      />
                    </td>
                    <td>
                      <select
                        value={p.rcdTyp}
                        onChange={(e) => punktAendern(p.id, { rcdTyp: e.target.value as RcdTyp })}
                        aria-label={`RCD-Typ von ${a.bezeichnung}`}
                      >
                        {RCD.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {last.watt === null ? (
                        <span className="leise" title={last.grund}>
                          nicht angegeben
                        </span>
                      ) : (
                        `${last.watt} W`
                      )}
                    </td>
                    <td>{o.gefunden ? o.hausbezeichner : <span className="leise">{o.grund}</span>}</td>
                    <td className="leise">{jaNein(v.geschaltet)}</td>
                    <td className="leise">{jaNein(v.gedimmt)}</td>
                    <td>{v.frei ? 'frei' : v.belegtDurch}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
