import { useRef, useState, type ReactNode } from 'react'
import { Icon } from '@avplan/ui'
import { clampSpan, type WidgetId } from './dashboardPrefs'

const GAP = 12 // entspricht gap-3 (0.75rem)

export interface DashboardItem {
  id: WidgetId
  node: ReactNode
}

/**
 * Interaktives Dashboard-Grid: Karten per Drag&Drop anordnen, am Eck-Griff
 * skalieren (Spaltenbreite) und per X ausblenden. Responsiv (1/2/3 Spalten);
 * CSS-Grid begrenzt die Breite automatisch auf die verfügbaren Spalten.
 */
export function DashboardGrid({
  items,
  span,
  onReorder,
  onResize,
  onClose,
}: {
  items: DashboardItem[]
  span: Record<WidgetId, number>
  onReorder: (order: WidgetId[]) => void
  onResize: (id: WidgetId, span: number) => void
  onClose: (id: WidgetId) => void
}) {
  const dragId = useRef<WidgetId | null>(null)
  const [dragOver, setDragOver] = useState<WidgetId | null>(null)

  const reorder = (from: WidgetId, to: WidgetId) => {
    if (from === to) return
    const ids = items.map((it) => it.id)
    const fromI = ids.indexOf(from)
    const toI = ids.indexOf(to)
    if (fromI < 0 || toI < 0) return
    ids.splice(toI, 0, ids.splice(fromI, 1)[0])
    onReorder(ids)
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" style={{ gridAutoFlow: 'dense' }}>
      {items.map((it) => (
        <DashboardCard
          key={it.id}
          span={span[it.id] ?? 1}
          isDragOver={dragOver === it.id}
          onDragStartCard={() => (dragId.current = it.id)}
          onDragEnterCard={() => {
            if (dragId.current && dragId.current !== it.id) setDragOver(it.id)
          }}
          onDropCard={() => {
            if (dragId.current) reorder(dragId.current, it.id)
            dragId.current = null
            setDragOver(null)
          }}
          onDragEndCard={() => {
            dragId.current = null
            setDragOver(null)
          }}
          onResize={(s) => onResize(it.id, s)}
          onClose={() => onClose(it.id)}
        >
          {it.node}
        </DashboardCard>
      ))}
    </div>
  )
}

function DashboardCard({
  span,
  isDragOver,
  onDragStartCard,
  onDragEnterCard,
  onDropCard,
  onDragEndCard,
  onResize,
  onClose,
  children,
}: {
  span: number
  isDragOver: boolean
  onDragStartCard: () => void
  onDragEnterCard: () => void
  onDropCard: () => void
  onDragEndCard: () => void
  onResize: (span: number) => void
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const fromHandle = useRef(false)
  const [resizing, setResizing] = useState(false)

  // Skalieren: am Eck-Griff ziehen -> Spaltenbreite (1..Spaltenzahl).
  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const el = ref.current
    const grid = el?.parentElement
    if (!el || !grid) return
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1
    const gridRect = grid.getBoundingClientRect()
    const colW = (gridRect.width - (cols - 1) * GAP) / cols
    let last = span
    setResizing(true)
    const move = (ev: PointerEvent) => {
      const target = clampSpan(Math.min(cols, Math.round((ev.clientX - gridRect.left + GAP) / (colW + GAP))))
      if (target !== last) {
        last = target
        onResize(target)
      }
    }
    const up = () => {
      setResizing(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      ref={ref}
      className="group relative"
      style={{ gridColumn: `span ${span}`, outline: isDragOver ? '2px dashed var(--av-accent)' : undefined, outlineOffset: 2, borderRadius: 12 }}
      draggable
      onDragStart={(e) => {
        // Drag nur vom Griff aus starten, nicht beim Markieren von Text.
        if (!fromHandle.current) {
          e.preventDefault()
          return
        }
        e.dataTransfer.effectAllowed = 'move'
        onDragStartCard()
      }}
      onDragEnter={onDragEnterCard}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDropCard()
      }}
      onDragEnd={() => {
        fromHandle.current = false
        onDragEndCard()
      }}
    >
      {/* Steuerleiste oben rechts (erscheint bei Hover/Fokus). */}
      <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          aria-label="Verschieben (ziehen)"
          title="Ziehen zum Anordnen"
          className="av-focus grid h-6 w-6 cursor-grab place-items-center rounded-md border border-av-border bg-av-surface-2/90 text-av-text-muted hover:text-av-text active:cursor-grabbing"
          onPointerDown={() => (fromHandle.current = true)}
          onPointerUp={() => (fromHandle.current = false)}
        >
          <Icon name="nodes" size={13} />
        </button>
        <button
          type="button"
          aria-label="Karte ausblenden"
          title="Ausblenden"
          className="av-focus grid h-6 w-6 place-items-center rounded-md border border-av-border bg-av-surface-2/90 text-av-text-muted hover:text-av-danger"
          onClick={onClose}
        >
          <Icon name="close" size={13} />
        </button>
      </div>

      {children}

      {/* Resize-Griff unten rechts. */}
      <button
        type="button"
        aria-label="Breite skalieren"
        title="Ziehen zum Skalieren"
        onPointerDown={onResizeStart}
        className="av-focus absolute bottom-1 right-1 z-10 grid h-5 w-5 cursor-nwse-resize place-items-center rounded text-av-text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ opacity: resizing ? 1 : undefined }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M11 4 4 11M11 8l-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
