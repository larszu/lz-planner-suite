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
import { useT } from '../i18n'
import { TabelleRahmen } from './TabelleRahmen'
import { Anlegen, Feld } from './Formular'
import { bauformText } from './beschriftungen'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { belastbarkeit, einspeisung, ort, verfuegbarkeit } from '../domain/vertrag'
import type { Anschlussart, Bauform, Netzform, RcdTyp } from '../domain/modell'

const ANSCHLUSSARTEN: Anschlussart[] = ['cee63', 'cee32', 'cee16', 'powerlock', 'klemme', 'schuko']
const NETZFORMEN: Netzform[] = ['TN-S', 'TN-C-S', 'TT', 'IT']
const RCD: RcdTyp[] = ['A', 'F', 'B', 'keiner']

/**
 * Die Bauformen aus Issue #1. `sonstige` steht bewusst mit drin: das Haus hat
 * Gehäuse, die keine Liste vorwegnimmt, und sie in eine der fünf zu pressen
 * wäre eine Angabe, die niemand gemacht hat.
 */
const BAUFORMEN: Bauform[] = [
  'wanddose',
  'bodentank',
  'unterflurdose',
  'bruestungskanal',
  'wandauslass',
  'sonstige',
]

type UebersetzFn = (key: string, en: string) => string

/** Ja / nein / nichts gesagt — als drei Zustände, nicht als zwei. */
const jaNein = (v: boolean | undefined, t: UebersetzFn): string =>
  v === undefined ? t('common.notStated', 'not stated') : v ? t('common.yes', 'yes') : t('common.no', 'no')

export function Anschlusspunkte() {
  const { t, format } = useT()
  const BAUFORM_TEXT = bauformText(t)
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
      const n = raumName.trim() || t('points.room.default', 'Room 1')
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
      <Anlegen
        titel={t('points.create.head', 'Add a connection point')}
        leer={gebaeude.punkte.length === 0}
        onAbsenden={raumAnlegenUndPunkt}
      >
        <Feld name={t('points.new.aria', 'Name of the connection point')}>
          <input
            value={bezeichnung}
            onChange={(e) => setBezeichnung(e.target.value)}
            placeholder={t('points.new.placeholder', 'New connection point')}
          />
        </Feld>
        {gebaeude.raeume.length === 0 && (
          <Feld name={t('common.room', 'Room')}>
            <input
              value={raumName}
              onChange={(e) => setRaumName(e.target.value)}
              placeholder={t('points.room.placeholder', 'Room (created along with it)')}
            />
          </Feld>
        )}
        <button type="submit" className="knopf-primaer" disabled={!bezeichnung.trim()}>
          {t('common.add', 'Add')}
        </button>
      </Anlegen>

      {gebaeude.punkte.length === 0 ? (
        <div className="leer-flaeche">
          <p className="leer">
              {t(
                'points.empty',
                'No connection point yet. A point is anything the rig draws power from — the feed at the cabinet as much as the outlet in the wall. Both carry the same fields, because a plan needs to know the same things about both.',
              )}
          </p>
        </div>
      ) : (
        <TabelleRahmen>
          <table>
            <thead>
              <tr>
                <th>{t('common.name', 'Name')}</th>
                <th>{t('common.kind', 'Kind')}</th>
                <th>{t('points.col.form', 'Housing')}</th>
                <th>{t('points.col.connector', 'Connector')}</th>
                <th>{t('points.col.system', 'Earthing system')}</th>
                <th className="rechts">{t('points.col.breaker', 'Breaker')}</th>
                <th>RCD</th>
                <th>{t('points.col.load', 'Continuous load')}</th>
                <th>{t('points.col.place', 'Place')}</th>
                <th>{t('points.col.switched', 'Switched')}</th>
                <th>{t('points.col.dimmed', 'Dimmed')}</th>
                <th>{t('points.col.free', 'Free')}</th>
              </tr>
            </thead>
            <tbody>
              {gebaeude.punkte.map((p) => {
                const a = einspeisung(gebaeude, p.id)!
                const o = ort(gebaeude, p.id, t)
                const v = verfuegbarkeit(gebaeude, p.id)!
                const last = belastbarkeit(p, t)
                return (
                  <tr key={p.id}>
                    <td>{a.bezeichnung}</td>
                    <td>{p.art === 'einspeisung' ? t('points.kind.feed', 'Feed') : t('points.kind.outlet', 'Outlet')}</td>
                    {/* Issue #1 — die Bauform ist NICHT die Montageart. Ein
                        Bodentank und eine Unterflurdose sind beide
                        `montage: 'boden'` und verhalten sich vollkommen
                        verschieden: der Tank nimmt einen Satz Kupplungen auf
                        und laesst den Deckel offen, die Unterflurdose fasst
                        einen Stecker und muss buendig schliessen. Wer nur die
                        Montageart fuehrt, plant beides als dasselbe. */}
                    <td>
                      {p.art === 'einspeisung' ? (
                        '—'
                      ) : (
                        <select
                          value={p.bauform ?? ''}
                          onChange={(e) =>
                            punktAendern(p.id, {
                              bauform: (e.target.value || undefined) as Bauform | undefined,
                            })
                          }
                          aria-label={format(t('points.form.aria', 'Housing of {name}'), { name: a.bezeichnung })}
                        >
                          <option value="">{t('common.notStated', 'not stated')}</option>
                          {BAUFORMEN.map((x) => (
                            <option key={x} value={x}>
                              {BAUFORM_TEXT[x]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <select
                        value={p.anschlussart}
                        onChange={(e) =>
                          punktAendern(p.id, { anschlussart: e.target.value as Anschlussart })
                        }
                        aria-label={format(t('points.connector.aria', 'Connector of {name}'), { name: a.bezeichnung })}
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
                        aria-label={format(t('points.system.aria', 'Earthing system of {name}'), { name: a.bezeichnung })}
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
                        aria-label={format(t('points.breaker.aria', 'Breaker of {name}'), { name: a.bezeichnung })}
                        className="schmal"
                      />
                    </td>
                    <td>
                      <select
                        value={p.rcdTyp}
                        onChange={(e) => punktAendern(p.id, { rcdTyp: e.target.value as RcdTyp })}
                        aria-label={format(t('points.rcd.aria', 'RCD type of {name}'), { name: a.bezeichnung })}
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
                          {t('common.notStated', 'not stated')}
                        </span>
                      ) : (
                        `${last.watt} W`
                      )}
                    </td>
                    <td>{o.gefunden ? o.hausbezeichner : <span className="leise">{o.grund}</span>}</td>
                    <td className="leise">{jaNein(v.geschaltet, t)}</td>
                    <td className="leise">{jaNein(v.gedimmt, t)}</td>
                    <td>{v.frei ? t('points.free', 'free') : v.belegtDurch}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TabelleRahmen>
      )}
    </section>
  )
}
