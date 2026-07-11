import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@avplan/ui'
import type { Board, BoardCard, BoardCardType, BoardConnection } from '../data/project'

/* Milanote-artiges Kreativ-Board: Karten frei platzieren, verschieben, inline
 * editieren, per Handle mit Pfeilen verbinden. Zustand liegt lokal in der
 * Komponente (aus dem Projekt geseedet oder leer im Standalone-Betrieb); der
 * Parent erzwingt per `key` einen Reset bei Projektwechsel. */

const BOARD_W = 2400
const BOARD_H = 1500

const SWATCHES = ['#f5a623', '#38bdf8', '#a78bfa', '#34d399', '#f87171', '#f2c26b', '#5aa9e6', '#1a2130']

let idSeq = 0
const nextId = () => `c${(idSeq += 1)}_${Math.round(performance.now())}`

/** Deterministische Kartenhöhe — auch Anker für Verbindungslinien. */
function cardHeight(card: BoardCard): number {
  switch (card.type) {
    case 'heading': return 44
    case 'note': return 104
    case 'link': return 70
    case 'todo': return 46 + (card.items?.length ?? 0) * 24
    case 'color': return 96
    case 'look': return 148
  }
}

const CARD_META: Record<BoardCardType, { label: string; icon: Parameters<typeof Icon>[0]['name'] }> = {
  heading: { label: 'Überschrift', icon: 'command' },
  note: { label: 'Notiz', icon: 'library' },
  link: { label: 'Link', icon: 'external' },
  todo: { label: 'To-do', icon: 'check' },
  color: { label: 'Farbe', icon: 'wand' },
  look: { label: 'Look', icon: 'eye' },
}

interface Point { x: number; y: number }

export function BoardCanvas({ seed }: { seed: Board }) {
  const [cards, setCards] = useState<BoardCard[]>(() => seed.cards.map((c) => ({ ...c })))
  const [connections, setConnections] = useState<BoardConnection[]>(() => seed.connections.map((c) => ({ ...c })))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [tempPoint, setTempPoint] = useState<Point | null>(null)

  const boardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)

  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  const toBoard = useCallback((clientX: number, clientY: number): Point => {
    const rect = boardRef.current?.getBoundingClientRect()
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) }
  }, [])

  const patchCard = useCallback((id: string, patch: Partial<BoardCard>) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const removeCard = useCallback((id: string) => {
    setCards((cs) => cs.filter((c) => c.id !== id))
    setConnections((xs) => xs.filter((x) => x.from !== id && x.to !== id))
    setSelectedId((s) => (s === id ? null : s))
  }, [])

  const addCard = useCallback((type: BoardCardType) => {
    const n = cards.length
    const base: BoardCard = {
      id: nextId(),
      type,
      x: 120 + (n % 6) * 26 + (boardRef.current?.parentElement?.scrollLeft ?? 0),
      y: 120 + (n % 6) * 26 + (boardRef.current?.parentElement?.scrollTop ?? 0),
      w: type === 'color' ? 110 : type === 'look' ? 190 : 230,
    }
    if (type === 'heading') base.text = 'Überschrift'
    if (type === 'note') base.text = 'Neue Notiz…'
    if (type === 'link') { base.title = 'Neuer Link'; base.url = 'example.com' }
    if (type === 'todo') { base.title = 'To-do'; base.items = [{ text: 'Punkt 1', done: false }] }
    if (type === 'color') { base.title = 'Farbe'; base.color = SWATCHES[n % SWATCHES.length] }
    if (type === 'look') { base.title = 'Look'; base.color = SWATCHES[n % SWATCHES.length] }
    setCards((cs) => [...cs, base])
    setSelectedId(base.id)
    if (type === 'note' || type === 'heading' || type === 'link') setEditingId(base.id)
  }, [cards.length])

  // ── Verschieben (Pointer-Capture auf dem Kartenkopf) ──
  const onHeaderPointerDown = (e: React.PointerEvent, card: BoardCard) => {
    if (editingId) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toBoard(e.clientX, e.clientY)
    dragRef.current = { id: card.id, dx: p.x - card.x, dy: p.y - card.y, moved: false }
  }
  const onHeaderPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toBoard(e.clientX, e.clientY)
    d.moved = true
    patchCard(d.id, { x: Math.max(0, p.x - d.dx), y: Math.max(0, p.y - d.dy) })
  }
  const onHeaderPointerUp = (e: React.PointerEvent, card: BoardCard) => {
    const d = dragRef.current
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (d && !d.moved) setSelectedId(card.id)
    dragRef.current = null
  }

  // ── Verbindungen ziehen ──
  useEffect(() => {
    if (!connectFrom) return
    const onMove = (e: PointerEvent) => setTempPoint(toBoard(e.clientX, e.clientY))
    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const targetId = el?.closest<HTMLElement>('[data-card-id]')?.dataset.cardId
      if (targetId && targetId !== connectFrom) {
        setConnections((xs) =>
          xs.some((x) => x.from === connectFrom && x.to === targetId)
            ? xs
            : [...xs, { id: nextId(), from: connectFrom, to: targetId }],
        )
      }
      setConnectFrom(null)
      setTempPoint(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [connectFrom, toBoard])

  // ── Löschen per Tastatur ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingId) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeCard(selectedId)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, editingId, removeCard])

  const anchor = (card: BoardCard, side: 'out' | 'in'): Point => ({
    x: side === 'out' ? card.x + card.w : card.x,
    y: card.y + cardHeight(card) / 2,
  })

  const path = (a: Point, b: Point) => {
    const dx = Math.max(50, Math.abs(b.x - a.x) * 0.5)
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-av-card border border-av-border bg-av-bg">
      {/* Board-Werkzeugleiste */}
      <div className="flex items-center gap-1 border-b border-av-border-muted bg-av-surface-1 px-2 py-1.5">
        <span className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">Hinzufügen</span>
        {(Object.keys(CARD_META) as BoardCardType[]).map((t) => (
          <button
            key={t}
            type="button"
            className="av-toolbar-btn av-focus"
            onClick={() => addCard(t)}
            aria-label={`${CARD_META[t].label} hinzufügen`}
            title={CARD_META[t].label}
          >
            <Icon name={CARD_META[t].icon} size={15} /> <span className="text-[12px]">{CARD_META[t].label}</span>
          </button>
        ))}
        <span className="ml-auto px-2 text-[11.5px] text-av-text-faint">{cards.length} Karten · Ziehen zum Verschieben, Handle zum Verbinden</span>
      </div>

      {/* Scroll-Fläche */}
      <div className="av-scroll relative min-h-0 flex-1 overflow-auto" onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}>
        <div
          ref={boardRef}
          className="relative"
          style={{
            width: BOARD_W,
            height: BOARD_H,
            backgroundImage: 'radial-gradient(circle, var(--av-border-muted) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}
        >
          {/* Verbindungen */}
          <svg className="pointer-events-none absolute inset-0" width={BOARD_W} height={BOARD_H}>
            {connections.map((x) => {
              const a = cardById.get(x.from)
              const b = cardById.get(x.to)
              if (!a || !b) return null
              return <path key={x.id} d={path(anchor(a, 'out'), anchor(b, 'in'))} fill="none" stroke="var(--av-accent)" strokeWidth={1.6} opacity={0.7} />
            })}
            {connectFrom && tempPoint && cardById.get(connectFrom) && (
              <path d={path(anchor(cardById.get(connectFrom)!, 'out'), tempPoint)} fill="none" stroke="var(--av-accent)" strokeWidth={1.6} strokeDasharray="5 4" />
            )}
          </svg>

          {cards.map((card) => (
            <BoardCardView
              key={card.id}
              card={card}
              selected={selectedId === card.id}
              editing={editingId === card.id}
              height={cardHeight(card)}
              onHeaderPointerDown={(e) => onHeaderPointerDown(e, card)}
              onHeaderPointerMove={onHeaderPointerMove}
              onHeaderPointerUp={(e) => onHeaderPointerUp(e, card)}
              onStartEdit={() => setEditingId(card.id)}
              onEndEdit={() => setEditingId(null)}
              onPatch={(patch) => patchCard(card.id, patch)}
              onDelete={() => removeCard(card.id)}
              onStartConnect={(e) => {
                e.stopPropagation()
                setConnectFrom(card.id)
                setTempPoint(toBoard(e.clientX, e.clientY))
              }}
            />
          ))}

          {cards.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 text-center">
              <div className="text-[15px] font-semibold text-av-text-secondary">Leeres Board</div>
              <div className="mt-1 text-[13px] text-av-text-muted">Füge oben Karten hinzu — Notizen, Looks, Farben, To-dos.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Einzelne Karte ────────────────────────────────────────────────────────*/
function BoardCardView({
  card, selected, editing, height,
  onHeaderPointerDown, onHeaderPointerMove, onHeaderPointerUp,
  onStartEdit, onEndEdit, onPatch, onDelete, onStartConnect,
}: {
  card: BoardCard
  selected: boolean
  editing: boolean
  height: number
  onHeaderPointerDown: (e: React.PointerEvent) => void
  onHeaderPointerMove: (e: React.PointerEvent) => void
  onHeaderPointerUp: (e: React.PointerEvent) => void
  onStartEdit: () => void
  onEndEdit: () => void
  onPatch: (patch: Partial<BoardCard>) => void
  onDelete: () => void
  onStartConnect: (e: React.PointerEvent) => void
}) {
  const ring = selected ? '0 0 0 2px var(--av-accent)' : undefined

  return (
    <div
      data-card-id={card.id}
      className="absolute select-none"
      style={{ left: card.x, top: card.y, width: card.w, height }}
    >
      {/* Auswahl-Werkzeuge */}
      {selected && (
        <div className="absolute -top-8 left-0 z-20 flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-2 p-0.5 shadow-[var(--av-shadow-float)]">
          {(card.type === 'color' || card.type === 'look') && SWATCHES.slice(0, 6).map((s) => (
            <button key={s} type="button" className="h-4 w-4 rounded-full border border-av-border" style={{ background: s }} onClick={() => onPatch({ color: s })} aria-label={`Farbe ${s}`} />
          ))}
          <button type="button" className="av-icon-btn" style={{ width: 24, height: 24 }} onClick={onDelete} aria-label="Karte löschen"><Icon name="close" size={14} /></button>
        </div>
      )}

      {/* Verbindungs-Handle */}
      {selected && (
        <button
          type="button"
          className="absolute top-1/2 z-20 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-av-border bg-av-surface-2 text-av-accent"
          style={{ right: -10 }}
          onPointerDown={onStartConnect}
          aria-label="Verbindung ziehen"
        >
          <Icon name="nodes" size={11} />
        </button>
      )}

      {/* Karteninhalt */}
      <div
        className="h-full w-full overflow-hidden rounded-av-card"
        style={{ boxShadow: ring, cursor: 'grab' }}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onDoubleClick={() => { if (card.type !== 'color' && card.type !== 'todo') onStartEdit() }}
      >
        <CardBody card={card} editing={editing} onEndEdit={onEndEdit} onPatch={onPatch} />
      </div>
    </div>
  )
}

function CardBody({ card, editing, onEndEdit, onPatch }: { card: BoardCard; editing: boolean; onEndEdit: () => void; onPatch: (p: Partial<BoardCard>) => void }) {
  if (card.type === 'heading') {
    return editing ? (
      <input autoFocus className="w-full bg-transparent text-[18px] font-bold text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} onKeyDown={(e) => e.key === 'Enter' && onEndEdit()} />
    ) : (
      <div className="text-[18px] font-bold tracking-tight text-av-text">{card.text}</div>
    )
  }
  if (card.type === 'note') {
    return (
      <div className="h-full w-full border border-av-border p-2.5" style={{ background: 'color-mix(in srgb, var(--av-warn) 12%, var(--av-surface-1))' }}>
        {editing ? (
          <textarea autoFocus className="h-full w-full resize-none bg-transparent text-[12.5px] leading-snug text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} />
        ) : (
          <p className="text-[12.5px] leading-snug text-av-text">{card.text}</p>
        )}
      </div>
    )
  }
  if (card.type === 'link') {
    return (
      <div className="flex h-full w-full items-center gap-2.5 border border-av-border bg-av-surface-1 p-2.5">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-md bg-av-surface-3 text-av-accent"><Icon name="external" size={15} /></span>
        {editing ? (
          <span className="min-w-0 flex-1">
            <input autoFocus className="w-full bg-transparent text-[12.5px] font-semibold text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onBlur={onEndEdit} />
            <input className="w-full bg-transparent text-[11px] text-av-text-muted outline-none" value={card.url ?? ''} onChange={(e) => onPatch({ url: e.target.value })} onBlur={onEndEdit} />
          </span>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-av-text">{card.title}</span>
            <span className="block truncate text-[11px] text-av-accent">{card.url}</span>
          </span>
        )}
      </div>
    )
  }
  if (card.type === 'todo') {
    return (
      <div className="h-full w-full border border-av-border bg-av-surface-1 p-2.5">
        <div className="mb-1.5 text-[12px] font-semibold text-av-text">{card.title}</div>
        <ul className="flex flex-col gap-1">
          {card.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px]">
              <button
                type="button"
                className="grid h-3.5 w-3.5 flex-none place-items-center rounded"
                style={{ border: it.done ? 'none' : '1.5px solid var(--av-border)', background: it.done ? 'var(--av-ok)' : 'transparent', color: '#fff' }}
                onClick={() => onPatch({ items: card.items?.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}
                aria-label={it.done ? 'Erledigt' : 'Offen'}
              >
                {it.done && <Icon name="check" size={10} />}
              </button>
              <span className={it.done ? 'text-av-text-faint line-through' : 'text-av-text-secondary'}>{it.text}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (card.type === 'color') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border">
        <div className="flex-1" style={{ background: card.color }} />
        <div className="flex items-center justify-between bg-av-surface-1 px-2 py-1">
          <span className="truncate text-[11px] text-av-text-secondary">{card.title}</span>
          <span className="av-num text-[10px] text-av-text-faint">{card.color}</span>
        </div>
      </div>
    )
  }
  // look
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border border-av-border">
      <div className="flex-1" style={{ background: `linear-gradient(135deg, ${card.color}, color-mix(in srgb, ${card.color} 40%, #0b0e14))` }} />
      <div className="bg-av-surface-1 px-2.5 py-1.5 text-[11.5px] font-medium text-av-text">{card.title}</div>
    </div>
  )
}
