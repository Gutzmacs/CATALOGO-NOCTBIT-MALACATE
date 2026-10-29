import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://gutzmacs.github.io',
  base: '/CATALOGO-NOCTBIT-MALACATE',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'never',
  devToolbar: { enabled: false },
});
