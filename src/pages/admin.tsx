import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";

let isCmsInitialized = false;

const AdminPage: React.FC<PageProps> = () => {
	const [loadError, setLoadError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (isCmsInitialized) {
			return;
		}

		void import("decap-cms-app")
			.then(({ default: CMS }) => {
				CMS.init();
				isCmsInitialized = true;
			})
			.catch((error: unknown) => {
				const message =
					error instanceof Error ? error.message : "Unbekannter Fehler";
				setLoadError(message);
			});
	}, []);

	if (loadError) {
		return (
			<main>
				<h1>Decap CMS konnte nicht geladen werden</h1>
				<p>{loadError}</p>
			</main>
		);
	}

	return null;
};

export default AdminPage;

export const Head: HeadFC = () => (
	<>
		<html lang="de" />
		<title>Rathausgalerien CMS</title>
		<meta name="robots" content="noindex" />
	</>
);
