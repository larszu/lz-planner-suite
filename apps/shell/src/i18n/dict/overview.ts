/** EN-Overrides: OverviewSurface + dashboard cards. Keys: overview.* */
export const overview: Record<string, string> = {
  // Header
  'overview.header.eyebrow': 'Project overview',
  'overview.header.meta': '{venue} · {date} · Version {version}',
  'overview.header.progress': '{n}% planned',

  // Gewerke-Karten (ModuleCards)
  'overview.stat.cables': '{n} cables',
  'overview.stat.cablesSub': '1 open end',
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

  // Editier-Karten (Dashboard bearbeitbar)
  'overview.card.edit': 'Edit',
  'overview.card.empty': 'Nothing added yet.',
  'overview.card.tasks.toggle': 'Toggle task “{title}”',

  // Departments
  'overview.dept.all': 'All',
  'overview.dept.video': 'Video',
  'overview.dept.light': 'Light',
  'overview.dept.audio': 'Audio',
  'overview.dept.prod': 'Production',

  // Editor-Hülle
  'overview.editor.save': 'Save',
  'overview.editor.cancel': 'Cancel',
  'overview.editor.moveUp': 'Move up',
  'overview.editor.moveDown': 'Move down',

  // Tagesablauf
  'overview.editor.schedule.title': 'Edit run of show',
  'overview.editor.schedule.time': 'Time',
  'overview.editor.schedule.name': 'Item',
  'overview.editor.schedule.namePh': 'Programme item',
  'overview.editor.schedule.dept': 'Department',
  'overview.editor.schedule.add': 'Add item',
  'overview.editor.schedule.remove': 'Remove item',

  // Aufgaben
  'overview.editor.tasks.title': 'Edit tasks',
  'overview.editor.tasks.done': 'Done',
  'overview.editor.tasks.name': 'Task',
  'overview.editor.tasks.namePh': 'Task',
  'overview.editor.tasks.owner': 'Owner',
  'overview.editor.tasks.ownerPh': 'Who?',
  'overview.editor.tasks.due': 'Due',
  'overview.editor.tasks.duePh': 'When?',
  'overview.editor.tasks.add': 'Add task',
  'overview.editor.tasks.remove': 'Remove task',

  // Crew
  'overview.editor.crew.title': 'Edit crew',
  'overview.editor.crew.name': 'Name',
  'overview.editor.crew.namePh': 'Name',
  'overview.editor.crew.role': 'Role',
  'overview.editor.crew.rolePh': 'Role',
  'overview.editor.crew.dept': 'Department',
  'overview.editor.crew.call': 'Call time',
  'overview.editor.crew.status': 'Status',
  'overview.editor.crew.confirmed': 'confirmed',
  'overview.editor.crew.pending': 'pending',
  'overview.editor.crew.add': 'Add person',
  'overview.editor.crew.remove': 'Remove person',

  // Budget
  'overview.editor.budget.title': 'Edit budget',
  'overview.editor.budget.category': 'Category',
  'overview.editor.budget.categoryPh': 'Category',
  'overview.editor.budget.estimated': 'Planned €',
  'overview.editor.budget.actual': 'Actual €',
  'overview.editor.budget.add': 'Add category',
  'overview.editor.budget.remove': 'Remove line',

  // Logistik
  'overview.editor.logistics.title': 'Edit logistics',
  'overview.editor.logistics.distance': 'Travel (km)',
  'overview.editor.logistics.vehicles': 'Vehicles',
  'overview.editor.logistics.vehicle': 'Vehicle',
  'overview.editor.logistics.vehiclePh': 'e.g. 7.5 t truck',
  'overview.editor.logistics.detail': 'Load',
  'overview.editor.logistics.detailPh': 'Load / purpose',
  'overview.editor.logistics.add': 'Add vehicle',
  'overview.editor.logistics.remove': 'Remove vehicle',

  // Kontakte
  'overview.editor.contacts.title': 'Edit contacts',
  'overview.editor.contacts.name': 'Name',
  'overview.editor.contacts.namePh': 'Name / company',
  'overview.editor.contacts.role': 'Role',
  'overview.editor.contacts.rolePh': 'Role',
  'overview.editor.contacts.org': 'Organisation',
  'overview.editor.contacts.orgPh': 'Area / company',
  'overview.editor.contacts.phone': 'Phone',
  'overview.editor.contacts.add': 'Add contact',
  'overview.editor.contacts.remove': 'Remove contact',
  'overview.editor.contacts.billTo': 'Invoice recipient (customer)',
  'overview.editor.contacts.billToHint': 'used as the customer on documents (Lexware)',
  'overview.editor.contacts.email': 'Email',
  'overview.editor.contacts.emailPh': 'Email (for sending documents)',
  'overview.editor.contacts.street': 'Street',
  'overview.editor.contacts.streetPh': 'Street & no.',
  'overview.editor.contacts.zip': 'ZIP',
  'overview.editor.contacts.city': 'City',
  'overview.editor.contacts.vatId': 'VAT ID',
  'overview.editor.contacts.customerNumber': 'Cust. no.',

  // Projekt-Kopf
  'overview.editor.header.title': 'Edit project',
  'overview.editor.header.name': 'Project name',
  'overview.editor.header.venue': 'Location',
  'overview.editor.header.date': 'Date',
  'overview.editor.header.phase': 'Phase',
  'overview.editor.header.progress': 'Progress (%)',
  'overview.phase.planning': 'Planning',
  'overview.phase.setup': 'Setup',
  'overview.phase.show': 'Show',
  'overview.phase.teardown': 'Teardown',
}
