// Rendert docs/CMS-Handbuch.md nach docs/CMS-Handbuch.pdf.
// Aufruf aus dem Projekt-Root:  node docs/build-handbuch-pdf.mjs
//
// Ablauf: Markdown -> HTML (marked) -> Headless Chrome -> PDF.
// marked wird bewusst per npx geholt statt als Projekt-Dependency: das Handbuch
// ist Doku, kein Build-Artefakt der Website. Die im Repo liegenden remark-Pakete
// sind alte CJS-Versionen (unified 9 / remark-parse 6) und dafür unbrauchbar.
// Chrome kommt aus /Applications; ein anderer Pfad geht über CHROME_BIN.

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const docsDir = path.dirname(fileURLToPath(import.meta.url));

const CHROME =
	process.env.CHROME_BIN ??
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CSS = `
	@page { size: A4; margin: 18mm 16mm; }
	body {
		font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
		font-size: 10.5pt;
		line-height: 1.5;
		color: #1a1a1a;
		max-width: none;
	}
	h1 { font-size: 22pt; margin: 0 0 1.2em; }
	h2 {
		font-size: 15pt;
		margin: 1.8em 0 0.6em;
		padding-bottom: 0.2em;
		border-bottom: 2px solid #22254e;
		page-break-after: avoid;
	}
	h3 { font-size: 12pt; margin: 1.4em 0 0.5em; page-break-after: avoid; }
	p, li { orphans: 2; widows: 2; }
	code {
		font-family: "SF Mono", Menlo, monospace;
		font-size: 0.88em;
		background: #f2f3f7;
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		margin: 0.8em 0;
		font-size: 9.5pt;
		page-break-inside: avoid;
	}
	th, td { border: 1px solid #ccd; padding: 5px 8px; text-align: left; vertical-align: top; }
	th { background: #eef1f8; }
	img {
		max-width: 100%;
		height: auto;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin: 0.6em 0;
		page-break-inside: avoid;
	}
	blockquote {
		margin: 0.8em 0;
		padding: 0.5em 1em;
		background: #f7f8fc;
		border-left: 4px solid #22254e;
		page-break-inside: avoid;
	}
	blockquote p { margin: 0.3em 0; }
	hr { border: none; border-top: 1px solid #ddd; margin: 1.6em 0; }
	a { color: #22254e; }
`;

const { stdout: body } = await run(
	"npx",
	["--yes", "marked@15", "-i", path.join(docsDir, "CMS-Handbuch.md")],
	{ maxBuffer: 32 * 1024 * 1024 },
);

// Die temporäre HTML-Datei liegt in docs/, damit die relativen Bildpfade greifen.
const htmlFile = path.join(docsDir, ".handbuch-print.html");
await fs.writeFile(
	htmlFile,
	`<!doctype html><html lang="de"><meta charset="utf-8">
<title>CMS-Handbuch für Redakteure</title>
<style>${CSS}</style>
${body}
</html>`,
);

const pdfFile = path.join(docsDir, "CMS-Handbuch.pdf");
await run(CHROME, [
	"--headless=new",
	"--disable-gpu",
	"--no-pdf-header-footer",
	`--print-to-pdf=${pdfFile}`,
	`file://${htmlFile}`,
]);

await fs.rm(htmlFile);
const { size } = await fs.stat(pdfFile);
console.log(`CMS-Handbuch.pdf neu erzeugt (${Math.round(size / 1024)} KB)`);
