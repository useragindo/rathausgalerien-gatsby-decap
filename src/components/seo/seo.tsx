import * as React from "react";
import type { ResolvedSeo } from "../../lib/seo";

type SeoProps = {
	seo: ResolvedSeo;
	language?: string;
	noIndex?: boolean;
};

export const Seo: React.FC<SeoProps> = ({
	seo,
	language = "de",
	noIndex,
}) => {
	const shouldNoIndex = noIndex ?? seo.noIndex ?? false;
	return (
		<>
			<html lang={language} />
			<title>{seo.title}</title>
			{seo.description ? (
				<meta name="description" content={seo.description} />
			) : null}
			{seo.canonicalUrl ? <link rel="canonical" href={seo.canonicalUrl} /> : null}
			{shouldNoIndex ? <meta name="robots" content="noindex" /> : null}
			<meta property="og:title" content={seo.openGraph.title} />
			{seo.openGraph.url ? (
				<meta property="og:url" content={seo.openGraph.url} />
			) : null}
			{seo.openGraph.description ? (
				<meta property="og:description" content={seo.openGraph.description} />
			) : null}
			{seo.openGraph.type ? (
				<meta property="og:type" content={seo.openGraph.type} />
			) : null}
			{seo.openGraph.locale ? (
				<meta property="og:locale" content={seo.openGraph.locale} />
			) : null}
			{seo.openGraph.siteName ? (
				<meta property="og:site_name" content={seo.openGraph.siteName} />
			) : null}
			{seo.openGraph.image ? (
				<meta property="og:image" content={seo.openGraph.image} />
			) : null}
			{seo.openGraph.imageAlt ? (
				<meta property="og:image:alt" content={seo.openGraph.imageAlt} />
			) : null}
			{seo.twitter?.card ? (
				<meta name="twitter:card" content={seo.twitter.card} />
			) : null}
			{seo.twitter?.title ? (
				<meta name="twitter:title" content={seo.twitter.title} />
			) : null}
			{seo.twitter?.description ? (
				<meta name="twitter:description" content={seo.twitter.description} />
			) : null}
			{seo.twitter?.image ? (
				<meta name="twitter:image" content={seo.twitter.image} />
			) : null}
			{seo.twitter?.imageAlt ? (
				<meta name="twitter:image:alt" content={seo.twitter.imageAlt} />
			) : null}
			{seo.structuredData ? (
				<script type="application/ld+json">
					{JSON.stringify(seo.structuredData).replace(/</g, "\u003c")}
				</script>
			) : null}
		</>
	);
};
