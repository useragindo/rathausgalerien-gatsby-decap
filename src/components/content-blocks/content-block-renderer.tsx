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
import type { ImportedContentBlock } from "../../lib/content/types";

type ContentBlockRendererProps = {
	blocks?: Array<PageContentBlock | ImportedContentBlock> | null;
};

type ImportedBlockVariant = "feature" | "compact" | "gallery" | "social";

const text = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const getImportedBlockVariant = (
	block: ImportedContentBlock,
	index: number,
): ImportedBlockVariant => {
	const header = text(block.header)?.toLowerCase() ?? "";
	const imageCount = block.images?.length ?? 0;

	if (index === 0 || imageCount >= 4) {
		return "feature";
	}

	if (header.includes("follow")) {
		return "social";
	}

	if (imageCount > 1) {
		return "gallery";
	}

	return "compact";
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

const ImportedBlock: React.FC<{
	block: ImportedContentBlock;
	index: number;
}> = ({ block, index }) => {
	const images = (block.images ?? []).filter((image) => text(image.image));
	const icons = (block.icons ?? []).filter(
		(icon) => text(icon.icon) || text(icon.text),
	);
	const variant = getImportedBlockVariant(block, index);
	const blockClassName = [
		"content-block",
		"content-block--imported",
		`content-block--${variant}`,
		`content-block--index-${index + 1}`,
		images.length ? "content-block--has-images" : "",
		images.length ? `content-block--media-count-${images.length}` : "",
		icons.length ? "content-block--has-icons" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<section className={blockClassName}>
			<div className="content-block__content">
				{text(block.date) ? (
					<p className="content-block__eyebrow">{text(block.date)}</p>
				) : null}
				{text(block.header) ? (
					<h2 className="content-block__title">{text(block.header)}</h2>
				) : null}
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
			{images.length ? (
				<ul className="content-block__media-grid">
					{images.map((image, imageIndex) => (
						<li
							className="content-block__media-item"
							key={`${text(image.image)}-${imageIndex}`}
						>
							<img
								src={text(image.image)}
								alt={text(image.alt) ?? ""}
								loading={index === 0 && imageIndex === 0 ? "eager" : "lazy"}
							/>
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
};

const isImportedBlock = (
	block: PageContentBlock | ImportedContentBlock,
): block is ImportedContentBlock => !("type" in block);

const renderBlock = (
	block: PageContentBlock | ImportedContentBlock,
	index: number,
): React.ReactNode => {
	if (isImportedBlock(block)) {
		return (
			<ImportedBlock
				key={`${block.header ?? "imported"}-${index}`}
				block={block}
				index={index}
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
}) => {
	if (!blocks?.length) {
		return null;
	}

	return <>{blocks.map(renderBlock)}</>;
};
