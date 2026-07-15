"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Flag, Timer, XCircle } from "lucide-react";
import {
  LearningAssistPanel,
  type AssistPanelItem,
} from "@/components/learning/LearningAssistPanel";
import { HoverText } from "@/components/learning/HoverText";
import { createTermMatcher } from "@/lib/content/matching";
import type { ContentSource, Mcq, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

type SimulatorWorkspaceProps = {
  mcqs: Mcq[];
  terms: Term[];
  source: ContentSource;
};

export function SimulatorWorkspace({
  mcqs,
  terms,
  source,
}: SimulatorWorkspaceProps) {
  const [activeTerm, setActiveTerm] = useState<Term | undefined>(terms[0]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  
  const matcher = useMemo(() => createTermMatcher(terms), [terms]);
  const assistItem: AssistPanelItem | undefined = activeTerm
    ? { kind: "term", term: activeTerm }
    : undefined;
  
  const answeredCount = Object.keys(answers).length;
  const correctCount = mcqs.filter(
    (mcq) => answers[mcq.id] === mcq.correctOptionId,
  ).length;

  const activeMcq = mcqs[currentMcqIndex];

  function selectAnswer(mcqId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [mcqId]: optionId }));
  }

  function toggleFlag(mcqId: string) {
    setFlaggedIds((current) => {
      const next = new Set(current);

      if (next.has(mcqId)) {
        next.delete(mcqId);
      } else {
        next.add(mcqId);
      }

      return next;
    });
  }

  return (
    <div className="grid grid-cols-[390px_minmax(0,1fr)] gap-6">
      <LearningAssistPanel
        item={assistItem}
        totalTerms={terms.length}
        source={source}
      />

      <section className="grid gap-5">
        <div className="grid grid-cols-4 gap-4">
          <Stat label="عدد الأسئلة" value={mcqs.length.toLocaleString("ar-EG")} />
          <Stat
            label="تمت الإجابة"
            value={answeredCount.toLocaleString("ar-EG")}
          />
          <Stat
            label="إجابات صحيحة"
            value={correctCount.toLocaleString("ar-EG")}
          />
          <Stat
            label="للمراجعة"
            value={flaggedIds.size.toLocaleString("ar-EG")}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-8 py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-500 font-sans">
                محاكي MCQ
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                تدريب بنمط الامتحان
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Timer aria-hidden="true" size={17} />
              مؤقت تجريبي: 00:45:00
            </div>
          </div>

          <div className="flex-1 p-8">
            {activeMcq && (
              <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 dark:bg-slate-800 text-sm font-bold text-white shadow-sm" style={{ fontFamily: "var(--font-cairo)" }}>
                      {currentMcqIndex + 1}
                    </div>
                    <div className="flex-1">
                      <HoverText
                        as="p"
                        text={activeMcq.question}
                        matcher={matcher}
                        activeTermId={activeTerm?.id}
                        onTermHover={setActiveTerm}
                        className="ltr-content pt-1 text-xl font-bold leading-9 text-slate-950 dark:text-white"
                      />
                      {activeMcq.questionAr && (
                        <p className="mt-3 text-lg font-medium text-slate-600 dark:text-slate-400">
                          {activeMcq.questionAr}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlag(activeMcq.id)}
                    className={cx(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors focus:outline-none",
                      flaggedIds.has(activeMcq.id)
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                    )}
                    aria-label="وضع علامة للمراجعة"
                  >
                    <Flag aria-hidden="true" size={18} />
                  </button>
                </div>

                <div className="grid gap-3">
                  {activeMcq.options.map((option) => {
                    const selectedOptionId = answers[activeMcq.id];
                    const isAnswered = Boolean(selectedOptionId);
                    const isSelected = selectedOptionId === option.id;
                    const isAnswer = option.id === activeMcq.correctOptionId;
                    const showCorrect = isAnswered && isAnswer;
                    const showWrong = isAnswered && isSelected && !isAnswer;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => !isAnswered && selectAnswer(activeMcq.id, option.id)}
                        className={cx(
                          "ltr-content flex min-h-14 items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                          !isAnswered && "cursor-pointer",
                          isAnswered && !isSelected && !showCorrect && "opacity-60 cursor-default",
                          showCorrect
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                            : showWrong
                              ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20"
                              : isSelected
                                ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-700",
                        )}
                      >
                        {showCorrect ? (
                          <CheckCircle2
                            className="shrink-0 text-emerald-700 dark:text-emerald-500"
                            size={24}
                          />
                        ) : showWrong ? (
                          <XCircle
                            className="shrink-0 text-rose-700 dark:text-rose-500"
                            size={24}
                          />
                        ) : (
                          <Circle
                            className={cx("shrink-0", isSelected ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}
                            size={24}
                          />
                        )}
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm" style={{ fontFamily: "var(--font-cairo)" }}>
                          {option.id}
                        </span>
                        <div className="flex-1 text-right">
                          <span className="text-lg leading-8 text-slate-800 dark:text-slate-200 font-medium ltr-content block text-left">
                            <HoverText
                              text={option.text}
                              matcher={matcher}
                              activeTermId={activeTerm?.id}
                              onTermHover={setActiveTerm}
                              focusableTerms={false}
                            />
                          </span>
                          {option.textAr && (
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                              {option.textAr}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {answers[activeMcq.id] ? (
                  <div
                    className={cx(
                      "mt-6 rounded-xl border px-5 py-4 text-lg leading-8 shadow-sm",
                      answers[activeMcq.id] === activeMcq.correctOptionId
                        ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100"
                        : "border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100",
                    )}
                  >
                    <strong>
                      {answers[activeMcq.id] === activeMcq.correctOptionId
                        ? "إجابة صحيحة."
                        : "راجع الفخ."}
                    </strong>{" "}
                    <span className="ltr-content block mt-2 text-left">
                      <HoverText
                        text={activeMcq.explanation}
                        matcher={matcher}
                        activeTermId={activeTerm?.id}
                        onTermHover={setActiveTerm}
                      />
                    </span>
                    {activeMcq.explanationAr && (
                      <p className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50 text-base">
                        {activeMcq.explanationAr}
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            )}
            
            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
              <button
                type="button"
                disabled={currentMcqIndex === 0}
                onClick={() => setCurrentMcqIndex(curr => curr - 1)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                السؤال السابق
              </button>
              
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans tracking-widest">
                {currentMcqIndex + 1} / {mcqs.length}
              </div>

              <button
                type="button"
                disabled={currentMcqIndex === mcqs.length - 1}
                onClick={() => setCurrentMcqIndex(curr => curr + 1)}
                className="rounded-xl border border-transparent bg-amber-500 dark:bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600 dark:hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                السؤال التالي
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <p className="text-3xl font-bold text-slate-950 dark:text-white" style={{ fontFamily: "var(--font-cairo)" }}>{value}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
