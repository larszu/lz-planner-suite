// ───────────────────────────────────────────────────────────────────────────
// Trassen — welcher Weg zwischen zwei Räumen nimmt noch etwas auf?
//
// Das ist der dritte offene Punkt aus Issue #1 („Leitungswege/Trassen zwischen
// den Punkten, mit Belegung").
//
// ─── WARUM DAS NICHT DIESELBE LISTE IST WIE `HausStrecke` ──────────────────
//
// Eine Hausstrecke ist eine fest verlegte LEITUNG: sie führt Signal oder
// Strom, und ein Plan-Kabel kann sie über eine erklärte Zuordnung benutzen.
// Eine Trasse ist der Kanal — sie führt nichts, sie NIMMT etwas AUF.
//
// Im Aufbau ist das der Unterschied zwischen „da liegt schon eine Leitung, die
// ich benutzen darf" und „da kann ich meine eigene durchziehen". Zwei Fragen,
// zwei Listen.
//
// ─── `unbekannt` IST DIE VORGABE, UND ZWAR ABSICHTLICH ─────────────────────
//
// Wer nicht nachgesehen hat, sagt das. Eine geratene Belegung liest sich im
// Plan genauso wie eine gemessene, und die Folge steht dann als „passt noch
// rein" auf einem Blatt, mit dem jemand auf die Leiter steigt.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { wegFrei } from '../domain/gebaeudeAuskunft'
import type { Belegung } from '../domain/modell'

const BELEGUNGEN: Belegung[] = ['unbekannt', 'frei', 'teilbelegt', 'voll']

const BELEGUNG_TEXT: Record<Belegung, string> = {
  unbekannt: 'unbekannt — niemand hat nachgesehen',
  frei: 'frei',
  teilbelegt: 'teilbelegt',
  voll: 'voll',
}

export function Trassen() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const trasseAnlegen = useGebaeudeStore((s) => s.trasseAnlegen)
  const entfernen = useGebaeudeStore((s) => s.entfernen)
  const [bezeichnung, setBezeichnung] = useState('')
  const [von, setVon] = useState('')
  const [nach, setNach] = useState('')
  const [belegung, setBelegung] = useState<Belegung>('unbekannt')
  const [hinweis, setHinweis] = useState('')

  const raeume = gebaeude.raeume
  const trassen = gebaeude.trassen ?? []
  const raumName = (id: string) => raeume.find((r) => r.id === id)?.name ?? '—'

  const anlegbar = bezeichnung.trim() !== '' && von !== '' && nach !== '' && von !== nach

  return (
    <section>
      <div className="leiste">
        <input
          value={bezeichnung}
          onChange={(e) => setBezeichnung(e.target.value)}
          placeholder="Bezeichnung (z. B. Leerrohr Bühne–Regie)"
          aria-label="Bezeichnung"
        />
        <select value={von} onChange={(e) => setVon(e.target.value)} aria-label="Von Raum">
          <option value="">von …</option>
          {raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select value={nach} onChange={(e) => setNach(e.target.value)} aria-label="Nach Raum">
          <option value="">nach …</option>
          {raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={belegung}
          onChange={(e) => setBelegung(e.target.value as Belegung)}
          aria-label="Belegung"
        >
          {BELEGUNGEN.map((b) => (
            <option key={b} value={b}>
              {BELEGUNG_TEXT[b]}
            </option>
          ))}
        </select>
        <input
          value={hinweis}
          onChange={(e) => setHinweis(e.target.value)}
          placeholder="Was liegt schon drin?"
          aria-label="Hinweis"
        />
        <button
          type="button"
          disabled={!anlegbar}
          onClick={() => {
            trasseAnlegen({
              bezeichnung: bezeichnung.trim(),
              vonRaumId: von,
              nachRaumId: nach,
              belegung,
              hinweis: hinweis.trim() || undefined,
            })
            setBezeichnung('')
            setHinweis('')
          }}
        >
          Trasse anlegen
        </button>
      </div>

      {raeume.length < 2 && (
        <p className="leer">
          Eine Trasse verbindet zwei Räume. Lege zuerst unter „Anschlusspunkte" mindestens zwei
          Räume an.
        </p>
      )}

      {trassen.length === 0 ? (
        <p className="leer">Noch keine Trasse erfasst.</p>
      ) : (
        <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>Bezeichnung</th>
              <th>Von</th>
              <th>Nach</th>
              <th>Belegung</th>
              <th>Bester Weg</th>
              <th>Hinweis</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trassen.map((t) => (
              <tr key={t.id}>
                <td>{t.bezeichnung}</td>
                <td>{raumName(t.vonRaumId)}</td>
                <td>{raumName(t.nachRaumId)}</td>
                <td>{BELEGUNG_TEXT[t.belegung]}</td>
                {/* Der beste Weg zwischen DIESEN beiden Räumen, über alle
                    Trassen hinweg. Wer drei Rohre nebeneinander hat, will
                    nicht drei Zeilen lesen, sondern eine Antwort. */}
                <td>{wegFrei(gebaeude, t.vonRaumId, t.nachRaumId)}</td>
                <td>{t.hinweis ?? '—'}</td>
                <td>
                  <button type="button" onClick={() => entfernen(t.id)}>
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </section>
  )
}
