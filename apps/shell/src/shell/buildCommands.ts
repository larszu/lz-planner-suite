import type { Command } from '@avplan/ui'
import { MODULES, type ModuleDef, type ModuleId } from '../modules/registry'
import { PROJECT } from '../data/project'
import { format, type TFunc } from '../i18n'

export interface CommandActions {
  goToModule: (id: ModuleId) => void
  setTab: (id: string) => void
  selectItem: (id: string) => void
  toggleTheme: () => void
  toggleMount: () => void
}

/** Übersetzter Modul-Titel (gemeinsamer config.mod.*-Namensraum). */
function modTitle(t: TFunc, m: ModuleDef): string {
  return t(`config.mod.${m.id}.title`, m.title)
}

/**
 * Baut die Command-Liste kontextabhängig: globale Modul-Sprünge, die Tabs des
 * aktiven Moduls (via `when` gescoped, damit keine fremden Aktionen auftauchen)
 * und schnelle Sprünge zu Elementen des aktuellen Moduls.
 */
export function buildCommands(active: ModuleDef, actions: CommandActions, t: TFunc): Command[] {
  const cmds: Command[] = []

  for (const mod of MODULES) {
    cmds.push({
      id: `go:${mod.id}`,
      title: format(t('config.cmd.open', '{title} öffnen'), { title: modTitle(t, mod) }),
      group: t('config.cmd.group.modules', 'Module'),
      keywords: [t(`config.mod.${mod.id}.label`, mod.label), mod.id],
      hint: mod.hotkey,
      run: () => actions.goToModule(mod.id),
    })
  }

  for (const tab of active.tabs) {
    const tabLabel = t(`config.mod.${active.id}.tab.${tab.id}`, tab.label)
    cmds.push({
      id: `tab:${active.id}:${tab.id}`,
      title: format(t('config.cmd.view', 'Ansicht: {label}'), { label: tabLabel }),
      group: modTitle(t, active),
      keywords: [tabLabel],
      when: (ctx) => ctx.moduleId === active.id,
      run: () => actions.setTab(tab.id),
    })
  }

  if (active.id === 'signal') {
    for (const c of PROJECT.cables) {
      cmds.push({
        id: `sel:${c.id}`,
        title: format(t('config.cmd.cable', 'Kabel {label}'), { label: c.label }),
        group: t('config.cmd.group.jump', 'Springen zu'),
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
        group: t('config.cmd.group.jump', 'Springen zu'),
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
        group: t('config.cmd.group.jump', 'Springen zu'),
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
      title: format(t('config.cmd.openInPlanner', '{title} im Planer öffnen'), { title: modTitle(t, active) }),
      group: t('config.cmd.group.actions', 'Aktionen'),
      keywords: ['bearbeiten', 'editor', active.planner],
      when: (ctx) => ctx.moduleId === active.id,
      run: () => actions.toggleMount(),
    })
  }

  cmds.push({
    id: 'theme',
    title: t('config.cmd.toggleTheme', 'Theme umschalten (Dark / Light)'),
    group: t('config.cmd.group.actions', 'Aktionen'),
    keywords: ['dark', 'light', 'hell', 'dunkel'],
    run: () => actions.toggleTheme(),
  })

  return cmds
}
