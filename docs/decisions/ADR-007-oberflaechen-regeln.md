# ADR-007 — Die Oberflaechen-Regeln der Suite

**Status:** angenommen · 2026-09-07 · geändert 2026-10-13
**Gilt fuer:** alle zehn Repos (av-planner-suite, cable-planner,
multicam-planner, light-planner, inventory-planner, larszu-facility-planner,
Broadcast-intercom, tally-pi, sony-camera-bridge, pi-media-station)
**Erweitert:** 2026-09-11 um `inventory-planner` und `larszu-facility-planner`
— siehe Stufe 6 unten
**Quelle der Werte:** Logo, Palette, Schrift und Claim aus dem Brand Guide 2.0
der Lars Zumpe Medienproduktion (September 2026); Flaechen, Form, Tiefe,
Bewegung und Hell/Dunkel nach dem Design-Vertrag Oktober 2026 (Skill
`lzm-web`)
**Maschinenlesbar:** `packages/ui/src/brand.ts` · `packages/ui/src/styles.css`
**Gehalten von:** `packages/ui/test/brand.test.ts`

---

## Der Anlass

> „die ui ist nicht konsistent. lege globale ui regeln fest die für alle repos
> die im av planner suite zusammenlaufen gelten, damit es einheitlich ist.
> schriftgrößen, tasten, standort des menüs, etc. lass sich auch von meinem CI
> inspirieren"
> — 2026-09-07

> „mein lzm design und web skill führen zu nicht modernen UI Designs … mein
> logo ist mir schon noch wichtig, aber modernes einfachers UI ist mir
> wichtig"
>
> „muss nicht zwingend blau sein. blau nur als akzent"
>
> „es muss immer dark und light mode geben und nen bisschen was modernens"
> — 2026-10-13

Vier Werkzeuge, vier Farbwelten: Tailwinds `slate`, ein eigenes Near-Black,
`#0f1117`, dazu Modul-Akzente quer durch das Farbrad. Jede App fuer sich
stimmig — zusammen nicht eine Anwendung. Und es gab **keine Instanz, die
haette widersprechen koennen**: jede App hatte ihre eigene Token-Datei.
Regeln, die nur in einem Dokument stehen, driften.

---

## Die Entscheidung

**Eine Quelle, drei Fassungen, ein Test dazwischen.**

| Fassung | Datei | Wofuer |
|---|---|---|
| Werte | `packages/ui/src/brand.ts` | fuer Code, der keine CSS-Variablen lesen kann: Canvas, Print, SVG-Export, Konva — `paletteFor(theme)` liefert Hell oder Dunkel |
| Laufzeit | `packages/ui/src/styles.css` | fuer alles, was im DOM gerendert wird |
| Begruendung | dieses ADR | fuer den, der in einem Jahr eine Ausnahme erwaegt |

`packages/ui/test/brand.test.ts` prueft, dass die drei dasselbe sagen — in
beiden Modi. Er prueft nicht, ob die Werte huebsch sind; er prueft, dass es
nur **eine** Antwort gibt.

### Was sich am 13.10.2026 geändert hat

Die erste Fassung uebertrug die Print-Regeln des Handbuchs woertlich auf die
Oberflaeche: Navy-Flaechen, kein Radius, kein Schatten, Kopflinie an jedem
Panel, roter Punkt am Primaerknopf. Das Ergebnis war markentreu und wirkte
alt. Seither gilt: **die Marke steckt im Logo, im blauen Akzent und im Ton**
— Flaechen sind neutral, Formen weich, Hell und Dunkel gleichwertig. Logo,
Palette, Schrift, Signal-Regel, Rahmen und Menueort sind geblieben.

---

## 1. Farbe — neutral traegt, Blau akzentuiert, Rot ist das Signal

| Rolle | Hell | Dunkel | Token |
|---|---|---|---|
| Grund | `#FAFAF8` | `#1E1F23` | `--av-bg` |
| Flaeche (Panels, Karten) | `#FFFFFF` | `#28292E` | `--av-surface-1` |
| Flaeche 2 (Felder, Toolbars, Hover) | `#F1F1EE` | `#33343A` | `--av-surface-2` |
| Versenkt (Rail, Statusleiste) | `#F4F4F1` | `#19191D` | `--av-surface-3` |
| Erhoben (Menues, Popover, Dialog) | `#FFFFFF` | `#3B3C42` | `--av-surface-4` |
| Text stark | `#16181D` | `#F6F5F0` | `--av-text` |
| Text | `#2B2E35` | `#E6E6E3` | `--av-text-secondary` |
| Text gedaempft | `#6A6E77` | `#A9ACB4` | `--av-text-muted` |
| Linie | `rgba(22,24,29,.08)` | `rgba(246,245,240,.09)` | `--av-border` |
| Linie stark | `rgba(22,24,29,.18)` | `rgba(246,245,240,.20)` | `--av-border-strong` |
| **Akzent** | `#1D324F` Zumpe Navy | `#B9C7D8` helles Markenblau | `--av-accent` |
| Text auf Akzent | `#F6F5F0` | `#132040` | `--av-accent-text` |
| Akzent weich | Akzent 10 % | Akzent 12 % | `--av-accent-dim` |
| Logo | `#1D324F` | `#F6F5F0` | `--av-logo` (Punkt: `--av-logo-dot`) |
| **Signal** | `#D6402E` | `#D6402E` | `--av-signal` |
| Status | `#2F7D5C` · `#C8892B` · `#B04A3F` | gleich | `--av-ok` · `--av-warn` · `--av-danger` |
| Schein | `rgba(29,50,79,.10)` / `rgba(200,137,43,.10)` | `rgba(185,199,216,.16)` / gleich | `--av-glow-1` / `-2` |

- **Flaechen sind neutral.** Dunkel heisst Anthrazit — nicht Schwarz, nicht
  Navy; jede Ebene sichtbar heller als die darunter.
- **Blau ist Akzent**, hoechstens ein Zehntel der Flaeche: Hauptknopf,
  Auswahl, Fortschritt, Links, Kennzahlen.
- **Das Logo traegt nur Kit-Farben** und haengt nie am Akzent: Navy auf
  Hell, Off-White auf Dunkel, der Punkt immer Tally-Rot. Logo, Tally-Punkt
  und Canvas-Symbole, die Hardware zeigen, bleiben eckig.
- Kontrast **WCAG AA in beiden Modi**.

### Die Regel, an der nicht gedreht wird

Tally-Rot ist **kein Farbton aus der Palette, sondern das Aufnahmelicht.**
Es erscheint nur:

1. am Tastatur-Fokusring (2 px, 2 px Abstand),
2. im Live-/REC-/Tally-Zustand,
3. am Claim-Punkt und im Logo,
4. in Erfolgsmomenten.

Nie als Flaeche, nie als Text, nie als Rahmen. Wer Rot fuer einen Fehler
braucht, nimmt `--av-danger` — ein anderer Ton fuer einen anderen Zweck. Der
Test haelt fest, dass `#D6402E` im Stilblatt **genau einmal** vorkommt: in
der Definition von `--av-signal`. Ein roter Punkt am Primaerknopf ist **keine
Pflicht mehr** und entfaellt in Werkzeugen.

### Modul-Identitaet ohne Farbton

Die frueheren Modul-Akzente (violett, cyan, amber, pink) bleiben entfallen.
**Das Modul erkennt man am Titel**, nicht am Farbton. Die `--mod-*`-Namen
bleiben (damit `[data-module]` nichts bricht) und zeigen alle auf
`--av-accent`.

---

## 2. Typografie — eine Familie, zwei Leitern

Public Sans, **lokal ausgeliefert** (`@fontsource-variable/public-sans`),
mit der Ersatzkette des Guides (`system-ui, 'Segoe UI', Roboto, Arial`).
Open Sans kommt **nirgends** im Layout vor: sie ist im Logo eine Kontur.

**Satzschreibung ueberall.** Versalien nur fuer kleine Overlines und Badges
bis 12 px (`.av-kicker`, gesperrt `.08em`).

| Rolle | Groesse | Schnitt |
|---|---|---|
| Overline / Badge | 11–12 px | Semibold, Versalien erlaubt |
| **Werkzeugtext** | **13–14 px** | Regular — Tabellen, Panels, Formulare |
| Panel-Titel | 14 px | 600–700, Satzschreibung |
| **Lesetext** | **16 px** | Regular — Hinweise, leere Zustaende, Dialog-Einleitung |
| Zwischentitel | 20 px | Bold |
| Dialog-/Ansichtstitel | 17–26 px | Bold |

### Die Abweichung, benannt

Der Guide nennt fuer Fliesstext im Web 16–18 px. Eine Patchliste mit achtzig
Zeilen ist damit nicht bedienbar. Deshalb **zwei Leitern**: *liest man darin,
oder arbeitet man darin?* Wo gearbeitet wird — Tabelle, Panel, Formular —
sind es 13–14 px. Wo gelesen wird, die 16 px des Handbuchs.

---

## 3. Form — weich, ueber Tokens

| Token | Wert | Einsatz |
|---|---|---|
| `--av-r-s` | 6 px | Chips, kleine Felder, Kbd |
| `--av-r-m` = `--av-r-control` | 10 px | Knoepfe, Felder, Menues |
| `--av-r-l` = `--av-r-card` | 20 px | Karten, Panels, Kacheln |
| `--av-r-xl` = `--av-r-modal` | 24 px | Dialoge, Sheets |
| `--av-r-full` = `--av-r-pill` | 999 px | Pills, Schalter, Avatare, Status-Punkte |

| Schatten | Hell | Dunkel | Einsatz |
|---|---|---|---|
| `--av-shadow-1` (`-panel`) | `0 1px 2px` .06 | .30 | Karten, gewaehltes Segment |
| `--av-shadow-2` (`-float`) | `0 4px 16px` .08 | .40 | Menues, schwebende Leisten |
| `--av-shadow-3` (`-pop`) | `0 16px 48px` .14 | .55 | Dialoge, Kommandopalette |

**Rundungen und Schatten nur ueber diese Tokens** — nie ein roher
Pixelwert, nie Tailwinds `rounded-*`/`shadow-*` ohne Token dahinter. Schatten
trennen Ebenen, sie schmuecken nicht. Einziger farbiger Schatten ist der
weiche Akzentschein unter dem Hauptknopf.

Struktur entsteht zuerst durch **Abstand und Flaechenstufe**, dann durch eine
Haarlinie. **Panel-Koepfe sind ein normaler Titel** in Satzschreibung,
optional mit kleiner Overline darueber — keine Pflicht-Kopflinie mehr.
8-px-Raster: 4 · 8 · 12 · 16 · 24 · 32 · 48.

**Moderne Details, dosiert:** Glas-Kopfzeile (`backdrop-filter: blur(16px)
saturate(1.4)`, Grund zu 72 %), Karten mit Haarlinie + Schatten 1–2 +
Radius l, Segment-Controls mit gleitender heller Auswahl, weicher
Hintergrundschein (`.av-glow-bg`) **nur** auf Start- und Leerflaechen, nie
hinter dem Canvas.

---

## 4. Tasten (Knoepfe)

| Art | Aussehen | Regel |
|---|---|---|
| Primaer | Pill in `--av-accent`, Text `--av-accent-text`, weicher Akzentschein, Hover hebt um 1 px | **einer** pro Ansicht/Dialog |
| Sekundaer („soft") | Akzent weich hinterlegt, Text im Akzent | beliebig viele |
| Ghost | ohne Flaeche, Hover `--av-surface-2` | Werkzeugleisten |
| Link | Akzent, Hover unterstrichen | im Fliesstext |

Kein Outline-Knopf. Gedrueckt = `scale(.97)`. Klickflaechen mindestens 32 px
am Desktop, 44 px auf Touch.

---

## 5. Bewegung

| Token | Dauer | Einsatz |
|---|---|---|
| `--av-dur-1` | 120 ms | Hover, Druck |
| `--av-dur-2` | 220 ms | Menues, Sheets, Segment-Auswahl |
| `--av-dur-3` | 360 ms | Ansichtswechsel |

Kurve `cubic-bezier(.2,.8,.2,1)` (`--av-ease`). Eine Feder-Kurve
(`--av-ease-spring`) nur fuer Erfolgsmomente, hoechstens 600 ms.
`prefers-reduced-motion` → nur Ueberblendung.

---

## 5a. Hell und Dunkel — immer beide, sichtbar umschaltbar

- Jede Oberflaeche hat **beide Modi**, gleich sorgfaeltig gestaltet — nicht
  invertiert.
- Ein **sichtbarer Umschalter Auto · Hell · Dunkel** sitzt in der Kopfzeile,
  vor den Einstellungen (die bleiben der letzte Bedienpunkt, Abschnitt 6).
  Auto folgt dem System; die Wahl wird gespeichert.
- Technik: Hell ist der Grundzustand von `:root`;
  `@media (prefers-color-scheme: dark)` greift, solange nicht
  `data-theme='light'` gesetzt ist; `data-theme='dark'` erzwingt Dunkel.
  Beide Dunkel-Bloecke sind identisch (der Test haelt das fest).
- In `@avplan/ui`: `useTheme()` (Wahl, Speicherung, `data-theme`) und
  `<ThemeSwitch>` (das Segment). Eingebettete Planer bekommen das
  aufgeloeste Theme ueber `connectShellTheme()`.
- Canvas, Konva, Print und SVG holen ihre Farben aus `paletteFor(theme)` —
  nie einen eigenen Satz Hexwerte.

---

## 6. Der Rahmen — wo das Menue steht

Damit alle Werkzeuge gleich zu bedienen sind, steht der Rahmen fest.
Von aussen nach innen:

```
┌──────────────────────────────────────────────────────────────┐
│ Kopfzeile 40 px:  Menue links · Dokument mittig · Zustand rechts │
├────┬────────────────────────────────────────────┬────────────┤
│    │                                            │            │
│ R  │              Arbeitsflaeche                │  Inspektor │
│ a  │        (Canvas, Liste, Grundriss)          │   rechts   │
│ i  │                                            │  280–360px │
│ l  │                                            │            │
├────┴────────────────────────────────────────────┴────────────┤
│ Statusleiste 24 px:  Meldungen links · Zaehler rechts         │
└──────────────────────────────────────────────────────────────┘
```

- **Menue immer oben links.** Datei · Bearbeiten · **Werkzeuge · Ansicht** ·
  Hilfe. Nie ein zweites Menue an anderer Stelle, nie ein Hamburger auf dem
  Desktop.

  > **Korrigiert am 2026-09-11.** Hier stand bis dahin „Datei · Bearbeiten ·
  > Ansicht · Werkzeuge · Hilfe" — Ansicht und Werkzeuge vertauscht. Der
  > `cable-planner` fuehrt sie seit jeher in der Folge oben, und der
  > Nutzer-Auftrag vom selben Tag sagt ausdruecklich „Passe an den Cable
  > planner stand an". Also war der Code der Massstab und dieser Satz die
  > Abweichung. Dass sie drei Tage unbemerkt blieb, hat einen Grund: die
  > Reihenfolge wurde nie GEMESSEN. Das tut jetzt
  > `scripts/chrome-parity.mjs`.

- **`File` und `Help` fuehrt jede App**, mit dem gemeinsamen Grundstock:
  Neues Projekt · Oeffnen · Speichern · Speichern unter, und ein „Ueber".
  `Edit`, `Tools` und `View` nur dort, wo das Darunterliegende existiert —
  **abwesend statt leer**. Ein Menue „Ansicht" mit einem ausgegrauten
  „Einpassen" in einem Lager ohne Zeichenbereich ist ein PLACEHOLDER: es
  sieht aus wie eine Funktion und ist keine. Ein abwesendes Menue verschiebt
  die uebrigen nach vorn; ihre Reihenfolge bleibt.

- **Die Einstellungen stehen rechts aussen**, als LETZTER Bedienpunkt der
  Kopfzeile. Nicht zu verwechseln mit Anzeige-Reglern, die zufaellig auch ein
  Zahnrad tragen — der `light-planner` hatte genau das, und sein Zahnrad war
  die Belichtung des 3D-Bildes.

- **Die Beschriftungen folgen der Quellsprache des Repos, nicht dieser Liste.**
  Vereinheitlicht wird der BAU der Leiste — welche Menues, in welcher Folge,
  wo die Einstellungen sitzen. „File" in einer deutschen Oberflaeche waere
  Sprachmix, und gegen den steht in dieser Suite ein eigener Zaehler.
- **Modul-Rail links**, 56 px, senkrecht, mit Beschriftung unter dem Zeichen.
  Der aktive Eintrag ist im Akzent weich hinterlegt, mit kurzem Strich links.
- **Inspektor rechts.** Eigenschaften des Ausgewaehlten, nie links.

- **Die Statusleiste fuehrt jede App mit einem Arbeitsbereich** (nachgetragen
  am 2026-09-12). Der Rahmen oben nennt sie seit jeher; gefuehrt haben sie
  nur `cable-planner` und `light-planner`. Im `multicam-planner` stand im
  Stilblatt dazu „wo keine ist, wird auch keine erfunden, nur um eine Regel
  abzuhaken" — richtig, solange offen war, WAS darin steht.

  Offen war das aber nie: der Rahmen sagt „Meldungen links · Zaehler
  rechts", und **Zaehler sind ableitbar**. Was dort NICHT hingehoert, sind
  Werte, die eine Produktentscheidung waeren — eine „Komplexitaet", eine
  Ampel, eine Bewertung des Plans. Der `cable-planner` fuehrt solche Werte;
  sie sind seine Entscheidung und keine Vorlage.

  Gemessen wird die Leiste je Repo (`kopfzeile:check`), nicht in der Suite:
  sie ist eine Zahl im Stilblatt und ein Element im Markup, beides steht in
  der App.

  > **Korrigiert am 2026-09-13 (suite#231).** Hier stand: „`inventory-planner`
  > und `larszu-facility-planner` fuehren Reiter ohne Zeichenbereich — dort
  > waere sie eine leere Zeile, also gilt die Regel fuer sie nicht." Beide
  > Haelften des Satzes waren falsch. Der `larszu-facility-planner` HAT einen
  > Zeichenbereich — der Grundriss, seit Issue #1. Und leer waere die Leiste
  > auch sonst nicht: jede der sieben Ansichten beider Apps fuehrt eine Zahl,
  > die sie ohnehin berechnet (Artikel, Lagerplaetze, Ausgabescheine,
  > Anschlusspunkte, Kreise, Klinken, Maengel). Beide fuehren die Leiste
  > jetzt; was dieser Abschnitt verbietet — Ampel, Bewertung, Komplexitaet —
  > steht in keiner der vierzehn Zeilen.

- **Die Seitenleisten klappen ueberall gleich ein** (ergaenzt am 2026-09-11).
  Der Rahmen stand hier von Anfang an; der GRIFF nicht — und genau der ist,
  was ein Nutzer als Erstes anfasst. Verglichen ueber die fuenf vendorierten
  Apps hatte jede eine andere Antwort:

  | App | Griff | eingeklappt |
  |---|---|---|
  | `cable-planner` | in der Leiste | 32 px, Name senkrecht |
  | `multicam-planner` | eigener 20-px-Streifen daneben | `w-0` — nichts sagt, was dort zugeklappt ist |
  | `light-planner` | — | gar nicht einklappbar |

  Der `cable-planner` ist der Massstab (Eigentuemer-Weisung vom 2026-09-11:
  „Passe an den Cable planner stand an"), also gilt seine Form:

  - **Der Griff sitzt IN der Spalte**, in ihrer Kopf- oder Registerzeile — er
    gehoert zum Rahmen der Spalte, nicht zu ihrem Inhalt und nicht daneben.
  - **Eingeklappt bleiben 32 px stehen**, mit dem Namen der Spalte senkrecht
    darin. Nicht null: eine Spalte, die spurlos verschwindet, laesst den
    Nutzer raten, ob es sie noch gibt. Nicht 20: die Zahl liegt nicht auf dem
    8-px-Raster aus Abschnitt 3, und eine Trefferflaeche unter 24 px
    unterschreitet die Norm, die fuer Regler schon gilt.
  - **Die Wahl ueberlebt den Neustart.** Wer zuklappt, tut das fuer seine
    Arbeitsweise, nicht fuer eine Sitzung.
  - **Jedes Panel hat einen Kopf** mit seinem Titel (Abschnitt 3) — als
    normaler Titel in Satzschreibung, ohne Pflicht-Linie.

  - **Und die Kopfzeile nennt die Spalte beim Namen** (ergaenzt am
    2026-09-11, zweite Runde). Der Satz darueber sagte, dass es eine
    Kopfzeile gibt; er sagte nicht, was darin steht. Nachgesehen, nachdem
    der Griff vereinheitlicht war:

    | App | offen | eingeklappt |
    |---|---|---|
    | `cable-planner` Inspektor | Name ja, Linie gedaempft statt Akzent | Name senkrecht |
    | `cable-planner` Bibliothek | kein Name — die Register begannen sofort | Name senkrecht |
    | `multicam-planner` | keine Kopfzeile, nur die Registerzeile | Name senkrecht |
    | `light-planner` | Name und Linie | Name senkrecht |

    In zwei von vier Spalten sagte die OFFENE Spalte ihren Namen nicht,
    waehrend die eingeklappte ihn senkrecht trug. Wer aufklappt, verliert
    damit die Auskunft, die er zugeklappt hatte — das ist genau verkehrt
    herum.

    Eine Spalte mit Registern bekommt die Kopfzeile TROTZDEM: die Register
    sagen, welche SICHT man waehlt, nicht was die Spalte ist. „Settings" und
    „Templates" nebeneinander beantworten nicht die Frage, wozu die Spalte
    gehoert.

    Die Kopfzeile kostet keine eigene Zeile, wo schon eine da ist: im
    `cable-planner` traegt die vorhandene Knopfzeile (Einklappen, Fenster)
    jetzt auch den Namen. Das ist kein Detail — diese Spalte ist fest 260 px
    breit, und ihre Registerzeile musste 2026-09-07 zweispaltig umgebaut
    werden, weil zwei von vier Registern aus dem Fenster ragten.

    Gemessen wird beides von `scripts/chrome-parity.mjs` Abschnitt 5.
    NICHT gemessen: ob die Linie im Fenster wirklich in der Akzentfarbe
    erscheint. Der Lauf liest Klassen, nicht Pixel.

  - **Die Zeichen der Oberflaeche kommen aus dem Icon-Satz der App**, nicht
    aus der Zeichentabelle (ergaenzt am 2026-09-11). Ein Piktogramm kommt
    aus der Schrift des Systems: eigene Farbe, eigene Strichstaerke, auf
    Windows, macOS und Linux drei verschiedene Formen. Neben einem
    Strichsymbol mit 1,7 px in `currentColor` sieht das aus wie zwei
    Programme in einem Fenster.

    Gemessen am 2026-09-11 ueber `\p{Extended_Pictographic}`:
    `light-planner` 92 Zeilen, `cable-planner` 143, `multicam-planner` 33.
    Im `light-planner` waren es die Ebenen-Liste, der Grundriss-Kasten, die
    Szenen-Liste, vier Dialoge und die Platzier-Hinweise — waehrend die
    Werkzeug-Rail derselben App seit jeher `Icon.tsx` nutzt, dessen erste
    Zeile ausdruecklich sagt, es ersetze „the emoji icons across the UI".

    DIE REGEL GILT FUER DIE BEDIENUNG, NICHT FUER DEN INHALT. Ein
    Buehnenobjekt in einer Auswahlliste (`multicam-planner`: Schlagzeug,
    Fluegel, Mikrofonstaender) darf ein Piktogramm sein — dafuer gibt es
    keinen Strichsatz, und es ist eine Sache, keine Schaltflaeche. Ebenso
    alles, was auf ein Canvas gemalt wird: dort gibt es kein SVG.

  **Spaltenbreiten:** Inspektor 280–360 px (siehe oben), linke Spalte
  260–320 px, eingeklappt je 32 px. Wo eine App ihre Spalte mit dem Fenster
  wachsen laesst, ist das eine begruendete Abweichung und gehoert
  kommentiert — nicht jede Spalte traegt dasselbe.

  **Was diese Regel NICHT verlangt:** dass jede App Seitenleisten HAT. Der
  `inventory-planner` und der `larszu-facility-planner` fuehren Reiter statt
  Spalten, weil sie keinen Zeichenbereich und nichts zu inspizieren haben.
  Eine leere Spalte dort waere ein PLACEHOLDER — dieselbe Begruendung, aus
  der `Edit`/`Tools`/`View` abwesend statt leer sind.

- **Statusleiste unten**, 24 px. Sie meldet; sie bedient nicht.

  > **Gemessen am 2026-09-11:** nur `cable-planner` und `light-planner`
  > fuehren eine. `multicam-planner` hat keine. Das steht hier als BEFUND und
  > nicht als erledigte Zeile — eine Statusleiste ohne etwas zu melden waere
  > wieder ein PLACEHOLDER, und was MultiCam dort melden soll, ist eine
  > Entscheidung und keine Ableitung.
- **Kommandopalette** auf `Strg/Cmd + K` in jeder App — derselbe Griff
  ueberall.
- **Dialoge**: Radius xl, Schatten 3, Titel oben, Aktionen unten rechts,
  Primaerknopf ganz rechts.
- Ein Dialog, der laenger ist als sein Fenster, **scrollt in seinem Rumpf** —
  die Fusszeile mit den Aktionen bleibt stehen. (Das war ein gemeldeter
  Fehler: der Drucken-Knopf im Export-Dialog war nicht erreichbar.)

**Gemessen wird dieser Abschnitt von `scripts/chrome-parity.mjs`** (Lauf:
`npm run chrome:parity`), und zwar in allen sechs vendorierten Apps im selben
Baum: Klasse und 40 px, die Menue-Folge, der Grundstock je Menue, die
Einstellungen als letzter Bedienpunkt, kein Hamburger auf dem Desktop — und
seit dem 2026-09-11 der Griff der Seitenleisten: 32 px eingeklappt, der Name
senkrecht darin, der Griff in der Spalte. Geprueft wird das nur in den Apps,
die ueberhaupt Spalten fuehren; die beiden Reiter-Apps sind ausgenommen, mit
Grund im Lauf.

Was er NICHT sieht: die Reihenfolge auf dem SCHIRM (nur die im Markup — ein
`order`-Wert im Stilblatt wuerde ihn taeuschen) und die vier nicht
vendorierten Repos (`Broadcast-intercom`, `tally-pi`, `sony-camera-bridge`,
`pi-media-station`). Jedes Repo traegt zusaetzlich seinen eigenen
`kopfzeile:check`, der beim Bauen faellt statt erst beim Vendorieren.

---

## 7. Uebernahme

Die Regeln gelten ab sofort fuer **neuen** Code. Bestehende Oberflaechen
werden in dieser Reihenfolge nachgezogen — jede Stufe ist fuer sich lieferbar:

1. ~~**`@avplan/ui`**~~ — **erledigt** mit diesem ADR (Tokens, Primitive, Test).
2. ~~**Shell**~~ — **erledigt** (`suite#151`, Rahmen und Panel-Koepfe;
   `suite#153` die Kommandopalette). Las die Tokens schon ueber `--av-*`.
3. ~~**cable-planner**~~ — **erledigt** (`cable#760` Tokens, `cable#762`
   Kopfzeile 40 px / Statusleiste 24 px / Dialog-Kopf). Die `--cp-*`-Schicht
   zeigte auf Tailwinds `slate` und traegt jetzt die Marken-Werte
   (`--cp-surface-2: #1D324F`, Zumpe Navy); die Utilities blieben
   unveraendert — genau dafuer war die Token-Schicht da.
4. ~~**multicam-planner, light-planner**~~ — **erledigt** (`multicam#104`/`#105`,
   `light#88`/`#89`). Dieselbe Umhaengung, dazu die rohen Hexwerte in den
   Canvas-Komponenten.
5. ~~**tally-pi, Broadcast-intercom, sony-camera-bridge, pi-media-station**~~ —
   **erledigt** (`tally-pi#12`, `Broadcast-intercom#11`,
   `sony-camera-bridge#18`, `pi-media-station#5`). `tally-pi` und
   `pi-media-station` halten die Palette zusaetzlich mit einem eigenen Test
   fest (`tests/test_brand_tokens.py`) — dort gibt es keine Token-Schicht, an
   der ein Rueckfall auffiele.

**Alle fuenf Stufen stehen** (nachgesehen am Code, 2026-09-08: `#1D324F` liegt
in allen acht Repos, die es damals gab).

**Stufe 6 — die beiden Repos, die es am 2026-09-08 noch nicht gab**
(`inventory-planner`, `larszu-facility-planner`, beide angelegt am 2026-09-09
nach E-26/E-27). Nachgemessen am 2026-09-11: sie trugen **keines** der Token
dieses ADR, sondern rohe slate-Farben, und zusammen elf `border-radius`. Das
war kein Verstoss — der Geltungsbereich oben nannte sie nicht, und im Kopf
ihrer Stilblaetter stand der Aufschub ausdruecklich („zieht mit dem Einbetten
nach"). Es war eine LUECKE: ein Beschluss, der die Repos aufzaehlt, waechst
nicht von selbst mit, und der naechste neue Planer faellt genauso durch.

Umgestellt in `inventory#11` und `facility#6`, mit je einem eigenen Waechter
(`src/domain/__tests__/markenPalette.node.test.ts`) — dieselbe Form wie bei
`tally-pi` und `pi-media-station`: die Werte stehen dort ein zweites Mal, weil
die Repos an keinem Paket der Suite haengen, und der Waechter faellt bei jedem
Rueckweg. Er prueft ausdruecklich auch, dass Tally-Rot NICHT die Warnfarbe ist
— eine Warnung im Aufnahmelicht nimmt dem Signal seine Bedeutung.

**Was daraus fuer den naechsten neuen Planer folgt:** der Geltungsbereich oben
ist eine Aufzaehlung und damit eine Liste, die jemand pflegen muss. Wer ein
Repo anlegt, traegt es dort ein UND legt den Waechter mit an — sonst steht die
Regel wieder nur fuer die, die es schon gab. Dieser Abschnitt hat die Reihenfolge vorgegeben und
haette danach ohne Vermerk dagestanden — ein Uebernahmeplan, der nach der
Uebernahme nicht angefasst wird, schickt den naechsten Leser los, etwas zu
bauen, das schon steht.

Was **nicht** passiert ist: eine grosse Umbau-Runde durch alle Repos an einem
Tag. Die Token-Schicht war genau dafuer da, dass die Umstellung pro App eine
Datei ist — und in den fuenf Stufen war sie es auch.

**Umstellung auf die Fassung vom 2026-10-13.** `@avplan/ui` und die Shell
tragen die neuen Werte, den Umschalter und den Test seit `design/2026-10-modern`.
Die Planer stellen in ihren eigenen Repos um (Branch `design/2026-10-modern`,
dort mit umgebautem `form:check`/`kopfzeile:check`/Palettentest) und kommen
wie ueblich per Vendoring in die Suite. `chrome:parity` prueft den Spaltenkopf
seither nur noch als Struktur, nicht mehr seine Linie.

---

## Was diese Entscheidung kostet

Der Verlust der Modul-Farben ist echt: wer bisher am Violett erkannt hat,
dass er im Signal-Modul ist, muss jetzt den Titel lesen. Das ist bewusst in
Kauf genommen — vier bunte Akzente neben einer blau-roten Marke waren der
Grund, warum die Suite nicht wie ein Produkt aussah.

Zwei Modi heissen doppelte Pruefarbeit: jede Ansicht wird hell UND dunkel
angesehen, jeder Kontrast zweimal gemessen. Weiche Formen und Schatten
brauchen Tokens und Waechter, damit sie nicht wieder zu je App eigenen Zahlen
zerfallen — `form:check` in den Planern prueft deshalb „nur ueber Tokens"
statt „Radius null".

---

## Verwandt

- ADR-004 — Dokument-Stempel (dieselbe Logik: eine Quelle, viele Ausgaben)
- ADR-006 — der Schnitt zwischen Planer-Kern und eigenen Werkzeugen
