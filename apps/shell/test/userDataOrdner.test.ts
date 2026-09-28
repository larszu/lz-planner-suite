import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Der productName heisst seit der Umbenennung „LZ Planner Suite"; Electron
// wuerde userData danach in einen neuen, leeren Ordner legen.
const main = readFileSync(new URL('../electron/main.cjs', import.meta.url), 'utf8')

describe('userData bleibt im alten Ordner', () => {
  it('setzt userData in der gepackten App auf „AV Planner Suite"', () => {
    expect(main).toMatch(/const USER_DATA_ORDNER = 'AV Planner Suite'/)
    expect(main).toMatch(/if \(app\.isPackaged\) app\.setPath\('userData', path\.join\(app\.getPath\('appData'\), USER_DATA_ORDNER\)\)/)
  })

  it('bevor ein eigenes Modul geladen wird', () => {
    const pin = main.indexOf("app.setPath('userData'")
    const ersterEigenerRequire = main.search(/require\('\.\//)
    expect(pin).toBeGreaterThan(-1)
    expect(pin).toBeLessThan(ersterEigenerRequire)
  })
})
