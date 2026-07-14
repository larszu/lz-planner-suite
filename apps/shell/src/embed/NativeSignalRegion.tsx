import { useEffect, useRef } from 'react'

/**
 * Platzhalter-Region für den nativen Cable-Planer (experimentell).
 *
 * Im nativen Modus (window.__suiteNativeHost vorhanden) läuft der *echte*
 * Cable-Planer nicht als iframe, sondern als WebContentsView im Suite-Fenster
 * — die kann DOM-Elemente nicht überlagern lassen, sondern wird vom Main per
 * Pixel-Bounds positioniert. Dieses Element belegt den Platz im Layout und
 * meldet seine Bildschirm-Bounds an den Host; der legt die View passgenau
 * darüber. Beim Unmount (Modulwechsel) wird die View versteckt.
 *
 * Die Bounds werden über eine requestAnimationFrame-Schleife nachgeführt, weil
 * sich die Position der Region auch ohne Größenänderung verschiebt (Panels auf/
 * zu, Scroll) — ein ResizeObserver allein würde das verpassen.
 */
interface NativeHost {
  cable: {
    show: (b: { x: number; y: number; width: number; height: number }) => void
    setBounds: (b: { x: number; y: number; width: number; height: number }) => void
    hide: () => void
  }
}

function host(): NativeHost | undefined {
  return (window as unknown as { __suiteNativeHost?: NativeHost }).__suiteNativeHost
}

/** Ist der native Cable-Host verfügbar? (Renderer-Seite.) */
export function hasNativeCable(): boolean {
  return !!host()
}

export function NativeSignalRegion() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = host()
    const el = ref.current
    if (!h || !el) return

    let raf = 0
    let last = { x: -1, y: -1, width: -1, height: -1 }
    const measure = (): { x: number; y: number; width: number; height: number } => {
      const r = el.getBoundingClientRect()
      return {
        x: Math.round(r.left),
        y: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
      }
    }
    const changed = (b: typeof last) =>
      b.x !== last.x || b.y !== last.y || b.width !== last.width || b.height !== last.height

    // Erstmal anzeigen, dann kontinuierlich nachführen.
    last = measure()
    h.cable.show(last)

    const tick = () => {
      const b = measure()
      if (changed(b)) {
        last = b
        h.cable.setBounds(b)
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf)
      h.cable.hide()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-surface-3"
      aria-label="Cable Planner (nativ)"
    />
  )
}
