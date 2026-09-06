import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { resolve } from 'node:path';
import { cpSync, mkdirSync } from 'node:fs';

const root = import.meta.dirname;
const base = '/nancy-toybox/tennis-world/';
const output = resolve(root, 'pages-dist');

// The local app uses origin-relative media. Only this static target rebases those
// literals; the Vinext development app and its navigation remain unchanged.
const pagesAssets: Plugin = {
  name: 'nancy-pages-assets',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('/node_modules/') || !/\.(tsx?|css)$/.test(id)) return;
    let result = code.replace(/(["'`])\/(assets|fonts|films|tennis-world)\//g, `$1${base}$2/`);
    if (id.endsWith('/app/tennis-world/page.tsx')) result = result.replaceAll('href="/"', 'href="https://hellonancy.com/"').replace('Original local homepage ↗', 'Hello Nancy ↗');
    return { code: result, map: null };
  },
  closeBundle() {
    const paths = [
      'assets/nancy-logo.png',
      'fonts/ESRebondGrotesque-Regular.woff',
      'fonts/ESRebondGrotesque-Semibold.woff',
      'fonts/Fraunces-Regular.woff',
      'tennis-world/soft-machines',
      'tennis-world/ace-official.png',
      'tennis-world/smash-official.png',
      'tennis-world/embrace.png',
      'tennis-world/contact.png',
      'tennis-world/creative-direction.md',
      'tennis-world/asset-ledger.md',
    ];
    for (const path of paths) {
      const target = resolve(output, path);
      mkdirSync(resolve(target, '..'), { recursive: true });
      cpSync(resolve(root, 'public', path), target, { recursive: true });
    }
  },
};

export default defineConfig({
  root: resolve(root, 'pages'),
  base,
  publicDir: false,
  resolve: { alias: { '@': root } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [pagesAssets, react()],
  build: { outDir: output, emptyOutDir: true, sourcemap: false },
});
