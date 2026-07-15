import { PageHeader } from "@/components/layout/PageHeader";
import { SimulatorWorkspace } from "@/components/simulator/SimulatorWorkspace";
import { getLearningData } from "@/lib/content/data";

export default async function SimulatorPage() {
  const data = await getLearningData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="محاكي أسئلة CMA"
        subtitle="واجهة تدريب مكتبية للأسئلة متعددة الاختيارات مع مساعد مصطلحات متاح أثناء القراءة."
      />
      <SimulatorWorkspace
        mcqs={data.mcqs}
        terms={data.terms}
        source={data.source}
      />
    </div>
  );
}
