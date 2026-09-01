#!/usr/bin/env node
// Bakes the value currently displayed via the seo.title/seo.description
// fallback (see deriveDisplay in src/lib/content/normalize.ts) into an
// explicit heading/intro field, so the fallback can later be removed from
// normalize.ts without changing what visitors see. seo.* itself is never
// touched: it keeps driving <title>/<meta description>, just not the body copy.
//
// Only inserts the two lines that are missing; the rest of each file is left
// byte-for-byte untouched, so a re-serializing YAML dump (which would also
// happily unquote a `date: "2026-01-15"` into a real Date) is deliberately
// avoided.
//
// Usage: node scripts/migrate-seo-to-display.mjs [--write] [contentDir]
// Default is --dry-run (report only); pass --write to modify files.

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const write = args.includes("--write");
const contentDir = args.find((arg) => !arg.startsWith("--")) ?? "content";

const FRONTMATTER_RE = /^(---\r?\n)([\s\S]*?\r?\n)(---\r?\n?)([\s\S]*)$/;

function walk(dir, files = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) walk(full, files);
		else if (/\.mdx?$/.test(entry)) files.push(full);
	}
	return files;
}

function trim(value) {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// Renders a single `key: value` YAML mapping entry (respecting multiline
// scalars, quoting, etc.) via js-yaml, the same library gray-matter uses to
// parse - so the emitted style matches what the rest of the file already uses.
function renderYamlEntry(key, value) {
	const wrapped = matter.stringify("", { [key]: value });
	const match = wrapped.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		throw new Error(`Failed to render YAML entry for "${key}"`);
	}
	return match[1];
}

// Decides which of heading/intro (if any) this frontmatter should gain,
// mirroring the exact fallback order each normalize* function in
// src/lib/content/normalize.ts uses - so only a value that seo.* currently
// supplies gets migrated, never one already covered by another explicit field.
function planAdditions(frontmatter) {
	const type = frontmatter.type;
	const seoTitle = trim(frontmatter.seo?.title);
	const seoDescription = trim(frontmatter.seo?.description);
	const additions = {};

	if (type === "news") {
		return additions;
	}

	if (type === "page") {
		if (!trim(frontmatter.heading) && seoTitle) {
			additions.heading = seoTitle;
		}
		if (!trim(frontmatter.intro) && seoDescription) {
			additions.intro = seoDescription;
		}
	}

	if (type === "location") {
		// heading already falls back to frontmatter.name (a required field),
		// which sits ahead of seo.title in the chain, so seo.title is never
		// actually the source of a displayed location heading today.
		if (!trim(frontmatter.intro) && seoDescription) {
			additions.intro = seoDescription;
		}
	}

	if (type === "job") {
		// Jobs have no heading concept (title is built from location+position).
		// specification sits BEHIND seo.description in the fallback chain, so
		// only migrate when seo.description is what's actually being shown.
		if (!trim(frontmatter.intro) && seoDescription) {
			additions.intro = seoDescription;
		}
	}

	return additions;
}

const files = walk(contentDir).sort();
const counts = {};
const touchedFiles = [];

for (const file of files) {
	const raw = readFileSync(file, "utf8");
	const match = raw.match(FRONTMATTER_RE);
	if (!match) continue;

	const { data: frontmatter } = matter(raw);
	if (!frontmatter?.type) continue;

	const additions = planAdditions(frontmatter);
	const keys = Object.keys(additions);
	if (keys.length === 0) continue;

	for (const key of keys) {
		const countKey = `${frontmatter.type}-${key === "heading" ? "Headings" : "Intros"}`;
		counts[countKey] = (counts[countKey] ?? 0) + 1;
	}
	touchedFiles.push({ file, additions });

	if (write) {
		const [, openFence, body, closeFence, rest] = match;
		const newLines = keys.map((key) => renderYamlEntry(key, additions[key])).join("\n");
		const needsNewline = body.endsWith("\n") ? "" : "\n";
		const updatedFrontmatter = `${body}${needsNewline}${newLines}\n`;
		writeFileSync(file, `${openFence}${updatedFrontmatter}${closeFence}${rest}`);
	}
}

console.log(`Mode: ${write ? "WRITE" : "DRY-RUN"} (content dir: ${contentDir})`);
console.log("");
for (const [key, count] of Object.entries(counts).sort()) {
	console.log(`${key}: ${count}`);
}
console.log("");
console.log(`Total files touched: ${touchedFiles.length}`);

if (!write) {
	console.log("");
	console.log("Files that would change:");
	for (const { file, additions } of touchedFiles) {
		console.log(`  ${file} -> ${Object.keys(additions).join(", ")}`);
	}
}
