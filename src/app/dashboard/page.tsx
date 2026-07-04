import Link from "next/link";
import {
  ArrowLeft,
  BookOpenText,
  CalendarCheck,
  ClipboardCheck,
  Layers3,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getLearningData } from "@/lib/content/data";

export default async function DashboardPage() {
  const data = await getLearningData();
  const totalSentences = data.readingPages.reduce(
    (total, page) => total + page.sentences.length,
    0,
  );
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
    {
      title: "حل اختبار قصير",
      detail: "أجب على أسئلة الوحدة مع مساعد المصطلحات.",
      href: "/simulator",
      icon: ClipboardCheck,
    },
  ];

  return (
    <AppShell
      title="لوحة التعلم"
      subtitle="نظرة تشغيلية على تقدمك اليومي داخل منصة CMA Bel Arabi."
    >
      <div className="grid gap-6">
        <section className="grid grid-cols-4 gap-4">
          <MetricCard
            label="مصطلح جاهز"
            value={data.terms.length.toLocaleString("ar-EG")}
            icon={Target}
            tone="teal"
          />
          <MetricCard
            label="جملة مترجمة"
            value={totalSentences.toLocaleString("ar-EG")}
            icon={BookOpenText}
            tone="slate"
          />
          <MetricCard
            label="سؤال تدريب"
            value={data.mcqs.length.toLocaleString("ar-EG")}
            icon={ClipboardCheck}
            tone="amber"
          />
          <MetricCard
            label="وحدة دراسة"
            value={data.studyUnits.length.toLocaleString("ar-EG")}
            icon={TrendingUp}
            tone="emerald"
          />
        </section>

        <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  خطة اليوم
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  مهام قصيرة قابلة للتنفيذ
                </h2>
              </div>
              <CalendarCheck className="text-slate-400" size={28} />
            </div>

            <div className="grid gap-3">
              {dailyTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <Link
                    key={task.href}
                    href={task.href}
                    className="group flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-md bg-white text-slate-800 shadow-sm">
                        <Icon aria-hidden="true" size={20} />
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-slate-950">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-600">
                          {task.detail}
                        </span>
                      </span>
                    </span>
                    <ArrowLeft
                      className="text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-teal-700"
                      size={20}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              الوحدات
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              مسار Part 1
            </h2>
            <div className="mt-5 grid gap-3">
              {data.studyUnits.map((unit, index) => (
                <div
                  key={unit.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="ltr-content font-semibold text-slate-950">
                      {unit.title}
                    </p>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="ltr-content mt-2 text-sm leading-6 text-slate-600">
                    {unit.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
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
  tone: "teal" | "slate" | "amber" | "emerald";
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-800 border-teal-100",
    slate: "bg-slate-50 text-slate-800 border-slate-200",
    amber: "bg-amber-50 text-amber-900 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-5 flex size-11 items-center justify-center rounded-md border ${tones[tone]}`}
      >
        <Icon aria-hidden="true" size={21} />
      </div>
      <p className="text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}
