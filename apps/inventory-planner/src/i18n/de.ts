// ───────────────────────────────────────────────────────────────────────────
// Deutsche Übersetzung des Lagers.
//
// Englisch ist die Quellsprache (E-28, Nutzer-Entscheidung 2026-09-11): sie
// steht als zweites Argument in `t()` direkt im JSX. Hier steht NUR die
// Übersetzung. Fehlt ein Schlüssel, erscheint der englische Quelltext — das
// ist kein Fehler, sondern die Rückfallebene.
//
// Eine weitere Sprache ist eine Datei wie diese plus ein Eintrag in
// `WOERTERBUECHER` (`i18n/index.ts`). Keine Zeile Logik.
//
// Sortiert nach Schlüssel, damit ein fehlender Eintrag beim Lesen auffällt
// und zwei Leute nicht an derselben Stelle einfügen.
// ───────────────────────────────────────────────────────────────────────────
export const de: Record<string, string> = {
  // ── Inventur (Sicht + domain/lib/inventoryAudit.ts) ──
  'audit.cam.back': 'Auf Rückkamera',
  'audit.cam.front': 'Auf Frontkamera',
  'audit.cam.hint':
    'Erkannte Codes landen in derselben Liste wie getippte. Wer zweimal dasselbe Etikett vor die Kamera hält, bekommt zwei Zeilen — dazwischen liegt eine Sperre von anderthalb Sekunden, damit ein Aufkleber im Bild nicht dreissig Zeilen pro Sekunde erzeugt.',
  'audit.cam.off': 'Kamera aus',
  'audit.cam.on': 'Mit Kamera scannen',
  'audit.code': 'Kennung',
  'audit.code.aria': 'Kennung des Lagerplatzes',
  'audit.code.placeholder': 'Kennung des Regals / Raums',
  'audit.col.checkedAt': 'Geprüft an',
  'audit.col.code': 'Code',
  'audit.col.expected': 'Erwartet in',
  'audit.col.model': 'Modell',
  'audit.col.object': 'Objekt',
  'audit.col.outcome': 'Ergebnis',
  'audit.col.via': 'Wie erfasst',
  'audit.col.viaShort': 'Wie',
  'audit.expectedHere': 'Soll hier liegen ({n})',
  'audit.expectedIn': 'erwartet in',
  'audit.isHere': 'liegt hier',
  'audit.missing': 'Fehlt ({n})',
  'audit.missing.allFound': 'Alles, was hier liegen soll, wurde erfasst.',
  'audit.missing.none': 'Hier wurde nichts erwartet — es kann also auch nichts fehlen.',
  'audit.noCam': 'Kein Kamera-Scan auf diesem Gerät.',
  'audit.noCode': 'ohne Code',
  'audit.noPrefix':
    'Kein Prefix hinterlegt — dann prüft an dieser Stelle nichts. Trage die Hausregel ein, wenn es eine gibt.',
  'audit.noSuchPlace': 'Kein Lagerplatz mit der Kennung „{code}".',
  'audit.notFound': 'Nicht gefunden',
  'audit.nothingExpected':
    'Der Datensatz verortet hier nichts. Das ist etwas anderes als „hier ist nichts" — es kann auch heißen, dass für die Objekte hier nie ein Lagerort hinterlegt wurde.',
  'audit.nothingRecorded': 'Noch nichts erfasst.',
  'audit.outcome.here': 'Am erwarteten Ort',
  'audit.outcome.isLocation': 'Das ist ein Lagerort, kein Objekt',
  'audit.outcome.noLocation': 'Ohne Lagerort im Datensatz',
  'audit.outcome.unknown': 'Nicht im Bestand',
  'audit.outcome.wrong': 'Am falschen Ort',
  'audit.pick.aria': 'Lagerplatz aus der Liste wählen',
  'audit.pickWithoutScan': 'Ohne Scan wählen',
  'audit.place': 'Lagerplatz',
  'audit.placeFirst':
    'Erst der Ort, dann die Objekte. Ohne ihn kann keine Zeile sagen, ob etwas am richtigen Platz liegt — das ist die ganze Frage einer Inventur.',
  'audit.prefix': 'Erwarteter Prefix',
  'audit.prefix.aria': 'Erwarteter Prefix für Lagerplätze',
  'audit.prefix.placeholder': 'z. B. L#',
  'audit.prefixMismatch':
    '„{code}" fängt nicht mit „{prefix}" an. Das ist die Kennung eines Lagerplatzes im Haus — steht sie am Case statt am Regal, wird gleich am falschen Ort inventiert.',
  'audit.record': 'Erfassen',
  'audit.recorded': 'Erfasst ({n})',
  'audit.scan.aria': 'Code des Objekts',
  'audit.scan.placeholder': 'Code scannen oder eintippen, Enter',
  'audit.sheet': 'Blatt laden (CSV)',
  'audit.step1': 'Schritt 1: Lagerplatz',
  'audit.step2': 'Schritt 2: Objekte an {place}',
  'audit.torch.off': 'Licht aus',
  'audit.torch.on': 'Licht an',
  'audit.via.pick': 'aus der Liste',
  'audit.via.scan': 'gescannt',
  'audit.viewfinder': 'Kamerabild',

  // ── Werte & Schäden: Prüffristen ──
  'checks.ageMonths': '{n} Mon. alt',
  'checks.ageNote':
    'Das Alter neben der Einheit kommt aus ihrem Kaufdatum und ist eine Angabe, kein Urteil: ab wann ein Akku zu alt ist, entscheidet das Haus — als Frist der Art „Akku".',
  'checks.allClear': 'Nichts überfällig und nichts in den nächsten {n} Tagen fällig.',
  'checks.col.days': 'Tage',
  'checks.col.due': 'fällig',
  'checks.col.kind': 'Art',
  'checks.col.model': 'Modell',
  'checks.col.source': 'Termin',
  'checks.col.unit': 'Einheit',
  'checks.coverage.full':
    'Jede Einheit trägt mindestens eine Frist; die Ampel deckt den ganzen Bestand.',
  'checks.coverage.many':
    'Für {n} Einheiten ist keine Frist hinterlegt — über sie sagt diese Ampel nichts, weder „geprüft" noch „fällig".',
  'checks.coverage.one':
    'Für eine Einheit ist keine Frist hinterlegt — über sie sagt diese Ampel nichts, weder „geprüft" noch „fällig".',
  'checks.daysOver': '{n} über',
  'checks.dueIn': 'fällig in {n} Tagen',
  'checks.empty':
    'Keine serialisierten Einheiten. Eine Prüffrist hängt am einzelnen Gerät, nicht am Modell — „die ULXD2 sind im März geprüft" ist eine Aussage über zwölf Geräte, von denen zwei in der Werkstatt standen.',
  'checks.interval': 'Intervall (Monate)',
  'checks.interval.aria': 'Intervall in Monaten',
  'checks.kinds.add': 'Art anlegen',
  'checks.kinds.basis': 'Grundlage',
  'checks.kinds.basis.aria': 'Grundlage der Frist',
  'checks.kinds.basis.example': 'z. B. DGUV Regel 100-500',
  'checks.kinds.every': 'alle {n} Mon.',
  'checks.kinds.hint':
    'Eingebaut sind {n} Arten. Alles, was dieses Haus zusätzlich prüft oder ablaufen lässt, steht hier — und reist in der Lager-Datei mit, damit ein Termin drüben nicht ohne seinen Grund ankommt.',
  'checks.kinds.interval.aria': 'Vorschlag für das Intervall',
  'checks.kinds.name': 'Name',
  'checks.kinds.name.aria': 'Name der neuen Fristart',
  'checks.kinds.name.example': 'z. B. Anschlagmittel',
  'checks.kinds.remove.title':
    'Eingetragene Termine dieser Art bleiben bestehen und werden danach als unbekannte Art angezeigt.',
  'checks.kinds.title': 'Eigene Fristarten ({n})',
  'checks.later': 'später',
  'checks.leadTime': 'Vorwarnzeit (Tage)',
  'checks.leadTime.aria': 'Vorwarnzeit in Tagen',
  'checks.new.add': 'Frist eintragen',
  'checks.new.kind.aria': 'Art der Frist',
  'checks.new.last': 'zuletzt erledigt',
  'checks.new.last.aria': 'Datum der letzten Erledigung',
  'checks.new.unit.aria': 'Einheit für die neue Frist',
  'checks.new.unit.none': '— Einheit —',
  'checks.overdue': 'überfällig',
  'checks.source.derived': 'aus Intervall',
  'checks.source.entered': 'eingetragen',
  'checks.title': 'Fristen',
  'checks.withoutDate': 'ohne Frist hinterlegt',

  // ── Gebunden (domain/lib/inventoryCommitment.ts) ──
  'committed.col.committed': 'gebunden',
  'committed.col.inStock': 'im Bestand',
  'committed.col.item': 'Artikel',
  'committed.col.where': 'wo',
  'committed.hint':
    'Diese Stücke zählt der Bestand mit, im Regal liegen sie nicht. Wer das nicht sieht, sucht das fünfte Stück dort, wo es nicht mehr ist.',
  'committed.none': 'Nichts gebunden — alle Ausgaben sind zurück.',
  'committed.note': '{n} auf offener Ausgabe ({where})',
  'committed.title': 'Auf offenen Ausgaben ({n})',

  // ── Was überall gleich heißt ──
  'common.notStated': 'nicht angegeben',
  'common.remove': 'Entfernen',

  // ── Schäden (domain/lib/damageRegister.ts) ──
  'damage.by.container': 'Container',
  'damage.by.person': 'Person',
  'damage.by.show': 'Show',
  'damage.col.count': 'Schäden',
  'damage.col.note': 'Vermerk',
  'damage.col.object': 'Objekt',
  'damage.col.with': 'bei',
  'damage.countBy': 'Zählen nach',
  'damage.countBy.aria': 'Schäden zählen nach',
  'damage.csv.container': 'Container',
  'damage.csv.damage': 'Schaden',
  'damage.csv.issuedTo': 'Ausgegeben an',
  'damage.csv.labelCode': 'Etiketten-Code',
  'damage.csv.noLabel': 'kein Etikett',
  'damage.csv.object': 'Objekt',
  'damage.csv.returnedOn': 'Zurück am',
  'damage.csv.show': 'Show',
  'damage.csvButton': 'Schadensregister (CSV)',
  'damage.empty':
    'Bei keiner Rückgabe wurde ein Schaden aufgenommen. Das ist etwas anderes als „nichts ist kaputt": es heißt, dass nichts vermerkt wurde.',
  'damage.title': 'Schäden ({n})',
  'damage.unnamed': 'nicht benannt',

  // ── Fristarten (domain/lib/fristen.ts) ──
  'deadline.kind.battery': 'Akku',
  'deadline.kind.calibration': 'Kalibrierung',
  'deadline.kind.other': 'Sonstige',
  'deadline.kind.service': 'Wartung',
  'deadline.kind.shelfLife': 'Haltbarkeit',
  'deadline.kind.unknown': '{id} (unbekannte Art)',

  // ── Ausgabescheine ──
  'checkouts.col.case': 'Container',
  'checkouts.col.due': 'Zurück bis',
  'checkouts.col.lines': 'Positionen',
  'checkouts.col.out': 'Ausgegeben',
  'checkouts.col.project': 'Projekt',
  'checkouts.col.to': 'An',
  'checkouts.count': '{open} offen, davon {late} überfällig · {all} insgesamt',
  'checkouts.empty':
    'Noch kein Ausgabeschein. Ein Schein entsteht, wenn ein Container das Lager verlässt — und er hält fest, was wirklich drin war, nicht was drin sein sollte.',
  'checkouts.noDue': 'kein Termin vereinbart',

  // ── Kopfzeile und Datei-Menü ──
  'brand': 'Lager',
  'file.importReport': '{ok} übernommen, {no} abgewiesen.',
  'file.unreadable': 'Die Datei ist kein lesbarer Lagerbestand (avplan-inventory).',
  'menu.about': 'Über Inventory Planner…',
  'menu.file': 'Datei',
  'menu.help': 'Hilfe',
  'menu.new': 'Neues Lager',
  'menu.new.confirm': 'Neues Lager — der aktuelle Bestand wird ersetzt. Fortfahren?',
  'menu.open': 'Öffnen…',
  'menu.save': 'Speichern',
  'menu.saveAs': 'Speichern unter…',
  'menu.saveAs.prompt': 'Dateiname',

  // ── Einstellungen ──
  'settings.about': 'Über',
  'settings.about.body': 'Das Lager der AV-Planner-Suite (ADR-006).',
  'settings.close': 'Schliessen',
  'settings.language': 'Sprache',
  'settings.language.hint':
    'Englisch ist die Quellsprache, Deutsch eine Übersetzung. Ein fehlender Eintrag fällt auf Englisch zurück.',
  'settings.theme': 'Thema',
  'settings.theme.dark': 'Dunkel',
  'settings.theme.dark.hint': 'Immer dunkel, unabhängig vom System.',
  'settings.theme.light': 'Hell',
  'settings.theme.light.hint': 'Immer hell, unabhängig vom System.',
  'settings.theme.system': 'Dem System folgen',
  'settings.theme.system.hint': 'Übernimmt, was das Betriebssystem sagt.',
  'settings.title': 'Einstellungen',

  // ── Eigentum (domain/lib/ownership.ts) ──
  'ownership.back': 'zurück',
  'ownership.backSince': 'zurück seit',
  'ownership.noReturnDate': 'kein Rückgabedatum',
  'ownership.owned': 'Eigen',
  'ownership.rented': 'Gemietet',
  'ownership.subhire': 'Sub-Hire',
  'ownership.supplierUnknown': 'Lieferant unbekannt',

  // ── Bestand ──
  'stock.aria.ownership': 'Eigentum von {model}',
  'stock.aria.qty': 'Menge von {model}',
  'stock.aria.target': 'Mindestmenge von {model}',
  'stock.col.category': 'Kategorie',
  'stock.col.location': 'Lagerort',
  'stock.col.model': 'Modell',
  'stock.col.ownership': 'Eigentum',
  'stock.col.qty': 'Menge',
  'stock.col.supplier': 'Lieferant',
  'stock.col.target': 'Ziel',
  'stock.countOf': '{shown} von {all}',
  'stock.create': 'Anlegen',
  // suite#231 — der Bestand hat jetzt einen eigenen Anlege-Block und einen
  // eigenen Zustand fuer „Suche ohne Treffer".
  'stock.create.head': 'In den Bestand aufnehmen',
  'stock.noHit': 'Nichts passt zu „{q}". Im Bestand stehen {all} Modelle.',
  'stock.clearSearch': 'Suche zuruecksetzen',
  'stock.empty':
    'Noch nichts im Bestand. Anlegen — oder eine vorhandene Lagerdatei einlesen; das Format ist zwischen den Werkzeugen dasselbe.',
  'stock.newModel': 'Neues Modell',
  'stock.newModel.aria': 'Modellbezeichnung',
  'stock.ownership.unset': 'nicht angegeben',
  'stock.remove': 'Entfernen',
  'stock.search': 'Suchen — Modell, Hersteller, Lieferant, Ort',
  'stock.search.aria': 'Bestand durchsuchen',
  'stock.target.title': 'Ab wann nachbestellt oder sub-hired wird. Leer heisst: nicht festgelegt.',
  'stock.targetExplain':
    'Ziel ist die Mindestmenge, ab der nachbestellt oder sub-hired wird — eine Entscheidung des Hauses, keine Vorgabe aus einer Show. Leer heisst nicht null, sondern nicht festgelegt; solche Artikel führt der Bericht unter „unbewertet" statt unter „reicht". Wie es aktuell steht, sagt dort der Block „Unter Ziel".',

  // ── Scannen und Beleg-Erkennung (lib/codeLeser.ts, lib/belegOcr.ts) ──
  'ocr.blocked.cancelled': 'Die Texterkennung wurde abgebrochen. Der Beleg ist unverändert.',
  'ocr.blocked.noLangData':
    'Die Sprachdaten für die Texterkennung sind nicht hinterlegt. Sie gehören als `deu.traineddata.gz` nach `public/tessdata/` — die Anleitung dazu liegt daneben. Bis dahin bleibt der Weg über eingefügten Text.',
  'ocr.blocked.noWorker':
    'Die Texterkennung liess sich nicht starten. Bis das geklärt ist, bleibt der Weg über eingefügten Text.',
  'scan.blocked.denied':
    'Die Kamera wurde abgelehnt. Im Browser über das Schloss-Symbol in der Adresszeile wieder freigeben.',
  'scan.blocked.insecure':
    'Die Seite läuft nicht über https oder localhost. Browser geben die Kamera nur in einem sicheren Kontext frei.',
  'scan.blocked.noApi': 'Dieser Browser stellt keine Kamera bereit (`navigator.mediaDevices` fehlt).',
  'scan.blocked.noDecoder':
    'Der mitgelieferte Barcode-Leser liess sich nicht laden. Solange das so ist, bleibt der Handscanner (er tippt in das Feld) oder „Ohne Scan wählen".',

  // ── Wareneingang ──
  'receiving.allReadable': 'Jede Zeile ist lesbar.',
  'receiving.book.many': '{n} Zeilen buchen',
  'receiving.book.one': '1 Zeile buchen',
  'receiving.booked': '{raised} Artikel erhöht, {created} Artikel neu angelegt.',
  'receiving.booked.hint': 'Der Beleg bleibt stehen, damit nachsehbar ist, was gerade passiert ist.',
  'receiving.case.create': 'Artikel anlegen',
  'receiving.case.raise': 'Menge erhöhen',
  'receiving.case.skipped': 'nicht gebucht',
  'receiving.col.after': 'Bestand danach',
  'receiving.col.becomes': 'daraus',
  'receiving.col.item': 'Artikel',
  'receiving.col.line': 'Zeile',
  'receiving.col.qty': 'Menge',
  'receiving.lines.aria': 'Positionen des Lieferscheins',
  'receiving.noQty': 'ohne Menge, offen',
  'receiving.ocr.aria': 'Foto oder Scan des Lieferscheins',
  'receiving.ocr.confidence': 'Erkennung {n} % sicher — Zeilen bitte durchsehen.',
  'receiving.ocr.running': 'Beleg wird gelesen…',
  'receiving.ocr.start': 'Beleg-Foto einlesen',
  'receiving.optional': 'optional',
  'receiving.ownership': 'Eigentum',
  'receiving.ownership.aria': 'Eigentum der neuen Artikel',
  'receiving.ownership.hint':
    'Das Eigentum gilt für die Artikel, die NEU angelegt werden. Was das Haus zumietet, gehört auf die Sub-Hire-Liste — eine Vorgabe wäre für die Hälfte der Lieferungen falsch, und zwar die teurere Hälfte.',
  'receiving.preview': 'Was daraus würde',
  'receiving.reason.empty': 'leere Zeile',
  'receiving.reason.noName': 'keine Bezeichnung in der ersten Spalte',
  'receiving.reason.notAQty': '„{value}" ist keine Menge',
  'receiving.reason.notSeparable': 'Menge und Bezeichnung nicht zu trennen',
  'receiving.receipt': 'Beleg',
  'receiving.receipt.hint':
    'Positionen aus dem Lieferschein hier hineinschreiben oder einfügen — eine je Zeile. Lesbar sind „4 x Shure ULXD2", „Shure ULXD2; 4; 249,00" (Semikolon oder Tabulator, wie aus einem Portal) und der blosse Name. Beim blossen Namen fehlt die Menge, und sie wird nicht als 1 erfunden.',
  'receiving.supplier': 'Lieferant',
  'receiving.unreadable.many':
    '{n} Zeilen sind nicht lesbar und werden nicht gebucht — sie stehen unten mit dem Grund.',
  'receiving.unreadable.one':
    'Eine Zeile ist nicht lesbar und wird nicht gebucht — sie steht unten mit dem Grund.',

  // ── Bericht: Packliste und Austausch ──
  'report.allPriced': 'Jede Zeile trägt einen Mietpreis; der Tagessatz deckt den ganzen Bestand.',
  'report.below.exact':
    '{n} Artikel liegen genau darauf — die nächste Ausgabe reisst die Lücke auf.',
  'report.below.n': '{n} Artikel liegen unter ihrer hinterlegten Mindestmenge.',
  'report.below.none': 'Kein Artikel liegt unter seiner hinterlegten Mindestmenge.',
  'report.below.unrated':
    'Für {n} weitere Artikel ist keine Mindestmenge hinterlegt; über sie sagt diese Liste nichts.',
  'report.belowTarget': 'Unter Soll',
  'report.by.category': 'Kategorie',
  'report.by.condition': 'Zustand der Einheit',
  'report.by.location': 'Lagerort',
  'report.by.material': 'Materialart',
  'report.by.ownership': 'Eigentum',
  'report.col.lines': 'Zeilen',
  'report.col.pieces': 'Stück',
  'report.csv.available': 'verfügbar',
  'report.csv.category': 'Kategorie',
  'report.csv.committed': 'gebunden',
  'report.csv.item': 'Artikel',
  'report.csv.short': 'Fehlmenge',
  'report.csv.stock': 'Bestand',
  'report.csv.target': 'Soll',
  'report.exchange': 'Bestand austauschen',
  'report.import.badFile':
    '„{name}" ist keine Datei im Format avplan-inventory — oder ihre Version ist neuer als die, die diese App liest.',
  'report.importFile.aria': 'Einzulesende Datei',
  'report.importMode.aria': 'Wie soll eingelesen werden',
  'report.importMode.merge': 'zusammenführen (nichts geht verloren)',
  'report.importMode.replace': 'ersetzen (der Bestand wird überschrieben)',
  'report.noPrice':
    '{without} von {all} Zeilen tragen keinen Mietpreis — der Tagessatz oben ist die Summe über den Rest, nicht über den Bestand.',
  'report.noTargets':
    'Nicht einer der {n} Artikel im Bestand hat eine Mindestmenge. Ohne so eine Zahl gibt es nichts zu vergleichen — die Spalte „Soll" in der Bestandssicht setzt sie.',
  'report.packList': 'Packliste',
  'report.packRoot.aria': 'Wurzel-Lagerort für die Packliste',
  'report.printBlocked': 'Das Blatt liess sich nicht öffnen — der Browser hat das Fenster blockiert.',
  'report.reorder.hint': 'Nur die Artikel unter Soll, mit der Fehlmenge.',
  'report.reorder.none': 'Nichts nachzubestellen.',
  'report.stockEmpty': 'Der Bestand ist leer — es gibt nichts zu vergleichen.',
  'report.tile.belowTarget': 'unter Soll',
  'report.tile.dailyRate': 'Tagessatz',
  'report.tile.dueChecks': 'Fristen fällig',
  'report.tile.lines': 'Zeilen',
  'report.tile.pieces': 'Stück insgesamt',
  'report.tile.units': 'serialisierte Einheiten',
  'report.exchange.export': 'Bestand exportieren',
  'report.exchange.format':
    'Format {name} — dieselbe Datei, die die Planer der Suite schreiben und lesen.',
  'report.exchange.onImport': 'Beim Einlesen',
  'report.packList.count': '{nodes} Knoten, {pieces} Stück.',
  'report.packList.empty':
    'Kein Wurzel-Lagerort angelegt. Eine Packliste beschreibt einen Container mit allem, was darin liegt — ohne Baum gibt es nichts zu beschreiben.',
  'report.packList.open': 'Blatt öffnen (A4)',
  'report.packList.root': 'Wurzel',

  // ── Sub-Hire ──
  'subhire.allTable': 'Alles fremde Material',
  'subhire.col.contract': 'Vertrag',
  'subhire.col.date': 'Termin',
  'subhire.col.model': 'Modell',
  'subhire.col.note': 'Vermerk',
  'subhire.col.qty': 'Menge',
  'subhire.col.supplier': 'Lieferant',
  'subhire.count': '{foreign} fremde Positionen · {due} brauchen eine Entscheidung',
  'subhire.dueTable': 'Zurück — überfällig oder ohne Termin',
  'subhire.empty':
    'Kein fremdes Material im Bestand. Was hier fehlt, ist keine Zusicherung: eine Position ohne Angabe zum Eigentum gilt als eigene — sie steht deshalb nicht auf dieser Liste, auch wenn sie gemietet ist.',
  'subhire.noDate': 'kein Rückgabedatum',
  'subhire.since': 'seit',
  'subhire.unknown': 'unbekannt',

  // ── Werte (domain/lib/insuranceSchedule.ts) ──
  'values.carnet.description': 'Beschreibung',
  'values.carnet.origin': 'Ursprungsland',
  'values.carnet.purchasePrice': 'Anschaffungspreis',
  'values.carnet.weight': 'Gewicht (kg)',
  'values.carnetButton': 'Carnet-Datenblatt (CSV)',
  'values.col.value': 'Wert',
  'values.csv.asOf': 'Stand',
  'values.csv.currency': 'Währung',
  'values.csv.houseRef': 'Hausreferenz',
  'values.csv.insuredValue': 'Versicherungswert',
  'values.csv.model': 'Modell',
  'values.csv.serial': 'Herstellernummer',
  'values.csv.sum': 'Summe ({n} Einheiten)',
  'values.csv.withoutValue': '{n} Einheiten ohne angegebenen Versicherungswert',
  'values.csvButton': 'Versicherungsliste (CSV)',
  'values.empty':
    'Keine serialisierten Einheiten. Ein Versicherungswert hängt an der einzelnen Einheit, nicht am Modell — ohne Einheiten gibt es nichts zu bewerten.',
  'values.noneValued': 'Keine einzige Einheit trägt einen Wert — es gibt nichts zu summieren.',
  'values.ofUnits': '{n} von {all} Einheiten',
  'values.title': 'Werte',
  'values.units.title': 'Einheiten mit Wert',
  'values.withoutValue.many':
    '{n} Einheiten ohne hinterlegten Wert — sie gehen in keine Summe oben ein:',
  'values.withoutValue.one':
    'Eine Einheit ohne hinterlegten Wert — sie geht in keine Summe oben ein:',

  // ── Reiter und ihre Fragen ──
  'tab.audit': 'Inventur',
  'tab.audit.q': 'Liegt hier, was hier liegen soll?',
  'tab.checkouts': 'Ausgabescheine',
  'tab.checkouts.q': 'Was ist draußen, bei wem, und seit wann?',
  'tab.receiving': 'Wareneingang',
  'tab.receiving.q': 'Was ist gekommen — und was macht das mit dem Bestand?',
  'tab.report': 'Bericht',
  'tab.report.q': 'Was steckt drin — und wie kommt es hier raus?',
  // ── Statusleiste (suite#231, ADR-007 Abschnitt 6) ──────────────────────
  // Je Reiter eine Zahl. Nichts davon wertet — es sind Anzahlen.
  'status.stock': '{n} Modelle · {p} Lagerplaetze',
  'status.checkouts': '{n} Ausgabescheine · {out} noch draussen',
  'status.subhire': '{n} Positionen gehoeren uns nicht',
  'status.units': '{n} serialisierte Einheiten',

  'tab.stock': 'Bestand',
  'tab.stock.q': 'Was ist da, wieviel, und wo liegt es?',
  'tab.subhire': 'Sub-Hire',
  'tab.subhire.q': 'Was gehört uns nicht — und wann muss es zurück?',
  'tab.values': 'Werte & Schäden',
  'tab.values.q': 'Was ist es wert, was ist kaputt, und was ist gebunden?',
}
