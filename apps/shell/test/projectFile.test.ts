import { describe, expect, it } from 'vitest'
import { PROJECT } from '../src/data/project'
import { blankProject, parseProject, serializeProject } from '../src/data/projectFile'

describe('projectFile', () => {
  it('serialize → parse ist ein Roundtrip (Demo-Projekt)', () => {
    const round = parseProject(serializeProject(PROJECT))
    expect(round.meta.name).toBe(PROJECT.meta.name)
    expect(round.cameras).toHaveLength(PROJECT.cameras.length)
    expect(round.cables).toHaveLength(PROJECT.cables.length)
    expect(round.show.board.cards.length).toBe(PROJECT.show.board.cards.length)
  })

  it('blankProject ist gültig und leer', () => {
    const p = blankProject('Test')
    expect(p.meta.name).toBe('Test')
    expect(p.meta.saved).toBe(false)
    expect(p.cameras).toEqual([])
    expect(p.show.board.cards).toEqual([])
    expect(p.inventory.items).toEqual([])
  })

  it('parst auch ein rohes Projekt-Objekt (ohne Hülle) und füllt Lücken', () => {
    const raw = JSON.stringify({ meta: { name: 'Roh', venue: 'X', version: 3, saved: false } })
    const p = parseProject(raw)
    expect(p.meta.name).toBe('Roh')
    expect(p.meta.saved).toBe(true) // geladene Datei gilt als gespeichert
    expect(Array.isArray(p.cameras)).toBe(true)
    expect(p.show.board).toBeDefined()
  })

  it('wirft bei ungültigem Inhalt', () => {
    expect(() => parseProject('nicht json')).toThrow()
    expect(() => parseProject(JSON.stringify({ foo: 1 }))).toThrow(/Metadaten/)
  })
})
