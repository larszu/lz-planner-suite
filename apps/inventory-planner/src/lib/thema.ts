// ───────────────────────────────────────────────────────────────────────────
// Hell oder dunkel — und wer es entscheidet.
//
// Drei Zustände und nicht zwei, und das ist der Punkt: `system` ist KEIN
// Synonym für „dunkel". Wer das Betriebssystem auf hell stellt, will die App
// hell — und eine App, die das ignoriert, weil sie nur `dark`/`light` kennt,
// hat die Angabe des Hauses überschrieben. Dieselbe Unterscheidung, die der
// Cable Planner in seinem Ansicht-Menü führt („Light theme" / „Follow system
// theme").
//
// Gespeichert wird nur die ENTSCHEIDUNG, nicht ihr Ergebnis: bei `system`
// steht `system` im Speicher und nicht das, was das System heute sagt. Sonst
// friert die erste Messung ein, und ein späterer Wechsel am Betriebssystem
// käme nie an.
// ───────────────────────────────────────────────────────────────────────────
export type Thema = 'system' | 'hell' | 'dunkel'

// Eigener Schluessel neben `STORAGE_KEYS` und nicht darin: das dort ist der
// BESTAND und was zu ihm gehoert. Eine Ansichts-Vorliebe gehoert dem Geraet,
// nicht dem Lager — sie wandert nicht in die portable Datei und hat in der
// Aufzaehlung des Bestands nichts verloren.
const SCHLUESSEL = 'inventory-planner:thema'

export const liesThema = (): Thema => {
  try {
    const v = localStorage.getItem(SCHLUESSEL)
    return v === 'hell' || v === 'dunkel' ? v : 'system'
  } catch {
    // Privates Fenster, gesperrte Seitendaten: kein Grund, die App
    // anzuhalten — die Vorgabe ist `system`, und die ist immer richtig.
    return 'system'
  }
}

export const setzeThema = (t: Thema): void => {
  try {
    localStorage.setItem(SCHLUESSEL, t)
  } catch {
    /* siehe oben */
  }
  wendeAn(t)
}

/** Schreibt die Entscheidung an den Wurzelknoten; das Stilblatt liest sie. */
export const wendeAn = (t: Thema): void => {
  const w = document.documentElement
  if (t === 'system') w.removeAttribute('data-thema')
  else w.setAttribute('data-thema', t)
}
