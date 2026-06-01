# Decap CMS Configuration

The Decap CMS configuration lives in `static/admin/config.yml`.

This file defines the editorial data model only. It must not contain presentation implementation, React component logic, or example content.

## Local Development

Start Gatsby:

```sh
npm run develop
```

Start the local Decap CMS proxy in a separate terminal:

```sh
npm run cms:proxy
```

Open the CMS at:

```txt
/admin/
```

## Media Uploads

Uploaded files are stored in:

```txt
static/uploads/
```

Public URLs resolve from:

```txt
/uploads
```

## Collection Principles

- Use `files` collections for singleton YAML files such as settings and navigation.
- Use `folder` collections for repeatable content such as pages, shops, gastronomy, news, services, and FAQs.
- Keep field names in English and stable for developer ergonomics.
- Keep editor labels human-readable and specific.
- Keep fields optional until there is a clear editorial or technical requirement.
- Add accessibility fields wherever images, icons, links, or interactive controls are represented.

## Page Blocks

The `pages` collection contains a `contentBlocks` list with typed blocks.

Each block has an optional `blockTitle`. This is intended for CMS editor orientation only and should not automatically render on the frontend unless explicitly used by a template.

### `heroShoppingBlock`

Use for a visual hero/introduction area with image, icon, heading, subheading, and statistics.

Frontend responsibility:

- Render as a semantic section.
- Use `primaryImage.alt` for image accessibility.
- Use `icon.ariaLabel` if the icon conveys meaning.
- Use the heading level appropriate to the page structure.

### `sectionIntroBlock`

Use for section headline and introductory text.

Frontend responsibility:

- Render with semantic heading levels.
- Support `anchorId` only if it is sanitized before rendering as an HTML ID.

### `teaserGridBlock`

Use for reusable teaser tile groups.

Frontend responsibility:

- Render links as real anchors.
- Use `ariaLabel` when visible link text is not descriptive enough.
- Treat `variant` as a semantic visual variant, not arbitrary CSS input.

### `gastronomyHighlightBlock`

Use for food, café, bar, or restaurant highlights.

Frontend responsibility:

- Keep image alt text meaningful.
- Avoid encoding restaurant data here if it belongs to `content/gastronomy/`.

### `newsTeaserBlock`

Use for curated editorial/news teaser sections.

Frontend responsibility:

- Prefer linking to real entries from `content/news/` when available.
- Keep manually curated teaser data minimal.

### `parkingBlock`

Use for parking-related landing page sections.

Frontend responsibility:

- Prefer global parking data from `content/settings/site.yml` for canonical numbers.
- Use this block for page-specific presentation text or CTA text.

### `socialTeaserBlock`

Use for social media callouts.

Frontend responsibility:

- Links to external platforms must include safe external-link attributes where applicable.
- Use `ariaLabel` for platform-specific calls to action.

### `giftIdeasSliderBlock`

Use for gift or inspiration carousel-like sections.

Frontend responsibility:

- Slider controls must be keyboard accessible.
- Slides must remain readable if JavaScript is disabled.
- Do not rely on visual arrows only; provide accessible button labels.

### `linkListBlock`

Use for structured lists of links.

Frontend responsibility:

- Render lists as semantic `<ul>` / `<ol>` where appropriate.
- Use `ariaLabel` for ambiguous labels.

## SEO Fields

Most collections provide:

- `seoTitle`
- `seoDescription`
- `canonicalUrl`
- `openGraph`
- `structuredData`

Frontend SEO components should apply fallback logic in this order:

1. Entry-specific SEO fields.
2. Entry title / excerpt / description.
3. Global defaults from `content/settings/site.yml`.

Structured data should be validated before rendering and must not blindly inject invalid JSON.

## Accessibility Requirements

CMS structures include fields for:

- image alternative text
- icon screenreader labels
- link screenreader labels
- semantic headings
- accessible slider controls

Frontend implementations must still enforce semantic HTML, keyboard accessibility, focus states, contrast, and responsive behavior.

## Change Management

When changing `static/admin/config.yml`:

1. Check if existing content already uses the field.
2. Prefer adding optional fields over renaming fields.
3. Document the change in `docs/`.
4. Validate YAML.
5. Run `npm run typecheck` and `npm run build` when possible.

## Validation Commands

```sh
node -e "const fs=require('fs'); const yaml=require('js-yaml'); ['static/admin/config.yml','content/settings/site.yml','content/navigation/main.yml'].forEach((file)=>yaml.load(fs.readFileSync(file,'utf8'))); console.log('YAML OK')"
```

```sh
npm run typecheck
```

```sh
npm run build
```
