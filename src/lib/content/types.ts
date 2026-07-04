export type Term = {
  id: string;
  term: string;
  translation: string;
  definition: string;
  context?: string;
  aliases: string[];
};

export type StudyUnit = {
  id: string;
  title: string;
  part: string;
  estimatedMinutes: number;
  summary: string;
  paragraphs: string[];
  keyTakeaways: string[];
};

export type McqOption = {
  id: string;
  text: string;
};

export type Mcq = {
  id: string;
  unitId: string;
  question: string;
  options: McqOption[];
  correctOptionId: string;
  explanation: string;
};

export type ReadingSentence = {
  id: string;
  text: string;
  translation: string;
  context: string;
  termIds?: string[];
};

export type ReadingPage = {
  id: string;
  pageNumber: number;
  title: string;
  sourceLabel: string;
  sentences: ReadingSentence[];
};

export type LearningData = {
  terms: Term[];
  studyUnits: StudyUnit[];
  mcqs: Mcq[];
  readingPages: ReadingPage[];
  source: ContentSource;
};

export type ContentSource = {
  type: "local" | "supabase";
  label: string;
  warning?: string;
};
