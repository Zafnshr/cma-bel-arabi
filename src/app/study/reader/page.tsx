import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { BookOpen, ChevronRight, FileText } from "lucide-react";

const STUDY_UNITS = [
  { id: 1, title: "الوحدة 1: البيانات المالية الخارجية", eng: "SU 1: External Financial Statements" },
  { id: 2, title: "الوحدة 2: أدوات التخطيط وإعداد الموازنات", eng: "SU 2: Planning & Budgeting Tools" },
  { id: 3, title: "الوحدة 3: إعداد الموازنة التشغيلية", eng: "SU 3: Operational Budgeting" },
  { id: 4, title: "الوحدة 4: الموازنة الرأسمالية والتحليل", eng: "SU 4: Capital Budgeting & Analysis" },
  { id: 5, title: "الوحدة 5: إدارة التكاليف وقياس الأداء", eng: "SU 5: Cost Management & Performance" },
  { id: 6, title: "الوحدة 6: الرقابة الداخلية وإدارة المخاطر", eng: "SU 6: Internal Control & Risk" },
  { id: 7, title: "الوحدة 7: مفاهيم إدارة التكاليف", eng: "SU 7: Cost Management Concepts" },
  { id: 8, title: "الوحدة 8: المحاسبة الإدارية والتحليل", eng: "SU 8: Managerial Accounting" },
  { id: 9, title: "الوحدة 9: تخصيص التكاليف", eng: "SU 9: Cost Allocation" },
  { id: 10, title: "الوحدة 10: سلسلة التوريد والعمليات", eng: "SU 10: Supply Chain & Operations" },
  { id: 11, title: "الوحدة 11: إدارة المخاطر المؤسسية", eng: "SU 11: Enterprise Risk" },
  { id: 12, title: "الوحدة 12: حوكمة الشركات وأخلاقيات المهنة", eng: "SU 12: Corporate Governance & Ethics" },
  { id: 13, title: "الوحدة 13: قياس الأداء المالي", eng: "SU 13: Financial Performance Measurement" },
  { id: 14, title: "الوحدة 14: التنبؤ وإدارة الإيرادات", eng: "SU 14: Forecasting & Revenue" },
  { id: 15, title: "الوحدة 15: تحليل الانحرافات", eng: "SU 15: Variance Analysis" },
  { id: 16, title: "الوحدة 16: أدوات إدارة الجودة والتحسين", eng: "SU 16: Quality & Process Improvement" },
  { id: 17, title: "الوحدة 17: أنظمة الرقابة الداخلية", eng: "SU 17: Internal Control Systems" },
  { id: 18, title: "الوحدة 18: تدقيق نظم المعلومات والتقنيات", eng: "SU 18: IS Audit & Tech" },
  { id: 19, title: "الوحدة 19: أخلاقيات المحاسب الإداري", eng: "SU 19: CMA Professional Ethics" },
  { id: 20, title: "الوحدة 20: تحليل القوائم المالية", eng: "SU 20: Financial Statement Analysis" }
];

export default function ReaderPage() {
  return (
    <AppShell
      title="مكتبة مناهج CMA"
      subtitle="اختر الوحدة الدراسية لبدء القراءة التفاعلية المترجمة لحظياً."
    >
      <div className="max-w-6xl mx-auto py-8 px-4 [direction:rtl]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-5">
          <div className="flex size-12 items-center justify-center rounded-lg bg-amber-600 text-white shadow-md">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">الوحدات الدراسية (Study Units 1-20)</h2>
            <p className="text-slate-500 text-sm mt-1">اختر فصلاً لبدء الدراسة باستخدام عارض PDF الهجين والترجمة التفاعلية.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDY_UNITS.map((unit) => (
            <Link
              key={unit.id}
              href={`/study/reader/SU${unit.id}`}
              className="flex items-center justify-between p-5 bg-[#FDFBF7] rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-800 transition-colors">
                    {unit.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-mono tracking-wide [direction:ltr] text-right">
                    {unit.eng}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-[-4px]" size={20} />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
