import { describe, expect, it, vi } from 'vitest'
import { onPlannerCommand, sendPlannerCommand } from '../src/embed/plannerBridge'

describe('plannerBridge command bus', () => {
  it('liefert Kommandos an aktive Listener', () => {
    const seen: string[] = []
    const off = onPlannerCommand((c) => seen.push(c))
    sendPlannerCommand('undo')
    sendPlannerCommand('redo')
    expect(seen).toEqual(['undo', 'redo'])
    off()
  })

  it('nach dem Abmelden kommt nichts mehr an', () => {
    const cb = vi.fn()
    const off = onPlannerCommand(cb)
    off()
    sendPlannerCommand('undo')
    expect(cb).not.toHaveBeenCalled()
  })
})
