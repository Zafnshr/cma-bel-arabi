"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOpenText,
  ClipboardCheck,
  Gauge,
  Layers3,
  LayoutDashboard,
  Map,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { cx } from "@/lib/utils";
import { GlobalWisdomWidget } from "./GlobalWisdomWidget";

type AppShellProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    href: "/dashboard",
    label: "لوحة التعلم",
    description: "التقدم والمهام",
    icon: LayoutDashboard,
  },
  {
    href: "/study/curriculum",
    label: "منهج بيكر",
    description: "الوحدات الدراسية",
    icon: Map,
  },
  {
    href: "/study/reader",
    label: "كتاب جلايم",
    description: "Gleim Book",
    icon: BookOpenText,
  },
  {
    href: "/study/flashcards",
    label: "بطاقات المراجعة",
    description: "تكرار متباعد",
    icon: Layers3,
  },
  {
    href: "/simulator",
    label: "محاكي الأسئلة",
    description: "تدريب واختبارات",
    icon: ClipboardCheck,
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="h-screen bg-background text-foreground [direction:rtl] transition-colors duration-300 relative overflow-hidden z-0">
      {/* GLOBAL DYNAMIC BACKGROUND - 100x Faster Performance using Radial Gradients instead of CSS Blur */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full animate-blob bg-[radial-gradient(circle,_rgba(52,211,153,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(5,150,105,0.2)_0%,_transparent_70%)]" />
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full animate-blob animation-delay-2000 bg-[radial-gradient(circle,_rgba(45,212,191,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(13,148,136,0.2)_0%,_transparent_70%)]" />
        <div className="fixed bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full animate-blob animation-delay-4000 bg-[radial-gradient(circle,_rgba(56,189,248,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(2,132,199,0.2)_0%,_transparent_70%)]" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full animate-blob animation-delay-6000 bg-[radial-gradient(circle,_rgba(129,140,248,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(79,70,229,0.2)_0%,_transparent_70%)]" />
      </div>

      <GlobalWisdomWidget />
      <div 
        className={cx(
          "mx-auto grid h-screen max-w-[1720px] gap-0 transition-all duration-300 relative z-10",
          isSidebarCollapsed 
            ? "grid-cols-[80px_minmax(0,1fr)]" 
            : "grid-cols-[280px_minmax(0,1fr)]"
        )}
      >
        {/* Global Nav Sidebar */}
        <aside 
          className={cx(
            "sticky top-0 h-screen border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col relative",
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

          <nav aria-label="التنقل الرئيسي" className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border py-3 transition-all",
                    isSidebarCollapsed ? "justify-center px-0" : "px-3",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                    isActive
                      ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-slate-950 dark:text-amber-100"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white",
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" size={20} className="shrink-0" />
                  {!isSidebarCollapsed && (
                    <span>
                      <span className="block text-sm font-bold">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 font-sans">
                        {item.description}
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
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
                      : cx("top-1 bottom-1 w-[calc(50%-4px)]", theme === "dark" ? "left-1" : "right-1")
                  )}
                />
                
                <button
                  onClick={() => setTheme("light")}
                  className={cx(
                    "relative z-10 flex items-center justify-center transition-colors duration-300",
                    isSidebarCollapsed ? "h-11 w-full" : "h-10 w-1/2",
                    theme === "light" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع النهاري"
                >
                  <div className="flex items-center gap-2 justify-center w-full">
                    <Sun size={18} className={cx("transition-transform duration-500 shrink-0", theme === "light" && "rotate-90 scale-110")} />
                    {!isSidebarCollapsed && <span className="text-xs font-bold font-sans w-8 text-right">فاتح</span>}
                  </div>
                </button>
                
                <button
                  onClick={() => setTheme("dark")}
                  className={cx(
                    "relative z-10 flex items-center justify-center transition-colors duration-300",
                    isSidebarCollapsed ? "h-11 w-full mt-1" : "h-10 w-1/2",
                    theme === "dark" ? "text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع الليلي"
                >
                  <div className="flex items-center gap-2 justify-center w-full">
                    <Moon size={18} className={cx("transition-transform duration-500 shrink-0", theme === "dark" && "-rotate-12 scale-110")} />
                    {!isSidebarCollapsed && <span className="text-xs font-bold font-sans w-8 text-right">داكن</span>}
                  </div>
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 px-8 py-7 h-screen overflow-y-auto custom-scrollbar relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
}
