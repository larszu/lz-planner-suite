/**
 * Imperative, versprechensbasierte Dialoge als Ersatz für die nativen
 * `window.alert/confirm/prompt`. Ein einziger portalbasierter Mount pro Aufruf,
 * löst das Promise beim Schließen. Die Farben folgen `data-theme` am <html>
 * (neutrale Palette), sind also unabhängig vom Token-System der jeweiligen App
 * (cp-*, bc-*, bare) — dieselbe Komponente passt in alle Planer und die Shell.
 *
 *   if (!(await confirmDialog('Wirklich löschen?', { destructive: true }))) return
 *   const name = await promptDialog('Name?', { defaultValue: 'Neu' })
 *   await alertDialog('Fertig.')
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

function isLight(): boolean {
  try {
    return document.documentElement.dataset.theme === 'light'
  } catch {
    return false
  }
}

interface Palette {
  backdrop: string
  card: string
  border: string
  text: string
  textMuted: string
  fieldBg: string
  secondaryBg: string
}

function palette(): Palette {
  return isLight()
    ? { backdrop: 'rgba(15,23,42,0.35)', card: '#ffffff', border: '#d8deea', text: '#1f2733', textMuted: '#5a6577', fieldBg: '#f4f6fb', secondaryBg: '#eef1f7' }
    : { backdrop: 'rgba(0,0,0,0.55)', card: '#1a1d27', border: '#2a2d3a', text: '#e5e7eb', textMuted: '#9ca3af', fieldBg: '#12141c', secondaryBg: '#252a36' }
}

/** Einen Einweg-Dialog mounten und beim `done` wieder abräumen. */
function mountDialog<T>(render: (done: (value: T) => void) => ReactNode): Promise<T> {
  return new Promise<T>((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const done = (value: T) => {
      root.unmount()
      host.remove()
      resolve(value)
    }
    root.render(render(done))
  })
}

function Shell({ label, onBackdrop, children }: { label: string; onBackdrop: () => void; children: ReactNode }) {
  const p = palette()
  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onBackdrop() }}
      style={{ position: 'fixed', inset: 0, zIndex: 2147483000, display: 'grid', placeItems: 'center', background: p.backdrop, padding: 16 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={{ minWidth: 320, maxWidth: 460, borderRadius: 12, border: `1px solid ${p.border}`, background: p.card, color: p.text, padding: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', fontFamily: 'inherit' }}
      >
        {children}
      </div>
    </div>
  )
}

function btn(kind: 'primary' | 'secondary' | 'danger'): React.CSSProperties {
  const p = palette()
  const base: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid transparent' }
  if (kind === 'secondary') return { ...base, background: p.secondaryBg, color: p.text, borderColor: p.border }
  if (kind === 'danger') return { ...base, background: '#dc2626', color: '#fff' }
  return { ...base, background: '#3b82f6', color: '#fff' }
}

export interface ConfirmDialogOptions {
  body?: string
  okLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function confirmDialog(title: string, options: ConfirmDialogOptions = {}): Promise<boolean> {
  return mountDialog<boolean>((done) => <ConfirmView title={title} options={options} onDone={done} />)
}

function ConfirmView({ title, options, onDone }: { title: string; options: ConfirmDialogOptions; onDone: (v: boolean) => void }) {
  const okRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone(false)
      else if (e.key === 'Enter') onDone(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])
  const p = palette()
  return (
    <Shell label={title} onBackdrop={() => onDone(false)}>
      <div style={{ marginBottom: options.body ? 8 : 16, fontSize: 14, fontWeight: 600 }}>{title}</div>
      {options.body && <div style={{ marginBottom: 16, fontSize: 13, color: p.textMuted }}>{options.body}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => onDone(false)} style={btn('secondary')}>{options.cancelLabel ?? 'Abbrechen'}</button>
        <button ref={okRef} type="button" onClick={() => onDone(true)} style={btn(options.destructive ? 'danger' : 'primary')}>{options.okLabel ?? 'OK'}</button>
      </div>
    </Shell>
  )
}

export interface AlertDialogOptions {
  body?: string
  okLabel?: string
}

export function alertDialog(title: string, options: AlertDialogOptions = {}): Promise<void> {
  return mountDialog<void>((done) => <AlertView title={title} options={options} onDone={() => done()} />)
}

function AlertView({ title, options, onDone }: { title: string; options: AlertDialogOptions; onDone: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') onDone() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])
  const p = palette()
  return (
    <Shell label={title} onBackdrop={onDone}>
      <div style={{ marginBottom: options.body ? 8 : 16, fontSize: 14, fontWeight: 600 }}>{title}</div>
      {options.body && <div style={{ marginBottom: 16, fontSize: 13, color: p.textMuted }}>{options.body}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button ref={okRef} type="button" onClick={onDone} style={btn('primary')}>{options.okLabel ?? 'OK'}</button>
      </div>
    </Shell>
  )
}

export interface PromptDialogOptions {
  defaultValue?: string
  body?: string
  okLabel?: string
  cancelLabel?: string
  placeholder?: string
}

export function promptDialog(title: string, options: PromptDialogOptions = {}): Promise<string | null> {
  return mountDialog<string | null>((done) => <PromptView title={title} options={options} onDone={done} />)
}

function PromptView({ title, options, onDone }: { title: string; options: PromptDialogOptions; onDone: (v: string | null) => void }) {
  const [value, setValue] = useState(options.defaultValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDone(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])
  const p = palette()
  const submit = () => {
    const trimmed = value.trim()
    onDone(trimmed.length > 0 ? trimmed : null)
  }
  return (
    <Shell label={title} onBackdrop={() => onDone(null)}>
      <form onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div style={{ marginBottom: options.body ? 8 : 10, fontSize: 14, fontWeight: 600 }}>{title}</div>
        {options.body && <div style={{ marginBottom: 10, fontSize: 13, color: p.textMuted }}>{options.body}</div>}
        <input
          ref={inputRef}
          value={value}
          placeholder={options.placeholder}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', marginBottom: 14, padding: '8px 10px', borderRadius: 8, border: `1px solid ${p.border}`, background: p.fieldBg, color: p.text, fontSize: 13 }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => onDone(null)} style={btn('secondary')}>{options.cancelLabel ?? 'Abbrechen'}</button>
          <button type="submit" style={btn('primary')}>{options.okLabel ?? 'OK'}</button>
        </div>
      </form>
    </Shell>
  )
}
