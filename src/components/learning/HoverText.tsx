"use client";

import { useMemo } from "react";
import { tokenizeText, type TermMatcher } from "@/lib/content/matching";
import type { Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

type HoverTextProps = {
  text: string;
  matcher: TermMatcher | null;
  onTermHover: (term: Term) => void;
  activeTermId?: string;
  as?: "p" | "span" | "div";
  className?: string;
  focusableTerms?: boolean;
};

export function HoverText({
  text,
  matcher,
  onTermHover,
  activeTermId,
  as = "span",
  className,
  focusableTerms = true,
}: HoverTextProps) {
  const tokens = useMemo(() => tokenizeText(text, matcher), [matcher, text]);
  const Element = as;

  return (
    <Element className={className}>
      {tokens.map((token, index) => {
        if (token.kind === "text") {
          return <span key={`${index}-${token.text}`}>{token.text}</span>;
        }

        const isActive = token.term.id === activeTermId;

        const TermElement = focusableTerms ? "button" : "span";

        return (
          <TermElement
            key={`${index}-${token.term.id}-${token.text}`}
            {...(focusableTerms ? { type: "button" as const } : {})}
            onFocus={() => onTermHover(token.term)}
            onMouseEnter={() => onTermHover(token.term)}
            className={cx(
              "rounded-[5px] border-b border-dotted px-0.5 text-left font-semibold transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
              isActive
                ? "border-amber-600 bg-amber-100 text-amber-950"
                : "border-amber-500/80 bg-amber-50/70 text-slate-950 hover:bg-amber-100",
            )}
          >
            {token.text}
          </TermElement>
        );
      })}
    </Element>
  );
}
