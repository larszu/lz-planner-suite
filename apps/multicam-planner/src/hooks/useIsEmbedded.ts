/**
 * Läuft dieser Planer in der Suite-Shell (iframe) oder standalone?
 * Die Shell stellt eine eigene Top-Leiste (App-Name, Save/Open, Undo/Redo,
 * Theme, Settings) bereit — im eingebetteten Betrieb blenden wir die dort
 * doppelten Bedienelemente aus. Reiner Modul-Konstant-Wert, keine Hook noetig.
 */
export const isEmbedded = (() => {
  try {
    return window.parent !== window;
  } catch {
    return false;
  }
})();
