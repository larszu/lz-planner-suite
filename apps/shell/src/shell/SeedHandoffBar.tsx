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
 */
export function SeedHandoffBar({
  handoffs,
  onAccept,
  onDismiss,
}: {
  handoffs: SeedHandoffRecord[]
  onAccept: (record: SeedHandoffRecord) => void
  onDismiss: (id: string) => void
}) {
  const t = useT()
  if (handoffs.length === 0) return null

  return (
    <section
      className="flex flex-col gap-1 border-t border-av-border bg-av-surface-2 px-3 py-2"
      aria-label={t('seed.handoff.region', 'Angebotene Übergaben an die anderen Planer')}
    >
      {handoffs.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 text-[13px] text-av-text">
          <Icon name="nodes" size={14} style={{ color: 'var(--av-accent)' }} />
          <span>
            {format(t('seed.handoff.line', 'Meldung aus {quelle}: {was} — an die anderen Planer übergeben?'), {
              quelle: appLabel(t, r.domain),
              was: mengeLabel(t, r.zusammenfassung),
            })}
          </span>
          <span className="ml-auto flex gap-1">
            <button
              type="button"
              className="av-focus rounded-av-control border border-av-border px-2 py-0.5 hover:bg-av-surface-3"
              onClick={() => onAccept(r)}
            >
              {t('seed.handoff.accept', 'Übernehmen')}
            </button>
            <button
              type="button"
              className="av-focus rounded-av-control border border-av-border px-2 py-0.5 hover:bg-av-surface-3"
              onClick={() => onDismiss(r.id)}
            >
              {t('seed.handoff.dismiss', 'Nur hier')}
            </button>
          </span>
        </div>
      ))}
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
function appLabel(t: (k: string, d: string) => string, d: SeedDomain): string {
  if (d === 'cameras') return t('seed.writer.cameras', 'der Kamera-Planer')
  if (d === 'fixtures') return t('seed.writer.fixtures', 'der Licht-Planer')
  return t('seed.writer.signal', 'der Kabel-Planer')
}
