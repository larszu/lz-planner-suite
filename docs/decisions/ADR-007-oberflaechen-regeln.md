# ADR-007 — Die Oberflaechen-Regeln der Suite

**Status:** angenommen · 2026-09-07
**Gilt fuer:** alle zehn Repos (av-planner-suite, cable-planner,
multicam-planner, light-planner, inventory-planner, larszu-facility-planner,
Broadcast-intercom, tally-pi, sony-camera-bridge, pi-media-station)
**Erweitert:** 2026-09-11 um `inventory-planner` und `larszu-facility-planner`
— siehe Stufe 6 unten
**Quelle der Werte:** Brand Guide 2.0 der Lars Zumpe Medienproduktion,
September 2026 — Seiten 8 (Farbe), 9 (Typografie), 10 (Raster, Linie, Punkt),
11 (Bewegung), 17 (Web: Farbrollen, Interaktion)
**Maschinenlesbar:** `packages/ui/src/brand.ts` · `packages/ui/src/styles.css`
**Gehalten von:** `packages/ui/test/brand.test.ts`

---

## Der Anlass

> „die ui ist nicht konsistent. lege globale ui regeln fest die für alle repos
> die im av planner suite zusammenlaufen gelten, damit es einheitlich ist.
> schriftgrößen, tasten, standort des menüs, etc. lass sich auch von meinem CI
> inspirieren"

Vier Werkzeuge, vier Farbwelten. Der Cable-Planner rechnete in Tailwinds
`slate`, die Shell in einem eigenen Near-Black, MultiCam in `#0f1117`, Light
in wieder etwas anderem. Die Modul-Akzente liefen quer durch das Farbrad:
Raum grau, Signal violett, Kameras cyan, Licht amber, Board pink. Jede App
fuer sich stimmig — zusammen nicht eine Anwendung, sondern vier.

Dazu kam, dass es **keine Instanz gab, die haette widersprechen koennen**.
Jede App hatte ihre eigene Token-Datei, jede war in sich schluessig, und
keine wusste von den anderen. Ein Handbuch als PDF haette daran nichts
geaendert: Regeln, die nur in einem Dokument stehen, driften.

---

## Die Entscheidung

**Eine Quelle, drei Fassungen, ein Test dazwischen.**

| Fassung | Datei | Wofuer |
|---|---|---|
| Werte | `packages/ui/src/brand.ts` | fuer Code, der keine CSS-Variablen lesen kann: Canvas, Print, SVG-Export, Konva |
| Laufzeit | `packages/ui/src/styles.css` | fuer alles, was im DOM gerendert wird |
| Begruendung | dieses ADR | fuer den, der in einem Jahr eine Ausnahme erwaegt |

`packages/ui/test/brand.test.ts` prueft, dass die drei dasselbe sagen. Er
prueft nicht, ob die Werte huebsch sind — das entscheidet das Handbuch. Er
prueft, dass es nur **eine** Antwort gibt.

---

## 1. Farbe — Blau ist die Marke, Rot ist das Signal

| Rolle | Wert | Einsatz |
|---|---|---|
| Grund | `#132040` Deep Navy | Seitenhintergrund, Canvas, Fusszeile |
| Flaeche | `#1D324F` Zumpe Navy | Karten, Formulare, Wechselabschnitte |
| Panel | `#182948` *abgeleitet* | Panels zwischen Grund und Flaeche |
| Versenkt | `#0E1930` *abgeleitet* | Leisten, Rail, Eingabefelder |
| Erhoben | `#24405F` *abgeleitet* | Chips, Knoepfe, Hover |
| Text | `#F6F5F0` Off-White | Text auf Dunkel, primaerer Knopf |
| Fliesstext | `#E1ECEF` Eisblau | Lauftext auf Dunkel |
| Gedaempft | `#8C9CB3` Stahlblau | Kicker, Meta, Platzhalter — **nie** Fliesstext |
| Linie | `rgba(246,245,240,.14)` | Trenner, Kartenoberkante; `.35` fuer Outline-Knopf |
| **Signal** | `#D6402E` Tally-Rot | siehe unten |
| Status | `#2F7D5C` · `#C8892B` · `#B04A3F` | **nur** Meldungen |

### Die Regel, an der nicht gedreht wird

Tally-Rot ist **kein Farbton aus der Palette, sondern das Aufnahmelicht.**
Es erscheint an genau drei Orten:

1. dem Tastatur-Fokusring (2 px, 3 px Abstand),
2. dem Punkt am **einen** primaeren Knopf eines Abschnitts,
3. dem Live-/Aufnahme-Zustand (Tally, Stream, Record).

Nie als Flaeche, nie als Text, nie als Rahmen, **nie zweimal in einem
Sichtfeld**. Wer Rot fuer einen Fehler braucht, nimmt `--av-danger` — ein
anderer Ton (`#B04A3F`) fuer einen anderen Zweck. Der Test haelt fest, dass
`#D6402E` in der ganzen Stylesheet-Datei **genau einmal** vorkommt: in der
Definition von `--av-signal`.

### Modul-Identitaet ohne Farbton

Die frueheren Modul-Akzente (violett, cyan, amber, pink) sind entfallen. Sie
waren ein zweites Farbsystem neben der Marke und machten jede Ansicht zu einer
anderen Anwendung. **Das Modul erkennt man am Kicker in der Kopfzeile, nicht
am Farbton** — dieselbe Entscheidung, die der Guide fuer die Marke trifft:
Struktur statt Buntheit. Die `--mod-*`-Namen bleiben (damit `[data-module]`
nichts bricht) und zeigen alle auf `--av-accent`.

---

## 2. Typografie — eine Familie, zwei Leitern

Public Sans, mit der Ersatzkette, die der Guide selbst nennt
(`system-ui, 'Segoe UI', Roboto, Arial`). Open Sans kommt **nirgends** im
Layout vor: sie ist im Logo eine Kontur, keine Schrift.

| Rolle | Groesse | Schnitt |
|---|---|---|
| Kicker / Label | 12 px | Bold, Versalien, `letter-spacing: .16em` |
| Meta / Zahl | 11 px | Regular — nie fuer Saetze |
| **Werkzeugtext** | **13 px** | Regular — Tabellen, Panels, Formulare |
| **Lesetext** | **16 px** | Regular — Hinweise, leere Zustaende, Dialog-Einleitung |
| Zwischentitel | 20 px | ExtraBold |
| Dialogtitel | 26 px | ExtraBold |

### Die Abweichung, benannt

Der Guide nennt fuer Fliesstext im Web 16–18 px. Eine Patchliste mit achtzig
Zeilen ist damit nicht bedienbar. Deshalb **zwei Leitern**, und die Grenze
zwischen ihnen ist scharf gezogen: *liest man darin, oder arbeitet man darin?*
Wo gearbeitet wird — Tabelle, Panel, Formular — sind es 13 px. Wo gelesen
wird — der Satz, der erklaert, was diese Seite tut — sind es die 16 px des
Handbuchs. Eine stillschweigende Verkleinerung auf 13 px ueberall waere die
schlechtere Loesung gewesen: dann waere der Guide-Wert nirgends mehr sichtbar
und die Abweichung nirgends mehr begruendet.

---

## 3. Form — was es nicht gibt

> „Keine Rundungen, keine Schatten, keine Verläufe, keine Rahmen, keine
> Eckwinkel, keine Kreise außer dem Punkt." (Guide S. 10)

Radius ist **null**, ueberall. Die Tokens `--av-r-control/-card/-modal/-pill`
bleiben mit dem Wert `0` bestehen, damit kein Aufrufer umgebaut werden muss.
Die Schatten-Tokens stehen auf `none`. Auch die Punkte in Badges, Tabs und der
Rail sind **eckig**: der Tally-Punkt ist der Satzpunkt der Hausschrift, kein
Kreis.

Struktur entsteht durch **Linie und Weissraum**:

- **Kopflinie** (`.av-kicker` + `.av-headrule`): Kicker in Versalien, darunter
  eine durchgehende Linie in Stahlblau bis zur rechten Satzkante. **Eine pro
  Flaeche** — sie ist die Kopfzeile jedes Panels und jedes Dialogs, und sie
  traegt die Modul-Kennung, die frueher eine Farbe war.
- **8-px-Raster**: 4 · 8 · 12 · 16 · 24 · 32 · 48. Keine Halbschritte.
- Inhaltsbreite hoechstens 1280 px, 12 Spalten, 24 px Steg.

---

## 4. Tasten (Knoepfe)

| Art | Aussehen | Regel |
|---|---|---|
| Primaer | Off-White-Flaeche, Navy-Text, **roter Punkt links** | **einer** pro Abschnitt/Dialog |
| Sekundaer | Outline Off-White 35 %, Hover 100 % | beliebig viele |
| Ghost | ohne Flaeche, Text gedaempft | Werkzeugleisten |
| Link | Off-White, Hover unterstrichen + Eisblau | im Fliesstext |

Der Punkt am Primaerknopf ist nicht Dekor: er macht sichtbar, **welcher** der
eine ist. Zwei Punkte in einem Sichtfeld heisst, dass einer der beiden kein
Primaerknopf sein darf.

Off-White auf Navy ergibt 13:1 — der Guide begruendet die Wahl ausdruecklich
damit, dass Weiss auf Rot nur 4:1 erreicht.

---

## 5. Bewegung

`cubic-bezier(.2,.8,.2,1)`, 350 ms, **nie ueber 450 ms**. Nichts federt,
nichts schwingt ueber. „Die Marke bewegt sich wie ein Schnitt: schnell, kurz,
dann still."

---

## 6. Der Rahmen — wo das Menue steht

Damit alle acht Werkzeuge gleich zu bedienen sind, steht der Rahmen fest.
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

- **Menue immer oben links.** Datei · Bearbeiten · Ansicht · Werkzeuge ·
  Hilfe. Nie ein zweites Menue an anderer Stelle, nie ein Hamburger auf dem
  Desktop.
- **Modul-Rail links**, 56 px, senkrecht, mit Beschriftung unter dem Zeichen.
  Der aktive Eintrag ist Off-White auf versenkter Flaeche — kein Farbton.
- **Inspektor rechts.** Eigenschaften des Ausgewaehlten, nie links.
- **Statusleiste unten**, 24 px. Sie meldet; sie bedient nicht.
- **Kommandopalette** auf `Strg/Cmd + K` in jeder App — derselbe Griff
  ueberall.
- **Dialoge** sind Flaechen, keine Karten: kein Radius, kein Schatten,
  Kopflinie oben, Aktionen unten rechts, Primaerknopf ganz rechts.
- Ein Dialog, der laenger ist als sein Fenster, **scrollt in seinem Rumpf** —
  die Fusszeile mit den Aktionen bleibt stehen. (Das war ein gemeldeter
  Fehler: der Drucken-Knopf im Export-Dialog war nicht erreichbar.)

---

## 7. Uebernahme

Die Regeln gelten ab sofort fuer **neuen** Code. Bestehende Oberflaechen
werden in dieser Reihenfolge nachgezogen — jede Stufe ist fuer sich lieferbar:

1. ~~**`@avplan/ui`**~~ — **erledigt** mit diesem ADR (Tokens, Primitive, Test).
2. ~~**Shell**~~ — **erledigt** (`suite#151`, Rahmen und Kopflinie; `suite#153`
   die Kommandopalette). Las die Tokens schon ueber `--av-*`; offen war nur
   die Kopflinie in den Panels.
3. ~~**cable-planner**~~ — **erledigt** (`cable#760` Tokens, `cable#762`
   Kopfzeile 40 px / Statusleiste 24 px / Dialog-Kopflinie). Die `--cp-*`-Schicht
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

---

## Was diese Entscheidung kostet

Der Verlust der Modul-Farben ist echt: wer bisher am Violett erkannt hat,
dass er im Signal-Modul ist, muss jetzt den Kicker lesen. Das ist bewusst in
Kauf genommen — vier bunte Akzente neben einer blau-roten Marke waren der
Grund, warum die Suite nicht wie ein Produkt aussah.

Der Verzicht auf Rundungen und Schatten laesst die Oberflaeche haerter
wirken. Auch das ist Absicht und steht so im Handbuch. Ein Control-Surface
fuer Broadcast darf haerter aussehen als eine Marketing-Seite.

---

## Verwandt

- ADR-004 — Dokument-Stempel (dieselbe Logik: eine Quelle, viele Ausgaben)
- ADR-006 — der Schnitt zwischen Planer-Kern und eigenen Werkzeugen
