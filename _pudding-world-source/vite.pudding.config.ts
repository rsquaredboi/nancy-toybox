import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync, mkdirSync } from 'node:fs';

const root = import.meta.dirname;
const base = '/nancy-toybox/pudding-world/';
const output = resolve(root, 'pudding-dist');
const media: Plugin = {
  name: 'nancy-patisserie-media',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('/node_modules/') || !/\.(tsx?|css)$/.test(id)) return;
    return {
      code: code.replace(
        /(["'`])\/(assets|fonts|pudding-world)\//g,
        `$1${base}$2/`,
      ),
      map: null,
    };
  },
  closeBundle() {
    for (const path of [
      'assets/nancy-logo.png',
      'fonts/ESRebondGrotesque-Regular.woff',
      'fonts/ESRebondGrotesque-Semibold.woff',
      'fonts/Fraunces-Regular.woff',
      'pudding-world',
    ]) {
      const target = resolve(output, path);
      mkdirSync(resolve(target, '..'), { recursive: true });
      cpSync(resolve(root, 'public', path), target, { recursive: true });
    }
  },
};
export default defineConfig({
  root: resolve(root, 'pudding-pages'),
  base,
  publicDir: false,
  plugins: [media, react()],
  build: { outDir: output, emptyOutDir: true, sourcemap: false },
});
