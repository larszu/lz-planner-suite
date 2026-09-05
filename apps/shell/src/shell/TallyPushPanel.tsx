import { useState } from 'react'
import { Badge, Button, Icon } from '@avplan/ui'
import { requestTallyMap } from '@avplan/ui/embed'
import { useT, format } from '../i18n'

/**
 * „Tally-Karte aus dem Plan senden" — der Weg vom Kabelplan auf den Pi.
 *
 * WAS VORHER WAR. Der Cable-Planer leitet die Karte längst aus dem Plan ab
 * (Rollen, Mischer-Eingänge, Router im Weg) und konnte sie als Datei
 * ausgeben. Von dort ging es per Hand: Datei auf den Pi kopieren, Dienst neu
 * starten. Zwei Werkzeuge, ein manueller Schritt dazwischen — und bei jeder
 * Plan-Änderung wieder.
 *
 * WARUM ERST LESEN, DANN SCHREIBEN. `merge_tally_config` auf dem Pi behält
 * jedes Feld, das der POST nicht mitbringt (ATEM-Adresse, GPIO-Verdrahtung),
 * aber Geräte, die der POST nicht nennt, verschwinden. Das ist die richtige
 * Semantik — der Plan besitzt die Quellenliste — und trotzdem eine Wirkung,
 * die niemand ungefragt auslösen soll. Deshalb steht hier vorher, was sich
 * ändern würde: neu, geändert, entfällt.
 */
export interface TallyDevice {
  id: string
  name: string
  input: number
}

interface Diff {
  neu: TallyDevice[]
  geaendert: { alt: TallyDevice; neu: TallyDevice }[]
  entfaellt: TallyDevice[]
  unveraendert: number
}

export function berechneDiff(plan: TallyDevice[], pi: TallyDevice[]): Diff {
  const piNachId = new Map(pi.map((d) => [d.id, d]))
  const planNachId = new Map(plan.map((d) => [d.id, d]))
  const neu: TallyDevice[] = []
  const geaendert: Diff['geaendert'] = []
  let unveraendert = 0
  for (const d of plan) {
    const alt = piNachId.get(d.id)
    if (!alt) neu.push(d)
    else if (alt.name !== d.name || alt.input !== d.input) geaendert.push({ alt, neu: d })
    else unveraendert += 1
  }
  const entfaellt = pi.filter((d) => !planNachId.has(d.id))
  return { neu, geaendert, entfaellt, unveraendert }
}

type Zustand =
  | { art: 'ruhe' }
  | { art: 'laedt' }
  | { art: 'vorschau'; diff: Diff; plan: TallyDevice[]; issues: { kind: string; message: string }[] }
  | { art: 'fertig'; anzahl: number }
  | { art: 'fehler'; text: string }

interface TallyBruecke {
  read: (url: string) => Promise<{ ok: boolean; json?: unknown; error?: string }>
  write: (url: string, devices: TallyDevice[]) => Promise<{ ok: boolean; error?: string }>
}

const bruecke = (): TallyBruecke | null =>
  (typeof window !== 'undefined' ? (window as unknown as { __suiteTally?: TallyBruecke }).__suiteTally : undefined) ??
  null

export function TallyPushPanel({ url, plannerFrame }: { url: string; plannerFrame: Window | null }) {
  const t = useT()
  const [z, setZ] = useState<Zustand>({ art: 'ruhe' })

  const vorbereiten = async () => {
    const br = bruecke()
    if (!br) {
      setZ({
        art: 'fehler',
        text: t('chrome.tally.noBridge', 'Das Senden läuft über den Desktop-Prozess und steht im Browser nicht zur Verfügung.'),
      })
      return
    }
    setZ({ art: 'laedt' })
    const karte = await requestTallyMap(plannerFrame)
    if (!karte.ok || !karte.devices) {
      setZ({ art: 'fehler', text: karte.error ?? t('chrome.tally.noMap', 'Der Plan lieferte keine Tally-Karte.') })
      return
    }
    const gelesen = await br.read(url)
    if (!gelesen.ok) {
      setZ({ art: 'fehler', text: gelesen.error ?? t('chrome.tally.readFailed', 'Der Pi antwortete nicht.') })
      return
    }
    const alt = ((gelesen.json as { devices?: TallyDevice[] } | undefined)?.devices ?? []).filter(
      (d): d is TallyDevice => !!d && typeof d.id === 'string',
    )
    setZ({ art: 'vorschau', diff: berechneDiff(karte.devices, alt), plan: karte.devices, issues: karte.issues ?? [] })
  }

  const senden = async (plan: TallyDevice[]) => {
    const br = bruecke()
    if (!br) return
    setZ({ art: 'laedt' })
    const r = await br.write(url, plan)
    if (r.ok) setZ({ art: 'fertig', anzahl: plan.length })
    else setZ({ art: 'fehler', text: r.error ?? t('chrome.tally.writeFailed', 'Der Pi hat die Karte abgelehnt.') })
  }

  return (
    <div className="rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Icon name="eye" size={15} />
        <span className="text-[13px] font-medium text-av-text">
          {t('chrome.tally.title', 'Tally-Karte aus dem Plan')}
        </span>
        <Badge tone="accent">{t('chrome.tally.badge', 'Signal-Plan → Pi')}</Badge>
        <div className="ml-auto">
          <Button variant="primary" size="sm" onClick={() => void vorbereiten()} disabled={z.art === 'laedt'}>
            {z.art === 'laedt' ? t('chrome.tally.working', 'einen Moment …') : t('chrome.tally.prepare', 'Abgleich anzeigen')}
          </Button>
        </div>
      </div>

      {z.art === 'ruhe' && (
        <p className="mt-2 text-[12px] text-av-text-muted">
          {t(
            'chrome.tally.hint',
            'Die Quellenliste (Name und Mischer-Eingang je Rolle) kommt aus dem Signal-Plan. ATEM-Adresse und GPIO-Verdrahtung bleiben auf dem Pi.',
          )}
        </p>
      )}

      {z.art === 'fehler' && <p className="mt-2 text-[12px] text-av-danger">{z.text}</p>}

      {z.art === 'fertig' && (
        <p className="mt-2 text-[12px] text-av-ok">
          {format(t('chrome.tally.done', '{n} Quellen an den Pi gesendet.'), { n: String(z.anzahl) })}
        </p>
      )}

      {z.art === 'vorschau' && (
        <div className="mt-2 space-y-2 text-[12px]">
          <div className="text-av-text-secondary">
            {format(
              t('chrome.tally.summary', '{neu} neu · {geaendert} geändert · {entfaellt} entfällt · {gleich} unverändert'),
              {
                neu: String(z.diff.neu.length),
                geaendert: String(z.diff.geaendert.length),
                entfaellt: String(z.diff.entfaellt.length),
                gleich: String(z.diff.unveraendert),
              },
            )}
          </div>
          {z.diff.entfaellt.length > 0 && (
            <div className="rounded border border-av-warn/40 bg-av-warn/10 px-2 py-1.5 text-av-text-secondary">
              {t(
                'chrome.tally.removalWarning',
                'Diese Einträge stehen auf dem Pi, aber nicht im Plan — sie verschwinden beim Senden:',
              )}{' '}
              {z.diff.entfaellt.map((d) => d.name).join(', ')}
            </div>
          )}
          {z.issues.length > 0 && (
            <div className="rounded border border-av-border-muted bg-av-surface-3 px-2 py-1.5 text-av-text-muted">
              {t('chrome.tally.issues', 'Der Plan konnte nicht alles auflösen:')}{' '}
              {z.issues.map((i) => i.message).join(' · ')}
            </div>
          )}
          <div className="flex gap-2">
            {/* Ein leerer Plan kann nur loeschen. Gemessen am Stub-Pi: eine
                Sendung mit null Quellen leerte dessen Geraeteliste, waehrend
                die ATEM-Adresse blieb -- die Warnung stand da, der Knopf war
                trotzdem aktiv. Ein Weg, der nur Schaden anrichten kann,
                gehoert nicht angeboten, sondern erklaert. */}
            <Button
              variant="primary"
              size="sm"
              disabled={z.plan.length === 0}
              onClick={() => void senden(z.plan)}
            >
              {format(t('chrome.tally.send', '{n} Quellen senden'), { n: String(z.plan.length) })}
            </Button>
            <Button variant="subtle" size="sm" onClick={() => setZ({ art: 'ruhe' })}>
              {t('chrome.tally.cancel', 'Abbrechen')}
            </Button>
          </div>
          {z.plan.length === 0 && (
            <p className="text-av-text-muted">
              {t(
                'chrome.tally.emptyPlan',
                'Der Plan trägt keine Tally-Quelle — es gibt nichts zu senden. Eine leere Sendung würde nur die Liste auf dem Pi löschen. Erst im Signal-Plan Rollen vergeben (Quelle → Mischer-Eingang).',
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
