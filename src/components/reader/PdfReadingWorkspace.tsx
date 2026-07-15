"use client";

import { useMemo, useState, useEffect, useRef, useCallback, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, PanelRight, ZoomIn, ZoomOut, Bookmark, BookmarkCheck } from "lucide-react";
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
  const router = useRouter();
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [selectedAssistItem, setSelectedAssistItem] = useState<AssistPanelItem | undefined>(undefined);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Track the currently highlighted sentence ID to avoid redundant DOM queries
  const activeSentenceIdRef = useRef<string | null>(null);

  const pdfColumnRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(900);

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);

  const selectedUnit = useMemo(() => {
    return STUDY_UNITS.find((u) => `SU${u.id}` === chapterId) ?? STUDY_UNITS[0];
  }, [chapterId]);

  // Reset and load bookmark on chapter change
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('pdfBookmarks') || '{}');
    if (bookmarks[chapterId]) {
      setActivePageNumber(bookmarks[chapterId]);
      setBookmarkedPage(bookmarks[chapterId]);
    } else {
      setActivePageNumber(1);
      setBookmarkedPage(null);
    }
    setSelectedAssistItem(undefined);
    activeSentenceIdRef.current = null;
    setZoomLevel(1.0);
  }, [chapterId]);

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

  // ResizeObserver for dynamic page width
  useEffect(() => {
    if (!pdfColumnRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setPageWidth(Math.floor(entry.contentRect.width) - 48);
        }
      }
    });
    observer.observe(pdfColumnRef.current);
    return () => observer.disconnect();
  }, [isPanelOpen]);

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
    if (nextPage >= 1 && nextPage <= numPages) {
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
    <div className="flex h-screen w-full overflow-hidden bg-[#F9F6F0]" dir="ltr">

      {/* LEFT COLUMN: PDF Viewer — scrolls independently */}
      <div
        ref={pdfColumnRef}
        className="flex-1 h-full overflow-y-auto relative pb-20"
      >
        {/* Sticky Header Bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-3"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <FileText aria-hidden="true" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                عارض PDF الهجين الذكي
              </p>
              <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                {selectedUnit.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/study/reader")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm text-xs font-semibold"
            >
              <ArrowLeft size={14} />
              <span>العودة للوحدات</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              title={isPanelOpen ? "إخفاء لوحة المساعدة" : "إظهار لوحة المساعدة"}
            >
              <PanelRight size={15} />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Zoom Controls */}
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2.0))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              title="تكبير"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              title="تصغير"
            >
              <ZoomOut size={15} />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Bookmark Control */}
            <button
              type="button"
              onClick={toggleBookmark}
              className={cx(
                "flex size-8 items-center justify-center rounded-lg border transition-all shadow-sm",
                bookmarkedPage === activePageNumber 
                  ? "border-emerald-300 bg-emerald-50 text-emerald-600" 
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
              title={bookmarkedPage === activePageNumber ? "إلغاء العلامة المرجعية" : "حفظ هذه الصفحة كعلامة مرجعية"}
            >
              {bookmarkedPage === activePageNumber ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            <button
              type="button"
              onClick={() => goToAdjacentPage(-1)}
              disabled={activePageNumber === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
              aria-label="الصفحة السابقة"
            >
              <ChevronLeft aria-hidden="true" size={15} />
            </button>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm text-xs font-semibold text-slate-800">
              صفحة 
              <input 
                type="number"
                min={1}
                max={numPages}
                defaultValue={activePageNumber}
                key={activePageNumber}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    let val = parseInt((e.target as HTMLInputElement).value);
                    if (!isNaN(val) && val >= 1 && val <= numPages) {
                      setActivePageNumber(val);
                      setSelectedAssistItem(undefined);
                      activeSentenceIdRef.current = null;
                    }
                  }
                }}
                onBlur={(e) => {
                   let val = parseInt(e.target.value);
                   if (!isNaN(val) && val >= 1 && val <= numPages) {
                      setActivePageNumber(val);
                   }
                   e.target.value = activePageNumber.toString();
                }}
                className="w-12 mx-1.5 text-center bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              من {numPages.toLocaleString("ar-EG")}
            </div>
            <button
              type="button"
              onClick={() => goToAdjacentPage(1)}
              disabled={activePageNumber === numPages}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
              aria-label="الصفحة التالية"
            >
              <ChevronRight aria-hidden="true" size={15} />
            </button>
          </div>
        </div>

        {/* PDF Render Area */}
        <div
          className="p-6 flex justify-center select-text relative"
          dir="ltr"
          onMouseMove={handleTextLayerMouseMove}
          onMouseLeave={handleTextLayerMouseLeave}
        >
          <div className="shadow-[0_20px_60px_rgba(15,23,42,0.12)] rounded overflow-hidden bg-white">
            <Document
              key={selectedUnit.fileName}
              file={`/material/${selectedUnit.fileName}`}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="p-16 text-center text-slate-500">
                  جاري تحميل الفصل...
                </div>
              }
            >
              <Page
                pageNumber={activePageNumber}
                width={pageWidth}
                scale={zoomLevel}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                onRenderSuccess={handlePageRenderSuccess}
              />
            </Document>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Assist Panel — rigid, locked, no scroll needed */}
      {isPanelOpen && (
        <aside
          className="w-[400px] h-full flex flex-col shrink-0 bg-white border-l border-slate-200 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10"
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
