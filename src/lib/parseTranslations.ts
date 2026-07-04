import fs from "fs";

export type ParsedTranslation = {
  english: string;
  arabic: string;
  keywords: string;
};

export function parseTranslations(filePath: string): ParsedTranslation[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8");
  const blocks = content.split(/---/);
  const results: ParsedTranslation[] = [];

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    let english = "";
    let arabic = "";
    let keywords = "";

    const enMatch = block.match(/\*\*English:\*\*\s*([\s\S]*?)(?=\*\*Arabic:\*\*|\*\*Keywords:\*\*|$)/i);
    if (enMatch) english = enMatch[1].trim();

    const arMatch = block.match(/\*\*Arabic:\*\*\s*([\s\S]*?)(?=\*\*English:\*\*|\*\*Keywords:\*\*|$)/i);
    if (arMatch) arabic = arMatch[1].trim();

    const kwMatch = block.match(/\*\*Keywords:\*\*\s*([\s\S]*?)(?=\*\*English:\*\*|\*\*Arabic:\*\*|$)/i);
    if (kwMatch) keywords = kwMatch[1].trim();

    if (english || arabic) {
      results.push({ english, arabic, keywords });
    }
  }

  return results;
}
