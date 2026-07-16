import Link from "next/link";
import {
  ArrowLeft,
  BookOpenText,
  CalendarCheck,
  ClipboardCheck,
  Layers3,
  Target,
  TrendingUp,
  Flame,
  LayoutDashboard
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { IslamicWidget } from "@/components/dashboard/IslamicWidget";
import { getLearningData } from "@/lib/content/data";

export default async function DashboardPage() {
  const data = await getLearningData();
  
  // Real count of translated sentences by parsing all markdown files
  const fs = require('fs');
  const path = require('path');
  const transDir = path.join(process.cwd(), 'src/data/translations');
  let totalSentences = 0;
  try {
    const files = fs.readdirSync(transDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(transDir, file), 'utf8');
        // Count instances of "---" which separate the translation blocks
        const count = (content.match(/---/g) || []).length;
        totalSentences += count > 0 ? count - 1 : 0; // Rough sentence block estimation
      }
    }
  } catch (e) {
    totalSentences = 873; // Fallback
  }

  const dailyTasks = [
    {
      title: "اقرأ صفحة تفاعلية",
      detail: "مرر على الجمل الصعبة وافتح الترجمة السياقية.",
      href: "/study/reader",
      icon: BookOpenText,
    },
    {
      title: "راجع 12 بطاقة",
      detail: "ابدأ بالمصطلحات التي ظهرت في قراءتك الأخيرة.",
      href: "/study/flashcards",
      icon: Layers3,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة التعلم"
        subtitle="نظرة تشغيلية على تقدمك اليومي داخل منصة CMA Bel Arabi."
        icon={<LayoutDashboard size={28} />}
      />
      <div className="grid gap-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="بطاقات تم إتقانها"
            value="0"
            icon={Target}
            tone="amber"
          />
          <MetricCard
            label="ساعات الدراسة"
            value="0"
            icon={BookOpenText}
            tone="slate"
          />
          <MetricCard
            label="أيام متتالية (Streak)"
            value="0"
            icon={Flame}
            tone="emerald"
          />
          <MetricCard
            label="نسبة الإنجاز"
            value="0%"
            icon={Layers3}
            tone="indigo"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-500 font-sans">
                  خطة اليوم
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  مهام قصيرة قابلة للتنفيذ
                </h2>
              </div>
              <CalendarCheck className="text-slate-400" size={28} />
            </div>

            <div className="grid gap-4 flex-1">
              {dailyTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <Link
                    key={task.href}
                    href={task.href}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-5 transition-colors hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/80 dark:hover:bg-amber-900/40 h-full"
                  >
                    <span className="flex items-center gap-4">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm transition-transform group-hover:scale-105">
                        <Icon aria-hidden="true" size={20} />
                      </span>
                      <span>
                        <span className="block text-lg font-bold text-slate-950 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                          {task.detail}
                        </span>
                      </span>
                    </span>
                    <ArrowLeft
                      className="text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-amber-600"
                      size={20}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <IslamicWidget />
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  tone: "amber" | "slate" | "emerald" | "indigo";
}) {
  const tones = {
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-800/50",
    slate: "bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700/50",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50",
    indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div
        className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${tones[tone]}`}
      >
        <Icon aria-hidden="true" size={22} />
      </div>
      <p className="text-3xl font-bold text-slate-950 dark:text-white" style={{ fontFamily: "var(--font-cairo)" }}>{value}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
