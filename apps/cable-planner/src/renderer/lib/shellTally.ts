// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): die Tally-Karte auf Anfrage der Shell.
//
// Der Cable-Planer leitet die Karte seit `feat(tally)` aus dem Plan ab
// (`lib/tallyMap.ts`: Rollen, Mischer-Eingaenge, Router im Weg) und konnte sie
// bisher nur als DATEI ausgeben, die jemand von Hand auf den Pi kopiert.
//
// Hier antwortet er stattdessen der Shell, die die Adresse des Pi kennt und
// den Rest uebernimmt. Der Planer schickt genau das, was ihm gehoert -- die
// Quellenliste (id/name/input). ATEM-Adresse und GPIO-Verdrahtung gehoeren dem
// Pi und werden bewusst NICHT mitgeschickt; `merge_tally_config` drueben
// behaelt jedes Feld, das im Post fehlt.
//
// Die Befunde der Karte gehen mit: eine Rolle ohne Mischer-Eingang faellt aus
// der Liste (sie hat nichts, worauf sie hoeren koennte). Das darf nicht still
// passieren -- die Shell zeigt es vor dem Senden an.
// ───────────────────────────────────────────────────────────────────────────
import { connectShellTally } from '@avplan/ui/embed'
import { useProjectStore } from '../store/projectStore'
import { buildTallyMap, toTallyPiDevices } from './tallyMap'

export function initShellTally(): () => void {
  return connectShellTally(() => {
    const project = useProjectStore.getState().project
    const map = buildTallyMap(project)
    return {
      devices: toTallyPiDevices(map),
      issues: map.issues.map((i) => ({ kind: i.kind, message: i.message })),
    }
  })
}
