import { describe, expect, it } from 'vitest'
import {
  APP_MODULE_IDS,
  APP_SETTINGS_DEFAULTS,
  APP_SETTINGS_SCHEMA,
} from '../src/shell/appSettings'

describe('appSettings', () => {
  it('jeder Schema-Control hat einen passenden Default (kein Drift)', () => {
    for (const id of APP_MODULE_IDS) {
      const defaults = APP_SETTINGS_DEFAULTS[id]
      for (const ctrl of APP_SETTINGS_SCHEMA[id].controls) {
        expect(defaults, `${id}.${ctrl.key} fehlt in Defaults`).toHaveProperty(ctrl.key)
      }
    }
  })

  it('Defaults enthalten keine Schlüssel ohne Control', () => {
    for (const id of APP_MODULE_IDS) {
      const controlKeys = new Set(APP_SETTINGS_SCHEMA[id].controls.map((c) => c.key))
      for (const key of Object.keys(APP_SETTINGS_DEFAULTS[id])) {
        expect(controlKeys.has(key), `${id}.${key} ohne Control`).toBe(true)
      }
    }
  })

  it('segmented/select-Defaults sind gültige Optionen', () => {
    for (const id of APP_MODULE_IDS) {
      for (const ctrl of APP_SETTINGS_SCHEMA[id].controls) {
        if (ctrl.kind !== 'segmented' && ctrl.kind !== 'select') continue
        const values = (ctrl.options ?? []).map((o) => o.value)
        expect(values).toContain(APP_SETTINGS_DEFAULTS[id][ctrl.key])
      }
    }
  })

  it('slider-Defaults liegen im Wertebereich', () => {
    for (const id of APP_MODULE_IDS) {
      for (const ctrl of APP_SETTINGS_SCHEMA[id].controls) {
        if (ctrl.kind !== 'slider') continue
        const v = Number(APP_SETTINGS_DEFAULTS[id][ctrl.key])
        expect(v).toBeGreaterThanOrEqual(ctrl.min ?? -Infinity)
        expect(v).toBeLessThanOrEqual(ctrl.max ?? Infinity)
      }
    }
  })
})
