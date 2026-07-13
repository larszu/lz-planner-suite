import { describe, it, expect, vi } from 'vitest'
import { LexwareClient, LexwareError, type BillingDoc, type FetchLike } from '../src/index'

const doc: BillingDoc = {
  kind: 'invoice',
  taxType: 'net',
  voucherDate: '2026-07-11',
  contact: { name: 'Nordlicht Events' },
  lineItems: [{ name: 'Miete', quantity: 1, unitName: 'Pauschale', unitNetPrice: 500, taxRatePercent: 19 }],
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('LexwareClient', () => {
  it('braucht einen apiKey', () => {
    expect(() => new LexwareClient({ apiKey: '' })).toThrow()
  })

  it('POST /v1/invoices mit Bearer-Auth und Payload aus dem Mapping', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse({ id: 'inv-1', resourceUri: 'x' }, 201))
    const client = new LexwareClient({ apiKey: 'secret', fetchImpl })
    const res = await client.createInvoice(doc)
    expect(res.id).toBe('inv-1')
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.lexoffice.io/v1/invoices')
    expect(init?.method).toBe('POST')
    const headers = init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer secret')
    const sent = JSON.parse(init?.body as string)
    expect(sent.lineItems[0].unitPrice.netAmount).toBe(500)
    expect(sent.taxConditions.taxType).toBe('net')
  })

  it('createDocument dispatcht nach kind (Angebot)', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse({ id: 'q-1' }, 201))
    const client = new LexwareClient({ apiKey: 'k', fetchImpl })
    await client.createDocument({ ...doc, kind: 'quotation' })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.lexoffice.io/v1/quotations')
  })

  it('wirft LexwareError mit Meldung bei 4xx', async () => {
    // Frische Response je Aufruf (ein Response-Body ist nur einmal lesbar).
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockImplementation(async () => jsonResponse({ IssueList: [{ source: 'voucherDate', i18nKey: 'missing_field' }] }, 400))
    const client = new LexwareClient({ apiKey: 'k', fetchImpl })
    await expect(client.createInvoice(doc)).rejects.toBeInstanceOf(LexwareError)
    await expect(client.createInvoice(doc)).rejects.toThrow(/voucherDate/)
  })

  it('respektiert baseUrl-Override und ping()', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse({ organizationId: 'o1' }))
    const client = new LexwareClient({ apiKey: 'k', fetchImpl, baseUrl: 'https://proxy.local/' })
    const p = await client.ping()
    expect(p.organizationId).toBe('o1')
    expect(fetchImpl.mock.calls[0][0]).toBe('https://proxy.local/v1/profile')
  })

  it('webUrl baut Deep-Links', () => {
    expect(LexwareClient.webUrl('invoice', 'x')).toContain('/invoices/x')
    expect(LexwareClient.webUrl('quotation', 'y')).toContain('/quotations/y')
  })
})
