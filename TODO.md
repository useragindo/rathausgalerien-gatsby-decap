# RathausGalerien Frontend TODO

## Completed

### Milestone 1 — Content rendering foundation

- Configured Gatsby/MDX to read imported Markdown content.
- Added dynamic page creation for:
  - content pages
  - shop/gastronomy locations
  - jobs
- Added content normalization helpers.
- Added page, location, and job templates.
- Deleted the placeholder homepage so `/` is generated from imported content.
- Updated content block rendering for imported legacy fields like `header`, `text`, `images`, and `icons`.

### Milestone 2 — Global design foundation and site shell

- Added global Sass architecture:
  - design tokens
  - reset
  - typography
  - layout utilities
  - header styles
  - footer styles
- Imported global styles through `gatsby-browser.ts`.
- Added accessible site shell structure with skip link and main content target.
- Updated header markup and styling toward the 2026 design reference:
  - large RathausGalerien logo
  - right-side shortcut icons
  - large burger menu
  - accessible mobile/details menu
- Updated footer markup and styling:
  - semantic navigation groups
  - brand link
  - responsive layout

## Current validation status

- `npm run typecheck` passes.
- `npm run build` passes.
- Gatsby currently generates:
  - 21 content pages
  - 68 location pages
  - 8 job pages

Known non-blocking warnings:

- Dart Sass legacy JS API deprecation from Gatsby/Sass tooling.
- `gatsby-plugin-decap-cms` dynamic dependency warning.

## Design references

Desktop/concept references:

- `temp/H001_148_01_Entwicklung_LO8_Desktop_RGB.pdf`
- `temp/H001_148_01_Entwicklung_LO8_Konzept_RGB.pdf`
- `temp/H001_148_01_Entwicklung_LO8_Konzept_RGB/`
- `temp/smallpdf-convert-20260622-072605/`

Mobile references:

- `temp/H001_148_01_Entwicklung_LO8_Mobile_RGB.pdf`
- `temp/H001_148_01_Entwicklung_LO8_Mobile_RGB/`

Note: the mobile reference folder currently exists, but no extracted images were detected there yet. If needed, extract the mobile PDF into PNG/JPG frames before detailed mobile QA.

## Next steps

### Milestone 3 — Homepage and content block design

1. Extract/check mobile layout images from `temp/H001_148_01_Entwicklung_LO8_Mobile_RGB.pdf` if the folder remains empty.
2. Implement homepage mobile-first against the mobile reference first, then scale up to desktop.
3. Improve homepage layout to match the 2026 references in `temp`.
4. Create reusable frontend components for imported content blocks:
   - hero sections
   - image/text feature blocks
   - card grids
   - teaser tiles
   - link/action cards
5. Apply design ratios from the PDFs/PNGs:
   - `1:1`
   - `5:4`
   - `4:5`
6. Refine the header/menu against both references:
   - mobile logo scale and spacing
   - burger line length/position
   - shortcut icon spacing
   - full-screen menu behavior
   - language switch placement
7. Improve Markdown/link rendering where imported legacy content still contains raw Markdown syntax.
8. Start with `/`, then reuse the same block system for standard pages.

### Milestone 4 — Shops, gastronomy, and jobs

1. Build designed listing pages for shops and gastronomy.
2. Build location detail pages with logo, gallery, opening hours, and contact data.
3. Build jobs listing/detail UI.
4. Add filtering/search only after the static layouts are solid.

### Milestone 5 — Polish and production readiness

1. Responsive QA against desktop and mobile design references.
2. Accessibility pass:
   - keyboard navigation
   - focus states
   - semantic landmarks
   - image alt strategy
3. Performance pass:
   - image sizing
   - layout shift checks
   - unnecessary render cleanup
4. Final build/develop verification.
