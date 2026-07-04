import { existsSync } from "node:fs";
import path from "node:path";
import { AppShell } from "@/components/layout/AppShell";
import { PdfReadingWorkspaceClient } from "@/components/reader/PdfReadingWorkspaceClient";
import { getLearningData } from "@/lib/content/data";
import { parseTranslations, type ParsedTranslation } from "@/lib/parseTranslations";

type PageProps = {
  params: Promise<{ chapterId: string }>;
};

export default async function ChapterPage({ params }: PageProps) {
  const { chapterId } = await params;
  const data = await getLearningData();

  // Load the structured JSON page content natively
  let structuredPages = [];
  try {
    const structuredPath = path.join(process.cwd(), "data", "reading-pages-structured.json");
    if (existsSync(structuredPath)) {
      structuredPages = JSON.parse(require("fs").readFileSync(structuredPath, "utf8"));
    }
  } catch (err) {
    console.error("Failed to load structured pages:", err);
  }

  // Load and parse the Markdown translation database for this chapter
  let chapterSentences: ParsedTranslation[] = [];
  try {
    const sentencesPath = path.join(
      process.cwd(),
      "src",
      "data",
      "translations",
      `${chapterId}.md`
    );
    if (existsSync(sentencesPath)) {
      chapterSentences = parseTranslations(sentencesPath);
      console.log(`Loaded ${chapterSentences.length} sentences for ${chapterId}`);
    } else {
      console.warn(`Translation file not found: ${sentencesPath}`);
    }
  } catch (err) {
    console.error(`Failed to load static sentences for ${chapterId}:`, err);
  }

  return (
    <AppShell
      title={`دراسة الوحدة: ${chapterId}`}
      subtitle="عارض PDF الهجين الذكي مع الترجمة السياقية."
    >
      <div className="max-w-[1600px] mx-auto py-6 px-4">
        <PdfReadingWorkspaceClient
          pages={data.readingPages}
          terms={data.terms}
          source={data.source}
          structuredPages={structuredPages}
          chapterId={chapterId}
          chapterSentences={chapterSentences}
        />
      </div>
    </AppShell>
  );
}
