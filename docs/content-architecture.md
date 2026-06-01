# Content Architecture

This project uses Gatsby and Decap CMS for a structured, maintainable content architecture. The content model is intentionally separated from presentation components so multiple developers can work on templates, UI components, and CMS configuration without coupling content to a specific design implementation.

## Goals

- Keep content portable and queryable through Gatsby GraphQL.
- Avoid hardcoded page content in React components.
- Keep CMS collections predictable and version-controlled.
- Support German and English content from the beginning.
- Prepare SEO, Open Graph, canonical URLs, structured data, and accessibility metadata consistently.
- Avoid example content, dummy data, and design-specific implementation details in content files.

## Directory Structure

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

static/
  uploads/

src/
  components/
  layouts/
  templates/
  styles/
  hooks/
  lib/
  utils/
```

## Content Types

### Settings

File: `content/settings/site.yml`

Global website data used across layouts, SEO, header, footer, parking, opening hours, and location features.

Important fields:

- `siteTitle`
- `siteDescription`
- `siteUrl`
- `defaultOgImage`
- `defaultLanguage`
- `availableLanguages`
- `contactEmail`
- `phone`
- `address`
- `centerStats`
- `openingHours`
- `parking`
- `location`
- `socialLinks`

### Navigation

File: `content/navigation/main.yml`

Navigation is split by use case instead of having one overloaded list. This keeps header, mobile navigation, footer, utility, legal, icon, and social links independently maintainable.

Fields:

- `mainNavigation`
- `mobileNavigation`
- `footerNavigation`
- `footerLegalNavigation`
- `utilityNavigation`
- `headerIconNavigation`
- `socialLinks`

### Pages

Folder: `content/pages/`

Pages are MDX files with structured frontmatter and modular `contentBlocks`. This allows the homepage and future landing pages to be assembled from reusable blocks without creating new templates for every visual section.

Core fields:

- `title`
- `slug`
- `language`
- `translations`
- `seoTitle`
- `seoDescription`
- `canonicalUrl`
- `openGraph`
- `structuredData`
- `hero`
- `contentBlocks`
- `published`

### Shops

Folder: `content/shops/`

Prepared for individual shop entries, including contact, location, opening hours, gallery, SEO, and structured data.

### Gastronomy

Folder: `content/gastronomy/`

Prepared for restaurants, cafés, and bars. Includes opening hours and kitchen hours separately.

### News

Folder: `content/news/`

Prepared for editorial news entries with publish date, hero image, gallery, author, SEO, and body content.

### Services

Folder: `content/services/`

Prepared for service entries such as parking, accessibility, gift cards, facilities, and visitor services.

### FAQs

Folder: `content/faqs/`

Prepared for frequently asked questions with category, order, language, SEO, and structured data fields.

## Page Content Blocks

The `pages` collection uses explicit block types instead of a generic free-form content model. This makes templates easier to implement, easier to type, and easier to validate.

Current block types:

- `heroShoppingBlock`
- `sectionIntroBlock`
- `teaserGridBlock`
- `gastronomyHighlightBlock`
- `newsTeaserBlock`
- `parkingBlock`
- `socialTeaserBlock`
- `giftIdeasSliderBlock`
- `linkListBlock`

## Best Practices for Developers

### Do

- Keep CMS field names stable once content exists.
- Add new optional fields before making fields required.
- Prefer explicit block types over generic objects when a section has defined semantics.
- Keep design-specific logic inside React components, not CMS content.
- Query only the fields needed by a template or component.
- Keep image `alt` text and `ariaLabel` fields available for all visual or interactive content.
- Document any new collection, field, or block in this folder.

### Do Not

- Do not commit sample content, dummy entries, or lorem ipsum.
- Do not use CMS fields for pure styling details unless they are stable semantic variants.
- Do not rename existing fields without a migration plan.
- Do not put secrets, API keys, or private credentials in content files.
- Do not implement design or templates inside `static/admin/config.yml`.

## Gatsby GraphQL

Content is sourced through `gatsby-source-filesystem` from `./content/` and transformed by:

- `gatsby-plugin-mdx` for MDX content collections
- `gatsby-transformer-yaml` for YAML settings and navigation files

This means CMS content is available to Gatsby GraphQL during build time.

## Multilingual Strategy

All major content collections include:

- `language`
- `translations` where applicable

Recommended future URL pattern:

```txt
/de/...
/en/...
```

Final routing should be decided when page templates are implemented.
