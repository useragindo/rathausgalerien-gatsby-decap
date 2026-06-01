# Frontend Architecture

This document defines the intended frontend architecture for the RathausGalerien Gatsby relaunch. It should be updated whenever the team makes architectural decisions that affect multiple developers.

## Goals

- Keep rendering logic typed, predictable, and reusable.
- Keep CMS data normalization separate from React components.
- Keep layout, templates, and content blocks clearly separated.
- Preserve accessibility and SEO requirements from the beginning.
- Avoid hardcoded editorial content in components.

## Recommended Source Structure

```txt
src/
  components/
    content-blocks/
    footer/
    header/
    seo/
  hooks/
  layouts/
  lib/
    cms/
      index.ts
      types.ts
    navigation.ts
    seo.ts
  styles/
  templates/
  utils/
```

## Current Foundation

The following foundation files exist:

```txt
src/lib/cms/types.ts
src/lib/cms/index.ts
src/lib/seo.ts
src/lib/navigation.ts
src/layouts/site-layout.tsx
src/components/header/header.tsx
src/components/footer/footer.tsx
src/components/seo/seo.tsx
src/components/content-blocks/content-block-renderer.tsx
src/templates/page-template.tsx
```

### `src/lib/cms/types.ts`

Contains shared TypeScript types for CMS data:

- settings
- navigation
- SEO fields
- page frontmatter
- content blocks
- shops
- gastronomy entries
- news entries
- services
- FAQs

### `src/lib/seo.ts`

Contains SEO normalization helpers:

- title fallback logic
- description fallback logic
- canonical URL building
- Open Graph fallback logic
- safe structured data parsing

### `src/lib/navigation.ts`

Contains navigation normalization helpers:

- removes incomplete navigation entries
- supports language filtering
- normalizes social links
- keeps link rendering data predictable for header/footer components

## Component Principles

### Components Should

- receive typed props
- render semantic HTML
- handle optional CMS fields safely
- keep visual styling separate from data normalization
- avoid direct GraphQL queries unless the component is a page/template boundary

### Components Should Not

- hardcode editorial content
- parse raw CMS data repeatedly
- implement SEO fallback logic locally
- access global browser APIs during server-side rendering without guards
- encode arbitrary styling decisions from CMS fields

## Templates

Templates should be responsible for:

- GraphQL page queries
- passing raw data through normalization helpers
- rendering layouts
- dispatching content blocks
- providing SEO metadata

Implemented foundation file:

```txt
src/templates/page-template.tsx
```

Recommended future files:

```txt
src/templates/shop-template.tsx
src/templates/gastronomy-template.tsx
src/templates/news-template.tsx
```

## Content Blocks

Content block rendering should use a dispatcher component that switches on the block type.

Implemented foundation file:

```txt
src/components/content-blocks/content-block-renderer.tsx
```

The current dispatcher renders semantic, unstyled fallback markup for every CMS block type. Future visual block components can be extracted from this file once final implementation begins.

Recommended future block files:

```txt
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

## SEO Implementation

A future SEO component should use `resolveSeo` from `src/lib/seo.ts`.

Recommended future file:

```txt
src/components/seo/seo.tsx
```

The SEO component should render:

- `<title>`
- meta description
- canonical link
- Open Graph tags
- structured data script when valid structured data exists

## Navigation Implementation

Header and footer components should use `getNavigationForLanguage` from `src/lib/navigation.ts`.

Implemented shell files:

```txt
src/components/header/header.tsx
src/components/footer/footer.tsx
```

These are intentionally unstyled and only provide semantic structure and typed props.

## Styling

The project currently supports Sass. Before major component work begins, the team should decide whether to use:

- Sass modules
- global Sass partials
- CSS custom properties
- a combination of Sass and CSS variables

Recommended initial files:

```txt
src/styles/tokens.css
src/styles/global.css
```

Design tokens should live in stylesheets, not in CMS fields.

## Accessibility Requirements

Frontend implementation must ensure:

- semantic landmarks: `header`, `main`, `footer`, `nav`, `section`
- correct heading hierarchy
- keyboard-accessible interactive controls
- visible focus states
- meaningful alternative text for images
- screenreader labels for icon-only links/buttons
- accessible carousel/slider controls

CMS fields support accessibility metadata, but components are responsible for rendering accessible markup.

## Validation

After frontend architecture changes, run:

```sh
npm run typecheck
npm run build
```
