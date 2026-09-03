// ───────────────────────────────────────────────────────────────────────────
// Vendortes Feature ohne Bedienweg — der Guard gegen die halbe Kopie.
//
// WORUM ES GEHT. Die Suite vendort die drei Planer Datei fuer Datei. Das
// funktioniert, solange ein Feature in seinen eigenen Dateien lebt. Sobald es
// zusaetzlich ein paar Zeilen in `App.tsx` braucht — Import, State, Knopf,
// Render — kann die Kopie die Dateien mitnehmen und die Zeilen vergessen. Was
// dabei herauskommt, ist die unangenehmste Sorte Fehler: es baut, es testet
// gruen, und das Feature ist trotzdem weg.
//
// GEMESSEN, NICHT BEFUERCHTET. Genau das war der Fall. `apps/light-planner/
// src/inventory/` lag vollstaendig vendort da — drei Dateien, an
// `@avplan/inventory-core` angepasst, in `package.json` als Abhaengigkeit
// eingetragen — und nichts importierte sie. Upstream ist der Dialog
// verdrahtet (`light-planner/src/App.tsx`), in den beiden Schwester-Apps der
// Suite ebenfalls. Nur die vendorte Kopie hatte keinen Knopf.
//
// Der Drift-Guard konnte das nicht sehen: er vergleicht Dateien, die es auf
// beiden Seiten gibt. Eine Datei, die upstream vier Zeilen mehr hat, faellt
// ihm als Drift auf — aber Drift ist dort erwartet und gegen eine Baseline
// abgehakt. Erreichbarkeit ist die andere Frage.
//
// WAS GEPRUEFT WIRD. Fuer jedes Feature unten: liegen seine Dateien in einer
// App, muss dieselbe App sie auch erreichen. Kein Import von aussen heisst
// toter Code — entweder fehlt die Verdrahtung oder die Dateien gehoeren
// geloescht. Beides ist eine Entscheidung, die jemand treffen muss; still
// mitgeschleppt zu werden ist keine.
// ───────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Ein Feature, das in einem eigenen Verzeichnis lebt und von aussen erreicht
 * werden muss. `dir` ist relativ zur App, `entry` die Datei, deren Name im
 * Import auftauchen muss.
 */
const FEATURES = [
  { feature: 'Lager/Inventar', dir: 'src/inventory', entry: 'InventoryDialog' },
];

/** Die vendorten Planer. Der Shell ist keine Kopie und bleibt aussen vor. */
const APPS = ['light-planner', 'multicam-planner', 'cable-planner'];

const SRC_EXT = /\.(ts|tsx)$/;

const walk = (dir) => {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SRC_EXT.test(name)) out.push(full);
  }
  return out;
};

const problems = [];
const geprueftePaare = [];

for (const app of APPS) {
  const appRoot = join(ROOT, 'apps', app);
  for (const { feature, dir, entry } of FEATURES) {
    const featureDir = join(appRoot, dir);
    let vorhanden = false;
    try {
      vorhanden = statSync(featureDir).isDirectory();
    } catch {
      vorhanden = false;
    }
    // Nicht vorhanden ist in Ordnung: nicht jede App fuehrt jedes Feature.
    // Geprueft wird nur, wer die Dateien mitgenommen hat.
    if (!vorhanden) continue;

    geprueftePaare.push(`${app}/${dir}`);
    const aussen = walk(join(appRoot, 'src')).filter(
      (f) => !f.startsWith(featureDir + '/') && f !== featureDir,
    );
    const erreicht = aussen.some((f) => {
      const src = readFileSync(f, 'utf8');
      // Der Import-Pfad endet auf dem Verzeichnis, der Bezeichner ist der
      // Einstieg. Beides zusammen, damit ein gleichnamiger Bezeichner aus
      // einer anderen Ecke nicht faelschlich als Verdrahtung durchgeht.
      return src.includes(entry) && /from\s+['"][^'"]*inventory\//.test(src);
    });
    if (!erreicht) {
      problems.push(
        `${app}: ${feature} liegt unter ${dir}, wird aber von keiner Datei ` +
          `ausserhalb importiert. Entweder fehlt die Verdrahtung in App.tsx ` +
          `(Import, State, Knopf, Render) oder die Dateien gehoeren geloescht.`,
      );
    }
  }
}

if (geprueftePaare.length === 0) {
  console.error(
    '\nKein einziges Feature gefunden — der Guard prueft damit nichts.\n' +
      'Vermutlich haben sich die Pfade in FEATURES geaendert.\n',
  );
  process.exit(1);
}

if (problems.length > 0) {
  console.error('\nVendortes Feature ohne Bedienweg:\n');
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\nEs baut und testet gruen, und das Feature ist trotzdem weg. Genau ' +
      'deshalb steht dieser Guard hier.\n',
  );
  process.exit(1);
}

// Ausdruecklich nur die Paare nennen, die es wirklich gab. `cable-planner`
// legt sein Inventar unter `src/renderer/components/Inventory/` ab und faellt
// damit nicht unter diese Regel — das zu verschweigen hiesse, eine Pruefung zu
// behaupten, die nicht stattgefunden hat.
console.log(`OK ${geprueftePaare.length} vendorte Feature-Kopie(n) von aussen erreichbar:`);
for (const paar of geprueftePaare) console.log(`   ${paar}`);
const ungeprueft = APPS.filter((a) => !geprueftePaare.some((p) => p.startsWith(`${a}/`)));
if (ungeprueft.length > 0) {
  console.log(`   nicht unter dieser Regel (anderes Layout): ${ungeprueft.join(', ')}`);
}
