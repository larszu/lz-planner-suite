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
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'

const datum = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('de-DE')
}

export function Maengel() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const mangelEintragen = useGebaeudeStore((s) => s.mangelEintragen)
  const [ziel, setZiel] = useState('')
  const [befund, setBefund] = useState('')
  const [abgelehnt, setAbgelehnt] = useState<string | undefined>()

  /** Alles, worauf sich ein Mangel beziehen kann — mit lesbarem Namen. */
  const ziele = useMemo(
    () => [
      ...gebaeude.punkte.map((x) => ({ id: x.id, name: `Punkt: ${x.bezeichnung}` })),
      ...gebaeude.stromkreise.map((x) => ({ id: x.id, name: `Kreis: ${x.bezeichnung}` })),
      ...gebaeude.verteilungen.map((x) => ({ id: x.id, name: `Verteilung: ${x.bezeichnung}` })),
      ...gebaeude.klinken.map((x) => ({ id: x.id, name: `Klinke: ${x.adresse}` })),
      ...gebaeude.raeume.map((x) => ({ id: x.id, name: `Raum: ${x.name}` })),
    ],
    [gebaeude],
  )
  const nameVon = new Map(ziele.map((z) => [z.id, z.name]))

  return (
    <section>
      <div className="leiste">
        <select value={ziel} onChange={(e) => setZiel(e.target.value)} aria-label="Betroffenes Objekt">
          <option value="">— Objekt wählen —</option>
          {ziele.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <input
          value={befund}
          onChange={(e) => setBefund(e.target.value)}
          placeholder="Was ist aufgefallen"
          aria-label="Befund"
        />
        <button
          type="button"
          onClick={() => {
            const grund = mangelEintragen({
              hausObjektId: ziel,
              befund,
              gemeldetAm: new Date().toISOString(),
            })
            setAbgelehnt(grund)
            if (!grund) {
              setBefund('')
              setZiel('')
            }
          }}
        >
          Melden
        </button>
      </div>

      {abgelehnt && <p className="fehler">{abgelehnt}</p>}

      {gebaeude.maengel.length === 0 ? (
        <p className="leer">
          Kein Mangel gemeldet. Was hier fehlt, ist keine Zusicherung — es heisst nur,
          dass niemand etwas eingetragen hat.
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <thead>
              <tr>
                <th>Objekt</th>
                <th>Befund</th>
                <th>Gemeldet</th>
                <th>Von</th>
              </tr>
            </thead>
            <tbody>
              {gebaeude.maengel.map((m) => (
                <tr key={m.id}>
                  <td>{nameVon.get(m.hausObjektId) ?? m.hausObjektId}</td>
                  <td>{m.befund}</td>
                  <td>{datum(m.gemeldetAm)}</td>
                  <td className="leise">{m.gemeldetVon ?? 'nicht angegeben'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
