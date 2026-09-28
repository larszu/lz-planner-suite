# LZ Planner Clipper

Schickt die Seite, die gerade offen ist, auf ein Board der Suite.

## Warum es diese Erweiterung als Ordner gibt und nicht im Store

In `docs/board.md` stand als Grund gegen den Web-Clipper: „eine eigene
Auslieferung in zwei Browser-Läden". Das beschreibt einen Vertriebsweg,
den niemand gehen muss. Chrome und Firefox laden eine Erweiterung aus dem
Ordner; für ein Werkzeug, das in einem Haus benutzt wird, ist das der
normale Weg — und der ehrlichere: es gibt keine Fassung im Store, die
älter ist als die Suite auf dem Rechner.

Das echte Hindernis war der Empfang. Den gibt es seit 2026-09-20:
`apps/shell/electron/einwurf.cjs`.

## Einrichten

1. In der Suite: **Einstellungen → Web-Clipper → Briefkasten öffnen**. Dort
   stehen Adresse und Geheimnis. Beides gilt **für diesen Programmlauf** —
   nach einem Neustart der Suite ist das Geheimnis ein anderes.
2. Im Browser:
   - **Chrome/Edge:** `chrome://extensions` → Entwicklermodus → „Entpackte
     Erweiterung laden" → diesen Ordner wählen.
   - **Firefox:** `about:debugging#/runtime/this-firefox` → „Temporäres
     Add-on laden" → `manifest.json` in diesem Ordner wählen.
3. Auf das Symbol klicken, Adresse und Geheimnis einmal eintragen.

## Was geschickt wird

Nur, was die Seite selbst über sich sagt: `og:title`/`og:description`/
`og:image`, sonst der Fenstertitel — und die **Textstelle, die markiert
ist**, wenn eine markiert ist. Nichts wird erfunden: fehlt ein Titel, fehlt
er, und aus der Adresse wird keiner gebaut.

Das Bild wird **nicht geholt**. Die Karte trägt die Bildadresse; ob sie sie
lädt, entscheidet sie selbst — ein hier heruntergeladenes Bild wäre eine
fremde Datei im Projekt, ohne dass jemand sie abgelegt hat.

## Was der Briefkasten ablehnt

Er hört nur auf `127.0.0.1`, also auf den Browser **auf diesem Rechner**.
Ohne das Geheimnis wird jede Sendung abgewiesen, bevor ihr Inhalt
angesehen wird — auch eine von `localhost`, denn jede Seite im Browser
darf `localhost` anrufen. Es gibt nur `POST /einwurf`, keinen Lese-Weg,
und eine Sendung ist auf 256 kB begrenzt.

Gemessen in `apps/shell/test/einwurf.test.ts`.
