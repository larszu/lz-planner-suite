// ───────────────────────────────────────────────────────────────────────────
// Verteilung — welche Kreise hängen zusammen, und woran?
//
// Die Vertragsfrage `kreisGeschwister`, und sie ist die, deren Fehlen im
// Betrieb weh tut: wer sie nicht stellt, plant das Rig auf zwei Dosen, die
// gemeinsam abschalten, und merkt es in der Show.
//
// DIE ANTWORT HAT DREI ZUSTÄNDE, NICHT ZWEI. „Am selben RCD" ist die
// vollständige Auskunft. „Am selben Kreis" ist eine UNTERGRENZE — das Gebäude
// nennt für diesen Kreis keinen RCD, also sind weitere Punkte möglich. Und
// „nicht bekannt" ist keine leere Liste: die läse sich als „teilt sich mit
// niemandem", und das hat das Gebäude nie gesagt.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useT } from '../i18n'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { kreisGeschwister } from '../domain/vertrag'

export function Verteilung() {
  const { t } = useT()
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const verteilungAnlegen = useGebaeudeStore((s) => s.verteilungAnlegen)
  const kreisAnlegen = useGebaeudeStore((s) => s.kreisAnlegen)
  const [name, setName] = useState('')
  const [kreisName, setKreisName] = useState('')
  const [rcd, setRcd] = useState('')

  const nachId = new Map(gebaeude.punkte.map((p) => [p.id, p.bezeichnung]))

  return (
    <section>
      <div className="leiste">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('dist.new.placeholder', 'New switchgear cabinet / sub-distribution board')}
          aria-label={t('dist.new.aria', 'Name of the distribution board')}
        />
        <button
          type="button"
          onClick={() => {
            const b = name.trim()
            if (!b) return
            const raumId = gebaeude.raeume[0]?.id ?? ''
            verteilungAnlegen({ bezeichnung: b, raumId, art: 'schaltschrank' })
            setName('')
          }}
        >
          {t('common.add', 'Add')}
        </button>
      </div>

      {gebaeude.verteilungen.length > 0 && (
        <div className="leiste">
          <input
            value={kreisName}
            onChange={(e) => setKreisName(e.target.value)}
            placeholder={t('dist.circuit.placeholder', 'New circuit')}
            aria-label={t('dist.circuit.aria', 'Name of the circuit')}
          />
          <input
            value={rcd}
            onChange={(e) => setRcd(e.target.value)}
            placeholder={t('dist.rcd.placeholder', 'RCD (empty = not stated)')}
            aria-label="RCD"
          />
          <button
            type="button"
            onClick={() => {
              const b = kreisName.trim()
              if (!b) return
              kreisAnlegen({
                bezeichnung: b,
                verteilungId: gebaeude.verteilungen[0].id,
                // Leer heisst „nicht angegeben" und wird nicht zu einer leeren
                // Zeichenkette: die waere ein RCD mit dem Namen „".
                ...(rcd.trim() ? { rcdId: rcd.trim() } : {}),
              })
              setKreisName('')
              setRcd('')
            }}
          >
            {t('dist.circuit.add', 'Add circuit')}
          </button>
        </div>
      )}

      {gebaeude.verteilungen.length === 0 ? (
        <p className="leer">
          {t(
            'dist.empty',
            'No distribution board yet. A switchgear cabinet is where the building\'s circuits begin — and the reason why two outlets in different rooms can go dead together.',
          )}
        </p>
      ) : (
        <>
          <div className="tabelle-rahmen">
            <table>
              <caption>{t('dist.table.boards', 'Distribution boards')}</caption>
              <thead>
                <tr>
                  <th>{t('common.name', 'Name')}</th>
                  <th>{t('common.kind', 'Kind')}</th>
                  <th className="rechts">{t('dist.col.circuits', 'Circuits')}</th>
                </tr>
              </thead>
              <tbody>
                {gebaeude.verteilungen.map((v) => (
                  <tr key={v.id}>
                    <td>{v.bezeichnung}</td>
                    <td>
                      {v.art === 'schaltschrank'
                        ? t('dist.kind.cabinet', 'Switchgear cabinet')
                        : t('dist.kind.sub', 'Sub-distribution board')}
                    </td>
                    <td className="rechts">
                      {gebaeude.stromkreise.filter((k) => k.verteilungId === v.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tabelle-rahmen">
            <table>
              <caption>{t('dist.table.together', 'What goes dead together?')}</caption>
              <thead>
                <tr>
                  <th>{t('dist.col.point', 'Point')}</th>
                  <th>{t('dist.col.basis', 'Basis')}</th>
                  <th>{t('dist.col.linkedWith', 'Linked with')}</th>
                </tr>
              </thead>
              <tbody>
                {gebaeude.punkte.map((p) => {
                  const g = kreisGeschwister(gebaeude, p.id, t)
                  return (
                    <tr key={p.id}>
                      <td>{p.bezeichnung}</td>
                      <td className="leise">
                        {g.bekannt
                          ? g.grundlage === 'rcd'
                            ? t('dist.basis.rcd', 'RCD — complete')
                            : t('dist.basis.circuit', 'Circuit — lower bound, no RCD stated')
                          : t('dist.basis.unknown', 'not known')}
                      </td>
                      <td>
                        {g.bekannt ? (
                          g.punkte.length === 0 ? (
                            <span className="leise">{t('dist.withNothing', 'with nothing')}</span>
                          ) : (
                            g.punkte.map((id) => nachId.get(id) ?? id).join(', ')
                          )
                        ) : (
                          <span className="leise">{g.grund}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
