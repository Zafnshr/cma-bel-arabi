"use client";

import { useMemo, useState } from "react";
import { BookOpen, ClipboardCheck, Search } from "lucide-react";
import { McqCard } from "./McqCard";
import { StudyUnitView } from "./StudyUnitView";
import { TranslationPanel } from "./TranslationPanel";
import { createTermMatcher } from "@/lib/content/matching";
import type { LearningData, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

type LearningWorkspaceProps = LearningData;
type Mode = "study" | "practice";

export function LearningWorkspace({
  terms,
  studyUnits,
  mcqs,
  source,
}: LearningWorkspaceProps) {
  const [mode, setMode] = useState<Mode>("study");
  const [activeUnitId, setActiveUnitId] = useState(studyUnits[0]?.id ?? "");
  const [activeTerm, setActiveTerm] = useState<Term | undefined>(terms[0]);
  const [query, setQuery] = useState("");
  const matcher = useMemo(() => createTermMatcher(terms), [terms]);
  const activeUnit =
    studyUnits.find((unit) => unit.id === activeUnitId) ?? studyUnits[0];
  const visibleMcqs = mcqs.filter((mcq) => mcq.unitId === activeUnit?.id);
  const filteredUnits = studyUnits.filter((unit) => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return `${unit.title} ${unit.summary}`.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              CMA Bel Arabi
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">
              English CMA Reading Workspace
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("study")}
              className={modeButtonClass(mode === "study")}
            >
              <BookOpen aria-hidden="true" size={18} />
              Study Units
            </button>
            <button
              type="button"
              onClick={() => setMode("practice")}
              className={modeButtonClass(mode === "practice")}
            >
              <ClipboardCheck aria-hidden="true" size={18} />
              Practice MCQ
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-[260px_minmax(0,1fr)_390px] gap-6 px-8 py-6">
        <nav className="sticky top-6 h-[calc(100vh-3rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-4 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-500">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Search units</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search units"
              className="h-full w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="space-y-2">
            {filteredUnits.map((unit) => {
              const isActive = unit.id === activeUnit?.id;

              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setActiveUnitId(unit.id)}
                  className={cx(
                    "w-full rounded-md border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-amber-300 bg-amber-50 text-amber-950"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {unit.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {unit.estimatedMinutes} min - {unit.part}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <main className="min-w-0">
          {activeUnit && mode === "study" ? (
            <StudyUnitView
              unit={activeUnit}
              matcher={matcher}
              activeTermId={activeTerm?.id}
              onTermHover={setActiveTerm}
            />
          ) : null}

          {activeUnit && mode === "practice" ? (
            <section className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white px-7 py-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Practice Module
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                  {activeUnit.title} MCQs
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                  Hover technical terms in the question or options before
                  choosing an answer. The right panel will keep the last term in
                  view while you reason through the trap.
                </p>
              </div>

              {visibleMcqs.map((mcq, index) => (
                <McqCard
                  key={mcq.id}
                  mcq={mcq}
                  index={index}
                  matcher={matcher}
                  activeTermId={activeTerm?.id}
                  onTermHover={setActiveTerm}
                />
              ))}
            </section>
          ) : null}
        </main>

        <TranslationPanel
          term={activeTerm}
          totalTerms={terms.length}
          source={source}
        />
      </div>
    </div>
  );
}

function modeButtonClass(isActive: boolean) {
  return cx(
    "flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
    isActive
      ? "bg-slate-950 text-white shadow-sm"
      : "text-slate-600 hover:bg-white hover:text-slate-950",
  );
}
