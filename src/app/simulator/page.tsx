import { AppShell } from "@/components/layout/AppShell";
import { SimulatorWorkspace } from "@/components/simulator/SimulatorWorkspace";
import { getLearningData } from "@/lib/content/data";

export default async function SimulatorPage() {
  const data = await getLearningData();

  return (
    <AppShell
      title="محاكي أسئلة CMA"
      subtitle="واجهة تدريب مكتبية للأسئلة متعددة الاختيارات مع مساعد مصطلحات متاح أثناء القراءة."
    >
      <SimulatorWorkspace
        mcqs={data.mcqs}
        terms={data.terms}
        source={data.source}
      />
    </AppShell>
  );
}
