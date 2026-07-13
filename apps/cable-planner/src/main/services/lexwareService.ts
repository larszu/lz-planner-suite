import { LexwareClient, LexwareError, type BillingDoc } from '@avplan/lexware-core'
import { credentialsService } from './credentialsService.js'

/**
 * Duenner Service um den geteilten @avplan/lexware-core-Client. Liest den
 * API-Key ausschliesslich aus dem OS-Credential-Store (keytar) und gibt ihn
 * niemals weiter/loggt ihn. In Node >= 18 nutzt der Client den globalen fetch,
 * daher kein fetchImpl noetig.
 */

const getClient = async (): Promise<LexwareClient> => {
  const apiKey = await credentialsService.getLexwareApiKey()
  if (!apiKey) {
    throw new Error('Kein Lexware-API-Key hinterlegt.')
  }
  return new LexwareClient({ apiKey })
}

export const lexwareService = {
  async createDocument(doc: BillingDoc): Promise<{ id: string; webUrl?: string }> {
    const client = await getClient()
    try {
      const res = await client.createDocument(doc)
      return { id: res.id, webUrl: LexwareClient.webUrl(doc.kind, res.id) }
    } catch (error) {
      if (error instanceof LexwareError) {
        throw new Error(error.message, { cause: error })
      }
      throw error
    }
  },

  async ping(): Promise<{ ok: boolean; error?: string }> {
    try {
      const client = await getClient()
      await client.ping()
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lexware-Ping fehlgeschlagen.'
      return { ok: false, error: message }
    }
  },

  async setApiKey(key: string): Promise<boolean> {
    if (!key?.trim()) {
      throw new Error('Lexware-API-Key ist erforderlich.')
    }
    return credentialsService.saveLexwareApiKey(key)
  },

  async getApiKeyPresent(): Promise<boolean> {
    const apiKey = await credentialsService.getLexwareApiKey()
    return !!apiKey
  },
}
