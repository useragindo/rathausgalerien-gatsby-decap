import * as React from "react";
import type { ResolvedSeo } from "../../lib/seo";

type SeoProps = {
	seo: ResolvedSeo;
	language?: string;
	noIndex?: boolean;
};

export const Seo: React.FC<SeoProps> = ({ seo, language = "de", noIndex = false }) => (
	<>
		<html lang={language} />
		<title>{seo.title}</title>
		{seo.description ? <meta name="description" content={seo.description} /> : null}
		{seo.canonicalUrl ? <link rel="canonical" href={seo.canonicalUrl} /> : null}
		{noIndex ? <meta name="robots" content="noindex" /> : null}
		<meta property="og:title" content={seo.openGraph.title} />
		{seo.openGraph.description ? (
			<meta property="og:description" content={seo.openGraph.description} />
		) : null}
		{seo.openGraph.image ? <meta property="og:image" content={seo.openGraph.image} /> : null}
		{seo.openGraph.imageAlt ? (
			<meta property="og:image:alt" content={seo.openGraph.imageAlt} />
		) : null}
		{seo.structuredData ? (
			<script type="application/ld+json">
				{JSON.stringify(seo.structuredData)}
			</script>
		) : null}
	</>
);
