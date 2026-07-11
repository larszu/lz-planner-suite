import { connectShellHistory } from '@avplan/ui/embed'
import { projectHistory } from '../store/projectHistory'

/**
 * Suite-Shell-Bridge: Undo/Redo der Shell an die projectHistory des Planers
 * durchreichen und den Zustand (canUndo/canRedo) hochmelden, damit die
 * Shell-Buttons live stimmen. No-op im Standalone-/Desktop-Betrieb.
 */
export function initShellHistory(): () => void {
  const conn = connectShellHistory({
    undo: () => projectHistory.undo(),
    redo: () => projectHistory.redo(),
    getState: () => ({ canUndo: projectHistory.canUndo(), canRedo: projectHistory.canRedo() }),
  })
  const unsubscribe = projectHistory.subscribe(() => conn.publish())
  return () => {
    unsubscribe()
    conn.dispose()
  }
}
