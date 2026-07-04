"use client";

import { useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { HoverText } from "./HoverText";
import type { TermMatcher } from "@/lib/content/matching";
import type { Mcq, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

type McqCardProps = {
  mcq: Mcq;
  index: number;
  matcher: TermMatcher | null;
  activeTermId?: string;
  onTermHover: (term: Term) => void;
};

export function McqCard({
  mcq,
  index,
  matcher,
  activeTermId,
  onTermHover,
}: McqCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOptionId === mcq.correctOptionId;

  return (
    <article className="ltr-content rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
          {index + 1}
        </div>
        <HoverText
          as="p"
          text={mcq.question}
          matcher={matcher}
          activeTermId={activeTermId}
          onTermHover={onTermHover}
          className="pt-1 text-xl font-semibold leading-8 text-slate-950"
        />
      </div>

      <div className="grid gap-3">
        {mcq.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isAnswer = option.id === mcq.correctOptionId;
          const showCorrect = isAnswered && isAnswer;
          const showWrong = isAnswered && isSelected && !isAnswer;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              className={cx(
                "flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                showCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : showWrong
                    ? "border-rose-300 bg-rose-50"
                    : isSelected
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50",
              )}
            >
              {showCorrect ? (
                <CheckCircle2 className="shrink-0 text-emerald-700" size={22} />
              ) : showWrong ? (
                <XCircle className="shrink-0 text-rose-700" size={22} />
              ) : (
                <Circle className="shrink-0 text-slate-400" size={22} />
              )}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-700">
                {option.id}
              </span>
              <span className="text-base leading-7 text-slate-800">
                <HoverText
                  text={option.text}
                  matcher={matcher}
                  activeTermId={activeTermId}
                  onTermHover={onTermHover}
                  focusableTerms={false}
                />
              </span>
            </button>
          );
        })}
      </div>

      {isAnswered ? (
        <div
          className={cx(
            "mt-5 rounded-md border px-4 py-3 text-base leading-7",
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950",
          )}
        >
          <strong>{isCorrect ? "Correct." : "Review this trap."}</strong>{" "}
          <HoverText
            text={mcq.explanation}
            matcher={matcher}
            activeTermId={activeTermId}
            onTermHover={onTermHover}
          />
        </div>
      ) : null}
    </article>
  );
}
