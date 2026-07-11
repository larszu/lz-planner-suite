import { useMemo, useState } from 'react'
import { Modal, Badge } from '@avplan/ui'
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
import { useT } from '../i18n'
import { billToContact, resolveBilling, type SuiteProject } from '../data/project'
import { addDaysIso, deriveLineItems, toBillingContact, type LineSource } from '../data/billing'
import { canSendLexware, sendLexware } from '../embed/lexwareBridge'

const eur = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
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
  const [copied, setCopied] = useState(false)

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
      base.paymentTermLabel = `Zahlbar innerhalb von ${payDays} Tagen ohne Abzug`
    }
    return base
  }, [recipient, kind, taxType, voucherDate, project.meta.name, intro, remark, items, validDays, payDays])

  const payloadJson = useMemo(() => {
    if (!doc || !doc.lineItems.length) return ''
    try {
      return JSON.stringify(buildPayload(doc), null, 2)
    } catch (e) {
      return `// ${e instanceof Error ? e.message : 'Fehler'}`
    }
  }, [doc])

  const canSend = !!doc && doc.lineItems.length > 0

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(payloadJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* Clipboard gesperrt */
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
  }
  const doSend = async () => {
    if (!doc) return
    if (!canSendLexware()) {
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
  const field = 'av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[12.5px] text-av-text'

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
          <select className={field} value={source} onChange={(e) => reloadFromSource(e.target.value as LineSource)}>
            <option value="budget">{t('billing.source.budget', 'Budget (je Kategorie)')}</option>
            <option value="inventory">{t('billing.source.inventory', 'Inventar (Tagesmiete)')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
          {t('billing.voucherDate', 'Belegdatum')}
          <input type="date" className={field} value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
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
          <select className={field} value={taxType} onChange={(e) => setTaxType(e.target.value as TaxType)}>
            <option value="net">{t('billing.tax.net', 'Netto')}</option>
            <option value="gross">{t('billing.tax.gross', 'Brutto')}</option>
            <option value="vatfree">{t('billing.tax.vatfree', 'Steuerfrei (§19)')}</option>
          </select>
        </label>
        {kind === 'invoice' ? (
          <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
            {t('billing.paymentTerm', 'Zahlungsziel (Tage)')}
            <input type="number" min={0} className={`${field} w-20`} value={payDays} onChange={(e) => setPayDays(Number(e.target.value))} />
          </label>
        ) : (
          <label className="flex items-center gap-2 text-[12.5px] text-av-text-secondary">
            {t('billing.validity', 'Gültig (Tage)')}
            <input type="number" min={0} className={`${field} w-20`} value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} />
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
                    <td className="py-1 pr-2"><input className={`${field} w-full min-w-40`} value={it.name} onChange={(e) => patchItem(i, { name: e.target.value })} /></td>
                    <td className="py-1 px-1"><input type="number" min={0} className={`${field} w-16`} value={it.quantity} onChange={(e) => patchItem(i, { quantity: Number(e.target.value) })} /></td>
                    <td className="py-1 px-1"><input className={`${field} w-20`} value={it.unitName} onChange={(e) => patchItem(i, { unitName: e.target.value })} /></td>
                    <td className="py-1 px-1"><input type="number" min={0} step="0.01" className={`${field} w-24`} value={it.unitNetPrice} onChange={(e) => patchItem(i, { unitNetPrice: Number(e.target.value) })} /></td>
                    <td className="py-1 px-1">
                      <select className={`${field} w-16`} value={it.taxRatePercent} onChange={(e) => patchItem(i, { taxRatePercent: Number(e.target.value) as TaxRatePercent })}>
                        <option value={19}>19</option>
                        <option value={7}>7</option>
                        <option value={0}>0</option>
                      </select>
                    </td>
                    <td className="py-1 px-1"><input type="number" min={0} max={100} className={`${field} w-16`} value={it.discountPercent ?? 0} onChange={(e) => patchItem(i, { discountPercent: Number(e.target.value) })} /></td>
                    <td className="py-1 pl-1 text-right">
                      <button type="button" aria-label={t('billing.removeItem', 'Position entfernen')} className="av-focus rounded px-1.5 text-av-text-faint hover:text-av-danger" onClick={() => removeItem(i)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Texte */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[11px] text-av-text-muted">
          {t('billing.introduction', 'Einleitungstext')}
          <textarea className={`${field} h-16 resize-none`} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-av-text-muted">
          {t('billing.remark', 'Schlusstext')}
          <textarea className={`${field} h-16 resize-none`} value={remark} onChange={(e) => setRemark(e.target.value)} />
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

      {/* Payload-Vorschau */}
      {payloadJson && (
        <details className="rounded-av-card border border-av-border bg-av-surface-1">
          <summary className="cursor-pointer px-3.5 py-2 text-[12px] font-medium text-av-text-secondary">{t('billing.preview', 'Lexware-Payload (Vorschau)')}</summary>
          <pre className="max-h-56 overflow-auto border-t border-av-border-muted px-3.5 py-2 text-[11px] leading-relaxed text-av-text-secondary">{payloadJson}</pre>
        </details>
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

      {/* Aktionen */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-av-text-faint">{t('billing.sendHint', 'Der Versand läuft über den geöffneten Signal-Planer (Cable), der den API-Key hält. Dort zuerst öffnen und den Key hinterlegen.')}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!canSend} className="av-focus rounded-av-control border border-av-border px-3 py-1.5 text-[12.5px] text-av-text-secondary hover:bg-av-surface-2 disabled:opacity-40" onClick={doCopy}>
            {copied ? t('billing.copied', 'JSON kopiert') : t('billing.copy', 'JSON kopieren')}
          </button>
          <button type="button" disabled={!canSend} className="av-focus rounded-av-control border border-av-border px-3 py-1.5 text-[12.5px] text-av-text-secondary hover:bg-av-surface-2 disabled:opacity-40" onClick={doExport}>
            {t('billing.export', 'JSON exportieren')}
          </button>
          <button type="button" disabled={!canSend || sending} className="av-focus rounded-av-control bg-av-accent px-3 py-1.5 text-[12.5px] font-medium text-av-accent-text disabled:opacity-40" onClick={doSend}>
            {sending ? t('billing.sending', 'Senden…') : t('billing.send', 'An Planer senden')}
          </button>
        </div>
      </div>
      {!canSendLexware() && <Badge tone="warn">{t('billing.needSignal', 'Signal-Planer öffnen, um zu senden (er hält den Lexware-Key).')}</Badge>}
    </div>
  )
}
