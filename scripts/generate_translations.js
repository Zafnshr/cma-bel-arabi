const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Helper to normalize whitespaces
function cleanText(str) {
  return str.replace(/\s+/g, ' ').trim();
}

// Basic sentence splitter
function splitIntoSentences(text) {
  // Regex to split by sentence boundaries (periods, question marks, exclamation marks followed by spaces)
  const rawSentences = text.split(/(?<=[.!?])\s+/);
  return rawSentences
    .map(cleanText)
    .filter(s => s.length > 15 && s.length < 300 && !/^\d+$/.test(s));
}

// Stub function for translation API
async function translateText(text) {
  // ==========================================
  // PLACEHOLDER: Connect your local translation
  // API here (e.g., Gemini API, DeepL, Google Translate).
  // ==========================================
  
  // Return a mock translated sentence for manual editing
  return `[ترجمة سياقية]: ${text}`;
}

async function run() {
  const chapterNum = 7; // Target chapter index
  const pdfPath = path.join(__dirname, '..', 'public', 'material', `SU${chapterNum}.dat`);
  const outputDir = path.join(__dirname, '..', 'data', 'translations');
  const outputPath = path.join(outputDir, `SU${chapterNum}_sentences.json`);

  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found at ${pdfPath}. Please make sure setup_material.js was run.`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Parsing PDF file: ${pdfPath}`);
  const dataBuffer = fs.readFileSync(pdfPath);
  const uint8Data = new Uint8Array(dataBuffer);
  
  try {
    const parser = new PDFParse(uint8Data);
    const data = await parser.getText();
    console.log(`Extracted raw text. Length: ${data.text.length}`);

    const sentences = splitIntoSentences(data.text);
    console.log(`Split into ${sentences.length} sentences.`);

    // Take top 40 sentences for study mapping (to prevent bloated JSON and excessive mock API tokens)
    const targetSentences = sentences.slice(0, 45);

    const jsonPayload = [];
    for (let i = 0; i < targetSentences.length; i++) {
      const enText = targetSentences[i];
      const arTranslation = await translateText(enText);

      // Extract basic potential key terms (e.g., Capitalized Words / double-quotes)
      const keywordRegex = /[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g;
      const rawKeywords = enText.match(keywordRegex) || [];
      const keywords = [...new Set(rawKeywords)].filter(kw => kw.length > 5);

      jsonPayload.push({
        id: `su${chapterNum}_${i + 1}`,
        english: enText,
        arabic: arTranslation,
        keywords: keywords.slice(0, 3)
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(jsonPayload, null, 2), 'utf8');
    console.log(`Static sentence translation database generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Error parsing PDF:', error);
  }
}

run();
