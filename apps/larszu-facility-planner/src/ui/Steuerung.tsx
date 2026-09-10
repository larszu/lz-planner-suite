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
import { adresseMehrdeutig } from '../domain/gebaeudeAuskunft'
import type { Adressart, Steuersystem } from '../domain/modell'

const SYSTEME: Steuersystem[] = ['knx', 'dali', 'crestron', 'vissonic', 'sonstige']

export function Steuerung() {
  const gebaeude = useGebaeudeStore((s) => s.gebaeude)
  const klinkeAnlegen = useGebaeudeStore((s) => s.klinkeAnlegen)
  const [system, setSystem] = useState<Steuersystem>('knx')
  const [adresse, setAdresse] = useState('')
  const [bedeutung, setBedeutung] = useState('')
  const [richtung, setRichtung] = useState<'lesen' | 'schalten'>('schalten')
  // Issue #2 — bei DALI heisst „3" je nach Adressart etwas voellig
  // anderes: ein Vorschaltgeraet, eine Gruppe von dreissig Leuchten, oder
  // ueber Broadcast der ganze Bus samt Notlicht. Deshalb PFLICHT bei DALI
  // und nur dort: eine KNX-Gruppenadresse ist immer eine Gruppenadresse,
  // und ein Feld mit nur einer moeglichen Antwort wird ausgefuellt statt
  // gelesen.
  const [adressart, setAdressart] = useState<Adressart>('kurz')
  const brauchtAdressart = system === 'dali'

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
        {brauchtAdressart && (
          <select
            value={adressart}
            onChange={(e) => setAdressart(e.target.value as Adressart)}
            aria-label="Adressart"
          >
            <option value="kurz">Kurzadresse — ein Vorschaltgerät</option>
            <option value="gruppe">Gruppe — alles in dieser Gruppe</option>
            <option value="broadcast">Broadcast — ALLES am Bus</option>
          </select>
        )}
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
            klinkeAnlegen({
              system,
              adresse: a,
              richtung,
              bedeutung: b,
              ...(brauchtAdressart ? { adressart } : {}),
            })
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
            <caption>
              Hervorgehoben: eine DALI-Adresse ohne Art. „3" ist dort ein Vorschaltgerät, eine
              Gruppe von dreissig Leuchten oder alles am Bus — die Adresse allein sagt das nicht.
            </caption>
            <thead>
              <tr>
                <th>System</th>
                <th>Adresse</th>
                <th>Art</th>
                <th>Richtung</th>
                <th>Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              {klinken.map((k) => (
                /* Eine DALI-Klinke ohne Adressart faellt AUF und wird nicht
                   still als Kurzadresse gelesen. Das trifft Dokumente, die vor
                   dem Feld entstanden sind — und die kleinstmoegliche Reichweite
                   anzunehmen ist dort die gefaehrliche Annahme. */
                <tr key={k.id} className={adresseMehrdeutig(k) ? 'warnung' : undefined}>
                  <td>{k.system.toUpperCase()}</td>
                  <td>{k.adresse}</td>
                  {/* Bei DALI ist die Art die halbe Auskunft: „Gruppe 3"
                      und „Kurzadresse 3" schalten Verschiedenes. Wo sie
                      fehlt, steht ein Strich und keine Vermutung. */}
                  <td>{k.adressart ?? '—'}</td>
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
