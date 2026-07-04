"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ClipboardCheck,
  Gauge,
  Layers3,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cx } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

const navigation = [
  {
    href: "/dashboard",
    label: "لوحة التعلم",
    description: "التقدم والمهام",
    icon: LayoutDashboard,
  },
  {
    href: "/study/reader",
    label: "قارئ الكتاب",
    description: "جمل تفاعلية",
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
    description: "تدريب CMA",
    icon: ClipboardCheck,
  },
];

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 [direction:rtl]">
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
            "sticky top-0 h-screen border-l border-slate-200 bg-white py-6 shadow-sm transition-all duration-300 flex flex-col relative",
            isSidebarCollapsed ? "px-3 w-20" : "px-5 w-64"
          )}
        >
          {/* Collapse Toggle Button - floated on the left edge */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -left-3 top-7 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 focus:outline-none hover:bg-slate-50 transition-colors z-10"
            title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="mb-8">
            <div className={cx("flex items-center gap-3", isSidebarCollapsed && "justify-center")}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-amber-500 text-slate-950">
                <Gauge aria-hidden="true" size={23} />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    CMA Bel Arabi
                  </p>
                  <h1 className="text-lg font-semibold text-slate-950">
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
                    "flex items-center gap-3 rounded-md border py-3 transition-all",
                    isSidebarCollapsed ? "justify-center px-0" : "px-3",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                    isActive
                      ? "border-amber-300 bg-amber-50 text-slate-950"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" size={20} className="shrink-0" />
                  {!isSidebarCollapsed && (
                    <span>
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {item.description}
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {!isSidebarCollapsed ? (
            <div className="absolute bottom-6 left-5 right-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Settings aria-hidden="true" size={17} />
                إعدادات الجلسة
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                الواجهة عربية، والمحتوى التعليمي الإنجليزي يبقى باتجاه القراءة
                الأصلي.
              </p>
            </div>
          ) : (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="flex size-11 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-800 shadow-sm cursor-pointer hover:bg-slate-100">
                <Settings aria-hidden="true" size={19} />
              </div>
            </div>
          )}
        </aside>

        <div className="min-w-0 px-8 py-7">
          <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                منصة التعلم الذكية
              </p>
              <h2 className="mt-1 text-3xl font-semibold leading-normal tracking-normal text-slate-950">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              جلسة اليوم
              <span className="mx-2 font-mono text-slate-400">/</span>
              <span className="font-semibold text-slate-950">الجزء الأول</span>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
