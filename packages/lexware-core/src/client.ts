/**
 * Schlanker Lexware-Office-REST-Client.
 *
 * `fetch` ist injizierbar (Default: globaler fetch), damit der Client sowohl im
 * Electron-Main (Node ≥ 18) läuft als auch in Tests mit einem Mock. Der API-Key
 * wird NUR im Speicher gehalten und als Bearer-Header gesendet — niemals
 * geloggt oder persistiert (das übernimmt aufrufseitig der keytar-Store).
 */
import type { BillingDoc, LxCreateResult } from './types.js'
import { buildInvoice, buildQuotation } from './map.js'

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface LexwareClientOptions {
  apiKey: string
  /** Default: 'https://api.lexoffice.io'. */
  baseUrl?: string
  /** Injizierbarer fetch (Default: globaler fetch). */
  fetchImpl?: FetchLike
}

export interface LexwareProfile {
  organizationId?: string
  companyName?: string
  [k: string]: unknown
}

export class LexwareError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'LexwareError'
  }
}

export class LexwareClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: FetchLike

  constructor(opts: LexwareClientOptions) {
    if (!opts.apiKey) throw new Error('LexwareClient: apiKey fehlt.')
    this.apiKey = opts.apiKey
    this.baseUrl = (opts.baseUrl ?? 'https://api.lexoffice.io').replace(/\/$/, '')
    const injected = opts.fetchImpl
    if (injected) {
      this.fetchImpl = injected
    } else if (typeof fetch === 'function') {
      this.fetchImpl = (input, init) => fetch(input, init)
    } else {
      throw new Error('LexwareClient: kein fetch verfügbar — bitte fetchImpl injizieren.')
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    const text = await res.text()
    const parsed = text ? safeJson(text) : undefined
    if (!res.ok) {
      const msg = extractMessage(parsed) ?? `Lexware-Anfrage fehlgeschlagen (${res.status})`
      throw new LexwareError(msg, res.status, parsed)
    }
    return parsed as T
  }

  /** Prüft den Key (GET /v1/profile). Wirft LexwareError bei 401. */
  ping(): Promise<LexwareProfile> {
    return this.request<LexwareProfile>('GET', '/v1/profile')
  }

  createQuotation(doc: BillingDoc): Promise<LxCreateResult> {
    return this.request<LxCreateResult>('POST', '/v1/quotations', buildQuotation(doc))
  }

  createInvoice(doc: BillingDoc): Promise<LxCreateResult> {
    return this.request<LxCreateResult>('POST', '/v1/invoices', buildInvoice(doc))
  }

  /** Legt Angebot oder Rechnung je nach doc.kind an. */
  createDocument(doc: BillingDoc): Promise<LxCreateResult> {
    return doc.kind === 'invoice' ? this.createInvoice(doc) : this.createQuotation(doc)
  }

  /** Deep-Link in die Lexware-Office-Web-UI für einen angelegten Beleg. */
  static webUrl(kind: BillingDoc['kind'], id: string): string {
    const seg = kind === 'invoice' ? 'invoices' : 'quotations'
    return `https://app.lexware.de/vouchers#!/${seg}/${id}`
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const b = body as Record<string, unknown>
  if (typeof b.message === 'string') return b.message
  // Lexware-Validierungsfehler: { IssueList: [{ i18nKey, source, type, ... }] }
  const issues = b.IssueList
  if (Array.isArray(issues) && issues.length) {
    const first = issues[0] as Record<string, unknown>
    const src = typeof first.source === 'string' ? `${first.source}: ` : ''
    const key = typeof first.i18nKey === 'string' ? first.i18nKey : JSON.stringify(first)
    return `${src}${key}`
  }
  return undefined
}
