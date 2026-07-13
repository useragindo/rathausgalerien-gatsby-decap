# Rathausgalerien – Gatsby + Decap CMS

Bilingualer Auftritt (DE/EN) für Einkaufszentren. Gatsby 5, TypeScript, SCSS, Decap CMS.

## Befehle

```sh
npm run develop      # Dev-Server auf :8000
npm run build        # Produktionsbuild
npm run typecheck    # TypeScript prüfen (tsc --noEmit)
npm run clean        # Gatsby-Cache leeren
npm run cms:proxy    # Decap lokalen Backend-Proxy starten (zweites Terminal nötig)
```

Kein Linter oder Formatter konfiguriert. Keine Tests vorhanden.

## Projektstruktur

```
content/             # CMS-Inhalte (MDX/YAML), Sprachordner de/ en/
  pages/             # Seitentypen: home, standard, shops, gastronomie, lageplan, jobs, funnel
  blocks/            # Wiederverwendbare Bausteine (header, footer, general, location)
  categories/        # Kategorien für Shops/Gastronomie (UUID-basiert)
  funnels/           # Funnel-Seiten (type: page, template: funnel)
  jobs/              # Stellenanzeigen
  locations/         # Shops und Gastronomie-Betriebe
src/
  components/        # React-Komponenten (content-blocks, header, footer, seo, location-plan)
  templates/         # Gatsby-Templates pro Seitentyp
  layouts/           # site-layout.tsx (Header + Footer)
  lib/               # Business-Logik
    content/         # Normalisierung (normalize.ts) und Typen (types.ts)
    seo.ts           # SEO-Auflösung
    navigation.ts    # Navigationslogik
    language.ts      # Sprachunterstützung
    footer.ts        # Footer-Logik
  styles/            # SCSS-Dateien (global.scss als Einstieg)
  pages/             # Nur 404.tsx
static/
  admin/             # Decap CMS Admin UI (index.html + config.yml)
  media/             # Hochgeladene Medien
  fonts/, icons/     # Statische Assets
gatsby-node.ts       # Seitenprogrammierung (createPages)
gatsby-config.ts     # Plugin-Konfiguration
gatsby-browser.ts    # Netlify Identity Init
```

## Architektur

- **Content-Pipeline**: `gatsby-node.ts` liest alle MDX-Nodes via `getNodesByType("Mdx")`, `normalizeNodes()` trennt nach `frontmatter.type` (page/location/job/category) und erstellt pro Typ die passenden Seiten.
- **Templates**: `page-template.tsx` ist das Universal-Template für Seiten und Funnels. Unterschiedliche Layouts via `frontmatter.template` (home, standard, shops, gastronomie, lageplan, jobs, funnel).
- **URL-Logik**: Sprachpräfix `/en/` für Englisch, Deutsch ohne Präfix. Home immer am Sprachroot.
- **SEO**: `src/lib/seo.ts` mit `resolvePageSeo()` – canonical und og:url werden aus `frontmatter.seo.url` oder `frontmatter.funnel_url` abgeleitet.
- **Bilingual**: Alle Content-Typen haben `locale` (de/en). Sprachverknüpfung über `i18nKey`.

## CMS-Struktur

- Config: `static/admin/config.yml`
- Collections: pages, funnels, blocks, categories, locations, jobs
- Jeder Eintrag = eigene Datei in `content/<collection>/<locale>/<slug>.md[x]`
- Medien landen in `static/media/<collection>/`
- `local_backend: true` → lokaler Decap-Proxy schreibt direkt in Dateien

## Regeln

- TypeScript mit strict mode. `npm run typecheck` vor Commits laufen lassen.
- Tabs für Einrückung (siehe bestehende Dateien).
- SCSS für Styles, kein CSS-in-JS oder Tailwind.
- Komponenten in `src/components/`, eine Komponente pro Datei.
- Frontmatter-Felder immer optional/nullable halten (`string | null`), da Decap leere Werte speichert.
- Bei neuen Content-Feldern: zuerst `ImportedFrontmatter` in `src/lib/content/types.ts` erweitern, dann `normalize.ts` anpassen.
- Bei neuen Templates: `gatsby-node.ts` erweitern und Template in `src/templates/` anlegen.
- Sprachverknüpfungen (i18n) über `i18nKey` sicherstellen – gleicher Key für DE und EN.
- Decap CMS wird per CDN eingebunden, NICHT als npm-Paket. `decap-cms-app` in package.json ist nur für den lokalen Proxy.
- Keine Secrets, API Keys oder private Pfade in Dateien eintragen.

## Bekannte Fallstricke

- `npm run develop` muss laufen bevor `npm run cms:proxy` funktioniert.
- Decap schreibt MDX-Dateien ohne trailing newline → Gatsby-Cache bei Content-Änderungen leeren (`npm run clean`).
- `gatsby-types.d.ts` wird generiert – nicht manuell editieren.
- `content/pages/` hat keine `news/`-Unterordner mehr (alt).
- `PAGE_PATH_OVERRIDES` in normalize.ts mappt `brands` → `shops` und `culinary` → `gastronomie`.
- Funnel-Pages nutzen `type: page` + `template: funnel` und werden wie die Startseite gerendert.
