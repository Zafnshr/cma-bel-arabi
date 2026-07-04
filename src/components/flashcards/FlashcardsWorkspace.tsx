"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  LearningAssistPanel,
  type AssistPanelItem,
} from "@/components/learning/LearningAssistPanel";
import type { ContentSource, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

type FlashcardsWorkspaceProps = {
  terms: Term[];
  source: ContentSource;
};

type ReviewState = {
  interval: number;
  ease: number;
  dueInDays: number;
  repetitions: number;
};

const starterState: ReviewState = {
  interval: 0,
  ease: 2.5,
  dueInDays: 0,
  repetitions: 0,
};

export function FlashcardsWorkspace({ terms, source }: FlashcardsWorkspaceProps) {
  const deck = useMemo(() => terms.slice(0, 40), [terms]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const activeTerm = deck[cardIndex];
  const reviewState = activeTerm
    ? states[activeTerm.id] ?? starterState
    : starterState;
  const assistItem: AssistPanelItem | undefined = activeTerm && isRevealed
    ? { kind: "term", term: activeTerm }
    : undefined;

  function gradeCard(quality: "again" | "hard" | "good" | "easy") {
    if (!activeTerm) {
      return;
    }

    setStates((current) => ({
      ...current,
      [activeTerm.id]: nextReviewState(
        current[activeTerm.id] ?? starterState,
        quality,
      ),
    }));
    setIsRevealed(false);
    setCardIndex((current) => (current + 1) % deck.length);
  }

  if (!activeTerm) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-600">
        لا توجد مصطلحات متاحة للمراجعة.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[390px_minmax(0,1fr)] gap-6">
      <LearningAssistPanel
        item={assistItem}
        totalTerms={terms.length}
        source={source}
      />

      <section className="grid min-h-[720px] grid-rows-[auto_minmax(0,1fr)] gap-5">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="بطاقات المجموعة" value={deck.length.toLocaleString("ar-EG")} />
          <Stat
            label="مراجعات اليوم"
            value={Object.keys(states).length.toLocaleString("ar-EG")}
          />
          <Stat
            label="الفاصل الحالي"
            value={`${reviewState.interval.toLocaleString("ar-EG")} يوم`}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                محرك SRS
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                مراجعة المصطلحات
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setCardIndex(0);
                setIsRevealed(false);
              }}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              <RotateCcw aria-hidden="true" size={17} />
              إعادة البداية
            </button>
          </div>

          <div className="grid place-items-center py-6">
            <button
              type="button"
              onClick={() => setIsRevealed((value) => !value)}
              className="min-h-[360px] w-full max-w-[760px] rounded-lg border border-slate-200 bg-[#fffdf8] px-10 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-colors hover:border-amber-300"
            >
              <p className="text-sm font-semibold text-slate-500">
                {isRevealed ? "الإجابة" : "الوجه الأمامي"}
              </p>
              <div className="mt-8">
                {isRevealed ? (
                  <div>
                    <p className="text-4xl font-semibold leading-relaxed text-slate-950">
                      {activeTerm.translation}
                    </p>
                    <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600">
                      {activeTerm.definition}
                    </p>
                  </div>
                ) : (
                  <div className="ltr-content">
                    <p className="text-5xl font-semibold leading-tight text-slate-950">
                      {activeTerm.term}
                    </p>
                    <p className="mt-6 text-base text-slate-500">
                      اضغط لإظهار المعنى العربي
                    </p>
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="mx-auto grid max-w-[760px] grid-cols-4 gap-3">
            {[
              ["again", "مرة أخرى", "bg-rose-50 text-rose-800 border-rose-200"],
              ["hard", "صعب", "bg-amber-50 text-amber-900 border-amber-200"],
              ["good", "جيد", "bg-amber-50 text-amber-800 border-amber-200"],
              ["easy", "سهل", "bg-emerald-50 text-emerald-800 border-emerald-200"],
            ].map(([quality, label, className]) => (
              <button
                key={quality}
                type="button"
                disabled={!isRevealed}
                onClick={() => gradeCard(quality as Parameters<typeof gradeCard>[0])}
                className={cx(
                  "rounded-md border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  className,
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mx-auto mt-5 flex max-w-[760px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Sparkles aria-hidden="true" size={17} />
            يحسب المحرك فاصلا بسيطا للمراجعة حسب تقييمك، ويمكن لاحقا حفظ هذه
            الحالة في Supabase لكل مستخدم.
          </p>
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

function nextReviewState(
  current: ReviewState,
  quality: "again" | "hard" | "good" | "easy",
): ReviewState {
  if (quality === "again") {
    return {
      interval: 0,
      ease: Math.max(1.3, current.ease - 0.25),
      dueInDays: 0,
      repetitions: 0,
    };
  }

  const easeChange = quality === "hard" ? -0.1 : quality === "easy" ? 0.2 : 0;
  const ease = Math.max(1.3, current.ease + easeChange);
  const baseInterval =
    current.repetitions === 0
      ? quality === "hard"
        ? 1
        : quality === "easy"
          ? 4
          : 2
      : Math.ceil(current.interval * ease * (quality === "hard" ? 0.65 : 1));

  return {
    interval: baseInterval,
    ease,
    dueInDays: baseInterval,
    repetitions: current.repetitions + 1,
  };
}
