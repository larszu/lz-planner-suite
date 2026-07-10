import { describe, it, expect } from 'vitest'
import { createOnboardingState, type OnboardingStorage } from '../src/state'
import { formatStepHeader, getStrings } from '../src/strings'

const fakeStorage = (initial: Record<string, string> = {}): OnboardingStorage & {
  data: Record<string, string>
} => {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v
    },
  }
}

describe('createOnboardingState', () => {
  it('frischer Storage: nichts gesehen, markSeen persistiert pro App-Key', () => {
    const storage = fakeStorage()
    const state = createOnboardingState({ appId: 'test-app', storage })
    expect(state.hasSeen('welcome')).toBe(false)
    expect(state.hasSeen('tour')).toBe(false)
    state.markSeen('welcome')
    expect(state.hasSeen('welcome')).toBe(true)
    expect(state.hasSeen('tour')).toBe(false)
    expect(JSON.parse(storage.data['avplan.onboarding.test-app'])).toEqual({ welcome: 1 })
  })

  it('Flags sind unabhaengig und additiv', () => {
    const storage = fakeStorage()
    const state = createOnboardingState({ appId: 'a', storage })
    state.markSeen('tour')
    state.markSeen('wizard')
    expect(JSON.parse(storage.data['avplan.onboarding.a'])).toEqual({ tour: 1, wizard: 1 })
  })

  it('migrateFrom uebernimmt Legacy-Flags (Wert "1")', () => {
    const storage = fakeStorage({ 'cp.tourSeen.v1': '1' })
    const state = createOnboardingState({
      appId: 'cable-planner',
      storage,
      migrateFrom: [{ key: 'cp.tourSeen.v1', flag: 'tour' }],
    })
    expect(state.hasSeen('tour')).toBe(true)
    expect(state.hasSeen('welcome')).toBe(false)
  })

  it('migrateFrom ignoriert fremde Werte und ueberschreibt neuen State nicht', () => {
    const storage = fakeStorage({
      legacy: 'yes',
      'avplan.onboarding.x': JSON.stringify({ welcome: 1 }),
    })
    const state = createOnboardingState({
      appId: 'x',
      storage,
      migrateFrom: [{ key: 'legacy', flag: 'tour' }],
    })
    expect(state.hasSeen('tour')).toBe(false)
    expect(state.hasSeen('welcome')).toBe(true)
  })

  it('kaputter Storage-Inhalt (kein JSON): fail-closed, alles gilt als gesehen', () => {
    const storage = fakeStorage({ 'avplan.onboarding.b': 'not json' })
    const state = createOnboardingState({ appId: 'b', storage })
    expect(state.hasSeen('welcome')).toBe(true)
    expect(state.hasSeen('tour')).toBe(true)
  })

  it('werfender Storage: hasSeen true, markSeen wirft nicht', () => {
    const throwing: OnboardingStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    const state = createOnboardingState({ appId: 'c', storage: throwing })
    expect(state.hasSeen('tour')).toBe(true)
    expect(() => state.markSeen('tour')).not.toThrow()
  })
})

describe('strings', () => {
  it('Deutsch ist Default, Englisch vollstaendig vorhanden', () => {
    expect(getStrings().later).toBe('Später entscheiden')
    const en = getStrings('en')
    expect(en.later).toBe('Decide later')
    for (const value of Object.values(en)) expect(value).toBeTruthy()
  })

  it('Overrides gewinnen (App-i18n-Durchgriff)', () => {
    const strings = getStrings('de', { next: 'Weiter geht es' })
    expect(strings.next).toBe('Weiter geht es')
    expect(strings.back).toBe('Zurück')
  })

  it('formatStepHeader ersetzt Platzhalter', () => {
    expect(formatStepHeader('Schritt {step} / {total}', 3, 7)).toBe('Schritt 3 / 7')
  })
})
