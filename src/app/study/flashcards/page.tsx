import { FlashcardsWorkspace } from "@/components/flashcards/FlashcardsWorkspace";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLearningData } from "@/lib/content/data";

export default async function FlashcardsPage() {
  const data = await getLearningData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="بطاقات المراجعة"
        subtitle="محرك تكرار متباعد مبسط لمراجعة مصطلحات CMA الإنجليزية ومعانيها العربية."
      />
      <FlashcardsWorkspace terms={data.terms} source={data.source} />
    </div>
  );
}
