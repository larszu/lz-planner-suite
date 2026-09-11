// ───────────────────────────────────────────────────────────────────────────
// Grundriss — wo im Raum sitzt dieser Punkt?
//
// Der vierte offene Punkt aus Issue #1 („Grundriss als Hintergrund, damit ein
// Punkt eine Lage bekommt und nicht nur einen Raumnamen").
//
// ─── DAS BILD LIEGT NICHT IM DOKUMENT ──────────────────────────────────────
//
// `Grundriss` trägt eine ADRESSE (`quelle`) und einen MASSSTAB
// (`meterProBild`), kein Bild. Der Grund steht im Modell und gilt hier
// genauso: ein eingebetteter Scan wären je nach Haus ein paar Megabyte, und
// die trüge der Vertrag durch jede Runde zwischen Haus und Plan.
//
// Die Folge ist sichtbar und beabsichtigt: fehlt das Bild auf diesem Rechner,
// zeigt diese Sicht ein leeres Feld — und die Lagen der Punkte bleiben
// trotzdem gültig und weiter setzbar, weil sie in METERN stehen. Ein Werkzeug,
// das die Marken an Bildpixel hängt, verliert sie beim nächsten Scan.
//
// ─── OHNE MASSSTAB WIRD NICHTS GESETZT ─────────────────────────────────────
//
// Ein Klick ins Bild ist ein Bruchteil einer Bildbreite. Erst `meterProBild`
// macht daraus eine Länge. Fehlt der Massstab, ist das Setzen deshalb
// GESPERRT statt heimlich auf 1 m/Bild gerechnet: eine erfundene Zahl sähe im
// Plan aus wie eine Auskunft des Hauses — dieselbe Regel, an der
// `belastbarkeit()` `watt: null` zurückgibt.
//
// ─── WER KEINE LAGE HAT, STEHT IN DER LISTE DARUNTER ───────────────────────
//
// Punkte ohne Lage werden nicht auf (0,0) gelegt. Ein Stapel Marken in der
// linken oberen Ecke sieht aus wie eine Aussage über das Gebäude und ist
// keine. Sie stehen stattdessen namentlich unter dem Bild — sichtbar als das,
// was sie sind: noch nicht verortet.
// ───────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { useT } from '../i18n'
import { bauformText } from './beschriftungen'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { punkteMitLage } from '../domain/gebaeudeAuskunft'
import { anteilAusMeter, meterAusAnteil } from '../lib/massstab'

export function Grundriss() {
  const { t, format } = useT()
  const BAUFORM_TEXT = bauformText(t)
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const raumAendern = useGebaeudeStore((s) => s.raumAendern)
  const punktAendern = useGebaeudeStore((s) => s.punktAendern)

  const [raumId, setRaumId] = useState(gebaeude.raeume[0]?.id ?? '')
  const [gewaehlt, setGewaehlt] = useState('')
  const [bildFehlt, setBildFehlt] = useState(false)
  const feld = useRef<HTMLDivElement>(null)

  const raum = gebaeude.raeume.find((r) => r.id === raumId)
  const grundriss = raum?.grundriss
  const massstab = grundriss?.meterProBild
  const setzbar = !!raum && typeof massstab === 'number' && massstab > 0

  const punkteDesRaums = gebaeude.punkte.filter((p) => p.raumId === raumId)
  const verortet = raum ? punkteMitLage(gebaeude, raum.id) : []
  const ohneLage = punkteDesRaums.filter((p) => !p.lage)

  /**
   * Ein Klick wird zu einer Länge — über `meterAusAnteil` und nichts anderes.
   *
   * Die Rechnung steht in `lib/massstab.ts` und nicht hier: an einen Maus-Klick
   * gebunden wäre sie nur von Hand prüfbar, und genau ihre beiden Fallen
   * (beide Achsen über die BREITE, kein Massstab heisst `null`) sind die, die
   * still danebengehen.
   */
  const setzen = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!gewaehlt || !feld.current) return
    const kasten = feld.current.getBoundingClientRect()
    if (kasten.width === 0) return
    const xM = meterAusAnteil((ev.clientX - kasten.left) / kasten.width, massstab)
    const yM = meterAusAnteil((ev.clientY - kasten.top) / kasten.width, massstab)
    if (xM === null || yM === null) return
    punktAendern(gewaehlt, { lage: { xM, yM } })
  }

  /**
   * Dieselbe Lage ueber die Tastatur.
   *
   * NICHT NUR BEQUEMLICHKEIT: ein Klick ins Bild ist der einzige Weg, den eine
   * Maus kennt, und damit waere die Sicht fuer jeden ohne Maus zu. Die zweite
   * Achse steht dabei auf 0, wenn es noch keine Lage gab — das ist hier keine
   * geratene Angabe, sondern die Folge davon, dass jemand die erste Zahl selbst
   * eingetippt hat.
   */
  const setzeAchse = (punktId: string, achse: 'xM' | 'yM', roh: string) => {
    const alt = gebaeude.punkte.find((p) => p.id === punktId)?.lage
    if (roh.trim() === '') {
      punktAendern(punktId, { lage: undefined })
      return
    }
    const wert = Number(roh)
    if (!Number.isFinite(wert)) return
    punktAendern(punktId, {
      lage: { xM: alt?.xM ?? 0, yM: alt?.yM ?? 0, [achse]: wert },
    })
  }

  if (gebaeude.raeume.length === 0) {
    return (
      <section>
        <p className="leer">
          {t(
            'plan.noRoom',
            'No room created yet. A floor plan belongs to a room — create one under "Connection points" first.',
          )}
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="leiste">
        <select
          value={raumId}
          onChange={(e) => {
            setRaumId(e.target.value)
            setGewaehlt('')
            setBildFehlt(false)
          }}
          aria-label={t('common.room', 'Room')}
        >
          {gebaeude.raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          value={grundriss?.quelle ?? ''}
          onChange={(e) => {
            setBildFehlt(false)
            const quelle = e.target.value
            if (!raum) return
            raumAendern(raum.id, {
              grundriss: quelle.trim()
                ? { quelle, meterProBild: grundriss?.meterProBild ?? 0 }
                : undefined,
            })
          }}
          placeholder={t('plan.source.placeholder', 'Image source (path or URL)')}
          aria-label={t('plan.source', 'Image source')}
          size={38}
        />
        <input
          className="schmal"
          type="number"
          min={0}
          step={0.1}
          value={grundriss?.meterProBild ? String(grundriss.meterProBild) : ''}
          onChange={(e) => {
            if (!raum) return
            const meter = Number(e.target.value)
            raumAendern(raum.id, {
              grundriss: { quelle: grundriss?.quelle ?? '', meterProBild: meter },
            })
          }}
          placeholder={t('plan.scale.placeholder', 'm/image')}
          aria-label={t('plan.scale', 'Metres per image width')}
        />
        <span className="leise">{t('plan.scale', 'Metres per image width')}</span>
        <select
          value={gewaehlt}
          onChange={(e) => setGewaehlt(e.target.value)}
          aria-label={t('plan.pick.aria', 'Point to place')}
        >
          <option value="">{t('plan.pick.none', 'Point to place …')}</option>
          {punkteDesRaums.map((p) => (
            <option key={p.id} value={p.id}>
              {p.bezeichnung}
            </option>
          ))}
        </select>
      </div>

      {!setzbar && (
        <p className="leer">
          {t(
            'plan.noScale',
            'Without a scale nothing is placed. A click in the image is a fraction of an image width; only "metres per image width" turns that into a length. A number guessed here would look in the plan like a statement of the building.',
          )}
        </p>
      )}

      <div
        ref={feld}
        className={setzbar && gewaehlt ? 'grundriss-feld setzbar' : 'grundriss-feld'}
        onClick={setzen}
      >
        {grundriss?.quelle && !bildFehlt ? (
          <img
            src={grundriss.quelle}
            alt={format(t('plan.image.alt', 'Floor plan of {name}'), { name: raum?.name ?? '' })}
            onError={() => setBildFehlt(true)}
          />
        ) : (
          <p className="leer">
            {grundriss?.quelle
              ? t(
                  'plan.image.missing',
                  'The image is not present on this machine. The positions stay valid — they are in metres, not in pixels.',
                )
              : t(
                  'plan.image.none',
                  'No floor plan stored. The positions can still be set as soon as a scale is there.',
                )}
          </p>
        )}

        {/* Ohne Massstab gibt es keine Marke — `anteilAusMeter` gibt `null`,
            und eine Marke auf 0 % sähe aus wie eine Aussage über das Gebäude. */}
        {verortet.map((p) => {
          const links = anteilAusMeter(p.lage.xM, massstab)
          const oben = anteilAusMeter(p.lage.yM, massstab)
          if (links === null || oben === null) return null
          return (
            <span
              key={p.id}
              className={p.id === gewaehlt ? 'marke gewaehlt' : 'marke'}
              style={{ left: `${links * 100}%`, top: `${oben * 100}%` }}
              title={format(t('plan.marker.title', '{name} — {x} m / {y} m'), {
                name: p.bezeichnung,
                x: p.lage.xM,
                y: p.lage.yM,
              })}
            >
              {p.bezeichnung}
            </span>
          )
        })}
      </div>

      <div className="tabelle-rahmen">
        <table>
          <caption>
            {t(
              'plan.table.caption',
              'Points of this room. "Not placed yet" is a statement and not a gap — that is why no 0/0 stands here.',
            )}
          </caption>
          <thead>
            <tr>
              <th>{t('dist.col.point', 'Point')}</th>
              <th>{t('points.col.form', 'Housing')}</th>
              <th className="rechts">x (m)</th>
              <th className="rechts">y (m)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {punkteDesRaums.map((p) => (
              <tr key={p.id}>
                <td>{p.bezeichnung}</td>
                <td>
                  {p.bauform ? (
                    BAUFORM_TEXT[p.bauform]
                  ) : (
                    <span className="leise">{t('common.notStated', 'not stated')}</span>
                  )}
                </td>
                <td className="rechts">
                  <input
                    className="schmal rechts"
                    type="number"
                    step={0.1}
                    value={p.lage ? String(p.lage.xM) : ''}
                    onChange={(e) => setzeAchse(p.id, 'xM', e.target.value)}
                    aria-label={format(t('plan.x.aria', 'x of {name} in metres'), { name: p.bezeichnung })}
                  />
                </td>
                <td className="rechts">
                  <input
                    className="schmal rechts"
                    type="number"
                    step={0.1}
                    value={p.lage ? String(p.lage.yM) : ''}
                    onChange={(e) => setzeAchse(p.id, 'yM', e.target.value)}
                    aria-label={format(t('plan.y.aria', 'y of {name} in metres'), { name: p.bezeichnung })}
                  />
                </td>
                <td>
                  {p.lage ? (
                    <button
                      type="button"
                      className="still"
                      onClick={() => punktAendern(p.id, { lage: undefined })}
                    >
                      {t('plan.clearPosition', 'Clear position')}
                    </button>
                  ) : (
                    <span className="leise">{t('plan.notPlaced', 'not placed yet')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ohneLage.length > 0 && setzbar && (
        <p className="leer">
          {ohneLage.length === punkteDesRaums.length
            ? t('plan.hint.pickFirst', 'Choose a point above and click into the field to place it.')
            : format(t('plan.hint.without', 'Still without a position: {namen}.'), {
                namen: ohneLage.map((p) => p.bezeichnung).join(', '),
              })}
        </p>
      )}
    </section>
  )
}
