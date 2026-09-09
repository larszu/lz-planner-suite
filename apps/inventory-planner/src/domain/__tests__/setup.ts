// Ein `localStorage`-Ersatz fuer die Tests der Stores.
//
// Er wirft NICHT bei vollem Speicher — die Tests hier pruefen die Domaene und
// nicht die Fehlerbehandlung des Browsers. Wer die prueft, legt einen eigenen
// Ersatz hin, der wirft; das ist genau der Fall, den `light-planner`s
// `storage:check` gefunden hat (ein leeres `catch` verschluckte den
// Quota-Fehler, und der Import meldete Erfolg).
const speicher = new Map<string, string>()

const ersatz = {
  getItem: (k: string) => speicher.get(k) ?? null,
  setItem: (k: string, v: string) => void speicher.set(k, v),
  removeItem: (k: string) => void speicher.delete(k),
  clear: () => speicher.clear(),
  key: (i: number) => [...speicher.keys()][i] ?? null,
  get length() {
    return speicher.size
  },
}

Object.defineProperty(globalThis, 'localStorage', { value: ersatz, configurable: true })
