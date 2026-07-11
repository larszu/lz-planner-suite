/**
 * Läuft der Light Planner in einem iframe der Suite-Shell? Dann stellt die Shell
 * eine eigene Kopfleiste (App-Name, Speichern, Undo/Redo, Theme, Sprache) bereit
 * und wir blenden die redundante eigene Chrome aus. Im Standalone-Betrieb
 * (window.parent === window) ist alles unverändert.
 */
export const isEmbedded = (() => {
  try {
    return window.parent !== window;
  } catch {
    return false;
  }
})();
