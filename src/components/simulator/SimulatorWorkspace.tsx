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
  const matcher = useMemo(() => createTermMatcher(terms), [terms]);
  const assistItem: AssistPanelItem | undefined = activeTerm
    ? { kind: "term", term: activeTerm }
    : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = mcqs.filter(
    (mcq) => answers[mcq.id] === mcq.correctOptionId,
  ).length;

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

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                محاكي MCQ
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                تدريب بنمط الامتحان
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Timer aria-hidden="true" size={17} />
              مؤقت تجريبي: 00:45:00
            </div>
          </div>

          <div className="grid gap-5 p-6">
            {mcqs.map((mcq, index) => {
              const selectedOptionId = answers[mcq.id];
              const isAnswered = Boolean(selectedOptionId);
              const isCorrect = selectedOptionId === mcq.correctOptionId;

              return (
                <article
                  key={mcq.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <HoverText
                        as="p"
                        text={mcq.question}
                        matcher={matcher}
                        activeTermId={activeTerm?.id}
                        onTermHover={setActiveTerm}
                        className="ltr-content pt-1 text-xl font-semibold leading-8 text-slate-950"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(mcq.id)}
                      className={cx(
                        "flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors",
                        flaggedIds.has(mcq.id)
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-white text-slate-400 hover:text-amber-700",
                      )}
                      aria-label="وضع علامة للمراجعة"
                    >
                      <Flag aria-hidden="true" size={18} />
                    </button>
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
                          onClick={() => selectAnswer(mcq.id, option.id)}
                          className={cx(
                            "ltr-content flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                            showCorrect
                              ? "border-emerald-300 bg-emerald-50"
                              : showWrong
                                ? "border-rose-300 bg-rose-50"
                                : isSelected
                                  ? "border-amber-300 bg-amber-50"
                                  : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50",
                          )}
                        >
                          {showCorrect ? (
                            <CheckCircle2
                              className="shrink-0 text-emerald-700"
                              size={22}
                            />
                          ) : showWrong ? (
                            <XCircle
                              className="shrink-0 text-rose-700"
                              size={22}
                            />
                          ) : (
                            <Circle
                              className="shrink-0 text-slate-400"
                              size={22}
                            />
                          )}
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                            {option.id}
                          </span>
                          <span className="text-base leading-7 text-slate-800">
                            <HoverText
                              text={option.text}
                              matcher={matcher}
                              activeTermId={activeTerm?.id}
                              onTermHover={setActiveTerm}
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
                      <strong>{isCorrect ? "إجابة صحيحة." : "راجع الفخ."}</strong>{" "}
                      <span className="ltr-content inline-block">
                        <HoverText
                          text={mcq.explanation}
                          matcher={matcher}
                          activeTermId={activeTerm?.id}
                          onTermHover={setActiveTerm}
                        />
                      </span>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}
