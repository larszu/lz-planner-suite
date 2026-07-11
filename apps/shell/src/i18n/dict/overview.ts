/** EN-Overrides: OverviewSurface + dashboard cards. Keys: overview.* */
export const overview: Record<string, string> = {
  // Header
  'overview.header.eyebrow': 'Project overview',
  'overview.header.meta': '{venue} · {date} · Version {version}',
  'overview.header.progress': '{n}% planned',

  // Gewerke-Karten (ModuleCards)
  'overview.stat.cables': '{n} cables',
  'overview.stat.cablesSub': '{m} m · 1 open end',
  'overview.stat.cameras': '{n} cameras',
  'overview.stat.camerasSub': '4 lenses · coverage ok',
  'overview.stat.fixtures': '{n} fixtures',
  'overview.stat.fixturesSub': '3.4 kW · DMX ok',

  // Suite-Plan-Check
  'overview.plancheck.title': 'Suite plan check',
  'overview.plancheck.signal': 'Signal ↔ cameras consistent',
  'overview.plancheck.dmx': 'DMX patch collision-free',
  'overview.plancheck.power': 'Power load within limit',
  'overview.plancheck.cam4': 'CAM 4 not cabled',

  // Customize menu
  'overview.customize.button': 'Customize dashboard',
  'overview.customize.aria': 'Customize dashboard',
  'overview.customize.groupAria': 'Dashboard elements',
  'overview.customize.sections': 'Sections',
  'overview.customize.cards': 'Cards (reorderable)',
  'overview.customize.reset': 'Restore defaults',
  'overview.customize.moveUp': '{label} up',
  'overview.customize.moveDown': '{label} down',

  // Widget labels
  'overview.widget.gewerke': 'Department cards',
  'overview.widget.plancheck': 'Suite plan check',
  'overview.widget.runofshow': 'Run of show',
  'overview.widget.crew': 'Crew',
  'overview.widget.budget': 'Budget',
  'overview.widget.readiness': 'Equipment readiness',
  'overview.widget.tasks': 'Tasks',
  'overview.widget.logistics': 'Logistics',
  'overview.widget.contacts': 'Contacts',

  // Empty state
  'overview.empty.title': 'No project assigned',
  'overview.empty.desc':
    'Create a project to see schedule, crew, budget and readiness in one place — or use any module directly and standalone, without a project.',
  'overview.empty.assign': 'Create new project',
  'overview.empty.openModule': 'Open module directly',
  'overview.empty.standalone': 'usable standalone',

  // Nothing visible
  'overview.hidden.before': 'All elements hidden. Show them again via ',
  'overview.hidden.link': '“Customize dashboard”',
  'overview.hidden.after': '.',

  // Shared badge
  'overview.badge.open': '{n} open',

  // Cards
  'overview.card.runofshow.title': 'Run of show',
  'overview.card.runofshow.points': '{n} items',
  'overview.card.crew.title': 'Crew',
  'overview.card.crew.complete': 'complete',
  'overview.card.budget.title': 'Budget',
  'overview.card.budget.of': 'of',
  'overview.card.budget.over': '{amount} over plan',
  'overview.card.budget.under': '{amount} under plan',
  'overview.card.readiness.title': 'Equipment readiness',
  'overview.card.readiness.packed': '{n}% packed',
  'overview.card.readiness.ofPre': 'of ',
  'overview.card.readiness.ofPost': ' items packed',
  'overview.card.readiness.cases': '{n} cases',
  'overview.card.readiness.source': 'Warehouse data from @avplan/inventory-core',
  'overview.card.logistics.title': 'Logistics',
  'overview.card.logistics.loadIn': 'Load-in',
  'overview.card.logistics.distance': 'Travel',
  'overview.card.contacts.title': 'Contacts',
  'overview.card.tasks.title': 'Tasks',
}
