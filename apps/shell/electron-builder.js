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
