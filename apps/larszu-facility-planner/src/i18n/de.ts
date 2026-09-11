// ───────────────────────────────────────────────────────────────────────────
// Deutsche Übersetzung des Gebäude-Werkzeugs.
//
// Englisch ist die Quellsprache (E-28, Nutzer-Entscheidung 2026-09-11): sie
// steht als zweites Argument in `t()` direkt im JSX. Hier steht NUR die
// Übersetzung. Fehlt ein Schlüssel, erscheint der englische Quelltext — das
// ist kein Fehler, sondern die Rückfallebene.
//
// Eine weitere Sprache ist eine Datei wie diese plus ein Eintrag in
// `WOERTERBUECHER` (`i18n/index.ts`). Keine Zeile Logik.
//
// WAS HIER NICHT STEHT: die Normbegriffe. `TN-S`, `TN-C-S`, `TT`, `IT`,
// `RCD`, `CEE`, `KNX`, `DALI` sind Namen und keine Beschriftungen — sie
// stehen in jeder Sprache so da, und sie zu übersetzen hiesse, den
// Prüfbericht nicht mehr wiederzufinden.
//
// Sortiert nach Schlüssel, damit ein fehlender Eintrag beim Lesen auffällt
// und zwei Leute nicht an derselben Stelle einfügen.
// ───────────────────────────────────────────────────────────────────────────
export const de: Record<string, string> = {
  // ── Der Vorgabename eines neuen Gebäudes ──
  //
  // Er ist Anzeige UND Datum: die Kopfzeile zeigt ihn, wenn kein Name
  // eingetragen ist, und „Neues Gebäude" schreibt ihn hinein. Beides ist
  // richtig so — es ist ein Name, den der Nutzer ändert, sobald sein Haus
  // anders heisst. Die Rückfallebene beim Laden einer kaputten Datei
  // (`gebaeudeStore`, `gebaeudeDatei`) bleibt dagegen fest englisch: dort
  // gibt es keine Oberfläche, die eine Sprache hätte.
  'building.default': 'Gebäude',

  // ── Was überall gleich heißt ──
  'common.add': 'Anlegen',
  'common.kind': 'Art',
  'common.name': 'Bezeichnung',
  'common.no': 'nein',
  'common.notStated': 'nicht angegeben',
  'common.note': 'Hinweis',
  'common.remove': 'Entfernen',
  'common.room': 'Raum',
  'common.yes': 'ja',

  // ── Der Vertrag (domain/vertrag.ts) ──
  'contract.defect.duplicate': 'Ein Mangel mit der Id „{id}" ist schon gemeldet.',
  'contract.defect.noFinding': 'Ein Mangel ohne Befund ist keine Meldung.',
  'contract.defect.noRecipient':
    'Das Gebäude kennt kein Objekt „{id}" — die Meldung hätte keinen Empfänger.',
  'contract.load.notStated':
    'Dauerleistung nicht angegeben. {a} A (Charakteristik {c}) ist die Auslöseschwelle, nicht die zulässige Dauerlast — sie ergibt sich erst mit Querschnitt, Länge, Häufung und Gleichzeitigkeit.',
  'contract.place.isRoute':
    '„{name}" ist eine Strecke und verbindet zwei Räume — sie hat keinen Ort. Frage ihre Enden.',
  'contract.place.noObject': 'Kein Gebäude-Objekt mit der Id „{id}".',
  'contract.place.noSuchRoom': 'Objekt „{id}" verweist auf den Raum „{raum}", den es nicht gibt.',
  'contract.siblings.noCircuit': 'Für „{name}" ist kein Stromkreis angegeben.',
  'contract.siblings.noPoint': 'Kein Anschlusspunkt mit der Id „{id}".',
  'contract.siblings.noSuchCircuit':
    '„{name}" verweist auf den Stromkreis „{kreis}", den es nicht gibt.',

  // ── Steuerung ──
  'control.address': 'Adresse',
  'control.addressKind': 'Adressart',
  'control.direction': 'Richtung',
  'control.direction.read': 'lesen',
  'control.direction.write': 'schalten',
  'control.empty':
    'Keine Klinke freigegeben. Solange hier nichts steht, darf die Show die Haussteuerung nicht ansprechen — und das ist die richtige Vorgabe: eine Adresse, die niemand beschrieben hat, ist keine Freigabe.',
  'control.kind.broadcast': 'Broadcast — ALLES am Bus',
  'control.kind.broadcast.short': 'Broadcast',
  'control.kind.group': 'Gruppe — alles in dieser Gruppe',
  'control.kind.group.short': 'Gruppe',
  'control.kind.short': 'Kurzadresse — ein Vorschaltgerät',
  'control.kind.short.short': 'Kurzadresse',
  'control.meaning': 'Bedeutung',
  'control.meaning.placeholder': 'Was passiert, wenn man sie benutzt',
  'control.release': 'Freigeben',
  'control.system': 'System',
  'control.table.caption':
    'Hervorgehoben: eine DALI-Adresse ohne Art. „3" ist dort ein Vorschaltgerät, eine Gruppe von dreissig Leuchten oder alles am Bus — die Adresse allein sagt das nicht.',

  // ── Mängel ──
  'defects.col.by': 'Von',
  'defects.col.object': 'Objekt',
  'defects.col.reported': 'Gemeldet',
  'defects.empty':
    'Kein Mangel gemeldet. Was hier fehlt, ist keine Zusicherung — es heisst nur, dass niemand etwas eingetragen hat.',
  'defects.finding': 'Befund',
  'defects.finding.placeholder': 'Was ist aufgefallen',
  'defects.kind.board': 'Verteilung: {name}',
  'defects.kind.circuit': 'Kreis: {name}',
  'defects.kind.hook': 'Klinke: {name}',
  'defects.kind.point': 'Punkt: {name}',
  'defects.kind.room': 'Raum: {name}',
  'defects.report': 'Melden',
  'defects.target.aria': 'Betroffenes Objekt',
  'defects.target.none': '— Objekt wählen —',

  // ── Verteilung ──
  'dist.basis.circuit': 'Stromkreis — Untergrenze, kein RCD angegeben',
  'dist.basis.rcd': 'RCD — vollständig',
  'dist.basis.unknown': 'nicht bekannt',
  'dist.circuit.add': 'Kreis anlegen',
  'dist.circuit.aria': 'Bezeichnung des Stromkreises',
  'dist.circuit.placeholder': 'Neuer Stromkreis',
  'dist.col.basis': 'Grundlage',
  'dist.col.circuits': 'Kreise',
  'dist.col.linkedWith': 'Hängt zusammen mit',
  'dist.col.point': 'Punkt',
  'dist.empty':
    'Noch keine Verteilung. Ein Schaltschrank ist der Ort, an dem die Kreise des Gebäudes anfangen — und der Grund, warum zwei Dosen in verschiedenen Räumen gemeinsam abschalten können.',
  'dist.kind.cabinet': 'Schaltschrank',
  'dist.kind.sub': 'Unterverteilung',
  'dist.new.aria': 'Bezeichnung der Verteilung',
  'dist.new.placeholder': 'Neuer Schaltschrank / neue Unterverteilung',
  'dist.rcd.placeholder': 'RCD (leer = nicht angegeben)',
  'dist.table.boards': 'Verteilungen',
  'dist.table.together': 'Was schaltet gemeinsam ab?',
  'dist.withNothing': 'mit nichts',

  // ── Datei ──
  'file.load.aria': 'Gebäude-Datei laden',
  'file.unreadable':
    'Das ist keine Gebäude-Datei dieses Werkzeugs, oder sie stammt aus einer neueren Fassung. Es wurde nichts übernommen.',
  'file.writeFailed':
    'Der letzte Stand konnte nicht gespeichert werden: {grund}. Was seither eingetragen wurde, steht nur im Fenster.',

  // ── Kopfzeile und Datei-Menü ──
  'menu.about': 'Über Facility Planner…',
  'menu.file': 'Datei',
  'menu.help': 'Hilfe',
  'menu.new': 'Neues Gebäude',
  'menu.new.confirm': 'Neues Gebäude — das aktuelle wird ersetzt. Fortfahren?',
  'menu.open': 'Öffnen…',
  'menu.save': 'Speichern',
  'menu.saveAs': 'Speichern unter…',
  'menu.saveAs.prompt': 'Dateiname',

  // ── Grundriss ──
  'plan.clearPosition': 'Lage löschen',
  'plan.hint.pickFirst': 'Wähle oben einen Punkt und klicke ins Feld, um ihn zu verorten.',
  'plan.hint.without': 'Noch ohne Lage: {namen}.',
  'plan.image.alt': 'Grundriss {name}',
  'plan.image.missing':
    'Das Bild liegt auf diesem Rechner nicht vor. Die Lagen bleiben gültig — sie stehen in Metern, nicht in Pixeln.',
  'plan.image.none':
    'Kein Grundriss hinterlegt. Die Lagen lassen sich trotzdem setzen, sobald ein Massstab da ist.',
  'plan.marker.title': '{name} — {x} m / {y} m',
  'plan.noScale':
    'Ohne Massstab wird nichts gesetzt. Ein Klick ins Bild ist ein Bruchteil einer Bildbreite; erst „Meter je Bildbreite" macht daraus eine Länge. Eine hier geratene Zahl sähe im Plan aus wie eine Auskunft des Hauses.',
  'plan.noRoom':
    'Noch kein Raum angelegt. Ein Grundriss gehört zu einem Raum — lege zuerst unter „Anschlusspunkte" einen an.',
  'plan.notPlaced': 'noch nicht verortet',
  'plan.pick.aria': 'Punkt zum Setzen',
  'plan.pick.none': 'Punkt zum Setzen …',
  'plan.scale': 'Meter je Bildbreite',
  'plan.scale.placeholder': 'm/Bild',
  'plan.source': 'Bildquelle',
  'plan.source.placeholder': 'Bildquelle (Pfad oder URL)',
  'plan.table.caption':
    'Punkte dieses Raums. „Noch nicht verortet" ist eine Angabe und keine Lücke — deshalb steht hier kein 0/0.',
  'plan.x.aria': 'x von {name} in Metern',
  'plan.y.aria': 'y von {name} in Metern',

  // ── Anschlusspunkte ──
  'points.breaker.aria': 'Absicherung von {name}',
  'points.col.breaker': 'Absicherung',
  'points.col.connector': 'Anschluss',
  'points.col.dimmed': 'Gedimmt',
  'points.col.form': 'Bauform',
  'points.col.free': 'Frei',
  'points.col.load': 'Dauerlast',
  'points.col.place': 'Ort',
  'points.col.switched': 'Geschaltet',
  'points.col.system': 'Netzform',
  'points.connector.aria': 'Anschlussart von {name}',
  'points.empty':
    'Noch kein Anschlusspunkt. Ein Punkt ist alles, woran der Aufbau Strom bekommt — die Einspeisung am Schaltschrank ebenso wie die Dose in der Wand. Beide tragen dieselben Angaben, weil ein Plan von beiden dasselbe wissen muss.',
  'points.form.aria': 'Bauform von {name}',
  'points.form.floorBox': 'Bodentank',
  'points.form.other': 'Sonstige',
  'points.form.trunking': 'Brüstungskanal',
  'points.form.underfloor': 'Unterflurdose',
  'points.form.wall': 'Wanddose',
  'points.form.wallOutlet': 'Wandauslass',
  'points.free': 'frei',
  'points.kind.feed': 'Einspeisung',
  'points.kind.outlet': 'Dose',
  'points.new.aria': 'Bezeichnung des Anschlusspunkts',
  'points.new.placeholder': 'Neuer Anschlusspunkt',
  'points.rcd.aria': 'RCD-Typ von {name}',
  'points.room.default': 'Raum 1',
  'points.room.placeholder': 'Raum (wird mit angelegt)',
  'points.system.aria': 'Netzform von {name}',

  // ── Trassen ──
  'routes.add': 'Trasse anlegen',
  'routes.best.free': 'frei',
  'routes.best.full': 'voll',
  'routes.best.none': 'keine Trasse zwischen diesen Räumen',
  'routes.best.partial': 'teilbelegt',
  'routes.best.unknown': 'unbekannt',
  'routes.col.best': 'Bester Weg',
  'routes.col.from': 'Von',
  'routes.col.to': 'Nach',
  'routes.empty': 'Noch keine Trasse erfasst.',
  'routes.from': 'von …',
  'routes.from.aria': 'Von Raum',
  'routes.load': 'Belegung',
  'routes.load.free': 'frei',
  'routes.load.full': 'voll',
  'routes.load.partial': 'teilbelegt',
  'routes.load.unknown': 'unbekannt — niemand hat nachgesehen',
  'routes.name': 'Bezeichnung',
  'routes.name.placeholder': 'Bezeichnung (z. B. Leerrohr Bühne–Regie)',
  'routes.needRooms':
    'Eine Trasse verbindet zwei Räume. Lege zuerst unter „Anschlusspunkte" mindestens zwei Räume an.',
  'routes.note': 'Hinweis',
  'routes.note.placeholder': 'Was liegt schon drin?',
  'routes.to': 'nach …',
  'routes.to.aria': 'Nach Raum',

  // ── Einstellungen ──
  'settings.about': 'Über',
  'settings.about.body': 'Das Gebäude-Werkzeug der AV-Planner-Suite (ADR-006).',
  'settings.close': 'Schliessen',
  'settings.language': 'Sprache',
  'settings.language.hint':
    'Englisch ist die Quellsprache, Deutsch eine Übersetzung. Fehlt ein Eintrag, erscheint der englische Text.',
  'settings.theme': 'Thema',
  'settings.theme.dark': 'Dunkel',
  'settings.theme.dark.hint': 'Immer dunkel, unabhängig vom System.',
  'settings.theme.light': 'Hell',
  'settings.theme.light.hint': 'Immer hell, unabhängig vom System.',
  'settings.theme.system': 'Dem System folgen',
  'settings.theme.system.hint': 'Übernimmt, was das Betriebssystem sagt.',
  'settings.title': 'Einstellungen',

  // ── Schaltstellen ──
  'switches.add': 'Schaltstelle anlegen',
  'switches.assign.aria': 'Punkt zu {name} zuordnen',
  'switches.assign.none': 'hinzufügen …',
  'switches.col.assign': 'Punkt zuordnen',
  'switches.col.source': 'Quelle',
  'switches.col.switched': 'Geschaltet?',
  'switches.col.switches': 'Schaltet',
  'switches.empty': 'Noch keine Schaltstelle erfasst.',
  'switches.name.placeholder': 'Bezeichnung (z. B. Schalter Bühne links)',
  'switches.note.placeholder': 'Hinweis (z. B. schaltet ab 22:00)',
  'switches.origin.hint':
    'Vier Antworten und nicht zwei. „Unbekannt" heisst nicht „nein" — der Unterschied ist der, der im Aufbau zählt.',
  'switches.origin.no': 'nicht geschaltet',
  'switches.origin.point': 'benannte Stelle',
  'switches.origin.stated': 'Angabe des Betreibers, ohne Stelle',
  'switches.origin.title': 'Je Anschlusspunkt: woher wissen wir das?',
  'switches.origin.unknown': 'unbekannt — niemand hat es gesagt',
  'switches.room.none': 'Raum …',
  'switches.type': 'Bauart',
  'switches.type.dimmer': 'Dimmer',
  'switches.type.double': 'Serienschalter',
  'switches.type.intermediate': 'Kreuzschalter',
  'switches.type.key': 'Schlüsselschalter',
  'switches.type.push': 'Taster',
  'switches.type.single': 'Ausschalter',
  'switches.type.timer': 'Zeitschaltuhr',
  'switches.type.twoWay': 'Wechselschalter',

  // ── Reiter und ihre Fragen ──
  'tab.control': 'Steuerung',
  'tab.control.q': 'Welche Klinken der Haussteuerung stehen der Show offen?',
  'tab.defects': 'Mängel',
  'tab.defects.q': 'Was hat jemand von aussen über dieses Gebäude gemeldet?',
  'tab.distribution': 'Verteilung',
  'tab.distribution.q': 'Welche Kreise hängen zusammen — und woran?',
  'tab.floorPlan': 'Grundriss',
  'tab.floorPlan.q': 'Wo im Raum sitzt dieser Punkt — nicht nur in welchem?',
  'tab.points': 'Anschlusspunkte',
  'tab.points.q': 'Was gibt dieser Punkt her, wo ist er, und ist er frei?',
  'tab.routes': 'Trassen',
  'tab.routes.q': 'Welcher Weg zwischen zwei Räumen nimmt noch etwas auf?',
  'tab.switchPoints': 'Schaltstellen',
  'tab.switchPoints.q': 'Wer schaltet diese Dose ab — und wo sitzt er?',
}
