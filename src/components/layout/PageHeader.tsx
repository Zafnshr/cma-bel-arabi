import { BookOpenText, Layers3, ClipboardCheck, LayoutDashboard, Target } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
};

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm shrink-0">
            {icon}
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-500 font-sans">
            منصة التعلم الذكية
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-normal tracking-normal text-slate-950 dark:text-white" style={{ fontFamily: "var(--font-almarai)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
