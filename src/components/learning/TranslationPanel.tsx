"use client";

import { Languages, PanelRight } from "lucide-react";
import type { ContentSource, Term } from "@/lib/content/types";

type TranslationPanelProps = {
  term?: Term;
  totalTerms: number;
  source: ContentSource;
};

export function TranslationPanel({
  term,
  totalTerms,
  source,
}: TranslationPanelProps) {
  return (
    <aside className="sticky top-6 h-[calc(100vh-3rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-amber-400 text-slate-950">
              <Languages aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                Hover Panel
              </p>
              <h2 className="text-xl font-semibold">Terminology Bridge</h2>
            </div>
          </div>
        </div>

        {term ? (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6 rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                Active English Term
              </p>
              <h3 className="mt-2 text-3xl font-semibold leading-tight text-slate-950">
                {term.term}
              </h3>
            </div>

            <dl className="space-y-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Arabic Translation
                </dt>
                <dd
                  dir="rtl"
                  lang="ar"
                  className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-right text-2xl font-semibold leading-relaxed text-slate-950"
                >
                  {term.translation}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Exam-Focused Definition
                </dt>
                <dd className="mt-2 text-[1.05rem] leading-8 text-slate-700">
                  {term.definition || "No definition provided yet."}
                </dd>
              </div>

              {term.context ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Context
                  </dt>
                  <dd className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[0.98rem] leading-7 text-amber-950">
                    {term.context}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <PanelRight className="mb-4 text-slate-400" size={38} />
            <h3 className="text-xl font-semibold text-slate-950">
              Hover any highlighted term
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
              The Arabic translation, definition, and exam context will stay
              here while you keep reading.
            </p>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm leading-6 text-slate-600">
          <p>
            Loaded {totalTerms.toLocaleString()} terms from {source.label}.
          </p>
          {source.warning ? (
            <p className="mt-1 font-medium text-amber-800">{source.warning}</p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
