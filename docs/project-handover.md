# Project Handover

This document summarizes what has already been completed and what still needs to be done. It is intended as an onboarding and coordination document for developers working on the RathausGalerien Gatsby + Decap CMS relaunch.

## Current Project Status

The project currently contains the foundational content architecture, Decap CMS collection configuration, Gatsby content sourcing setup, and developer documentation.

No final frontend templates, layouts, or visual design implementations have been created yet.

## Important Project Rules

### Content Rules

- Do not create dummy content.
- Do not create lorem ipsum content.
- Do not create example shops, news, gastronomy entries, services, or FAQs.
- Only create real content when explicitly requested and approved.
- Keep CMS field names stable once content exists.
- Prefer optional fields when extending existing collections.

### Development Rules

- Analyze existing files before making changes.
- Keep implementation clean, scalable, and maintainable.
- Document architectural decisions in `docs/`.
- Avoid mixing CMS structure, frontend rendering, and visual styling concerns.
- Do not implement unrelated changes in the same task.
- Validate changes with typecheck/build when possible.

### Accessibility Rules

- Every meaningful image must support alternative text.
- Every icon-only link or button must support a screenreader label.
- Slider/carousel controls must be keyboard accessible.
- Templates must use semantic HTML.
- Heading hierarchy must be controlled by templates, not arbitrary CMS styling.

### SEO Rules

- Templates must support title tags, meta descriptions, canonical URLs, Open Graph data, and structured data.
- Use entry-specific SEO fields first.
- Fall back to entry title/description/excerpt.
- Fall back to global site settings.
- Validate structured data before rendering.

## Completed Work

### 1. Initial Project Analysis

The following files and structures were analyzed before changes were made:

- `package.json`
- `gatsby-config.ts`
- `static/admin/config.yml`
- `src/` structure
- existing CMS/content files
- layout PDFs in `temp/`

### 2. Content Directory Structure

The following content structure has been prepared:

```txt
content/
  pages/
  shops/
  gastronomy/
  news/
  services/
  faqs/
  settings/
    site.yml
  navigation/
    main.yml
```

Empty content folders contain `.gitkeep` files so they remain versioned.

### 3. Upload Directory

The upload directory exists and is configured for Decap CMS:

```txt
static/uploads/
```

### 4. Source Directory Structure

The following source folders have been prepared:

```txt
src/
  components/
  layouts/
  templates/
  styles/
  hooks/
  lib/
  utils/
```

Empty folders contain `.gitkeep` files.

### 5. Example Content Removed

Previously existing example/test content was removed:

- `content/pages/startseite.mdx`
- `content/news/2026-06-01-erster-beitrag.mdx`

No replacement dummy content was created.

### 6. Gatsby Content Sourcing

`gatsby-transformer-yaml` was added so YAML files can be queried through Gatsby GraphQL.

Updated files:

- `package.json`
- `package-lock.json`
- `gatsby-config.ts`

Relevant Gatsby plugins now include:

- `gatsby-source-filesystem`
- `gatsby-plugin-mdx`
- `gatsby-transformer-yaml`
- `gatsby-transformer-sharp`

### 7. Decap CMS Collections

The CMS configuration in `static/admin/config.yml` now defines these collections:

- Website Settings
- Navigation
- Pages
- Shops
- Gastronomy
- News
- Services
- FAQs

### 8. Website Settings Structure

File:

```txt
content/settings/site.yml
```

Prepared for:

- site title
- site description
- site URL
- default Open Graph image
- default language
- available languages
- contact email
- phone
- address
- center statistics
- opening hours
- parking data
- location data
- social links

### 9. Navigation Structure

File:

```txt
content/navigation/main.yml
```

Prepared for:

- main navigation
- mobile navigation
- footer navigation
- footer legal navigation
- utility navigation
- header icon navigation
- social links

### 10. Modular Page Blocks

The `pages` collection now supports structured content blocks:

- `heroShoppingBlock`
- `sectionIntroBlock`
- `teaserGridBlock`
- `gastronomyHighlightBlock`
- `newsTeaserBlock`
- `parkingBlock`
- `socialTeaserBlock`
- `giftIdeasSliderBlock`
- `linkListBlock`

These blocks were derived from the provided layout PDFs and are intended for future template/component implementation.

### 11. Documentation Created

Created documentation files:

- `docs/content-architecture.md`
- `docs/decap-cms.md`

These explain the content model, CMS setup, block architecture, SEO expectations, accessibility expectations, and change-management rules.

### 12. Local Decap CMS App

Decap CMS is installed locally through the npm package `decap-cms-app` and loaded by the Gatsby admin page:

```txt
src/pages/admin.tsx
```

The admin page no longer loads Decap CMS from `unpkg`.

Updated files:

- `package.json`
- `package-lock.json`
- `src/pages/admin.tsx`

The CMS configuration remains in:

```txt
static/admin/config.yml
```

### 13. Validation Completed

The following checks were run successfully:

```sh
node -e "const fs=require('fs'); const yaml=require('js-yaml'); ['static/admin/config.yml','content/settings/site.yml','content/navigation/main.yml'].forEach((file)=>yaml.load(fs.readFileSync(file,'utf8'))); console.log('YAML OK')"
```

```sh
npm run typecheck
```

```sh
npm run build
```

## Known Notes / Warnings

### Dependency Warning

During installation of `gatsby-transformer-yaml`, npm exposed an existing peer dependency conflict between:

- `gatsby-plugin-mdx@5.16.0`
- `@mdx-js/react@3.1.1`

The install was completed with:

```sh
npm install gatsby-transformer-yaml@^5.16.0 --legacy-peer-deps
```

This should be reviewed before major dependency upgrades.

### npm Audit

`npm audit` reported vulnerabilities after dependency installation. No automatic fix was applied to avoid uncontrolled dependency changes.

Recommended follow-up:

```sh
npm audit
```

Then assess whether fixes are safe for Gatsby 5 and the current MDX setup.

## What Still Needs To Be Done

## Priority 1: Content Types and TypeScript Foundation

### 1. Create CMS Type Definitions

Recommended file:

```txt
src/lib/cms/types.ts
```

Define TypeScript types for:

- site settings
- navigation items
- page frontmatter
- content blocks
- shops
- gastronomy entries
- news entries
- services
- FAQs

The content block union should include all current block types:

```ts
type PageContentBlock =
  | HeroShoppingBlock
  | SectionIntroBlock
  | TeaserGridBlock
  | GastronomyHighlightBlock
  | NewsTeaserBlock
  | ParkingBlock
  | SocialTeaserBlock
  | GiftIdeasSliderBlock
  | LinkListBlock;
```

### 2. Create CMS Query Utilities

Recommended location:

```txt
src/lib/cms/
```

Possible files:

```txt
src/lib/cms/settings.ts
src/lib/cms/navigation.ts
src/lib/cms/pages.ts
```

Purpose:

- normalize CMS data
- provide safe fallbacks
- reduce duplicated query-mapping logic in templates

### 3. Create SEO Utilities

Recommended file:

```txt
src/lib/seo.ts
```

Should handle:

- SEO title fallback logic
- meta description fallback logic
- canonical URL generation
- Open Graph fallback logic
- structured data validation/preparation

Do not inject structured data blindly.

## Priority 2: Frontend Architecture

### 4. Define Component Architecture

Recommended documentation file:

```txt
docs/frontend-architecture.md
```

Should document:

- component naming conventions
- layout conventions
- template conventions
- styling conventions
- accessibility expectations
- GraphQL query conventions

### 5. Create Base Layout Components

Recommended files:

```txt
src/layouts/site-layout.tsx
src/components/header/header.tsx
src/components/footer/footer.tsx
```

Do not hardcode final content. Use CMS data from settings/navigation.

### 6. Create SEO Component

Recommended file:

```txt
src/components/seo/seo.tsx
```

Should consume normalized SEO data from `src/lib/seo.ts`.

### 7. Create Page Template Foundation

Recommended file:

```txt
src/templates/page-template.tsx
```

Responsibilities:

- query page MDX/frontmatter data
- render content block dispatcher
- apply SEO data
- use site layout

Do not implement detailed visual styling until design tokens and frontend conventions are agreed.

### 8. Create Content Block Dispatcher

Recommended files:

```txt
src/components/content-blocks/content-block-renderer.tsx
src/components/content-blocks/hero-shopping-block.tsx
src/components/content-blocks/section-intro-block.tsx
src/components/content-blocks/teaser-grid-block.tsx
src/components/content-blocks/gastronomy-highlight-block.tsx
src/components/content-blocks/news-teaser-block.tsx
src/components/content-blocks/parking-block.tsx
src/components/content-blocks/social-teaser-block.tsx
src/components/content-blocks/gift-ideas-slider-block.tsx
src/components/content-blocks/link-list-block.tsx
```

Each block component should:

- receive typed props
- render semantic HTML
- handle missing optional fields safely
- not query data directly unless there is a strong reason

## Priority 3: Gatsby Page Creation

### 9. Implement Dynamic Page Creation

Recommended file:

```txt
gatsby-node.ts
```

Responsibilities:

- create pages from `content/pages/`
- later create detail pages for shops, gastronomy, news, services, and FAQs if required
- support language-aware routing

Potential future routing pattern:

```txt
/de/{slug}/
/en/{slug}/
```

The final URL strategy still needs a project decision.

### 10. Define GraphQL Fragments

Recommended location:

```txt
src/lib/graphql/
```

Possible files:

```txt
src/lib/graphql/page-fragments.ts
src/lib/graphql/seo-fragments.ts
```

Purpose:

- reduce duplicated GraphQL fields
- keep page/template queries consistent

## Priority 4: Design System Preparation

### 11. Define Design Tokens

Recommended files:

```txt
src/styles/tokens.css
src/styles/global.css
```

Should include, once approved:

- colors
- typography scale
- spacing scale
- breakpoints
- focus styles
- z-index scale

Do not encode design tokens in CMS fields.

### 12. Decide Styling Approach

The project currently includes Sass support.

Before writing many components, decide whether to use:

- Sass modules
- global Sass partials
- plain CSS with custom properties
- another agreed convention

Document the decision in:

```txt
docs/frontend-architecture.md
```

## Priority 5: Content Collections Expansion

### 13. Review Whether Campaigns Need Their Own Collection

The layout PDFs show campaign-like areas such as seasonal fashion, magazine, interviews, and social highlights.

Current approach:

- represent these through page `contentBlocks`

Possible future approach:

```txt
content/campaigns/
```

Only create this collection if content will be reused across multiple pages or needs independent editorial workflows.

### 14. Review Whether Categories Should Become Collections

Current approach:

- categories are free-text fields

Possible future approach:

```txt
content/categories/
```

Only create category collections if filtering, translations, ordering, or category landing pages are required.

## Priority 6: Testing and Quality

### 15. Add Linting / Formatting

Currently no lint or formatter setup was added.

Recommended tools:

- ESLint
- Prettier
- Stylelint if CSS/Sass grows

Add only after team conventions are agreed.

### 16. Add Component Testing Strategy

Recommended later, once components exist:

- React Testing Library
- accessibility tests with jest-axe or similar
- visual regression testing if design accuracy is critical

### 17. Add CMS Schema Validation

Recommended later:

- runtime validation for CMS data using a schema library
- or typed normalization functions with safe fallbacks

Do not add a validation library before the frontend data flow is clear.

## Recently Completed Technical Foundation

The following immediate foundation tasks have been completed:

```txt
src/lib/cms/types.ts
src/lib/cms/index.ts
src/lib/seo.ts
src/lib/navigation.ts
src/layouts/site-layout.tsx
src/layouts/index.ts
src/components/seo/seo.tsx
src/components/seo/index.ts
src/components/header/header.tsx
src/components/header/index.ts
src/components/footer/footer.tsx
src/components/footer/index.ts
src/components/content-blocks/content-block-renderer.tsx
src/components/content-blocks/index.ts
src/templates/page-template.tsx
docs/frontend-architecture.md
```

This means the next developer can use typed CMS models, SEO/navigation normalization helpers, unstyled semantic layout shells, a page-template foundation, and a content-block dispatcher before implementing final visual components.

## Recommended Immediate Next Task

The next developer should start with:

```txt
Create Gatsby dynamic page creation and wire real CMS content into the page template.
```

Recommended first files:

```txt
gatsby-node.ts
src/lib/cms/pages.ts
```

Do this before implementing detailed visual block components or final page designs.

## Suggested Commit Messages

For the current architecture work:

```txt
cms: define content architecture and collections
```

For the modular CMS/layout extension:

```txt
cms: extend modular content blocks and document architecture
```

For this handover document:

```txt
docs: add project handover and next steps
```

## Validation Checklist For Future Changes

Before opening a merge request or handing work to another developer:

- [ ] No dummy content was added.
- [ ] No lorem ipsum was added.
- [ ] CMS field changes are documented.
- [ ] New architecture decisions are documented in `docs/`.
- [ ] YAML files parse successfully.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Accessibility fields are preserved for images/icons/links.
- [ ] SEO fallback behavior is considered.
- [ ] Existing field names were not renamed without a migration plan.
