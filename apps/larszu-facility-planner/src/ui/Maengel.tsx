// ───────────────────────────────────────────────────────────────────────────
// Mängel — der eine Rückweg.
//
// Eine Show ändert das Haus nicht, sie benutzt es. Die einzige Ausnahme ist die
// Aussage eines Menschen über einen Defekt: tote Dose, auslösender RCD, eine
// Klinke, die nicht das tut, was sie laut Vertrag tut. Die gehört ans Gebäude —
// sonst ist sie nach dem Abbau verloren, und die nächste Show findet denselben
// Fehler noch einmal.
//
// DIE MELDUNG KANN ABGELEHNT WERDEN, und das ist kein Fehler der Oberfläche.
// `mangelMelden` weist eine Meldung auf ein Objekt zurück, das es nicht gibt:
// sie wäre ein Zettel ohne Empfänger, und der fällt niemandem auf. Der Grund
// steht dann hier, statt dass die Zeile still verschwindet.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useT, locale } from '../i18n'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'

/**
 * Zeitpunkt in der Schreibweise der gewählten Sprache.
 *
 * Die Kennung kam bis 2026-09-11 fest als `'de-DE'` herein. Das war richtig,
 * solange die Oberfläche deutsch war, und wäre es jetzt nicht mehr: ein
 * Zeitpunkt in deutscher Schreibweise unter einer englischen Tabelle liest
 * sich nicht falsch — er wird falsch gelesen.
 */
const datum = (iso: string, kennung: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(kennung)
}

export function Maengel() {
  const { t, format, sprache } = useT()
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const mangelEintragen = useGebaeudeStore((s) => s.mangelEintragen)
  const [ziel, setZiel] = useState('')
  const [befund, setBefund] = useState('')
  const [abgelehnt, setAbgelehnt] = useState<string | undefined>()

  /** Alles, worauf sich ein Mangel beziehen kann — mit lesbarem Namen. */
  const ziele = useMemo(
    () => [
      // Die Gattung steht VOR dem Namen und mit Doppelpunkt: „Punkt: Bühne
      // links". Als EIN Schlüssel je Gattung, nicht als zwei Stücke — wo die
      // Gattung im Eintrag steht, gehört zur Sprache.
      //
      // Und `t(...)` steht AUSGESCHRIEBEN da, nicht hinter einem lokalen
      // Helfer `mit(key, en, name)`. Der wäre zwei Zeilen kürzer und machte
      // den Wächter blind: `uebersetzungVollstaendig` liest Quelltext und
      // sieht nur echte `t()`-Aufrufe. Die fünf Schlüssel fielen dann als
      // VERWAISTE Wörterbuch-Einträge auf — an der falschen Stelle, mit der
      // falschen Begründung, und beim Aufräumen löschte jemand die
      // Übersetzung, die gerade benutzt wird.
      ...gebaeude.punkte.map((x) => ({
        id: x.id,
        name: format(t('defects.kind.point', 'Point: {name}'), { name: x.bezeichnung }),
      })),
      ...gebaeude.stromkreise.map((x) => ({
        id: x.id,
        name: format(t('defects.kind.circuit', 'Circuit: {name}'), { name: x.bezeichnung }),
      })),
      ...gebaeude.verteilungen.map((x) => ({
        id: x.id,
        name: format(t('defects.kind.board', 'Distribution: {name}'), { name: x.bezeichnung }),
      })),
      ...gebaeude.klinken.map((x) => ({
        id: x.id,
        name: format(t('defects.kind.hook', 'Hook: {name}'), { name: x.adresse }),
      })),
      ...gebaeude.raeume.map((x) => ({
        id: x.id,
        name: format(t('defects.kind.room', 'Room: {name}'), { name: x.name }),
      })),
    ],
    [gebaeude, t, format],
  )
  const nameVon = new Map(ziele.map((z) => [z.id, z.name]))

  return (
    <section>
      <div className="leiste">
        <select value={ziel} onChange={(e) => setZiel(e.target.value)} aria-label={t('defects.target.aria', 'Affected object')}>
          <option value="">{t('defects.target.none', '— choose an object —')}</option>
          {ziele.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <input
          value={befund}
          onChange={(e) => setBefund(e.target.value)}
          placeholder={t('defects.finding.placeholder', 'What was noticed')}
          aria-label={t('defects.finding', 'Finding')}
        />
        <button
          type="button"
          onClick={() => {
            // Der Übersetzer geht MIT in den Vertrag: der Grund einer
            // Ablehnung erscheint in der Oberfläche und ist deshalb ihre
            // Sprache, nicht die des Moduls.
            const grund = mangelEintragen(
              {
                hausObjektId: ziel,
                befund,
                gemeldetAm: new Date().toISOString(),
              },
              t,
            )
            setAbgelehnt(grund)
            if (!grund) {
              setBefund('')
              setZiel('')
            }
          }}
        >
          {t('defects.report', 'Report')}
        </button>
      </div>

      {abgelehnt && <p className="fehler">{abgelehnt}</p>}

      {gebaeude.maengel.length === 0 ? (
        <p className="leer">
          {t(
            'defects.empty',
            'No defect reported. What is missing here is not an assurance — it only means nobody has entered anything.',
          )}
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <thead>
              <tr>
                <th>{t('defects.col.object', 'Object')}</th>
                <th>{t('defects.finding', 'Finding')}</th>
                <th>{t('defects.col.reported', 'Reported')}</th>
                <th>{t('defects.col.by', 'By')}</th>
              </tr>
            </thead>
            <tbody>
              {gebaeude.maengel.map((m) => (
                <tr key={m.id}>
                  <td>{nameVon.get(m.hausObjektId) ?? m.hausObjektId}</td>
                  <td>{m.befund}</td>
                  <td>{datum(m.gemeldetAm, locale(sprache))}</td>
                  <td className="leise">{m.gemeldetVon ?? t('common.notStated', 'not stated')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
