// @vitest-environment happy-dom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  onPlannerReveal,
  sendPlannerReveal,
} from '../src/embed/plannerBridge'

/**
 * E-11 — der Querverweis reicht bis IN die eingebetteten Planer.
 *
 * Die Entscheidung nennt zwei Bedingungen, und beide sind hier geprueft:
 *
 *  1. „Der Sprung benutzt dieselben Ids wie der Seed." Kein zweiter Id-Raum,
 *     keine Uebersetzungstabelle, kein Namensabgleich als Rueckfallebene.
 *  2. „Wo eine App ein Objekt nicht kennt, wechselt sie das Modul und sagt,
 *     dass sie es nicht gefunden hat — SICHTBAR, statt stumm irgendwo zu
 *     landen." Ein stummer Sprung sieht aus wie ein gelungener.
 */

const wurzel = join(__dirname, '..', '..', '..')
const lies = (p: string): string => readFileSync(join(wurzel, p), 'utf8')

describe('Der Bus traegt die Bitte nur, wenn jemand zuhoert', () => {
  it('sagt nein, wenn kein Planer gemountet ist', () => {
    // Das ist der Unterschied zwischen „nicht gefunden" und „gar nicht
    // gefragt". Ohne ihn wartete die Shell auf eine Antwort, die nie kommt,
    // und der Nutzer saehe nichts — genau der stumme Sprung.
    expect(sendPlannerReveal({ id: 'v012' })).toBe(false)
  })

  it('reicht Id und Art an den gemounteten Rahmen weiter', () => {
    const gesehen: { id: string; kind?: string }[] = []
    const ab = onPlannerReveal((req) => gesehen.push({ id: req.id, kind: req.kind }))
    expect(sendPlannerReveal({ id: 'v012', kind: 'device' })).toBe(true)
    expect(gesehen).toEqual([{ id: 'v012', kind: 'device' }])
    ab()
    expect(sendPlannerReveal({ id: 'v012' })).toBe(false)
  })
})

describe('Die Planer antworten — auch mit nein', () => {
  it('meldet den Fehlschlag zurueck, statt ihn zu schlucken', async () => {
    const { connectShellReveal } = await import('@avplan/ui/embed')
    const gesendet: unknown[] = []
    const eltern = { postMessage: (m: unknown) => gesendet.push(m) }
    const alterParent = Object.getOwnPropertyDescriptor(window, 'parent')
    Object.defineProperty(window, 'parent', { value: eltern, configurable: true })
    try {
      const ab = connectShellReveal((id) =>
        id === 'kenne-ich' ? { found: true } : { found: false, grund: 'steht hier nicht' },
      )
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: 'avplan:reveal', id: 'kenne-ich-nicht' } }),
      )
      expect(gesendet).toHaveLength(1)
      expect(gesendet[0]).toMatchObject({
        type: 'avplan:revealResult',
        id: 'kenne-ich-nicht',
        found: false,
        grund: 'steht hier nicht',
      })
      ab()
    } finally {
      if (alterParent) Object.defineProperty(window, 'parent', alterParent)
    }
  })

  it('antwortet auch dann, wenn das Suchen wirft', async () => {
    const { connectShellReveal } = await import('@avplan/ui/embed')
    const gesendet: unknown[] = []
    const eltern = { postMessage: (m: unknown) => gesendet.push(m) }
    const alterParent = Object.getOwnPropertyDescriptor(window, 'parent')
    Object.defineProperty(window, 'parent', { value: eltern, configurable: true })
    try {
      const ab = connectShellReveal(() => {
        throw new Error('Store noch nicht da')
      })
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'avplan:reveal', id: 'x' } }))
      // Ein Planer, der beim Suchen abstuerzt, laesst die Shell sonst im
      // Glauben, es habe geklappt. Antworten wird ihm deshalb nicht ueberlassen.
      expect(gesendet[0]).toMatchObject({ type: 'avplan:revealResult', found: false })
      expect((gesendet[0] as { grund?: string }).grund).toContain('Store noch nicht da')
      ab()
    } finally {
      if (alterParent) Object.defineProperty(window, 'parent', alterParent)
    }
  })
})

describe('Kein zweiter Id-Raum und kein geratener Treffer', () => {
  const bruecken = [
    'apps/cable-planner/src/renderer/lib/shellRevealBridge.ts',
    'apps/multicam-planner/src/utils/shellRevealBridge.ts',
    'apps/light-planner/src/core/useShellReveal.ts',
  ]

  it.each(bruecken)('%s sucht ueber die Id und nicht ueber den Namen', (pfad) => {
    const code = lies(pfad)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((z) => !z.trim().startsWith('//'))
      .join('\n')
    // Der Vergleich laeuft gegen `.id`. Ein Namensabgleich waere ein
    // geratener Treffer fuer eine folgenreiche Entscheidung (ADR-002): der
    // Nutzer saehe ein anderes Objekt, ohne zu erfahren, dass geraten wurde.
    expect(code).toMatch(/\.id === id|\.id !== id/)
    expect(code).not.toMatch(/\.name\s*(===|==|\.includes|\.startsWith|\.toLowerCase)/)
    // Und keine Uebersetzungstabelle: die Seed-Id IST die native Id.
    expect(code).not.toMatch(/idMap|idZuordnung|mapId|übersetz|uebersetz/i)
  })

  it.each(bruecken)('%s antwortet in jedem Zweig', (pfad) => {
    const code = lies(pfad)
    // Jeder Rueckgabepfad traegt `found`. Ein Zweig ohne Antwort waere der
    // stumme Sprung — und der ist die eine Sache, die E-11 verbietet.
    const rueckgaben = code.match(/return \{[^}]*\}/g) ?? []
    expect(rueckgaben.length).toBeGreaterThan(0)
    for (const r of rueckgaben) expect(r).toContain('found')
  })

  it('alle drei Planer sind angeschlossen — sonst ist einer stumm', () => {
    expect(lies('apps/cable-planner/src/renderer/main.tsx')).toContain('initShellReveal()')
    expect(lies('apps/multicam-planner/src/main.tsx')).toContain('initShellReveal()')
    expect(lies('apps/light-planner/src/App.tsx')).toContain('useShellReveal(')
  })
})

describe('Die Shell zeigt den Fehlschlag', () => {
  it('macht aus `found: false` eine sichtbare Meldung', () => {
    const app = lies('apps/shell/src/App.tsx')
    const stelle = app.slice(app.indexOf("msg.type === 'avplan:revealResult'"))
    // Nicht `console.warn` und nicht stillschweigend verworfen: der Nutzer
    // steht vor dem Planer und sucht sonst nach etwas, das dort nie ankam.
    expect(stelle.slice(0, 1200)).toContain('pushToast')
    expect(app).not.toMatch(/revealResult[\s\S]{0,200}console\./)
  })

  it('fragt nur, wenn ein Planer offen ist', () => {
    const app = lies('apps/shell/src/App.tsx')
    const stelle = app.slice(app.indexOf('const selectItem = useCallback'))
    // Gefragt ist der AUSSTIEG, nicht die Erwaehnung: `plannerActive` steht
    // ohnehin in der Abhaengigkeitsliste, und ein Test, der nur danach sucht,
    // bleibt gruen, wenn die Bedingung faellt. Die erste Fassung tat genau das.
    expect(stelle.slice(0, 1400)).toMatch(/if \(!plannerActive\) return/)
  })
})

describe('Das Protokoll kennt die Antwort', () => {
  it('fuehrt beide Nachrichten in der Vereinigung', () => {
    const embed = lies('packages/ui/src/embed.ts')
    expect(embed).toContain('| RevealMessage')
    expect(embed).toContain('| RevealResultMessage')
  })

  it('zwingt den Planer zu einer Antwort — im Typ, nicht in der Prosa', () => {
    const embed = lies('packages/ui/src/embed.ts')
    const sig = embed.slice(embed.indexOf('export function connectShellReveal'))
    // Der Rueckgabetyp von `zeige` ist die Stelle, an der die Auflage steht:
    // wer `void` zurueckgeben koennte, koennte schweigen.
    expect(sig.slice(0, 300)).toContain('{ found: boolean; grund?: string }')
  })
})

describe('Vollstaendigkeit', () => {
  it('laesst keinen Planer ohne Bruecke', () => {
    // Waechst die Suite um einen vierten eingebetteten Planer, faellt das hier
    // auf: jeder Planer mit einer Seed-Bruecke braucht auch eine Zeig-Bruecke,
    // sonst ist der Sprung dorthin stumm.
    const mitSeed = [
      'apps/cable-planner/src/renderer/lib/shellSeedBridge.ts',
      'apps/multicam-planner/src/utils/shellSeedBridge.ts',
      'apps/light-planner/src/core/useShellSeed.ts',
    ]
    const mitZeigen = [
      'apps/cable-planner/src/renderer/lib/shellRevealBridge.ts',
      'apps/multicam-planner/src/utils/shellRevealBridge.ts',
      'apps/light-planner/src/core/useShellReveal.ts',
    ]
    expect(mitZeigen).toHaveLength(mitSeed.length)
    for (const p of mitZeigen) expect(() => lies(p)).not.toThrow()
  })
})
