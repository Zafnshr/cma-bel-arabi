"use client";

import { useMemo, useState, useEffect, useRef, useCallback, MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, PanelRight, ZoomIn, ZoomOut, Bookmark, BookmarkCheck, Minus, Plus } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { LearningAssistPanel, type AssistPanelItem } from "@/components/learning/LearningAssistPanel";
import type { ContentSource, ReadingPage, Term } from "@/lib/content/types";
import { cx } from "@/lib/utils";

// Setup pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────────────────────────
// CORE: Normalization function for character-to-span mapping.
// Strips ALL spaces, punctuation, newlines. Keeps only a-z and 0-9.
// MUST be identical for both page text and database sentences.
// ─────────────────────────────────────────────────────────────────
function normalizeForMapping(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

type StaticSentence = {
  english: string;
  arabic: string;
  keywords: string;
};

type PdfReadingWorkspaceProps = {
  pages: ReadingPage[];
  terms: Term[];
  source: ContentSource;
  structuredPages: any[];
  chapterId: string;
  chapterSentences?: StaticSentence[];
};

const STUDY_UNITS = [
  { id: 1, title: "الوحدة 1: البيانات المالية الخارجية (SU 1)", fileName: "SU1.dat" },
  { id: 2, title: "الوحدة 2: أدوات التخطيط وإعداد الموازنات (SU 2)", fileName: "SU2.dat" },
  { id: 3, title: "الوحدة 3: إعداد الموازنة التشغيلية (SU 3)", fileName: "SU3.dat" },
  { id: 4, title: "الوحدة 4: الموازنة الرأسمالية والتحليل (SU 4)", fileName: "SU4.dat" },
  { id: 5, title: "الوحدة 5: إدارة التكاليف وقياس الأداء (SU 5)", fileName: "SU5.dat" },
  { id: 6, title: "الوحدة 6: الرقابة الداخلية وإدارة المخاطر (SU 6)", fileName: "SU6.dat" },
  { id: 7, title: "الوحدة 7: مفاهيم إدارة التكاليف (SU 7)", fileName: "SU7.dat" },
  { id: 8, title: "الوحدة 8: المحاسبة الإدارية والتحليل (SU 8)", fileName: "SU8.dat" },
  { id: 9, title: "الوحدة 9: تخصيص التكاليف (SU 9)", fileName: "SU9.dat" },
  { id: 10, title: "الوحدة 10: سلسلة التوريد والعمليات (SU 10)", fileName: "SU10.dat" },
  { id: 11, title: "الوحدة 11: إدارة المخاطر المؤسسية (SU 11)", fileName: "SU11.dat" },
  { id: 12, title: "الوحدة 12: حوكمة الشركات وأخلاقيات المهنة (SU 12)", fileName: "SU12.dat" },
  { id: 13, title: "الوحدة 13: قياس الأداء المالي (SU 13)", fileName: "SU13.dat" },
  { id: 14, title: "الوحدة 14: التنبؤ وإدارة الإيرادات (SU 14)", fileName: "SU14.dat" },
  { id: 15, title: "الوحدة 15: تحليل الانحرافات (SU 15)", fileName: "SU15.dat" },
  { id: 16, title: "الوحدة 16: أدوات إدارة الجودة والتحسين (SU 16)", fileName: "SU16.dat" },
  { id: 17, title: "الوحدة 17: أنظمة الرقابة الداخلية (SU 17)", fileName: "SU17.dat" },
  { id: 18, title: "الوحدة 18: تدقيق نظم المعلومات والتقنيات (SU 18)", fileName: "SU18.dat" },
  { id: 19, title: "الوحدة 19: أخلاقيات المحاسب الإداري (SU 19)", fileName: "SU19.dat" },
  { id: 20, title: "الوحدة 20: تحليل القوائم المالية (SU 20)", fileName: "SU20.dat" },
];

// ─────────────────────────────────────────────────────────────────
// THE CHARACTER-TO-SPAN MAPPING ALGORITHM
// Runs ONCE per page render. Tags DOM spans with data-exact-sentence-id.
// ─────────────────────────────────────────────────────────────────
function mapSentencesToSpans(
  container: HTMLElement,
  sentences: StaticSentence[]
): void {
  const spans = Array.from(
    container.querySelectorAll(".react-pdf__Page__textContent span")
  ) as HTMLElement[];

  if (spans.length === 0) return;

  // Clear all previous mappings
  for (const span of spans) {
    span.removeAttribute("data-exact-sentence-id");
  }

  // ── STEP 1: Build normalizedPageText + spanIndexMap ──
  // normalizedPageText: a single massive lowercase alphanumeric string
  // spanIndexMap[i]: the DOM span element that owns character i
  let normalizedPageText = "";
  const spanIndexMap: HTMLElement[] = [];

  for (const span of spans) {
    const rawText = span.textContent || "";
    const normChars = normalizeForMapping(rawText);
    for (let c = 0; c < normChars.length; c++) {
      normalizedPageText += normChars[c];
      spanIndexMap.push(span);
    }
  }

  if (normalizedPageText.length === 0) return;

  // ── STEP 2 & 3: Locate database sentences and inject attributes ──
  // Sort by normalized length DESCENDING so longer (more specific) sentences
  // get priority and claim characters first, preventing overlap conflicts.
  const indexed = sentences
    .map((s, i) => ({
      originalIndex: i,
      norm: normalizeForMapping(s.english),
    }))
    .filter((s) => s.norm.length >= 5) // Skip tiny fragments
    .sort((a, b) => b.norm.length - a.norm.length);

  // Track claimed character positions to prevent overlapping tags
  const claimed = new Set<number>();

  for (const entry of indexed) {
    const sentenceId = `s_${entry.originalIndex}`;
    let searchFrom = 0;

    // Try to find this sentence in the page text
    while (searchFrom < normalizedPageText.length) {
      const startIdx = normalizedPageText.indexOf(entry.norm, searchFrom);
      if (startIdx === -1) break;

      const endIdx = startIdx + entry.norm.length - 1;

      // Check for conflicts with already-claimed characters
      let hasConflict = false;
      for (let i = startIdx; i <= endIdx; i++) {
        if (claimed.has(i)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // Claim the character range
        for (let i = startIdx; i <= endIdx; i++) {
          claimed.add(i);
        }

        // Collect unique spans that cover this range
        const uniqueSpans = new Set<HTMLElement>();
        for (let i = startIdx; i <= endIdx; i++) {
          uniqueSpans.add(spanIndexMap[i]);
        }

        // Inject the exact data attribute
        for (const span of uniqueSpans) {
          span.setAttribute("data-exact-sentence-id", sentenceId);
        }

        break; // Only match the first (best) occurrence per sentence
      }

      // If conflicted, try the next occurrence
      searchFrom = startIdx + 1;
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Polls for text layer spans after page render, then runs mapping.
// react-pdf renders the text layer asynchronously after the canvas.
// ─────────────────────────────────────────────────────────────────
function waitForTextLayerAndMap(
  container: HTMLElement,
  sentences: StaticSentence[],
  maxAttempts = 30
): void {
  let attempts = 0;

  function check() {
    const spans = container.querySelectorAll(
      ".react-pdf__Page__textContent span"
    );
    if (spans.length > 3) {
      mapSentencesToSpans(container, sentences);
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(check, 120);
    }
  }

  // Initial delay to let react-pdf mount the text layer
  setTimeout(check, 250);
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function PdfReadingWorkspace({
  terms,
  source,
  chapterId,
  chapterSentences = [],
}: PdfReadingWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [numPages, setNumPages] = useState<number>(1);

  const minPage = searchParams.get("start") ? parseInt(searchParams.get("start")!, 10) : 1;
  const maxPage = searchParams.get("end") ? parseInt(searchParams.get("end")!, 10) : numPages;

  const [activePageNumber, setActivePageNumber] = useState(minPage);
  const [selectedAssistItem, setSelectedAssistItem] = useState<AssistPanelItem | undefined>(undefined);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Track the currently highlighted sentence ID to avoid redundant DOM queries
  const activeSentenceIdRef = useRef<string | null>(null);

  const pdfColumnRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);

  const selectedUnit = useMemo(() => {
    return STUDY_UNITS.find((u) => `SU${u.id}` === chapterId) ?? STUDY_UNITS[0];
  }, [chapterId]);

  // Reset and load bookmark on chapter change
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('pdfBookmarks') || '{}');
    if (bookmarks[chapterId]) {
      const bPage = bookmarks[chapterId];
      if (bPage >= minPage && bPage <= (maxPage || 9999)) {
        setActivePageNumber(bPage);
        setBookmarkedPage(bPage);
      } else {
        setActivePageNumber(minPage);
        setBookmarkedPage(null);
      }
    } else {
      setActivePageNumber(minPage);
      setBookmarkedPage(null);
    }
    setSelectedAssistItem(undefined);
    activeSentenceIdRef.current = null;
    setZoomLevel(1.0);
  }, [chapterId, minPage, maxPage]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('pdfBookmarks') || '{}');
    if (bookmarkedPage === activePageNumber) {
      delete bookmarks[chapterId];
      setBookmarkedPage(null);
    } else {
      bookmarks[chapterId] = activePageNumber;
      setBookmarkedPage(activePageNumber);
    }
    localStorage.setItem('pdfBookmarks', JSON.stringify(bookmarks));
  };



  // ── TRIGGER MAPPING after each page render ──
  // Fires after react-pdf's <Page> canvas renders, then waits for text layer spans.
  const handlePageRenderSuccess = useCallback(() => {
    const container = pdfColumnRef.current;
    if (!container || chapterSentences.length === 0) return;
    waitForTextLayerAndMap(container, chapterSentences);
  }, [chapterSentences]);

  // Default assist item (first sentence)
  const defaultAssistItem: AssistPanelItem | undefined = useMemo(() => {
    const first = chapterSentences[0];
    if (!first) return undefined;
    return {
      kind: "full_sentence",
      payload: {
        englishSentence: first.english,
        arabicSentenceTranslation: first.arabic,
        keywords: first.keywords,
      },
    };
  }, [chapterSentences]);

  const assistItem = selectedAssistItem ?? defaultAssistItem;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function goToAdjacentPage(direction: -1 | 1) {
    const nextPage = activePageNumber + direction;
    if (nextPage >= minPage && nextPage <= maxPage) {
      setActivePageNumber(nextPage);
      setSelectedAssistItem(undefined);
      activeSentenceIdRef.current = null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ZERO-GUESSWORK HOVER: Simply reads pre-injected data attributes.
  // ─────────────────────────────────────────────────────────────
  function handleTextLayerMouseMove(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() !== "span") return;

    const sentenceId = target.getAttribute("data-exact-sentence-id");
    if (!sentenceId) return; // Not a tagged span — do nothing, keep panel sticky

    // Already highlighting this sentence — skip redundant work
    if (activeSentenceIdRef.current === sentenceId) return;
    activeSentenceIdRef.current = sentenceId;

    const container = pdfColumnRef.current;
    if (!container) return;

    // 1. Remove previous highlights
    container.querySelectorAll(".highlighted-sentence").forEach((el) => {
      el.classList.remove("highlighted-sentence", "bg-amber-200/50", "cursor-pointer");
    });

    // 2. Highlight ALL spans with this exact sentence ID
    const matchedSpans = container.querySelectorAll(
      `span[data-exact-sentence-id="${sentenceId}"]`
    );
    matchedSpans.forEach((span) => {
      span.classList.add("highlighted-sentence", "bg-amber-200/50", "cursor-pointer");
    });

    // 3. Extract the sentence index and dispatch to panel
    const sIdx = parseInt(sentenceId.replace("s_", ""), 10);
    const matched = chapterSentences[sIdx];
    if (matched) {
      setSelectedAssistItem({
        kind: "full_sentence",
        payload: {
          englishSentence: matched.english,
          arabicSentenceTranslation: matched.arabic,
          keywords: matched.keywords,
        },
      });
    }
  }

  function handleTextLayerMouseLeave() {
    activeSentenceIdRef.current = null;
    const container = pdfColumnRef.current;
    if (container) {
      container.querySelectorAll(".highlighted-sentence").forEach((el) => {
        el.classList.remove("highlighted-sentence", "bg-amber-200/50", "cursor-pointer");
      });
    }
    // Panel stays sticky — do NOT clear selectedAssistItem
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[600px] w-full overflow-hidden bg-[#F9F6F0] dark:bg-[#0A0A0A] rounded-2xl md:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] ring-4 ring-white/50 dark:ring-slate-900/50" dir="ltr">

      {/* LEFT COLUMN: PDF Viewer — scrolls independently */}
      <div className="flex-1 h-full relative flex flex-col min-w-0 bg-transparent">
        
        {/* Floating Back Button */}
        <div className="absolute top-4 right-4 z-20" dir="rtl">
          <button
            type="button"
            onClick={() => router.push("/study/curriculum")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm text-slate-600 hover:text-slate-900 transition-all font-semibold"
          >
            <ArrowLeft size={18} />
            <span>العودة</span>
          </button>
        </div>

        {/* 3. THE FLOATING NAVIGATION OVERLAY */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 z-20" dir="ltr">
          <button onClick={() => goToAdjacentPage(-1)} disabled={activePageNumber <= minPage} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-50 text-slate-700 dark:text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 px-4 border-x border-slate-200 dark:border-slate-600">
            <button onClick={() => setZoomLevel(s => Math.max(0.5, s - 0.25))} className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-400">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={() => setZoomLevel(s => Math.min(3.0, s + 0.25))} className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-400">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button onClick={() => goToAdjacentPage(1)} disabled={activePageNumber >= maxPage} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-50 text-slate-700 dark:text-slate-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 1. THE SCROLL VIEWPORT */}
        <div
          ref={pdfColumnRef}
          className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0A0A0A] p-4 relative flex justify-center items-start"
          dir="ltr"
          onMouseMove={handleTextLayerMouseMove}
          onMouseLeave={handleTextLayerMouseLeave}
        >
          {/* Elegant Dot Pattern Background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-40" />
          
          {/* 2. THE ISOLATED CANVAS WRAPPER */}
          {/* We must use z-0 or isolate so the -z-10 child doesn't go behind the scrolling container's background */}
          <div className="inline-block relative transition-transform duration-200 mt-8 md:mt-12 mb-24 max-w-full z-10">
            {/* Decorative Outer Frame */}
            <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.3)] -m-3 md:-m-4 -z-10 pointer-events-none" />
            
            {/* Inner Content Container */}
            <div className="rounded-xl overflow-hidden border-4 border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-inner">
            <Document
              key={selectedUnit.fileName}
              file={`/material/${selectedUnit.fileName}`}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-20 text-center text-slate-500">جاري تحميل المستند...</div>}
            >
              <Page
                pageNumber={activePageNumber}
                scale={zoomLevel} /* MUST BE NATIVE PROP, NOT CSS */
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="max-w-none" /* CRITICAL: Prevents Tailwind from squishing the canvas */
                onRenderSuccess={handlePageRenderSuccess}
              />
            </Document>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Assist Panel — rigid, locked, no scroll needed */}
      {isPanelOpen && (
        <aside
          className="w-[400px] h-full flex flex-col shrink-0 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[-10px_0_20px_rgba(0,0,0,0.3)] z-10"
          dir="rtl"
        >
          <LearningAssistPanel
            item={assistItem}
            totalTerms={terms.length}
            source={source}
          />
        </aside>
      )}
    </div>
  );
}
