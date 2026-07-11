import type { Board, BoardCard, BoardConnection } from './project'

/* Reine Board-Logik: Layout (inkl. Spalten), Vorlagen und Markdown-Export.
 * Bewusst ohne React, damit sie testbar bleibt. */

export interface Rect { x: number; y: number; w: number; h: number }

export const COL_HEADER = 34
export const COL_PAD = 8
export const COL_GAP = 8

/** Deterministische Höhe je Kartentyp (Spalten werden im Layout berechnet). */
export function cardHeight(card: BoardCard): number {
  switch (card.type) {
    case 'heading': return 44
    case 'note': return 104
    case 'link': return 70
    case 'todo': return 46 + (card.items?.length ?? 0) * 24
    case 'color': return 96
    case 'look': return 148
    case 'column': return COL_HEADER + 40
  }
}

/**
 * Absolute Rechtecke aller Karten. Freie Karten liegen an ihrer eigenen
 * Position; Spalten-Mitglieder werden vertikal im Container gestapelt, sodass
 * sie mit der Spalte wandern. Anker für Verbindungslinien kommen aus dieser Map.
 */
export function layoutBoard(cards: BoardCard[]): Map<string, Rect> {
  const map = new Map<string, Rect>()
  for (const c of cards) {
    if (c.type === 'column' || c.columnId) continue
    map.set(c.id, { x: c.x, y: c.y, w: c.w, h: cardHeight(c) })
  }
  for (const col of cards.filter((c) => c.type === 'column')) {
    const members = cards.filter((c) => c.columnId === col.id)
    const innerW = col.w - COL_PAD * 2
    let y = col.y + COL_HEADER + COL_PAD
    for (const m of members) {
      const h = cardHeight(m)
      map.set(m.id, { x: col.x + COL_PAD, y, w: innerW, h })
      y += h + COL_GAP
    }
    const contentH = members.length ? y - COL_GAP - col.y : COL_HEADER + 40
    map.set(col.id, { x: col.x, y: col.y, w: col.w, h: Math.max(COL_HEADER + 40, contentH + COL_PAD) })
  }
  return map
}

/* ── Vorlagen ──────────────────────────────────────────────────────────────*/

export type TemplateId = 'moodboard' | 'brief' | 'storyboard'

export interface TemplateResult { cards: BoardCard[]; connections: BoardConnection[] }

const SWATCHES = ['#f5a623', '#38bdf8', '#a78bfa', '#34d399']

export function applyTemplate(id: TemplateId, gen: () => string): TemplateResult {
  if (id === 'moodboard') {
    const h = gen()
    const looks = ['Warmes Bühnenlicht', 'Kühle Akzente', 'Publikum im Dunkel']
    const cards: BoardCard[] = [
      { id: h, type: 'heading', x: 60, y: 40, w: 320, text: 'Look & Feel' },
      ...looks.map((t, i): BoardCard => ({ id: gen(), type: 'look', x: 60 + i * 210, y: 120, w: 190, title: t, color: SWATCHES[i] })),
      { id: gen(), type: 'note', x: 60, y: 300, w: 240, text: 'Stimmung, Kontrast, Key/Fill — Abgleich mit der Licht-Ebene.' },
    ]
    return { cards, connections: [{ id: gen(), from: h, to: cards[1].id }] }
  }
  if (id === 'brief') {
    const colId = gen()
    const col: BoardCard = { id: colId, type: 'column', x: 80, y: 60, w: 300, title: 'Kreativ-Brief' }
    const notes = [
      'Ziel: Sommershow als Broadcast-Event, warm & einladend.',
      'Stil: kinoartiges Licht, ruhige Kameraführung.',
      'Referenzen: Show 2025, Key/Fill 2,8 : 1.',
      'Rahmen: Budget & Zeitplan siehe Übersicht.',
    ]
    const members = notes.map((t): BoardCard => ({ id: gen(), type: 'note', x: 0, y: 0, w: 0, text: t, columnId: colId }))
    return { cards: [col, ...members], connections: [] }
  }
  // storyboard
  const h = gen()
  const scenes = ['Intro / Opener', 'Talk · Host + Gast', 'Live-Act', 'Outro']
  const cards: BoardCard[] = [
    { id: h, type: 'heading', x: 60, y: 40, w: 320, text: 'Storyboard' },
    ...scenes.map((t, i): BoardCard => ({ id: gen(), type: 'look', x: 60 + i * 200, y: 120, w: 180, title: `${i + 1}. ${t}`, color: SWATCHES[i % SWATCHES.length] })),
  ]
  return { cards, connections: [] }
}

/* ── Markdown-Export ───────────────────────────────────────────────────────*/

function cardMarkdown(c: BoardCard): string {
  switch (c.type) {
    case 'heading': return `## ${c.text ?? ''}`
    case 'note': return c.text ?? ''
    case 'link': return `- [${c.title ?? c.url ?? 'Link'}](${c.url ?? ''})`
    case 'todo': return [`**${c.title ?? 'To-do'}**`, ...(c.items ?? []).map((i) => `- [${i.done ? 'x' : ' '}] ${i.text}`)].join('\n')
    case 'color': return `- ${c.title ?? 'Farbe'} \`${c.color ?? ''}\``
    case 'look': return `- Look: ${c.title ?? ''}`
    case 'column': return ''
  }
}

/** Wandelt ein Board in ein durchgehendes Markdown-Dokument. */
export function boardToMarkdown(board: Board, title = 'Kreativ-Board'): string {
  const lines: string[] = [`# ${title}`, '']
  const rendered = new Set<string>()
  for (const col of board.cards.filter((c) => c.type === 'column')) {
    lines.push(`## ${col.title ?? 'Spalte'}`, '')
    for (const m of board.cards.filter((c) => c.columnId === col.id)) {
      lines.push(cardMarkdown(m), '')
      rendered.add(m.id)
    }
    rendered.add(col.id)
  }
  const free = board.cards.filter((c) => !rendered.has(c.id) && c.type !== 'column' && !c.columnId)
  if (free.length && rendered.size > 0) lines.push('## Weitere', '')
  for (const c of free) lines.push(cardMarkdown(c), '')
  return `${lines.join('\n').trim()}\n`
}
