import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Icon } from './icons'
import { Kbd } from './primitives'
import {
  flattenGroups,
  rankCommands,
  type Command,
  type CommandContext,
} from './commands'

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: Command[]
  context: CommandContext
  placeholder?: string
  emptyLabel?: string
}

/**
 * Zugängliche Command-Palette (⌘K). Folgt dem ARIA-Combobox-mit-Listbox-
 * Muster: Eingabe ist eine Combobox mit `aria-activedescendant`, die Liste
 * eine Listbox mit Optionen. Vollständige Tastatur-Bedienung (Pfeile/Home/
 * End/Enter/Esc), Fokus wird beim Öffnen ins Feld gelegt und beim Schließen
 * auf das auslösende Element zurückgegeben. Leere Gruppen werden ausgeblendet;
 * die Trefferzahl wird für Screenreader angesagt.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  context,
  placeholder = 'Suchen & Befehle…',
  emptyLabel = 'Keine Treffer',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const baseId = useId()
  const listId = `${baseId}-list`

  const groups = useMemo(() => rankCommands(commands, query, context), [commands, query, context])
  const flat = useMemo(() => flattenGroups(groups), [groups])

  // Beim Öffnen: Feld fokussieren, State zurücksetzen, Rücksprungziel merken.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    setQuery('')
    setActiveIndex(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (open) return
    restoreRef.current?.focus?.()
  }, [open])

  // Aktiven Index gültig halten, wenn sich die Trefferliste ändert.
  useEffect(() => {
    setActiveIndex((i) => (flat.length === 0 ? 0 : Math.min(i, flat.length - 1)))
  }, [flat.length])

  // Aktive Option in den sichtbaren Bereich scrollen.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const runAt = useCallback(
    (index: number) => {
      const cmd = flat[index]
      if (!cmd) return
      close()
      cmd.run()
    },
    [flat, close],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setActiveIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setActiveIndex(Math.max(0, flat.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        runAt(activeIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'Tab') {
        // Fokus bleibt im Feld (einziges fokussierbares Element) — Trap.
        e.preventDefault()
      }
    },
    [flat.length, activeIndex, runAt, close],
  )

  if (!open) return null

  const optionId = (index: number) => `${baseId}-opt-${index}`

  return (
    <div
      className="av-cmdk-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        className="av-cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Befehle suchen"
      >
        <div className="av-cmdk-inputrow">
          <Icon name="search" size={18} style={{ color: 'var(--av-text-muted)' }} />
          <input
            ref={inputRef}
            className="av-cmdk-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={flat.length > 0 ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            aria-label={placeholder}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="av-cmdk-list av-scroll" id={listId} role="listbox" ref={listRef} aria-label="Befehle">
          {flat.length === 0 ? (
            <div className="av-cmdk-empty">{emptyLabel}</div>
          ) : (
            groups.map((group) => (
              <div key={group.group} role="group" aria-label={group.group}>
                <div className="av-cmdk-group-label">{group.group}</div>
                {group.items.map((cmd) => {
                  const index = flat.indexOf(cmd)
                  const isActive = index === activeIndex
                  return (
                    <div
                      key={cmd.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isActive}
                      className="av-cmdk-item"
                      data-active={isActive ? 'true' : undefined}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => runAt(index)}
                    >
                      <span className="av-cmdk-item-icon">{cmd.icon ?? <Icon name="command" size={16} />}</span>
                      <span className="av-cmdk-item-title">{cmd.title}</span>
                      {cmd.hint && <span className="av-cmdk-item-hint">{cmd.hint}</span>}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="av-cmdk-foot">
          <span className="av-cmdk-foot-key"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigieren</span>
          <span className="av-cmdk-foot-key"><Kbd>↵</Kbd> Ausführen</span>
          <span className="av-cmdk-foot-key"><Kbd>Esc</Kbd> Schließen</span>
        </div>

        <div className="av-sr-only" role="status" aria-live="polite">
          {flat.length} {flat.length === 1 ? 'Treffer' : 'Treffer'}
        </div>
      </div>
    </div>
  )
}

/** Bequemer Hook: ⌘K / Ctrl-K global abfangen und die Palette togglen. */
export function useCommandPaletteHotkey(setOpen: (updater: (open: boolean) => boolean) => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])
}
