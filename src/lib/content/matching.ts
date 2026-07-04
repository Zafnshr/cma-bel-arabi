import type { Term } from "./types";

export type TextToken =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "term";
      text: string;
      term: Term;
    };

export type TermMatcher = {
  regex: RegExp;
  byAlias: Map<string, Term>;
};

export function createTermMatcher(terms: Term[]): TermMatcher | null {
  const byAlias = new Map<string, Term>();

  for (const term of terms) {
    for (const alias of [term.term, ...term.aliases]) {
      const normalized = normalizePhrase(alias);

      if (normalized.length >= 3 && !byAlias.has(normalized)) {
        byAlias.set(normalized, term);
      }
    }
  }

  const aliases = [...byAlias.keys()].sort((a, b) => b.length - a.length);

  if (aliases.length === 0) {
    return null;
  }

  const pattern = aliases.map(escapeRegExp).join("|");
  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}_])(${pattern})(?=$|[^\\p{L}\\p{N}_])`,
    "giu",
  );

  return { regex, byAlias };
}

export function tokenizeText(text: string, matcher: TermMatcher | null) {
  if (!matcher || !text) {
    return [{ kind: "text", text }] satisfies TextToken[];
  }

  const tokens: TextToken[] = [];
  const regex = new RegExp(matcher.regex);
  let cursor = 0;

  for (const match of text.matchAll(regex)) {
    if (match.index === undefined) {
      continue;
    }

    const prefix = match[1] ?? "";
    const value = match[2] ?? "";
    const start = match.index + prefix.length;
    const end = start + value.length;
    const term = matcher.byAlias.get(normalizePhrase(value));

    if (!term) {
      continue;
    }

    if (start > cursor) {
      tokens.push({ kind: "text", text: text.slice(cursor, start) });
    }

    tokens.push({ kind: "term", text: text.slice(start, end), term });
    cursor = end;
  }

  if (cursor < text.length) {
    tokens.push({ kind: "text", text: text.slice(cursor) });
  }

  return tokens.length > 0 ? tokens : ([{ kind: "text", text }] as TextToken[]);
}

function normalizePhrase(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
