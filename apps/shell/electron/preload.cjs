// Preload der AV Planner Suite.
//
// Reicht der Renderer-Shell die Paket-URLs der drei mitverpackten Planer-
// Renderer durch. Der Hauptprozess liefert diese über die privilegierten
// planner-*://-Protokolle aus dem Paketverzeichnis aus (siehe main.cjs). Die
// Registry der Shell liest window.__suitePlanners und bettet dann die *echten*
// Planer statt einer Vorschau ein. Fehlt das Objekt (Browser/Dev), fällt die
// Shell auf die VITE_PLANNER_*-Dev-URLs zuruck.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('__suitePlanners', {
  signal: 'planner-signal://app/index.html',
  cameras: 'planner-cameras://app/index.html',
  licht: 'planner-licht://app/index.html',
})
