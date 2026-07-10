import type { ReactNode } from 'react'

export interface Command {
  id: string
  title: string
  /** Gruppen-Überschrift in der Palette (leere Gruppen werden ausgeblendet). */
  group: string
  /** Zusätzliche Suchbegriffe (Synonyme, Kürzel), nicht sichtbar. */
  keywords?: string[]
  /** Kurzer rechtsbündiger Hinweis (z. B. Hotkey oder Zielmodul). */
  hint?: string
  icon?: ReactNode
  /**
   * Sichtbarkeitsfilter — z. B. nur im aktiven Modul. Fehlt er, ist der
   * Befehl überall verfügbar. (Scoping-Empfehlung: keine Aktionen zeigen,
   * die im aktuellen Kontext sinnlos sind.)
   */
  when?: (ctx: CommandContext) => boolean
  run: () => void
}

export interface CommandContext {
  moduleId: string
}

/** Subsequence-Match: "sfl" trifft "Signal-Flow". Score = Kompaktheit + früher Start. */
export function fuzzyScore(query: string, target: string): number | null {
  if (query.length === 0) return 0
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let ti = 0
  let firstIndex = -1
  let lastIndex = -1
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]
    let found = -1
    for (; ti < t.length; ti++) {
      if (t[ti] === ch) {
        found = ti
        break
      }
    }
    if (found === -1) return null
    if (firstIndex === -1) firstIndex = found
    lastIndex = found
    ti = found + 1
  }
  const span = lastIndex - firstIndex + 1
  // Weniger Streuung + früherer Start = besserer (höherer) Score.
  return 1000 - span * 4 - firstIndex
}

/** Bester Score über Titel + Keywords; null wenn nichts matcht. */
export function scoreCommand(query: string, command: Command): number | null {
  const haystacks = [command.title, ...(command.keywords ?? [])]
  let best: number | null = null
  for (const h of haystacks) {
    const s = fuzzyScore(query, h)
    if (s !== null && (best === null || s > best)) best = s
  }
  return best
}

export interface RankedGroup {
  group: string
  items: Command[]
}

/**
 * Filtert nach Kontext (`when`) und Query, sortiert nach Score und gruppiert
 * unter Beibehaltung der ersten Auftrittsreihenfolge der Gruppen.
 */
export function rankCommands(
  commands: Command[],
  query: string,
  ctx: CommandContext,
): RankedGroup[] {
  const scored: { cmd: Command; score: number }[] = []
  for (const cmd of commands) {
    if (cmd.when && !cmd.when(ctx)) continue
    const score = scoreCommand(query, cmd)
    if (score === null) continue
    scored.push({ cmd, score })
  }
  scored.sort((a, b) => b.score - a.score)

  const order: string[] = []
  const byGroup = new Map<string, Command[]>()
  for (const { cmd } of scored) {
    if (!byGroup.has(cmd.group)) {
      byGroup.set(cmd.group, [])
      order.push(cmd.group)
    }
    byGroup.get(cmd.group)!.push(cmd)
  }
  return order.map((group) => ({ group, items: byGroup.get(group)! }))
}

/** Flache Liste in Anzeigereihenfolge — für Pfeiltasten-Navigation. */
export function flattenGroups(groups: RankedGroup[]): Command[] {
  return groups.flatMap((g) => g.items)
}
