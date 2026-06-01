import netlifyIdentity from "netlify-identity-widget";

const identityTokenHashes = ["#invite_token=", "#recovery_token=", "#confirmation_token="];

const hasIdentityToken = (hash: string): boolean =>
	identityTokenHashes.some((tokenHash) => hash.startsWith(tokenHash));

export const onClientEntry = (): void => {
	netlifyIdentity.init();

	netlifyIdentity.on("login", () => {
		netlifyIdentity.close();
		window.location.assign("/admin/");
	});

	if (hasIdentityToken(window.location.hash)) {
		netlifyIdentity.open();
	}
};
