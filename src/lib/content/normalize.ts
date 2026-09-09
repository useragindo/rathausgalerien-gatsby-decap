import { COLOR_TOKENS } from "./color-tokens";
import type {
	ColorToken,
	ImportedFrontmatter,
	ImportedLotteryForm,
	ImportedLotteryFormField,
	ImportedMdxNode,
	LanguageCode,
	LotteryFieldType,
	LotterySettings,
	NormalizedCategory,
	NormalizedColorScheme,
	NormalizedFaq,
	NormalizedJob,
	NormalizedLocation,
	NormalizedLottery,
	NormalizedLotteryForm,
	NormalizedLotteryFormField,
	NormalizedLotteryFormFieldOption,
	NormalizedNews,
	NormalizedPage,
	NormalizedService,
	SiteNavigationItem,
	SiteTheme,
} from "./types";

const DEFAULT_LANGUAGE: LanguageCode = "de";

const PAGE_PATH_OVERRIDES: Record<string, string> = {
	brands: "shops",
	culinary: "gastronomie",
};

// Maps legacy `key` values to the template that drives the page rendering.
// Used as a fallback when a page has no explicit `template` in its frontmatter.
const KEY_TEMPLATE_FALLBACK: Record<string, string> = {
	index: "home",
	brands: "shops",
	culinary: "gastronomie",
	locations: "lageplan",
	jobs: "jobs",
};

const getPageTemplate = (
	frontmatter: ImportedFrontmatter,
	key: string,
): string =>
	trim(frontmatter.template) ?? KEY_TEMPLATE_FALLBACK[key] ?? "standard";

// Frontmatter comes from YAML, so a field is only a string by convention, not
// by guarantee: an unquoted timestamp parses as a Date, `order: 300` as a
// number. Anything non-string is treated as absent instead of throwing, because
// a single CMS edit must not be able to abort the whole createPages run.
export const trim = (value?: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
};

// Dates are the one field the CMS writes unquoted, which YAML hands over as a
// Date. Normalized news dates stay ISO strings so downstream sorting and
// formatting keep working.
export const toDateString = (value?: unknown): string | undefined => {
	if (value instanceof Date)
		return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
	return trim(value);
};

// Resolves an explicit value, falling back through later candidates until one
// is non-empty. Display fields (heading/intro) must never fall back to a
// seo.* field: visible content has to stand on its own, so editing the SEO
// title/description can't silently change what visitors see. The reverse is
// fine and used deliberately (see normalizeLocation's seoTitle): SEO metadata
// may fall back to a display value.
export const deriveDisplay = (
	explicit?: string | null,
	...fallbacks: Array<string | null | undefined>
): string =>
	trim(explicit) ??
	fallbacks.reduce<string | undefined>(
		(current, fallback) => current ?? trim(fallback),
		undefined,
	) ??
	"";

export const isLanguageCode = (value?: string | null): value is LanguageCode =>
	value === "de" || value === "en";

export const getLanguage = (
	frontmatter?: ImportedFrontmatter | null,
): LanguageCode =>
	isLanguageCode(frontmatter?.locale) ? frontmatter.locale : DEFAULT_LANGUAGE;

export const slugify = (value: string): string =>
	value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, "und")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const withLanguagePrefix = (language: LanguageCode, slug?: string): string => {
	const cleanSlug = trim(slug)?.replace(/^\/+|\/+$/g, "");

	if (language === DEFAULT_LANGUAGE) {
		return cleanSlug ? `/${cleanSlug}/` : "/";
	}

	return cleanSlug ? `/${language}/${cleanSlug}/` : `/${language}/`;
};

// seo.url und key stammen aus dem CMS und landen direkt in der URL. Werte,
// die kein sauberer Slug sind (leer, "..", Großbuchstaben, Sonderzeichen),
// werden verworfen, statt sie ungeprüft in Pfade und Build-Ausgabe zu
// übernehmen - dann greift der Standardslug.
const sanitizeConfiguredSlug = (value?: string | null): string | null => {
	const slug = trim(value);

	if (!slug) {
		return null;
	}

	const segments = slug.split("/");
	const segmentsAreClean =
		segments.length > 0 &&
		segments.every((segment) => segment.length > 0 && slugify(segment) === segment);

	return segmentsAreClean ? slug : null;
};

// CMS-Bildlisten speichern Objekte ({image: "…"}), handgeschriebene Dateien
// einfache Strings. Diese Hilfe liest beide Formen und liefert immer string[],
// damit Templates nie mit dem Roh-Shape arbeiten müssen.
export const normalizeImageList = (
	images?: Array<string | { image?: string | null }> | null,
): string[] =>
	(images ?? [])
		.map((image) => (typeof image === "string" ? image : image?.image))
		.map((image) => trim(image))
		.filter((image): image is string => Boolean(image));

const getFileSlug = (node: ImportedMdxNode): string | undefined => {
	const filePath = trim(node.internal?.contentFilePath);

	if (!filePath) {
		return undefined;
	}

	const match = filePath.match(/\/([^/]+)(?:\/index)?\.mdx?$/);
	return match?.[1] && match[1] !== "index" ? match[1] : undefined;
};

const getPageSlug = (node: ImportedMdxNode): string | undefined => {
	const frontmatter = node.frontmatter ?? {};
	const key = trim(frontmatter.key) ?? getFileSlug(node) ?? "";
	const template = getPageTemplate(frontmatter, key);
	const configuredSlug = trim(frontmatter.seo?.url);

	// The homepage lives at the language root ("/" or "/en/").
	if (template === "home" || key === "index") {
		return undefined;
	}

	// Funnel pages live at the language root (no path prefix).
	if (template === "funnel") {
		return configuredSlug ?? key ?? getFileSlug(node);
	}

	if (key && PAGE_PATH_OVERRIDES[key]) {
		return PAGE_PATH_OVERRIDES[key];
	}

	return configuredSlug ?? key ?? getFileSlug(node);
};

export const normalizePage = (node: ImportedMdxNode): NormalizedPage | null => {
  const frontmatter = node.frontmatter;

  if (!frontmatter || frontmatter.type !== "page") {
    return null;
  }

  const language = getLanguage(frontmatter);
  const key = trim(frontmatter.key) ?? getFileSlug(node) ?? node.id;
  const template = getPageTemplate(frontmatter, key);
  const heading = deriveDisplay(frontmatter.heading, key);
  const intro = trim(frontmatter.intro);

  // SEO-description: reines SEO-Feld. Nur wenn seo.description leer ist,
  // wird auf Heading und Intro zurückgefallen (nie umgekehrt).
  const description = deriveDisplay(
    trim(frontmatter.seo?.description),
    heading,
    intro,
  );

  const slug = getPageSlug(node);

  return {
    id: node.id,
    language,
    i18nKey: key,
    key,
    template,
    title: heading,
    description: trim(description),
    heading,
    intro,
    azHeading: trim(frontmatter.az_heading),
    azIntro: trim(frontmatter.az_intro),
    path: withLanguagePrefix(language, slug),
    body: trim(node.body),
    blocks: frontmatter.blocks ?? [],
    frontmatter,
  };
};

const COLOR_TOKEN_VALUES: readonly ColorToken[] = COLOR_TOKENS.map(
	(token) => token.value,
);

// A listing card or category tile with no colour chosen stays unstyled and
// falls back to its existing look — so this returns undefined instead of a
// default token (unlike the service tile colours, which always show some
// colour, default c1/text).
const normalizeOptionalColorToken = (value?: unknown): ColorToken | undefined => {
	const candidate = trim(value) as ColorToken | undefined;
	return candidate && COLOR_TOKEN_VALUES.includes(candidate)
		? candidate
		: undefined;
};

const getLocationBaseSlug = (group?: string | null): string =>
	group === "culinary" ? "gastronomie" : "shops";

export const normalizeLocation = (
	node: ImportedMdxNode,
): NormalizedLocation | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "location") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const heading = deriveDisplay(
		frontmatter.heading,
		frontmatter.name,
		node.id,
	);
	const intro = trim(frontmatter.intro);
	const seoTitle = deriveDisplay(frontmatter.seo?.title, heading);
	const slug = trim(frontmatter.seo?.url) ?? slugify(heading);
	const baseSlug = getLocationBaseSlug(frontmatter.group);

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title: heading,
		heading,
		intro,
		seoTitle,
		description: trim(frontmatter.seo?.description),
		slug,
		path: withLanguagePrefix(language, `${baseSlug}/${slug}`),
		group: trim(frontmatter.group) ?? "brand",
		body: trim(node.body),
		textColor: normalizeOptionalColorToken(frontmatter.text_color),
		backgroundColor: normalizeOptionalColorToken(frontmatter.background_color),
		frontmatter,
	};
};

export const normalizeJob = (node: ImportedMdxNode): NormalizedJob | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "job") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const titleParts = [
		trim(frontmatter.location),
		trim(frontmatter.position),
	].filter(Boolean);
	const title = titleParts.join(" – ") || trim(frontmatter.position) || "Job";
	const slug = getFileSlug(node) ?? slugify(title);
	const intro =
		deriveDisplay(frontmatter.intro, frontmatter.specification) || undefined;

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title,
		intro,
		slug,
		path: withLanguagePrefix(language, `jobs/${slug}`),
		body: trim(node.body),
		textColor: normalizeOptionalColorToken(frontmatter.text_color),
		backgroundColor: normalizeOptionalColorToken(frontmatter.background_color),
		frontmatter,
	};
};

export const normalizeNews = (node: ImportedMdxNode): NormalizedNews | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "news") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const heading = deriveDisplay(frontmatter.heading, node.id);
	const intro = trim(frontmatter.intro);
	const slug =
		trim(frontmatter.seo?.url) ??
		trim(slugify(heading)) ??
		getFileSlug(node) ??
		node.id;

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title: heading,
		heading,
		intro,
		slug,
		path: withLanguagePrefix(language, `news/${slug}`),
		date: toDateString(frontmatter.date) ?? null,
		body: trim(node.body),
		textColor: normalizeOptionalColorToken(frontmatter.text_color),
		backgroundColor: normalizeOptionalColorToken(frontmatter.background_color),
		frontmatter,
	};
};

const LOTTERY_FIELD_TYPES: readonly LotteryFieldType[] = [
	"TEXT",
	"EMAIL",
	"NUMBER",
	"DATE",
	"SELECT",
	"CHECKBOX",
	"TEXTAREA",
];

// Netlify reserviert diese Feldnamen; ein CMS-Feld mit gleichem Namen würde
// das Honeypot bzw. die form-name-Übergabe überschreiben.
const LOTTERY_RESERVED_FIELD_NAMES: readonly string[] = ["form-name", "bot-field"];

const isLotteryFieldType = (value?: unknown): value is LotteryFieldType =>
	typeof value === "string" &&
	LOTTERY_FIELD_TYPES.includes(value as LotteryFieldType);

const normalizeLotteryFormField = (
	field: ImportedLotteryFormField,
): NormalizedLotteryFormField | null => {
	const name = trim(field?.name);
	const label = trim(field?.label);
	// Handgeschriebenes YAML kennt Groß-/Kleinschreibung nicht zuverlässig
	// ("text" statt "TEXT") - akzeptiert wird beides.
	const rawType =
		typeof field?.type === "string" ? field.type.toUpperCase() : undefined;
	const type = isLotteryFieldType(rawType) ? rawType : undefined;

	if (!name || !label || !type) {
		return null;
	}

	if (LOTTERY_RESERVED_FIELD_NAMES.includes(name)) {
		return null;
	}

	const options = (field?.options ?? [])
		.map((option): NormalizedLotteryFormFieldOption | null => {
			const value = trim(option?.value);
			const optionLabel = trim(option?.label);
			return value && optionLabel ? { label: optionLabel, value } : null;
		})
		.filter(
			(option): option is NormalizedLotteryFormFieldOption =>
				option !== null,
		);

	return {
		name,
		type,
		label,
		// Bewusst strikt: Decap speichert Booleans korrekt, aber ein quoted
		// "false" in handgeschriebenem YAML dürfte nicht als Zustimmungspflicht
		// durchrutschen.
		required: field?.required === true,
		options,
	};
};

// Sprachabhängige Fallbacks für alle Formular-Texte, falls ein Editor
// form.state leert (Decap speichert geleerte Felder als Leerstring).
const LOTTERY_DEFAULT_STATE: Record<
	LanguageCode,
	{
		idleButton: string;
		sendingButton: string;
		successTitle: string;
		successButton: string;
		failureTitle: string;
		requiredError: string;
		retryingButton: string;
	}
> = {
	de: {
		idleButton: "Teilnehmen",
		sendingButton: "Wird gesendet...",
		successTitle: "Vielen Dank für deine Teilnahme!",
		successButton: "Zurück zur Startseite",
		failureTitle: "Bitte entschuldige...",
		requiredError: "Dieses Feld wird benötigt.",
		retryingButton: "Noch einmal versuchen",
	},
	en: {
		idleButton: "Enter now",
		sendingButton: "Sending...",
		successTitle: "Thank you for entering!",
		successButton: "Back to homepage",
		failureTitle: "Sorry about that...",
		requiredError: "This field is required.",
		retryingButton: "Try again",
	},
};

const DEFAULT_TERMS_URL_BY_LANGUAGE: Record<LanguageCode, string> = {
	de: "/datenschutz",
	en: "/en/privacy-policy",
};

// Der Checkbox-Text darf über Markdown auf die Teilnahmebedingungen verlinken.
// Fehlt der Link, wird der konfigurierte (settings.terms_url) bzw. der
// sprachabhängige Standard-Link angehängt - ohne Link wäre die geforderte
// Zustimmung für Teilnehmende nicht nachvollziehbar.
const withTermsLink = (
	field: NormalizedLotteryFormField,
	language: LanguageCode,
	termsUrl?: string | null,
): NormalizedLotteryFormField => {
	if (field.type !== "CHECKBOX" || field.label.includes("](")) {
		return field;
	}

	const linkText =
		language === "en" ? "terms and conditions" : "Teilnahmebedingungen";
	const url =
		trim(termsUrl) ?? DEFAULT_TERMS_URL_BY_LANGUAGE[language];

	return { ...field, label: `${field.label} ([${linkText}](${url}))` };
};

// Defensive by construction: a malformed `form.state` (missing nested keys,
// wrong types from a hand-edited YAML file) must never abort the build, so
// every text falls back to a language-appropriate default instead of throwing.
const normalizeLotteryForm = (
	form?: ImportedLotteryForm | null,
	language: LanguageCode = DEFAULT_LANGUAGE,
	termsUrl?: string | null,
): NormalizedLotteryForm | null => {
	const defaults = LOTTERY_DEFAULT_STATE[language] ?? LOTTERY_DEFAULT_STATE.de;
	const name = trim(form?.name);
	const fieldNames = new Set<string>();
	const fields = (form?.fields ?? [])
		.map(normalizeLotteryFormField)
		.filter((field): field is NormalizedLotteryFormField => field !== null)
		// Doppelte Feldnamen würden sich in den Values gegenseitig überschreiben
		// und doppelte DOM-IDs erzeugen - der erste Eintrag gewinnt.
		.filter((field) => {
			if (fieldNames.has(field.name)) {
				return false;
			}

			fieldNames.add(field.name);
			return true;
		})
		.map((field) => withTermsLink(field, language, termsUrl));

	if (!name || !fields.length) {
		return null;
	}

	return {
		name,
		fields,
		state: {
			idle: {
				button: deriveDisplay(form?.state?.idle?.button, defaults.idleButton),
			},
			sending: {
				button: deriveDisplay(
					form?.state?.sending?.button,
					defaults.sendingButton,
				),
			},
			success: {
				title: deriveDisplay(
					form?.state?.success?.title,
					defaults.successTitle,
				),
				content: trim(form?.state?.success?.content),
				button: deriveDisplay(
					form?.state?.success?.button,
					defaults.successButton,
				),
			},
			failure: {
				title: deriveDisplay(
					form?.state?.failure?.title,
					defaults.failureTitle,
				),
				content: trim(form?.state?.failure?.content),
				requiredError: deriveDisplay(
					form?.state?.failure?.errors?.required,
					defaults.requiredError,
				),
			},
			retrying: {
				button: deriveDisplay(
					form?.state?.retrying?.button,
					defaults.retryingButton,
				),
			},
		},
	};
};

export const normalizeLottery = (
	node: ImportedMdxNode,
	termsUrl?: string | null,
): NormalizedLottery | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "lottery") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const heading = deriveDisplay(frontmatter.heading, node.id);
	const intro = trim(frontmatter.intro);
	const key = trim(frontmatter.key) ?? getFileSlug(node) ?? node.id;
	// Pfadlogik wie bei Pages: seo.url überschreibt den Standardslug
	// (/gewinnspiel statt /lottery/gewinnspiel-2026-03).
	const configuredSlug = sanitizeConfiguredSlug(frontmatter.seo?.url);
	const slug = configuredSlug ?? key;
	const path = configuredSlug
		? withLanguagePrefix(language, configuredSlug)
		: withLanguagePrefix(language, `lottery/${key}`);

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? key,
		title: heading,
		heading,
		intro,
		slug,
		path,
		date: toDateString(frontmatter.date) ?? null,
		body: trim(node.body),
		form: normalizeLotteryForm(frontmatter.form, language, termsUrl),
		textColor: normalizeOptionalColorToken(frontmatter.text_color),
		backgroundColor: normalizeOptionalColorToken(frontmatter.background_color),
		frontmatter,
	};
};

// Reads the single settings entry that governs the lottery site-wide.
export const normalizeLotterySettings = (
	node: ImportedMdxNode,
): LotterySettings | null => {
	const frontmatter = node.frontmatter;

	if (
		!frontmatter ||
		frontmatter.type !== "settings" ||
		trim(frontmatter.name) !== "lottery"
	) {
		return null;
	}

	return {
		activeLottery: trim(frontmatter.active_lottery) ?? null,
		termsUrl: trim(frontmatter.terms_url) ?? null,
	};
};

export const normalizeCategory = (
	node: ImportedMdxNode,
): NormalizedCategory | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "category") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const uuid = trim(frontmatter.uuid);
	const name = trim(frontmatter.name);

	if (!uuid || !name) {
		return null;
	}

	return {
		id: node.id,
		language,
		uuid,
		name,
		slug: getFileSlug(node) ?? slugify(name),
		textColor: normalizeOptionalColorToken(frontmatter.text_color),
		backgroundColor: normalizeOptionalColorToken(frontmatter.background_color),
		frontmatter,
	};
};

const DEFAULT_SERVICE_TILE_COLOR: ColorToken = "c1";
const DEFAULT_SERVICE_TILE_TEXT_COLOR: ColorToken = "text";

const normalizeServiceTileColor = (value?: unknown): ColorToken =>
	normalizeOptionalColorToken(value) ?? DEFAULT_SERVICE_TILE_COLOR;

const normalizeServiceTileTextColor = (value?: unknown): ColorToken =>
	normalizeOptionalColorToken(value) ?? DEFAULT_SERVICE_TILE_TEXT_COLOR;

export const normalizeService = (
	node: ImportedMdxNode,
): NormalizedService | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "service") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const uuid = trim(frontmatter.uuid);
	const name = trim(frontmatter.name);

	if (!uuid || !name) {
		return null;
	}

	return {
		id: node.id,
		language,
		uuid,
		name,
		icon: trim(frontmatter.icon),
		description: trim(frontmatter.description),
		tile: Boolean(frontmatter.tile),
		tileColor: normalizeServiceTileColor(frontmatter.tile_color),
		tileTextColor: normalizeServiceTileTextColor(frontmatter.tile_text_color),
		frontmatter,
	};
};

export const normalizeFaq = (node: ImportedMdxNode): NormalizedFaq | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "faq") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const uuid = trim(frontmatter.uuid);
	const question = trim(frontmatter.question);

	if (!uuid || !question) {
		return null;
	}

	return {
		id: node.id,
		language,
		uuid,
		question,
		answer: trim(frontmatter.answer),
		order: typeof frontmatter.order === "number" ? frontmatter.order : 999,
		frontmatter,
	};
};

// Slot names become CSS custom properties, so only characters that are safe
// inside a custom property name are accepted. Which slots exist is the CMS's
// business, not this module's.
const COLOR_SLOT_PATTERN = /^[a-z][a-z0-9-]*$/;

export const normalizeColorScheme = (
	node: ImportedMdxNode,
): NormalizedColorScheme | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "color_scheme") {
		return null;
	}

	const key = trim(frontmatter.key) ?? getFileSlug(node);

	if (!key) {
		return null;
	}

	const colors: Record<string, string> = {};

	for (const [slot, value] of Object.entries(frontmatter.colors ?? {})) {
		const color = trim(value);

		if (!color || !COLOR_SLOT_PATTERN.test(slot)) {
			continue;
		}

		colors[slot] = color;
	}

	if (!Object.keys(colors).length) {
		return null;
	}

	return {
		id: node.id,
		key,
		name: deriveDisplay(frontmatter.name, key),
		colors,
	};
};

// Reads the single settings entry that holds the active scheme. Returns the
// scheme key, not the scheme itself, so resolving stays in one place.
export const normalizeThemeSettings = (
	node: ImportedMdxNode,
): string | null => {
	const frontmatter = node.frontmatter;

	if (
		!frontmatter ||
		frontmatter.type !== "settings" ||
		trim(frontmatter.name) !== "theme"
	) {
		return null;
	}

	return trim(frontmatter.active_scheme) ?? null;
};

// Falls back to the first scheme when the setting is empty or points at a
// scheme that no longer exists, so a missing selection never leaves the site
// without colours.
export const resolveActiveTheme = (
	schemes: NormalizedColorScheme[],
	activeSchemeKey?: string | null,
): SiteTheme | undefined => {
	if (!schemes.length) {
		return undefined;
	}

	const requested = trim(activeSchemeKey);
	const scheme =
		schemes.find((candidate) => candidate.key === requested) ?? schemes[0];

	return {
		key: scheme.key,
		name: scheme.name,
		colors: scheme.colors,
	};
};

export const createNavigationFromPages = (
	pages: NormalizedPage[],
): SiteNavigationItem[] =>
	pages
		.filter((page) => trim(page.frontmatter.menu))
		.map((page) => ({
			key: page.key,
			label: trim(page.frontmatter.menu_label) ?? page.title,
			menuLabel: trim(page.frontmatter.menu_label),
			url: page.path,
			language: page.language,
			order: page.frontmatter.order ?? 999,
			menu: trim(page.frontmatter.menu),
		}))
		.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

export type FooterSocialLink = {
	label: string;
	url: string;
	icon?: string;
	openInNewTab: boolean;
};

const deriveSocialLabel = (url: string): string => {
	const value = url.toLowerCase();
	if (value.includes("instagram")) return "Instagram";
	if (value.includes("facebook") || value.includes("fb.")) return "Facebook";
	if (value.includes("youtube")) return "YouTube";
	if (value.includes("tiktok")) return "TikTok";
	if (value.includes("linkedin")) return "LinkedIn";
	return "Social Media";
};

// Reads the per-language social links from the "footer" block so the footer
// can render them (the block content is otherwise not consumed by the site).
export const buildFooterSocialLinks = (
	nodes: ImportedMdxNode[],
): Record<LanguageCode, FooterSocialLink[]> => {
	const byLanguage: Record<LanguageCode, FooterSocialLink[]> = {
		de: [],
		en: [],
	};

	for (const node of nodes) {
		const frontmatter = node.frontmatter;
		if (frontmatter?.type !== "block" || trim(frontmatter.name) !== "footer") {
			continue;
		}

		const language = getLanguage(frontmatter);
		byLanguage[language] = (frontmatter.social_media ?? [])
			.map((item): FooterSocialLink | null => {
				const url = trim(item?.link);
				if (!url) return null;
				return {
					label: deriveSocialLabel(url),
					url,
					icon: trim(item?.icon),
					openInNewTab: true,
				};
			})
			.filter((item): item is FooterSocialLink => item !== null);
	}

	return byLanguage;
};

type Translatable = { language: LanguageCode; i18nKey: string; path: string };

// Groups items by their language-independent identity so each item can resolve
// the URL of its counterpart in the other language.
export const buildLanguageLinks = <T extends Translatable>(
	items: T[],
): ((item: T) => Record<LanguageCode, string>) => {
	const byKey = new Map<string, Partial<Record<LanguageCode, string>>>();

	for (const item of items) {
		const entry = byKey.get(item.i18nKey) ?? {};
		entry[item.language] = item.path;
		byKey.set(item.i18nKey, entry);
	}

	return (item: T) => {
		const entry = byKey.get(item.i18nKey) ?? {};
		return {
			de: entry.de ?? "/",
			en: entry.en ?? "/en/",
		};
	};
};

export const normalizeNodes = (nodes: ImportedMdxNode[]) => {
	const pages = nodes
		.map(normalizePage)
		.filter((page): page is NormalizedPage => Boolean(page));
	const locations = nodes
		.map(normalizeLocation)
		.filter((location): location is NormalizedLocation => Boolean(location));
	const jobs = nodes
		.map(normalizeJob)
		.filter((job): job is NormalizedJob => Boolean(job));
	const news = nodes
		.map(normalizeNews)
		.filter((item): item is NormalizedNews => Boolean(item));
	// Settings zuerst: der Terms-Link aus settings.terms_url fließt in die
	// Lottery-Normalisierung ein (Fallback-Link am Checkbox-Label).
	const lotterySettings = nodes
		.map(normalizeLotterySettings)
		.find((settings): settings is LotterySettings => Boolean(settings)) ??
		null;
	const lotteries = nodes
		.map((node) => normalizeLottery(node, lotterySettings?.termsUrl))
		.filter((item): item is NormalizedLottery => Boolean(item));
	const categories = nodes
		.map(normalizeCategory)
		.filter((category): category is NormalizedCategory => Boolean(category));
	const services = nodes
		.map(normalizeService)
		.filter((service): service is NormalizedService => Boolean(service));
	const faqs = nodes
		.map(normalizeFaq)
		.filter((faq): faq is NormalizedFaq => Boolean(faq));
	const colorSchemes = nodes
		.map(normalizeColorScheme)
		.filter((scheme): scheme is NormalizedColorScheme => Boolean(scheme));
	const activeSchemeKey = nodes
		.map(normalizeThemeSettings)
		.find((key): key is string => Boolean(key));

	return {
		pages,
		locations,
		jobs,
		news,
		lotteries,
		lotterySettings,
		categories,
		services,
		faqs,
		navigation: createNavigationFromPages(pages),
		theme: resolveActiveTheme(colorSchemes, activeSchemeKey),
	};
};
