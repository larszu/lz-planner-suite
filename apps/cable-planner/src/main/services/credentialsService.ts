import keytar from 'keytar'

const SERVICE_NAME = 'cable-planner'
const ACCOUNT_NAME = 'rentman-api-token'
// Lexware-Office-API-Key im selben OS-Credential-Store, eigener Account.
const LEXWARE_ACCOUNT_NAME = 'lexware-api-key'

export const credentialsService = {
  async getToken(): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  },

  async saveToken(token: string): Promise<boolean> {
    // v7.9.121 — STRENGE Sanitization: keep ONLY printable ASCII
    // (0x21-0x7e). Strippt Zero-Width-Spaces, Bidi-Marks und alles
    // andere was meine v7.9.120-Regex (control chars + NBSP + BOM)
    // noch durchgelassen hat. Tokens sind base64/hex/JWT — alle ASCII.
    const clean = (token ?? '')
      .replace(/[^!-~]/g, '')
      .replace(/^Bearer\s*/i, '')
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, clean)
    return true
  },

  async deleteToken(): Promise<boolean> {
    return keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
  },

  // --- Lexware Office ---

  async getLexwareApiKey(): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, LEXWARE_ACCOUNT_NAME)
  },

  async saveLexwareApiKey(key: string): Promise<boolean> {
    // Gleiche strenge Sanitization wie beim Rentman-Token: nur druckbares
    // ASCII behalten, ein evtl. vorangestelltes 'Bearer ' entfernen.
    const clean = (key ?? '')
      .replace(/[^!-~]/g, '')
      .replace(/^Bearer\s*/i, '')
    await keytar.setPassword(SERVICE_NAME, LEXWARE_ACCOUNT_NAME, clean)
    return true
  },

  async deleteLexwareApiKey(): Promise<boolean> {
    return keytar.deletePassword(SERVICE_NAME, LEXWARE_ACCOUNT_NAME)
  },
}
