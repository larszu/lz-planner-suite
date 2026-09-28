import { useState } from 'react'
import { Icon } from '@avplan/ui'
import type { SeedDomain } from '@avplan/ui/embed'
import type { SeedHandoffRecord } from '../data/project'
import { format, useT } from '../i18n'

/**
 * Die angebotene Übergabe an die anderen Planer.
 *
 * ─── DER AUFTRAG ────────────────────────────────────────────────────────
 *
 * Nutzer, 2026-09-12: „wenn man im av planner den cable planner öffnet
 * stehen dort andere kameras als im multicam planner. das soll ja verknüpft
 * werden. wenn man also im multicam planner eine kamera hinzufügt soll man
 * anklicken können das die auch im cable planner hinzugefügt werden soll
 * oder geändert werden soll. und vice versa. das muss verknüpft sein durch
 * av suite. sonst könnte ich alle apps ja standalone nutzen."
 *
 * ─── WAS VORHER PASSIERTE, UND WARUM ────────────────────────────────────
 *
 * Die Meldung eines Planers kam bis ins Shell-Projekt und blieb dort stehen.
 * Die Shell zählte die Seed-Revision beim Einarbeiten bewusst NICHT hoch —
 * das schnitt die Echo-Schleife ab (Planer meldet → Shell schiebt zurück →
 * Planer überschreibt seine eigene neuere Arbeit). Es schnitt aber auch die
 * WEITERGABE ab: `connectShellSeed` übernimmt nur einen Seed mit höherer
 * Revision, also bekam der Cable-Planner nie, was MultiCam gemeldet hatte.
 *
 * Seit dem 2026-09-12 trägt der Seed seine Herkunft (`origin`), und der
 * Melder erkennt daran seinen eigenen Hall. Damit darf die Revision hoch —
 * und dieser Streifen ist der Knopf, der sie hochzählt.
 *
 * ─── WARUM EIN KNOPF UND KEIN AUTOMATISMUS ──────────────────────────────
 *
 * Eine Kamera ist im MultiCam-Planer eine Position im Raum; im
 * Cable-Planner ist sie ein Gerät mit Ports, das in die Stückliste eingeht
 * und auf dem Kommissionierzettel landet. Wer im MultiCam eine Kamera
 * versuchsweise dazustellt, um eine Sichtlinie zu prüfen, will sie nicht
 * damit bestellt haben. Stumm zu übernehmen wäre „letzter gewinnt" — genau
 * die Regel, gegen die nebenan schon der Konflikt-Streifen steht.
 *
 * Deshalb zwei Knöpfe, wie dort: „Übernehmen" gibt den Stand an die anderen
 * Planer weiter, „Nur hier" lässt ihn im Suite-Projekt stehen und nimmt nur
 * die Frage weg. Ohne den zweiten wäre der Streifen nicht wegzubekommen,
 * ohne weiterzugeben.
 *
 * ─── UND EIN KNOPF FÜR ALLE ─────────────────────────────────────────────
 *
 * NUTZER-MELDUNG 2026-09-20: „die Meldung … muss man auch alle auf einmal
 * akzeptieren oder ablehnen können und rückgängig machen können."
 *
 * Wer eine Stunde im Licht-Planer gearbeitet hat, fand hier nicht eine
 * Zeile, sondern sechs — und beantwortete sechsmal dieselbe Frage. Seit dem
 * 2026-09-27 gibt es je Planer nur noch EINE Meldung (`meldungEinrechnen`),
 * und der Kopf trägt die Sammelknöpfe immer; der Streifen lässt sich
 * einklappen und wird nie höher als vier Zeilen.
 *
 * Sie stehen NEBEN den einzelnen und nicht an ihrer Stelle: die Meldungen
 * kommen aus verschiedenen Planern, und „alle aus dem Licht-Planer ja, die
 * aus dem Kabel-Planer nein" ist eine gewöhnliche Antwort. Ein Sammelknopf,
 * der die einzelne Entscheidung verdrängt, nimmt sie weg.
 *
 * ─── WAS „RÜCKGÄNGIG" HIER HEISST, UND WAS NICHT ────────────────────────
 *
 * Beide Wege legen einen Schritt in die Projekt-Historie und melden sich mit
 * „Rückgängig"; Strg+Z tut dasselbe. Zurück kommt die FRAGE.
 *
 * Was NICHT zurückkommt, ist der Stand bei den anderen Planern: die Meldung
 * war beim Eintreffen schon ins Suite-Projekt eingearbeitet (deshalb heißt
 * der zweite Knopf „Nur hier" und nicht „Verwerfen"), und was ein anderer
 * Planer übernommen hat, hat er. Ein „Rückgängig", das den Stand dort
 * zurückholte, müsste den älteren Stand hinterherschieben — und überschriebe
 * damit, was seither dort gearbeitet wurde. Das ist „letzter gewinnt", also
 * genau die Regel, gegen die dieser Streifen steht.
 *
 * Wer den Inhalt der Meldung selbst zurücknehmen will (die sechs gelöschten
 * Geräte zurückhaben), tut das IM meldenden Planer: dort ist die Änderung
 * passiert, und dort hat sie ihr eigenes Undo.
 */
export function SeedHandoffBar({
  handoffs,
  onAccept,
  onDismiss,
}: {
  handoffs: SeedHandoffRecord[]
  /** Immer eine LISTE — der Sammelknopf ist derselbe Weg, nur mit mehr drin. */
  onAccept: (records: SeedHandoffRecord[]) => void
  onDismiss: (ids: string[]) => void
}) {
  const t = useT()
  const [zu, setZu] = useState(false)
  if (handoffs.length === 0) return null

  // EINE ZEILE JE PLANER (Nutzer-Meldung 2026-09-27: 18 Zeilen „1 geaendert"
  // ueberdeckten die Arbeitsflaeche). Neue Meldungen werden schon beim
  // Eintreffen eingerechnet (`meldungEinrechnen`); die Gruppierung hier fasst
  // zusaetzlich zusammen, was in aelteren Projekten noch einzeln steht.
  const gruppen: { domain: SeedDomain; records: SeedHandoffRecord[]; menge: SeedHandoffRecord['zusammenfassung'] }[] = []
  for (const r of handoffs) {
    const g = gruppen.find((x) => x.domain === r.domain)
    if (g) {
      g.records.push(r)
      g.menge = {
        neu: g.menge.neu + r.zusammenfassung.neu,
        geaendert: g.menge.geaendert + r.zusammenfassung.geaendert,
        entfernt: g.menge.entfernt + r.zusammenfassung.entfernt,
      }
    } else gruppen.push({ domain: r.domain, records: [r], menge: { ...r.zusammenfassung } })
  }

  const knopf = 'av-focus rounded-av-control border border-av-border px-2 py-0.5 text-av-text hover:bg-av-surface-3'
  return (
    <section
      className="flex shrink-0 flex-col gap-1 border-t border-av-border bg-av-surface-2 px-3 py-2"
      aria-label={t('seed.handoff.region', 'Angebotene Übergaben an die anderen Planer')}
    >
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-av-text-muted">
        <button
          type="button"
          className="av-focus flex items-center gap-1 rounded-av-control px-1 hover:bg-av-surface-3"
          aria-expanded={!zu}
          onClick={() => setZu(!zu)}
        >
          <Icon name="nodes" size={14} style={{ color: 'var(--av-accent)' }} />
          {gruppen.length === 1
            ? format(t('seed.handoff.header', 'Meldung aus {quelle}: {was}'), {
                quelle: appLabelAus(t, gruppen[0].domain),
                was: mengeLabel(t, gruppen[0].menge),
              })
            : format(t('seed.handoff.countPlanners', 'Meldungen aus {n} Planern'), { n: gruppen.length })}
          <span aria-hidden>{zu ? '▸' : '▾'}</span>
        </button>
        <span className="ml-auto flex gap-1">
          <button type="button" className={knopf} onClick={() => onAccept(handoffs)}>
            {gruppen.length === 1 ? t('seed.handoff.accept', 'Übernehmen') : t('seed.handoff.acceptAll', 'Alle übernehmen')}
          </button>
          <button type="button" className={knopf} onClick={() => onDismiss(handoffs.map((r) => r.id))}>
            {gruppen.length === 1 ? t('seed.handoff.dismiss', 'Nur hier') : t('seed.handoff.dismissAll', 'Alle nur hier')}
          </button>
        </span>
      </div>
      {!zu && gruppen.length > 1 && (
        // Hoechstens so hoch wie vier Zeilen: der Streifen darf die
        // Arbeitsflaeche nicht verdraengen — genau das war die Meldung.
        <div className="max-h-32 overflow-y-auto border-t border-av-border-muted pt-1">
          {gruppen.map((g) => (
            <div key={g.domain} className="flex flex-wrap items-center gap-2 py-0.5 text-[13px] text-av-text">
              <span>
                {format(t('seed.handoff.line', 'Meldung aus {quelle}: {was} — an die anderen Planer übergeben?'), {
                  quelle: appLabelAus(t, g.domain),
                  was: mengeLabel(t, g.menge),
                })}
              </span>
              <span className="ml-auto flex gap-1">
                <button type="button" className={knopf} onClick={() => onAccept(g.records)}>
                  {t('seed.handoff.accept', 'Übernehmen')}
                </button>
                <button type="button" className={knopf} onClick={() => onDismiss(g.records.map((r) => r.id))}>
                  {t('seed.handoff.dismiss', 'Nur hier')}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * „1 neu, 2 geändert" — und die Null bleibt WEG.
 *
 * Ein Streifen, der „1 neu, 0 geändert, 0 entfernt" sagt, lässt den Leser
 * drei Zahlen prüfen, um eine zu finden. Genannt wird, was passiert ist.
 */
function mengeLabel(
  t: (k: string, d: string) => string,
  m: { neu: number; geaendert: number; entfernt: number },
): string {
  const teile: string[] = []
  if (m.neu > 0) teile.push(format(t('seed.handoff.new', '{n} neu'), { n: m.neu }))
  if (m.geaendert > 0) teile.push(format(t('seed.handoff.changed', '{n} geändert'), { n: m.geaendert }))
  if (m.entfernt > 0) teile.push(format(t('seed.handoff.removed', '{n} entfernt'), { n: m.entfernt }))
  return teile.join(' · ')
}

/**
 * DERSELBE WORTLAUT WIE IM KONFLIKT-STREIFEN, bis auf den Buchstaben.
 *
 * Klein geschrieben und mitten im Satz, weil dort dieselben Schluessel mit
 * genau diesem Text stehen. Ein Schluessel mit zwei verschiedenen Quelltexten
 * ist eine Dublette, bei der beim Zusammenfuegen der letzte gewinnt — und
 * dann steht im einen Streifen, was im anderen gemeint war.
 */
function appLabelAus(t: (k: string, d: string) => string, d: SeedDomain): string {
  // „aus dem Kabel-Planer": nach „aus" steht der Dativ. Eigene Schluessel,
  // weil die Nominativ-Form (`seed.writer.*`) im Konflikt-Streifen gebraucht
  // wird und ein Schluessel mit zwei Faellen im Deutschen nicht geht.
  if (d === 'cameras') return t('seed.from.cameras', 'dem LZ Multicam Planner')
  if (d === 'fixtures') return t('seed.from.fixtures', 'dem LZ Light Planner')
  return t('seed.from.signal', 'dem LZ Cable Planner')
}
