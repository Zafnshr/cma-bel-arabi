import { readFileSync } from "node:fs";
import path from "node:path";
import { getSupabaseLearningData } from "./supabase";
import { getTerms } from "./terms";
import type { LearningData, Mcq, ReadingPage, StudyUnit } from "./types";

export async function getLearningData(): Promise<LearningData> {
  const supabaseResult = await getSupabaseLearningData();
  const readingPages = readJsonFile<ReadingPage[]>("reading-pages.json");

  if (supabaseResult.status === "ok") {
    return {
      ...supabaseResult.data,
      readingPages,
      source: {
        type: "supabase",
        label: "Supabase",
      },
    };
  }

  const localData = getLocalLearningData();

  if (supabaseResult.status === "error") {
    return {
      ...localData,
      source: {
        ...localData.source,
        warning: "تعذر الاتصال بـ Supabase، لذلك تم تشغيل ملفات المحتوى المحلية.",
      },
    };
  }

  return localData;
}

function getLocalLearningData(): LearningData {
  return {
    terms: getTerms(),
    studyUnits: readJsonFile<StudyUnit[]>("study-units.json"),
    mcqs: readJsonFile<Mcq[]>("mcqs.json"),
    readingPages: readJsonFile<ReadingPage[]>("reading-pages.json"),
    source: {
      type: "local",
      label: "ملفات المحتوى المحلية",
    },
  };
}

function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), "data", fileName);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}
