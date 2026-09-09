// ───────────────────────────────────────────────────────────────────────────
// Der Electron-Hauptprozess des Gebaeude-Werkzeugs — bewusst so klein wie
// moeglich.
//
// WARUM ES IHN GIBT. Das Werkzeug laeuft im Browser vollstaendig; die
// Desktop-Fassung existiert, weil ein Gebaeude im Haus aufgenommen wird und
// dort selten ein Browser mit der richtigen Adresse offensteht. Sie bringt
// deshalb KEINE zusaetzliche Faehigkeit mit: kein IPC, kein Datei-Zugriff,
// kein Preload. Was hier nicht steht, kann auch nicht auseinanderlaufen — ein
// zweiter Schreibweg neben dem Store waere genau die zweite Wahrheit, gegen
// die dieses Repo sonst prueft, und er ginge am Vertrag vorbei
// (`mangelMelden` darf einen Mangel ablehnen).
//
// DIE EINE TATSACHE, DIE MAN WISSEN MUSS: die Ablage ist `localStorage`, und
// Electron haelt die in seinem eigenen `userData`-Bereich. Desktop-Fassung und
// Browser-Fassung teilen ihre Gebaeude-Aufnahme also NICHT — es sind zwei
// Aufnahmen auf demselben Rechner. Das steht auch in der README; hier steht
// es, weil an dieser Datei jemand vorbeikommt, der es sonst annimmt.
//
// KEIN AUTO-UPDATER. Der cable-planner hat einen und muss deshalb
// `latest.yml`/`latest-mac.yml` an sein Release haengen. Hier gibt es keinen;
// die Release-Vollstaendigkeits-Pruefung in `release.yml` verlangt deshalb
// genau die Dateien, die wirklich gebaut werden, und keine Zeile mehr.
// ───────────────────────────────────────────────────────────────────────────
const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

let fenster

function fensterAnlegen() {
  fenster = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Facility Planner',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  // Im Entwicklungsbetrieb der Vite-Server, sonst der gebaute Ordner.
  // `base: './'` in vite.config.ts ist die Voraussetzung dafuer, dass das
  // Laden per `file://` ueberhaupt funktioniert — absolute Pfade zeigten von
  // dort aus auf die Wurzel der Festplatte.
  if (process.env.VITE_DEV_SERVER_URL) {
    fenster.loadURL(process.env.VITE_DEV_SERVER_URL)
    fenster.webContents.openDevTools()
  } else {
    fenster.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Externe Adressen gehen in den Systembrowser, nicht in ein zweites
  // Electron-Fenster ohne Adresszeile: dort saehe der Nutzer nicht, wo er ist.
  fenster.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  fenster.webContents.on('will-navigate', (e, url) => {
    if (url !== fenster.webContents.getURL()) e.preventDefault()
  })

  fenster.on('closed', () => {
    fenster = null
  })
}

app.whenReady().then(fensterAnlegen)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (fenster === null) fensterAnlegen()
})
