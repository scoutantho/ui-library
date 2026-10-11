#!/usr/bin/env node
// Ajoute un élément Uiverse à la bibliothèque.
// Usage : node scripts/add-uiverse.mjs <url-uiverse> [<url-uiverse> ...]
// Exemple : node scripts/add-uiverse.mjs https://uiverse.io/joe-watson-sbf/little-goat-24
//
// Le code de l'élément est embarqué dans la page (champs JSON "html" et "css") ;
// on les extrait tels quels. Nécessite curl dans le PATH.

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'components');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/** Lit la chaîne JSON qui suit `"key":"` dans la page (gère les échappements). */
function grabJsonString(page, key) {
  const start = page.indexOf(`"${key}":"`);
  if (start < 0) return null;
  let i = start + key.length + 4;
  let raw = '';
  while (i < page.length) {
    const ch = page[i];
    if (ch === '\\') { raw += ch + page[i + 1]; i += 2; continue; }
    if (ch === '"') break;
    raw += ch;
    i++;
  }
  return JSON.parse(`"${raw}"`);
}

function grabJsonBool(page, key) {
  const m = page.match(new RegExp(`"${key}":(true|false)`));
  return m ? m[1] === 'true' : null;
}

function slugCategory(word) {
  const map = { button: 'buttons', card: 'cards', loader: 'loaders', input: 'inputs', checkbox: 'checkboxes',
    toggle: 'toggles', switch: 'toggles', form: 'forms', pattern: 'patterns', tooltip: 'tooltips',
    radio: 'radios', notification: 'notifications' };
  const w = word.toLowerCase();
  return map[w] ?? `${w}s`;
}

async function addOne(url) {
  const u = new URL(url);
  if (!u.hostname.endsWith('uiverse.io')) throw new Error(`URL non Uiverse : ${url}`);
  const [author, slug] = u.pathname.split('/').filter(Boolean);
  if (!author || !slug) throw new Error(`URL attendue : https://uiverse.io/<auteur>/<element> (${url})`);

  // curl plutôt que fetch : Cloudflare bloque l'empreinte TLS de Node (403) mais laisse passer curl.
  let page;
  try {
    page = execFileSync('curl', ['-sSf', '-A', UA, '-H', 'Accept: text/html', url], {
      encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
    });
  } catch (e) {
    throw new Error(`Téléchargement impossible (${url}) : ${e.stderr?.toString().trim() || e.message}`);
  }

  const html = grabJsonString(page, 'html');
  const css = grabJsonString(page, 'css');
  if (html == null || css == null) throw new Error(`Code introuvable dans la page ${url}`);
  const isTailwind = grabJsonBool(page, 'isTailwind') ?? false;

  const title = (page.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '';
  // Titre type : « Card by ilkhoeri made with CSS | Uiverse.io »
  const kind = (title.match(/^(\S+)\s+by\s/) ?? [])[1] ?? 'Misc';
  const category = slugCategory(kind);
  const id = `${author}-${slug}`;
  const dir = join(COMPONENTS, category, id);
  await mkdir(dir, { recursive: true });

  const header = `<!-- Source : ${url} — auteur : ${author} — licence MIT (Uiverse.io) -->\n`;
  const body = isTailwind
    ? `${header}<script src="https://cdn.tailwindcss.com/3.4.17"></script>\n${html}\n`
    : `${header}${html.trim()}\n\n<style>\n${css.trim()}\n</style>\n`;
  await writeFile(join(dir, 'component.html'), body);

  const readmePath = join(dir, 'README.md');
  if (!existsSync(readmePath)) {
    await writeFile(readmePath, `# ${kind} — ${slug}

| | |
|---|---|
| Source | ${url} |
| Auteur | [${author}](https://uiverse.io/profile/${author}) |
| Licence | MIT (tout le contenu Uiverse.io est sous licence MIT) |
| Type | ${kind}${isTailwind ? ' (Tailwind)' : ' (CSS pur)'} |
| Ajouté le | ${new Date().toISOString().slice(0, 10)} |
| Utilisé dans | — |

## Notes d'intégration

-
`);
  }

  const meta = { id, kind, category, author, slug, url, isTailwind, addedAt: new Date().toISOString().slice(0, 10) };
  const metaPath = join(dir, 'meta.json');
  if (existsSync(metaPath)) meta.addedAt = JSON.parse(await readFile(metaPath, 'utf8')).addedAt;
  await writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n');
  console.log(`✔ ${category}/${id}`);
}

/** Régénère catalog.js (chargé par index.html, fonctionne aussi en file://). */
async function buildCatalog() {
  const items = [];
  if (existsSync(COMPONENTS)) {
    for (const cat of await readdir(COMPONENTS)) {
      for (const id of await readdir(join(COMPONENTS, cat))) {
        const metaPath = join(COMPONENTS, cat, id, 'meta.json');
        if (!existsSync(metaPath)) continue;
        const meta = JSON.parse(await readFile(metaPath, 'utf8'));
        meta.path = relative(ROOT, join(COMPONENTS, cat, id)).replaceAll('\\', '/');
        // Code embarqué : la galerie l'affiche en srcdoc, ce qui marche aussi en file://.
        meta.code = await readFile(join(COMPONENTS, cat, id, 'component.html'), 'utf8');
        items.push(meta);
      }
    }
  }
  items.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
  await writeFile(join(ROOT, 'catalog.js'), `window.CATALOG = ${JSON.stringify(items, null, 2)};\n`);
  console.log(`catalog.js : ${items.length} élément(s)`);
}

const urls = process.argv.slice(2);
let failed = 0;
for (const url of urls) {
  try { await addOne(url); } catch (e) { failed++; console.error(`✘ ${e.message}`); }
}
await buildCatalog();
process.exit(failed ? 1 : 0);
