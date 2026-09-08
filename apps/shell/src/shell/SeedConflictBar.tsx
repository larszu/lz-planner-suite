import { Icon } from '@avplan/ui'
import { conflictFieldName, type SeedConflict, type SeedWriter } from '@avplan/ui/embed'
import type { SeedConflictRecord } from '../data/project'
import { format, useT } from '../i18n'

/**
 * Die Befunde aus dem Seed-Rückweg (E-21).
 *
 * WARUM ALS STREIFEN UND NICHT ALS TOAST. Ein Widerspruch heißt: ein Planer
 * hat etwas geändert, und die Änderung ist NICHT eingezogen. Wer davon nur
 * einen Toast bekommt, hat nach 3,2 Sekunden denselben Wissensstand wie beim
 * stillen Überschreiben — in beiden Fällen steht der alte Wert da und niemand
 * weiß, dass jemand widersprochen hat. Der Streifen bleibt, bis jemand
 * entscheidet.
 *
 * WARUM ZWEI KNÖPFE UND NICHT EINER. „Übernehmen" verschiebt den Halter zum
 * Vorschlagenden — das ist die einzige Art, wie ein gehaltenes Feld die Stelle
 * wechselt, und sie ist ausdrücklich. „Verwerfen" nimmt nur den Befund weg und
 * lässt den Wert stehen; der Halter behält sein Feld. Ohne den zweiten Knopf
 * wäre der Streifen nicht wegzubekommen, ohne nachzugeben.
 */
export function SeedConflictBar({
  conflicts,
  onAccept,
  onDismiss,
}: {
  conflicts: SeedConflictRecord[]
  onAccept: (record: SeedConflictRecord) => void
  onDismiss: (id: string) => void
}) {
  const t = useT()
  if (conflicts.length === 0) return null

  return (
    <section
      className="flex flex-col gap-1 border-t border-av-border bg-av-surface-2 px-3 py-2"
      aria-label={t('seed.conflict.region', 'Widersprüche aus den Planern')}
    >
      {conflicts.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 text-[13px] text-av-text">
          <Icon name="warning" size={14} style={{ color: 'var(--av-warn)' }} />
          <span>
            {format(
              t(
                'seed.conflict.line',
                '{feld}: {quelle} schlägt {neu} vor — es gilt {alt} von {halter}',
              ),
              {
                feld: feldLabel(t, r.conflict),
                quelle: appLabel(t, r.conflict.proposed.by),
                neu: wertLabel(r.conflict.proposed.value),
                alt: wertLabel(r.conflict.held.value),
                halter: appLabel(t, r.conflict.held.by),
              },
            )}
          </span>
          <span className="ml-auto flex gap-1">
            <button
              type="button"
              className="av-focus rounded-av-control border border-av-border px-2 py-0.5 hover:bg-av-surface-3"
              onClick={() => onAccept(r)}
            >
              {t('seed.conflict.accept', 'Übernehmen')}
            </button>
            <button
              type="button"
              className="av-focus rounded-av-control border border-av-border px-2 py-0.5 hover:bg-av-surface-3"
              onClick={() => onDismiss(r.id)}
            >
              {t('seed.conflict.dismiss', 'Verwerfen')}
            </button>
          </span>
        </div>
      ))}
    </section>
  )
}

/**
 * Der Wert als Text. `stage` ist ein Rechteck und keine Zahl — es als
 * `[object Object]` zu zeigen wäre genau die Sorte Anzeige, die einen Befund
 * unbrauchbar macht.
 */
function wertLabel(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'object') {
    const s = value as { x?: number; y?: number; w?: number; h?: number }
    return `${s.x ?? 0}/${s.y ?? 0} · ${s.w ?? 0}×${s.h ?? 0} m`
  }
  return String(value)
}

/**
 * Wer geschrieben hat, in der Sprache des Nutzers. Als Tabelle mit
 * `satisfies`, damit eine neue schreibende Stelle hier auffällt, statt als
 * roher Schlüssel im Streifen zu stehen.
 */
const APP_LABEL = {
  shell: ['seed.writer.shell', 'die Suite'],
  cameras: ['seed.writer.cameras', 'der Kamera-Planer'],
  fixtures: ['seed.writer.fixtures', 'der Licht-Planer'],
  signal: ['seed.writer.signal', 'der Kabel-Planer'],
} satisfies Record<SeedWriter, [string, string]>

const appLabel = (t: (k: string, de: string) => string, by: SeedWriter) => t(...APP_LABEL[by])

const FELD_LABEL = {
  name: ['seed.field.name', 'Haus'],
  widthM: ['seed.field.widthM', 'Hallenbreite'],
  heightM: ['seed.field.heightM', 'Hallentiefe'],
  stage: ['seed.field.stage', 'Bühne'],
} satisfies Record<ReturnType<typeof conflictFieldName>, [string, string]>

const feldLabel = (t: (k: string, de: string) => string, c: SeedConflict) =>
  t(...FELD_LABEL[conflictFieldName(c.field)])
