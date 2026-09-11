import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// Die Version lebt NUR in package.json (Konvention der Suite) und kommt von
// hier in den Quelltext. Eine zweite Stelle waere eine, die beim naechsten
// Versionssprung vergessen wird.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

export default defineConfig({
  // Relative Asset-Pfade: im gepackten Electron-Build wird index.html über
  // file:// geladen — absolute Pfade (/assets/…, Vite-Default) zeigen dort auf
  // die Dateisystem-Wurzel und laufen ins Leere (schwarzes Fenster). './'
  // funktioniert sowohl über file:// als auch beim Serven an der Root.
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5180 },
  preview: { port: 5180 },
})
