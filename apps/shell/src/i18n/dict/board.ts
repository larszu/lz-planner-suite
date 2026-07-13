/** EN-Overrides: BoardCanvas. Keys: board.* */
export const board: Record<string, string> = {
  // Card type labels
  'board.type.heading': 'Heading',
  'board.type.note': 'Note',
  'board.type.link': 'Link',
  'board.type.todo': 'To-do',
  'board.type.color': 'Color',
  'board.type.look': 'Look',
  'board.type.column': 'Column',
  'board.type.board': 'Sub-board',
  'board.type.image': 'Image',

  // Templates
  'board.tpl.moodboard': 'Moodboard',
  'board.tpl.brief': 'Creative brief',
  'board.tpl.storyboard': 'Storyboard',

  // Titles & new-card defaults
  'board.title': 'Creative board',
  'board.default.note': 'New note…',
  'board.default.link': 'New link',
  'board.default.todoItem': 'Item 1',

  // Toolbar
  'board.toolbar.add': 'Add',
  'board.add.item': 'Add {label}',
  'board.toolbar.photo': 'Photo',
  'board.toolbar.photoImport': 'Import photo',
  'board.search.placeholder': 'Search board…',
  'board.search.aria': 'Search board',
  'board.menu.template': 'Template',
  'board.menu.export': 'Export',
  'board.export.markdown': 'As Markdown',
  'board.export.pdf': 'As PDF (print)',

  // Breadcrumb & empty states
  'board.crumb.back': 'One level up',
  'board.empty.subboard': 'Empty sub-board',
  'board.empty.board': 'Empty board',
  'board.empty.hint': 'Add cards above or apply a template.',

  // Print document
  'board.print.look': 'Look: {title}',
  'board.print.subboardTitle': '{title} (sub-board)',
  'board.photoAlt': 'Photo',

  // Card controls
  'board.swatch': 'Color {color}',
  'board.column.delete': 'Delete column',
  'board.column.deleteConfirm': 'Permanently delete column with its contents?',
  'board.cancel': 'Cancel',
  'board.card.delete': 'Delete card',
  'board.connect': 'Draw connection',
  'board.resize': 'Drag to resize',
  'board.subboard.title': 'Sub-board title',
  'board.card.one': 'card',
  'board.card.many': 'cards',
  'board.open': 'Open',
  'board.todo.done': 'Done',
  'board.todo.open': 'Open',
}
