// Erkennt, ob Cable Planner in der Suite-Shell (iframe) eingebettet läuft.
// Gleiche Erkennung wie in main.tsx: ein abweichender window.parent bedeutet
// iframe. In seltenen Cross-Origin-Fällen kann der Zugriff werfen — dann als
// "nicht eingebettet" (Standalone/Desktop) behandeln.
export const isEmbedded = (() => {
  try {
    return window.parent !== window
  } catch {
    return false
  }
})()
