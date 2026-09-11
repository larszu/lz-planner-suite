// ───────────────────────────────────────────────────────────────────────────
// Beschriftungen zu Modell-Kennungen — an EINER Stelle.
//
// Das Modell führt Kennungen (`bruestungskanal`, `schluesselschalter`), weil
// sie in der Datei stehen und sich nie ändern dürfen. Was der Mensch liest,
// ist etwas anderes: ein Wort seiner Sprache. Bis 2026-09-11 standen die
// Kennungen roh in der Tabelle — in einer deutschen Oberfläche gerade noch
// zu erraten, in einer englischen nicht mehr.
//
// WARUM HIER UND NICHT IN DER SICHT. `Bauform` erscheint in ZWEI Sichten
// (Anschlusspunkte und Grundriss). Zwei Tabellen derselben Sache laufen
// auseinander, sobald jemand eine Bauform ergänzt: die eine Sicht zeigt das
// neue Wort, die andere die Kennung — und niemand merkt es, weil beide
// Ansichten selten nebeneinander offen sind.
//
// ALS FUNKTION, NICHT ALS KONSTANTE. Eine Modul-Konstante wird beim Laden
// einmal gebaut und bliebe in der Sprache stehen, die damals galt; der
// Umschalter in den Einstellungen änderte dann alles ausser ihr.
// ───────────────────────────────────────────────────────────────────────────
import type { Bauform } from '../domain/modell'
import type { Uebersetzen } from '../i18n/quelle'

export const bauformText = (t: Uebersetzen): Record<Bauform, string> => ({
  wanddose: t('points.form.wall', 'Wall outlet'),
  bodentank: t('points.form.floorBox', 'Floor box'),
  unterflurdose: t('points.form.underfloor', 'Underfloor outlet'),
  bruestungskanal: t('points.form.trunking', 'Dado trunking'),
  wandauslass: t('points.form.wallOutlet', 'Wall outlet point'),
  sonstige: t('points.form.other', 'Other'),
})
