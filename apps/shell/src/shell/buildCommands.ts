import type { Command } from '@avplan/ui'
import { MODULES, type ModuleDef, type ModuleId } from '../modules/registry'
import { PROJECT } from '../data/project'

export interface CommandActions {
  goToModule: (id: ModuleId) => void
  setTab: (id: string) => void
  selectItem: (id: string) => void
  toggleTheme: () => void
  toggleMount: () => void
}

/**
 * Baut die Command-Liste kontextabhängig: globale Modul-Sprünge, die Tabs des
 * aktiven Moduls (via `when` gescoped, damit keine fremden Aktionen auftauchen)
 * und schnelle Sprünge zu Elementen des aktuellen Moduls.
 */
export function buildCommands(active: ModuleDef, actions: CommandActions): Command[] {
  const cmds: Command[] = []

  for (const mod of MODULES) {
    cmds.push({
      id: `go:${mod.id}`,
      title: `${mod.title} öffnen`,
      group: 'Module',
      keywords: [mod.label, mod.id],
      hint: mod.hotkey,
      run: () => actions.goToModule(mod.id),
    })
  }

  for (const tab of active.tabs) {
    cmds.push({
      id: `tab:${active.id}:${tab.id}`,
      title: `Ansicht: ${tab.label}`,
      group: active.title,
      keywords: [tab.label],
      when: (ctx) => ctx.moduleId === active.id,
      run: () => actions.setTab(tab.id),
    })
  }

  if (active.id === 'signal') {
    for (const c of PROJECT.cables) {
      cmds.push({
        id: `sel:${c.id}`,
        title: `Kabel ${c.label}`,
        group: 'Springen zu',
        keywords: [c.type],
        hint: `${c.lengthM} m`,
        when: (ctx) => ctx.moduleId === 'signal',
        run: () => actions.selectItem(c.id),
      })
    }
  }
  if (active.id === 'cameras') {
    for (const cam of PROJECT.cameras) {
      cmds.push({
        id: `sel:${cam.id}`,
        title: `${cam.name} — ${cam.model}`,
        group: 'Springen zu',
        keywords: [cam.lens],
        hint: `${cam.focalMm} mm`,
        when: (ctx) => ctx.moduleId === 'cameras',
        run: () => actions.selectItem(cam.id),
      })
    }
  }
  if (active.id === 'licht') {
    for (const fx of PROJECT.fixtures) {
      cmds.push({
        id: `sel:${fx.id}`,
        title: `${fx.name} — ${fx.model}`,
        group: 'Springen zu',
        keywords: [fx.purpose],
        hint: `Ch ${fx.dmxChannel}`,
        when: (ctx) => ctx.moduleId === 'licht',
        run: () => actions.selectItem(fx.id),
      })
    }
  }

  if (active.planner) {
    cmds.push({
      id: 'mount',
      title: `${active.title} im Planer öffnen`,
      group: 'Aktionen',
      keywords: ['bearbeiten', 'editor', active.planner],
      when: (ctx) => ctx.moduleId === active.id,
      run: () => actions.toggleMount(),
    })
  }

  cmds.push({
    id: 'theme',
    title: 'Theme umschalten (Dark / Light)',
    group: 'Aktionen',
    keywords: ['dark', 'light', 'hell', 'dunkel'],
    run: () => actions.toggleTheme(),
  })

  return cmds
}
