// ───────────────────────────────────────────────────────────────────────────
// Wo die vier Laufzeit-Anwendungen im Netz stehen.
//
// Adresse statt Bundle: siehe `modules/runtimes.ts`. Die Vorgaben sind die
// dokumentierten Ports der Repos; Host und Port sind pro Geraet aenderbar,
// weil ein Pi im Produktionsnetz weder `localhost` noch immer denselben Namen
// hat.
//
// Gespeichert wird im `localStorage` der Shell — dieselbe Ablage wie fuer die
// Projekte. Das ist eine BEDIENUNGS-Einstellung, kein Projektinhalt: dieselbe
// Show an einem anderen Standort trifft andere Adressen, und umgekehrt soll
// ein Projektwechsel die Verkabelung des Arbeitsplatzes nicht umstellen.
// ───────────────────────────────────────────────────────────────────────────
import { RUNTIMES, RUNTIME_BY_ID, type RuntimeId } from '../modules/runtimes'

const KEY = 'avplan.runtimeHosts'

export interface RuntimeAddress {
  host: string
  port: number
}

export type RuntimeAddresses = Record<RuntimeId, RuntimeAddress>

export function defaultAddresses(): RuntimeAddresses {
  return RUNTIMES.reduce((acc, r) => {
    acc[r.id] = { host: r.defaultHost, port: r.defaultPort }
    return acc
  }, {} as RuntimeAddresses)
}

/** Einen einzelnen Eintrag pruefen — was nicht passt, faellt auf die Vorgabe zurueck. */
function heile(id: RuntimeId, roh: unknown): RuntimeAddress {
  const vorgabe = { host: RUNTIME_BY_ID[id].defaultHost, port: RUNTIME_BY_ID[id].defaultPort }
  if (!roh || typeof roh !== 'object') return vorgabe
  const a = roh as Partial<RuntimeAddress>
  const host = typeof a.host === 'string' && a.host.trim() ? a.host.trim() : vorgabe.host
  const port = Number.isInteger(a.port) && (a.port as number) > 0 && (a.port as number) < 65536 ? (a.port as number) : vorgabe.port
  return { host, port }
}

export function loadAddresses(): RuntimeAddresses {
  try {
    const roh = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Record<string, unknown> | null
    if (!roh) return defaultAddresses()
    return RUNTIMES.reduce((acc, r) => {
      acc[r.id] = heile(r.id, roh[r.id])
      return acc
    }, {} as RuntimeAddresses)
  } catch {
    return defaultAddresses()
  }
}

export function saveAddresses(a: RuntimeAddresses): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch {
    /* privater Modus / voller Speicher — die Adressen gelten dann fuer diese Sitzung */
  }
}

/** Die URL, unter der die Oberflaeche dieses Geraets steht. */
export function runtimeUrl(id: RuntimeId, adressen: RuntimeAddresses): string {
  const def = RUNTIME_BY_ID[id]
  const { host, port } = adressen[id] ?? { host: def.defaultHost, port: def.defaultPort }
  const pfad = def.path.startsWith('/') ? def.path : `/${def.path}`
  return `http://${host}:${port}${pfad}`
}
