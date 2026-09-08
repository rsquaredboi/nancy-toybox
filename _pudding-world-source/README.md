# Nancy Pâtisserie — Something sweet. For later.

Scoped React source for the Nancy dessert-salon campaign. The repository root Toybox and tennis world are separate experiences.

Use Node 22.13 or newer. Run `npm ci`, then `npm run build`. The static site is produced in `pudding-dist/`; copy its contents to the repository's `pudding-world/` folder to publish. `npm run dev` starts the development target. `npm run typecheck` checks the TypeScript source.

The deployment base is `/nancy-toybox/pudding-world/`. All selected media and fonts are included in `public/`. No environment variables, backend or credentials are required. The underscore prefix keeps this source directory out of the existing Jekyll Pages site.

The experience includes three Higgsfield films, five selected scene concepts, an interactive silver cloche, original product views and a keepsake generator. Video playback is optional, with pause and reduced-motion support. Campaign scenes are art-directed interpretations; the product viewer contains the supplied product renders.

This is a creative prototype with no checkout or inventory integration. The public demo requests no search indexing. Its footer links to Hello Nancy.
