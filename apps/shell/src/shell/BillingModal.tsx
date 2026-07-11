import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@avplan/ui'
import {
  buildPayload,
  grossTotal,
  netTotal,
  taxTotal,
  type BillingDoc,
  type BillingLineItem,
  type LexwareDocKind,
  type TaxRatePercent,
  type TaxType,
} from '@avplan/lexware-core'
import { format, useT } from '../i18n'
import { billToContact, resolveBilling, type SuiteProject } from '../data/project'
import { addDaysIso, deriveLineItems, toBillingContact, type LineSource } from '../data/billing'
import { canSendLexware, sendLexware } from '../embed/lexwareBridge'

const eur = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

const fieldCls = 'av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[12.5px] text-av-text'

/**
 * Robuste Zahlen-Eingabe: akzeptiert deutsches Komma, klemmt auf [min,max],
 * liefert dem Modell nie NaN (leer/ungültig → min bzw. 0). Während des Tippens
 * hält ein Draft-String die Rohform (z. B. „1,"), damit Dezimaleingabe flüssig
 * bleibt; beim Verlassen normalisiert er auf den kanonischen Wert.
 */
function NumField({
  value,
  onChange,
  min = 0,
  max,
  decimal = false,
  className = '',
  ariaLabel,
  invalid = false,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  decimal?: boolean
  className?: string
  ariaLabel?: string
  invalid?: boolean
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? String(value)
  return (
    <input
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      aria-label={ariaLabel}
      className={`${fieldCls} ${className} ${invalid ? 'border-av-danger ring-1 ring-av-danger' : ''}`}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const norm = raw.replace(',', '.').trim()
        if (norm === '' || norm === '-' || norm === '.') {
          onChange(min)
          return
        }
        let n = Number(norm)
        if (!Number.isFinite(n)) return // ungültiger Zwischenstand: Modell behält letzten gültigen Wert
        if (!decimal) n = Math.trunc(n)
        if (min != null) n = Math.max(min, n)
        if (max != null) n = Math.min(max, n)
        onChange(n)
      }}
      onBlur={() => setDraft(null)}
    />
  )
}

export function BillingModal({
  open,
  onClose,
  project,
}: {
  open: boolean
  onClose: () => void
  project: SuiteProject | null
}) {
  const t = useT()
  return (
    <Modal open={open} onClose={onClose} title={t('billing.title', 'Beleg erstellen · Lexware Office')} size="lg">
      {project ? <BillingBody project={project} /> : null}
    </Modal>
  )
}

function BillingBody({ project }: { project: SuiteProject }) {
  const t = useT()
  const defaults = resolveBilling(project.show)
  const recipient = billToContact(project.show)

  const [kind, setKind] = useState<LexwareDocKind>('quotation')
  const [source, setSource] = useState<LineSource>('budget')
  const [voucherDate, setVoucherDate] = useState(todayIso)
  const [taxType, setTaxType] = useState<TaxType>(defaults.taxType)
  const [intro, setIntro] = useState(defaults.introduction ?? '')
  const [remark, setRemark] = useState(defaults.remark ?? '')
  const [payDays, setPayDays] = useState(defaults.paymentTermDays)
  const [validDays, setValidDays] = useState(defaults.quoteValidDays)
  const [items, setItems] = useState<BillingLineItem[]>(() => deriveLineItems(project, 'budget'))
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; webUrl?: string; error?: string } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  // Reaktive Verfügbarkeit des Signal-Planers: er kann geöffnet/geschlossen
  // werden, während der Dialog offen ist — daher periodisch nachsehen.
  const [plannerAvailable, setPlannerAvailable] = useState(canSendLexware)
  useEffect(() => {
    // Anfangswert deckt der useState-Initializer ab; hier nur periodisch neu prüfen.
    const id = setInterval(() => setPlannerAvailable(canSendLexware()), 1500)
    return () => clearInterval(id)
  }, [])

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash((cur) => (cur === msg ? null : cur)), 2000)
  }

  const reloadFromSource = (s: LineSource) => {
    setSource(s)
    setItems(deriveLineItems(project, s))
    setResult(null)
  }

  const patchItem = (i: number, patch: Partial<BillingLineItem>) => {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
    setResult(null)
  }
  const addItem = () =>
    setItems((arr) => [...arr, { name: '', quantity: 1, unitName: 'Pauschale', unitNetPrice: 0, taxRatePercent: defaults.taxRatePercent }])
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i))

  // Pro-Zeile-Validierung: Name nicht leer, Menge > 0, Preis ≥ 0.
  const rowIssues = items.map((it) => ({
    name: !it.name.trim(),
    qty: !(it.quantity > 0),
    price: it.unitNetPrice < 0,
  }))
  const invalidCount = rowIssues.filter((r) => r.name || r.qty || r.price).length
  const valid = !!recipient && items.length > 0 && invalidCount === 0

  const doc = useMemo<BillingDoc | null>(() => {
    if (!recipient) return null
    const base: BillingDoc = {
      kind,
      contact: toBillingContact(recipient),
      taxType,
      currency: 'EUR',
      voucherDate,
      title: project.meta.name,
      introduction: intro || undefined,
      remark: remark || undefined,
      lineItems: items,
    }
    if (kind === 'quotation') base.expirationDate = addDaysIso(voucherDate, validDays)
    else {
      base.paymentTermDays = payDays
      base.paymentTermLabel = format(t('billing.paymentTermLabel', 'Zahlbar innerhalb von {n} Tagen ohne Abzug'), { n: payDays })
    }
    return base
  }, [recipient, kind, taxType, voucherDate, project.meta.name, intro, remark, items, validDays, payDays, t])

  const payloadJson = useMemo(() => {
    if (!doc || !doc.lineItems.length) return ''
    try {
      return JSON.stringify(buildPayload(doc), null, 2)
    } catch (e) {
      return `// ${e instanceof Error ? e.message : 'Fehler'}`
    }
  }, [doc])

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(payloadJson)
      showFlash(t('billing.copied', 'JSON kopiert'))
    } catch {
      showFlash(t('billing.copyFailed', 'Kopieren fehlgeschlagen'))
    }
  }
  const doExport = () => {
    const blob = new Blob([payloadJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${kind}-${project.meta.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showFlash(t('billing.exported', 'JSON exportiert'))
  }
  const doSend = async () => {
    if (!doc || !valid) return
    if (!canSendLexware()) {
      setPlannerAvailable(false)
      setResult({ ok: false, error: t('billing.needSignal', 'Signal-Planer öffnen, um zu senden (er hält den Lexware-Key).') })
      return
    }
    setSending(true)
    setResult(null)
    const r = await sendLexware(doc)
    setSending(false)
    setResult(
      r.ok
        ? { ok: true, webUrl: r.webUrl }
        : { ok: false, error: r.error === 'needSignal' ? t('billing.needSignal', 'Signal-Planer öffnen, um zu senden (er hält den Lexware-Key).') : r.error },
    )
  }

  const seg = 'flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-3 p-0.5'
  const segBtn = (active: boolean) =>
    `av-focus rounded-av-control px-2.5 py-1 text-[12.5px] ${active ? 'bg-av-accent text-av-accent-text font-semibold' : 'text-av-text-secondary'}`

  return (
    <div className="flex flex-col gap-4">
      {/* Kopf: Belegart + Quelle + Datum */}
      <div className="flex flex-wrap items-center gap-4">
        <div className={seg}>
          <button type="button" className={segBtn(kind === 'quotation')} onClick={() => { setKind('quotation'); setResult(null) }}>
            {t('billing.kind.quotation', 'Angebot')}
          </button>
          <button type="button" className={segBtn(kind === 'invoice')} onClick={() => { setKind('invoice'); setResult(null) }}>
            {t('billing.kind.invoice', 'Rechnung')}
          </button>
        </div>
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('billing.source.label', 'Positionen aus')}
          <select className={fieldCls} value={source} onChange={(e) => reloadFromSource(e.target.value as LineSource)}>
            <option value="budget">{t('billing.source.budget', 'Budget (je Kategorie)')}</option>
            <option value="inventory">{t('billing.source.inventory', 'Inventar (Tagesmiete)')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('billing.voucherDate', 'Belegdatum')}
          <input type="date" className={fieldCls} value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
        </label>
      </div>

      {/* Empfänger */}
      <section className="rounded-av-card border border-av-border bg-av-surface-1 px-3.5 py-3">
        <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">{t('billing.recipient', 'Empfänger')}</div>
        {recipient ? (
          <div className="text-[13px] text-av-text">
            <div className="font-medium">{recipient.name}</div>
            <div className="text-av-text-secondary">
              {[recipient.street, [recipient.zip, recipient.city].filter(Boolean).join(' '), recipient.countryCode].filter(Boolean).join(' · ')}
            </div>
            <div className="text-[11px] text-av-text-faint">
              {[recipient.email, recipient.vatId && `USt-IdNr ${recipient.vatId}`, recipient.customerNumber && `Kd-Nr ${recipient.customerNumber}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        ) : (
          <div className="text-[12.5px] text-av-warn">{t('billing.noRecipient', 'Kein Rechnungsempfänger gesetzt — Kontakt im Projekt als „Rechnungsempfänger" markieren.')}</div>
        )}
      </section>

      {/* Besteuerung + Belegkopf */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('billing.taxType', 'Besteuerung')}
          <select className={fieldCls} value={taxType} onChange={(e) => setTaxType(e.target.value as TaxType)}>
            <option value="net">{t('billing.tax.net', 'Netto')}</option>
            <option value="gross">{t('billing.tax.gross', 'Brutto')}</option>
            <option value="vatfree">{t('billing.tax.vatfree', 'Steuerfrei (§19)')}</option>
          </select>
        </label>
        {kind === 'invoice' ? (
          <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
            {t('billing.paymentTerm', 'Zahlungsziel (Tage)')}
            <NumField value={payDays} onChange={setPayDays} min={0} className="w-20" ariaLabel={t('billing.paymentTerm', 'Zahlungsziel (Tage)')} />
          </label>
        ) : (
          <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
            {t('billing.validity', 'Gültig (Tage)')}
            <NumField value={validDays} onChange={setValidDays} min={1} className="w-20" ariaLabel={t('billing.validity', 'Gültig (Tage)')} />
          </label>
        )}
      </div>

      {/* Positionen */}
      <section>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">{t('billing.items', 'Positionen')}</span>
          <button type="button" className="av-focus rounded-av-control border border-av-border px-2 py-0.5 text-[12px] text-av-text-secondary hover:bg-av-surface-2" onClick={addItem}>
            + {t('billing.addItem', 'Position')}
          </button>
        </div>
        {items.length === 0 ? (
          <div className="rounded-av-card border border-dashed border-av-border px-3 py-4 text-center text-[12.5px] text-av-text-faint">
            {t('billing.noItems', 'Keine Positionen — hinzufügen oder Quelle wechseln.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="text-left text-av-text-muted">
                  <th className="py-1 pr-2 font-medium">{t('billing.col.name', 'Bezeichnung')}</th>
                  <th className="py-1 px-1 font-medium">{t('billing.col.qty', 'Menge')}</th>
                  <th className="py-1 px-1 font-medium">{t('billing.col.unit', 'Einheit')}</th>
                  <th className="py-1 px-1 font-medium">{t('billing.col.price', 'Einzel (netto)')}</th>
                  <th className="py-1 px-1 font-medium">{t('billing.col.tax', 'Steuer %')}</th>
                  <th className="py-1 px-1 font-medium">{t('billing.col.discount', 'Rabatt %')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-av-border-muted">
                    <td className="py-1 pr-2">
                      <input
                        className={`${fieldCls} w-full min-w-40 ${rowIssues[i].name ? 'border-av-danger ring-1 ring-av-danger' : ''}`}
                        value={it.name}
                        aria-label={t('billing.col.name', 'Bezeichnung')}
                        placeholder={t('billing.col.name', 'Bezeichnung')}
                        onChange={(e) => patchItem(i, { name: e.target.value })}
                      />
                    </td>
                    <td className="py-1 px-1"><NumField value={it.quantity} onChange={(n) => patchItem(i, { quantity: n })} min={0} className="w-16" invalid={rowIssues[i].qty} ariaLabel={t('billing.col.qty', 'Menge')} /></td>
                    <td className="py-1 px-1"><input className={`${fieldCls} w-20`} value={it.unitName} aria-label={t('billing.col.unit', 'Einheit')} onChange={(e) => patchItem(i, { unitName: e.target.value })} /></td>
                    <td className="py-1 px-1"><NumField value={it.unitNetPrice} onChange={(n) => patchItem(i, { unitNetPrice: n })} min={0} decimal className="w-24" invalid={rowIssues[i].price} ariaLabel={t('billing.col.price', 'Einzel (netto)')} /></td>
                    <td className="py-1 px-1">
                      <select className={`${fieldCls} w-16`} value={it.taxRatePercent} aria-label={t('billing.col.tax', 'Steuer %')} onChange={(e) => patchItem(i, { taxRatePercent: Number(e.target.value) as TaxRatePercent })}>
                        <option value={19}>19</option>
                        <option value={7}>7</option>
                        <option value={0}>0</option>
                      </select>
                    </td>
                    <td className="py-1 px-1"><NumField value={it.discountPercent ?? 0} onChange={(n) => patchItem(i, { discountPercent: n })} min={0} max={100} decimal className="w-16" ariaLabel={t('billing.col.discount', 'Rabatt %')} /></td>
                    <td className="py-1 pl-1 text-right">
                      <button type="button" aria-label={t('billing.removeItem', 'Position entfernen')} className="av-focus rounded px-1.5 text-av-text-faint hover:text-av-danger" onClick={() => removeItem(i)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {invalidCount > 0 && (
          <div className="mt-1.5 text-[11px] text-av-danger">
            {format(t('billing.invalid', '{n} Position(en) unvollständig: Bezeichnung darf nicht leer, Menge muss > 0 und Preis ≥ 0 sein.'), { n: invalidCount })}
          </div>
        )}
      </section>

      {/* Texte */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[11px] text-av-text-muted">
          {t('billing.introduction', 'Einleitungstext')}
          <textarea className={`${fieldCls} h-16 resize-none`} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-av-text-muted">
          {t('billing.remark', 'Schlusstext')}
          <textarea className={`${fieldCls} h-16 resize-none`} value={remark} onChange={(e) => setRemark(e.target.value)} />
        </label>
      </div>

      {/* Summen */}
      {doc && (
        <div className="flex items-center justify-end gap-6 rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-2 text-[12.5px]">
          <span className="text-av-text-secondary">{t('billing.net', 'Netto')}: <span className="tabular-nums text-av-text">{eur(netTotal(doc))}</span></span>
          <span className="text-av-text-secondary">{t('billing.tax', 'Steuer')}: <span className="tabular-nums text-av-text">{eur(taxTotal(doc))}</span></span>
          <span className="font-semibold text-av-text">{t('billing.gross', 'Brutto')}: <span className="tabular-nums">{eur(grossTotal(doc))}</span></span>
        </div>
      )}

      {/* Ergebnis */}
      {result && (
        <div className={`rounded-av-card border px-3.5 py-2 text-[12.5px] ${result.ok ? 'border-av-ok/40 text-av-ok' : 'border-av-danger/40 text-av-danger'}`}>
          {result.ok ? (
            <span>
              {t('billing.sentOk', 'In Lexware Office angelegt')}.
              {result.webUrl && (
                <>{' '}<a className="underline" href={result.webUrl} target="_blank" rel="noreferrer">{t('billing.openInLexware', 'In Lexware öffnen')}</a></>
              )}
            </span>
          ) : (
            <span>{result.error}</span>
          )}
        </div>
      )}

      {/* Primäraktion: Senden */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-av-text-faint">
          {plannerAvailable
            ? t('billing.sendHintReady', 'Der Versand läuft über den geöffneten Signal-Planer (Cable), der den API-Key hält.')
            : t('billing.needSignal', 'Signal-Planer öffnen, um zu senden (er hält den Lexware-Key).')}
        </span>
        <div className="flex items-center gap-2">
          {flash && <span className="text-[11px] text-av-text-muted">{flash}</span>}
          <button
            type="button"
            disabled={!valid || !plannerAvailable || sending}
            title={!plannerAvailable ? t('billing.needSignal', 'Signal-Planer öffnen, um zu senden (er hält den Lexware-Key).') : undefined}
            className="av-focus rounded-av-control bg-av-accent px-3.5 py-1.5 text-[12.5px] font-medium text-av-accent-text disabled:opacity-40"
            onClick={doSend}
          >
            {sending ? t('billing.sending', 'Senden…') : t('billing.send', 'An Planer senden')}
          </button>
        </div>
      </div>

      {/* Erweitert: JSON-Werkzeuge + Payload-Vorschau (für technische Nutzer) */}
      <details className="rounded-av-card border border-av-border bg-av-surface-1">
        <summary className="cursor-pointer px-3.5 py-2 text-[12px] font-medium text-av-text-secondary">{t('billing.advanced', 'Erweitert · JSON')}</summary>
        <div className="flex flex-col gap-2 border-t border-av-border-muted px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <button type="button" disabled={!valid} className="av-focus rounded-av-control border border-av-border px-3 py-1.5 text-[12.5px] text-av-text-secondary hover:bg-av-surface-2 disabled:opacity-40" onClick={doCopy}>
              {t('billing.copy', 'JSON kopieren')}
            </button>
            <button type="button" disabled={!valid} className="av-focus rounded-av-control border border-av-border px-3 py-1.5 text-[12.5px] text-av-text-secondary hover:bg-av-surface-2 disabled:opacity-40" onClick={doExport}>
              {t('billing.export', 'JSON exportieren')}
            </button>
          </div>
          {payloadJson && (
            <pre className="max-h-56 overflow-auto rounded-av-control border border-av-border-muted bg-av-surface-2 px-3 py-2 text-[11px] leading-relaxed text-av-text-secondary">{payloadJson}</pre>
          )}
        </div>
      </details>
    </div>
  )
}
