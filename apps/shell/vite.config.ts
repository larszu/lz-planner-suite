import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative Asset-Pfade: im gepackten Electron-Build wird index.html über
  // file:// geladen — absolute Pfade (/assets/…, Vite-Default) zeigen dort auf
  // die Dateisystem-Wurzel und laufen ins Leere (schwarzes Fenster). './'
  // funktioniert sowohl über file:// als auch beim Serven an der Root.
  base: './',
  plugins: [react()],
  server: { port: 5180 },
  preview: { port: 5180 },
})
