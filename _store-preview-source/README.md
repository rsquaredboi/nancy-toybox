# Hello Nancy store integration preview

Four connected pages demonstrate a proposed Pâtisserie integration: the homepage, campaign, prelaunch product page and permanent Worlds index.

Public preview: https://rsquaredboi.github.io/nancy-toybox/store-preview/

Use Node 22.13 or newer. Run `npm ci`, `npm run typecheck`, then `npm run build`. Copy only `store-dist/` into the repository's `store-preview/` folder. `npm run preview` serves the production build at port 4177. The deployment base is `/nancy-toybox/store-preview/`.

All selected images, fonts and films are included. The campaign is loaded on demand. No backend, credentials or environment variables are required. The underscore source folder is excluded from the existing Jekyll site.

The top preview bar connects all four pages and opens an explanation of the proposed site architecture. The product form is a local demonstration: it validates the input, clears it and shows a demo confirmation. It neither sends nor saves the address. There is no checkout integration, live inventory, confirmed launch date or product price. Existing-product links lead to the official Hello Nancy store. Tennis links to the existing standalone campaign.

Desktop and narrow phone layouts were checked. Navigation, original product views, signup validation and confirmation, modal Escape/focus return and background video pause were verified. Browser warning/error logs were empty. Reduced-motion behavior is implemented; OS preference emulation was not separately tested. The inherited campaign keepsake's file-open check remains unverified because the browser blocked the previous blob navigation; that block was not retried through another surface.

The Hello Nancy Shopify storefront has not been changed. This is an independently published proposal.
