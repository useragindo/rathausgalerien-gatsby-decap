import * as React from "react";
import type {
	GastronomyHighlightBlock,
	GiftIdeasSliderBlock,
	HeroShoppingBlock,
	LinkField,
	LinkListBlock,
	NewsTeaserBlock,
	PageContentBlock,
	ParkingBlock,
	SectionIntroBlock,
	SocialTeaserBlock,
	TeaserGridBlock,
} from "../../lib/cms";
import { MarkdownContent } from "../../lib/content/markdown";
import type { LanguageCode } from "../../lib/content/types";
import type {
	ImportedContentBlock,
	ImportedContentTile,
	ImportedIcon,
	ImportedImage,
	NormalizedCategory,
} from "../../lib/content/types";
import { ImageSlider } from "./image-slider";

type ContentBlockRendererProps = {
	blocks?: Array<PageContentBlock | ImportedContentBlock> | null;
	language?: LanguageCode;
	categories?: NormalizedCategory[] | null;
};

type ImportedBlockLayout =
	| "grid-4"
	| "columns"
	| "image-left"
	| "text-left"
	| "slider-left"
	| "slider-right";

const text = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const renderMultiline = (value: string): React.ReactNode =>
	value.split("\n").map((line, index) => (
		<React.Fragment key={index}>
			{index > 0 ? <br /> : null}
			{line}
		</React.Fragment>
	));

const isImportedBlockLayout = (value?: string | null): value is ImportedBlockLayout =>
	Boolean(
		value &&
			[
				"grid-4",
				"columns",
				"image-left",
				"text-left",
				"slider-left",
				"slider-right",
			].includes(value),
	);

const getImportedBlockLayout = (
	block: ImportedContentBlock,
	_index: number,
): ImportedBlockLayout => {
	// CMS-Layout hat immer Priorität — kein Auto-Fallback der es überschreibt
	if (isImportedBlockLayout(block.layout)) {
		return block.layout;
	}

	// Fallback wenn kein Layout im CMS gesetzt ist
	const header = text(block.header)?.toLowerCase() ?? "";
	const imageCount = block.images?.length ?? 0;

	if (header.includes("follow")) {
		return "slider-left";
	}

	if (imageCount >= 4 || imageCount > 1) {
		return "grid-4";
	}

	return "text-left";
};

const getHostnameLabel = (url: string): string | undefined => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return undefined;
	}
};

const getPathLabel = (url: string): string | undefined => {
	const path = url.replace(/^\/+|\/+$/g, "");
	return path ? path.replace(/[-_]+/g, " ") : undefined;
};

const getActionLinkLabel = (url?: string | null): string | undefined => {
	const cleanUrl = text(url);

	if (!cleanUrl) {
		return undefined;
	}

	return getHostnameLabel(cleanUrl) ?? getPathLabel(cleanUrl) ?? cleanUrl;
};

// A single decorative icon (no label, no link) is a hero graphic: large,
// centered above the text, instead of the small action pills used for icon
// lists (e.g. "24/7 Parkgarage" or Follow-us social links).
const resolveIconDisplay = (
	icons?: ImportedIcon[] | null,
): { heroIcon?: ImportedIcon; listIcons: ImportedIcon[] } => {
	const validIcons = (icons ?? []).filter(
		(icon) => text(icon.icon) || text(icon.text),
	);
	const heroIcon =
		validIcons.length === 1 && !text(validIcons[0].text) && !text(validIcons[0].link)
			? validIcons[0]
			: undefined;

	return { heroIcon, listIcons: heroIcon ? [] : validIcons };
};

const IconList: React.FC<{ icons: ImportedIcon[] }> = ({ icons }) => {
	if (!icons.length) {
		return null;
	}

	return (
		<ul className="content-block__icons" aria-label="Schnelllinks">
			{icons.map((icon) => {
				const visibleText = text(icon.text);
				const linkLabel = visibleText ?? getActionLinkLabel(icon.link);
				const hasIcon = Boolean(text(icon.icon));
				const actionClassName = [
					"content-block__icon-action",
					hasIcon && !visibleText ? "content-block__icon-action--icon-only" : "",
				]
					.filter(Boolean)
					.join(" ");
				const iconContent = (
					<>
						{text(icon.icon) ? <img src={text(icon.icon)} alt="" loading="lazy" /> : null}
						{visibleText ? <span>{visibleText}</span> : null}
					</>
				);

				return (
					<li key={`${icon.icon}-${icon.text}-${icon.link}`}>
						{text(icon.link) ? (
							<a className={actionClassName} href={text(icon.link)} aria-label={linkLabel}>
								{iconContent}
							</a>
						) : (
							<span className={actionClassName}>{iconContent}</span>
						)}
					</li>
				);
			})}
		</ul>
	);
};

const LinkList: React.FC<{ links?: LinkField[] | null }> = ({ links }) => {
	const validLinks = (links ?? []).filter(
		(link) => text(link.label) && text(link.url),
	);

	if (validLinks.length === 0) {
		return null;
	}

	return (
		<ul>
			{validLinks.map((link) => (
				<li key={`${link.url}-${link.label}`}>
					<a
						href={text(link.url)}
						aria-label={text(link.ariaLabel)}
						target={link.openInNewTab ? "_blank" : undefined}
						rel={link.openInNewTab ? "noreferrer" : undefined}
					>
						{text(link.label)}
					</a>
				</li>
			))}
		</ul>
	);
};

const HeroShopping: React.FC<{ block: HeroShoppingBlock }> = ({ block }) => (
	<section aria-label={text(block.ariaLabel)}>
		{text(block.eyebrow) ? <p>{text(block.eyebrow)}</p> : null}
		{text(block.heading) ? <h1>{text(block.heading)}</h1> : null}
		{text(block.subheading) ? <p>{text(block.subheading)}</p> : null}
		{block.stats?.length ? (
			<ul>
				{block.stats.map((stat) => (
					<li key={`${stat.value}-${stat.label}`}>
						{text(stat.value) ? <strong>{text(stat.value)}</strong> : null}
						{text(stat.label) ? <span>{text(stat.label)}</span> : null}
					</li>
				))}
			</ul>
		) : null}
	</section>
);

const SectionIntro: React.FC<{ block: SectionIntroBlock }> = ({ block }) => (
	<section id={text(block.anchorId)}>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.text) ? <p>{text(block.text)}</p> : null}
	</section>
);

const TeaserGrid: React.FC<{ block: TeaserGridBlock }> = ({ block }) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.text) ? <p>{text(block.text)}</p> : null}
		{block.teasers?.length ? (
			<ul>
				{block.teasers.map((teaser) => (
					<li key={`${teaser.url}-${teaser.title}`}>
						{text(teaser.url) ? (
							<a href={text(teaser.url)} aria-label={text(teaser.ariaLabel)}>
								{text(teaser.title) ?? text(teaser.url)}
							</a>
						) : text(teaser.title) ? (
							<h3>{text(teaser.title)}</h3>
						) : null}
						{text(teaser.text) ? <p>{text(teaser.text)}</p> : null}
					</li>
				))}
			</ul>
		) : null}
	</section>
);

const GastronomyHighlight: React.FC<{ block: GastronomyHighlightBlock }> = ({
	block,
}) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.text) ? <p>{text(block.text)}</p> : null}
		{block.highlightTile ? (
			<article aria-label={text(block.highlightTile.ariaLabel)}>
				{text(block.highlightTile.title) ? (
					<h3>{text(block.highlightTile.title)}</h3>
				) : null}
				{text(block.highlightTile.text) ? (
					<p>{text(block.highlightTile.text)}</p>
				) : null}
				{text(block.highlightTile.url) ? (
					<a href={text(block.highlightTile.url)}>Mehr erfahren</a>
				) : null}
			</article>
		) : null}
	</section>
);

const NewsTeaser: React.FC<{ block: NewsTeaserBlock }> = ({ block }) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{block.teasers?.length ? (
			<ul>
				{block.teasers.map((teaser) => (
					<li key={`${teaser.url}-${teaser.title}`}>
						{text(teaser.title) ? <h3>{text(teaser.title)}</h3> : null}
						{text(teaser.text) ? <p>{text(teaser.text)}</p> : null}
						{text(teaser.url) ? (
							<a href={text(teaser.url)} aria-label={text(teaser.ariaLabel)}>
								Weiterlesen
							</a>
						) : null}
					</li>
				))}
			</ul>
		) : null}
	</section>
);

const Parking: React.FC<{ block: ParkingBlock }> = ({ block }) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.text) ? <p>{text(block.text)}</p> : null}
		{block.parkingTile ? (
			<article aria-label={text(block.parkingTile.ariaLabel)}>
				{text(block.parkingTile.title) ? (
					<h3>{text(block.parkingTile.title)}</h3>
				) : null}
				{text(block.parkingTile.spacesLabel) ? (
					<p>{text(block.parkingTile.spacesLabel)}</p>
				) : null}
				{text(block.parkingTile.evChargingLabel) ? (
					<p>{text(block.parkingTile.evChargingLabel)}</p>
				) : null}
				{text(block.parkingTile.url) ? (
					<a href={text(block.parkingTile.url)}>Mehr erfahren</a>
				) : null}
			</article>
		) : null}
	</section>
);

const SocialTeaser: React.FC<{ block: SocialTeaserBlock }> = ({ block }) => (
	<section aria-label={text(block.ariaLabel)}>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.platform) ? <p>{text(block.platform)}</p> : null}
		{text(block.url) ? <a href={text(block.url)}>Social Media öffnen</a> : null}
	</section>
);

const GiftIdeasSlider: React.FC<{ block: GiftIdeasSliderBlock }> = ({
	block,
}) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		{text(block.text) ? <p>{text(block.text)}</p> : null}
		{block.introTile ? (
			<article>
				{text(block.introTile.title) ? (
					<h3>{text(block.introTile.title)}</h3>
				) : null}
				{text(block.introTile.text) ? (
					<p>{text(block.introTile.text)}</p>
				) : null}
			</article>
		) : null}
		{block.slides?.length ? (
			<ul>
				{block.slides.map((slide) => (
					<li key={`${slide.url}-${slide.title}`}>
						{text(slide.title) ? <h3>{text(slide.title)}</h3> : null}
						{text(slide.text) ? <p>{text(slide.text)}</p> : null}
						{text(slide.url) ? (
							<a href={text(slide.url)} aria-label={text(slide.ariaLabel)}>
								Mehr erfahren
							</a>
						) : null}
					</li>
				))}
			</ul>
		) : null}
	</section>
);

const LinkListBlockComponent: React.FC<{ block: LinkListBlock }> = ({
	block,
}) => (
	<section>
		{text(block.heading) ? <h2>{text(block.heading)}</h2> : null}
		<LinkList links={block.links} />
	</section>
);

const resolveCategorySlug = (
	categoryUuid: string,
	categories: NormalizedCategory[] | null | undefined,
	language: LanguageCode,
): string | undefined => {
	const normalizedUuid = categoryUuid.trim().toLowerCase();
	return categories?.find(
		(category) =>
			category.uuid.trim().toLowerCase() === normalizedUuid &&
			category.language === language,
	)?.slug;
};

const resolveTileLink = (
	tile: ImportedContentTile,
	categories: NormalizedCategory[] | null | undefined,
	language: LanguageCode,
): string | undefined => {
	const manualLink = text(tile.link);
	if (manualLink) {
		return manualLink;
	}

	const categoryUuid = text(tile.category);
	if (!categoryUuid) {
		return undefined;
	}

	const slug = resolveCategorySlug(categoryUuid, categories, language);
	if (!slug) {
		return undefined;
	}

	return `/${language === "de" ? "" : `${language}/`}category/${slug}/`;
};

const getTileImages = (tile: ImportedContentTile): ImportedImage[] => {
	const images = (tile.images ?? []).filter((image) => text(image.image));
	if (images.length) {
		return images;
	}

	const legacyImage = text(tile.image);
	return legacyImage ? [{ image: legacyImage }] : [];
};

const hasTileContent = (
	tile?: ImportedContentTile | null,
): tile is ImportedContentTile => {
	if (!tile) {
		return false;
	}

	const hasText = Boolean(text(tile.text));
	const hasImage = getTileImages(tile).length > 0;
	const hasLink = Boolean(text(tile.link)) || Boolean(text(tile.category));
	const hasIcons = (tile.icons ?? []).some((icon) => text(icon.icon) || text(icon.text));

	return hasText || hasImage || hasLink || hasIcons;
};

// A single visual box: either the tile's text (content box) or its image(s)
// (media box). A tile carrying both text and image(s) yields two boxes, so a
// row of left/right tiles renders as text, image, text, image. A media box
// with more than one image renders as a slider with the same arrows used
// elsewhere in the content blocks.
const TileBox: React.FC<{
	variant: "content" | "media";
	tile: ImportedContentTile;
	link?: string;
}> = ({ variant, tile, link }) => {
	const boxClassName = [
		"content-block__tile",
		variant === "media"
			? "content-block__tile--media"
			: "content-block__tile--content",
	].join(" ");

	const tileImages = variant === "media" ? getTileImages(tile) : [];
	const backgroundColor = variant === "content" ? text(tile.backgroundColor) : undefined;
	const style = backgroundColor ? { backgroundColor } : undefined;
	const { heroIcon, listIcons } =
		variant === "content" ? resolveIconDisplay(tile.icons) : { heroIcon: undefined, listIcons: [] };

	const inner =
		variant === "media" ? (
			tileImages.length > 1 ? (
				<ImageSlider images={tileImages} />
			) : (
				<img src={text(tileImages[0]?.image)} alt="" loading="lazy" />
			)
		) : (
			<>
				{heroIcon && text(heroIcon.icon) ? (
					<img className="content-block__hero-icon" src={text(heroIcon.icon)} alt="" loading="lazy" />
				) : null}
				<div className="content-block__text">
					<MarkdownContent content={tile.text} />
				</div>
				<IconList icons={listIcons} />
			</>
		);

	const fullClassName = [boxClassName, heroIcon ? "content-block__tile--hero" : ""]
		.filter(Boolean)
		.join(" ");

	return link ? (
		<a href={link} className={fullClassName} style={style}>
			{inner}
		</a>
	) : (
		<div className={fullClassName} style={style}>
			{inner}
		</div>
	);
};

const TileGrid: React.FC<{
	tiles: ImportedContentTile[];
	categories: NormalizedCategory[] | null | undefined;
	language: LanguageCode;
}> = ({ tiles, categories, language }) => {
	const items: { variant: "content" | "media"; tile: ImportedContentTile; link?: string; key: string }[] = [];

	for (const tile of tiles.slice(0, 4)) {
		if (!hasTileContent(tile)) {
			continue;
		}

		const link = resolveTileLink(tile, categories, language);

		const hasIcons = (tile.icons ?? []).some((icon) => text(icon.icon) || text(icon.text));
		if (text(tile.text) || hasIcons) {
			items.push({ variant: "content", tile, link, key: `tile-text-${items.length}` });
		}

		if (getTileImages(tile).length) {
			items.push({ variant: "media", tile, link, key: `tile-media-${items.length}` });
		}
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<>
			{items.slice(0, 4).map(({ variant, tile, link, key }) => (
				<TileBox key={key} variant={variant} tile={tile} link={link} />
			))}
		</>
	);
};

const ImportedBlock: React.FC<{
	block: ImportedContentBlock;
	index: number;
	language?: LanguageCode;
	categories?: NormalizedCategory[] | null;
}> = ({ block, index, language = "de", categories }) => {
	const images = (block.images ?? []).filter((image) => text(image.image));
	const { heroIcon, listIcons } = resolveIconDisplay(block.icons);
	const icons = [...(heroIcon ? [heroIcon] : []), ...listIcons];
	const layout = getImportedBlockLayout(block, index);
	const isSliderLayout = layout === "slider-left" || layout === "slider-right";
	const isGridLayout = layout === "grid-4";
	// For 2-column layouts (columns + legacy image-left / text-left / slider-*), show all
	// images as a slider when multiple images are present; for grid-4, show first 3 as static tiles
	const isTwoColumnLayout =
		layout === "columns" ||
		layout === "image-left" ||
		layout === "text-left" ||
		layout === "slider-left" ||
		layout === "slider-right";
	const displayedImages = isGridLayout ? images.slice(0, 3) : images.slice(0, 1);
	// For 2-column layouts with multiple images, use a slider instead of single image
	const useDynamicSlider = isTwoColumnLayout && images.length > 1;
	const hasTiles = (block.tiles ?? []).some((tile) => hasTileContent(tile));
	// Legacy layout values encode the column order directly; the new "columns" layout uses the
	// "reversed" checkbox instead, defaulting to false (text left / image right).
	const isReversed =
		typeof block.reversed === "boolean"
			? block.reversed
			: layout === "image-left" || layout === "slider-left";
	const orderClassLayout = isReversed ? "image-left" : "text-left";

	const blockClassName = [
		"content-block",
		"content-block--imported",
		`content-block--${isTwoColumnLayout ? orderClassLayout : layout}`,
		`content-block--index-${index + 1}`,
		images.length ? "content-block--has-images" : "",
		icons.length ? "content-block--has-icons" : "",
	]
		.filter(Boolean)
		.join(" ");

	const contentBackgroundColor = text(block.backgroundColor);

	const contentTile = (
		<div
			className={[
				"content-block__tile",
				"content-block__tile--content",
				heroIcon ? "content-block__tile--hero" : "",
			]
				.filter(Boolean)
				.join(" ")}
			style={contentBackgroundColor ? { backgroundColor: contentBackgroundColor } : undefined}
		>
			{heroIcon && text(heroIcon.icon) ? (
				<img className="content-block__hero-icon" src={text(heroIcon.icon)} alt="" loading="lazy" />
			) : null}
			<div className="content-block__text">
				<MarkdownContent content={block.text} />
			</div>
			<IconList icons={listIcons} />
		</div>
	);

	const mediaTiles = displayedImages.map((image, imageIndex) => (
		<div
			className="content-block__tile content-block__tile--media"
			key={`${text(image.image)}-${imageIndex}`}
		>
			<img
				src={text(image.image)}
				alt={text(image.alt) ?? ""}
				loading={index === 0 && imageIndex === 0 ? "eager" : "lazy"}
			/>
		</div>
	));

	const sliderTile = images.length ? (
		<div className="content-block__tile content-block__tile--media">
			<ImageSlider images={images} />
		</div>
	) : null;

	// For 2-column layouts with multiple images, use a dynamic slider
	const dynamicSliderTile = images.length ? (
		<div className="content-block__tile content-block__tile--media">
			<ImageSlider images={images} />
		</div>
	) : null;

	return (
		<section className={blockClassName}>
			{text(block.header) ? (
				<p className="content-block__section-title">{renderMultiline(text(block.header) as string)}</p>
			) : null}
			{text(block.teaserText) ? (
				<p className="content-block__intro">{renderMultiline(text(block.teaserText) as string)}</p>
			) : null}
			{hasTiles && text(block.text) ? (
				<div className="content-block__intro">
					<MarkdownContent content={block.text} />
				</div>
			) : null}
			<div className="content-block__body">
				{hasTiles ? (
					<TileGrid
						tiles={block.tiles ?? []}
						categories={categories}
						language={language}
					/>
				) : isReversed ? (
					<>
						{isSliderLayout ? sliderTile : useDynamicSlider ? dynamicSliderTile : mediaTiles}
						{contentTile}
					</>
				) : (
					<>
						{contentTile}
						{isSliderLayout ? sliderTile : useDynamicSlider ? dynamicSliderTile : mediaTiles}
					</>
				)}
			</div>
		</section>
	);
};

const isImportedBlock = (
	block: PageContentBlock | ImportedContentBlock,
): block is ImportedContentBlock => !("type" in block);

const renderBlock = (
	block: PageContentBlock | ImportedContentBlock,
	index: number,
	language: LanguageCode,
	categories: NormalizedCategory[] | null | undefined,
): React.ReactNode => {
	if (isImportedBlock(block)) {
		return (
			<ImportedBlock
				key={`${block.header ?? "imported"}-${index}`}
				block={block}
				index={index}
				language={language}
				categories={categories}
			/>
		);
	}

	const key = `${block.type}-${block.blockTitle ?? index}`;

	switch (block.type) {
		case "heroShoppingBlock":
			return <HeroShopping key={key} block={block} />;
		case "sectionIntroBlock":
			return <SectionIntro key={key} block={block} />;
		case "teaserGridBlock":
			return <TeaserGrid key={key} block={block} />;
		case "gastronomyHighlightBlock":
			return <GastronomyHighlight key={key} block={block} />;
		case "newsTeaserBlock":
			return <NewsTeaser key={key} block={block} />;
		case "parkingBlock":
			return <Parking key={key} block={block} />;
		case "socialTeaserBlock":
			return <SocialTeaser key={key} block={block} />;
		case "giftIdeasSliderBlock":
			return <GiftIdeasSlider key={key} block={block} />;
		case "linkListBlock":
			return <LinkListBlockComponent key={key} block={block} />;
		default:
			return null;
	}
};

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
	blocks,
	language = "de",
	categories,
}) => {
	if (!blocks?.length) {
		return null;
	}

	return <>{blocks.map((block, index) => renderBlock(block, index, language, categories))}</>;
};
