import { useEffect } from 'react'
import { Icon } from '@avplan/ui'

export interface ToastMsg {
  id: number
  text: string
  tone?: 'ok' | 'warn'
  actionLabel?: string
  onAction?: () => void
}

/** Transiente Rückmeldungen unten mittig (Speichern, Verwerfen mit Undo …). */
export function ToastHost({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMsg; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(toast.id), toast.actionLabel ? 6000 : 3200)
    return () => window.clearTimeout(id)
  }, [toast.id, toast.actionLabel, onDismiss])

  const accent = toast.tone === 'warn' ? 'var(--av-warn)' : 'var(--av-ok)'
  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-2.5 rounded-av-control border border-av-border bg-av-surface-2 px-3.5 py-2 text-[13px] text-av-text shadow-lg"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <Icon name={toast.tone === 'warn' ? 'warning' : 'check'} size={15} style={{ color: accent }} />
      <span>{toast.text}</span>
      {toast.actionLabel && (
        <button
          type="button"
          className="av-focus ml-1 rounded px-1.5 py-0.5 text-[12.5px] font-semibold text-av-accent hover:underline"
          onClick={() => {
            toast.onAction?.()
            onDismiss(toast.id)
          }}
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Schließen"
        className="av-focus ml-0.5 grid h-5 w-5 place-items-center rounded text-av-text-faint hover:text-av-text"
        onClick={() => onDismiss(toast.id)}
      >
        <Icon name="close" size={13} />
      </button>
    </div>
  )
}
