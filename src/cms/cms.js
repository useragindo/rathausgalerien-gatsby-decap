import CMS from "decap-cms-app";
import UUID from "./widgets/uuid";
import ColorTokenSelect from "./widgets/color-token-select";

CMS.registerWidget("uuid", UUID);
CMS.registerWidget("color-token-select", ColorTokenSelect);

if (typeof document !== "undefined") {
	const style = document.createElement("style");
	style.textContent = `
		/* Visual separator in the sidebar between content types and
		   configuration entries (Blocks, Farbschemas, Einstellungen). */
		li [data-testid="blocks"] {
			border-top: 1px solid #c5d2dd;
			margin-top: 8px;
			padding-top: 8px;
		}

		/* Section dividers between the five field groups (Grunddaten /
		   Navigation / Inhalt / Vorlagen-spezifisch / SEO & Meta) in the
		   Pages/Funnels entry editor — the groups themselves are defined by
		   field order in static/admin/config.yml (see the "# Grunddaten"
		   etc. comments there).
		   Targeted via each field's own <label for="<name>-field-N">,
		   which Decap always renders regardless of whether a list/object
		   field (blocks, seo) has any content yet. Scoped to Pages/Funnels
		   only via the "Zurück zu allen Pages/Funnels" breadcrumb link, so
		   Locations/Jobs/News (which also have heading/seo fields but were
		   not reordered) are unaffected.
		   Intentionally not scoped to a decap-cms-app internal CSS class
		   (e.g. "ControlContainer"): those carry a build-specific hash and
		   would silently stop matching on a decap-cms-app version bump. The
		   "for" attribute is Decap's own accessibility-facing API and is
		   the more stable anchor.
		   "menu" only exists in Pages, so it marks Navigation there
		   directly; Funnels has no "menu" field, so its Navigation start
		   ("menu_label") is matched via adjacency to "funnel_url" instead,
		   since "menu_label" alone would also match its (non-start)
		   position in Pages. */
		body:has(a[href^="#/collections/pages"]) div:has(> label[for^="menu-field-"]),
		body:has(a[href^="#/collections/funnels"]) div:has(> label[for^="funnel_url-field-"]) + div,
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="heading-field-"]),
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"]) div:has(> label[for^="blocks-field-"]),
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="seo-field-"]),
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="hours-field-"]),
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="logo-field-"]),
		body:has(a[href^="#/collections/jobs"], a[href^="#/collections/news"], a[href^="#/collections/categories"]) div:has(> label[for^="text_color-field-"]),
		body:has(a[href^="#/collections/services"]) div:has(> label[for^="name-field-"]),
		body:has(a[href^="#/collections/services"]) div:has(> label[for^="icon-field-"]),
		body:has(a[href^="#/collections/categories"]) div:has(> label[for^="name-field-"]),
		body:has(a[href^="#/collections/faqs"]) div:has(> label[for^="question-field-"]),
		body:has(a[href^="#/collections/blocks"]) div:has(> label[for^="company_name-field-"]),
		body:has(a[href^="#/collections/color-schemes"]) div:has(> label[for^="colors-field-"]) {
			margin-top: 24px;
			padding-top: 20px;
			border-top: 1px solid #c5d2dd;
		}

		body:has(a[href^="#/collections/pages"]) div:has(> label[for^="menu-field-"])::before,
		body:has(a[href^="#/collections/funnels"]) div:has(> label[for^="funnel_url-field-"]) + div::before,
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="heading-field-"])::before,
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"]) div:has(> label[for^="blocks-field-"])::before,
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="seo-field-"])::before,
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="hours-field-"])::before,
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="logo-field-"])::before,
		body:has(a[href^="#/collections/jobs"], a[href^="#/collections/news"], a[href^="#/collections/categories"]) div:has(> label[for^="text_color-field-"])::before,
		body:has(a[href^="#/collections/services"]) div:has(> label[for^="name-field-"])::before,
		body:has(a[href^="#/collections/services"]) div:has(> label[for^="icon-field-"])::before,
		body:has(a[href^="#/collections/categories"]) div:has(> label[for^="name-field-"])::before,
		body:has(a[href^="#/collections/faqs"]) div:has(> label[for^="question-field-"])::before,
		body:has(a[href^="#/collections/blocks"]) div:has(> label[for^="company_name-field-"])::before,
		body:has(a[href^="#/collections/color-schemes"]) div:has(> label[for^="colors-field-"])::before {
			display: block;
			margin-bottom: 8px;
			font-size: 0.75rem;
			font-weight: 600;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: #6b7c93;
		}

		body:has(a[href^="#/collections/pages"]) div:has(> label[for^="menu-field-"])::before {
			content: "Navigation";
		}
		body:has(a[href^="#/collections/funnels"]) div:has(> label[for^="funnel_url-field-"]) + div::before {
			content: "Navigation";
		}
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="heading-field-"])::before {
			content: "Inhalt";
		}
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"]) div:has(> label[for^="blocks-field-"])::before {
			content: "Vorlagen-spezifisch";
		}
		body:has(a[href^="#/collections/pages"], a[href^="#/collections/funnels"], a[href^="#/collections/locations"], a[href^="#/collections/jobs"], a[href^="#/collections/news"]) div:has(> label[for^="seo-field-"])::before {
			content: "SEO & Meta";
		}
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="hours-field-"])::before {
			content: "Kontakt & Zeiten";
		}
		body:has(a[href^="#/collections/locations"]) div:has(> label[for^="logo-field-"])::before {
			content: "Darstellung";
		}
		body:has(a[href^="#/collections/jobs"], a[href^="#/collections/news"], a[href^="#/collections/categories"]) div:has(> label[for^="text_color-field-"])::before {
			content: "Darstellung";
		}
		body:has(a[href^="#/collections/services"], a[href^="#/collections/categories"]) div:has(> label[for^="name-field-"])::before {
			content: "Inhalt";
		}
		body:has(a[href^="#/collections/services"]) div:has(> label[for^="icon-field-"])::before {
			content: "Kachel";
		}
		body:has(a[href^="#/collections/faqs"]) div:has(> label[for^="question-field-"])::before {
			content: "Inhalt";
		}
		body:has(a[href^="#/collections/blocks"]) div:has(> label[for^="company_name-field-"])::before {
			content: "Inhalt";
		}
		body:has(a[href^="#/collections/color-schemes"]) div:has(> label[for^="colors-field-"])::before {
			content: "Farben";
		}
	`;
	document.head.appendChild(style);
}
