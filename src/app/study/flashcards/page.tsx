import { FlashcardsWorkspace } from "@/components/flashcards/FlashcardsWorkspace";
import { AppShell } from "@/components/layout/AppShell";
import { getLearningData } from "@/lib/content/data";

export default async function FlashcardsPage() {
  const data = await getLearningData();

  return (
    <AppShell
      title="بطاقات المراجعة"
      subtitle="محرك تكرار متباعد مبسط لمراجعة مصطلحات CMA الإنجليزية ومعانيها العربية."
    >
      <FlashcardsWorkspace terms={data.terms} source={data.source} />
    </AppShell>
  );
}
