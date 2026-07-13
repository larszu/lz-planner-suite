import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  ALL_WIDGETS,
  DEFAULT_CARD_ORDER,
  defaultDashboardPrefs,
  loadDashboardPrefs,
  saveDashboardPrefs,
} from '../src/shell/dashboardPrefs'

// Die Shell-Tests laufen ohne DOM (node-Umgebung) — daher ein minimaler
// localStorage-Stub, damit load/save testbar sind.
class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string): string | null {
    return this.m.has(k) ? (this.m.get(k) as string) : null
  }
  setItem(k: string, v: string): void {
    this.m.set(k, v)
  }
  removeItem(k: string): void {
    this.m.delete(k)
  }
  clear(): void {
    this.m.clear()
  }
}

beforeAll(() => {
  ;(globalThis as { window?: { localStorage: MemoryStorage } }).window = { localStorage: new MemoryStorage() }
})
afterEach(() => (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.clear())

describe('dashboardPrefs', () => {
  it('Default: alle Elemente an, Karten in Standard-Reihenfolge', () => {
    const p = defaultDashboardPrefs()
    for (const id of ALL_WIDGETS) expect(p.enabled[id]).toBe(true)
    expect(p.order).toEqual(DEFAULT_CARD_ORDER)
  })

  it('save → load ist ein Roundtrip', () => {
    const p = defaultDashboardPrefs()
    p.enabled.budget = false
    p.order = ['crew', 'runofshow', 'budget', 'readiness', 'tasks', 'logistics', 'contacts']
    saveDashboardPrefs(p)
    const back = loadDashboardPrefs()
    expect(back.enabled.budget).toBe(false)
    expect(back.order[0]).toBe('crew')
  })

  it('load füllt fehlende/fremde Order-Einträge auf (kein Drift)', () => {
    ;(globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
      'avplan.dashboard',
      JSON.stringify({ order: ['crew', 'bogus'] }),
    )
    const back = loadDashboardPrefs()
    expect([...back.order].sort()).toEqual([...DEFAULT_CARD_ORDER].sort())
    expect(back.order[0]).toBe('crew')
  })
})
