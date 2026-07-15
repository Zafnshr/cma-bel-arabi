"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { COURSE_MAP } from "@/config/courseMap";
import {
  BookOpenText,
  ClipboardCheck,
  Gauge,
  Layers3,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { cx } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};



export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("isSidebarCollapsed");
    if (stored !== null) {
      setIsSidebarCollapsed(stored === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("isSidebarCollapsed", String(newState));
  };

  return (
    <div className="min-h-screen bg-background text-foreground [direction:rtl] transition-colors duration-300">
      <div 
        className={cx(
          "mx-auto grid min-h-screen max-w-[1720px] gap-0 transition-all duration-300",
          isSidebarCollapsed 
            ? "grid-cols-[80px_minmax(0,1fr)]" 
            : "grid-cols-[280px_minmax(0,1fr)]"
        )}
      >
        {/* Global Nav Sidebar */}
        <aside 
          className={cx(
            "sticky top-0 h-screen border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col relative",
            isSidebarCollapsed ? "px-3 w-20" : "px-5 w-64"
          )}
        >
          {/* Collapse Toggle Button - floated on the left edge */}
          <button
            onClick={toggleSidebar}
            className="absolute -left-3 top-7 flex size-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 shadow-sm hover:text-slate-900 dark:hover:text-white focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10"
            title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="mb-8">
            <div className={cx("flex items-center gap-3", isSidebarCollapsed && "justify-center")}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                <Gauge aria-hidden="true" size={23} />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500 font-sans">
                    CMA Bel Arabi
                  </p>
                  <h1 className="text-lg font-bold text-slate-950 dark:text-white">
                    منصة التعلم
                  </h1>
                </div>
              )}
            </div>
          </div>

          <nav aria-label="التنقل الرئيسي" className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {/* Core Features */}
            <Link
              href="/dashboard"
              className={cx(
                "flex items-center gap-3 rounded-2xl border py-3 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                isSidebarCollapsed ? "justify-center px-0" : "px-3",
                pathname === "/dashboard"
                  ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-slate-950 dark:text-amber-100"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
              )}
              title={isSidebarCollapsed ? "لوحة التعلم" : undefined}
            >
              <LayoutDashboard aria-hidden="true" size={20} className="shrink-0" />
              {!isSidebarCollapsed && (
                <span>
                  <span className="block text-sm font-bold">لوحة التعلم</span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 font-sans">التقدم والمهام</span>
                </span>
              )}
            </Link>

            <Link
              href="/study/flashcards"
              className={cx(
                "flex items-center gap-3 rounded-2xl border py-3 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                isSidebarCollapsed ? "justify-center px-0" : "px-3",
                pathname.startsWith("/study/flashcards")
                  ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-slate-950 dark:text-amber-100"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
              )}
              title={isSidebarCollapsed ? "بطاقات المراجعة" : undefined}
            >
              <Layers3 aria-hidden="true" size={20} className="shrink-0" />
              {!isSidebarCollapsed && (
                <span>
                  <span className="block text-sm font-bold">بطاقات المراجعة</span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 font-sans">تكرار متباعد</span>
                </span>
              )}
            </Link>

            {/* Course Map Accordion */}
            <div className="pt-6 pb-2">
              <p className={cx("text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-3", isSidebarCollapsed && "text-center")}>
                {!isSidebarCollapsed ? "المنهج الدراسي (Becker)" : "المنهج"}
              </p>
              
              {COURSE_MAP.map((unit, uIdx) => {
                const isExpanded = expandedUnit === unit.beckerUnit;
                return (
                  <div key={unit.beckerUnit} className="mb-2">
                    <button 
                      onClick={() => {
                        setExpandedUnit(isExpanded ? null : unit.beckerUnit);
                        if (isSidebarCollapsed) toggleSidebar();
                      }}
                      className={cx(
                        "flex items-center justify-between w-full rounded-2xl border transition-all py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                        isSidebarCollapsed ? "justify-center px-0" : "px-3",
                        isExpanded 
                          ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-slate-950 dark:text-amber-100" 
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                      title={isSidebarCollapsed ? unit.beckerUnit : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpenText size={20} className={cx("shrink-0", isExpanded ? "text-amber-600 dark:text-amber-400" : "")} />
                        {!isSidebarCollapsed && <span className="text-sm font-bold text-right leading-relaxed">{unit.beckerUnit}</span>}
                      </div>
                      {!isSidebarCollapsed && (
                        <ChevronLeft size={16} className={cx("transition-transform duration-300", isExpanded ? "-rotate-90 text-amber-600 dark:text-amber-400" : "")} />
                      )}
                    </button>
                    
                    {/* Modules - Smooth Collapse */}
                    {!isSidebarCollapsed && (
                      <div 
                        className={cx(
                          "overflow-hidden transition-all duration-300 ease-in-out", 
                          isExpanded ? "max-h-[800px] opacity-100 mt-1" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="flex flex-col gap-1 pr-7 border-r-2 border-slate-100 dark:border-slate-800 mr-5 mt-2 pb-2">
                          {unit.modules.map(mod => (
                            <button
                              key={mod.moduleId} 
                              onClick={() => router.push(`/study/reader?unit=${uIdx + 1}&module=${mod.moduleId}`)}
                              className="text-xs font-semibold text-slate-500 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-400 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block text-right leading-relaxed"
                            >
                              {mod.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <div 
                className={cx(
                  "bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1 relative flex items-center transition-all duration-500",
                  isSidebarCollapsed ? "flex-col w-[52px] mx-auto" : "w-full"
                )}
              >
                {/* Active Slider Background */}
                <div 
                  className={cx(
                    "absolute bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-500 ease-spring",
                    isSidebarCollapsed 
                      ? cx("left-1 right-1 h-10", theme === "dark" ? "translate-y-11" : "translate-y-0")
                      : cx("top-1 bottom-1 w-[calc(50%-4px)]", theme === "dark" ? "translate-x-1 left-1" : "-translate-x-[calc(100%+4px)] right-1")
                  )}
                />
                
                <button
                  onClick={() => setTheme("light")}
                  className={cx(
                    "relative z-10 flex items-center justify-center gap-2 transition-colors duration-300",
                    isSidebarCollapsed ? "h-11 w-full" : "h-10 flex-1",
                    theme === "light" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع النهاري"
                >
                  <Sun size={18} className={cx("transition-transform duration-500", theme === "light" && "rotate-90 scale-110")} />
                  {!isSidebarCollapsed && <span className="text-xs font-bold font-sans">فاتح</span>}
                </button>
                
                <button
                  onClick={() => setTheme("dark")}
                  className={cx(
                    "relative z-10 flex items-center justify-center gap-2 transition-colors duration-300",
                    isSidebarCollapsed ? "h-11 w-full mt-1" : "h-10 flex-1",
                    theme === "dark" ? "text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع الليلي"
                >
                  <Moon size={18} className={cx("transition-transform duration-500", theme === "dark" && "-rotate-12 scale-110")} />
                  {!isSidebarCollapsed && <span className="text-xs font-bold font-sans">داكن</span>}
                </button>
              </div>
            )}

            {!isSidebarCollapsed ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <Settings aria-hidden="true" size={17} />
                  إعدادات الجلسة
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400 font-sans">
                  الواجهة عربية، والمحتوى التعليمي الإنجليزي يبقى باتجاه القراءة الأصلي.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Settings aria-hidden="true" size={19} />
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 px-8 py-7">
          {children}
        </div>
      </div>
    </div>
  );
}
