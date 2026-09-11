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
import { useT } from '../i18n'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { wegFrei } from '../domain/gebaeudeAuskunft'
import type { Belegung } from '../domain/modell'

const BELEGUNGEN: Belegung[] = ['unbekannt', 'frei', 'teilbelegt', 'voll']

type UebersetzFn = (key: string, en: string) => string

/** Als FUNKTION und nicht als Modul-Konstante: die würde beim Laden einmal
 *  gebaut und bliebe in der Sprache stehen, die damals galt. */
const belegungText = (t: UebersetzFn): Record<Belegung, string> => ({
  unbekannt: t('routes.load.unknown', 'unknown — nobody has looked'),
  frei: t('routes.load.free', 'free'),
  teilbelegt: t('routes.load.partial', 'partly occupied'),
  voll: t('routes.load.full', 'full'),
})

/**
 * Was `wegFrei` zurückgibt, in einem Satz.
 *
 * Bis 2026-09-11 stand die KENNUNG in der Zelle: `keine-trasse` mit
 * Bindestrich, mitten in einer Tabelle aus deutschen Wörtern. Eine Kennung
 * ist ein Name für den Code und keine Auskunft für den Menschen — und
 * „keine-trasse" beantwortet die Frage der Spalte („bester Weg") gerade
 * nicht, sondern sagt, dass es keinen gibt.
 */
const wegText = (lage: ReturnType<typeof wegFrei>, t: UebersetzFn): string =>
  ({
    frei: t('routes.best.free', 'free'),
    teilbelegt: t('routes.best.partial', 'partly occupied'),
    voll: t('routes.best.full', 'full'),
    unbekannt: t('routes.best.unknown', 'unknown'),
    'keine-trasse': t('routes.best.none', 'no route between these rooms'),
  })[lage]

export function Trassen() {
  const { t: uebersetze } = useT()
  const BELEGUNG_TEXT = belegungText(uebersetze)
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
          placeholder={uebersetze('routes.name.placeholder', 'Name (e.g. conduit stage–control room)')}
          aria-label={uebersetze('routes.name', 'Name')}
        />
        <select value={von} onChange={(e) => setVon(e.target.value)} aria-label={uebersetze('routes.from.aria', 'From room')}>
          <option value="">{uebersetze('routes.from', 'from …')}</option>
          {raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select value={nach} onChange={(e) => setNach(e.target.value)} aria-label={uebersetze('routes.to.aria', 'To room')}>
          <option value="">{uebersetze('routes.to', 'to …')}</option>
          {raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={belegung}
          onChange={(e) => setBelegung(e.target.value as Belegung)}
          aria-label={uebersetze('routes.load', 'Occupancy')}
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
          placeholder={uebersetze('routes.note.placeholder', 'What is already in there?')}
          aria-label={uebersetze('routes.note', 'Note')}
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
          {uebersetze('routes.add', 'Add route')}
        </button>
      </div>

      {raeume.length < 2 && (
        <p className="leer">
          {uebersetze(
            'routes.needRooms',
            'A route connects two rooms. Create at least two rooms under "Connection points" first.',
          )}
        </p>
      )}

      {trassen.length === 0 ? (
        <p className="leer">{uebersetze('routes.empty', 'No route recorded yet.')}</p>
      ) : (
        <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>{uebersetze('routes.name', 'Name')}</th>
              <th>{uebersetze('routes.col.from', 'From')}</th>
              <th>{uebersetze('routes.col.to', 'To')}</th>
              <th>{uebersetze('routes.load', 'Occupancy')}</th>
              <th>{uebersetze('routes.col.best', 'Best route')}</th>
              <th>{uebersetze('routes.note', 'Note')}</th>
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
                <td>{wegText(wegFrei(gebaeude, t.vonRaumId, t.nachRaumId), uebersetze)}</td>
                <td>{t.hinweis ?? '—'}</td>
                <td>
                  <button type="button" onClick={() => entfernen(t.id)}>
                    {uebersetze('common.remove', 'Remove')}
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
