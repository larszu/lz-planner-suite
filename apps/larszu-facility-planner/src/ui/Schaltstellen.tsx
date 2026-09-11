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
import { useT } from '../i18n'
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

type UebersetzFn = (key: string, en: string) => string

/** Als FUNKTIONEN und nicht als Modul-Konstanten: eine Konstante wird beim
 *  Laden einmal gebaut und bliebe in der Sprache stehen, die damals galt. */
const herkunftText = (t: UebersetzFn): Record<string, string> => ({
  stelle: t('switches.origin.point', 'named switch point'),
  angabe: t('switches.origin.stated', 'stated by the operator, without a point'),
  nein: t('switches.origin.no', 'not switched'),
  unbekannt: t('switches.origin.unknown', 'unknown — nobody has said'),
})

/**
 * Die Bauart in Worten.
 *
 * Bis 2026-09-11 stand die KENNUNG in der Zelle und in der Auswahl:
 * `schluesselschalter`, klein und ohne Leerzeichen. Sie ist ein Name für den
 * Code; was der Mensch liest, muss ein Wort seiner Sprache sein — und in
 * einer englischen Oberfläche wäre sie nicht einmal mehr zu erraten.
 */
const bauartText = (t: UebersetzFn): Record<Schalterbauart, string> => ({
  ausschalter: t('switches.type.single', 'One-way switch'),
  serienschalter: t('switches.type.double', 'Double switch'),
  wechselschalter: t('switches.type.twoWay', 'Two-way switch'),
  kreuzschalter: t('switches.type.intermediate', 'Intermediate switch'),
  taster: t('switches.type.push', 'Push button'),
  zeitschaltuhr: t('switches.type.timer', 'Time switch'),
  dimmer: t('switches.type.dimmer', 'Dimmer'),
  schluesselschalter: t('switches.type.key', 'Key switch'),
})

export function Schaltstellen() {
  const { t, format } = useT()
  const HERKUNFT_TEXT = herkunftText(t)
  const BAUART_TEXT = bauartText(t)
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
          placeholder={t('switches.name.placeholder', 'Name (e.g. switch stage left)')}
          aria-label={t('common.name', 'Name')}
        />
        <select value={raumId} onChange={(e) => setRaumId(e.target.value)} aria-label={t('common.room', 'Room')}>
          <option value="">{t('switches.room.none', 'Room …')}</option>
          {gebaeude.raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={bauart}
          onChange={(e) => setBauart(e.target.value as Schalterbauart)}
          aria-label={t('switches.type', 'Type')}
        >
          {BAUARTEN.map((b) => (
            <option key={b} value={b}>
              {BAUART_TEXT[b]}
            </option>
          ))}
        </select>
        <input
          value={hinweis}
          onChange={(e) => setHinweis(e.target.value)}
          placeholder={t('switches.note.placeholder', 'Note (e.g. switches off from 22:00)')}
          aria-label={t('common.note', 'Note')}
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
          {t('switches.add', 'Add switch point')}
        </button>
      </div>

      {stellen.length === 0 ? (
        <p className="leer">{t('switches.empty', 'No switch point recorded yet.')}</p>
      ) : (
        <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>{t('common.name', 'Name')}</th>
              <th>{t('common.room', 'Room')}</th>
              <th>{t('switches.type', 'Type')}</th>
              <th>{t('switches.col.switches', 'Switches')}</th>
              <th>{t('switches.col.assign', 'Assign point')}</th>
              <th>{t('common.note', 'Note')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stellen.map((s) => (
              <tr key={s.id}>
                <td>{s.bezeichnung}</td>
                <td>{raumName(s.raumId)}</td>
                <td>{BAUART_TEXT[s.bauart]}</td>
                <td>
                  {s.schaltetPunkte.length === 0
                    ? '—'
                    : s.schaltetPunkte.map(punktName).join(', ')}
                </td>
                <td>
                  <select
                    value=""
                    aria-label={format(t('switches.assign.aria', 'Assign a point to {name}'), {
                      name: s.bezeichnung,
                    })}
                    onChange={(e) => {
                      const id = e.target.value
                      if (!id || s.schaltetPunkte.includes(id)) return
                      schaltstelleAendern(s.id, {
                        schaltetPunkte: [...s.schaltetPunkte, id],
                      })
                    }}
                  >
                    <option value="">{t('switches.assign.none', 'add …')}</option>
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
                    {t('common.remove', 'Remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <h3>{t('switches.origin.title', 'Per connection point: how do we know?')}</h3>
      <p className="leer">
        {t(
          'switches.origin.hint',
          'Four answers, not two. "Unknown" does not mean "no" — that is the difference that counts on site.',
        )}
      </p>
      <div className="tabelle-rahmen">
      <table>
        <thead>
          <tr>
            <th>{t('dist.col.point', 'Point')}</th>
            <th>{t('switches.col.switched', 'Switched?')}</th>
            <th>{t('switches.col.source', 'Source')}</th>
          </tr>
        </thead>
        <tbody>
          {gebaeude.punkte.map((p) => {
            const h = geschaltetVon(gebaeude, p.id)
            return (
              <tr key={p.id}>
                <td>{p.bezeichnung}</td>
                <td>
                  {h.art === 'stelle' || h.art === 'angabe'
                    ? t('common.yes', 'yes')
                    : h.art === 'nein'
                      ? t('common.no', 'no')
                      : '?'}
                </td>
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
