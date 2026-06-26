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
	ImportedContentTileRow,
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
	| "image-left"
	| "text-left"
	| "slider-left"
	| "slider-right";

const text = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const isImportedBlockLayout = (value?: string | null): value is ImportedBlockLayout =>
	Boolean(
		value &&
			["grid-4", "image-left", "text-left", "slider-left", "slider-right"].includes(value),
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

const hasTileContent = (
	tile?: ImportedContentTile | null,
): tile is ImportedContentTile => {
	if (!tile) {
		return false;
	}

	const hasText = Boolean(text(tile.text));
	const hasImages = (tile.images ?? []).some((image) => text(image.image));
	const hasLink = Boolean(text(tile.link)) || Boolean(text(tile.category));

	return hasText || hasImages || hasLink;
};

const Tile: React.FC<{
	tile: ImportedContentTile;
	categories: NormalizedCategory[] | null | undefined;
	language: LanguageCode;
	className?: string;
}> = ({ tile, categories, language, className = "" }) => {
	const images = (tile.images ?? []).filter((image) => text(image.image));
	const tileText = text(tile.text);
	const link = resolveTileLink(tile, categories, language);
	const isSlider = images.length > 1;

	const tileClassName = [
		"content-block__tile",
		images.length ? "content-block__tile--media" : "content-block__tile--content",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const tileContent = (
		<>
			{images.length ? (
				isSlider ? (
					<ImageSlider images={images} />
				) : (
					<img
						src={text(images[0].image)}
						alt={text(images[0].alt) ?? ""}
						loading="lazy"
					/>
				)
			) : null}
			{tileText ? (
				<div className="content-block__text">
					<MarkdownContent content={tileText} />
				</div>
			) : null}
		</>
	);

	return link ? (
		<a href={link} className={tileClassName}>
			{tileContent}
		</a>
	) : (
		<div className={tileClassName}>{tileContent}</div>
	);
};

const TileGrid: React.FC<{
	tiles: ImportedContentTileRow[];
	categories: NormalizedCategory[] | null | undefined;
	language: LanguageCode;
}> = ({ tiles, categories, language }) => {
	const items: { tile: ImportedContentTile; key: string }[] = [];

	for (const row of tiles.slice(0, 2)) {
		if (hasTileContent(row.left)) {
			items.push({ tile: row.left, key: `tile-left-${items.length}` });
		}

		if (hasTileContent(row.right)) {
			items.push({ tile: row.right, key: `tile-right-${items.length}` });
		}
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<>
			{items.map(({ tile, key }) => (
				<Tile
					key={key}
					tile={tile}
					categories={categories}
					language={language}
				/>
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
	const icons = (block.icons ?? []).filter(
		(icon) => text(icon.icon) || text(icon.text),
	);
	const layout = getImportedBlockLayout(block, index);
	const isSliderLayout = layout === "slider-left" || layout === "slider-right";
	const isGridLayout = layout === "grid-4";
	// For 2-column layouts (image-left / text-left), show all images as a slider
	// when multiple images are present; for grid-4, show first 3 images as static tiles
	const isTwoColumnLayout =
		layout === "image-left" ||
		layout === "text-left" ||
		layout === "slider-left" ||
		layout === "slider-right";
	const displayedImages = isGridLayout ? images.slice(0, 3) : images.slice(0, 1);
	// For 2-column layouts with multiple images, use a slider instead of single image
	const useDynamicSlider = isTwoColumnLayout && images.length > 1;
	const hasTiles = (block.tiles ?? []).some(
		(row) => hasTileContent(row.left) || hasTileContent(row.right),
	);

	const blockClassName = [
		"content-block",
		"content-block--imported",
		`content-block--${layout}`,
		`content-block--index-${index + 1}`,
		images.length ? "content-block--has-images" : "",
		icons.length ? "content-block--has-icons" : "",
	]
		.filter(Boolean)
		.join(" ");

	const contentTile = (
		<div className="content-block__tile content-block__tile--content">
			<div className="content-block__text">
				<MarkdownContent content={block.text} />
			</div>
			{icons.length ? (
				<ul className="content-block__icons" aria-label="Schnelllinks">
					{icons.map((icon) => {
						const visibleText = text(icon.text);
						const linkLabel = visibleText ?? getActionLinkLabel(icon.link);
						const hasIcon = Boolean(text(icon.icon));
						const actionClassName = [
							"content-block__icon-action",
							hasIcon && !visibleText
								? "content-block__icon-action--icon-only"
								: "",
						]
							.filter(Boolean)
							.join(" ");
						const iconContent = (
							<>
								{text(icon.icon) ? (
									<img src={text(icon.icon)} alt="" loading="lazy" />
								) : null}
								{visibleText ? <span>{visibleText}</span> : null}
							</>
						);

						return (
							<li key={`${icon.icon}-${icon.text}-${icon.link}`}>
								{text(icon.link) ? (
									<a
										className={actionClassName}
										href={text(icon.link)}
										aria-label={linkLabel}
									>
										{iconContent}
									</a>
								) : (
									<span className={actionClassName}>{iconContent}</span>
								)}
							</li>
						);
					})}
				</ul>
			) : null}
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
				<p className="content-block__section-title">{text(block.header)}</p>
			) : null}
			<div className="content-block__body">
				{hasTiles ? (
					<TileGrid
						tiles={block.tiles ?? []}
						categories={categories}
						language={language}
					/>
				) : layout === "image-left" || layout === "slider-left" ? (
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
