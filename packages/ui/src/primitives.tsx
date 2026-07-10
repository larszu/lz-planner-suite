import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type ButtonVariant = 'default' | 'primary' | 'ghost' | 'subtle'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

export function Button({ variant = 'default', size = 'md', className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('av-btn', className)}
      data-variant={variant === 'default' ? undefined : variant}
      data-size={size === 'sm' ? 'sm' : undefined}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

export function IconButton({ label, active, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn('av-icon-btn', className)}
      data-active={active ? 'true' : undefined}
      aria-label={label}
      title={label}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  heading?: ReactNode
  actions?: ReactNode
  bodyClassName?: string
  children?: ReactNode
}

export function Panel({ heading, actions, className, bodyClassName, children, ...rest }: PanelProps) {
  return (
    <section className={cn('av-panel', className)} {...rest}>
      {(heading || actions) && (
        <header className="av-panel-head">
          {heading && <span className="av-panel-title">{heading}</span>}
          {actions && <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>{actions}</span>}
        </header>
      )}
      <div className={cn('av-panel-body av-scroll', bodyClassName)}>{children}</div>
    </section>
  )
}

type BadgeTone = 'neutral' | 'ok' | 'warn' | 'danger' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
  children?: ReactNode
}

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('av-badge', className)} data-tone={tone === 'neutral' ? undefined : tone} {...rest}>
      {dot && <span className="av-badge-dot" />}
      {children}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="av-kbd">{children}</kbd>
}

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  active: string
  onSelect: (id: string) => void
  className?: string
}

export function Tabs({ items, active, onSelect, className }: TabsProps) {
  return (
    <div className={cn('av-tabs', className)} role="tablist">
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className="av-tab"
            data-active={isActive ? 'true' : 'false'}
            onClick={() => onSelect(item.id)}
          >
            {item.icon ?? <span className="av-tab-dot" />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
