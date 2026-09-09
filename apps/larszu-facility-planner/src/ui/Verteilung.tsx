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
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { kreisGeschwister } from '../domain/vertrag'

export function Verteilung() {
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
          placeholder="Neuer Schaltschrank / neue Unterverteilung"
          aria-label="Bezeichnung der Verteilung"
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
          Anlegen
        </button>
      </div>

      {gebaeude.verteilungen.length > 0 && (
        <div className="leiste">
          <input
            value={kreisName}
            onChange={(e) => setKreisName(e.target.value)}
            placeholder="Neuer Stromkreis"
            aria-label="Bezeichnung des Stromkreises"
          />
          <input
            value={rcd}
            onChange={(e) => setRcd(e.target.value)}
            placeholder="RCD (leer = nicht angegeben)"
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
            Kreis anlegen
          </button>
        </div>
      )}

      {gebaeude.verteilungen.length === 0 ? (
        <p className="leer">
          Noch keine Verteilung. Ein Schaltschrank ist der Ort, an dem die Kreise des
          Gebäudes anfangen — und der Grund, warum zwei Dosen in verschiedenen Räumen
          gemeinsam abschalten können.
        </p>
      ) : (
        <>
          <div className="tabelle-rahmen">
            <table>
              <caption>Verteilungen</caption>
              <thead>
                <tr>
                  <th>Bezeichnung</th>
                  <th>Art</th>
                  <th className="rechts">Kreise</th>
                </tr>
              </thead>
              <tbody>
                {gebaeude.verteilungen.map((v) => (
                  <tr key={v.id}>
                    <td>{v.bezeichnung}</td>
                    <td>{v.art === 'schaltschrank' ? 'Schaltschrank' : 'Unterverteilung'}</td>
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
              <caption>Was schaltet gemeinsam ab?</caption>
              <thead>
                <tr>
                  <th>Punkt</th>
                  <th>Grundlage</th>
                  <th>Hängt zusammen mit</th>
                </tr>
              </thead>
              <tbody>
                {gebaeude.punkte.map((p) => {
                  const g = kreisGeschwister(gebaeude, p.id)
                  return (
                    <tr key={p.id}>
                      <td>{p.bezeichnung}</td>
                      <td className="leise">
                        {g.bekannt
                          ? g.grundlage === 'rcd'
                            ? 'RCD — vollständig'
                            : 'Stromkreis — Untergrenze, kein RCD angegeben'
                          : 'nicht bekannt'}
                      </td>
                      <td>
                        {g.bekannt ? (
                          g.punkte.length === 0 ? (
                            <span className="leise">mit nichts</span>
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
