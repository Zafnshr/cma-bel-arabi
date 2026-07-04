const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Load environment variable for Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not set. The LLM translation part will fail. Please set it before running.');
}

// Input and Output paths
const PDF_PATH = path.join(__dirname, '..', 'public', 'cma-part-1-en.dat');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'reading-pages-structured.json');

async function extractPageText(pdfBuffer) {
  console.log('Parsing PDF file...');
  const options = {
    // We can extract pages one by one or all at once.
    // pdf-parse extracts all by default. We'll get text chunks separated by page markers.
  };
  const data = await pdfParse(pdfBuffer, options);
  console.log('PDF parsed successfully! Total pages:', data.numpages);
  return data.text;
}

// Split the extracted text by page numbers (approximate estimation based on Gleim headers)
function splitTextByPages(text) {
  // Gleim publications usually print "SU 1: External Financial Statements   X" or "X   SU 1: ..."
  // Let's split by the Gleim page headers
  const pages = [];
  const lines = text.split('\n');
  let currentPageText = [];
  let currentPageNum = 1;

  for (const line of lines) {
    currentPageText.push(line);
    // Detect page transition (e.g., "Copyright © 2024 Gleim Publications" or similar page markers)
    if (line.includes('Copyright © 2024 Gleim Publications') || line.includes('Study Unit')) {
      pages.push({
        pageNumber: currentPageNum++,
        text: currentPageText.join('\n')
      });
      currentPageText = [];
    }
  }
  
  if (currentPageText.length > 0) {
    pages.push({
      pageNumber: currentPageNum,
      text: currentPageText.join('\n')
    });
  }

  return pages;
}

async function translateAndStructurePage(pageNumber, rawText) {
  if (!GEMINI_API_KEY) {
    return {
      page_number: pageNumber,
      content: [
        {
          sentence_id: `p${pageNumber}_s1`,
          english_text: rawText.slice(0, 200) + '...',
          arabic_text: 'يرجى توفير GEMINI_API_KEY للترجمة',
          keywords: []
        }
      ]
    };
  }

  // Using the standard fetch to Gemini API to avoid dependency issues with @google/genai version mismatches
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemInstruction = `You are an expert bilingual financial translator specializing in US CMA (Certified Management Accountant) materials.
Your task is to take raw, extracted text from a page of the Gleim CMA Part 1 textbook, clean it up, and structure it into a JSON format.

Ignore headers, copyright notices, and page footers. Focus strictly on the core educational content.
Break the page text down into its core logical sentences. For each sentence:
1. Provide the clean English text.
2. Translate it into professional, clear Arabic, preserving semantic context.
3. Extract key technical accounting terms (keywords) from that sentence, providing both their English and Arabic equivalents.

You MUST respond strictly with a JSON object following this Schema:
{
  "page_number": ${pageNumber},
  "content": [
    {
      "sentence_id": "p${pageNumber}_s1",
      "english_text": "...",
      "arabic_text": "...",
      "keywords": [
        { "en": "...", "ar": "..." }
      ]
    }
  ]
}`;

  console.log(`Processing page ${pageNumber} with Gemini...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Raw Page Text:\n${rawText}` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    const result = await response.json();
    const jsonText = result.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
  } catch (err) {
    console.error(`Failed to process page ${pageNumber}:`, err.message);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Error: PDF file not found at ${PDF_PATH}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const rawText = await extractPageText(pdfBuffer);
  
  console.log('Splitting text into logical pages...');
  const pages = splitTextByPages(rawText);
  console.log(`Split completed. Processing the first 3 logical pages for demonstration...`);

  const structuredPages = [];
  // Process the first 3 pages as requested to match the current JSON limits
  for (let i = 0; i < Math.min(pages.length, 3); i++) {
    const page = pages[i];
    const structured = await translateAndStructurePage(page.pageNumber, page.text);
    if (structured) {
      structuredPages.push(structured);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(structuredPages, null, 2), 'utf8');
  console.log(`ETL Pipeline completed successfully! Output saved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
