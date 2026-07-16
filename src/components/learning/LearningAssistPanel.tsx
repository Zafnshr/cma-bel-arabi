"use client";

import { Languages, PanelRight, Sparkles, BookOpen } from "lucide-react";
import type { ContentSource, ReadingSentence, Term } from "@/lib/content/types";

export type StructuredSentenceKeyword = {
  en: string;
  ar: string;
};

export type StructuredSentence = {
  sentence_id: string;
  english_text: string;
  arabic_text: string;
  keywords: StructuredSentenceKeyword[];
};

export type FullSentencePayload = {
  englishSentence: string;
  arabicSentenceTranslation: string;
  keywords: string;
};

export type AssistPanelItem =
  | {
      kind: "sentence";
      sentence: ReadingSentence;
      terms: Term[];
    }
  | {
      kind: "term";
      term: Term;
    }
  | {
      kind: "structured_sentence";
      sentence: StructuredSentence;
    }
  | {
      kind: "full_sentence";
      payload: FullSentencePayload;
    };

type LearningAssistPanelProps = {
  item?: AssistPanelItem;
  totalTerms: number;
  source: ContentSource;
};

/** Parse "English Term - Arabic Term, Another - ترجمة" into structured pairs */
function parseKeywordPairs(raw: string): { en: string; ar: string }[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map((pair) => {
      const parts = pair.split(" - ");
      if (parts.length >= 2) {
        return { en: parts[0].trim(), ar: parts.slice(1).join(" - ").trim() };
      }
      return null;
    })
    .filter(Boolean) as { en: string; ar: string }[];
}

export function LearningAssistPanel({
  item,
  totalTerms,
  source,
}: LearningAssistPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header — compact */}
      <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md">
            <Languages aria-hidden="true" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/80">
              لوحة المساعدة
            </p>
            <h2 className="text-base font-bold">الترجمة والسياق</h2>
          </div>
        </div>
      </div>

      {/* Content — uses exact user-specified classes */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {item?.kind === "full_sentence" ? (
          <FullSentencePanel payload={item.payload} />
        ) : item?.kind === "sentence" ? (
          <SentencePanel sentence={item.sentence} terms={item.terms} />
        ) : item?.kind === "structured_sentence" ? (
          <StructuredSentencePanel sentence={item.sentence} />
        ) : item?.kind === "term" ? (
          <TermPanel term={item.term} />
        ) : (
          <EmptyPanel />
        )}
      </div>

      {/* Footer — compact */}
      {source.warning && (
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-2.5 text-[11px] leading-5 text-slate-400 dark:text-slate-500">
          <p className="font-medium text-amber-700 dark:text-amber-500 text-[11px]">{source.warning}</p>
        </div>
      )}
    </div>
  );
}

/* ─── FULL SENTENCE PANEL (PRIMARY) ─── */
function FullSentencePanel({ payload }: { payload: FullSentencePayload }) {
  const keywordPairs = parseKeywordPairs(payload.keywords);

  return (
    <div className="flex flex-col h-full p-6 justify-start gap-6">
      {/* English Text — muted, italic, compact */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">
          الجملة الإنجليزية النشطة
        </p>
        <p dir="ltr" className="text-sm text-slate-500 dark:text-slate-400 font-medium italic border-b border-slate-100 dark:border-slate-800/50 pb-4 leading-relaxed">
          {payload.englishSentence}
        </p>
      </div>

      {/* Arabic Translation — scaled down, bold */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">
          الترجمة العربية الكاملة
        </p>
        <h2 dir="rtl" className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-bold leading-loose">
          {payload.arabicSentenceTranslation}
        </h2>
      </div>

      {/* Keyword Badges — pinned to bottom */}
      {keywordPairs.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <p className="w-full text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-1">
            <BookOpen className="inline-block ml-1 mb-0.5" size={11} />
            المصطلحات الرئيسية
          </p>
          {keywordPairs.map((kw, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/30 rounded-md px-3 py-1.5 shadow-sm"
            >
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{kw.ar}</span>
              <span className="text-xs font-medium text-amber-700/80 dark:text-amber-500/80">{kw.en}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SENTENCE PANEL (LEGACY) ─── */
function SentencePanel({
  sentence,
  terms,
}: {
  sentence: ReadingSentence;
  terms: Term[];
}) {
  return (
    <div className="flex flex-col h-full p-6 justify-start gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">الجملة النشطة</p>
        <p dir="ltr" className="text-sm text-slate-500 dark:text-slate-400 font-medium italic border-b border-slate-100 dark:border-slate-800/50 pb-4 leading-relaxed">
          {sentence.text}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">الترجمة العربية</p>
        <h2 dir="rtl" className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-bold leading-loose">
          {sentence.translation}
        </h2>
      </div>
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {terms.map((term) => (
            <div key={term.id} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/30 rounded-md px-3 py-1.5 shadow-sm">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{term.translation}</span>
              <span className="text-xs font-medium text-amber-700/80 dark:text-amber-500/80">{term.term}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── TERM PANEL ─── */
function TermPanel({ term }: { term: Term }) {
  return (
    <div className="flex flex-col h-full p-6 justify-start gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">المصطلح النشط</p>
        <p dir="ltr" className="text-sm text-slate-500 dark:text-slate-400 font-medium italic border-b border-slate-100 dark:border-slate-800/50 pb-4 leading-relaxed">
          {term.term}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">الترجمة العربية</p>
        <h2 dir="rtl" className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-bold leading-loose">
          {term.translation}
        </h2>
      </div>
      {term.definition && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">تعريف مختصر</p>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{term.definition}</p>
        </div>
      )}
    </div>
  );
}

/* ─── STRUCTURED SENTENCE PANEL ─── */
function StructuredSentencePanel({ sentence }: { sentence: StructuredSentence }) {
  return (
    <div className="flex flex-col h-full p-6 justify-start gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">الجملة النشطة</p>
        <p dir="ltr" className="text-sm text-slate-500 dark:text-slate-400 font-medium italic border-b border-slate-100 dark:border-slate-800/50 pb-4 leading-relaxed">
          {sentence.english_text}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-500/80 mb-2">الترجمة العربية</p>
        <h2 dir="rtl" className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-bold leading-loose">
          {sentence.arabic_text}
        </h2>
      </div>
      {sentence.keywords && sentence.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {sentence.keywords.map((kw, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/30 rounded-md px-3 py-1.5 shadow-sm">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{kw.ar}</span>
              <span className="text-xs font-medium text-amber-700/80 dark:text-amber-500/80">{kw.en}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── EMPTY STATE ─── */
function EmptyPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/50 mb-4">
        <PanelRight className="text-slate-400 dark:text-slate-500" size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">المساعدة السياقية جاهزة</h3>
      <p className="mt-2 max-w-[240px] text-xs leading-5 text-slate-400 dark:text-slate-500">
        مرّر الماوس فوق أي جملة في النص الإنجليزي لتظهر الترجمة الفورية والمصطلحات.
      </p>
      <Sparkles className="mt-4 text-amber-400 animate-pulse" size={18} />
    </div>
  );
}
