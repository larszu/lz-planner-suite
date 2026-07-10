import { describe, it, expect } from 'vitest'
import { cn } from '../src/cn'
import { resolveTheme } from '../src/theme'
import {
  fuzzyScore,
  rankCommands,
  flattenGroups,
  scoreCommand,
  type Command,
} from '../src/commands'

describe('cn', () => {
  it('verwirft falsy Werte und fügt Strings zusammen', () => {
    expect(cn('a', false, undefined, 'b', null, '')).toBe('a b')
    expect(cn()).toBe('')
  })
})

describe('resolveTheme', () => {
  it('explizite Präferenz gewinnt über System', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
  })
  it('system folgt dem OS-Signal', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('fuzzyScore', () => {
  it('leere Query matcht immer (Score 0)', () => {
    expect(fuzzyScore('', 'irgendwas')).toBe(0)
  })
  it('Subsequence matcht, Nicht-Subsequence nicht', () => {
    expect(fuzzyScore('sfl', 'Signal-Flow')).not.toBeNull()
    expect(fuzzyScore('xyz', 'Signal-Flow')).toBeNull()
  })
  it('kompakterer/früherer Treffer bekommt höheren Score', () => {
    const early = fuzzyScore('cam', 'Camera')!
    const late = fuzzyScore('cam', 'Webcam')!
    expect(early).toBeGreaterThan(late)
  })
})

const makeCommands = (): Command[] => [
  { id: 'a', title: 'Signal-Flow öffnen', group: 'Ansicht', run: () => {} },
  { id: 'b', title: '2D-Plan öffnen', group: 'Ansicht', run: () => {} },
  { id: 'c', title: 'Kamera hinzufügen', group: 'Aktionen', keywords: ['cam'], run: () => {} },
  { id: 'd', title: 'Nur Signal', group: 'Aktionen', when: (ctx) => ctx.moduleId === 'signal', run: () => {} },
]

describe('scoreCommand', () => {
  it('berücksichtigt Keywords', () => {
    const cmd = makeCommands()[2]
    expect(scoreCommand('cam', cmd)).not.toBeNull()
  })
})

describe('rankCommands', () => {
  it('when-Filter blendet kontextfremde Befehle aus', () => {
    const cmds = makeCommands()
    const inSignal = flattenGroups(rankCommands(cmds, '', { moduleId: 'signal' }))
    const inCam = flattenGroups(rankCommands(cmds, '', { moduleId: 'cameras' }))
    expect(inSignal.some((c) => c.id === 'd')).toBe(true)
    expect(inCam.some((c) => c.id === 'd')).toBe(false)
  })

  it('leere Query behält alle sichtbaren, gruppiert in Auftrittsreihenfolge', () => {
    const groups = rankCommands(makeCommands(), '', { moduleId: 'cameras' })
    expect(groups.map((g) => g.group)).toEqual(['Ansicht', 'Aktionen'])
    expect(flattenGroups(groups)).toHaveLength(3)
  })

  it('Query filtert und leere Gruppen verschwinden', () => {
    const groups = rankCommands(makeCommands(), 'plan', { moduleId: 'cameras' })
    expect(groups).toHaveLength(1)
    expect(groups[0].group).toBe('Ansicht')
    expect(groups[0].items[0].id).toBe('b')
  })

  it('sortiert nach Score über Gruppen hinweg', () => {
    const cmds: Command[] = [
      { id: 'x', title: 'Webcam', group: 'G', run: () => {} },
      { id: 'y', title: 'Camera', group: 'G', run: () => {} },
    ]
    const flat = flattenGroups(rankCommands(cmds, 'cam', { moduleId: 'any' }))
    expect(flat[0].id).toBe('y')
  })
})
