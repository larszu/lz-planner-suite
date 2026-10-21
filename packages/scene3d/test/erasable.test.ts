import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

// Die Planer binden die Kopie mit erasableSyntaxOnly ein (cable-planner #1103).
describe('scene3d: nur loeschbare TS-Syntax', () => {
  it('kein Enum, keine Parameter-Property, kein Namespace', () => {
    const src = join(__dirname, '..', 'src')
    const dateien = readdirSync(src).filter((n) => n.endsWith('.ts')).map((n) => join(src, n))
    const prog = ts.createProgram(dateien, {
      erasableSyntaxOnly: true, noEmit: true, target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true,
    })
    const treffer = ts.getPreEmitDiagnostics(prog).filter((d) => d.code === 1294)
      .map((d) => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`)
    expect(treffer).toEqual([])
  }, 30_000)
})
