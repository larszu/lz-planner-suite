/** EN-Overrides: App.tsx (Canvas-Overlays, Kontextmenüs, Hinweise) + Dialoge
 *  (ScheduleDialog, FixtureEditor, AboutDialog-Prosa). Keys: app.*, dlg.* */
export const app: Record<string, string> = {
  // Activity-log prefixes / element labels
  'app.log.undo': '↶ Undone',
  'app.log.redo': '↷ Redone',
  'app.log.projectLoaded': 'Project loaded:',
  'app.label.ceiling': 'Ceiling',
  'app.label.group': 'Group',
  'app.label.scene': 'Scene',

  // Default project names
  'app.defaultProject.name': 'Lighting plan',
  'app.defaultProject.new': 'New project',
  'app.defaultProject.generic': 'Project',

  // Confirms / alerts / errors
  'app.confirm.new': 'Create a new project? Unsaved changes to the current project will be lost.',
  'app.alert.saveFailed': 'Project could not be saved:',
  'app.alert.avplanImportFailed': '.avplan import failed:',
  'app.alert.venueImportFailed': 'Venue import failed:',
  'app.alert.floorPlanLoadFailed': 'Floor plan could not be loaded:',
  'app.alert.plotNeed2d': 'Lighting plot print: please run this in the 2D plan view.',
  'app.alert.projectFileLoadFailed': 'Project file could not be loaded:',
  'app.error.invalidFile': 'Not a valid project file.',
  'app.error.invalidFileKeys': 'Invalid project file (disallowed keys).',
  'app.error.invalidFileFixtures': 'Not a valid project file (fixtures missing).',
  'app.error.invalidFileMeta': 'Not a valid project file (meta missing).',

  // Canvas overlays / hints
  'app.loading3d': 'Loading 3D view…',
  'app.hint.place.pre': 'Click on the plan to place ',
  'app.hint.place.post': ' · press ESC to cancel',
  'app.hint.wall.title': 'Wall path',
  'app.hint.wall.mid': ': click points one after another · click the start point to close the room · ',
  'app.hint.wall.angle': ' = 15° angle · double-click/',
  'app.hint.wall.end': ' to finish',
  'app.hint.stagepoly.title': 'Stage (polygon)',
  'app.hint.stagepoly.mid': ': click the corner points · click the start point or double-click/',
  'app.hint.stagepoly.close': ' closes the area · ',
  'app.hint.stagepoly.end': ' to cancel',
  'app.hint.camera.title': 'Camera',
  'app.hint.camera.body': ': click to place a camera · then set the aim & field of view and “Look through camera”',
  'app.hint.calibrate.pre': 'Drag a line along a ',
  'app.hint.calibrate.strong': 'known distance',
  'app.hint.calibrate.post': ' (e.g. a wall) · press ESC to cancel',
  'app.hint.move': 'Drag the floor plan to align it · press ESC to finish',

  // Inventory launcher
  'app.inventory.title': 'Storage / inventory',
  'app.inventory.label': 'Storage',

  // ── CanvasActions (B-23, light#62) ──

  'canvas.align': 'Align',
  'canvas.alignX': 'Align horizontally (X)',
  'canvas.alignY': 'Align vertically (Y)',
  'canvas.alignZ': 'To the same height (Z)',
  'canvas.distH': 'Distribute horizontally',
  'canvas.distV': 'Distribute vertically',
  'canvas.group': 'Group',
  'canvas.ungroup': 'Ungroup',
  'canvas.rotateMinus': 'Rotate −15°',
  'canvas.rotatePlus': 'Rotate +15°',
  'canvas.autoLight': 'Auto light',
  'canvas.threePoint': '3-point',
  'canvas.threePointHint': 'Three-point lighting for the selection',
  'canvas.threePointConfig': 'Configure three-point…',
  'canvas.area': 'Area',
  'canvas.areaHint': 'Light the area evenly',
  'canvas.ceiling': 'Ceiling',
  'canvas.ceilingHint': 'Build a ceiling from the walls',
};
