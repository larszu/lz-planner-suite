// electron-builder-Konfiguration der AV Planner Suite.
//
// Verpackt ausschließlich das gebündelte Vite-Ergebnis (dist/) plus den
// Electron-Hauptprozess (electron/) und die package.json. Es gibt bewusst
// KEINE Produktions-Dependencies (alle Libs landen via Vite gebündelt in
// dist/), daher zieht electron-builder keine node_modules ins Paket — das
// vermeidet die Symlink-Fallstricke der npm-Workspaces.
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
    target: [
      { target: 'dmg', arch: 'x64' },
      { target: 'dmg', arch: 'arm64' },
    ],
    artifactName: '${productName}-${version}-${arch}.${ext}',
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
}
