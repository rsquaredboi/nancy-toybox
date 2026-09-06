# LOVE ALL — The Soft Machines source

This is the scoped React source for the Nancy tennis exhibition. The repository root board is separate.

Use Node 22.13 or newer. Run `npm ci`, then `npm run build`. The static site is produced in `pages-dist/`; copy its contents to the repository’s `tennis-world/` folder to update the published exhibition. `npm run dev` opens the static development target. All three Higgsfield films, posters, product photographs and fonts are included in `public/`.

The fixed deployment base is `/nancy-toybox/tennis-world/`, configured in `vite.pages.config.ts`. No environment variables, backend or credentials are needed. This source directory starts with an underscore so the existing Jekyll Pages build excludes it from the public site.
