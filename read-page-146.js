const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'public', 'cma-part-1-en.dat');
const data = new Uint8Array(fs.readFileSync(pdfPath));

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({
    data,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
  }).promise;
  
  const page = await doc.getPage(146);
  const textContent = await page.getTextContent();
  const text = textContent.items.map(item => item.str).join(' ');
  console.log('Page 146 text content:', text.slice(0, 1000));
}

main().catch(console.error);
