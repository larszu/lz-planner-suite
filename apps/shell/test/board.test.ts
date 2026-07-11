import { describe, it, expect } from 'vitest'
import { layoutBoard, applyTemplate, boardToMarkdown, getBoardAtPath, updateBoardAtPath, crumbTitles, COL_HEADER } from '../src/data/board'
import type { Board, BoardCard } from '../src/data/project'

let seq = 0
const gen = () => `t${(seq += 1)}`

describe('layoutBoard', () => {
  it('freie Karte liegt an ihrer eigenen Position', () => {
    const cards: BoardCard[] = [{ id: 'a', type: 'note', x: 40, y: 60, w: 200 }]
    const rect = layoutBoard(cards).get('a')!
    expect(rect.x).toBe(40)
    expect(rect.y).toBe(60)
    expect(rect.h).toBeGreaterThan(0)
  })

  it('Spalten-Mitglieder werden vertikal gestapelt und liegen unter dem Header', () => {
    const cards: BoardCard[] = [
      { id: 'col', type: 'column', x: 100, y: 100, w: 280, title: 'Spalte' },
      { id: 'm1', type: 'note', x: 0, y: 0, w: 0, columnId: 'col' },
      { id: 'm2', type: 'note', x: 0, y: 0, w: 0, columnId: 'col' },
    ]
    const map = layoutBoard(cards)
    const m1 = map.get('m1')!
    const m2 = map.get('m2')!
    // Erstes Mitglied unterhalb des Spaltenkopfs
    expect(m1.y).toBeGreaterThanOrEqual(100 + COL_HEADER)
    // Zweites Mitglied unter dem ersten
    expect(m2.y).toBeGreaterThan(m1.y)
    // Mitglieder liegen innerhalb der Spaltenbreite
    expect(m1.w).toBeLessThan(280)
    // Spaltenhöhe wächst über den leeren Default hinaus
    expect(map.get('col')!.h).toBeGreaterThan(COL_HEADER + 40)
  })
})

describe('applyTemplate', () => {
  it('Kreativ-Brief erzeugt eine Spalte mit Mitglied-Notizen', () => {
    const { cards } = applyTemplate('brief', gen)
    const col = cards.find((c) => c.type === 'column')
    expect(col).toBeTruthy()
    const members = cards.filter((c) => c.columnId === col!.id)
    expect(members.length).toBeGreaterThan(0)
    expect(members.every((m) => m.type === 'note')).toBe(true)
  })

  it('Moodboard erzeugt Looks und eine Verbindung', () => {
    const { cards, connections } = applyTemplate('moodboard', gen)
    expect(cards.some((c) => c.type === 'look')).toBe(true)
    expect(connections.length).toBeGreaterThan(0)
  })
})

describe('boardToMarkdown', () => {
  it('rendert Überschrift, To-do-Checkliste und Spalten-Abschnitt', () => {
    const md = boardToMarkdown({
      cards: [
        { id: 'h', type: 'heading', x: 0, y: 0, w: 0, text: 'Look' },
        { id: 't', type: 'todo', x: 0, y: 0, w: 0, title: 'Freigaben', items: [{ text: 'A', done: true }, { text: 'B', done: false }] },
        { id: 'col', type: 'column', x: 0, y: 0, w: 0, title: 'Brief' },
        { id: 'n', type: 'note', x: 0, y: 0, w: 0, text: 'Ziel', columnId: 'col' },
      ],
      connections: [],
    }, 'Test-Board')
    expect(md).toContain('# Test-Board')
    expect(md).toContain('## Look')
    expect(md).toContain('- [x] A')
    expect(md).toContain('- [ ] B')
    expect(md).toContain('## Brief')
    expect(md).toContain('Ziel')
  })

  it('rendert Bild-Karten als Bild-Zeile', () => {
    const md = boardToMarkdown({
      cards: [{ id: 'img', type: 'image', x: 0, y: 0, w: 240, src: 'data:image/jpeg;base64,AAAA', ratio: 1.5, title: 'Bühne' }],
      connections: [],
    }, 'Root')
    expect(md).toContain('- Bild: Bühne')
  })

  it('rendert verschachtelte Unterboards als tiefere Abschnitte', () => {
    const md = boardToMarkdown({
      cards: [
        { id: 'sub', type: 'board', x: 0, y: 0, w: 0, title: 'Kamera-Refs', board: {
          cards: [{ id: 'n', type: 'note', x: 0, y: 0, w: 0, text: 'Tele auf Host' }],
          connections: [],
        } },
      ],
      connections: [],
    }, 'Root')
    expect(md).toContain('# Root')
    expect(md).toContain('## Kamera-Refs (Unterboard)')
    expect(md).toContain('Tele auf Host')
  })
})

describe('Board-in-Board Navigation', () => {
  const nested: Board = {
    cards: [
      { id: 'a', type: 'note', x: 0, y: 0, w: 0, text: 'root-note' },
      { id: 'sub', type: 'board', x: 0, y: 0, w: 0, title: 'Sub', board: {
        cards: [{ id: 'b', type: 'note', x: 0, y: 0, w: 0, text: 'sub-note' }],
        connections: [],
      } },
    ],
    connections: [],
  }

  it('getBoardAtPath steigt in Unterboards ab', () => {
    expect(getBoardAtPath(nested, []).cards).toHaveLength(2)
    const sub = getBoardAtPath(nested, ['sub'])
    expect(sub.cards).toHaveLength(1)
    expect(sub.cards[0].text).toBe('sub-note')
  })

  it('updateBoardAtPath ändert nur das Board am Pfad (immutabel)', () => {
    const updated = updateBoardAtPath(nested, ['sub'], (b) => ({ ...b, cards: [...b.cards, { id: 'c', type: 'note', x: 0, y: 0, w: 0, text: 'added' }] }))
    expect(getBoardAtPath(updated, ['sub']).cards).toHaveLength(2)
    // Wurzel unverändert (kein Mutations-Leck)
    expect(getBoardAtPath(nested, ['sub']).cards).toHaveLength(1)
    // Root-Ebene unangetastet
    expect(updated.cards.find((c) => c.id === 'a')?.text).toBe('root-note')
  })

  it('crumbTitles liefert Wurzel + Ebenen', () => {
    expect(crumbTitles(nested, [], 'Board').map((c) => c.title)).toEqual(['Board'])
    expect(crumbTitles(nested, ['sub'], 'Board').map((c) => c.title)).toEqual(['Board', 'Sub'])
  })
})
