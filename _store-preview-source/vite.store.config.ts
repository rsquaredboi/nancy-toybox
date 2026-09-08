import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync, mkdirSync } from 'node:fs';

const root = import.meta.dirname;
const base = '/nancy-toybox/store-preview/';
const output = resolve(root, 'store-dist');
const media: Plugin = {
  name: 'nancy-store-preview-media',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('/node_modules/') || !/\.(tsx?|css)$/.test(id)) return;
    return {
      code: code.replace(
        /(["'`])\/(assets|fonts|pudding-world|tennis-world)\//g,
        `$1${base}$2/`,
      ),
      map: null,
    };
  },
  closeBundle() {
    for (const path of [
      'assets/nancy-logo.png',
      'assets/prod-lem.webp',
      'assets/prod-berri.webp',
      'assets/prod-avo-clitoral-massager.webp',
      'fonts/ESRebondGrotesque-Regular.woff',
      'fonts/ESRebondGrotesque-Semibold.woff',
      'fonts/Fraunces-Regular.woff',
      'pudding-world',
      'tennis-world/match-off/085-poster.jpg',
    ]) {
      const target = resolve(output, path);
      mkdirSync(resolve(target, '..'), { recursive: true });
      cpSync(resolve(root, 'public', path), target, { recursive: true });
    }
  },
};
export default defineConfig({
  root: resolve(root, 'store-pages'),
  base,
  publicDir: false,
  plugins: [media, react()],
  build: {
    outDir: output,
    emptyOutDir: true,
    sourcemap: false,
    rolldownOptions: {
      input: {
        home: resolve(root, 'store-pages/index.html'),
        worlds: resolve(root, 'store-pages/worlds/index.html'),
        patisserie: resolve(root, 'store-pages/patisserie/index.html'),
        product: resolve(root, 'store-pages/products/pudding/index.html'),
      },
    },
  },
});
