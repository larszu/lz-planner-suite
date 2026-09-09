// Preload der AV Planner Suite.
//
// Reicht der Renderer-Shell die Paket-URLs der drei mitverpackten Planer-
// Renderer durch. Der Hauptprozess liefert diese über die privilegierten
// planner-*://-Protokolle aus dem Paketverzeichnis aus (siehe main.cjs). Die
// Registry der Shell liest window.__suitePlanners und bettet dann die *echten*
// Planer statt einer Vorschau ein. Fehlt das Objekt (Browser/Dev), fällt die
// Shell auf die VITE_PLANNER_*-Dev-URLs zuruck.
const { contextBridge, ipcRenderer } = require('electron')

// Diese Liste und `PLANNERS` in main.cjs muessen dieselben Schluessel tragen.
// Fehlt einer hier, faellt die Shell fuer dieses Modul auf die Dev-Adresse
// zurueck und laedt im gepackten Build ins Leere; fehlt er dort, antwortet
// das Protokoll nicht. `suite-smoke.mjs` prueft beide Richtungen, indem es
// JEDE hier genannte Adresse wirklich abruft.
contextBridge.exposeInMainWorld('__suitePlanners', {
  signal: 'planner-signal://app/index.html',
  cameras: 'planner-cameras://app/index.html',
  licht: 'planner-licht://app/index.html',
  lager: 'planner-lager://app/index.html',
  gebaeude: 'planner-gebaeude://app/index.html',
})

// Nativer Cable-Modus (experimentell): ist er im Hauptprozess aktiv, bekommt
// der Renderer eine Steuer-API für die WebContentsView (Position/Sichtbarkeit
// des echten Cable-Planers im Signal-Feld). Fehlt sie, nutzt der Renderer den
// iframe-Pfad. sendSync ist hier ok — einmalig beim Preload-Start.
let nativeCable = false
try {
  nativeCable = ipcRenderer.sendSync('suiteHost:cable:available') === true
} catch {
  nativeCable = false
}

// Der Weg zum tally-pi steht IMMER bereit, nicht nur im nativen Cable-Modus:
// die Tally-Karte kommt ueber den postMessage-Bus aus dem eingebetteten
// Planer, und der laeuft in beiden Betriebsarten. Waere die Bruecke an
// `nativeCable` gebunden, funktionierte der Knopf ausgerechnet in der
// ausgelieferten Standard-Einstellung nicht.
contextBridge.exposeInMainWorld('__suiteTally', {
  read: (basisUrl) => ipcRenderer.invoke('suiteHost:tally:read', basisUrl),
  write: (basisUrl, devices) => ipcRenderer.invoke('suiteHost:tally:write', basisUrl, devices),
})

// Projekte als Dateien (B-39.3). Wie der Tally-Weg an keine Betriebsart
// gebunden: die Frage "wo liegt meine Show" stellt sich in beiden.
contextBridge.exposeInMainWorld('__suiteProjectFiles', {
  save: (args) => ipcRenderer.invoke('suiteHost:project:save', args),
  open: () => ipcRenderer.invoke('suiteHost:project:open'),
})

// Lexware als eigene Shell-Domaene (E-12). AN KEINE BETRIEBSART GEBUNDEN, und
// das ist der ganze Punkt: der alte Weg lief ueber den eingebetteten Planer
// und war dadurch in JEDER ausgelieferten Konfiguration durchtrennt (B-19).
// Hier haengt er an nichts ausser dem Hauptprozess.
//
// Der API-Key geht NIE durch diese Bruecke nach draussen. `hatKey` meldet die
// Tatsache, `setzeKey` nimmt einen entgegen -- gelesen wird er nur in main.
contextBridge.exposeInMainWorld('__suiteLexware', {
  ping: () => ipcRenderer.invoke('suiteHost:lexware:ping'),
  createDocument: (doc) => ipcRenderer.invoke('suiteHost:lexware:create', doc),
  setzeKey: (key) => ipcRenderer.invoke('suiteHost:lexware:setKey', key),
  loescheKey: () => ipcRenderer.invoke('suiteHost:lexware:deleteKey'),
  hatKey: () => ipcRenderer.invoke('suiteHost:lexware:hasKey'),
})

if (nativeCable) {
  contextBridge.exposeInMainWorld('__suiteNativeHost', {
    cable: {
      show: (bounds) => ipcRenderer.invoke('suiteHost:cable:show', bounds),
      setBounds: (bounds) => ipcRenderer.invoke('suiteHost:cable:setBounds', bounds),
      hide: () => ipcRenderer.invoke('suiteHost:cable:hide'),
    },
  })
}
