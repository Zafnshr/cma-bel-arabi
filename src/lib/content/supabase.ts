import type { LearningData, Mcq, McqOption, StudyUnit, Term } from "./types";

type RemoteLearningData = Pick<LearningData, "terms" | "studyUnits" | "mcqs">;

type SupabaseContentResult =
  | { status: "not-configured" }
  | { status: "ok"; data: RemoteLearningData }
  | { status: "error"; message: string };

type SupabaseSettings = {
  restUrl: string;
  anonKey: string;
};

type SupabaseTermRow = {
  id?: unknown;
  term?: unknown;
  translation?: unknown;
  definition?: unknown;
  context?: unknown;
  aliases?: unknown;
};

type SupabaseStudyUnitRow = {
  id?: unknown;
  title?: unknown;
  part?: unknown;
  estimated_minutes?: unknown;
  estimatedMinutes?: unknown;
  summary?: unknown;
  paragraphs?: unknown;
  key_takeaways?: unknown;
  keyTakeaways?: unknown;
};

type SupabaseMcqRow = {
  id?: unknown;
  unit_id?: unknown;
  unitId?: unknown;
  question?: unknown;
  options?: unknown;
  correct_option_id?: unknown;
  correctOptionId?: unknown;
  explanation?: unknown;
};

export async function getSupabaseLearningData(): Promise<SupabaseContentResult> {
  const settings = getSupabaseSettings();

  if (!settings) {
    return { status: "not-configured" };
  }

  try {
    const [termRows, studyUnitRows, mcqRows] = await Promise.all([
      fetchTable<SupabaseTermRow>("terms", settings),
      fetchTable<SupabaseStudyUnitRow>("study_units", settings),
      fetchTable<SupabaseMcqRow>("mcqs", settings),
    ]);

    return {
      status: "ok",
      data: {
        terms: termRows.map(mapTermRow),
        studyUnits: studyUnitRows.map(mapStudyUnitRow),
        mcqs: mcqRows.map(mapMcqRow),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Supabase content could not be loaded.",
    };
  }
}

function getSupabaseSettings(): SupabaseSettings | null {
  const sourcePreference = process.env.CONTENT_SOURCE?.trim().toLowerCase();

  if (sourcePreference === "local") {
    return null;
  }

  const restUrl = getSupabaseRestUrl();
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!restUrl || !anonKey) {
    return null;
  }

  return {
    restUrl,
    anonKey,
  };
}

function getSupabaseRestUrl() {
  const explicitRestUrl = process.env.SUPABASE_REST_URL;

  if (explicitRestUrl) {
    return normalizeRestUrl(explicitRestUrl);
  }

  const projectUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!projectUrl) {
    return null;
  }

  return `${projectUrl.replace(/\/+$/, "")}/rest/v1`;
}

async function fetchTable<T>(
  tableName: string,
  settings: SupabaseSettings,
): Promise<T[]> {
  const response = await fetch(
    `${settings.restUrl}/${tableName}?select=*`,
    {
      headers: {
        apikey: settings.anonKey,
        authorization: `Bearer ${settings.anonKey}`,
      },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase ${tableName} request failed (${response.status}).`);
  }

  const data = (await response.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error(`Supabase ${tableName} response was not an array.`);
  }

  return data as T[];
}

function mapTermRow(row: SupabaseTermRow): Term {
  const term = asString(row.term);

  return {
    id: asString(row.id) || slugify(term),
    term,
    translation: asString(row.translation),
    definition: asString(row.definition),
    context: asOptionalString(row.context),
    aliases: mergeAliases(term, asStringArray(row.aliases)),
  };
}

function mapStudyUnitRow(row: SupabaseStudyUnitRow): StudyUnit {
  return {
    id: asString(row.id),
    title: asString(row.title),
    part: asString(row.part),
    estimatedMinutes: asNumber(row.estimated_minutes ?? row.estimatedMinutes),
    summary: asString(row.summary),
    paragraphs: asStringArray(row.paragraphs),
    keyTakeaways: asStringArray(row.key_takeaways ?? row.keyTakeaways),
  };
}

function mapMcqRow(row: SupabaseMcqRow): Mcq {
  return {
    id: asString(row.id),
    unitId: asString(row.unit_id ?? row.unitId),
    question: asString(row.question),
    options: asMcqOptions(row.options),
    correctOptionId: asString(row.correct_option_id ?? row.correctOptionId),
    explanation: asString(row.explanation),
  };
}

function asMcqOptions(value: unknown): McqOption[] {
  const parsed = parseJsonString(value);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((option) => {
      if (!option || typeof option !== "object") {
        return null;
      }

      const candidate = option as Record<string, unknown>;

      return {
        id: asString(candidate.id),
        text: asString(candidate.text),
      };
    })
    .filter((option): option is McqOption => Boolean(option?.id && option.text));
}

function asStringArray(value: unknown): string[] {
  const parsed = parseJsonString(value);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => asString(item))
      .filter((item) => item.length > 0);
  }

  if (typeof parsed === "string") {
    return parsed
      .split(/\r?\n/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseJsonString(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown) {
  const text = asString(value);
  return text || undefined;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
}

function mergeAliases(term: string, aliases: string[]) {
  const uniqueAliases = new Set([term, ...aliases].filter(Boolean));
  return [...uniqueAliases];
}

function normalizeRestUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "term"
  );
}
