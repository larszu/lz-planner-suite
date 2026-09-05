// electron-builder-Konfiguration der AV Planner Suite.
//
// Verpackt das gebündelte Vite-Ergebnis (dist/), den Electron-Hauptprozess
// (electron/), die mitgelieferten Planer-Renderer (planners/) und die
// package.json.
//
// KORREKTUR 2026-09-05: hier stand „Es gibt bewusst KEINE Produktions-
// Dependencies … daher zieht electron-builder keine node_modules ins Paket".
// Das stimmt seit dem nativen Cable-Modus nicht mehr: `planners/signal-main/`
// ist Cables Main-Prozess, und der macht zur Laufzeit echte `require`s
// (keytar, atem-connection, ws, @avplan/lexware-core …). Die stehen deshalb in
// `apps/shell/package.json` unter `dependencies`, und electron-builder packt
// diesen Produktions-Baum sehr wohl mit ein.
//
// Der alte Satz war nicht bloß veraltet — er war die Begründung dafür, ein
// fehlendes Paket nicht zu vermuten. `npm run deps:check` prüft die Liste
// jetzt gegen die Quellen, statt sie hier zu behaupten.
//
// Kein eigenes App-Icon: ohne `icon` nutzt electron-builder das Standard-
// Electron-Icon, statt an einem fehlenden .icns/.ico abzubrechen.
const year = new Date().getFullYear()

export default {
  appId: 'net.avplanner.suite',
  productName: 'AV Planner Suite',
  copyright: `Copyright © ${year} Lars Zumpe`,
  // Publish-Provider MUSS gesetzt sein: electron-builder erzeugt fuer NSIS/DMG
  // die Update-Manifeste (latest*.yml) und liest dabei publish.provider. Ohne
  // diese Angabe versucht es, den Provider aus der Git-Config abzuleiten, findet
  // nichts und stirbt mit „Cannot read properties of null (reading 'provider')".
  // `--publish never` im Workflow verhindert weiterhin das eigentliche Hochladen
  // (die Installer haengt die release-Job via action-gh-release ans Release).
  publish: [{ provider: 'github', owner: 'larszu', repo: 'av-planner-suite', releaseType: 'release' }],
  files: ['dist/**/*', 'electron/**/*', 'planners/**/*', 'package.json'],
  // DIE VERPACKTE package.json DARF KEIN `type: module` TRAGEN.
  //
  // Gemessen an der ausgelieferten `v0.1.1`-App, die beim Start abstuerzt:
  //
  //   ReferenceError: exports is not defined in ES module scope
  //   ... app.asar/package.json contains "type": "module"
  //   at app.asar/index.js:5:23
  //
  // `index.js` ist nicht unser Code, sondern der Einsprung-Shim, den
  // `@electron/universal` bei `mergeASARs: false` erzeugt: er waehlt zur
  // Laufzeit zwischen `app-x64.asar` und `app-arm64.asar`. Der Shim ist
  // CommonJS (`exports`, `require`), wird als `index.js` abgelegt -- und
  // daneben legt @electron/universal eine KOPIE UNSERER package.json. Steht
  // dort `type: module`, parst Node den Shim als ESM und die App ist tot,
  // bevor eine Zeile eigener Code laeuft.
  //
  // `@electron/universal@3.x` behebt das (es schreibt dann `index.mjs`), ist
  // hier aber nicht zu haben: `app-builder-lib` pinnt 2.0.3 exakt, und ein
  // npm-`overrides` liesse sich nur mit einer vollstaendigen Neuaufloesung des
  // Lockfiles anwenden -- die scheitert in diesem Workspace an einem
  // npm-Bug (`Cannot read properties of null (reading 'edgesOut')`, npm
  // 10.9.7, reproduzierbar auch ohne den Override).
  //
  // `extraMetadata` aendert NUR die verpackte package.json, nicht die im
  // Repo: die Entwicklungs-Werkzeuge (eslint.config.js, postcss.config.js und
  // diese Datei sind ESM) bleiben unangetastet.
  //
  // Was dadurch ESM verliert, bekommt es zurueck: `copy-planners.mjs` legt
  // `planners/signal-main/package.json` mit `type: module` ab -- das ist der
  // einzige Node-geladene ESM-Code im Paket.
  extraMetadata: { type: 'commonjs' },
  // Die mitverpackten Planer-Renderer aus dem asar auspacken: der Hauptprozess
  // liefert sie via net.fetch('file://…') über die planner-*://-Protokolle aus,
  // und dynamische Imports/Worker der SPAs lesen zuverlässiger von echtem
  // Dateisystem als aus dem asar-Archiv. Native Module (keytar.node) MÜSSEN
  // ausgepackt sein — dlopen kann nicht aus dem asar-Archiv laden.
  asarUnpack: ['planners/**/*', '**/*.node', 'node_modules/keytar/**/*'],
  // npmRebuild bleibt Default true: keytar wird beim Packen gegen die Electron-
  // ABI (nicht Node) neu gebaut — sonst schlägt das Laden im nativen Cable-
  // Modus fehl (siehe cable-planner/electron-builder.js).
  directories: {
    output: 'release',
  },
  mac: {
    category: 'public.app-category.productivity',
    // Universal-Build (arm64 + x64 in einer .app): läuft auf Apple Silicon
    // nativ — kein Rosetta, keine „Intel-App"-Warnung auf neuen macOS-Versionen
    // — und weiterhin auf Intel-Macs. Ersetzt die getrennten x64-/arm64-DMGs
    // (ein Download, kein versehentlicher Intel-Build).
    target: [
      { target: 'dmg', arch: 'universal' },
    ],
    artifactName: '${productName}-${version}-${arch}.${ext}',
    // OHNE DIESE ZEILE GIBT ES KEIN macOS-ARTEFAKT. Gemessen an v0.1.0
    // (Lauf 33970319571, 2026-09-05): der Universal-Build bricht ab mit
    //   Detected file ".../@julusian/freetype2/prebuilds/
    //   freetype2-darwin-arm64/node-napi-v7.node" that's the same in both
    //   x64 and arm64 builds and not covered by the x64ArchFiles rule
    // und da `release` auf `needs: build` steht, wurde danach auch die
    // fertige Windows-.exe nie ans Release gehaengt: v0.1.0 blieb leer.
    //
    // WARUM. `@julusian/freetype2` baut nichts, es liefert fertige Binaries
    // aus -- ein Verzeichnis je Plattform+Arch unter `prebuilds/`, zur
    // Laufzeit ausgewaehlt von `pkg-prebuilds/bindings.js` ueber `os.arch()`.
    // Beide Teil-Builds tragen deshalb denselben vollstaendigen Baum, Byte
    // fuer Byte gleich. `@electron/universal` verlangt fuer eine in beiden
    // Builds identische Mach-O-Datei eine ausdrueckliche Ansage -- sonst
    // waere ein vergessenes Rebuild nicht von einer absichtlich geteilten
    // Datei zu unterscheiden -- und bricht sonst ab. `lipo` waere hier auch
    // falsch: die Auswahl passiert ueber den PFAD, nicht ueber eine
    // Fat-Binary.
    //
    // Der Name der Option ist irrefuehrend („x64ArchFiles"), ihre Wirkung ist
    // genau die richtige: „identisch ist in Ordnung, eine Kopie behalten".
    // Sie greift ausschliesslich im Gleichheitsfall -- unterscheiden sich die
    // beiden Dateien, laeuft weiterhin lipo. Das Muster deckt bewusst die
    // FORM ab (per Pfad benannte Prebuild-Verzeichnisse), nicht das eine
    // Paket. `npm run release:check` haelt das fest.
    x64ArchFiles: '**/prebuilds/*darwin*/**',
    // OHNE DIESE ZEILE BRICHT DER UNIVERSAL-BUILD EINE STUFE SPAETER AB.
    // Genau daran ist `v0.1.1` gestorben (Lauf 33974015212, 2026-09-05),
    // nachdem `x64ArchFiles` die erste Huerde geraeumt hatte:
    //
    //   ⨯ pattern is too long
    //     at assertValidPattern (@electron/asar/.../minimatch.js:281)
    //     at shouldUnpackPath   (@electron/asar/src/asar.ts:158)
    //     at mergeASARs         (@electron/universal/src/asar-utils.ts:216)
    //
    // WARUM. `mergeASARs` baut fuer die entpackten Dateien EIN einziges
    // Glob-Muster -- `{pfad1,pfad2,…}` mit absoluten Pfaden -- und reicht es
    // an minimatch, das bei 64 KiB abriegelt.
    //
    // Entpackt wird hier viel, und der groessere Teil steht nicht einmal in
    // `asarUnpack`: electron-builder nimmt bei einem nativen Modul das GANZE
    // Paketverzeichnis aus dem Archiv (`unpackDetector.detectUnpackedDirs` ->
    // `autoUnpackDirs.add(moduleRootPath)`). `@julusian/freetype2` bringt
    // seinen kompletten C++-Quellbaum mit: 553 Dateien. Dazu kommen die 157
    // Dateien aus `planners/**/*`, die hier wirklich auf der Platte liegen
    // MUESSEN -- `main.cjs` liefert die Planer-Renderer ueber
    // `net.fetch(pathToFileURL(...))` aus und `cableHost.cjs` laedt Cables
    // IPC-Module ueber `import(pathToFileURL(...))`; beides liest nicht aus
    // einem ASAR. Das Muster ist damit weit ueber der Grenze.
    //
    // Upstream ist das nicht behoben: auch `@electron/universal@3.0.6` baut
    // dieselbe Glob (asar-utils.ts:241).
    //
    // `mergeASARs: false` umgeht den Aufruf. Sind die beiden Teil-Archive
    // gleich -- und das sind sie hier, weil alles Arch-Spezifische entpackt
    // neben dem Archiv liegt --, bleibt es bei EINEM `app.asar` wie bisher;
    // unterscheiden sie sich, legt @electron/universal `app-x64.asar` und
    // `app-arm64.asar` mit einem kleinen Einsprung-Archiv an. Der lipo-Lauf
    // ueber die Mach-O-Dateien und `x64ArchFiles` laufen in beiden Faellen
    // vorher. `npm run release:check` rechnet die Laenge nach.
    mergeASARs: false,
    // Ad-hoc-Signatur ("-"), damit Gatekeeper auf Apple Silicon die Binary
    // strukturell akzeptiert (sonst „is damaged"). Kein bezahltes Apple-
    // Zertifikat nötig; beim ersten Start weiterhin Rechtsklick → Öffnen.
    identity: '-',
    hardenedRuntime: false,
    gatekeeperAssess: false,
  },
  win: {
    target: [
      { target: 'nsis', arch: 'x64' },
      { target: 'portable', arch: 'x64' },
    ],
    artifactName: '${productName}-${version}-${arch}.${ext}',
    // Kein Code-Signing: ohne CSC_LINK überspringt electron-builder signtool.
    // SmartScreen zeigt bis zu einem CA-Zertifikat „Unbekannter Herausgeber".
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: false,
  },
  // OHNE DIESEN BLOCK GIBT ES NUR EINE DER BEIDEN .exe. `win.artifactName`
  // gilt sonst fuer NSIS UND Portable, und beide schreiben nach
  // „AV Planner Suite-<version>-x64.exe". Im Lauf 33970319571 steht es
  // woertlich:
  //   • building  target=nsis     file=release\AV Planner Suite-0.1.0-x64.exe
  //   • building  target=portable file=release\AV Planner Suite-0.1.0-x64.exe
  // und `ls release/` zeigt danach EINE .exe -- der Portable-Build hat den
  // Installer ueberschrieben. Kein Fehler, keine Warnung: electron-builder
  // baut beide Ziele brav, das zweite legt sich auf das erste.
  portable: {
    artifactName: '${productName}-${version}-portable.${ext}',
  },
}
