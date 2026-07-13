import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon, Menu, MenuItem, confirmDialog } from '@avplan/ui'
import { useT, format, type TFunc } from '../i18n'
import type { Board, BoardCard, BoardCardType } from '../data/project'
import {
  applyTemplate,
  boardToMarkdown,
  crumbTitles,
  getBoardAtPath,
  layoutBoard,
  updateBoardAtPath,
  type Rect,
  type TemplateId,
} from '../data/board'

/* Milanote-artiges Kreativ-Board: frei platzierbare Karten, Spalten-Container
 * und verschachtelte Unterboards (Board in Board, per Doppelklick geöffnet).
 * Der gesamte Baum liegt in `root`; `path` zeigt auf das gerade sichtbare
 * (Unter-)Board. Reset per `key` im Parent. */

const BOARD_W = 2600
const BOARD_H = 1600
const SWATCHES = ['#f5a623', '#38bdf8', '#a78bfa', '#34d399', '#f87171', '#f2c26b', '#5aa9e6', '#1a2130']

let idSeq = 0
const nextId = () => `c${(idSeq += 1)}_${Math.round(performance.now())}`

const ADD_TYPES: BoardCardType[] = ['heading', 'note', 'look', 'color', 'todo', 'link', 'column', 'board']
const cardMeta = (t: TFunc): Record<BoardCardType, { label: string; icon: Parameters<typeof Icon>[0]['name'] }> => ({
  heading: { label: t('board.type.heading', 'Überschrift'), icon: 'command' },
  note: { label: t('board.type.note', 'Notiz'), icon: 'library' },
  link: { label: t('board.type.link', 'Link'), icon: 'external' },
  todo: { label: t('board.type.todo', 'To-do'), icon: 'check' },
  color: { label: t('board.type.color', 'Farbe'), icon: 'wand' },
  look: { label: t('board.type.look', 'Look'), icon: 'eye' },
  column: { label: t('board.type.column', 'Spalte'), icon: 'layers' },
  board: { label: t('board.type.board', 'Unterboard'), icon: 'board' },
  image: { label: t('board.type.image', 'Bild'), icon: 'eye' },
})

const templates = (t: TFunc): { id: TemplateId; label: string }[] => [
  { id: 'moodboard', label: t('board.tpl.moodboard', 'Moodboard') },
  { id: 'brief', label: t('board.tpl.brief', 'Kreativ-Brief') },
  { id: 'storyboard', label: t('board.tpl.storyboard', 'Storyboard') },
]

interface Point { x: number; y: number }
const rectContains = (r: Rect | undefined, p: Point) =>
  !!r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h

const cloneBoard = (b: Board): Board => JSON.parse(JSON.stringify(b)) as Board

const menuButton = (label: string, icon: Parameters<typeof Icon>[0]['name']) => (
  <>
    <Icon name={icon} size={15} /> <span className="text-[12px]">{label}</span> <Icon name="chevron-down" size={12} />
  </>
)

export function BoardCanvas({ seed, title: titleProp }: { seed: Board; title?: string }) {
  const t = useT()
  const title = titleProp ?? t('board.title', 'Kreativ-Board')
  const CARD_META = cardMeta(t)
  const TEMPLATES = templates(t)
  const [root, setRoot] = useState<Board>(() => cloneBoard(seed))
  const [path, setPath] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [tempPoint, setTempPoint] = useState<Point | null>(null)

  const [query, setQuery] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)
  const resizeRef = useRef<{ id: string; startX: number; startW: number } | null>(null)

  const current = useMemo(() => getBoardAtPath(root, path), [root, path])
  const cards = current.cards
  const connections = current.connections
  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const layout = useMemo(() => layoutBoard(cards), [cards])
  const crumbs = useMemo(() => crumbTitles(root, path, title), [root, path, title])

  const mutate = useCallback((fn: (b: Board) => Board) => setRoot((r) => updateBoardAtPath(r, path, fn)), [path])

  const toBoard = useCallback((clientX: number, clientY: number): Point => {
    const rect = boardRef.current?.getBoundingClientRect()
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) }
  }, [])

  const patchCard = useCallback((id: string, patch: Partial<BoardCard>) => {
    mutate((b) => ({ ...b, cards: b.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  }, [mutate])

  const removeCard = useCallback((id: string) => {
    mutate((b) => ({
      cards: b.cards.filter((c) => c.id !== id && c.columnId !== id),
      connections: b.connections.filter((x) => x.from !== id && x.to !== id),
    }))
    setSelectedId((s) => (s === id ? null : s))
  }, [mutate])

  const openBoard = useCallback((id: string) => { setPath((p) => [...p, id]); setSelectedId(null); setEditingId(null) }, [])
  const goToCrumb = useCallback((index: number) => { setPath((p) => p.slice(0, index)); setSelectedId(null); setEditingId(null) }, [])

  const addCard = useCallback((type: BoardCardType) => {
    const n = cards.length
    const base: BoardCard = {
      id: nextId(), type,
      x: 120 + (n % 6) * 28 + (boardRef.current?.parentElement?.scrollLeft ?? 0),
      y: 120 + (n % 6) * 28 + (boardRef.current?.parentElement?.scrollTop ?? 0),
      w: type === 'color' ? 110 : type === 'look' ? 190 : type === 'column' ? 280 : type === 'board' ? 210 : 230,
    }
    if (type === 'heading') base.text = t('board.type.heading', 'Überschrift')
    if (type === 'note') base.text = t('board.default.note', 'Neue Notiz…')
    if (type === 'link') { base.title = t('board.default.link', 'Neuer Link'); base.url = 'example.com' }
    if (type === 'todo') { base.title = t('board.type.todo', 'To-do'); base.items = [{ text: t('board.default.todoItem', 'Punkt 1'), done: false }] }
    if (type === 'color') { base.title = t('board.type.color', 'Farbe'); base.color = SWATCHES[n % SWATCHES.length] }
    if (type === 'look') { base.title = t('board.type.look', 'Look'); base.color = SWATCHES[n % SWATCHES.length] }
    if (type === 'column') base.title = t('board.type.column', 'Spalte')
    if (type === 'board') { base.title = t('board.type.board', 'Unterboard'); base.board = { cards: [], connections: [] } }
    mutate((b) => ({ ...b, cards: [...b.cards, base] }))
    setSelectedId(base.id)
    if (type === 'note' || type === 'heading' || type === 'link' || type === 'column') setEditingId(base.id)
  }, [cards.length, mutate, t])

  const applyTpl = useCallback((id: TemplateId) => {
    const { cards: tc, connections: tcx } = applyTemplate(id, nextId)
    const maxY = layout.size ? Math.max(...[...layout.values()].map((r) => r.y + r.h)) : 0
    const dy = maxY ? maxY + 40 : 0
    const shifted = tc.map((c) => (c.type === 'column' || !c.columnId ? { ...c, y: c.y + dy } : c))
    mutate((b) => ({ cards: [...b.cards, ...shifted], connections: [...b.connections, ...tcx] }))
  }, [layout, mutate])

  const exportMarkdown = useCallback(() => {
    const md = boardToMarkdown(root, title)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [root, title])

  const exportPrint = useCallback(() => window.print(), [])

  // ── Foto-Import (Upload / Drag&Drop / Einfügen) ──
  const addImageFile = useCallback((file: File, at?: Point, index = 0) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      const img = new Image()
      img.onload = () => {
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5
        const scroll = boardRef.current?.parentElement
        const base: BoardCard = {
          id: nextId(), type: 'image', w: 240, ratio, src,
          title: file.name.replace(/\.[^.]+$/, ''),
          x: (at?.x ?? (scroll?.scrollLeft ?? 0) + 120) + index * 24,
          y: (at?.y ?? (scroll?.scrollTop ?? 0) + 120) + index * 24,
        }
        mutate((b) => ({ ...b, cards: [...b.cards, base] }))
        setSelectedId(base.id)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [mutate])

  const handleFiles = useCallback((files: FileList | null, at?: Point) => {
    if (!files) return
    Array.from(files).filter((f) => f.type.startsWith('image/')).forEach((f, i) => addImageFile(f, at, i))
  }, [addImageFile])

  // Einfügen aus der Zwischenablage (Cmd/Ctrl+V) → Bild-Karte.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (const it of items) if (it.type.startsWith('image/')) { const f = it.getAsFile(); if (f) files.push(f) }
      if (files.length) {
        e.preventDefault()
        files.forEach((f, i) => addImageFile(f, undefined, i))
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addImageFile])

  // ── Größe ziehen (Milanote: untere rechte Ecke) ──
  const onResizePointerDown = (e: React.PointerEvent, card: BoardCard) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = { id: card.id, startX: toBoard(e.clientX, e.clientY).x, startW: card.w }
  }
  const onResizePointerMove = (e: React.PointerEvent) => {
    const r = resizeRef.current
    if (!r) return
    const dx = toBoard(e.clientX, e.clientY).x - r.startX
    patchCard(r.id, { w: Math.max(90, Math.min(900, r.startW + dx)) })
  }
  const onResizePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    resizeRef.current = null
  }

  const q = query.trim().toLowerCase()
  const matchesQuery = (c: BoardCard): boolean => {
    if (!q) return true
    return (
      (c.title ?? '').toLowerCase().includes(q) ||
      (c.text ?? '').toLowerCase().includes(q) ||
      (c.items ?? []).some((i) => i.text.toLowerCase().includes(q))
    )
  }

  // ── Verschieben (+ Spalten-Detach/Drop) ──
  const onHeaderPointerDown = (e: React.PointerEvent, card: BoardCard) => {
    if (editingId) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = layout.get(card.id)
    const p = toBoard(e.clientX, e.clientY)
    dragRef.current = { id: card.id, dx: p.x - (r?.x ?? card.x), dy: p.y - (r?.y ?? card.y), moved: false }
  }
  const onHeaderPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toBoard(e.clientX, e.clientY)
    d.moved = true
    patchCard(d.id, { columnId: undefined, x: Math.max(0, p.x - d.dx), y: Math.max(0, p.y - d.dy) })
  }
  const onHeaderPointerUp = (e: React.PointerEvent, card: BoardCard) => {
    const d = dragRef.current
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (d && !d.moved) { setSelectedId(card.id); dragRef.current = null; return }
    if (d) {
      const p = toBoard(e.clientX, e.clientY)
      const cur = cardById.get(d.id)
      const targetCol = cards.find((c) => c.type === 'column' && c.id !== d.id && rectContains(layout.get(c.id), p))
      if (targetCol && cur && cur.type !== 'column') patchCard(d.id, { columnId: targetCol.id })
    }
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
        mutate((b) => (b.connections.some((x) => x.from === connectFrom && x.to === targetId) ? b : { ...b, connections: [...b.connections, { id: nextId(), from: connectFrom, to: targetId }] }))
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
  }, [connectFrom, toBoard, mutate])

  // ── Löschen per Tastatur ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingId) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); removeCard(selectedId) }
      else if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, editingId, removeCard])

  const anchorOut = (id: string): Point | null => { const r = layout.get(id); return r ? { x: r.x + r.w, y: r.y + r.h / 2 } : null }
  const anchorIn = (id: string): Point | null => { const r = layout.get(id); return r ? { x: r.x, y: r.y + r.h / 2 } : null }
  const linkPath = (a: Point, b: Point) => { const dx = Math.max(50, Math.abs(b.x - a.x) * 0.5); return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}` }

  const columns = cards.filter((c) => c.type === 'column')
  const drawCards = cards.filter((c) => c.type !== 'column')

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-av-card border border-av-border bg-av-bg">
      {/* Werkzeugleiste */}
      <div className="flex flex-wrap items-center gap-1 border-b border-av-border-muted bg-av-surface-1 px-2 py-1.5">
        <span className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">{t('board.toolbar.add', 'Hinzufügen')}</span>
        {ADD_TYPES.map((ty) => (
          <button key={ty} type="button" className="av-toolbar-btn av-focus" onClick={() => addCard(ty)} aria-label={format(t('board.add.item', '{label} hinzufügen'), { label: CARD_META[ty].label })} title={CARD_META[ty].label}>
            <Icon name={CARD_META[ty].icon} size={15} /> <span className="text-[12px]">{CARD_META[ty].label}</span>
          </button>
        ))}
        <button type="button" className="av-toolbar-btn av-focus" onClick={() => fileInputRef.current?.click()} aria-label={t('board.toolbar.photoImport', 'Foto importieren')} title={t('board.toolbar.photoImport', 'Foto importieren')}>
          <Icon name="eye" size={15} /> <span className="text-[12px]">{t('board.toolbar.photo', 'Foto')}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = '' }} />

        <div className="ml-2 flex min-w-0 items-center gap-1.5 rounded-av-control border border-av-border bg-av-surface-3 px-2">
          <Icon name="search" size={13} style={{ color: 'var(--av-text-faint)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('board.search.placeholder', 'Board durchsuchen…')} aria-label={t('board.search.aria', 'Board durchsuchen')} className="av-focus w-32 bg-transparent py-1 text-[12px] text-av-text outline-none placeholder:text-av-text-faint" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Menu button={menuButton(t('board.menu.template', 'Vorlage'), 'wand')} align="right">
            {(close) => TEMPLATES.map((tpl) => (
              <MenuItem key={tpl.id} icon={<Icon name="board" size={14} style={{ color: 'var(--av-accent)' }} />} onClick={() => { applyTpl(tpl.id); close() }}>
                {tpl.label}
              </MenuItem>
            ))}
          </Menu>
          <Menu button={menuButton(t('board.menu.export', 'Export'), 'external')} align="right">
            {(close) => (
              <>
                <MenuItem icon={<Icon name="library" size={14} />} onClick={() => { exportMarkdown(); close() }}>{t('board.export.markdown', 'Als Markdown')}</MenuItem>
                <MenuItem icon={<Icon name="external" size={14} />} onClick={() => { close(); exportPrint() }}>{t('board.export.pdf', 'Als PDF (Druck)')}</MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>

      {/* Breadcrumb (Board-in-Board-Navigation) */}
      <div className="flex items-center gap-1 border-b border-av-border-muted bg-av-surface-3 px-3 py-1.5 text-[12px]">
        {path.length > 0 && (
          <button type="button" className="av-icon-btn av-focus" style={{ width: 24, height: 24 }} onClick={() => goToCrumb(path.length - 1)} aria-label={t('board.crumb.back', 'Eine Ebene zurück')}><Icon name="undo" size={14} /></button>
        )}
        {crumbs.map((c, i) => (
          <span key={c.id || 'root'} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)', color: 'var(--av-text-faint)' }} />}
            <button
              type="button"
              className="av-focus rounded px-1.5 py-0.5 hover:bg-av-surface-2"
              style={{ color: i === crumbs.length - 1 ? 'var(--av-text)' : 'var(--av-text-muted)', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}
              onClick={() => goToCrumb(i)}
              aria-current={i === crumbs.length - 1 ? 'page' : undefined}
            >
              {i === 0 ? <span className="flex items-center gap-1"><Icon name="board" size={12} /> {c.title}</span> : c.title}
            </button>
          </span>
        ))}
      </div>

      {/* Scroll-Fläche */}
      <div
        className="av-scroll relative min-h-0 flex-1 overflow-auto"
        onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}
        onDragOver={(e) => { e.preventDefault() }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files, toBoard(e.clientX, e.clientY)) }}
      >
        <div
          ref={boardRef}
          className="relative"
          style={{ width: BOARD_W, height: BOARD_H, backgroundImage: 'radial-gradient(circle, var(--av-border-muted) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}
        >
          {/* Spalten-Panels */}
          {columns.map((col) => {
            const r = layout.get(col.id)!
            const selected = selectedId === col.id
            const hasChildren = cards.some((c) => c.columnId === col.id)
            return (
              <div key={col.id} data-column-id={col.id} className="absolute rounded-av-card border border-dashed border-av-border bg-av-surface-1/40" style={{ left: r.x, top: r.y, width: r.w, height: r.h, boxShadow: selected ? '0 0 0 2px var(--av-accent)' : undefined }}>
                <div
                  className="flex h-[34px] items-center gap-2 border-b border-av-border-muted px-2.5"
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => onHeaderPointerDown(e, col)}
                  onPointerMove={onHeaderPointerMove}
                  onPointerUp={(e) => onHeaderPointerUp(e, col)}
                  onDoubleClick={() => setEditingId(col.id)}
                >
                  <Icon name="layers" size={13} style={{ color: 'var(--av-text-muted)' }} />
                  {editingId === col.id ? (
                    <input autoFocus className="flex-1 bg-transparent text-[12px] font-semibold text-av-text outline-none" value={col.title ?? ''} onChange={(e) => patchCard(col.id, { title: e.target.value })} onBlur={() => setEditingId(null)} onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)} />
                  ) : (
                    <span className="flex-1 truncate text-[12px] font-semibold text-av-text">{col.title}</span>
                  )}
                  {selected && (
                    <button
                      type="button"
                      className="av-icon-btn"
                      style={{ width: 22, height: 22 }}
                      onClick={async () => {
                        // Spalte mit Inhalt: gestylte Rückfrage (kein window.confirm).
                        if (hasChildren && !(await confirmDialog(
                          t('board.column.deleteConfirm', 'Spalte mit Inhalt endgültig löschen?'),
                          { destructive: true, okLabel: t('board.column.delete', 'Spalte löschen'), cancelLabel: t('board.cancel', 'Abbrechen') },
                        ))) return
                        removeCard(col.id)
                      }}
                      aria-label={t('board.column.delete', 'Spalte löschen')}
                    >
                      <Icon name="close" size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Verbindungen */}
          <svg className="pointer-events-none absolute inset-0" width={BOARD_W} height={BOARD_H}>
            {connections.map((x) => {
              const a = anchorOut(x.from); const b = anchorIn(x.to)
              return a && b ? <path key={x.id} d={linkPath(a, b)} fill="none" stroke="var(--av-accent)" strokeWidth={1.6} opacity={0.7} /> : null
            })}
            {connectFrom && tempPoint && anchorOut(connectFrom) && (
              <path d={linkPath(anchorOut(connectFrom)!, tempPoint)} fill="none" stroke="var(--av-accent)" strokeWidth={1.6} strokeDasharray="5 4" />
            )}
          </svg>

          {/* Karten */}
          {drawCards.map((card) => {
            const r = layout.get(card.id)
            if (!r) return null
            return (
              <BoardCardView
                key={card.id} card={card} rect={r} dim={!matchesQuery(card)}
                selected={selectedId === card.id} editing={editingId === card.id}
                onHeaderPointerDown={(e) => onHeaderPointerDown(e, card)}
                onHeaderPointerMove={onHeaderPointerMove}
                onHeaderPointerUp={(e) => onHeaderPointerUp(e, card)}
                onStartEdit={() => setEditingId(card.id)} onEndEdit={() => setEditingId(null)}
                onOpen={() => openBoard(card.id)}
                onPatch={(patch) => patchCard(card.id, patch)} onDelete={() => removeCard(card.id)}
                onStartConnect={(e) => { e.stopPropagation(); setConnectFrom(card.id); setTempPoint(toBoard(e.clientX, e.clientY)) }}
                onResizePointerDown={(e) => onResizePointerDown(e, card)}
                onResizePointerMove={onResizePointerMove}
                onResizePointerUp={onResizePointerUp}
              />
            )
          })}

          {cards.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 text-center">
              <div className="text-[15px] font-semibold text-av-text-secondary">{path.length ? t('board.empty.subboard', 'Leeres Unterboard') : t('board.empty.board', 'Leeres Board')}</div>
              <div className="mt-1 text-[13px] text-av-text-muted">{t('board.empty.hint', 'Füge oben Karten hinzu oder wende eine Vorlage an.')}</div>
            </div>
          )}
        </div>
      </div>

      <PrintDoc title={title} board={root} />
    </div>
  )
}

/* ── Druck-Dokument (per @media print sichtbar, rekursiv über Unterboards) ──*/
function PrintBoard({ board, title, level }: { board: Board; title: string; level: number }) {
  const t = useT()
  const H = `h${Math.min(6, level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const rendered = new Set<string>()
  const renderCard = (c: BoardCard) => {
    switch (c.type) {
      case 'heading': return <p key={c.id}><strong>{c.text}</strong></p>
      case 'note': return <p key={c.id}>{c.text}</p>
      case 'link': return <p key={c.id}><a href={`https://${c.url}`}>{c.title ?? c.url}</a></p>
      case 'todo': return <div key={c.id}><strong>{c.title}</strong><ul>{c.items?.map((it, i) => <li key={i}>{it.done ? '☑' : '☐'} {it.text}</li>)}</ul></div>
      case 'color': return <p key={c.id}>■ {c.title} ({c.color})</p>
      case 'look': return <p key={c.id}>{format(t('board.print.look', 'Look: {title}'), { title: c.title ?? '' })}</p>
      case 'image': return <div key={c.id}>{c.src ? <img src={c.src} alt={c.title ?? t('board.photoAlt', 'Foto')} style={{ maxWidth: 320, display: 'block', margin: '6px 0' }} /> : null}<em>{c.title}</em></div>
      case 'column': return null
      case 'board': return <PrintBoard key={c.id} board={c.board ?? { cards: [], connections: [] }} title={format(t('board.print.subboardTitle', '{title} (Unterboard)'), { title: c.title ?? t('board.type.board', 'Unterboard') })} level={level + 1} />
    }
  }
  return (
    <section>
      <H>{title}</H>
      {board.cards.filter((c) => c.type === 'column').map((col) => (
        <section key={col.id}>
          <strong>{col.title}</strong>
          {board.cards.filter((c) => c.columnId === col.id).map((m) => { rendered.add(m.id); return renderCard(m) })}
          {(() => { rendered.add(col.id); return null })()}
        </section>
      ))}
      {board.cards.filter((c) => !rendered.has(c.id) && c.type !== 'column' && !c.columnId).map(renderCard)}
    </section>
  )
}

function PrintDoc({ title, board }: { title: string; board: Board }) {
  if (typeof document === 'undefined') return null
  return createPortal(<div className="board-print"><PrintBoard board={board} title={title} level={1} /></div>, document.body)
}

/* ── Einzelne Karte ────────────────────────────────────────────────────────*/
function BoardCardView({
  card, rect, selected, editing, dim,
  onHeaderPointerDown, onHeaderPointerMove, onHeaderPointerUp,
  onStartEdit, onEndEdit, onOpen, onPatch, onDelete, onStartConnect,
  onResizePointerDown, onResizePointerMove, onResizePointerUp,
}: {
  card: BoardCard; rect: Rect; selected: boolean; editing: boolean; dim: boolean
  onHeaderPointerDown: (e: React.PointerEvent) => void
  onHeaderPointerMove: (e: React.PointerEvent) => void
  onHeaderPointerUp: (e: React.PointerEvent) => void
  onStartEdit: () => void; onEndEdit: () => void; onOpen: () => void
  onPatch: (patch: Partial<BoardCard>) => void; onDelete: () => void
  onStartConnect: (e: React.PointerEvent) => void
  onResizePointerDown: (e: React.PointerEvent) => void
  onResizePointerMove: (e: React.PointerEvent) => void
  onResizePointerUp: (e: React.PointerEvent) => void
}) {
  const t = useT()
  const isBoard = card.type === 'board'
  return (
    <div data-card-id={card.id} className="absolute select-none" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: dim ? 0.28 : 1 }}>
      {selected && (
        <div className="absolute -top-8 left-0 z-20 flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-2 p-0.5 shadow-[var(--av-shadow-float)]">
          {(card.type === 'color' || card.type === 'look') && SWATCHES.slice(0, 6).map((s) => (
            <button key={s} type="button" className="h-4 w-4 rounded-full border border-av-border" style={{ background: s }} onClick={() => onPatch({ color: s })} aria-label={format(t('board.swatch', 'Farbe {color}'), { color: s })} />
          ))}
          <button type="button" className="av-icon-btn" style={{ width: 24, height: 24 }} onClick={onDelete} aria-label={t('board.card.delete', 'Karte löschen')}><Icon name="close" size={14} /></button>
        </div>
      )}
      {selected && (
        <button type="button" className="absolute top-1/2 z-20 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-av-border bg-av-surface-2 text-av-accent" style={{ right: -10 }} onPointerDown={onStartConnect} aria-label={t('board.connect', 'Verbindung ziehen')}>
          <Icon name="nodes" size={11} />
        </button>
      )}
      <div
        className="h-full w-full overflow-hidden rounded-av-card"
        style={{ boxShadow: selected ? '0 0 0 2px var(--av-accent)' : undefined, cursor: 'grab' }}
        onPointerDown={onHeaderPointerDown} onPointerMove={onHeaderPointerMove} onPointerUp={onHeaderPointerUp}
        onDoubleClick={() => { if (isBoard) onOpen(); else if (card.type !== 'color' && card.type !== 'todo') onStartEdit() }}
      >
        {isBoard
          ? <BoardTile card={card} selected={selected} onPatch={onPatch} onOpen={onOpen} />
          : <CardBody card={card} editing={editing} onEndEdit={onEndEdit} onPatch={onPatch} />}
      </div>
      {selected && card.type !== 'column' && (
        <div
          className="absolute z-20 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-av-accent bg-av-surface-2"
          style={{ right: -6, bottom: -6 }}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          aria-label={t('board.resize', 'Größe ziehen')}
        />
      )}
    </div>
  )
}

function BoardTile({ card, selected, onPatch, onOpen }: { card: BoardCard; selected: boolean; onPatch: (p: Partial<BoardCard>) => void; onOpen: () => void }) {
  const t = useT()
  const count = card.board?.cards.length ?? 0
  return (
    <div className="flex h-full w-full flex-col gap-1.5 border border-av-border bg-av-surface-1 p-2.5" style={{ borderColor: 'var(--av-accent)' }}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-md" style={{ background: 'var(--av-accent-dim)', color: 'var(--av-accent)' }}><Icon name="board" size={15} /></span>
        {selected ? (
          <input className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onPointerDown={(e) => e.stopPropagation()} aria-label={t('board.subboard.title', 'Unterboard-Titel')} />
        ) : (
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-av-text">{card.title}</span>
        )}
      </div>
      <div className="text-[11px] text-av-text-muted">{count} {count === 1 ? t('board.card.one', 'Karte') : t('board.card.many', 'Karten')} · {t('board.type.board', 'Unterboard')}</div>
      <button type="button" className="av-btn av-focus mt-auto" data-size="sm" data-variant="subtle" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onOpen() }}>
        {t('board.open', 'Öffnen')} <Icon name="external" size={13} />
      </button>
    </div>
  )
}

function CardBody({ card, editing, onEndEdit, onPatch }: { card: BoardCard; editing: boolean; onEndEdit: () => void; onPatch: (p: Partial<BoardCard>) => void }) {
  const t = useT()
  if (card.type === 'heading') {
    return editing
      ? <input autoFocus className="w-full bg-transparent text-[18px] font-bold text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} onKeyDown={(e) => e.key === 'Enter' && onEndEdit()} />
      : <div className="text-[18px] font-bold tracking-tight text-av-text">{card.text}</div>
  }
  if (card.type === 'note') {
    return (
      <div className="h-full w-full border border-av-border p-2.5" style={{ background: 'color-mix(in srgb, var(--av-warn) 12%, var(--av-surface-1))' }}>
        {editing
          ? <textarea autoFocus className="h-full w-full resize-none bg-transparent text-[12.5px] leading-snug text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} />
          : <p className="text-[12.5px] leading-snug text-av-text">{card.text}</p>}
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
              <button type="button" className="grid h-3.5 w-3.5 flex-none place-items-center rounded" style={{ border: it.done ? 'none' : '1.5px solid var(--av-border)', background: it.done ? 'var(--av-ok)' : 'transparent', color: 'var(--av-accent-text)' }} onClick={() => onPatch({ items: card.items?.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} aria-label={it.done ? t('board.todo.done', 'Erledigt') : t('board.todo.open', 'Offen')}>
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
  if (card.type === 'image') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border bg-av-surface-1">
        {card.src
          ? <img src={card.src} alt={card.title ?? t('board.photoAlt', 'Foto')} className="min-h-0 flex-1 object-cover" draggable={false} />
          : <div className="flex-1" style={{ background: 'var(--av-surface-3)' }} />}
        {editing
          ? <input autoFocus className="bg-av-surface-1 px-2 py-1 text-[11px] text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onBlur={onEndEdit} onKeyDown={(e) => e.key === 'Enter' && onEndEdit()} />
          : <div className="truncate bg-av-surface-1 px-2 py-1 text-[11px] text-av-text-secondary">{card.title}</div>}
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
