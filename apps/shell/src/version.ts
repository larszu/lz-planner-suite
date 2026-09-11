// Die Version der Shell — aus `package.json`, ueber das Vite-Define in
// `vite.config.ts`. Der Fallback ist fuer Umgebungen ohne dieses Define
// (Tests, `tsc` ohne Vite); er ist bewusst `0.0.0` und nicht die echte Zahl:
// eine hier hingeschriebene Version waere die zweite Stelle, an der sie
// steht, und die erste, die veraltet.
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'
