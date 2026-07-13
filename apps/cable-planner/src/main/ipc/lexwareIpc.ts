import { ipcMain } from 'electron'
import type { BillingDoc } from '@avplan/lexware-core'
import { lexwareService } from '../services/lexwareService.js'

/**
 * IPC-Domaene 'lexware:*' — Bruecke zwischen Renderer/Shell und dem
 * Lexware-Office-Client im Main-Prozess. Der API-Key bleibt in main (keytar),
 * der Renderer sieht ihn nie.
 */
export const registerLexwareIpc = () => {
  ipcMain.handle('lexware:create-document', async (_event, doc: BillingDoc) => {
    return lexwareService.createDocument(doc)
  })

  ipcMain.handle('lexware:ping', async () => {
    return lexwareService.ping()
  })

  ipcMain.handle('lexware:set-api-key', async (_event, key: string) => {
    return lexwareService.setApiKey(key)
  })

  ipcMain.handle('lexware:has-api-key', async () => {
    return lexwareService.getApiKeyPresent()
  })
}
