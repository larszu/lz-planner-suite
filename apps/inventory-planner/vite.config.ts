import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  plugins: [react()],
  base: './',
  // Fester Port, wie bei den drei Planern (B-17): die Suite sucht ihre
  // eingebetteten Werkzeuge an einer festgelegten Adresse. 4181 = Kabel,
  // 4182 = MultiCam, 4183 = Licht; das Lager bekommt die naechste freie.
  //
  // `strictPort`, damit ein besetzter Port ABBRICHT statt still weiterzuruecken.
  // Genau das stille Weiterruecken war der Defekt aus B-17 — die Shell zeigte
  // dann „nicht erreichbar", und der Fehler sah aus wie einer der Shell.
  server: { port: 4184, strictPort: true },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
})
