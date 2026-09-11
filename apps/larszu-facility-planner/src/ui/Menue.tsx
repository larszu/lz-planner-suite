// ───────────────────────────────────────────────────────────────────────────
// Ein Menü in der Kopfzeile — dieselbe Form wie im Cable Planner.
//
// NUTZER-AUFTRAG 2026-09-11: „Stelle sicher das in allen repos übergreifend
// das Einstellungen Menü an der gleichen Stelle ist wie im Cable planner und
// das die obere Menüleiste gleich aufgebaut ist."
//
// WARUM HIER EINE EIGENE FASSUNG UND KEIN GEMEINSAMES PAKET: dieses Repo
// läuft auch ALLEIN (eigene Web-Seite, eigene Electron-Fassung) und hängt an
// keinem Paket der Suite. Genau dieselbe Lage wie beim Cable Planner, dessen
// `index.css` es in eigenen Worten sagt: „Der Cable-Planner läuft auch ALLEIN
// als Electron-App und kann das Paket nicht laden; deshalb stehen die drei
// Klassen hier mit denselben Zahlen."
//
// Zusammengehalten wird die Form deshalb nicht vom Compiler, sondern von
// `scripts/chrome-parity.mjs` in der Suite: er misst in allen Apps dieselbe
// Kopfzeile — Klasse, 40 px, Menü-Reihenfolge, Einstellungen rechts aussen.
// Eine Abschrift ohne Wächter wäre die Defektform `zwei-rechnungen`; mit
// Wächter ist sie eine gemessene Zusage.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Beschriftung des Menüs — englisch, das ist die Quellsprache der Leiste. */
  label: string
  children: (schliessen: () => void) => ReactNode
}

export function Menue({ label, children }: Props) {
  const [offen, setOffen] = useState(false)
  const huelle = useRef<HTMLDivElement>(null)

  // Klick daneben schliesst. Ohne das bliebe das Menü stehen, sobald jemand
  // woanders hinklickt — und zwei offene Menüs übereinander sind unbedienbar.
  useEffect(() => {
    if (!offen) return
    const zu = (e: MouseEvent) => {
      if (!huelle.current?.contains(e.target as Node)) setOffen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOffen(false)
    }
    document.addEventListener('mousedown', zu)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', zu)
      document.removeEventListener('keydown', esc)
    }
  }, [offen])

  return (
    <div className="menue" ref={huelle}>
      <button
        type="button"
        className={offen ? 'menue-knopf offen' : 'menue-knopf'}
        aria-haspopup="menu"
        aria-expanded={offen}
        onClick={() => setOffen((o) => !o)}
      >
        {label}
      </button>
      {offen && (
        <div className="menue-klappe" role="menu">
          {children(() => setOffen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuePunkt({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button type="button" role="menuitem" className="menue-punkt" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function MenueTrenner() {
  return <div className="menue-trenner" role="separator" />
}
