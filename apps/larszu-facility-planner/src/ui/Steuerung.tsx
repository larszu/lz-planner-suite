// ───────────────────────────────────────────────────────────────────────────
// Steuerung — welche Klinken der Haussteuerung stehen der Show offen?
//
// Das ist `cable#667` (KNX, DALI, Crestron, Vissonic), und zwar in der Form,
// die ADR-006 dafür festlegt: **nur die benannten Klinken, nicht das
// Bus-Modell.** Kein Gruppenadressbaum, keine Vorschaltgeräte, keine
// Programmzeilen. Der Plan will wissen, was er ansprechen darf und was das
// bewirkt.
//
// Eine Klinke ist deshalb ein VERTRAGSGEGENSTAND: jemand hat sie freigegeben
// und beschrieben. „Bedeutung" ist Klartext vom Betreiber und kein Pflichtfeld
// aus Ordnungsliebe — eine Adresse ohne Bedeutung ist eine Nummer, die jemand
// schaltet, ohne zu wissen, was passiert.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { steuerklinken } from '../domain/vertrag'
import type { Steuersystem } from '../domain/modell'

const SYSTEME: Steuersystem[] = ['knx', 'dali', 'crestron', 'vissonic', 'sonstige']

export function Steuerung() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const klinkeAnlegen = useGebaeudeStore((s) => s.klinkeAnlegen)
  const [system, setSystem] = useState<Steuersystem>('knx')
  const [adresse, setAdresse] = useState('')
  const [bedeutung, setBedeutung] = useState('')
  const [richtung, setRichtung] = useState<'lesen' | 'schalten'>('schalten')

  const klinken = steuerklinken(gebaeude)

  return (
    <section>
      <div className="leiste">
        <select
          value={system}
          onChange={(e) => setSystem(e.target.value as Steuersystem)}
          aria-label="System"
        >
          {SYSTEME.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Adresse"
          aria-label="Adresse"
        />
        <select
          value={richtung}
          onChange={(e) => setRichtung(e.target.value as 'lesen' | 'schalten')}
          aria-label="Richtung"
        >
          <option value="schalten">schalten</option>
          <option value="lesen">lesen</option>
        </select>
        <input
          value={bedeutung}
          onChange={(e) => setBedeutung(e.target.value)}
          placeholder="Was passiert, wenn man sie benutzt"
          aria-label="Bedeutung"
        />
        <button
          type="button"
          onClick={() => {
            const a = adresse.trim()
            const b = bedeutung.trim()
            // Beides verlangt: eine Adresse ohne Bedeutung ist eine Nummer,
            // die jemand schaltet, ohne zu wissen, was passiert.
            if (!a || !b) return
            klinkeAnlegen({ system, adresse: a, richtung, bedeutung: b })
            setAdresse('')
            setBedeutung('')
          }}
        >
          Freigeben
        </button>
      </div>

      {klinken.length === 0 ? (
        <p className="leer">
          Keine Klinke freigegeben. Solange hier nichts steht, darf die Show die
          Haussteuerung nicht ansprechen — und das ist die richtige Vorgabe: eine
          Adresse, die niemand beschrieben hat, ist keine Freigabe.
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <thead>
              <tr>
                <th>System</th>
                <th>Adresse</th>
                <th>Richtung</th>
                <th>Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              {klinken.map((k) => (
                <tr key={k.id}>
                  <td>{k.system.toUpperCase()}</td>
                  <td>{k.adresse}</td>
                  <td>{k.richtung}</td>
                  <td>{k.bedeutung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
