import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
	siteMetadata: {
		title: `Rathausgalerien Agindo Demo`,
		siteUrl: `https://www.yourdomain.tld`,
	},
	// More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
	// If you use VSCode you can also use the GraphQL plugin
	// Learn more at: https://gatsby.dev/graphql-typegen
	graphqlTypegen: true,
	plugins: [
		"gatsby-plugin-sass",
		{
			resolve: "gatsby-plugin-decap-cms",
			options: {
				modulePath: `${__dirname}/src/cms/cms.js`,
			},
		},
		"gatsby-plugin-image",
		"gatsby-plugin-sitemap",
		{
			resolve: "gatsby-plugin-mdx",
			options: {
				extensions: [".mdx", ".md"],
			},
		},
		"gatsby-plugin-sharp",
		"gatsby-transformer-sharp",
		"gatsby-transformer-yaml",
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "images",
				path: "./src/images/",
			},
			__key: "images",
		},
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "pages",
				path: "./src/pages/",
			},
			__key: "pages",
		},
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "content",
				path: "./content/",
			},
			__key: "content",
		},
	],
};

export default config;
