// ───────────────────────────────────────────────────────────────────────────
// Schaltstellen — wer schaltet diese Dose ab, und wo sitzt er?
//
// Das ist der zweite offene Punkt aus Issue #1 („feste Schalterstellen als
// eigenes Objekt").
//
// ─── WARUM EIN BOOLEAN NICHT REICHTE ───────────────────────────────────────
//
// Am Anschlusspunkt stand `geschaltet?: boolean`. Das genügt für die Warnung
// („dein Netzteil hängt an einem Lichtschalter") und genügt nicht für die
// Frage danach, die jemand im Aufbau stellt, wenn das Licht ausgeht: WELCHER
// Schalter ist das, wo ist er, und was hängt sonst noch daran?
//
// Ein Boolean kann darauf nicht antworten. Ein Datensatz mit Raum,
// Bezeichnung und Bauart schon — und die Zeitschaltuhr steht in der Liste der
// Bauarten, weil sie der Fall ist, der am meisten weh tut: sie schaltet
// nachts ab, während niemand danebensteht.
//
// ─── „UNBEKANNT" IST NICHT „NEIN" ──────────────────────────────────────────
//
// `geschaltetVon()` unterscheidet vier Fälle statt zwei. Der Unterschied
// zwischen „der Betreiber sagt nein" und „niemand hat etwas gesagt" ist der,
// der im Aufbau zählt; wer ihn einebnet, schreibt „nicht geschaltet" auf ein
// Blatt, mit dem jemand ein Netzteil an eine Dose hängt, die um 22:00 abfällt.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { geschaltetVon } from '../domain/gebaeudeAuskunft'
import type { Schalterbauart } from '../domain/modell'

const BAUARTEN: Schalterbauart[] = [
  'ausschalter',
  'serienschalter',
  'wechselschalter',
  'kreuzschalter',
  'taster',
  'zeitschaltuhr',
  'dimmer',
  'schluesselschalter',
]

const HERKUNFT_TEXT: Record<string, string> = {
  stelle: 'benannte Stelle',
  angabe: 'Angabe des Betreibers, ohne Stelle',
  nein: 'nicht geschaltet',
  unbekannt: 'unbekannt — niemand hat es gesagt',
}

export function Schaltstellen() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const schaltstelleAnlegen = useGebaeudeStore((s) => s.schaltstelleAnlegen)
  const schaltstelleAendern = useGebaeudeStore((s) => s.schaltstelleAendern)
  const entfernen = useGebaeudeStore((s) => s.entfernen)
  const [bezeichnung, setBezeichnung] = useState('')
  const [raumId, setRaumId] = useState('')
  const [bauart, setBauart] = useState<Schalterbauart>('ausschalter')
  const [hinweis, setHinweis] = useState('')

  const stellen = gebaeude.schaltstellen ?? []
  const raumName = (id: string) => gebaeude.raeume.find((r) => r.id === id)?.name ?? '—'
  const punktName = (id: string) => gebaeude.punkte.find((p) => p.id === id)?.bezeichnung ?? id

  const anlegbar = bezeichnung.trim() !== '' && raumId !== ''

  return (
    <section>
      <div className="leiste">
        <input
          value={bezeichnung}
          onChange={(e) => setBezeichnung(e.target.value)}
          placeholder="Bezeichnung (z. B. Schalter Bühne links)"
          aria-label="Bezeichnung"
        />
        <select value={raumId} onChange={(e) => setRaumId(e.target.value)} aria-label="Raum">
          <option value="">Raum …</option>
          {gebaeude.raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={bauart}
          onChange={(e) => setBauart(e.target.value as Schalterbauart)}
          aria-label="Bauart"
        >
          {BAUARTEN.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          value={hinweis}
          onChange={(e) => setHinweis(e.target.value)}
          placeholder="Hinweis (z. B. schaltet ab 22:00)"
          aria-label="Hinweis"
        />
        <button
          type="button"
          disabled={!anlegbar}
          onClick={() => {
            schaltstelleAnlegen({
              bezeichnung: bezeichnung.trim(),
              raumId,
              bauart,
              schaltetPunkte: [],
              hinweis: hinweis.trim() || undefined,
            })
            setBezeichnung('')
            setHinweis('')
          }}
        >
          Schaltstelle anlegen
        </button>
      </div>

      {stellen.length === 0 ? (
        <p className="leer">Noch keine Schaltstelle erfasst.</p>
      ) : (
        <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>Bezeichnung</th>
              <th>Raum</th>
              <th>Bauart</th>
              <th>Schaltet</th>
              <th>Punkt zuordnen</th>
              <th>Hinweis</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stellen.map((s) => (
              <tr key={s.id}>
                <td>{s.bezeichnung}</td>
                <td>{raumName(s.raumId)}</td>
                <td>{s.bauart}</td>
                <td>
                  {s.schaltetPunkte.length === 0
                    ? '—'
                    : s.schaltetPunkte.map(punktName).join(', ')}
                </td>
                <td>
                  <select
                    value=""
                    aria-label={`Punkt zu ${s.bezeichnung} zuordnen`}
                    onChange={(e) => {
                      const id = e.target.value
                      if (!id || s.schaltetPunkte.includes(id)) return
                      schaltstelleAendern(s.id, {
                        schaltetPunkte: [...s.schaltetPunkte, id],
                      })
                    }}
                  >
                    <option value="">hinzufügen …</option>
                    {gebaeude.punkte
                      .filter((p) => !s.schaltetPunkte.includes(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.bezeichnung}
                        </option>
                      ))}
                  </select>
                </td>
                <td>{s.hinweis ?? '—'}</td>
                <td>
                  <button type="button" onClick={() => entfernen(s.id)}>
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <h3>Je Anschlusspunkt: woher wissen wir das?</h3>
      <p className="leer">
        Vier Antworten und nicht zwei. „Unbekannt" heisst nicht „nein" — der Unterschied ist der,
        der im Aufbau zählt.
      </p>
      <div className="tabelle-rahmen">
      <table>
        <thead>
          <tr>
            <th>Punkt</th>
            <th>Geschaltet?</th>
            <th>Quelle</th>
          </tr>
        </thead>
        <tbody>
          {gebaeude.punkte.map((p) => {
            const h = geschaltetVon(gebaeude, p.id)
            return (
              <tr key={p.id}>
                <td>{p.bezeichnung}</td>
                <td>{h.art === 'stelle' || h.art === 'angabe' ? 'ja' : h.art === 'nein' ? 'nein' : '?'}</td>
                <td>
                  {HERKUNFT_TEXT[h.art]}
                  {h.art === 'stelle' ? ` — ${h.stelle.bezeichnung}` : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </section>
  )
}
