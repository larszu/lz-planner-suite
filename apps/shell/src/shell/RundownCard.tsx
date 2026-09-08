import { useMemo, useRef, useState } from 'react'
import {
  Badge,
  Icon,
  Modal,
  parseDelimited,
  previewRundown,
  gearSheet,
  surfacePlan,
  rundownCoverage,
  rundownFindings,
  rundownFromPreview,
  rundownView,
  rundownViewCsv,
  rundownViewRows,
  suggestMapping,
  RUNDOWN_AUDIENCES,
  RUNDOWN_FIELDS,
  type ColumnMapping,
  type GearSheet,
  type Rundown,
  type RundownField,
  type RundownAudience,
  type RundownPreview,
  type RowSkipReason,
} from '@avplan/ui'
// `SuiteSeed` kommt aus dem Bruecken-Eintrag und nicht aus dem Haupt-Eintrag:
// dort ist es zuhause (`@avplan/ui/embed` re-exportiert `seed.ts`), und es
// zweimal zu exportieren gaebe zwei Namen fuer denselben Typ.
import type { SuiteSeed } from '@avplan/ui/embed'
import {
  arbeitsmappeAusZeilen,
  istArbeitsmappe,
  parseArbeitsmappe,
} from './rundownXlsx'
import { Card } from './dashboard'
import { useT, format } from '../i18n'

/**
 * BEDARF 8 + 6 — der Ablauf des Kunden, eingelesen und mit dem Plan verknuepft.
 *
 * WARUM NEBEN DEM TAGESABLAUF UND NICHT STATT SEINER. Das sind zwei
 * Dokumente mit zwei Eigentuemern, und sie zusammenzulegen hiesse, einem von
 * beiden seinen zu nehmen:
 *
 *   * Der **Tagesablauf** (`RunOfShowCard`) gehoert der Produktion. Load-in,
 *     Soundcheck, Doors, Load-out, je mit Gewerk — hier angelegt, hier
 *     geaendert.
 *   * Der **Ablauf** (diese Karte) gehoert dem Kunden. Er lebt in dessen
 *     Tabelle, wird eingelesen und NICHT hier gefuehrt (E-18, 2026-09-07).
 *     Deshalb gibt es an dieser Karte keinen „Bearbeiten"-Knopf, sondern nur
 *     „einlesen" — und die Herkunft steht darunter, damit niemand die Karte
 *     fuer die Quelle haelt.
 *
 * WAS SIE ZEIGT, IST DIE VERKNUEPFUNG. Die Punkte selbst sind schnell
 * abgeschrieben; was es bis heute nirgends gab, ist die Antwort auf „was
 * entwertet diese Aenderung" — die Befunde unter der Liste.
 */
export function RundownCard({
  rundown,
  seed,
  onImport,
  now,
}: {
  rundown: Rundown | undefined
  seed: SuiteSeed
  /** Fehlt er, ist die Karte reine Anzeige (kein Persistenz-Weg vorhanden). */
  onImport?: (next: Rundown) => void
  /** Der Zeitstempel des Imports. Hereingereicht, damit die Rechnung rein bleibt. */
  now: () => string
}) {
  const t = useT()
  const [dialog, setDialog] = useState(false)

  const findings = useMemo(
    () => (rundown ? rundownFindings(rundown, seed) : []),
    [rundown, seed],
  )
  const coverage = useMemo(
    () => (rundown ? rundownCoverage(rundown, seed) : null),
    [rundown, seed],
  )

  return (
    <Card
      title={t('overview.card.rundown.title', 'Ablauf (eingelesen)')}
      icon="grid"
      action={
        <span className="flex items-center gap-1.5">
          {rundown && (
            <Badge tone="accent">
              {format(t('overview.card.rundown.points', '{n} Punkte'), {
                n: rundown.items.length,
              })}
            </Badge>
          )}
          {onImport && (
            <button
              type="button"
              className="av-focus rounded-av-control px-1.5 py-0.5 text-[11px] font-medium text-av-text-secondary hover:bg-av-surface-2 hover:text-av-text"
              onClick={() => setDialog(true)}
            >
              {t('overview.card.rundown.import', 'Einlesen')}
            </button>
          )}
        </span>
      }
    >
      {onImport && (
        <RundownImportDialog
          open={dialog}
          seed={seed}
          now={now}
          onClose={() => setDialog(false)}
          onDone={(next) => {
            onImport(next)
            setDialog(false)
          }}
        />
      )}

      {rundown && (
        <RundownExports rundown={rundown} seed={seed} />
      )}

      {!rundown ? (
        <p className="text-[12.5px] text-av-text-muted">
          {t(
            'overview.card.rundown.empty',
            'Noch kein Ablauf eingelesen. Er wird hier nicht geführt — er kommt aus der Tabelle, in der er ohnehin lebt.',
          )}
        </p>
      ) : (
        <>
          <ol className="mb-2 flex flex-col gap-0">
            {rundown.items.map((item) => (
              <li key={item.id} className="grid grid-cols-[54px_1fr] items-start gap-2">
                <span className="av-num pt-0.5 text-[12px] text-av-text-muted">
                  {item.startMin != null
                    ? `${String(Math.floor(item.startMin / 60)).padStart(2, '0')}:${String(item.startMin % 60).padStart(2, '0')}`
                    : (item.startText ?? '—')}
                </span>
                <span className="pb-2">
                  <span className="block text-[13px] text-av-text">{item.title}</span>
                  {item.refs.length > 0 && (
                    <span className="text-[10.5px] text-av-text-faint">
                      {item.refs.map((r) => r.mentionedAs ?? r.id).join(' · ')}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <p className="text-[10.5px] text-av-text-faint">
            {format(
              t('overview.card.rundown.source', 'aus {file}, eingelesen {when}'),
              { file: rundown.source.filename, when: rundown.source.importedAt.slice(0, 16).replace('T', ' ') },
            )}
          </p>
          {coverage && coverage.total > 0 && (
            <p className="text-[10.5px] text-av-text-faint">
              {format(
                t('overview.card.rundown.coverage', '{n} von {m} Objekten des Plans kommen im Ablauf vor'),
                { n: coverage.referenced, m: coverage.total },
              )}
            </p>
          )}

          {findings.length > 0 && (
            <ul className="mt-2 flex flex-col gap-0.5">
              {findings.map((f, i) => (
                <li
                  key={`${f.kind}:${f.itemId}:${i}`}
                  className="flex items-start gap-1 text-[11px]"
                  style={{ color: f.severity === 'error' ? 'var(--av-danger)' : 'var(--av-warn)' }}
                >
                  <Icon name="warning" size={12} />
                  <span>{f.message}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  )
}

/**
 * Die Vorschau vor dem Import — die Forderung aus Bedarf 6 („confirm-before-
 * import"), und der Grund, warum der Maintainer von ontime seinen Importer
 * ueberhaupt umgebaut hat.
 *
 * DREI DINGE STEHEN HIER UND NICHT IM MODELL:
 *
 * 1. Die Zuordnung ist AENDERBAR. `suggestMapping` schlaegt vor; was es nicht
 *    trifft, legt der Mensch — es gibt keine Liste erwarteter Spaltennamen,
 *    an der eine fremde Tabelle scheitern koennte.
 * 2. Jede uebersprungene Zeile und jede unaufloesbare Nennung steht mit
 *    Zeilennummer da. Ein Import, der still die Haelfte schluckt, ist
 *    schlimmer als keiner.
 * 3. Uebernommen wird erst auf Knopfdruck.
 */
function RundownImportDialog({
  open,
  seed,
  now,
  onClose,
  onDone,
}: {
  open: boolean
  seed: SuiteSeed
  now: () => string
  onClose: () => void
  onDone: (r: Rundown) => void
}) {
  const t = useT()
  const datei = useRef<HTMLInputElement>(null)
  const [filename, setFilename] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})

  const preview: RundownPreview | null = useMemo(
    () => (headers.length > 0 ? previewRundown(headers, rows, mapping, seed) : null),
    [headers, rows, mapping, seed],
  )

  const lies = async (f: File) => {
    // Bedarf 4 — die Mappe ist das, was der Kunde schickt. Die Endung
    // entscheidet, welcher Leser drankommt; ab da ist der Weg derselbe
    // (`suggestMapping` → `previewRundown`). Ein zweiter Zuordnungs-Pfad
    // waere die Gelegenheit, dass CSV und XLSX auseinanderlaufen.
    const { headers: h, rows: r } = istArbeitsmappe(f.name)
      ? parseArbeitsmappe(await f.arrayBuffer())
      : parseDelimited(await f.text())
    setFilename(f.name)
    setHeaders(h)
    setRows(r)
    setMapping(suggestMapping(h))
  }

  const setzeSpalte = (spalte: string, feld: RundownField | '') =>
    setMapping((m) => {
      const next = { ...m }
      if (feld === '') delete next[spalte]
      else next[spalte] = feld
      return next
    })

  return (
    <Modal open={open} onClose={onClose} title={t('rundown.import.title', 'Ablauf einlesen')}>
      <div className="flex flex-col gap-3 text-[12.5px]">
        <p className="text-av-text-muted">
          {t(
            'rundown.import.hint',
            'Excel-Mappe, CSV, TSV oder ein aus der Tabelle kopierter Bereich. Aus einer Mappe wird das erste Blatt gelesen, Uhrzeiten so, wie sie dort stehen. Die Spalten werden vorgeschlagen — was nicht passt, wird hier gelegt. Übernommen wird erst am Ende.',
          )}
        </p>

        <input
          ref={datei}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv,text/tab-separated-values,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void lies(f)
          }}
          className="text-[12px]"
        />

        {headers.length > 0 && (
          <>
            <div className="flex flex-col gap-1">
              {headers.map((h) => (
                <label key={h} className="flex items-center gap-2">
                  <span className="w-40 truncate text-av-text-secondary">{h}</span>
                  <select
                    value={mapping[h] ?? ''}
                    onChange={(e) => setzeSpalte(h, e.target.value as RundownField | '')}
                    className="rounded-av-control border border-av-border bg-av-surface-1 px-1 py-0.5"
                  >
                    <option value="">{t('rundown.import.ignore', 'nicht übernehmen')}</option>
                    {RUNDOWN_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {t(`rundown.field.${f}`, FIELD_LABEL[f])}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {preview && (
              <>
                <p className="text-av-text">
                  {format(
                    t(
                      'rundown.import.count',
                      // Plural-frei formuliert: „1 Zeilen übersprungen" stand
                      // so im Dialog. Drei Zählwörter mit je zwei Formen wären
                      // sechs Strings; die Doppelpunkt-Form braucht keine.
                      'Punkte: {n} · übersprungen: {s} · Nennungen ohne Zuordnung: {u}',
                    ),
                    {
                      n: preview.items.length,
                      s: preview.skipped.length,
                      u: preview.unresolved.length,
                    },
                  )}
                </p>
                {preview.skipped.length > 0 && (
                  <ul className="flex max-h-24 flex-col gap-0.5 overflow-auto text-[11px] text-av-text-muted">
                    {preview.skipped.map((s) => (
                      <li key={`s${s.row}`}>
                        {format(t('rundown.import.skipped', 'Zeile {row}: {reason}'), {
                          row: s.row,
                          reason: t(`rundown.skip.${s.reason}`, SKIP_LABEL[s.reason]),
                        })}
                      </li>
                    ))}
                  </ul>
                )}
                {preview.unresolved.length > 0 && (
                  <ul className="flex max-h-24 flex-col gap-0.5 overflow-auto text-[11px]" style={{ color: 'var(--av-warn)' }}>
                    {preview.unresolved.map((u, i) => (
                      <li key={`u${i}`}>
                        {format(
                          u.matches === 0
                            ? t('rundown.import.unknown', 'Zeile {row}: „{text}“ gibt es im Plan nicht')
                            : t('rundown.import.ambiguous', 'Zeile {row}: „{text}“ passt auf {n} Objekte im Plan'),
                          { row: u.row, text: u.text, n: u.matches },
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {preview.ignoredColumns.length > 0 && (
                  <p className="text-[11px] text-av-text-faint">
                    {format(t('rundown.import.ignored', 'Nicht übernommen: {cols}'), {
                      cols: preview.ignoredColumns.join(', '),
                    })}
                  </p>
                )}
              </>
            )}
          </>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="av-focus rounded-av-control px-2 py-1" onClick={onClose}>
            {t('rundown.import.cancel', 'Abbrechen')}
          </button>
          <button
            type="button"
            disabled={!preview || preview.items.length === 0}
            className="av-focus rounded-av-control bg-av-accent px-2 py-1 text-av-accent-text disabled:opacity-50"
            onClick={() => {
              if (!preview) return
              onDone(
                rundownFromPreview(preview, {
                  filename,
                  importedAt: now(),
                  mapping,
                }),
              )
            }}
          >
            {t('rundown.import.confirm', 'Übernehmen')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * BEDARF 7 — dieselbe Quelle, jedes Empfaenger-Format.
 *
 *   > Each rendering is made by hand from the same rows and forks the moment
 *   > it is exported.
 *
 * Fuenf Knoepfe, EINE Quelle. Die Sichten sind Spalten-Auswahlen aus
 * `rundownViews.ts`, keine eigenen Datensaetze — deshalb kann sich hier
 * nichts gabeln. Diese Datei rechnet nichts aus; sie waehlt einen Empfaenger
 * und laedt herunter.
 *
 * Die Legende und die Stand-Zeile stehen IM Blatt, nicht daneben: ein
 * Beiblatt geht auf dem Weg zum Empfaenger verloren, und der Bedarf verlangt
 * „self-explaining" als Eigenschaft der Datei.
 */
/**
 * Deutsche Beschriftungen fuer die Feld-Zuordnung und die Ueberspring-Gruende.
 *
 * WARUM SIE HIER STEHEN UND NICHT ALS FALLBACK DIE ID: `t(key, fallback)`
 * nimmt den Fallback als DEUTSCHE Quell-Sprache. Stand dort die Id, las ein
 * deutscher Nutzer „cue", „refs" und „empty-row" im Dialog — aufgefallen am
 * Screenshot, nicht am Test, denn die englischen Eintraege waren vollstaendig
 * und der Erreichbarkeits-Guard prueft genau die.
 */
const FIELD_LABEL: Record<RundownField, string> = {
  cue: 'Cue',
  title: 'Titel',
  start: 'Beginn',
  duration: 'Dauer',
  note: 'Notiz',
  refs: 'Technik',
}

const SKIP_LABEL: Record<RowSkipReason, string> = {
  'no-title': 'kein Titel',
  'empty-row': 'leere Zeile',
}

const AUDIENCE_LABEL: Record<RundownAudience, string> = {
  client: 'Kunde',
  crew: 'Crew',
  department: 'Gewerk',
  signage: 'Foyer',
  showcaller: 'Show-Caller',
}

function RundownExports({ rundown, seed }: { rundown: Rundown; seed: SuiteSeed }) {
  const t = useT()
  // Bedarf 4 — dasselbe Blatt in beiden Formaten. Welches, entscheidet der
  // Empfaenger: die Regie will die Mappe, das Foyer-Display den Text.
  const [alsMappe, setAlsMappe] = useState(false)
  // Bedarf 45 — das Raster der Bedienoberflaeche. Voreingestellt 8x4, weil das
  // die Form des groessten verbreiteten Geraets ist; es ist eine VORAUSWAHL im
  // Feld und keine Annahme im Code — der Bediener aendert sie, und das Blatt
  // sagt in der Stand-Zeile, mit welchem Raster es gerechnet wurde.
  const [raster, setRaster] = useState({ spalten: 8, zeilen: 4 })
  const klemme = (roh: string, alt: number): number => {
    const n = Number.parseInt(roh, 10)
    return Number.isFinite(n) && n >= 1 && n <= 16 ? n : alt
  }
  const gib = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }
  const speichere = (basis: string, view: GearSheet) => {
    // Aus DERSELBEN Zeilen-Tabelle: `rundownViewCsv` baut sie sich intern
    // ebenfalls aus `rundownViewRows`. Zwei Ausgaben, ein Blatt.
    if (alsMappe) gib(`${basis}.xlsx`, arbeitsmappeAusZeilen(rundownViewRows(view), basis))
    else
      gib(`${basis}.csv`, new Blob([rundownViewCsv(view)], { type: 'text/csv;charset=utf-8' }))
  }
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1">
      {RUNDOWN_AUDIENCES.map((a) => (
        <button
          key={a}
          type="button"
          className="av-focus rounded-av-control border border-av-border px-1.5 py-0.5 text-[11px] text-av-text-secondary hover:bg-av-surface-2 hover:text-av-text"
          onClick={() => speichere(`ablauf-${a}`, rundownView(rundown, seed, a))}
        >
          {t(`rundown.audience.${a}`, AUDIENCE_LABEL[a])}
        </button>
      ))}
      {/* B-34 — abgesetzt, weil es KEIN sechster Empfaenger ist: die fuenf
          links sind Spalten-Auswahlen aus einer Zeile je Ablauf-Punkt, dieses
          Blatt hat eine Zeile je Gegenstand. In dieselbe Reihe gestellt liesse
          es sich fuer eine sechste Sicht halten. */}
      <span className="mx-0.5 h-3 w-px bg-av-border" aria-hidden />
      <button
        type="button"
        className="av-focus rounded-av-control border border-av-border px-1.5 py-0.5 text-[11px] text-av-text-secondary hover:bg-av-surface-2 hover:text-av-text"
        onClick={() => speichere('geraete-zeiten', gearSheet(rundown, seed))}
      >
        {t('rundown.sheet.gear', 'Geräte-Zeiten')}
      </button>
      {/* Bedarf 45 — der Weg vom INHALT des Ablaufs auf die Bedienoberflaeche.
          Ebenfalls abgesetzt und ebenfalls kein sechster Empfaenger: eine
          Zeile je TASTE, nicht je Ablauf-Punkt (Punkte ohne Technik bekommen
          keine). Das Raster steht daneben, weil nur der Bediener weiss, welche
          Oberflaeche vor ihm liegt — 15 Tasten am Stream Deck, 32 am XL, in
          Companion frei einstellbar. Eine eingebaute Zahl waere eine Annahme
          ueber fremde Hardware, die auf dem Blatt wie eine Tatsache aussieht. */}
      <button
        type="button"
        className="av-focus rounded-av-control border border-av-border px-1.5 py-0.5 text-[11px] text-av-text-secondary hover:bg-av-surface-2 hover:text-av-text"
        onClick={() => speichere('bedienoberflaeche', surfacePlan(rundown, seed, raster).blatt)}
      >
        {t('rundown.sheet.surface', 'Bedienoberfläche')}
      </button>
      <label className="flex items-center gap-1 text-[11px] text-av-text-secondary">
        {t('rundown.sheet.grid', 'Raster')}
        <input
          type="number"
          min={1}
          max={16}
          value={raster.spalten}
          onChange={(e) => setRaster((r) => ({ ...r, spalten: klemme(e.target.value, r.spalten) }))}
          aria-label={t('rundown.sheet.gridCols', 'Spalten je Seite')}
          className="w-10 rounded-av-control border border-av-border bg-av-surface-3 px-1 py-0.5 text-av-text"
        />
        ×
        <input
          type="number"
          min={1}
          max={16}
          value={raster.zeilen}
          onChange={(e) => setRaster((r) => ({ ...r, zeilen: klemme(e.target.value, r.zeilen) }))}
          aria-label={t('rundown.sheet.gridRows', 'Zeilen je Seite')}
          className="w-10 rounded-av-control border border-av-border bg-av-surface-3 px-1 py-0.5 text-av-text"
        />
      </label>
      {/* Das Format ist eine Eigenschaft der Ausgabe, nicht des Blattes —
          deshalb EIN Schalter neben den Knoepfen statt zwoelf Knoepfe. */}
      <label className="ml-1 flex items-center gap-1 text-[11px] text-av-text-secondary">
        <input
          type="checkbox"
          checked={alsMappe}
          onChange={(e) => setAlsMappe(e.target.checked)}
        />
        {t('rundown.sheet.asXlsx', 'als Excel-Mappe')}
      </label>
    </div>
  )
}
