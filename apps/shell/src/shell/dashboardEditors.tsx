/**
 * Editier-Dialoge fürs Übersichts-Dashboard: Tagesablauf, Aufgaben, Crew,
 * Budget und Logistik lassen sich hier als echte CRUD-Listen bearbeiten
 * (Hinzufügen / Ändern / Entfernen / Umsortieren). Jeder Editor arbeitet auf
 * einem lokalen Entwurf und gibt beim Speichern die neue Liste zurück — die
 * Persistenz (Undo/Redo + localStorage) übernimmt die Shell (App.updateShow).
 */
import { useState } from 'react'
import { Button, Icon, Modal } from '@avplan/ui'
import {
  DEPARTMENT_LABEL,
  PHASE_LABEL,
  type BudgetLine,
  type Contact,
  type CrewMember,
  type Department,
  type LogisticsInfo,
  type ProjectTask,
  type ScheduleItem,
  type ShowPhase,
} from '../data/project'
import { useT, type TFunc } from '../i18n'

const fieldCls =
  'av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[12.5px] text-av-text'

/** ISO-Datum (YYYY-MM-DD) → deutsch formatiertes Label (z. B. „Sa, 18. Juli 2026"). */
function formatGermanDate(iso: string): string {
  try {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toLocaleDateString('de-DE', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return iso
  }
}

/* ── kleine Feld-Bausteine ─────────────────────────────────────────────────*/

function TextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  ariaLabel: string
  className?: string
}) {
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={`${fieldCls} ${className ?? ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function NumField({
  value,
  onChange,
  min = 0,
  ariaLabel,
  className,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  ariaLabel: string
  className?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? String(value)
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      className={`${fieldCls} ${className ?? ''}`}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const norm = raw.replace(',', '.').trim()
        if (norm === '' || norm === '-' || norm === '.') {
          onChange(min)
          return
        }
        const n = Number(norm)
        if (!Number.isFinite(n)) return
        onChange(Math.max(min, Math.trunc(n)))
      }}
      onBlur={() => setDraft(null)}
    />
  )
}

function SelectField<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  ariaLabel: string
  className?: string
}) {
  return (
    <select
      aria-label={ariaLabel}
      className={`${fieldCls} ${className ?? ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** Umsortieren/Entfernen einer Zeile. */
function RowTools({
  index,
  total,
  onMove,
  onRemove,
  removeLabel,
}: {
  index: number
  total: number
  onMove: (from: number, dir: -1 | 1) => void
  onRemove: (index: number) => void
  removeLabel: string
}) {
  const t = useT()
  return (
    <span className="flex flex-none items-center gap-0.5">
      <button
        type="button"
        className="av-icon-btn av-focus"
        aria-label={t('overview.editor.moveUp', 'Nach oben')}
        disabled={index === 0}
        style={{ opacity: index === 0 ? 0.3 : 1, width: 24, height: 24 }}
        onClick={() => onMove(index, -1)}
      >
        <Icon name="chevron-down" size={13} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <button
        type="button"
        className="av-icon-btn av-focus"
        aria-label={t('overview.editor.moveDown', 'Nach unten')}
        disabled={index === total - 1}
        style={{ opacity: index === total - 1 ? 0.3 : 1, width: 24, height: 24 }}
        onClick={() => onMove(index, 1)}
      >
        <Icon name="chevron-down" size={13} />
      </button>
      <button
        type="button"
        className="av-icon-btn av-focus text-av-text-faint hover:text-av-danger"
        aria-label={removeLabel}
        style={{ width: 24, height: 24 }}
        onClick={() => onRemove(index)}
      >
        <Icon name="close" size={13} />
      </button>
    </span>
  )
}

/** Generische Umsortier-Hilfe (unveränderlich). */
function moveItem<T>(list: T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

/** Gemeinsame Editor-Hülle: Modal mit Abbrechen/Speichern-Fuß. */
function EditorShell({
  open,
  title,
  onClose,
  onSave,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  onSave: () => void
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            {t('overview.editor.cancel', 'Abbrechen')}
          </Button>
          <Button variant="primary" onClick={onSave}>
            <Icon name="check" size={15} /> {t('overview.editor.save', 'Speichern')}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="av-focus mt-3 flex w-full items-center justify-center gap-1.5 rounded-av-control border border-dashed border-av-border py-2 text-[12.5px] text-av-text-secondary hover:border-av-accent hover:text-av-text"
      onClick={onClick}
    >
      <Icon name="plus" size={14} /> {label}
    </button>
  )
}

function deptOptions(t: TFunc): { value: Department | 'all'; label: string }[] {
  return [
    { value: 'all', label: t('overview.dept.all', 'Alle') },
    { value: 'video', label: t('overview.dept.video', DEPARTMENT_LABEL.video) },
    { value: 'light', label: t('overview.dept.light', DEPARTMENT_LABEL.light) },
    { value: 'audio', label: t('overview.dept.audio', DEPARTMENT_LABEL.audio) },
    { value: 'prod', label: t('overview.dept.prod', DEPARTMENT_LABEL.prod) },
  ]
}

/* ── Tagesablauf ───────────────────────────────────────────────────────────*/

export function ScheduleEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: ScheduleItem[]
  onClose: () => void
  onSave: (next: ScheduleItem[]) => void
}) {
  const t = useT()
  const [rows, setRows] = useState<ScheduleItem[]>(() => value.map((r) => ({ ...r })))
  const patch = (i: number, p: Partial<ScheduleItem>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  const opts = deptOptions(t)
  return (
    <EditorShell open={open} title={t('overview.editor.schedule.title', 'Tagesablauf bearbeiten')} onClose={onClose} onSave={() => onSave(rows)}>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextField value={r.time} onChange={(v) => patch(i, { time: v })} ariaLabel={t('overview.editor.schedule.time', 'Uhrzeit')} placeholder="08:00" className="w-20" />
            <TextField value={r.title} onChange={(v) => patch(i, { title: v })} ariaLabel={t('overview.editor.schedule.name', 'Programmpunkt')} placeholder={t('overview.editor.schedule.namePh', 'Programmpunkt')} className="flex-1" />
            <SelectField value={r.dept} onChange={(v) => patch(i, { dept: v })} options={opts} ariaLabel={t('overview.editor.schedule.dept', 'Gewerk')} className="w-28" />
            <RowTools index={i} total={rows.length} onMove={(f, d) => setRows((rs) => moveItem(rs, f, d))} onRemove={(idx) => setRows((rs) => rs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.schedule.remove', 'Punkt entfernen')} />
          </div>
        ))}
        <AddRowButton label={t('overview.editor.schedule.add', 'Programmpunkt hinzufügen')} onClick={() => setRows((rs) => [...rs, { time: '', title: '', dept: 'all' }])} />
      </div>
    </EditorShell>
  )
}

/* ── Aufgaben ──────────────────────────────────────────────────────────────*/

export function TasksEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: ProjectTask[]
  onClose: () => void
  onSave: (next: ProjectTask[]) => void
}) {
  const t = useT()
  const [rows, setRows] = useState<ProjectTask[]>(() => value.map((r) => ({ ...r })))
  const patch = (i: number, p: Partial<ProjectTask>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  return (
    <EditorShell open={open} title={t('overview.editor.tasks.title', 'Aufgaben bearbeiten')} onClose={onClose} onSave={() => onSave(rows)}>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="av-focus h-4 w-4 flex-none accent-[color:var(--av-accent)]"
              aria-label={t('overview.editor.tasks.done', 'Erledigt')}
              checked={r.done}
              onChange={(e) => patch(i, { done: e.target.checked })}
            />
            <TextField value={r.title} onChange={(v) => patch(i, { title: v })} ariaLabel={t('overview.editor.tasks.name', 'Aufgabe')} placeholder={t('overview.editor.tasks.namePh', 'Aufgabe')} className="flex-1" />
            <TextField value={r.owner ?? ''} onChange={(v) => patch(i, { owner: v || undefined })} ariaLabel={t('overview.editor.tasks.owner', 'Zuständig')} placeholder={t('overview.editor.tasks.ownerPh', 'Wer?')} className="w-28" />
            <TextField value={r.due ?? ''} onChange={(v) => patch(i, { due: v || undefined })} ariaLabel={t('overview.editor.tasks.due', 'Fällig')} placeholder={t('overview.editor.tasks.duePh', 'Wann?')} className="w-20" />
            <RowTools index={i} total={rows.length} onMove={(f, d) => setRows((rs) => moveItem(rs, f, d))} onRemove={(idx) => setRows((rs) => rs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.tasks.remove', 'Aufgabe entfernen')} />
          </div>
        ))}
        <AddRowButton label={t('overview.editor.tasks.add', 'Aufgabe hinzufügen')} onClick={() => setRows((rs) => [...rs, { title: '', done: false }])} />
      </div>
    </EditorShell>
  )
}

/* ── Crew ──────────────────────────────────────────────────────────────────*/

export function CrewEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: CrewMember[]
  onClose: () => void
  onSave: (next: CrewMember[]) => void
}) {
  const t = useT()
  const [rows, setRows] = useState<CrewMember[]>(() => value.map((r) => ({ ...r })))
  const patch = (i: number, p: Partial<CrewMember>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  const dOpts = deptOptions(t).filter((o) => o.value !== 'all') as { value: Department; label: string }[]
  const sOpts: { value: CrewMember['status']; label: string }[] = [
    { value: 'confirmed', label: t('overview.editor.crew.confirmed', 'bestätigt') },
    { value: 'pending', label: t('overview.editor.crew.pending', 'offen') },
  ]
  return (
    <EditorShell open={open} title={t('overview.editor.crew.title', 'Crew bearbeiten')} onClose={onClose} onSave={() => onSave(rows)}>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextField value={r.name} onChange={(v) => patch(i, { name: v })} ariaLabel={t('overview.editor.crew.name', 'Name')} placeholder={t('overview.editor.crew.namePh', 'Name')} className="w-36" />
            <TextField value={r.role} onChange={(v) => patch(i, { role: v })} ariaLabel={t('overview.editor.crew.role', 'Funktion')} placeholder={t('overview.editor.crew.rolePh', 'Funktion')} className="flex-1" />
            <SelectField value={r.dept} onChange={(v) => patch(i, { dept: v })} options={dOpts} ariaLabel={t('overview.editor.crew.dept', 'Gewerk')} className="w-24" />
            <TextField value={r.call} onChange={(v) => patch(i, { call: v })} ariaLabel={t('overview.editor.crew.call', 'Call-Time')} placeholder="08:00" className="w-20" />
            <SelectField value={r.status} onChange={(v) => patch(i, { status: v })} options={sOpts} ariaLabel={t('overview.editor.crew.status', 'Status')} className="w-24" />
            <RowTools index={i} total={rows.length} onMove={(f, d) => setRows((rs) => moveItem(rs, f, d))} onRemove={(idx) => setRows((rs) => rs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.crew.remove', 'Person entfernen')} />
          </div>
        ))}
        <AddRowButton label={t('overview.editor.crew.add', 'Person hinzufügen')} onClick={() => setRows((rs) => [...rs, { name: '', role: '', dept: 'video', call: '', status: 'pending' }])} />
      </div>
    </EditorShell>
  )
}

/* ── Budget ────────────────────────────────────────────────────────────────*/

export function BudgetEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: BudgetLine[]
  onClose: () => void
  onSave: (next: BudgetLine[]) => void
}) {
  const t = useT()
  const [rows, setRows] = useState<BudgetLine[]>(() => value.map((r) => ({ ...r })))
  const patch = (i: number, p: Partial<BudgetLine>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  return (
    <EditorShell open={open} title={t('overview.editor.budget.title', 'Budget bearbeiten')} onClose={onClose} onSave={() => onSave(rows)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">
          <span className="flex-1">{t('overview.editor.budget.category', 'Kategorie')}</span>
          <span className="w-28 text-right">{t('overview.editor.budget.estimated', 'Geplant €')}</span>
          <span className="w-28 text-right">{t('overview.editor.budget.actual', 'Ist €')}</span>
          <span className="w-[76px]" />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextField value={r.category} onChange={(v) => patch(i, { category: v })} ariaLabel={t('overview.editor.budget.category', 'Kategorie')} placeholder={t('overview.editor.budget.categoryPh', 'Kategorie')} className="flex-1" />
            <NumField value={r.estimatedEur} onChange={(n) => patch(i, { estimatedEur: n })} ariaLabel={t('overview.editor.budget.estimated', 'Geplant €')} className="w-28 text-right" />
            <NumField value={r.actualEur} onChange={(n) => patch(i, { actualEur: n })} ariaLabel={t('overview.editor.budget.actual', 'Ist €')} className="w-28 text-right" />
            <RowTools index={i} total={rows.length} onMove={(f, d) => setRows((rs) => moveItem(rs, f, d))} onRemove={(idx) => setRows((rs) => rs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.budget.remove', 'Zeile entfernen')} />
          </div>
        ))}
        <AddRowButton label={t('overview.editor.budget.add', 'Kategorie hinzufügen')} onClick={() => setRows((rs) => [...rs, { category: '', estimatedEur: 0, actualEur: 0 }])} />
      </div>
    </EditorShell>
  )
}

/* ── Logistik ──────────────────────────────────────────────────────────────*/

export function LogisticsEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: LogisticsInfo
  onClose: () => void
  onSave: (next: LogisticsInfo) => void
}) {
  const t = useT()
  const [loadIn, setLoadIn] = useState(value.loadIn)
  const [distanceKm, setDistanceKm] = useState(value.distanceKm)
  const [vehicles, setVehicles] = useState(() => value.vehicles.map((v) => ({ ...v })))
  const patchV = (i: number, p: Partial<{ label: string; detail: string }>) =>
    setVehicles((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...p } : v)))
  return (
    <EditorShell open={open} title={t('overview.editor.logistics.title', 'Logistik bearbeiten')} onClose={onClose} onSave={() => onSave({ loadIn, distanceKm, vehicles })}>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('overview.card.logistics.loadIn', 'Load-in')}
          <TextField value={loadIn} onChange={setLoadIn} ariaLabel={t('overview.card.logistics.loadIn', 'Load-in')} placeholder="08:00" className="w-24" />
        </label>
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('overview.editor.logistics.distance', 'Anfahrt (km)')}
          <NumField value={distanceKm} onChange={setDistanceKm} ariaLabel={t('overview.editor.logistics.distance', 'Anfahrt (km)')} className="w-24" />
        </label>
      </div>
      <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">
        {t('overview.editor.logistics.vehicles', 'Fahrzeuge')}
      </div>
      <div className="flex flex-col gap-2">
        {vehicles.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextField value={v.label} onChange={(val) => patchV(i, { label: val })} ariaLabel={t('overview.editor.logistics.vehicle', 'Fahrzeug')} placeholder={t('overview.editor.logistics.vehiclePh', 'z. B. 7,5 t LKW')} className="w-40" />
            <TextField value={v.detail} onChange={(val) => patchV(i, { detail: val })} ariaLabel={t('overview.editor.logistics.detail', 'Ladung')} placeholder={t('overview.editor.logistics.detailPh', 'Ladung / Zweck')} className="flex-1" />
            <RowTools index={i} total={vehicles.length} onMove={(f, d) => setVehicles((vs) => moveItem(vs, f, d))} onRemove={(idx) => setVehicles((vs) => vs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.logistics.remove', 'Fahrzeug entfernen')} />
          </div>
        ))}
        <AddRowButton label={t('overview.editor.logistics.add', 'Fahrzeug hinzufügen')} onClick={() => setVehicles((vs) => [...vs, { label: '', detail: '' }])} />
      </div>
    </EditorShell>
  )
}

/* ── Kontakte ──────────────────────────────────────────────────────────────*/

export function ContactsEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: Contact[]
  onClose: () => void
  onSave: (next: Contact[]) => void
}) {
  const t = useT()
  const [rows, setRows] = useState<Contact[]>(() => value.map((r) => ({ ...r })))
  const patch = (i: number, p: Partial<Contact>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  // Rechnungsempfänger ist exklusiv — nur ein Kontakt trägt billTo. Genau dieser
  // wird in der Beleg-Erstellung (Lexware) als Kunde/Empfänger verwendet.
  const toggleBillTo = (i: number) =>
    setRows((rs) => rs.map((r, idx) => ({ ...r, billTo: idx === i ? !r.billTo : false })))
  return (
    <EditorShell open={open} title={t('overview.editor.contacts.title', 'Kontakte bearbeiten')} onClose={onClose} onSave={() => onSave(rows)}>
      <div className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <div key={i} className="rounded-av-control border border-av-border bg-av-surface-2 p-2.5">
            <div className="flex items-center gap-2">
              <TextField value={r.name} onChange={(v) => patch(i, { name: v })} ariaLabel={t('overview.editor.contacts.name', 'Name')} placeholder={t('overview.editor.contacts.namePh', 'Name / Firma')} className="w-40" />
              <TextField value={r.role} onChange={(v) => patch(i, { role: v })} ariaLabel={t('overview.editor.contacts.role', 'Funktion')} placeholder={t('overview.editor.contacts.rolePh', 'Funktion')} className="w-32" />
              <TextField value={r.org} onChange={(v) => patch(i, { org: v })} ariaLabel={t('overview.editor.contacts.org', 'Organisation')} placeholder={t('overview.editor.contacts.orgPh', 'Bereich / Firma')} className="flex-1" />
              <TextField value={r.phone} onChange={(v) => patch(i, { phone: v })} ariaLabel={t('overview.editor.contacts.phone', 'Telefon')} placeholder="+49 …" className="w-36" />
              <RowTools index={i} total={rows.length} onMove={(f, d) => setRows((rs) => moveItem(rs, f, d))} onRemove={(idx) => setRows((rs) => rs.filter((_, k) => k !== idx))} removeLabel={t('overview.editor.contacts.remove', 'Kontakt entfernen')} />
            </div>
            {/* Rechnungsempfänger-Umschalter — blendet die Kunden-/Rechnungsdaten ein. */}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={!!r.billTo}
                onClick={() => toggleBillTo(i)}
                className="av-focus flex items-center gap-1.5 rounded-av-control px-1.5 py-1 text-[12px] text-av-text-secondary hover:bg-av-surface-3"
              >
                <span
                  className="grid h-4 w-4 flex-none place-items-center rounded border"
                  style={{ background: r.billTo ? 'var(--av-accent)' : 'transparent', borderColor: r.billTo ? 'var(--av-accent)' : 'var(--av-border)', color: 'var(--av-accent-text)' }}
                >
                  {r.billTo && <Icon name="check" size={12} />}
                </span>
                {t('overview.editor.contacts.billTo', 'Rechnungsempfänger (Kunde)')}
              </button>
              {r.billTo && (
                <span className="text-[11px] text-av-text-muted">{t('overview.editor.contacts.billToHint', 'wird bei Belegen (Lexware) als Kunde verwendet')}</span>
              )}
            </div>
            {r.billTo && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-4">
                  <TextField value={r.email ?? ''} onChange={(v) => patch(i, { email: v || undefined })} ariaLabel={t('overview.editor.contacts.email', 'E-Mail')} placeholder={t('overview.editor.contacts.emailPh', 'E-Mail (für Beleg-Versand)')} className="w-full" />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <TextField value={r.street ?? ''} onChange={(v) => patch(i, { street: v || undefined })} ariaLabel={t('overview.editor.contacts.street', 'Straße')} placeholder={t('overview.editor.contacts.streetPh', 'Straße & Nr.')} className="w-full" />
                </div>
                <TextField value={r.zip ?? ''} onChange={(v) => patch(i, { zip: v || undefined })} ariaLabel={t('overview.editor.contacts.zip', 'PLZ')} placeholder={t('overview.editor.contacts.zip', 'PLZ')} className="w-full" />
                <TextField value={r.city ?? ''} onChange={(v) => patch(i, { city: v || undefined })} ariaLabel={t('overview.editor.contacts.city', 'Ort')} placeholder={t('overview.editor.contacts.city', 'Ort')} className="w-full" />
                <TextField value={r.vatId ?? ''} onChange={(v) => patch(i, { vatId: v || undefined })} ariaLabel={t('overview.editor.contacts.vatId', 'USt-IdNr')} placeholder={t('overview.editor.contacts.vatId', 'USt-IdNr')} className="w-full" />
                <TextField value={r.customerNumber ?? ''} onChange={(v) => patch(i, { customerNumber: v || undefined })} ariaLabel={t('overview.editor.contacts.customerNumber', 'Kd-Nr')} placeholder={t('overview.editor.contacts.customerNumber', 'Kd-Nr')} className="w-full" />
              </div>
            )}
          </div>
        ))}
        <AddRowButton label={t('overview.editor.contacts.add', 'Kontakt hinzufügen')} onClick={() => setRows((rs) => [...rs, { name: '', role: '', org: '', phone: '' }])} />
      </div>
    </EditorShell>
  )
}

/* ── Projekt-Kopf (Name / Venue / Datum / Phase / Fortschritt) ─────────────*/

export interface HeaderDraft {
  name: string
  venue: string
  dateLabel: string
  phase: ShowPhase
  progress: number
}

export function HeaderEditor({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  value: HeaderDraft
  onClose: () => void
  onSave: (next: HeaderDraft) => void
}) {
  const t = useT()
  const [name, setName] = useState(value.name)
  const [venue, setVenue] = useState(value.venue)
  const [dateLabel, setDateLabel] = useState(value.dateLabel)
  const [phase, setPhase] = useState<ShowPhase>(value.phase)
  const [progressPct, setProgressPct] = useState(Math.round(value.progress * 100))
  const phaseOpts: { value: ShowPhase; label: string }[] = [
    { value: 'planning', label: t('overview.phase.planning', PHASE_LABEL.planning) },
    { value: 'setup', label: t('overview.phase.setup', PHASE_LABEL.setup) },
    { value: 'show', label: t('overview.phase.show', PHASE_LABEL.show) },
    { value: 'teardown', label: t('overview.phase.teardown', PHASE_LABEL.teardown) },
  ]
  const save = () =>
    onSave({ name: name.trim() || value.name, venue, dateLabel, phase, progress: Math.min(100, Math.max(0, progressPct)) / 100 })
  return (
    <EditorShell open={open} title={t('overview.editor.header.title', 'Projekt bearbeiten')} onClose={onClose} onSave={save}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[12px] text-av-text-secondary">
          {t('overview.editor.header.name', 'Projektname')}
          <TextField value={name} onChange={setName} ariaLabel={t('overview.editor.header.name', 'Projektname')} className="w-full" />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-1 flex-col gap-1 text-[12px] text-av-text-secondary">
            {t('overview.editor.header.venue', 'Location')}
            <TextField value={venue} onChange={setVenue} ariaLabel={t('overview.editor.header.venue', 'Location')} className="w-full" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-[12px] text-av-text-secondary">
            {t('overview.editor.header.date', 'Datum')}
            <div className="flex gap-2">
              <TextField value={dateLabel} onChange={setDateLabel} ariaLabel={t('overview.editor.header.date', 'Datum')} placeholder="Sa 18. Juli 2026" className="flex-1" />
              {/* Datums-Picker füllt das Freitext-Feld mit einem deutsch formatierten Datum. */}
              <input
                type="date"
                aria-label={t('overview.editor.header.datePick', 'Datum wählen')}
                className={`${fieldCls} w-[9.5rem]`}
                onChange={(e) => { if (e.target.value) setDateLabel(formatGermanDate(e.target.value)) }}
              />
            </div>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-1 flex-col gap-1 text-[12px] text-av-text-secondary">
            {t('overview.editor.header.phase', 'Phase')}
            <SelectField value={phase} onChange={setPhase} options={phaseOpts} ariaLabel={t('overview.editor.header.phase', 'Phase')} className="w-full" />
          </label>
          <label className="flex w-40 flex-col gap-1 text-[12px] text-av-text-secondary">
            {t('overview.editor.header.progress', 'Fortschritt (%)')}
            <NumField value={progressPct} onChange={setProgressPct} min={0} ariaLabel={t('overview.editor.header.progress', 'Fortschritt (%)')} className="w-full" />
          </label>
        </div>
      </div>
    </EditorShell>
  )
}
