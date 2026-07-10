/**
 * Gemeinsames Styling der Onboarding-Dialoge — als injizierter <style>-Block
 * mit `avob-`-Klassen, damit Hover-/Focus-Zustaende ohne App-CSS funktionieren
 * und das Erscheinungsbild in allen drei Apps identisch ist. Farben laufen
 * ueber CSS-Variablen; `data-avob-theme` schaltet dark/light (Cable Planner
 * reicht sein Canvas-Theme durch), `--avob-accent` traegt die App-Farbe.
 */
export const AVOB_CSS = `
.avob-overlay {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  background: rgba(2, 6, 16, 0.6);
  -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
}
.avob-card {
  --avob-surface: #151b28; --avob-surface-2: #1c2434; --avob-surface-3: #232d40;
  --avob-border: #2b364c; --avob-border-muted: #222c40;
  --avob-text: #e8edf7; --avob-text-2: #9aa8c0; --avob-text-3: #67758e;
  box-sizing: border-box;
  width: 480px; max-width: 92vw; max-height: 86vh; overflow: auto;
  border: 1px solid var(--avob-border); border-radius: 12px;
  background: var(--avob-surface); color: var(--avob-text);
  box-shadow: 0 24px 64px -24px rgba(0, 0, 0, 0.7);
  font-size: 14px; line-height: 1.5;
}
.avob-card[data-avob-theme="light"] {
  --avob-surface: #ffffff; --avob-surface-2: #f3f5f9; --avob-surface-3: #e9edf4;
  --avob-border: #d4dbe7; --avob-border-muted: #e2e7f0;
  --avob-text: #1a2233; --avob-text-2: #4d5b74; --avob-text-3: #8a96ab;
  box-shadow: 0 24px 64px -28px rgba(23, 32, 47, 0.45);
}
.avob-card * { box-sizing: border-box; }
.avob-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--avob-border-muted);
}
.avob-title { flex: 1; margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
.avob-eyebrow {
  flex: 1; font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--avob-text-3);
}
.avob-x {
  border: 0; background: none; padding: 4px; border-radius: 6px; cursor: pointer;
  color: var(--avob-text-3); font-size: 15px; line-height: 1;
}
.avob-x:hover { color: var(--avob-text); background: var(--avob-surface-3); }
.avob-body { padding: 16px; }
.avob-intro { margin: 0 0 12px; font-size: 12.5px; color: var(--avob-text-2); }
.avob-actions { display: flex; flex-direction: column; gap: 8px; }
.avob-action {
  display: flex; align-items: flex-start; gap: 12px; width: 100%;
  padding: 11px 13px; text-align: left; cursor: pointer;
  border: 1px solid var(--avob-border); border-radius: 9px;
  background: var(--avob-surface-2); color: var(--avob-text);
  font: inherit; transition: border-color 120ms ease, background 120ms ease;
}
.avob-action:hover, .avob-action:focus-visible {
  border-color: var(--avob-action-accent, var(--avob-accent, #3b82f6));
  background: var(--avob-surface-3);
}
.avob-action-icon {
  flex: none; margin-top: 1px; display: inline-flex;
  color: var(--avob-action-accent, var(--avob-accent, #3b82f6));
}
.avob-action-title { display: block; font-weight: 600; font-size: 14px; }
.avob-action-desc { display: block; margin-top: 1px; font-size: 11.5px; color: var(--avob-text-2); }
.avob-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 16px; border-top: 1px solid var(--avob-border-muted);
}
.avob-ghost {
  border: 0; background: none; padding: 4px 6px; cursor: pointer; font: inherit;
  font-size: 12px; color: var(--avob-text-3); border-radius: 6px;
}
.avob-ghost:hover, .avob-ghost:focus-visible { color: var(--avob-text-2); }
.avob-btn {
  border: 0; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 600;
  padding: 6px 14px; border-radius: 7px;
  background: var(--avob-surface-3); color: var(--avob-text);
}
.avob-btn:hover:not(:disabled) { filter: brightness(1.12); }
.avob-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.avob-btn.avob-primary { background: var(--avob-accent, #3b82f6); color: #fff; }
.avob-tour-title { margin: 0 0 8px; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
.avob-tour-body { margin: 0; color: var(--avob-text-2); }
.avob-hint {
  margin-top: 12px; padding: 6px 9px; font-size: 11.5px; color: var(--avob-text-3);
  border: 1px solid var(--avob-border-muted); border-radius: 7px;
  background: var(--avob-surface-2);
}
.avob-dots { display: flex; align-items: center; gap: 4px; }
.avob-dot { height: 5px; width: 16px; border-radius: 999px; background: var(--avob-surface-3); }
.avob-dot.is-active { background: var(--avob-accent, #3b82f6); }
.avob-dot.is-done { background: var(--avob-accent, #3b82f6); opacity: 0.45; }
.avob-nav { display: flex; align-items: center; gap: 8px; }
.avob-x:focus-visible, .avob-action:focus-visible, .avob-ghost:focus-visible, .avob-btn:focus-visible {
  outline: 2px solid var(--avob-accent, #3b82f6); outline-offset: 1px;
}
@media (prefers-reduced-motion: reduce) {
  .avob-action { transition: none; }
}
`

/**
 * Jeder Dialog rendert sein eigenes <style>-Element (identischer Inhalt,
 * Duplikate sind harmlos). Bewusst KEIN einmal-injizieren-Flag: beim Wechsel
 * Welcome → Tour im selben React-Commit wuerde das alte <style> mit dem
 * schliessenden Dialog entfernt, waehrend der Guard die Neu-Injektion
 * verhindert — der neue Dialog stuende ohne CSS da.
 */
export const AvobStyles = () => <style>{AVOB_CSS}</style>
