/**
 * EN-Overrides: der Querverweis in den eingebetteten Planer (E-11). Keys: shell.reveal.*
 *
 * Vier Saetze, und alle vier sagen dasselbe aus einer anderen Lage: der Sprung
 * ist angekommen, der Planer kennt das Objekt nicht, es war gar kein Planer
 * da, den man haette fragen koennen, oder er ist zugeklappt. Ein stummer
 * Sprung sieht aus wie ein gelungener — deshalb hat jede Lage ihren eigenen
 * Satz.
 */
export const querverweis: Record<string, string> = {
  'shell.reveal.noFrame': 'The planner is not ready yet — the object could not be shown there.',
  'shell.reveal.notFound': 'The planner does not know this object.',
  'shell.reveal.notFoundReason': 'Not found in the planner: {grund}',
  'shell.reveal.plannerClosed': 'The planner is collapsed — the object is selected in the preview.',
}
