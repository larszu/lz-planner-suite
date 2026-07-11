import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './icons'
import { cn } from './cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Klick auf den Backdrop schließt (Default: true). */
  closeOnBackdrop?: boolean
  className?: string
}

/**
 * Geteilte Modal-/Dialog-Shell der Suite: Backdrop, zentrierte Karte, Portal,
 * Esc-Schließen, Fokus-Trap und Fokus-Rückgabe. Ersetzt die bisher pro App
 * neu erfundenen Overlay-Muster (cable ModalShell, light modal-*, ad-hoc
 * fixed-inset-Overlays). ARIA: role="dialog" aria-modal.
 */
export function Modal({
  open,
  onClose,
  title,
  footer,
  children,
  size = 'md',
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    const id = window.setTimeout(() => {
      const card = cardRef.current
      const focusable = card?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ;(focusable ?? card)?.focus()
    }, 0)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (open) return
    restoreRef.current?.focus?.()
  }, [open])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab') {
        const card = cardRef.current
        if (!card) return
        const items = Array.from(
          card.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled'))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose],
  )

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="av-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={cardRef}
        className={cn('av-modal', className)}
        data-size={size === 'md' ? undefined : size}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {title && (
          <header className="av-modal-head">
            <h2 className="av-modal-title">{title}</h2>
            <button type="button" className="av-modal-x av-focus" onClick={onClose} aria-label="Schließen">
              <Icon name="close" size={16} />
            </button>
          </header>
        )}
        <div className="av-modal-body av-scroll">{children}</div>
        {footer && <footer className="av-modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
