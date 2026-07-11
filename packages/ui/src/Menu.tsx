import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from './cn'

export interface MenuProps {
  /** Inhalt des Trigger-Buttons. */
  button: ReactNode
  /** Menü-Einträge; bekommt eine `close`-Funktion. */
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  /** Klassen für den Trigger-Button (Default: av-toolbar-btn). */
  triggerClassName?: string
  ariaLabel?: string
}

/**
 * Geteiltes Dropdown-Menü: Trigger + Panel mit Outside-Click- und
 * Esc-Schließen und ARIA (`aria-haspopup`/`aria-expanded`, `role="menu"`).
 * Ersetzt die zuvor pro Stelle kopierten Ad-hoc-Dropdowns (Shell-Topbar,
 * BoardCanvas). Einträge nutzen `MenuItem`/`MenuLabel`/`MenuSep`.
 */
export function Menu({ button, children, align = 'left', triggerClassName = 'av-toolbar-btn', ariaLabel }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="av-menu">
      <button
        type="button"
        className={cn(triggerClassName, 'av-focus')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
      </button>
      {open && (
        <div className="av-menu-panel" data-align={align} role="menu">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export interface MenuItemProps {
  onClick?: () => void
  icon?: ReactNode
  hint?: ReactNode
  active?: boolean
  disabled?: boolean
  children: ReactNode
}

export function MenuItem({ onClick, icon, hint, active, disabled, children }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="av-menu-item"
      data-active={active ? 'true' : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
      {hint && <span className="av-menu-item-hint">{hint}</span>}
    </button>
  )
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="av-menu-label">{children}</div>
}

export function MenuSeparator() {
  return <div className="av-menu-sep" role="separator" />
}
