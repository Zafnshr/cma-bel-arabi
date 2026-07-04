import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Term } from "./types";

const TERM_SOURCE_CANDIDATES = [
  path.join(process.cwd(), "data", "terms.md"),
  path.join(
    process.cwd(),
    "..",
    "Scientific content",
    "CMA Terminology - Part 1 & Common.md",
  ),
];

export function getTerms(): Term[] {
  const sourcePath = TERM_SOURCE_CANDIDATES.find((candidate) =>
    existsSync(candidate),
  );

  if (!sourcePath) {
    return [];
  }

  return parseTermsMarkdown(readFileSync(sourcePath, "utf8"));
}

export function parseTermsMarkdown(markdown: string): Term[] {
  const chunks = markdown.split(/\r?\n---\r?\n/g);
  const duplicateCounts = new Map<string, number>();

  return chunks.flatMap((chunk) => {
    const heading = /^##\s+(.+)$/m.exec(chunk);

    if (!heading || heading.index === undefined) {
      return [];
    }

    const term = heading[1].trim();
    const body = chunk.slice(heading.index + heading[0].length).trim();
    const translation = /^\*\*(.+?)\*\*/m.exec(body);

    if (!term || !translation || translation.index === undefined) {
      return [];
    }

    const definition = body
      .slice(translation.index + translation[0].length)
      .replace(/\s+/g, " ")
      .trim();

    const baseId = slugify(term);
    const duplicateIndex = duplicateCounts.get(baseId) ?? 0;
    duplicateCounts.set(baseId, duplicateIndex + 1);

    return [
      {
        id: duplicateIndex === 0 ? baseId : `${baseId}-${duplicateIndex + 1}`,
        term,
        translation: translation[1].trim(),
        definition,
        context:
          "مرر على المصطلحات أثناء القراءة أو التدريب لربط صياغة الامتحان الإنجليزية بالمفهوم العربي.",
        aliases: buildAliases(term),
      },
    ];
  });
}

function buildAliases(term: string) {
  const aliases = new Set<string>([term]);
  const withoutParenthetical = term.replace(/\s*\([^)]*\)/g, "").trim();

  if (withoutParenthetical && withoutParenthetical !== term) {
    aliases.add(withoutParenthetical);
  }

  for (const match of term.matchAll(/\(([^)]+)\)/g)) {
    const parenthetical = match[1].trim();

    if (parenthetical) {
      aliases.add(parenthetical);
    }
  }

  return [...aliases];
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "term"
  );
}
