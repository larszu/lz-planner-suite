import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // Der Bestands-Store schreibt in `localStorage`. Statt jsdom mitzuschleppen
    // legt `setup.ts` einen Ersatz hin — er ist zwanzig Zeilen, und ein ganzer
    // DOM waere hier ein Umweg fuer `getItem`/`setItem`.
    setupFiles: ['./src/domain/__tests__/setup.ts'],
  },
})
