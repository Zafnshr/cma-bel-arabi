"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
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
  Menu,
  X,
  LogOut,
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
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("isSidebarCollapsed");
    if (stored !== null) {
      setIsSidebarCollapsed(stored === "true");
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("isSidebarCollapsed", String(newState));
  };

  // Do not render AppShell shell structure on the login page
  if (pathname === "/login") {
    return (
      <div className="min-h-screen w-full bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground [direction:rtl] transition-colors duration-300 relative overflow-hidden z-0">
      {/* GLOBAL DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full animate-blob bg-[radial-gradient(circle,_rgba(52,211,153,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(5,150,105,0.2)_0%,_transparent_70%)]" />
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full animate-blob animation-delay-2000 bg-[radial-gradient(circle,_rgba(45,212,191,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(13,148,136,0.2)_0%,_transparent_70%)]" />
        <div className="fixed bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full animate-blob animation-delay-4000 bg-[radial-gradient(circle,_rgba(56,189,248,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(2,132,199,0.2)_0%,_transparent_70%)]" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full animate-blob animation-delay-6000 bg-[radial-gradient(circle,_rgba(129,140,248,0.35)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(79,70,229,0.2)_0%,_transparent_70%)]" />
      </div>

      <GlobalWisdomWidget />
      
      <div 
        className={cx(
          "mx-auto flex flex-col md:grid h-[100dvh] md:h-screen max-w-[1720px] gap-0 transition-all duration-300 relative z-10",
          isSidebarCollapsed 
            ? "md:grid-cols-[80px_minmax(0,1fr)]" 
            : "md:grid-cols-[280px_minmax(0,1fr)]"
        )}
      >
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between px-5 h-16 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              <Gauge aria-hidden="true" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-950 dark:text-white leading-tight">
                CMA Bel Arabi
              </h1>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* MOBILE BACKDROP */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Global Nav Sidebar */}
        <aside 
          className={cx(
            "fixed md:sticky top-0 h-[100dvh] md:h-screen border-l border-slate-200 dark:border-slate-800 bg-white dark:md:bg-[#1A1A1A]/80 dark:bg-slate-900 md:bg-white/80 md:backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col z-50",
            // Desktop state
            isSidebarCollapsed ? "md:w-20 md:px-3" : "md:w-64 md:px-5",
            // Mobile state
            "w-72 px-6 py-6 md:py-6 right-0",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-5 left-5 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={24} />
          </button>

          {/* Collapse Toggle Button - floated on the left edge (desktop only) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -left-3 top-7 size-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 shadow-sm hover:text-slate-900 dark:hover:text-white focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10"
            title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="mb-8 mt-4 md:mt-0">
            <div className={cx("flex items-center gap-3", isSidebarCollapsed ? "md:justify-center" : "")}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                <Gauge aria-hidden="true" size={23} />
              </div>
              <div className={cx(isSidebarCollapsed ? "md:hidden" : "")}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500 font-sans">
                  CMA Bel Arabi
                </p>
                <h1 className="text-lg font-bold text-slate-950 dark:text-white">
                  منصة التعلم
                </h1>
              </div>
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
                    "px-3", // Base mobile (expanded)
                    isSidebarCollapsed && "md:justify-center md:px-0", // Desktop collapsed
                    "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                    isActive
                      ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-slate-950 dark:text-amber-100"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white",
                  )}
                  title={item.label}
                >
                  <Icon aria-hidden="true" size={20} className="shrink-0" />
                  <span className={cx(isSidebarCollapsed && "md:hidden")}>
                    <span className="block text-sm font-bold">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 font-sans">
                      {item.description}
                    </span>
                  </span>
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
                  "w-full", // Mobile
                  isSidebarCollapsed && "md:flex-col md:w-[52px] md:mx-auto" // Desktop
                )}
              >
                {/* Active Slider Background */}
                <div 
                  className={cx(
                    "absolute bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-500 ease-spring",
                    // Base (mobile) always acts expanded:
                    "top-1 bottom-1 w-[calc(50%-4px)]",
                    theme === "dark" ? "left-1" : "right-1",
                    // Desktop collapsed overrides:
                    isSidebarCollapsed && "md:top-auto md:bottom-auto md:w-auto md:left-1 md:right-1 md:h-10",
                    isSidebarCollapsed && theme === "dark" && "md:translate-y-11 md:left-1 md:right-1",
                    isSidebarCollapsed && theme === "light" && "md:translate-y-0 md:left-1 md:right-1"
                  )}
                />
                
                <button
                  onClick={() => setTheme("light")}
                  className={cx(
                    "relative z-10 flex items-center justify-center transition-colors duration-300",
                    "h-10 w-1/2", // Base mobile (expanded)
                    isSidebarCollapsed && "md:h-11 md:w-full", // Desktop collapsed
                    theme === "light" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع النهاري"
                >
                  <div className="flex items-center gap-2 justify-center w-full">
                    <Sun size={18} className={cx("transition-transform duration-500 shrink-0", theme === "light" && "rotate-90 scale-110")} />
                    <span className={cx("text-xs font-bold font-sans w-8 text-right", isSidebarCollapsed && "md:hidden")}>فاتح</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setTheme("dark")}
                  className={cx(
                    "relative z-10 flex items-center justify-center transition-colors duration-300",
                    "h-10 w-1/2", // Base mobile (expanded)
                    isSidebarCollapsed && "md:h-11 md:w-full md:mt-1", // Desktop collapsed
                    theme === "dark" ? "text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                  title="الوضع الليلي"
                >
                  <div className="flex items-center gap-2 justify-center w-full">
                    <Moon size={18} className={cx("transition-transform duration-500 shrink-0", theme === "dark" && "-rotate-12 scale-110")} />
                    <span className={cx("text-xs font-bold font-sans w-8 text-right", isSidebarCollapsed && "md:hidden")}>داكن</span>
                  </div>
                </button>
              </div>
            )}

            {/* User Session Info & Logout */}
            {status === "authenticated" && session?.user?.email && (
              <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-2">
                <div className={cx("text-center truncate", isSidebarCollapsed ? "md:hidden" : "")}>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans truncate px-1" title={session.user.email}>
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border border-transparent py-2.5 px-3 transition-all",
                    "text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/25 hover:border-red-100 dark:hover:border-red-900/30",
                    isSidebarCollapsed && "md:justify-center md:px-0"
                  )}
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} className="shrink-0" />
                  <span className={cx("text-sm font-bold", isSidebarCollapsed && "md:hidden")}>
                    تسجيل الخروج
                  </span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 md:px-8 md:py-7 h-[calc(100dvh-64px)] md:h-screen overflow-y-auto custom-scrollbar relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
}
