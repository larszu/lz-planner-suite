import { useCallback, useEffect, useState } from 'react'
import { Button, Icon } from '@avplan/ui'
import type { RuntimeDef } from '../modules/runtimes'
import { useT, format } from '../i18n'
import {
  beendeLokal,
  beiZustand,
  holeZustand,
  kannStarten,
  ladePfade,
  speicherePfade,
  starteLokal,
  type LaufZustand,
} from '../shell/runtimeLokal'

/**
 * Host für die Oberfläche einer der vier Laufzeit-Anwendungen (Tally, Kamera,
 * Intercom, Medien-Station).
 *
 * UNTERSCHIED ZU `PlannerFrame`. Ein Planer wird mitgeliefert und ist deshalb
 * immer da; ein Gerät im Netz ist es nicht. Der Normalfall „läuft gerade
 * nicht" darf hier kein toter Rahmen sein und erst recht keine Attrappe: er
 * sagt, welche Adresse versucht wurde, was dort laufen müsste und wie man es
 * startet — und lässt die Adresse ändern.
 *
 * ERREICHBARKEIT WIRD GEMESSEN, NICHT GERATEN. Ein `<iframe>` auf einen toten
 * Host feuert `load` genau wie auf einen lebenden — dort steht dann Chromiums
 * Fehlerseite, und der Rahmen sähe „bereit" aus. Deshalb geht vorher ein
 * `fetch(..., { mode: 'no-cors' })` an dieselbe URL: die Antwort ist opak
 * (der Inhalt interessiert nicht), aber sie kommt nur, wenn dort wirklich
 * jemand antwortet.
 */
export function RuntimeFrame({
  runtime,
  url,
  onOpenSettings,
}: {
  runtime: RuntimeDef
  url: string
  /** Öffnet die Einstellungen auf dem Tab „Geräte im Netz". */
  onOpenSettings?: () => void
}) {
  const t = useT()
  const [versuch, setVersuch] = useState(0)
  // Der Zustand wird ABGELEITET, nicht zu Beginn des Effekts gesetzt.
  //
  // Die erste Fassung rief `setState('pruefen')` synchron im Effekt-Rumpf --
  // `react-hooks/set-state-in-effect`, und in diesem Workspace ein Fehler,
  // kein Hinweis. Der Regel ist nicht mit einem Kommentar beizukommen: sie
  // beschreibt genau die Kaskade, die hier entstuende. Stattdessen merkt sich
  // die Komponente nur, WOFUER ein Ergebnis vorliegt; solange es zur aktuellen
  // Adresse und zum aktuellen Versuch nicht passt, wird gesucht. Der Effekt
  // schreibt damit nur noch aus seinen asynchronen Rueckwegen.
  const [ergebnis, setErgebnis] = useState<{ fuer: string; erreichbar: boolean } | null>(null)
  const schluessel = `${url}#${versuch}`
  const state: 'pruefen' | 'da' | 'weg' =
    ergebnis?.fuer !== schluessel ? 'pruefen' : ergebnis.erreichbar ? 'da' : 'weg'

  useEffect(() => {
    const ctrl = new AbortController()
    // `verworfen` trennt die beiden Gruende fuer einen Abbruch: eine
    // abgelaufene Frist ist ein BEFUND („nicht erreichbar"), ein Wechsel des
    // Moduls oder der Adresse ist keiner. Ohne die Unterscheidung schriebe der
    // Aufraeum-Pfad noch ein Ergebnis, das niemand mehr anzeigt.
    let verworfen = false
    const frist = window.setTimeout(() => ctrl.abort(), 4000)
    fetch(url, { mode: 'no-cors', signal: ctrl.signal, cache: 'no-store' })
      .then(() => {
        window.clearTimeout(frist)
        if (!verworfen) setErgebnis({ fuer: schluessel, erreichbar: true })
      })
      .catch(() => {
        window.clearTimeout(frist)
        if (!verworfen) setErgebnis({ fuer: schluessel, erreichbar: false })
      })
    return () => {
      verworfen = true
      window.clearTimeout(frist)
      ctrl.abort()
    }
  }, [url, schluessel])

  const erneut = useCallback(() => setVersuch((v) => v + 1), [])

  // ─── LOKAL STARTEN (suite#233) ────────────────────────────────────────────
  //
  // Nur im Electron-Host: `kannStarten()` ist im Browser-Bau false, und dann
  // erscheint hier gar nichts. Ein Knopf, der auf der Pages-Fassung nichts tun
  // kann, waere eine Attrappe — und „hier kannst du es starten" ist genau die
  // Art Zusage, die stimmen muss.
  const startbar = kannStarten()
  const [pfad, setPfad] = useState<string>(() => ladePfade()[runtime.id] ?? '')
  const [lauf, setLauf] = useState<LaufZustand>({ laeuft: false, zeilen: [], code: null })
  const [startFehler, setStartFehler] = useState<string | null>(null)

  useEffect(() => {
    if (!startbar) return
    let weg = false
    void holeZustand(runtime.id).then((z) => { if (!weg) setLauf(z) })
    const ab = beiZustand((id, z) => { if (id === runtime.id) setLauf(z) })
    return () => { weg = true; ab() }
  }, [runtime.id, startbar])

  // Laeuft der Prozess, aber die Oberflaeche ist noch nicht da, wird weiter
  // gesucht: ein gestarteter Server braucht ein paar Sekunden, bis er den Port
  // annimmt. Ohne das muesste der Nutzer selbst auf „Erneut suchen" druecken
  // und haette den Eindruck, der Start habe nicht gewirkt.
  useEffect(() => {
    if (!lauf.laeuft || state === 'da') return
    const uhr = window.setInterval(erneut, 2000)
    return () => window.clearInterval(uhr)
  }, [lauf.laeuft, state, erneut])

  const starte = async () => {
    setStartFehler(null)
    const p = pfad.trim()
    speicherePfade({ ...ladePfade(), [runtime.id]: p })
    const r = await starteLokal(runtime.id, p)
    if (!r.ok) {
      setStartFehler(
        r.grund === 'nicht-gefunden'
          ? format(t('chrome.runtime.startNoDir', 'Das Verzeichnis {dir} gibt es nicht.'), { dir: p })
          : r.grund === 'kein-repo'
            ? format(t('chrome.runtime.startNoRepo', 'In {dir} fehlt {file} — das ist nicht das Repository {repo}.'), { dir: p, file: String(r.fehlt ?? ''), repo: runtime.repo })
            : r.grund === 'falsches-repo'
              ? format(t('chrome.runtime.startWrongRepo', 'In {dir} liegt {found}, erwartet war {repo}.'), { dir: p, found: String(r.gefunden ?? ''), repo: runtime.repo })
              : r.grund === 'kein-pfad'
                ? t('chrome.runtime.startNoPath', 'Bitte das Verzeichnis des Repositorys angeben.')
                : format(t('chrome.runtime.startFailed', 'Start fehlgeschlagen: {text}'), { text: String(r.text ?? r.grund ?? '') }),
      )
      return
    }
    erneut()
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-surface-3">
      {state === 'da' && (
        <iframe
          key={`${url}#${versuch}`}
          src={url}
          title={runtime.title}
          className="h-full w-full border-0 bg-av-surface-3"
        />
      )}
      {state === 'pruefen' && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-av-text-muted">
          {format(t('chrome.runtime.checking', '{title} wird gesucht …'), { title: runtime.title })}
        </div>
      )}
      {state === 'weg' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <Icon name={runtime.icon} size={28} />
          <div className="text-base font-semibold text-av-text">
            {format(t('chrome.runtime.unreachable', '{title} ist unter {url} nicht erreichbar'), {
              title: runtime.title,
              url,
            })}
          </div>
          <p className="max-w-lg text-sm text-av-text-muted">{runtime.was}</p>
          <p className="max-w-lg text-sm text-av-text-faint">
            {runtime.start} ({t('chrome.runtime.repo', 'Repository')}: <code>{runtime.repo}</code>)
          </p>
          {startbar && (
            <div className="w-full max-w-lg rounded-av-card border border-av-border bg-av-surface-1 p-3 text-left">
              <div className="text-sm font-semibold text-av-text">
                {t('chrome.runtime.startHere', 'Hier starten')}
              </div>
              <label className="mt-2 block text-xs text-av-text-muted">
                {format(t('chrome.runtime.repoDir', 'Verzeichnis des Repositorys {repo}'), { repo: runtime.repo })}
                <input
                  value={pfad}
                  onChange={(e) => setPfad(e.target.value)}
                  placeholder={`…/${runtime.repo}`}
                  spellCheck={false}
                  className="mt-1 w-full rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-xs text-av-text outline-none"
                />
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {lauf.laeuft ? (
                  <>
                    <Button variant="subtle" onClick={() => void beendeLokal(runtime.id)}>
                      {t('chrome.runtime.stop', 'Beenden')}
                    </Button>
                    <span className="text-xs text-av-text-muted">
                      {format(t('chrome.runtime.running', 'Läuft (PID {pid}) — die Oberfläche kommt gleich.'), { pid: String(lauf.pid ?? '?') })}
                    </span>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => void starte()}>
                    <Icon name="external" size={15} /> {t('chrome.runtime.startLocal', 'Lokal starten')}
                  </Button>
                )}
              </div>
              {startFehler && <div className="mt-2 text-xs text-av-danger">{startFehler}</div>}
              {/* Die letzten Ausgabezeilen. Sie stehen hier, weil ein Start, der
                  sofort wieder aufhoert, sonst wie ein Knopf ohne Wirkung
                  aussaehe — der Grund steht dann in genau diesen Zeilen. */}
              {!lauf.laeuft && lauf.code !== null && (
                <div className="mt-2">
                  <div className="text-xs text-av-danger">
                    {format(t('chrome.runtime.exited', 'Beendet (Code {code}).'), { code: String(lauf.code) })}
                  </div>
                  {lauf.zeilen.length > 0 && (
                    <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-av-surface-3 p-2 text-[11px] text-av-text-muted">
                      {lauf.zeilen.slice(-8).join('\n')}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={erneut}>
              {t('chrome.runtime.retry', 'Erneut suchen')}
            </Button>
            {onOpenSettings && (
              <Button variant="subtle" onClick={onOpenSettings}>
                <Icon name="settings" size={15} /> {t('chrome.runtime.changeAddress', 'Adresse ändern')}
              </Button>
            )}
            <Button variant="subtle" onClick={() => window.open(url, '_blank', 'noopener')}>
              <Icon name="external" size={15} /> {t('chrome.runtime.openNewTab', 'In neuem Tab öffnen')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
