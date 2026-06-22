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

const text = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
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

const ImportedBlock: React.FC<{ block: ImportedContentBlock }> = ({
	block,
}) => {
	const images = (block.images ?? []).filter((image) => text(image.image));
	const icons = (block.icons ?? []).filter(
		(icon) => text(icon.icon) || text(icon.text),
	);

	return (
		<section>
			{text(block.date) ? <p>{text(block.date)}</p> : null}
			{text(block.header) ? <h2>{text(block.header)}</h2> : null}
			<MarkdownContent content={block.text} />
			{icons.length ? (
				<ul>
					{icons.map((icon) => (
						<li key={`${icon.icon}-${icon.text}-${icon.link}`}>
							{text(icon.icon) ? (
								<img src={text(icon.icon)} alt="" loading="lazy" />
							) : null}
							{text(icon.link) ? (
								<a href={text(icon.link)}>
									{text(icon.text) ?? text(icon.link)}
								</a>
							) : (
								text(icon.text)
							)}
						</li>
					))}
				</ul>
			) : null}
			{images.length ? (
				<ul>
					{images.map((image) => (
						<li key={text(image.image)}>
							<img
								src={text(image.image)}
								alt={text(image.alt) ?? ""}
								loading="lazy"
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
