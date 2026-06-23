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

### Milestone 3 — Homepage/content block design foundation in progress

- Added page-level classes for generated content pages and homepage-specific styling hooks.
- Added a mobile-first homepage intro with entrance image fallback, shopping bag motif, dynamic shop count, and homepage description.
- Added reusable imported content block markup for:
  - feature blocks
  - compact image/text blocks
  - gallery blocks
  - social blocks
  - icon/action rows
- Added content block index, media-count, and icon-state classes for homepage-specific design refinements.
- Added mobile-first Sass for content blocks and homepage sections.
- Added first-pass mobile reference styling for the homepage:
  - dotted section separators
  - uppercase letter-spaced headings
  - pastel card backgrounds
  - alternating desktop feature/compact layouts
- Removed the homepage intro card fill again so the hero stays on the blue page background.
- Refined the sticky header after design review:
  - removed the divider line under the header
  - added a smaller scrolled state for logo, icons, burger, and header height
- Applied image ratios for square grids, `5:4`, and `4:5` homepage media blocks.
- Improved the homepage magazine/tile hierarchy:
  - first text paragraph is treated visually as a subheadline
  - Markdown links in content blocks render as CTA-style pills
  - first magazine/Fashion/Food feature media use a stronger mosaic grid from tablet upward
- Improved legacy Markdown link cleanup by removing empty imported links and normalizing `static/media` links.
- Refined the mobile header against the first mobile reference:
  - visible quick-access icons on small screens
  - smaller mobile logo/header proportions
  - shorter burger/menu lines
  - full-screen mobile menu panel below the sticky header
- Browser-checked the homepage against `temp/H001_148_01_Entwicklung_LO8_Mobile_RGB/0001.png` and `temp/H001_148_01_Entwicklung_LO8_Desktop_RGB-umgewandelt-von-pdf.jpeg`, and moved the homepage styling closer to the references:
  - balanced the mobile hero image/shopping tile proportions
  - hid the extra intro description from the visual hero area
  - converted imported homepage blocks into compact two-column tile clusters on mobile
  - widened the desktop homepage content column to the reference-like `84vw` rhythm
  - switched desktop homepage blocks to a compact four-column tile grid, with one-image sections split 50/50
  - capped oversized imported media groups for a tighter magazine-grid rhythm

### Milestone 4 — Shops, gastronomy, and jobs started

- Replaced plain generated shop/gastronomy/job lists with responsive listing card markup.
- Added first-pass listing card styling with:
  - job-reference split-card layout for shops, gastronomy, and jobs
  - alternating text/image order by row
  - pastel text panels
  - image media areas
  - category/meta labels
  - CTA text
- Refined listing cards after design review:
  - normalized imported category content and passed it to page templates
  - resolved category UUIDs to readable category labels
  - rendered one shop/gastronomy card per assigned category
  - moved location logos into the colored text panel
  - kept location/shop photos in the media panel
  - shortened listing card text and removed generic imported SEO copy where possible
  - removed redundant visible CTA labels because the full cards are links
  - simplified hover/focus states so cards no longer jump or zoom on hover
  - fixed listing card hover readability by preventing global pink link hover color from affecting card text
- Built and refined first-pass location detail pages with:
  - reference-style 16:9 image hero
  - three colored info tiles for brand/category, opening hours, and contact
  - compact text/image detail section for shops and gastronomy
  - gallery rendering for remaining images
  - generic SEO copy cleanup for page body/meta descriptions
  - phone, address, and external URL normalization
- Built and refined first-pass job detail pages with:
  - back navigation to the jobs overview
  - same reference-style 16:9 hero, colored info tiles, and compact text/image detail layout as shop/gastronomy pages
  - job tiles for career/company, position/scope, and application info
  - styled Markdown job description panel
  - gallery support for additional job images
- Polished shop/gastronomy/job detail pages after visual QA:
  - reduced the visual footprint of the back link by overlaying it on the hero
  - kept the info tiles in the three-column reference layout at all breakpoints with tighter mobile typography
  - applied the shared text/image split only when detail media exists
  - added a designed career hero fallback for jobs without a top image
  - enlarged location info tiles to square reference proportions with yellow/pink/blue panels
  - replaced placeholder glyphs with SVG line icons for opening hours and contact
  - refined culinary info tile labeling so Thai-Li-Ba presents as `Asiatisch`
  - made job detail body text full-width without a repeated lower image
- Improved Markdown rendering for imported content by preserving bold text, rendering empty imported links as text instead of broken anchors, and supporting imported `####` headings plus `- - -` separators.

## Current validation status

- `npm run typecheck` passes.
- `npm run build` passes.
- Gatsby currently generates:
  - 21 content pages
  - 68 location pages
  - 8 job pages
  - 37 normalized categories

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

Note: mobile PNG references are available in the folder as `0001.png`–`0012.png`.

## Next steps

### Milestone 3 — Homepage and content block design

1. Curate/reorder the homepage CMS blocks if the live content must match `temp/H001_148_01_Entwicklung_LO8_Mobile_RGB/0001.png` exactly; the current imported content order differs from the static design reference.
2. Continue tuning homepage content hierarchy after visual QA, especially exact card colors, tile content mapping, and any remaining image crop positions.
3. Extend reusable frontend components for imported content blocks where CSS-only styling is not enough:
   - hero sections
   - image/text feature blocks
   - card grids
   - teaser tiles
   - link/action cards
4. Re-check the designed location/job detail pages in-browser against the latest screenshots after the detail polish pass.
5. Continue header/menu QA against both references:
   - verify refined mobile logo, shortcut icons, burger, and full-screen menu in-browser
   - tune desktop header proportions if needed
   - language switch placement
6. Continue improving Markdown/link rendering if more imported edge cases appear.
7. Start with `/`, then reuse the same block system for standard pages.

Recent homepage progress:
- Homepage intro now prefers the lead hero image from the page body before falling back to block images.
- Reduced the homepage body section spacing to bring the first content block closer to the intro.
- Checked `/` in-browser at a narrow mobile viewport against `0001.png`; hero proportions and imported block styling now follow a compact two-column tile layout.
- Checked `/` in-browser at `1440px` desktop width against the desktop JPEG; homepage content now uses a wider reference-like column and compact four-column desktop tile grid.
- Validation after the homepage styling pass: `npm run typecheck` passes and `npm run build` passes.

### Milestone 4 — Shops, gastronomy, and jobs

1. Visually QA the refined shop/gastronomy/job split cards against the job reference and tune final spacing/color/image crops.
2. Browser-compare location and job detail pages against the references, especially exact tile colors, logo scale, icon stroke, image crop positions, and the now persistent three-column mobile tile layout.
3. Polish job body typography if more imported Markdown edge cases appear.
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
