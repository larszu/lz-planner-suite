// ───────────────────────────────────────────────────────────────────────────
// Der Wächter zum einen Weg, auf dem der Plan ins Lager schreibt.
//
// `seedAusBedarf` ist die Stelle, an der die Repo-Grenze verläuft. Sie hat
// drei Zusagen, und jede davon ist einmal eine falsche Annahme gewesen:
//
//   1. Die Menge wird ANGEHOBEN, nie gesenkt. Der Bestand ist gezählt, der
//      Bedarf gerechnet.
//   2. Zugeordnet wird über die Katalog-Id, wo es sie gibt — sonst über Name
//      und Kategorie. Die Reihenfolge ist der Unterschied zwischen einer
//      Angabe und einer Vermutung (ADR-002).
//   3. Was der Plan nicht sagt, wird nicht erfunden.
// ───────────────────────────────────────────────────────────────────────────
import { beforeEach, describe, expect, it } from 'vitest'
import { useInventoryStore } from '../store/inventoryStore'
import type { BedarfsZeile } from '../types/bedarf'

const leeren = () => {
  localStorage.clear()
  useInventoryStore.setState({ items: [], nodes: [], sets: [], units: [] })
}

const zeile = (t: Partial<BedarfsZeile> & { key: string; label: string }): BedarfsZeile => ({
  quantity: 1,
  ...t,
})

describe('seedAusBedarf', () => {
  beforeEach(leeren)

  it('legt für jede unbekannte Zeile eine Lagerposition an', () => {
    const n = useInventoryStore.getState().seedAusBedarf([
      zeile({ key: 'a', label: 'URSA Broadcast', category: 'Kamera', quantity: 3 }),
      zeile({ key: 'b', label: 'ATEM 4 M/E', category: 'Mischer' }),
    ])
    expect(n).toBe(2)
    const items = useInventoryStore.getState().items
    expect(items.map((i) => i.model).sort()).toEqual(['ATEM 4 M/E', 'URSA Broadcast'])
    expect(items.find((i) => i.model === 'URSA Broadcast')?.quantity).toBe(3)
  })

  it('hebt eine vorhandene Menge an, aber senkt sie nie', () => {
    const store = useInventoryStore.getState()
    store.addItem({ model: 'URSA Broadcast', category: 'Kamera', quantity: 5 })

    useInventoryStore.getState().seedAusBedarf([
      zeile({ key: 'a', label: 'URSA Broadcast', category: 'Kamera', quantity: 2 }),
    ])
    expect(useInventoryStore.getState().items[0].quantity).toBe(5)

    useInventoryStore.getState().seedAusBedarf([
      zeile({ key: 'a', label: 'URSA Broadcast', category: 'Kamera', quantity: 8 }),
    ])
    expect(useInventoryStore.getState().items[0].quantity).toBe(8)
  })

  it('ordnet über die Katalog-Id zu, auch wenn der Name abweicht', () => {
    useInventoryStore.getState().addItem({
      model: 'URSA Broadcast G2',
      quantity: 1,
      deviceTypeId: 'typ-ursa',
    })
    const n = useInventoryStore.getState().seedAusBedarf([
      zeile({ key: 'x', label: 'Ganz anderer Name', deviceTypeId: 'typ-ursa', quantity: 4 }),
    ])
    expect(n).toBe(0)
    const items = useInventoryStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(4)
    // Der Name des Lagers bleibt stehen — der Plan benennt Instanzen, das
    // Lager Modelle.
    expect(items[0].model).toBe('URSA Broadcast G2')
  })

  it('trägt eine fehlende Katalog-Id an einer bekannten Position nach', () => {
    useInventoryStore.getState().addItem({ model: 'Shure ULXD', quantity: 2 })
    useInventoryStore.getState().seedAusBedarf([
      zeile({ key: 'y', label: 'Shure ULXD', deviceTypeId: 'typ-ulxd' }),
    ])
    expect(useInventoryStore.getState().items[0].deviceTypeId).toBe('typ-ulxd')
  })

  it('übernimmt die Muster-Angaben — und erfindet keine', () => {
    useInventoryStore.getState().seedAusBedarf([
      zeile({
        key: 'm',
        label: 'Mit Angaben',
        muster: { supplier: 'Verleih Nord', ownership: 'subhire', rentPricePerDay: 4500 },
      }),
      zeile({ key: 'o', label: 'Ohne Angaben' }),
    ])
    const items = useInventoryStore.getState().items
    const mit = items.find((i) => i.model === 'Mit Angaben')!
    const ohne = items.find((i) => i.model === 'Ohne Angaben')!
    expect(mit.supplier).toBe('Verleih Nord')
    expect(mit.ownership).toBe('subhire')
    expect(mit.rentPricePerDay).toBe(4500)
    expect(ohne.supplier).toBeUndefined()
    expect(ohne.ownership).toBeUndefined()
    expect(ohne.rentPricePerDay).toBeUndefined()
  })

  it('ein leerer Bedarf ändert nichts', () => {
    useInventoryStore.getState().addItem({ model: 'Bleibt', quantity: 7 })
    expect(useInventoryStore.getState().seedAusBedarf([])).toBe(0)
    expect(useInventoryStore.getState().items).toHaveLength(1)
    expect(useInventoryStore.getState().items[0].quantity).toBe(7)
  })
})
