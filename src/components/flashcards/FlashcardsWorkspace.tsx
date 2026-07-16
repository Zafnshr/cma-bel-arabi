"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Sparkles, ArrowRight, BookOpen, Layers } from "lucide-react";
import type { ContentSource, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";
import { FLASHCARD_INDEX } from "@/config/flashcardIndex";
import { COURSE_MAP } from "@/config/courseMap";

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
  const searchParams = useSearchParams();
  const unitParam = searchParams.get("unit");
  const moduleParam = searchParams.get("module");

  const [activeUnitIndex, setActiveUnitIndex] = useState(0);

  const deck = useMemo(() => {
    if (unitParam && moduleParam) {
      const key = `U${unitParam}-${moduleParam}`;
      const requiredTerms = FLASHCARD_INDEX[key];
      if (requiredTerms) {
        return terms.filter((card) => requiredTerms.includes(card.term));
      }
      return [];
    }
    return terms;
  }, [terms, unitParam, moduleParam]);

  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const activeTerm = deck[cardIndex];
  const reviewState = activeTerm
    ? states[activeTerm.id] ?? starterState
    : starterState;

  const gradeCard = useCallback((quality: "again" | "hard" | "good" | "easy") => {
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
    
    // Give animation time to flip back before changing content
    setTimeout(() => {
      setCardIndex((current) => (current + 1) % deck.length);
    }, 150);
  }, [activeTerm, deck.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
      }
      if (isRevealed) {
        if (e.key === "1") gradeCard("again");
        if (e.key === "2") gradeCard("hard");
        if (e.key === "3") gradeCard("good");
        if (e.key === "4") gradeCard("easy");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, gradeCard]);

  // --- HUB VIEW ---
  if (!unitParam || !moduleParam) {
    const activeUnit = COURSE_MAP[activeUnitIndex];
    
    return (
      <div className="max-w-6xl mx-auto w-full [direction:rtl]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Layers className="text-amber-500" size={32} />
            الوحدات الدراسية
          </h2>
          <p className="text-slate-500 mt-2 text-lg">اختر الوحدة لبدء المراجعة باستخدام البطاقات التعليمية الذكية.</p>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
          {COURSE_MAP.map((unit, idx) => {
            const unitNum = unit.beckerUnit.match(/Unit (\d+)/)?.[1] || (idx + 1).toString();
            return (
              <button
                key={idx}
                onClick={() => setActiveUnitIndex(idx)}
                className={cx(
                  "px-5 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap border-b-2",
                  activeUnitIndex === idx
                    ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                الوحدة {unitNum}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUnit.modules.map(mod => {
            const unitNum = activeUnit.beckerUnit.match(/Unit (\d+)/)?.[1] || (activeUnitIndex + 1).toString();
            return (
              <div key={mod.moduleId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-amber-300 dark:hover:border-amber-700 transition-colors shadow-sm">
                <div className="mb-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md text-xs font-mono font-bold">
                      {mod.moduleId}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{mod.arabicTitle}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-sans ltr-content text-left">{mod.title}</p>
                </div>
                
                <Link
                  href={`/study/flashcards?unit=${unitNum}&module=${mod.moduleId}`}
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <BookOpen size={18} />
                  ابدأ المراجعة
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- SESSION VIEW ---
  const currentUnitConfig = COURSE_MAP.find(u => u.beckerUnit.includes(`Unit ${unitParam}:`));
  const currentModuleConfig = currentUnitConfig?.modules.find(m => m.moduleId === moduleParam);
  const currentTitle = currentModuleConfig ? `${currentModuleConfig.moduleId} - ${currentModuleConfig.arabicTitle}` : `وحدة ${unitParam} / ${moduleParam}`;

  if (deck.length === 0) {
    return (
      <div className="max-w-5xl mx-auto w-full [direction:rtl]">
        <div className="mb-6">
          <Link href="/study/flashcards" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-semibold">
            <ArrowRight size={20} />
            العودة للوحدات
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] p-16 text-center text-slate-600 dark:text-slate-400 shadow-sm flex flex-col items-center justify-center">
          <Layers size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-xl font-bold">لا توجد بطاقات متاحة لهذه الوحدة حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 max-w-5xl mx-auto w-full [direction:rtl]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Link href="/study/flashcards" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-semibold">
          <ArrowRight size={20} />
          العودة للوحدات
        </Link>
        <div className="text-right">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentTitle}
          </h1>
        </div>
      </div>

      <section className="grid min-h-[720px] grid-rows-[auto_minmax(0,1fr)] gap-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="إجمالي البطاقات" value={deck.length.toLocaleString("ar-EG")} />
          <Stat
            label="البطاقة الحالية"
            value={`${(cardIndex + 1).toLocaleString("ar-EG")} / ${deck.length.toLocaleString("ar-EG")}`}
          />
          <Stat
            label="مراجعات اليوم"
            value={Object.keys(states).length.toLocaleString("ar-EG")}
          />
          <Stat
            label="الفاصل الزمني"
            value={`${reviewState.interval.toLocaleString("ar-EG")} يوم`}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-500 font-sans">
                محرك التكرار المتباعد
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                مراجعة المصطلحات
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setCardIndex(0);
                setIsRevealed(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw aria-hidden="true" size={17} />
              إعادة البداية
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6 relative">
            <div className="w-full mx-auto perspective-1000 h-[380px] md:h-[480px]">
              <button
                type="button"
                onClick={() => setIsRevealed((prev) => !prev)}
                className={cx(
                  "relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer focus:outline-none",
                  isRevealed && "rotate-y-180"
                )}
                aria-label={isRevealed ? "البطاقة مقلوبة" : "اضغط لقلب البطاقة"}
              >
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FAFAFA] dark:bg-[#111111] px-6 md:px-12 py-12 md:py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <p className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                    الوجه الأمامي
                  </p>
                  <div className="ltr-content w-full">
                    <p className="text-4xl md:text-6xl font-bold leading-tight text-slate-950 dark:text-white">
                      {activeTerm.term}
                    </p>
                    <p className="mt-8 md:mt-12 text-sm md:text-base font-medium text-amber-600 dark:text-amber-500 flex flex-col md:flex-row items-center justify-center gap-2">
                      <Sparkles size={18} />
                      اضغط أو استخدم <kbd className="font-sans px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/50 ml-1 text-sm">Space</kbd> لإظهار المعنى
                    </p>
                  </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-[#FAFAFA] dark:bg-[#111111] px-6 md:px-12 py-12 md:py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <p className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                    الوجه الخلفي
                  </p>
                  <div className="w-full">
                    <p className="text-3xl md:text-5xl font-bold leading-relaxed text-slate-950 dark:text-white">
                      {activeTerm.translation}
                    </p>
                    <p className="mx-auto mt-6 md:mt-8 max-w-3xl text-lg md:text-xl leading-8 md:leading-9 text-slate-600 dark:text-slate-400">
                      {activeTerm.definition}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mx-auto grid max-w-4xl w-full grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              ["again", "مرة أخرى", "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60", "1"],
              ["hard", "صعب", "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60", "2"],
              ["good", "جيد", "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60", "3"],
              ["easy", "سهل", "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60", "4"],
            ].map(([quality, label, className, key]) => (
              <button
                key={quality}
                type="button"
                disabled={!isRevealed}
                onClick={() => gradeCard(quality as Parameters<typeof gradeCard>[0])}
                className={cx(
                  "rounded-2xl border px-2 py-5 text-xl font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30 relative group",
                  className,
                )}
              >
                {label}
                {isRevealed && (
                  <span className="absolute top-2 right-3 text-xs font-sans opacity-50 group-hover:opacity-100 transition-opacity">
                    {key}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1A1A1A] p-5 shadow-sm">
      <p className="text-3xl font-bold text-slate-950 dark:text-white" style={{ fontFamily: "var(--font-almarai)" }}>{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
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
