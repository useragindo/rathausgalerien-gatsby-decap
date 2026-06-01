import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { SiteLayout } from "../layouts";

const IndexPage: React.FC<PageProps> = () => (
	<SiteLayout siteTitle="RathausGalerien">
		<section aria-labelledby="page-title">
			<h1 id="page-title">RathausGalerien</h1>
		</section>
	</SiteLayout>
);

export default IndexPage;

export const Head: HeadFC = () => (
	<>
		<html lang="de" />
		<title>RathausGalerien</title>
		<meta name="robots" content="noindex" />
	</>
);
