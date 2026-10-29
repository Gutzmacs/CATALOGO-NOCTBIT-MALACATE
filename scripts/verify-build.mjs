import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

// Check the generated pages as GitHub Pages will serve them, including URLs
// emitted by Astro. An asset can exist in dist and still have a broken URL.
const deployedAt = new URL('https://gutzmacs.github.io/CATALOGO-NOCTBIT-MALACATE/');
const products = JSON.parse(await readFile('src/data/products.json', 'utf8'));
const pages = ['index.html', ...products.map(product => `ficha-${product.key}.html`)];
const builtFiles = new Set(await readdir('dist'));
let checked = 0;
for (const page of pages) {
  assert(builtFiles.has(page), `Falta la página compilada: ${page}`);
  const html = await readFile(join('dist', page), 'utf8');
  let modules = 0;
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const attribute = name => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
    const script = /^<script\b/i.test(tag);
    if (!script && attribute('rel') !== 'stylesheet') continue;
    const resource = attribute(script ? 'src' : 'href');
    if (!resource) continue;
    const url = new URL(resource, new URL(page, deployedAt));
    if (url.origin !== deployedAt.origin) continue;
    assert(url.pathname.startsWith(deployedAt.pathname), `${page}: recurso fuera de la carpeta publicada: ${resource}`);
    const file = join('dist', decodeURIComponent(url.pathname.slice(deployedAt.pathname.length)));
    assert((await stat(file)).isFile(), `${page}: no existe el recurso ${resource}`);
    if (script && attribute('type') === 'module') modules++;
    checked++;
  }
  assert(modules > 0, `${page}: falta el módulo del carrito y la guía de tallas`);
}
console.log(`Rutas verificadas: ${pages.length} páginas y ${checked} recursos locales.`);
