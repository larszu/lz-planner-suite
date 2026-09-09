#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Sagt die Status-Tabelle dasselbe wie der Backlog? — `npm run status:check`
//
// ─── DER BEFUND, GEMESSEN 2026-09-09 ───────────────────────────────────────
//
// `IMPLEMENTATION_STATUS.md` fuehrte drei Zeilen, die dem Code um Wochen
// hinterher waren — und alle drei nannten selbst den Backlog-Eintrag, der
// laengst „ERLEDIGT" sagt:
//
//   Cross-Link Planer -> Shell            MISSING   B-18  (erledigt, suite#199)
//   Sprachumschaltung -> multicam-planner PARTIAL   B-25  (ERLEDIGT, multicam#116)
//   sony-camera-bridge Oberflaechen-Sprache PARTIAL B-26  (ERLEDIGT, sony#22)
//
// Nachgemessen am Baum, nicht am Text: `postNavigateToShell` steht in
// `packages/ui/src/embed.ts` und wird von der Shell empfangen;
// `multicam-planner/src/i18n/` gibt es upstream; `sony-camera-bridge`
// meldet „einsprachig en, B-26 erledigt".
//
// ─── WARUM DAS EINEN WAECHTER BRAUCHT ──────────────────────────────────────
//
// Fuer den Backlog gibt es diese Pruefung schon (`backlog-status-frisch`),
// und ihr Kopf nennt den Grund: „Ein Backlog-Eintrag ist eine Behauptung
// ueber den Code und altert genauso wie eine." Fuer die STATUS-Tabelle galt
// das nie — dabei ist sie die Seite, auf die jemand schaut, der wissen will,
// was es schon gibt. Eine Zeile, die „MISSING" sagt, waehrend die Sache
// gebaut ist, schickt jemanden los, etwas zu bauen, das schon steht. Genau
// die Lehre steht in B-10 ausgeschrieben.
//
// ─── DIE REGEL ─────────────────────────────────────────────────────────────
//
// Eine Zeile mit einem UNFERTIG-Status, die einen `B-nn`-Eintrag nennt, darf
// nicht auf einen Eintrag zeigen, dessen Status-Zeile „erledigt"/„GEBAUT"
// sagt und NICHT zugleich „offen". Die zweite Haelfte ist wichtig: es gibt
// Eintraege der Form „Kern GEBAUT — der Datei-Import offen" (B-47), und die
// duerfen in der Tabelle sehr wohl `PARTIAL` heissen. Das IST der Zustand.
//
// ─── WAS DER LAUF NICHT KANN ───────────────────────────────────────────────
//
// Er vergleicht zwei DOKUMENTE, nicht Dokument gegen Code. Eine Zeile, die
// „MISSING" sagt, ohne einen Backlog-Eintrag zu nennen, sieht er nicht — und
// eine, bei der beide Dokumente gemeinsam falsch liegen, auch nicht. Er
// faengt die Sorte Drift, die hier dreimal aufgetreten ist: das eine
// Dokument wird beim Bauen nachgezogen, das andere nicht.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATUS = join(WURZEL, 'docs', 'IMPLEMENTATION_STATUS.md');
const BACKLOG = join(WURZEL, 'docs', 'IMPLEMENTATION_BACKLOG.md');

/** Die Stufen, die „noch nicht fertig" heissen. */
const UNFERTIG = /^`(MISSING|PARTIAL|PLACEHOLDER|PLANNED|UI_ONLY|BROKEN|PROTOTYPE)`$/;
/** Irgendeine Stufe — zum Erkennen der Korrektur-Tabelle. */
const IRGENDEINE = /^`(COMPLETE|IMPLEMENTED|PARTIAL|PROTOTYPE|UI_ONLY|PLACEHOLDER|PLANNED|MISSING|BROKEN)`/;

const FERTIG = /\b(erledigt|ERLEDIGT|gebaut|GEBAUT)\b/;
const OFFEN = /\b(offen|noch nicht gebaut|steht aus)\b/i;

// ── Die Status-Zeilen der Backlog-Eintraege, je Nummer ────────────────────
const backlog = readFileSync(BACKLOG, 'utf8');
const statusJeEintrag = new Map();
for (const block of backlog.split(/\n(?=### )/)) {
  const m = /^### (B-\d+)/.exec(block);
  if (!m) continue;
  const s = /^\* \*\*Status:\*\*([\s\S]*?)(?=\n\* )/m.exec(block);
  if (s) statusJeEintrag.set(m[1], s[1].replace(/\s+/g, ' ').trim());
}

// ── Die Zeilen der Status-Tabelle ─────────────────────────────────────────
const zeilen = readFileSync(STATUS, 'utf8').split('\n');
const funde = [];
let geprueft = 0;

zeilen.forEach((zeile, i) => {
  if (!zeile.startsWith('|')) return;
  const zellen = zeile.split('|').map((z) => z.trim());
  // `| Name | Status | Prosa |` ergibt ['', Name, Status, Prosa, ''].
  if (zellen.length < 5) return;
  const [, , stufe, prosa] = zellen;
  if (!UNFERTIG.test(stufe)) return;
  // Die Korrektur-Tabelle hat in der DRITTEN Spalte wieder eine Stufe
  // („eingestuft als | tatsaechlich"). Sie beschreibt Einstufungen und nicht
  // den Code — ohne diese Zeile schluege der Lauf dort viermal an.
  if (IRGENDEINE.test(prosa)) return;

  for (const b of prosa.match(/B-\d+/g) ?? []) {
    const s = statusJeEintrag.get(b);
    if (!s) continue;
    geprueft += 1;
    if (FERTIG.test(s) && !OFFEN.test(s)) {
      funde.push({ zeile: i + 1, name: zellen[1], stufe, b, status: s.slice(0, 110) });
    }
  }
});

// ── Die Gegenprobe zum Lauf selbst ────────────────────────────────────────
//
// Ohne sie waere ein Lauf, der keine einzige Zeile trifft (Tabelle umgebaut,
// Muster passt nicht mehr), gruen — und sagte damit „alles stimmt".
if (statusJeEintrag.size < 20) {
  console.error(
    `FEHLER: nur ${statusJeEintrag.size} Backlog-Eintraege mit Status-Zeile gefunden — ` +
      'das Muster passt nicht mehr.',
  );
  process.exit(1);
}
if (geprueft === 0) {
  console.error(
    'FEHLER: keine einzige Unfertig-Zeile nennt einen B-Eintrag. Entweder ist ' +
      'die Tabelle umgebaut, oder das Muster passt nicht mehr — gruen waere hier ' +
      'eine Auskunft, die der Lauf nicht hat.',
  );
  process.exit(1);
}

if (funde.length > 0) {
  console.error(
    `FEHLER: ${funde.length} Zeile(n) der Status-Tabelle sind aelter als ihr Backlog-Eintrag:\n` +
      funde
        .map(
          (f) =>
            `  · Zeile ${f.zeile}: „${f.name}" steht auf ${f.stufe}, ` +
            `${f.b} sagt aber: ${f.status}`,
        )
        .join('\n') +
      '\n\nEntweder ist die Sache gebaut — dann gehoert die Stufe hoch, weil die ' +
      'Tabelle das ist, worauf jemand schaut, der wissen will, was es gibt —\n' +
      'oder der Backlog behauptet einen Bau, den es nicht gibt.',
  );
  process.exit(1);
}

console.log(
  `OK: ${geprueft} Unfertig-Zeile(n) mit Backlog-Bezug geprueft, ` +
    `keine widerspricht ihrem Eintrag (${statusJeEintrag.size} Eintraege gelesen).`,
);
console.log(
  'Verglichen wurden zwei Dokumente, nicht Dokument gegen Code: eine Zeile ohne ' +
    'B-Bezug sieht dieser Lauf nicht, und wo beide gemeinsam irren, auch nicht.',
);
