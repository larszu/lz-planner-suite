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
import { useT } from '../i18n'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'
import { steuerklinken } from '../domain/vertrag'
import { adresseMehrdeutig } from '../domain/gebaeudeAuskunft'
import type { Adressart, Steuersystem } from '../domain/modell'

const SYSTEME: Steuersystem[] = ['knx', 'dali', 'crestron', 'vissonic', 'sonstige']

export function Steuerung() {
  const { t } = useT()
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
          aria-label={t('control.system', 'System')}
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
          placeholder={t('control.address', 'Address')}
          aria-label={t('control.address', 'Address')}
        />
        {brauchtAdressart && (
          <select
            value={adressart}
            onChange={(e) => setAdressart(e.target.value as Adressart)}
            aria-label={t('control.addressKind', 'Address kind')}
          >
            {/* Die Kennungen `kurz`/`gruppe`/`broadcast` bleiben, was sie
                sind — Werte im Datensatz. Übersetzt wird, was davor steht. */}
            <option value="kurz">{t('control.kind.short', 'Short address — one ballast')}</option>
            <option value="gruppe">{t('control.kind.group', 'Group — everything in this group')}</option>
            <option value="broadcast">{t('control.kind.broadcast', 'Broadcast — EVERYTHING on the bus')}</option>
          </select>
        )}
        <select
          value={richtung}
          onChange={(e) => setRichtung(e.target.value as 'lesen' | 'schalten')}
          aria-label={t('control.direction', 'Direction')}
        >
          <option value="schalten">{t('control.direction.write', 'switch')}</option>
          <option value="lesen">{t('control.direction.read', 'read')}</option>
        </select>
        <input
          value={bedeutung}
          onChange={(e) => setBedeutung(e.target.value)}
          placeholder={t('control.meaning.placeholder', 'What happens when it is used')}
          aria-label={t('control.meaning', 'Meaning')}
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
          {t('control.release', 'Release')}
        </button>
      </div>

      {klinken.length === 0 ? (
        <p className="leer">
          {t(
            'control.empty',
            'No hook released. As long as nothing stands here, the show must not address the building control — and that is the right default: an address nobody has described is not a release.',
          )}
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <caption>
              {t(
                'control.table.caption',
                'Highlighted: a DALI address without a kind. There, "3" is one ballast, a group of thirty luminaires, or everything on the bus — the address alone does not say which.',
              )}
            </caption>
            <thead>
              <tr>
                <th>{t('control.system', 'System')}</th>
                <th>{t('control.address', 'Address')}</th>
                <th>{t('common.kind', 'Kind')}</th>
                <th>{t('control.direction', 'Direction')}</th>
                <th>{t('control.meaning', 'Meaning')}</th>
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
                  <td>
                    {k.adressart
                      ? {
                          kurz: t('control.kind.short.short', 'short address'),
                          gruppe: t('control.kind.group.short', 'group'),
                          broadcast: t('control.kind.broadcast.short', 'broadcast'),
                        }[k.adressart]
                      : '—'}
                  </td>
                  <td>
                    {k.richtung === 'schalten'
                      ? t('control.direction.write', 'switch')
                      : t('control.direction.read', 'read')}
                  </td>
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
